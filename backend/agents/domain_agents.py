"""Domain Agents executing Parallel Search queries in parallel for Screened."""
import asyncio
import logging
from typing import List, Dict, Any
from backend.models import ResearchDomain, SourceRecord
from backend.agents.planner import DomainPlan
from backend.tools.parallel_task import parallel_task_run
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from backend.orchestrator.session_service import FirestoreSessionService
from google.adk.runners import Runner

logger = logging.getLogger("screened.agents.domain_agents")


def create_domain_agent(domain: str, investigation_id: str, entity_info: Dict[str, Any]) -> LlmAgent:
    """Create an ADK LlmAgent for a specific domain that uses parallel_task_run."""
    
    # We create a wrapped function that injects investigation_id, domain, entity_info
    async def wrapped_task_run(objective: str, queries: list[str]) -> Dict[str, Any]:
        result = await parallel_task_run(
            investigation_id=investigation_id,
            domain=domain,
            entity_info=entity_info,
            objective=objective,
            queries=queries,
            processor="core"
        )
        
        # Save to session so we can retrieve it
        session_service = FirestoreSessionService()
        session = await session_service.get_session("screened", "default_user", investigation_id)
        session.state[f"{domain}_result"] = result
        await session_service.save_session(session)
        
        return result
        
    task_tool = FunctionTool(
        name="parallel_task_run",
        description="Run a deep Parallel Task for a specific domain to extract claims.",
        fn=wrapped_task_run
    )
    
    return LlmAgent(
        name=f"{domain}Agent",
        system_instruction=f"You are the {domain} Research Agent. Use the parallel_task_run tool to extract claims for your domain.",
        tools=[task_tool]
    )

async def _run_domain_agent(domain: ResearchDomain, plan: DomainPlan, investigation_id: str, entity_info: Dict[str, Any]) -> dict:
    agent = create_domain_agent(domain.value, investigation_id, entity_info)
    runner = Runner(
        agent=agent,
        app_name="screened",
        session_service=FirestoreSessionService()
    )
    
    # We pump the runner stream to trigger tools (the tool itself streams to SSE)
    async for _ in runner.run_async(user_id="default_user", session_id=investigation_id, prompt=f"Extract claims for objective: {plan.objective} with queries: {plan.searchQueries}"):
        pass
        
    # The output of the agent should be the claims, but we can also just fetch the state.
    # For now, return what we can. We will integrate this in the state machine.
    # Assuming the tool call populates the session state
    session_service = FirestoreSessionService()
    session = await session_service.get_session("screened", "default_user", investigation_id)
    return session.state.get(f"{domain.value}_result", {"claims": [], "basis": []})


async def run_parallel_domain_agents(
    plans: dict,
    investigation_id: str,
    entity_info: Dict[str, Any]
) -> dict:
    """Execute all three domain research agents concurrently via ADK LlmAgent."""
    
    f_task = _run_domain_agent(ResearchDomain.FESTIVAL, plans[ResearchDomain.FESTIVAL], investigation_id, entity_info)
    o_task = _run_domain_agent(ResearchDomain.ORGANIZER, plans[ResearchDomain.ORGANIZER], investigation_id, entity_info)
    p_task = _run_domain_agent(ResearchDomain.PARTICIPANTS, plans[ResearchDomain.PARTICIPANTS], investigation_id, entity_info)

    f_res, o_res, p_res = await asyncio.gather(f_task, o_task, p_task, return_exceptions=True)

    results = {
        ResearchDomain.FESTIVAL: f_res if isinstance(f_res, dict) else {},
        ResearchDomain.ORGANIZER: o_res if isinstance(o_res, dict) else {},
        ResearchDomain.PARTICIPANTS: p_res if isinstance(p_res, dict) else {},
    }
    return results
