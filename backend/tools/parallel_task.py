import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from parallel import AsyncParallel
from backend.config import settings
from backend.orchestrator.events import EventType, broadcaster
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient
from backend.models import ResearchDomain

logger = logging.getLogger("screened.tools.parallel_task")

async def _fallback_search_and_extract(
    investigation_id: str,
    domain: str,
    entity_info: Dict[str, Any],
    objective: str,
    queries: list[str],
) -> Dict[str, Any]:
    """Fallback to deep Parallel Search and Gemini Claim Extraction when Task API yields 0 claims."""
    logger.info(f"Executing search fallback for domain '{domain}' with {len(queries)} queries")
    try:
        search_tool = ParallelSearchTool()
        gemini = GeminiClient()
        entity_name = entity_info.get("name", "")

        # Expand search queries if needed to ensure comprehensive coverage
        search_queries = list(queries) if queries else []
        if entity_name:
            if domain.upper() == "FESTIVAL":
                search_queries.extend([
                    f"{entity_name} festival official website history founded location editions",
                    f"{entity_name} festival screening venues cinema dates submission fees rules",
                    f"{entity_name} film festival awards winners catalog archive",
                ])
            elif domain.upper() == "ORGANIZER":
                search_queries.extend([
                    f"{entity_name} festival director founder team leadership organizers",
                    f"{entity_name} registered company corporate entity legal name",
                    f"{entity_name} jury members programmers curator contacts",
                ])
            elif domain.upper() == "PARTICIPANTS":
                search_queries.extend([
                    f"{entity_name} filmmaker reviews attendee feedback discussions",
                    f"{entity_name} festival alumni past selections screened films press coverage",
                    f"{entity_name} filmfreeway reviews reddit bifa bafta qualifying",
                ])
            else:
                search_queries.extend([
                    f"{entity_name} {domain.replace('_', ' ')} verified records",
                    f"{entity_name} official documentation details",
                ])

        # Deduplicate queries
        unique_queries = list(dict.fromkeys(search_queries))[:8]

        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.TASK_RUN_PROGRESS,
            agent_name=f"Task-{domain}",
            message=f"Deep searching web across {len(unique_queries)} queries for {domain} intelligence...",
        )

        sources = await search_tool.search(
            queries=unique_queries,
            objective=objective,
            max_results_total=15,
            session_id=investigation_id,
        )

        if not sources:
            logger.warning(f"No web sources found for domain {domain}")
            return {"claims": [], "basis": []}

        # Map domain string to ResearchDomain enum
        domain_enum_map = {
            "FESTIVAL": ResearchDomain.FESTIVAL,
            "ORGANIZER": ResearchDomain.ORGANIZER,
            "PARTICIPANTS": ResearchDomain.PARTICIPANTS,
        }
        res_domain = domain_enum_map.get(domain.upper(), ResearchDomain.FESTIVAL)

        extracted_claims = await gemini.extract_claims_from_sources(
            subject_name=entity_name or "Film Festival",
            sources=sources,
            research_domain=res_domain,
        )

        output_claims = []
        basis = []

        for idx, claim in enumerate(extracted_claims):
            claim_dict = {
                "statement": claim.statement,
                "kind": claim.claimKind.value,
                "subject": entity_name,
                "domain": domain,
                "category": claim.category.value,
                "status": claim.status.value,
                "editionYear": claim.editionYear,
                "attributedTo": claim.attributedTo,
                "evidence": [ev.model_dump() for ev in claim.evidence],
            }
            output_claims.append(claim_dict)

            for ev in claim.evidence:
                basis.append({
                    "field": f"claims[{idx}].statement",
                    "citations": [{
                        "url": ev.sourceUrl,
                        "title": ev.sourceTitle,
                        "excerpts": [ev.exactExcerpt] if ev.exactExcerpt else [],
                    }],
                })

        logger.info(f"Fallback extracted {len(output_claims)} atomic claims for domain {domain}")
        return {"claims": output_claims, "basis": basis}

    except Exception as err:
        logger.exception(f"Search fallback failed for domain {domain}: {err}")
        return {"claims": [], "basis": []}

async def parallel_task_run(
    investigation_id: str,
    domain: str,
    entity_info: Dict[str, Any],
    objective: str,
    queries: list[str],
    processor: str = "core",
    source_policy: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Function Tool for ADK LlmAgents to execute a Parallel Task, with automatic Parallel Search fallback.
    """
    api_key = settings.parallel_api_key
    if not api_key:
        logger.warning("Parallel API key missing, executing search fallback.")
        return await _fallback_search_and_extract(investigation_id, domain, entity_info, objective, queries)

    client = AsyncParallel(api_key=api_key)
    logger.info(f"Starting Parallel Task for domain {domain}")

    try:
        task_input = {
            "entity": entity_info,
            "objective": objective,
            "queries": queries,
        }

        from pydantic import BaseModel
        from backend.models import ClaimKind

        class TaskClaim(BaseModel):
            statement: str
            kind: ClaimKind
            subject: str
            domain: str

        class TaskOutput(BaseModel):
            claims: List[TaskClaim]

        kwargs = {
            "input": task_input,
            "processor": processor,
            "enable_events": True,
            "metadata": {"investigation_id": investigation_id, "domain": domain},
            "task_spec": {
                "output_schema": {
                    "type": "json",
                    "json_schema": TaskOutput.model_json_schema(),
                }
            },
        }
        if source_policy:
            kwargs["source_policy"] = source_policy

        task_run = await client.task_run.create(**kwargs)
        task_run_id = getattr(task_run, "run_id", getattr(task_run, "id", None))

        if not task_run_id:
            raise ValueError(f"Task run creation did not return a valid run_id: {task_run}")

        # Stream events to SSE bridge safely in background/short loop
        try:
            events_stream = await client.task_run.events(task_run_id)
            async for event in events_stream:
                if hasattr(event, "message") and event.message:
                    await broadcaster.emit(
                        investigation_id=investigation_id,
                        event_type=EventType.TASK_RUN_PROGRESS,
                        agent_name=f"Task-{domain}",
                        message=event.message,
                    )
        except Exception as stream_err:
            logger.debug(f"Event streaming finished or skipped for task {task_run_id}: {stream_err}")

        # Wait for the final result with timeout
        res = await asyncio.wait_for(client.task_run.result(task_run_id), timeout=45.0)

        out = getattr(res, "output", None)
        output_claims = []
        basis = []

        if out:
            content = getattr(out, "content", {})
            if isinstance(content, dict):
                output_claims = content.get("claims", [])
            elif isinstance(content, str):
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, dict):
                        output_claims = parsed.get("claims", [])
                except Exception:
                    pass

            raw_basis = getattr(out, "basis", []) or []
            for b in raw_basis:
                if hasattr(b, "model_dump"):
                    basis.append(b.model_dump())
                elif isinstance(b, dict):
                    basis.append(b)

        if output_claims:
            logger.info(f"Parallel Task API succeeded with {len(output_claims)} claims for domain {domain}")
            return {"claims": output_claims, "basis": basis}

        logger.info(f"Parallel Task API returned 0 claims for domain {domain}. Executing deep search fallback...")
        return await _fallback_search_and_extract(investigation_id, domain, entity_info, objective, queries)

    except Exception as e:
        logger.warning(f"Parallel Task API encountered error for domain {domain}: {e}. Falling back to Search + Claim Extractor...")
        return await _fallback_search_and_extract(investigation_id, domain, entity_info, objective, queries)
