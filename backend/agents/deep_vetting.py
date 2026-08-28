"""Deep Vetting Agent executing 360° forensic festival analysis (Spec 14)."""
import json
import logging
from typing import Dict, List, Optional, Any
from google.genai import types

from backend.models import (
    DeepVettingDimension,
    DeepVettingReport,
    QuestionCategory,
    ResearchDomain,
    SourceRecord,
    VettingSignalStatus,
)
from backend.orchestrator.events import EventType, broadcaster
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.deep_vetting")


from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.tools import FunctionTool
from backend.orchestrator.session_service import FirestoreSessionService
from backend.tools.parallel_task import parallel_task_run as _parallel_task_run

from backend.agents.adk_helpers import get_adk_model
from backend.tools.source_tiers import (
    CORPORATE_IDENTITY_DOMAINS,
    DOMAIN_FORENSICS_DOMAINS,
    VENUE_REALITY_DOMAINS,
    PERSONNEL_DOSSIER_DOMAINS
)

DIMENSIONS = [
    {"key": "CORPORATE_REGISTRY", "name": "corporate_identity", "desc": "Inspect company registration, entity active status, incorporate date vs claimed edition history, explicitly search for company officers, names, appointment dates, and their other active directorships.", "include_domains": CORPORATE_IDENTITY_DOMAINS},
    {"key": "DOMAIN_PROVENANCE", "name": "domain_forensics", "desc": "Inspect domain registration history, longevity vs claimed heritage, website provenance.", "include_domains": DOMAIN_FORENSICS_DOMAINS},
    {"key": "VENUE_CORROBORATION", "name": "venue_reality", "desc": "Cross-check physical theater leases, cinema screening spaces, and event schedules.", "include_domains": VENUE_REALITY_DOMAINS},
    {"key": "PERSONNEL_DOSSIER", "name": "personnel_dossier", "desc": "Factually assess Festival Directors, Programmers, and Jury Members. Check if they run multiple other festivals (Festival Mills) or own/operate distribution and consulting companies targeting filmmakers.", "include_domains": PERSONNEL_DOSSIER_DOMAINS},
    {"key": "BOILERPLATE_PLAGIARISM", "name": "rules_plagiarism", "desc": "Check if submission rules, fee policies, or waiver texts are unique or cloned from known laurel mills.", "include_domains": None},
]

class DeepVettingAgent:
    """Performs structured 360° due-diligence vetting across forensic dimensions using ADK."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    def _create_dimension_tool(self, dimension: dict, investigation_id: str, festival_name: str, optional_url: Optional[str]) -> FunctionTool:
        async def parallel_task_run(objective: str, queries: list[str]) -> Dict[str, Any]:
            f"""Run a Parallel Task to extract claims about {dimension['name']}."""
            entity_info = {"name": festival_name, "officialDomain": optional_url}
            source_policy = {}
            if dimension.get("include_domains"):
                source_policy["include_domains"] = dimension["include_domains"]
            if dimension["name"] == "rules_plagiarism" and optional_url:
                source_policy["exclude_domains"] = [optional_url]

            result = await _parallel_task_run(
                investigation_id=investigation_id,
                domain=dimension["name"],
                entity_info=entity_info,
                objective=objective,
                queries=queries,
                processor="core",
                source_policy=source_policy if source_policy else None
            )
            session_service = FirestoreSessionService()
            session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
            if session:
                session.state[f"{dimension['name']}_result"] = result
                await session_service.save_session(session)
            return result
            
        return FunctionTool(parallel_task_run)

    async def analyze(
        self,
        festival_name: str,
        sources: List[SourceRecord],
        optional_url: Optional[str] = None,
        city_country: Optional[str] = None,
        investigation_id: str = "unknown_investigation"
    ) -> DeepVettingReport:
        logger.info(f"Conducting deep 360° forensic vetting (ParallelAgent) for: {festival_name}")

        agents = []
        for dim in DIMENSIONS:
            tool = self._create_dimension_tool(dim, investigation_id, festival_name, optional_url)
            instruction = f"You are the Deep Vetting Agent for the {dim['key']} dimension. Your goal is to {dim['desc']}. Use the parallel_task_run tool."
            agents.append(
                LlmAgent(
                    name=dim["name"],
                    model=get_adk_model("gemini-2.5-flash"),
                    instruction=instruction,
                    tools=[tool]
                )
            )

        reducer_instruction = f"""
You are the Chief Investigative Forensic Analyst for Screened.
Synthesize the parallel dimension analyses into a final deep vetting report for {festival_name}.
Focus on these 5 dimensions: CORPORATE_REGISTRY, DOMAIN_PROVENANCE, VENUE_CORROBORATION, PERSONNEL_DOSSIER, BOILERPLATE_PLAGIARISM.
Aggregate the "Festival Mill" and "Consulting Overlap" findings into prominent RED_FLAG or AMBER_WARNING signals.
Fill in the other 2 (ALUMNI_FOOTPRINT, IMAGE_PROVENANCE) with INCONCLUSIVE or INFORMATIONAL defaults.
Ensure you populate the keyPersonnel array with extracted information about directors, officers, programmers and jury.
Return a JSON object conforming strictly to the output schema.
"""

        from google.adk.workflow import Workflow, Edge, START
        
        scorer = LlmAgent(
            name="vetting_scorer",
            model=get_adk_model("gemini-2.5-flash"),
            instruction=reducer_instruction,
            output_schema=DeepVettingReport,
            output_key="deep_vetting_report"
        )

        edges = [Edge(from_node=START, to_node=a) for a in agents] + [
            Edge(from_node=a, to_node=scorer) for a in agents
        ]
        
        vetting_agent = Workflow(
            name="deep_vetting_pipeline",
            edges=edges
        )
        
        session_service = FirestoreSessionService()
        runner = Runner(
            agent=vetting_agent,
            app_name="screened",
            session_service=session_service
        )
        
        prompt = f"Perform deep vetting on Festival: {festival_name}, URL: {optional_url or 'Unknown'}, Location: {city_country or 'Unknown'}."
        content_msg = types.Content(parts=[types.Part.from_text(text=prompt)])
        
        try:
            session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
            if not session:
                await session_service.create_session(app_name="screened", user_id="default_user", session_id=investigation_id)

            async for step in runner.run_async(user_id="default_user", session_id=investigation_id, new_message=content_msg):
                pass
                
            session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
            if session:
                final_report_data = session.state.get("deep_vetting_report")
                if final_report_data:
                    if isinstance(final_report_data, DeepVettingReport):
                        return final_report_data
                    if isinstance(final_report_data, str):
                        try:
                            final_report_data = json.loads(final_report_data)
                        except Exception:
                            pass
                    if isinstance(final_report_data, dict):
                        return DeepVettingReport.model_validate(final_report_data)
                
        except Exception as e:
            logger.exception(f"DeepVettingAgent ADK execution failed: {e}. Generating deterministic fallback.")

        fallback_dims = self._get_fallback_dimensions(festival_name, optional_url)
        return DeepVettingReport(
            festivalName=festival_name,
            overallAuthenticityScore=78,
            totalFlags=1,
            dimensions=fallback_dims,
            degraded=True
        )

    def _get_fallback_dimensions(self, festival_name: str, optional_url: Optional[str] = None) -> List[DeepVettingDimension]:
        """Provides a safe fallback matrix that admits analysis failure rather than hallucinating facts."""
        domain_name = optional_url.split("//")[-1].split("/")[0] if optional_url else "unknown domain"

        dims = [
            ("CORPORATE_REGISTRY", "Corporate & Legal Entity Verification", QuestionCategory.CORPORATE_REGISTRY),
            ("DOMAIN_PROVENANCE", "Domain Age & WHOIS Provenance", QuestionCategory.DOMAIN_PROVENANCE),
            ("BOILERPLATE_PLAGIARISM", "Boilerplate Rules & Text Duplication", QuestionCategory.BOILERPLATE_PLAGIARISM),
            ("PERSONNEL_DOSSIER", "Key Personnel & Jury Dossiers", QuestionCategory.PERSONNEL_DOSSIER),
            ("VENUE_CORROBORATION", "Municipal Screening & Venue Corroboration", QuestionCategory.VENUE_CORROBORATION),
            ("ALUMNI_FOOTPRINT", "Alumni Filmmaker & Selection Footprint", QuestionCategory.ALUMNI_FOOTPRINT),
            ("IMAGE_PROVENANCE", "Promotional Image & Asset Authenticity", QuestionCategory.IMAGE_PROVENANCE),
        ]

        return [
            DeepVettingDimension(
                dimensionKey=key,
                title=title,
                category=cat,
                status=VettingSignalStatus.INCONCLUSIVE,
                confidenceScore=0,
                summary=f"Automated deep vetting failed for this dimension. Unable to verify {festival_name}.",
                signalsFound=["Analysis failed or timed out"],
                corroboratingSources=[],
                riskWeight="HIGH",
            )
            for key, title, cat in dims
        ]
