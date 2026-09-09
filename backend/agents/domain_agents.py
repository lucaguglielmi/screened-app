"""Domain Agents executing Parallel Search queries in parallel for Screened."""
import asyncio
import logging
from typing import List, Dict, Any
from backend.models import ResearchDomain, SourceRecord
from backend.agents.planner import DomainPlan
from backend.tools.parallel_task import parallel_task_run as _parallel_task_run
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from backend.orchestrator.session_service import FirestoreSessionService
from google.adk.runners import Runner
from google.genai import types
from backend.orchestrator.events import EventType, broadcaster

from backend.agents.adk_helpers import get_adk_model
logger = logging.getLogger("screened.agents.domain_agents")


def create_domain_agent(domain: str, investigation_id: str, entity_info: Dict[str, Any]) -> LlmAgent:
    """Create an ADK LlmAgent for a specific domain that uses parallel_task_run."""
    
    async def parallel_task_run(objective: str, queries: list[str]) -> Dict[str, Any]:
        """Run a deep Parallel Task for a specific domain to extract claims."""
        result = await _parallel_task_run(
            investigation_id=investigation_id,
            domain=domain,
            entity_info=entity_info,
            objective=objective,
            queries=queries,
            processor="core"
        )
        
        session_service = FirestoreSessionService()
        session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
        if session:
            session.state[f"{domain}_result"] = result
            await session_service.save_session(session)
        
        return result
        
    task_tool = FunctionTool(parallel_task_run)
    
    # 7-Agent Swarm Identities
    identities = {
        "FESTIVAL": "OfficialSiteCrawler Agent. Analyze official domains for structural integrity and boilerplate text.",
        "ORGANIZER": "CorporateRegistry Agent. Investigate legal entities, Companies House, founders, and LinkedIn traces.",
        "PARTICIPANTS": "CommunitySentiment Agent. Analyze filmmaker alumni, allegations, Reddit, and attendee reviews.",
        "FEES": "PlatformScout Agent. Investigate FilmFreeway/Festhome entry fees, escalation tiers, and deadlines.",
        "VENUES": "VenueForensics Agent. Verify physical cinemas, theater bookings, and municipal event records.",
        "CLAIMS": "HeritageAudit Agent. Trace past editions, winners, historical continuity, and Wikipedia records.",
        "FIT": "InstitutionalArchive Agent. Verify institutional backing, BFI/FIAPF status, and local grants."
    }
    
    identity = identities.get(domain, f"{domain} Research Agent.")

    return LlmAgent(
        name=f"{domain}Agent",
        model=get_adk_model("gemini-2.5-flash"),
        instruction=f"You are the {identity} Use the parallel_task_run tool to extract claims for your domain.",
        tools=[task_tool]
    )

async def _run_domain_agent(
    domain: ResearchDomain,
    plan: DomainPlan,
    investigation_id: str,
    entity_info: Dict[str, Any],
    session_service: FirestoreSessionService,
) -> dict:
    """Execute deep parallel search and extraction directly for a specific domain."""
    try:
        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.DOMAIN_SEARCH_STARTED,
            agent_name=f"{domain.value}Agent",
            message=f"Starting deep research on {domain.value} domain ({len(plan.searchQueries)} verification targets)...",
        )

        result = await _parallel_task_run(
            investigation_id=investigation_id,
            domain=domain.value,
            entity_info=entity_info,
            objective=plan.objective,
            queries=plan.searchQueries,
            processor="core",
        )

        session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
        if session:
            session.state[f"{domain.value}_result"] = result
            await session_service.save_session(session)

        return result if isinstance(result, dict) else {"claims": [], "basis": []}
    except Exception as e:
        logger.exception(f"Error in _run_domain_agent for {domain.value}: {e}")
        return {"claims": [], "basis": []}


async def run_parallel_domain_agents(
    plans: dict,
    investigation_id: str,
    entity_info: Dict[str, Any]
) -> dict:
    """Execute the full 7-agent swarm concurrently."""
    
    session_service = FirestoreSessionService()
    
    domains = [
        ResearchDomain.FESTIVAL,
        ResearchDomain.ORGANIZER,
        ResearchDomain.PARTICIPANTS,
        ResearchDomain.FEES,
        ResearchDomain.VENUES,
        ResearchDomain.CLAIMS,
        ResearchDomain.FIT
    ]
    
    tasks = [
        _run_domain_agent(d, plans[d.value], investigation_id, entity_info, session_service) 
        for d in domains if d.value in plans
    ]

    raw_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    async def process_res(domain: ResearchDomain, res: Any) -> dict:
        if isinstance(res, Exception):
            logger.exception(f"Domain agent {domain.value} failed: {res}")
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.ERROR,
                agent_name=f"{domain.value}Agent",
                message=f"Research failed for {domain.value}: {str(res)}"
            )
            return {"claims": [], "basis": []}
        return res if isinstance(res, dict) else {"claims": [], "basis": []}

    results = {}
    for i, d in enumerate([d for d in domains if d.value in plans]):
        results[d] = await process_res(d, raw_results[i])
        
    return results
