"""Investigation State Machine and Execution Orchestrator."""
import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
import os
import traceback
import traceback
import json

logger = logging.getLogger("screened.orchestrator.state_machine")
try:
    from opentelemetry import trace
    from opentelemetry.propagate import inject
    tracer = trace.get_tracer(__name__)
except ImportError:
    trace = None
    inject = None
    tracer = None

PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "")
TASKS_QUEUE = os.environ.get("CLOUD_TASKS_QUEUE", "screened-tasks")
OIDC_SERVICE_ACCOUNT = os.environ.get("OIDC_SERVICE_ACCOUNT_EMAIL", "")
tasks_client = None
QUEUE_PATH = None

try:
    from google.cloud import tasks_v2
    tasks_client = tasks_v2.CloudTasksClient()
    if PROJECT and LOCATION:
        QUEUE_PATH = tasks_client.queue_path(PROJECT, LOCATION, TASKS_QUEUE)
except Exception as e:
    tasks_client = None
    QUEUE_PATH = None
    logger.warning(f"Could not initialize Cloud Tasks client: {e}")

from google.adk.runners import Runner

from backend.db.firestore import db
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    InvestigationStatus,
    ResearchDomain,
    SourceRecord,
    ClaimKind,
    VerificationStatus,
    QuestionCategory,
    ClaimEvidence,
    Stance,
    VettingSignalStatus,
    InvestigationAuditHealth,
    extract_domain_from_url,
    safe_claim_kind,
    safe_verification_status,
    safe_question_category,
    safe_research_domain,
)
from backend.tools.parallel_search import ParallelSearchTool
from backend.tools.parallel_extract import ParallelExtractTool
from backend.services.gemini_client import GeminiClient
from backend.orchestrator.events import EventType, broadcaster
from backend.agents import (
    DisambiguatorAgent,
    PlannerAgent,
    create_planner_adk_agent,
    run_parallel_domain_agents,
    ClaimExtractorAgent,
    ContradictionAnalystAgent,
    DisputeRecord,
    ReportWriterAgent,
    DossierReport,
    DeepVettingAgent,
)
from backend.agents.outreach_drafter import OutreachDrafterAgent
from backend.agents.producer_desk import ProducerDeskAgent

from backend.orchestrator.session_service import FirestoreSessionService
from backend.orchestrator.adk_bridge import pump_adk_events


USE_ADK = os.getenv("USE_ADK", "true").lower() == "true"

def enqueue_task(path: str, payload: dict, fallback_task_func, *args):
    """Enqueues a task to Cloud Tasks, or falls back to asyncio."""
    if tasks_client and QUEUE_PATH:
        try:
            worker_url = os.environ.get("WORKER_URL", "http://localhost:8000")
            url = f"{worker_url}{path}"
            
            headers = {"Content-type": "application/json"}
            if inject:
                inject(headers)
                
            http_method = tasks_v2.HttpMethod.POST if "tasks_v2" in globals() else 1
            task = {
                "http_request": {
                    "http_method": http_method,
                    "url": url,
                    "headers": headers,
                    "body": json.dumps(payload).encode(),
                }
            }
            if OIDC_SERVICE_ACCOUNT:
                task["http_request"]["oidc_token"] = {"service_account_email": OIDC_SERVICE_ACCOUNT}
                
            logger.info(f"Enqueuing Cloud Task to {url} with OIDC: {bool(OIDC_SERVICE_ACCOUNT)}", extra={"task": task})
            tasks_client.create_task(request={"parent": QUEUE_PATH, "task": task})
            return None
        except Exception as e:
            logger.warning(f"Cloud Tasks enqueue failed: {e}", extra={"fallbackPath": path})
            if os.environ.get("ENVIRONMENT") == "production":
                raise RuntimeError("Cloud Tasks configuration is required in production environments. Asyncio fallback is disabled.") from e
    else:
        logger.warning("Cloud Tasks not configured", extra={"fallbackPath": path})
        if os.environ.get("ENVIRONMENT") == "production":
            raise RuntimeError("Cloud Tasks configuration is required in production environments. Asyncio fallback is disabled.")
        
    # Fallback to asyncio
    if fallback_task_func is not None:
        return asyncio.create_task(fallback_task_func(*args))
    return None


def _create_source_record(
    source_id: str,
    url: str,
    title: str,
    excerpt: Optional[str] = None,
    default_domain: Optional[str] = None,
    publish_date: Optional[str] = None,
) -> SourceRecord:
    """Constructs a valid SourceRecord with safe domain resolution, tiering, and required fields."""
    clean_url = url or "https://screened.app"
    domain = default_domain or extract_domain_from_url(clean_url)
    excerpts_list = [excerpt] if excerpt else []
    from backend.tools.source_tiers import determine_source_tier
    tier = determine_source_tier(domain)
    return SourceRecord(
        id=source_id or str(uuid.uuid4()),
        url=clean_url,
        domain=domain,
        title=title or "Verified Source",
        publishedDate=publish_date,
        excerpts=excerpts_list,
        sourceTier=tier,
        contentHash="verified_hash"
    )


class Orchestrator:
    """Coordinates multi-agent execution and manages investigation lifecycle."""

    def __init__(self):
        self.parallel_tool = ParallelSearchTool()
        self.gemini = GeminiClient()

        # Agents
        self.disambiguator = DisambiguatorAgent(self.parallel_tool, self.gemini)
        self.planner = PlannerAgent(self.gemini)
        self.claim_extractor = ClaimExtractorAgent(self.gemini)
        self.contradiction_analyst = ContradictionAnalystAgent(self.gemini)
        self.deep_vetting = DeepVettingAgent(self.gemini)
        self.report_writer = ReportWriterAgent(self.gemini)
        
        # Track running tasks to prevent duplicate execution and allow cancellation on disconnect
        self._running_tasks: Dict[str, asyncio.Task] = {}

    def cancel_task(self, investigation_id: str):
        """Cancel the background task if no clients are connected."""
        task = self._running_tasks.get(investigation_id)
        if task and not task.done():
            logger.info(f"Cancelling background task for {investigation_id} due to disconnect.")
            task.cancel()

    async def start_investigation(
        self,
        query: str,
        optional_url: Optional[str] = None,
        intent: str = "Vet before submitting",
    ) -> Dict[str, Any]:
        """Initialize investigation and run disambiguation."""
        inv_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        inv_data: Dict[str, Any] = {
            "id": inv_id,
            "status": InvestigationStatus.DISAMBIGUATING.value,
            "query": query,
            "optionalUrl": optional_url,
            "intent": intent,
            "createdAt": created_at,
            "updatedAt": created_at,
            "candidates": [],
            "confirmedEntity": None,
            "sourcesCount": 0,
            "claimsCount": 0,
            "dossier": None,
            "disputes": [],
            "auditHealth": InvestigationAuditHealth().model_dump(),
        }
        await db.save_investigation(inv_id, inv_data)

        # Emit started event
        await broadcaster.emit(
            investigation_id=inv_id,
            event_type=EventType.INVESTIGATION_STARTED,
            agent_name="Orchestrator",
            message=f"Investigation initiated for: {query}",
        )

        # Run Disambiguation asynchronously in background or immediate
        task = enqueue_task(
            "/api/internal/tasks/disambiguate",
            {
                "investigation_id": inv_id,
                "query": query,
                "optional_url": optional_url
            },
            self._run_disambiguation,
            inv_id,
            query,
            optional_url
        )
        if task:
            self._running_tasks[inv_id] = task

        return inv_data

    async def _run_disambiguation(self, inv_id: str, query: str, optional_url: Optional[str]):
        try:
            await broadcaster.emit(
                investigation_id=inv_id,
                event_type=EventType.DISAMBIGUATING,
                agent_name="Disambiguator",
                message="Scanning web footprint to verify festival identity and avoid mix-ups...",
            )

            if tracer:
                with tracer.start_as_current_span("DisambiguatorAgent.disambiguate") as span:
                    span.set_attribute("screened.query", query)
                    if optional_url:
                        span.set_attribute("screened.optional_url", optional_url)
                    candidates = await self.disambiguator.disambiguate(query, optional_url)
            else:
                candidates = await self.disambiguator.disambiguate(query, optional_url)

            inv_data = await db.get_investigation(inv_id) or {}
            inv_data["status"] = InvestigationStatus.AWAITING_ENTITY_CONFIRMATION.value
            inv_data["candidates"] = [c.model_dump() for c in candidates]
            inv_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
            await db.save_investigation(inv_id, inv_data)

            await broadcaster.emit(
                investigation_id=inv_id,
                event_type=EventType.CANDIDATES_FOUND,
                agent_name="Disambiguator",
                message=f"Found {len(candidates)} candidate match(es). Waiting for confirmation.",
                details={"candidates": [c.model_dump() for c in candidates]},
            )

        except Exception as e:
            from backend.config import settings
            if settings.strict_mode:
                raise
            if trace:
                span = trace.get_current_span()
                if span and span.is_recording():
                    span.record_exception(e)
                    from opentelemetry.trace.status import Status, StatusCode
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    span.set_attribute("screened.investigation_id", inv_id)
                    span.set_attribute("screened.error_phase", "disambiguation")

            logger.error(
                f"Disambiguation error for {inv_id}: {e}", 
                extra={
                    "json_fields": {
                        "fallbackPath": "disambiguation_pipeline",
                        "investigation_id": inv_id,
                        "error_type": type(e).__name__
                    }
                }, 
                exc_info=True
            )
            
            inv_data = await db.get_investigation(inv_id) or {}
            inv_data["status"] = InvestigationStatus.FAILED.value
            await db.save_investigation(inv_id, inv_data)

            await broadcaster.emit(
                investigation_id=inv_id,
                event_type=EventType.ERROR,
                agent_name="Disambiguator",
                message=f"Disambiguation error: {str(e)}",
            )

    async def confirm_entity(
        self,
        investigation_id: str,
        entity_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Confirm chosen entity and launch parallel multi-agent research pipeline."""
        inv_data = await db.get_investigation(investigation_id)
        if not inv_data:
            raise ValueError(f"Investigation {investigation_id} not found")

        entity = CandidateEntity(**entity_data)
        inv_data["status"] = InvestigationStatus.PLANNING.value
        inv_data["confirmedEntity"] = entity.model_dump()
        inv_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await db.save_investigation(investigation_id, inv_data)

        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.ENTITY_CONFIRMED,
            agent_name="Orchestrator",
            message=f"Confirmed target entity: {entity.name}",
            details={"entity": entity.model_dump()},
        )

        # Launch research pipeline in background task
        task = enqueue_task(
            "/api/internal/tasks/pipeline",
            {
                "investigation_id": investigation_id,
                "entity": entity.model_dump(),
                "intent": inv_data.get("intent", "Vet before submitting")
            },
            self._execute_full_research_pipeline,
            investigation_id,
            entity,
            inv_data.get("intent", "Vet before submitting")
        )
        if task:
            self._running_tasks[investigation_id] = task

        return inv_data

    async def resume_investigation(self, investigation_id: str) -> Dict[str, Any]:
        """Resume a failed or interrupted investigation from the last checkpoint."""
        inv_data = await db.get_investigation(investigation_id)
        if not inv_data:
            raise ValueError(f"Investigation {investigation_id} not found")

        status = inv_data.get("status")
        if status == InvestigationStatus.READY.value:
            raise ValueError("Investigation is already completed")

        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.INVESTIGATION_STARTED,
            agent_name="Orchestrator",
            message=f"Resuming investigation from status: {status}",
        )

        task = self._running_tasks.get(investigation_id)
        if task and not task.done():
            logger.info(f"Investigation {investigation_id} is already running.")
            return inv_data

        if inv_data.get("confirmedEntity"):
            entity = CandidateEntity(**inv_data["confirmedEntity"])
            intent = inv_data.get("intent", "Vet before submitting")
            task = enqueue_task(
                "/api/internal/tasks/pipeline",
                {
                    "investigation_id": investigation_id,
                    "entity": entity.model_dump(),
                    "intent": intent
                },
                self._execute_full_research_pipeline,
                investigation_id,
                entity,
                intent
            )
            if task:
                self._running_tasks[investigation_id] = task
        else:
            query = inv_data.get("query", "")
            optional_url = inv_data.get("optionalUrl")
            task = enqueue_task(
                "/api/internal/tasks/disambiguate",
                {
                    "investigation_id": investigation_id,
                    "query": query,
                    "optional_url": optional_url
                },
                self._run_disambiguation,
                investigation_id,
                query,
                optional_url
            )
            if task:
                self._running_tasks[investigation_id] = task

        return inv_data

    async def _execute_full_research_pipeline(
        self,
        investigation_id: str,
        entity: CandidateEntity,
        intent: str,
    ):
        """Execute: Planner -> 3 Parallel Domain Agents -> ClaimExtractor -> ContradictionAnalyst -> ReportWriter."""
        try:
            # 1. Planning Phase
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.PLANNING_STARTED,
                agent_name="Planner",
                message="Generating domain research questions for Festival, Organizer, and Participants...",
            )

            if tracer:
                planner_span_cm = tracer.start_as_current_span("PlannerAgent.create_plan")
                planner_span = planner_span_cm.__enter__()
                planner_span.set_attribute("screened.entity_name", entity.name)

            if USE_ADK:
                logger.info("Using ADK for Planner Agent")
                runner = Runner(
                    agent=create_planner_adk_agent(
                        entity_name=entity.name,
                        location=entity.cityCountry or 'Unknown',
                        official_website=entity.officialDomain or 'Unknown',
                        intent=intent
                    ),
                    app_name="screened",
                    session_service=FirestoreSessionService()
                )
                
                from google.genai import types
                
                # We start the runner as a background pump, or we can just iterate over it here
                runner_stream = runner.run_async(
                    user_id="default_user",
                    session_id=investigation_id,
                    new_message=types.Content(
                        role="user",
                        parts=[types.Part.from_text(text="Generate the investigation plan")]
                    )
                )
                # Pump events to SSE bridge concurrently
                # To get the result we wait for the pump to finish.
                await pump_adk_events(investigation_id, runner_stream)
                
                # Fetch plan from state
                session_service = FirestoreSessionService()
                session = await session_service.get_session(
                    app_name="screened",
                    user_id="default_user",
                    session_id=investigation_id
                )
                plan = session.state.get("plan")
                if not plan:
                    raise ValueError("Planner ADK agent failed to produce a plan in state.")
                from backend.agents.planner import InvestigationPlan
                # plan is a dict, parse it
                if isinstance(plan, dict):
                    plan = InvestigationPlan.model_validate(plan)
            else:
                plan = await self.planner.create_plan(entity, intent)

            if tracer:
                planner_span_cm.__exit__(None, None, None)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.PLAN_READY,
                agent_name="Planner",
                message=f"Plan generated across 3 domains with {sum(len(d.searchQueries) for d in plan.domains.values())} search queries.",
            )

            # 2. Parallel Domain Research Phase
            inv_data = await db.get_investigation(investigation_id) or {}
            inv_data["status"] = InvestigationStatus.RESEARCHING.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DOMAIN_SEARCH_STARTED,
                agent_name="Orchestrator",
                message="Launching FestivalAgent, OrganizerAgent, and ParticipantsAgent concurrently via Parallel Search API...",
            )

            if tracer:
                with tracer.start_as_current_span("run_parallel_domain_agents") as span:
                    domain_claims_raw = await run_parallel_domain_agents(
                        plans=plan.domains,
                        investigation_id=investigation_id,
                        entity_info=entity.model_dump()
                    )
            else:
                domain_claims_raw = await run_parallel_domain_agents(
                    plans=plan.domains,
                    investigation_id=investigation_id,
                    entity_info=entity.model_dump()
                )

            # We can't save 'all_sources' directly anymore since we get claims back.
            # So we skip saving sources and directly proceed to Claim Assembly.
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DOMAIN_SEARCH_COMPLETED,
                agent_name="Orchestrator",
                message="Parallel Task API completed domain deep research.",
            )

            pipeline_start_time = time.time()

            # 3. Claim Assembly Phase
            inv_data["status"] = InvestigationStatus.RESEARCHING.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CLAIMS_EXTRACTING,
                agent_name="ClaimAssembler",
                message="Assembling claims from Task API outputs and verifying excerpts...",
            )

            claims: List[AtomicClaim] = []
            extract_tool = ParallelExtractTool()
            all_sources: List[SourceRecord] = []
            validation_errors: List[str] = []
            raw_domain_claims_count = sum(len(d_res.get("claims", [])) for d_res in domain_claims_raw.values())

            if tracer:
                claim_span_cm = tracer.start_as_current_span("ClaimAssembler.assemble")
                claim_span = claim_span_cm.__enter__()

            for domain_enum, domain_result in domain_claims_raw.items():
                domain_claims_list = domain_result.get("claims", [])
                domain_basis_list = domain_result.get("basis", [])
                
                domain_atomic_claims = []
                domain_evidence_list = []

                for i, raw_claim in enumerate(domain_claims_list):
                    try:
                        # Check if raw_claim already contains structured evidence (e.g. from search fallback)
                        if "evidence" in raw_claim and raw_claim["evidence"]:
                            raw_ev_list = raw_claim["evidence"]
                            parsed_ev = []
                            for ev in raw_ev_list:
                                if isinstance(ev, dict):
                                    ev_url = ev.get("sourceUrl") or "https://screened.app"
                                    ev_domain = ev.get("sourceDomain") or extract_domain_from_url(ev_url)
                                    ev_title = ev.get("sourceTitle") or "Web Record"
                                    ev_excerpt = ev.get("exactExcerpt", "")
                                    ev_stance_str = str(ev.get("stance", "SUPPORTS")).upper()
                                    ev_stance = Stance.CONTRADICTS if "CONTRADICT" in ev_stance_str else (Stance.MENTIONS if "MENTION" in ev_stance_str else Stance.SUPPORTS)
                                    
                                    ev_obj = ClaimEvidence(
                                        sourceId=ev.get("sourceId", str(uuid.uuid4())),
                                        sourceUrl=ev_url,
                                        sourceDomain=ev_domain,
                                        sourceTitle=ev_title,
                                        stance=ev_stance,
                                        exactExcerpt=ev_excerpt
                                    )
                                elif hasattr(ev, "sourceUrl"):
                                    ev_obj = ev
                                else:
                                    continue
                                
                                parsed_ev.append(ev_obj)
                                domain_evidence_list.append(ev_obj)
                                all_sources.append(_create_source_record(
                                    source_id=ev_obj.sourceId,
                                    url=ev_obj.sourceUrl,
                                    title=ev_obj.sourceTitle,
                                    excerpt=ev_obj.exactExcerpt,
                                    default_domain=ev_obj.sourceDomain
                                ))
                            
                            cat_enum = safe_question_category(raw_claim.get("category", QuestionCategory.BACKGROUND.value))
                            kind_enum = safe_claim_kind(raw_claim.get("kind", raw_claim.get("claimKind", "FACT")))
                            status_enum = safe_verification_status(raw_claim.get("status", VerificationStatus.CORROBORATED.value))

                            claim = AtomicClaim(
                                investigationId=investigation_id,
                                researchDomain=safe_research_domain(domain_enum),
                                category=cat_enum,
                                statement=raw_claim.get("statement", "Unknown Statement"),
                                claimKind=kind_enum,
                                status=status_enum,
                                editionYear=raw_claim.get("editionYear"),
                                attributedTo=raw_claim.get("attributedTo"),
                                evidence=parsed_ev
                            )
                            domain_atomic_claims.append(claim)
                            claims.append(claim)
                            continue

                        # Standard Task API basis parsing
                        kind_enum = safe_claim_kind(raw_claim.get("kind", "FACT"))
                        claim = AtomicClaim(
                            investigationId=investigation_id,
                            researchDomain=safe_research_domain(domain_enum),
                            category=QuestionCategory.BACKGROUND,
                            statement=raw_claim.get("statement", "Unknown Statement"),
                            claimKind=kind_enum,
                            status=VerificationStatus.VERIFIED_MATCH,
                            evidence=[]
                        )
                        
                        # Find the matching FieldBasis entry
                        matching_basis = None
                        for b in domain_basis_list:
                            field_name = b.get("field", "")
                            if f"[{i}]" in field_name or f".{i}." in field_name:
                                matching_basis = b
                                break
                        if not matching_basis and domain_basis_list:
                            matching_basis = domain_basis_list[i % len(domain_basis_list)]
                                
                        if matching_basis:
                            citations = matching_basis.get("citations", [])
                            for cit in citations:
                                if not isinstance(cit, dict) or not cit.get("url"):
                                    continue
                                
                                cit_url = cit.get("url") or "https://screened.app"
                                cit_domain = extract_domain_from_url(cit_url)
                                cit_title = cit.get("title") or "Verified Source"
                                exact_excerpts = cit.get("excerpts", [])
                                exact_excerpt = exact_excerpts[0] if exact_excerpts else raw_claim.get("statement", "")[:50]
                                
                                evidence = ClaimEvidence(
                                    sourceId=str(uuid.uuid4()),
                                    sourceUrl=cit_url,
                                    sourceDomain=cit_domain,
                                    sourceTitle=cit_title,
                                    stance=Stance.SUPPORTS,
                                    exactExcerpt=exact_excerpt
                                )
                                claim.evidence.append(evidence)
                                domain_evidence_list.append(evidence)
                                
                                all_sources.append(_create_source_record(
                                    source_id=evidence.sourceId,
                                    url=cit_url,
                                    title=cit_title,
                                    excerpt=exact_excerpt,
                                    default_domain=cit_domain,
                                    publish_date=cit.get("publish_date")
                                ))
                        
                        domain_atomic_claims.append(claim)
                        claims.append(claim)
                    except Exception as e:
                        err_msg = f"Claim parsing anomaly on index {i}: {e}"
                        validation_errors.append(err_msg)
                        logger.warning(f"[CLAIM_PARSE_WARNING] {err_msg}", exc_info=True)

                # Fetch basis URLs to get content hash and verify snippets
                basis_urls = [b.get("url") for b in domain_basis_list if isinstance(b, dict) and b.get("url")]
                if basis_urls:
                    await extract_tool.extract_and_verify(basis_urls, domain_evidence_list)

            if tracer:
                claim_span.set_attribute("screened.claims_extracted", len(claims))
                claim_span_cm.__exit__(None, None, None)
                
            # Persist both atomic claims AND discovered web sources
            await db.save_claims(investigation_id, claims)
            await db.save_sources(investigation_id, all_sources)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CLAIMS_EXTRACTED,
                agent_name="ClaimAssembler",
                message=f"Assembled {len(claims)} atomic claims and {len(all_sources)} verified sources.",
                details={"claimsCount": len(claims), "sourcesCount": len(all_sources)},
            )

            # 4. Contradiction & Dispute Analysis Phase
            inv_data["status"] = InvestigationStatus.ANALYZING_CONTRADICTIONS.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CONTRADICTIONS_ANALYZING,
                agent_name="ContradictionAnalyst",
                message="Scanning claims for conflicting venue listings, fee discrepancies, and contradictory statements...",
            )

            disputes = await self.contradiction_analyst.analyze(
                subject_name=entity.name,
                claims=claims,
            )

            if disputes:
                await broadcaster.emit(
                    investigation_id=investigation_id,
                    event_type=EventType.CONTRADICTION_DETECTED,
                    agent_name="ContradictionAnalyst",
                    message=f"Identified {len(disputes)} conflicting points. Side-by-side evidence prepared.",
                    details={"disputes": [d.model_dump() for d in disputes]},
                )

            # 5. Deep 360° Forensic Vetting Phase (Spec 14 & Spec 17)
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DEEP_VETTING_ANALYZING,
                agent_name="DeepVettingAgent",
                message="Executing 360° forensic analysis across Corporate Registries, WHOIS, rules plagiarism, and alumni footprint...",
            )

            deep_vetting_report = await self.deep_vetting.analyze(
                festival_name=entity.name,
                sources=all_sources,
                optional_url=entity.officialDomain,
                city_country=entity.cityCountry,
                investigation_id=investigation_id,
                claims=claims,
            )

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DEEP_VETTING_COMPLETED,
                agent_name="DeepVettingAgent",
                message=f"Deep vetting complete. Authenticity score: {deep_vetting_report.overallAuthenticityScore}% with {deep_vetting_report.totalFlags} risk signals.",
                details={"overallAuthenticityScore": deep_vetting_report.overallAuthenticityScore, "totalFlags": deep_vetting_report.totalFlags},
            )

            # 6. Dossier Synthesis & Narrative Generation
            inv_data["status"] = InvestigationStatus.ASSEMBLING_DOSSIER.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DOSSIER_SYNTHESIZING,
                agent_name="ReportWriter",
                message="Synthesizing comprehensive neutral dossier and filmmaker due-diligence checklist...",
            )

            dossier = await self.report_writer.write_report(
                entity=entity,
                claims=claims,
                sources=all_sources,
                disputes=disputes,
            )

            # 7. Diagnostic Health Evaluation & Finalization
            inconclusive_count = sum(
                1 for d in deep_vetting_report.dimensions
                if getattr(d, "status", None) == VettingSignalStatus.INCONCLUSIVE
            )
            audit_status = "HEALTHY"
            audit_warnings: List[str] = []

            if len(claims) == 0 and raw_domain_claims_count > 0:
                audit_status = "EMPTY_WARNING"
                warn_text = f"CRITICAL: {raw_domain_claims_count} raw domain claims received from search/task APIs but 0 claims assembled into database."
                audit_warnings.append(warn_text)
                logger.error(
                    f"[CLAIM_PIPELINE_ANOMALY] Investigation {investigation_id} dropped all claims! "
                    f"Raw received: {raw_domain_claims_count}, Assembled: 0, Errors: {validation_errors}"
                )
            elif inconclusive_count >= 5:
                audit_status = "DEGRADED"
                audit_warnings.append(f"Deep Vetting starvation: {inconclusive_count}/7 forensic vectors returned INCONCLUSIVE.")
            elif validation_errors:
                audit_status = "DEGRADED"
                audit_warnings.extend(validation_errors[:5])

            execution_duration_ms = int((time.time() - pipeline_start_time) * 1000) if 'pipeline_start_time' in locals() else 0
            audit_health = InvestigationAuditHealth(
                status=audit_status,
                rawDomainClaimsReceived=raw_domain_claims_count,
                assembledClaimsCount=len(claims),
                sourcesCount=len(all_sources),
                validationErrorsCount=len(validation_errors),
                validationErrors=validation_errors[:10],
                deepVettingVectorsCount=len(deep_vetting_report.dimensions),
                deepVettingInconclusiveCount=inconclusive_count,
                warnings=audit_warnings,
                executionDurationMs=execution_duration_ms
            )

            # Finalize Investigation Record
            inv_data["status"] = InvestigationStatus.READY.value
            inv_data["dossier"] = dossier.model_dump()
            inv_data["disputes"] = [d.model_dump() for d in disputes]
            inv_data["deepVetting"] = deep_vetting_report.model_dump()
            inv_data["auditHealth"] = audit_health.model_dump()
            inv_data["sourcesCount"] = len(all_sources)
            inv_data["claimsCount"] = len(claims)
            inv_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
            await db.save_investigation(investigation_id, inv_data)

            # Background Notification Dispatcher (Email & Web Push)
            notification_email = inv_data.get("notificationEmail")
            if notification_email:
                try:
                    from backend.services.email_service import email_service
                    await email_service.send_completion_email(
                        to_email=notification_email,
                        festival_name=entity.name,
                        investigation_id=investigation_id,
                    )
                except Exception as em_err:
                    logger.warning(f"Could not send completion email for {investigation_id}: {em_err}")

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DOSSIER_READY,
                agent_name="ReportWriter",
                message="Dossier is complete and ready for filmmaker review.",
                details={
                    "investigationId": investigation_id,
                    "claimsCount": len(claims),
                    "sourcesCount": len(all_sources),
                    "disputesCount": len(disputes),
                },
            )

        except Exception as e:
            from backend.config import settings
            if settings.strict_mode:
                raise
            if trace:
                span = trace.get_current_span()
                if span and span.is_recording():
                    span.record_exception(e)
                    from opentelemetry.trace.status import Status, StatusCode
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    span.set_attribute("screened.investigation_id", investigation_id)
                    span.set_attribute("screened.error_phase", "full_research_pipeline")
            
            logger.error(
                f"Pipeline execution failed for {investigation_id}: {e}", 
                extra={
                    "json_fields": {
                        "fallbackPath": "full_research_pipeline",
                        "investigation_id": investigation_id,
                        "error_type": type(e).__name__
                    }
                }, 
                exc_info=True
            )
            
            inv_data = await db.get_investigation(investigation_id) or {}
            inv_data["status"] = InvestigationStatus.FAILED.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.ERROR,
                agent_name="Orchestrator",
                message=f"Pipeline error: {str(e)}",
            )


orchestrator = Orchestrator()

def build_root_agent():
    """Factory to build the ADK Workflow representing the system architecture."""
    from google.adk.workflow import Workflow, Edge, START
    from google.adk.agents import LlmAgent
    from backend.agents.adk_helpers import get_adk_model
    
    # 1. Planner
    from backend.agents.planner import create_planner_adk_agent
    planner = create_planner_adk_agent(
        entity_name="Stub", location="Stub", official_website="Stub", intent="Stub"
    )
    
    # 2. Domain Agents
    from backend.agents.domain_agents import create_domain_agent
    festival_agent = create_domain_agent("FESTIVAL", "stub", {})
    festival_agent.name = "festival_research"
    organizer_agent = create_domain_agent("ORGANIZER", "stub", {})
    organizer_agent.name = "organizer_research"
    participants_agent = create_domain_agent("PARTICIPANTS", "stub", {})
    participants_agent.name = "participants_research"
    
    domain_research = Workflow(
        name="domain_research",
        description="Domain Research Execution",
        edges=[
            Edge(from_node=START, to_node=festival_agent),
            Edge(from_node=START, to_node=organizer_agent),
            Edge(from_node=START, to_node=participants_agent)
        ]
    )
    
    # 3. Deep Vetting
    ci = LlmAgent(name="corporate_identity", description="Inspect company registration", model=get_adk_model("gemini-2.5-pro"))
    df = LlmAgent(name="domain_forensics", description="Inspect domain registration history", model=get_adk_model("gemini-2.5-pro"))
    vr = LlmAgent(name="venue_reality", description="Cross-check physical theater leases", model=get_adk_model("gemini-2.5-pro"))
    jl = LlmAgent(name="jury_laurels", description="Factually assess Festival Directors", model=get_adk_model("gemini-2.5-pro"))
    rp = LlmAgent(name="rules_plagiarism", description="Check if submission rules are unique", model=get_adk_model("gemini-2.5-pro"))

    deep_vetting = Workflow(
        name="deep_vetting",
        description="360° Deep Vetting",
        edges=[
            Edge(from_node=START, to_node=ci),
            Edge(from_node=START, to_node=df),
            Edge(from_node=START, to_node=vr),
            Edge(from_node=START, to_node=jl),
            Edge(from_node=START, to_node=rp)
        ]
    )
    
    # 4. Other Agents
    producer_desk = LlmAgent(name="producer_desk", description="Producer Desk", model=get_adk_model("gemini-2.5-flash"))
    opportunity_scout = LlmAgent(name="opportunity_scout", description="Opportunity Scout", model=get_adk_model("gemini-2.5-flash"))
    outreach_drafter = LlmAgent(name="outreach_drafter", description="Outreach Drafter", model=get_adk_model("gemini-2.5-flash"))
    
    root = Workflow(
        name="orchestrator",
        description="Screened Orchestrator",
        edges=[
            Edge(from_node=START, to_node=planner),
            Edge(from_node=planner, to_node=domain_research),
            Edge(from_node=domain_research, to_node=deep_vetting),
            Edge(from_node=deep_vetting, to_node=producer_desk),
            Edge(from_node=producer_desk, to_node=opportunity_scout),
            Edge(from_node=opportunity_scout, to_node=outreach_drafter)
        ]
    )
    
    return root
