"""Investigation State Machine and Execution Orchestrator."""
import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid

from backend.db.firestore import db
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    InvestigationStatus,
    ResearchDomain,
    SourceRecord,
)
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient
from backend.orchestrator.events import EventType, broadcaster
from backend.agents import (
    DisambiguatorAgent,
    PlannerAgent,
    FestivalAgent,
    OrganizerAgent,
    ParticipantsAgent,
    run_parallel_domain_agents,
    ClaimExtractorAgent,
    ContradictionAnalystAgent,
    DisputeRecord,
    ReportWriterAgent,
    DossierReport,
    DeepVettingAgent,
)

logger = logging.getLogger("screened.orchestrator.state_machine")


class Orchestrator:
    """Coordinates multi-agent execution and manages investigation lifecycle."""

    def __init__(self):
        self.parallel_tool = ParallelSearchTool()
        self.gemini = GeminiClient()

        # Agents
        self.disambiguator = DisambiguatorAgent(self.parallel_tool, self.gemini)
        self.planner = PlannerAgent(self.gemini)
        self.festival_agent = FestivalAgent(self.parallel_tool)
        self.organizer_agent = OrganizerAgent(self.parallel_tool)
        self.participants_agent = ParticipantsAgent(self.parallel_tool)
        self.claim_extractor = ClaimExtractorAgent(self.gemini)
        self.contradiction_analyst = ContradictionAnalystAgent(self.gemini)
        self.deep_vetting = DeepVettingAgent(self.gemini)
        self.report_writer = ReportWriterAgent(self.gemini)

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
        asyncio.create_task(self._run_disambiguation(inv_id, query, optional_url))

        return inv_data

    async def _run_disambiguation(self, inv_id: str, query: str, optional_url: Optional[str]):
        try:
            await broadcaster.emit(
                investigation_id=inv_id,
                event_type=EventType.DISAMBIGUATING,
                agent_name="Disambiguator",
                message="Scanning web footprint to verify festival identity and avoid mix-ups...",
            )

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
            logger.error(f"Disambiguation error for {inv_id}: {e}", exc_info=True)
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
        asyncio.create_task(self._execute_full_research_pipeline(investigation_id, entity, inv_data.get("intent", "Vet before submitting")))

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

            plan = await self.planner.create_plan(entity, intent)

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

            domain_sources = await run_parallel_domain_agents(
                festival_agent=self.festival_agent,
                organizer_agent=self.organizer_agent,
                participants_agent=self.participants_agent,
                plans=plan.domains,
            )

            all_sources: List[SourceRecord] = []
            for domain_list in domain_sources.values():
                all_sources.extend(domain_list)

            await db.save_sources(investigation_id, all_sources)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.DOMAIN_SEARCH_COMPLETED,
                agent_name="Orchestrator",
                message=f"Discovered {len(all_sources)} verified web sources across all 3 domains.",
                details={
                    "festivalSources": len(domain_sources.get(ResearchDomain.FESTIVAL, [])),
                    "organizerSources": len(domain_sources.get(ResearchDomain.ORGANIZER, [])),
                    "participantsSources": len(domain_sources.get(ResearchDomain.PARTICIPANTS, [])),
                },
            )

            # 3. Claim Extraction & Substring Evidence Verification Phase
            inv_data["status"] = InvestigationStatus.RESEARCHING.value
            await db.save_investigation(investigation_id, inv_data)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CLAIMS_EXTRACTING,
                agent_name="ClaimExtractor",
                message="Extracting atomic claims (FACT / ALLEGATION / OPINION) and verifying verbatim excerpts...",
            )

            claims = await self.claim_extractor.extract_all_domains(
                subject_name=entity.name,
                domain_sources=domain_sources,
            )

            await db.save_claims(investigation_id, claims)

            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.CLAIMS_EXTRACTED,
                agent_name="ClaimExtractor",
                message=f"Extracted and verified {len(claims)} atomic claims.",
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
            logger.error(f"Pipeline execution failed for {investigation_id}: {e}", exc_info=True)
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
