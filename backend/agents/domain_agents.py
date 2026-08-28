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
        
        # Save to session so we can retrieve it
        session_service = FirestoreSessionService()
        session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
        if session:
            session.state[f"{domain}_result"] = result
            await session_service.save_session(session)
        
        return result
        
    task_tool = FunctionTool(parallel_task_run)
    
    return LlmAgent(
        name=f"{domain}Agent",
        model=get_adk_model("gemini-2.5-flash"),
        instruction=f"You are the {domain} Research Agent. Use the parallel_task_run tool to extract claims for your domain.",
        tools=[task_tool]
    )

async def _run_domain_agent(domain: ResearchDomain, plan: DomainPlan, investigation_id: str, entity_info: Dict[str, Any], session_service: FirestoreSessionService) -> dict:
    agent = create_domain_agent(domain.value, investigation_id, entity_info)
    runner = Runner(
        agent=agent,
        app_name="screened",
        session_service=session_service
    )
    
    # We pump the runner stream to trigger tools (the tool itself streams to SSE)
    prompt_text = f"Extract claims for objective: {plan.objective} with queries: {plan.searchQueries}"
    new_msg = types.Content(role="user", parts=[types.Part.from_text(text=prompt_text)])
    async for _ in runner.run_async(user_id="default_user", session_id=investigation_id, new_message=new_msg):
        pass
        
    # The output of the agent should be the claims, but we can also just fetch the state.
    # For now, return what we can. We will integrate this in the state machine.
    # Assuming the tool call populates the session state
    session = await session_service.get_session(app_name="screened", user_id="default_user", session_id=investigation_id)
    if session:
        return session.state.get(f"{domain.value}_result", {"claims": [], "basis": []})
    return {"claims": [], "basis": []}


async def run_parallel_domain_agents(
    plans: dict,
    investigation_id: str,
    entity_info: Dict[str, Any]
) -> dict:
    """Execute all three domain research agents concurrently via ADK LlmAgent."""
    
    session_service = FirestoreSessionService()
    f_task = _run_domain_agent(ResearchDomain.FESTIVAL, plans["FESTIVAL"], investigation_id, entity_info, session_service)
    o_task = _run_domain_agent(ResearchDomain.ORGANIZER, plans["ORGANIZER"], investigation_id, entity_info, session_service)
    p_task = _run_domain_agent(ResearchDomain.PARTICIPANTS, plans["PARTICIPANTS"], investigation_id, entity_info, session_service)

    f_res, o_res, p_res = await asyncio.gather(f_task, o_task, p_task, return_exceptions=True)
    
    async def process_res(domain: ResearchDomain, res: Any) -> dict:
        if isinstance(res, Exception):
            logger.exception(f"Domain agent {domain.value} failed: {res}")
            await broadcaster.emit(
                investigation_id=investigation_id,
                event_type=EventType.ERROR,
                agent_name=f"{domain.value}Agent",
                message=f"Research failed for {domain.value}: {str(res)}"
            )
            return {}
        return res if isinstance(res, dict) else {}

    results = {
        ResearchDomain.FESTIVAL: await process_res(ResearchDomain.FESTIVAL, f_res),
        ResearchDomain.ORGANIZER: await process_res(ResearchDomain.ORGANIZER, o_res),
        ResearchDomain.PARTICIPANTS: await process_res(ResearchDomain.PARTICIPANTS, p_res),
    }
    return results
