"""Domain Agents executing Parallel Search queries in parallel for Screened."""
import asyncio
import logging
from typing import List
from backend.models import ResearchDomain, SourceRecord
from backend.tools.parallel_search import ParallelSearchTool
from backend.agents.planner import DomainPlan

logger = logging.getLogger("screened.agents.domain_agents")


class DomainAgent:
    """Base class for domain-specific research agents."""

    def __init__(self, domain: ResearchDomain, parallel_tool: ParallelSearchTool):
        self.domain = domain
        self.parallel_tool = parallel_tool

    async def execute(self, plan: DomainPlan) -> List[SourceRecord]:
        logger.info(f"[{self.domain.value}] Starting search with queries: {plan.searchQueries}")
        try:
            sources = await self.parallel_tool.search(
                queries=plan.searchQueries,
                objective=plan.objective,
                mode="basic",
                max_results_total=6,
            )
            logger.info(f"[{self.domain.value}] Discovered {len(sources)} sources")
            return sources
        except Exception as e:
            logger.error(f"[{self.domain.value}] Search failed: {e}", exc_info=True)
            return []


class FestivalAgent(DomainAgent):
    def __init__(self, parallel_tool: ParallelSearchTool):
        super().__init__(ResearchDomain.FESTIVAL, parallel_tool)


class OrganizerAgent(DomainAgent):
    def __init__(self, parallel_tool: ParallelSearchTool):
        super().__init__(ResearchDomain.ORGANIZER, parallel_tool)


class ParticipantsAgent(DomainAgent):
    def __init__(self, parallel_tool: ParallelSearchTool):
        super().__init__(ResearchDomain.PARTICIPANTS, parallel_tool)


async def run_parallel_domain_agents(
    festival_agent: FestivalAgent,
    organizer_agent: OrganizerAgent,
    participants_agent: ParticipantsAgent,
    plans: dict,
) -> dict:
    """Execute all three domain research agents concurrently via asyncio.gather."""
    f_task = festival_agent.execute(plans[ResearchDomain.FESTIVAL])
    o_task = organizer_agent.execute(plans[ResearchDomain.ORGANIZER])
    p_task = participants_agent.execute(plans[ResearchDomain.PARTICIPANTS])

    f_res, o_res, p_res = await asyncio.gather(f_task, o_task, p_task, return_exceptions=True)

    results = {
        ResearchDomain.FESTIVAL: f_res if isinstance(f_res, list) else [],
        ResearchDomain.ORGANIZER: o_res if isinstance(o_res, list) else [],
        ResearchDomain.PARTICIPANTS: p_res if isinstance(p_res, list) else [],
    }
    return results
