import asyncio
import logging
from typing import Dict, Any, Optional
from parallel import AsyncParallel
from backend.config import settings
from backend.orchestrator.events import EventType, broadcaster

logger = logging.getLogger("screened.tools.parallel_task")

async def parallel_task_run(
    investigation_id: str,
    domain: str,
    entity_info: Dict[str, Any],
    objective: str,
    queries: list[str],
    processor: str = "core",
) -> Dict[str, Any]:
    """
    Function Tool for ADK LlmAgents to execute a Parallel Task.
    """
    api_key = settings.parallel_api_key
    if not api_key:
        logger.warning("Parallel API key missing, returning mocked task result.")
        return {"status": "mocked", "claims": []}

    client = AsyncParallel(api_key=api_key)
    
    logger.info(f"Starting Parallel Task for domain {domain}")
    try:
        task_input = {
            "entity": entity_info,
            "objective": objective,
            "queries": queries
        }
        
        # Pydantic models for output schema
        from pydantic import BaseModel, Field
        from typing import List
        from backend.models import ClaimKind, ResearchDomain
        
        class TaskClaim(BaseModel):
            statement: str
            kind: ClaimKind
            subject: str
            domain: str
            
        class TaskOutput(BaseModel):
            claims: List[TaskClaim]
            
        task_run = await client.task_run.create(
            input=task_input,
            processor=processor,
            enable_events=True,
            metadata={"investigation_id": investigation_id, "domain": domain},
            task_spec={
                "output_schema": {
                    "type": "json",
                    "json_schema": TaskOutput.model_json_schema()
                }
            }
        )
        
        task_run_id = task_run.id
        
        # Stream events to SSE bridge
        async for event in await client.task_run.events(task_run_id):
            if hasattr(event, "message") and event.message:
                await broadcaster.emit(
                    investigation_id=investigation_id,
                    event_type=EventType.SEARCH_STARTED,
                    agent_name=f"Task-{domain}",
                    message=event.message
                )
                
        # Wait for the final result
        res = await client.task_run.result(task_run_id)
        
        # Parse the structured output
        out = res.output
        output_claims = (out.content or {}).get("claims", []) if out else []
        
        # In a real impl, we'd serialize basis to dicts
        basis = [b.model_dump() for b in (out.basis or [])] if out else []
        
        return {"claims": output_claims, "basis": basis}
        
    except Exception as e:
        logger.error(f"Parallel Task API failed: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
