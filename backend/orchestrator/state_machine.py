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

try:
    from google.cloud import tasks_v2
    tasks_client = tasks_v2.CloudTasksClient()
    PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
    LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "")
    TASKS_QUEUE = os.environ.get("CLOUD_TASKS_QUEUE", "screened-tasks")
    if PROJECT and LOCATION:
        QUEUE_PATH = tasks_client.queue_path(PROJECT, LOCATION, TASKS_QUEUE)
    else:
        QUEUE_PATH = None
    OIDC_SERVICE_ACCOUNT = os.environ.get("OIDC_SERVICE_ACCOUNT_EMAIL", "")
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
                
            task = {
                "http_request": {
                    "http_method": tasks_v2.HttpMethod.POST,
                    "url": url,
                    "headers": headers,
                    "body": json.dumps(payload).encode(),
                }
            }
            if OIDC_SERVICE_ACCOUNT:
                task["http_request"]["oidc_token"] = {"service_account_email": OIDC_SERVICE_ACCOUNT}
                
            tasks_client.create_task(request={"parent": QUEUE_PATH, "task": task})
            return None
        except Exception as e:
            logger.warning(f"Cloud Tasks enqueue failed: {e}", extra={"fallbackPath": path})
    else:
        logger.warning("Cloud Tasks not configured", extra={"fallbackPath": path})
        if os.environ.get("ENVIRONMENT") == "production":
            raise RuntimeError("Cloud Tasks configuration is required in production environments. Asyncio fallback is disabled.")
        
    # Fallback to asyncio
    return asyncio.create_task(fallback_task_func(*args))


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
            logger.error(f"Disambiguation error for {inv_id}: {e}", extra={"json_fields": {"fallbackPath": "disambiguation_pipeline"}}, exc_info=True)
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

            all_sources = []
            
            if tracer:
                claim_span = tracer.start_as_current_span("ClaimAssembler.assemble")
                claim_span.__enter__()
            for domain_enum, domain_result in domain_claims_raw.items():
                domain_claims_list = domain_result.get("claims", [])
                domain_basis_list = domain_result.get("basis", [])
                
                # We build claims and evidence first
                domain_atomic_claims = []
                domain_evidence_list = []
                
                from backend.tools.parallel_extract import normalize_whitespace

                for i, raw_claim in enumerate(domain_claims_list):
                    try:
                        claim = AtomicClaim(
                            investigationId=investigation_id,
                            researchDomain=domain_enum,
                            category=QuestionCategory.BACKGROUND,
                            statement=raw_claim.get("statement", "Unknown Statement"),
                            claimKind=ClaimKind(raw_claim.get("kind", "FACT")),
                            status=VerificationStatus.VERIFIED_MATCH,
                            evidence=[]
                        )
                        
                        # Real mapping for the hackathon
                        # Find the matching FieldBasis entry (by field name, like "claims[i].statement" or similar)
                        matching_basis = None
                        for b in domain_basis_list:
                            field_name = b.get("field", "")
                            if f"[{i}]" in field_name or f".{i}." in field_name:
                                matching_basis = b
                                break
                                
                        if matching_basis:
                            citations = matching_basis.get("citations", [])
                            for cit in citations:
                                if not isinstance(cit, dict) or not cit.get("url"):
                                    continue
                                
                                exact_excerpts = cit.get("excerpts", [])
                                # Take the first exactExcerpt if available
                                exact_excerpt = exact_excerpts[0] if exact_excerpts else raw_claim.get("statement", "")[:50]
                                
                                # Verbatim substring check
                                statement = raw_claim.get("statement", "")
                                norm_excerpt = normalize_whitespace(exact_excerpt)
                                norm_statement = normalize_whitespace(statement)
                                
                                evidence_status = VerificationStatus.UNVERIFIED_EXCERPT
                                if norm_excerpt and norm_excerpt in norm_statement:
                                    evidence_status = VerificationStatus.VERIFIED_MATCH
                                    
                                # Since status is on the claim, if ANY evidence matches, we can upgrade claim status
                                if evidence_status == VerificationStatus.VERIFIED_MATCH:
                                    claim.status = VerificationStatus.VERIFIED_MATCH
                                    
                                evidence = ClaimEvidence(
                                    sourceId=str(uuid.uuid4()),
                                    sourceUrl=cit.get("url"),
                                    sourceTitle=cit.get("title", "Unknown Source"),
                                    stance=Stance.SUPPORTS,
                                    exactExcerpt=exact_excerpt
                                )
                                claim.evidence.append(evidence)
                                domain_evidence_list.append(evidence)
                                
                                # Rebuild SourceRecord persistence
                                all_sources.append(SourceRecord(
                                    id=evidence.sourceId,
                                    investigationId=investigation_id,
                                    url=evidence.sourceUrl,
                                    title=evidence.sourceTitle,
                                    publishedDate=cit.get("publish_date"),
                                    relevanceScore=1.0,
                                    domainAuthority=0.8,
                                    contentHash="mock_hash"
                                ))
                        
                        domain_atomic_claims.append(claim)
                        claims.append(claim)
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
                        logger.error(f"Error parsing claim: {e}", extra={"json_fields": {"fallbackPath": "claim_assembly"}}, exc_info=True)

                # Fetch basis URLs to get content hash and verify snippets
                basis_urls = [b.get("url") for b in domain_basis_list if isinstance(b, dict) and b.get("url")]
                if basis_urls:
                    await extract_tool.extract_and_verify(basis_urls, domain_evidence_list)

            if tracer:
                claim_span.set_attribute("screened.claims_extracted", len(claims))
                claim_span.__exit__(None, None, None)
                
            await db.save_claims(investigation_id, claims)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CLAIMS_EXTRACTED,
                agent_name="ClaimAssembler",
                message=f"Assembled {len(claims)} atomic claims from Task outputs.",
                details={"claimsCount": len(claims)},
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

            # 5. Deep 360° Forensic Vetting Phase (Spec 14)
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DEEP_VETTING_ANALYZING,
                agent_name="DeepVettingAgent",
                message="Executing 360° forensic analysis across Companies House, WHOIS, rules plagiarism, and jury dossiers...",
            )

            deep_vetting_report = await self.deep_vetting.analyze(
                festival_name=entity.name,
                sources=all_sources,
                optional_url=entity.officialDomain,
                city_country=entity.cityCountry,
                investigation_id=investigation_id,
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

            # Finalize Investigation Record
            inv_data["status"] = InvestigationStatus.READY.value
            inv_data["dossier"] = dossier.model_dump()
            inv_data["disputes"] = [d.model_dump() for d in disputes]
            inv_data["deepVetting"] = deep_vetting_report.model_dump()
            inv_data["sourcesCount"] = len(all_sources)
            inv_data["claimsCount"] = len(claims)
            inv_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
            await db.save_investigation(investigation_id, inv_data)

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
                    "authenticityScore": deep_vetting_report.overallAuthenticityScore,
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
            logger.error(f"Pipeline execution failed for {investigation_id}: {e}", extra={"json_fields": {"fallbackPath": "full_research_pipeline"}}, exc_info=True)
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
    """Factory to build the ADK SequentialAgent representing the system architecture."""
    from google.adk.agents import SequentialAgent, ParallelAgent, LlmAgent
    
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
    
    domain_research = ParallelAgent(
        name="domain_research",
        description="Domain Research Execution",
        sub_agents=[festival_agent, organizer_agent, participants_agent]
    )
    
    # 3. Deep Vetting
    deep_vetting = ParallelAgent(
        name="deep_vetting",
        description="360° Deep Vetting",
        sub_agents=[
            LlmAgent(name="corporate_identity", description="Inspect company registration", model="gemini-2.5-pro"),
            LlmAgent(name="domain_forensics", description="Inspect domain registration history", model="gemini-2.5-pro"),
            LlmAgent(name="venue_reality", description="Cross-check physical theater leases", model="gemini-2.5-pro"),
            LlmAgent(name="jury_laurels", description="Factually assess Festival Directors", model="gemini-2.5-pro"),
            LlmAgent(name="rules_plagiarism", description="Check if submission rules are unique", model="gemini-2.5-pro"),
        ]
    )
    
    # 4. Other Agents
    producer_desk = LlmAgent(name="producer_desk", description="Producer Desk", model="gemini-2.5-flash")
    opportunity_scout = LlmAgent(name="opportunity_scout", description="Opportunity Scout", model="gemini-2.5-flash")
    outreach_drafter = LlmAgent(name="outreach_drafter", description="Outreach Drafter", model="gemini-2.5-flash")
    
    root = SequentialAgent(
        name="orchestrator",
        description="Screened Orchestrator",
        sub_agents=[
            planner,
            domain_research,
            deep_vetting,
            producer_desk,
            opportunity_scout,
            outreach_drafter
        ]
    )
    
    return root
