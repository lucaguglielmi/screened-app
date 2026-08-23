import asyncio
import logging
from typing import Dict, Any, List, Optional
from parallel import AsyncParallel
from backend.config import settings

logger = logging.getLogger("screened.tools.findall_tools")

async def findall_search(
    intent: str,
    criteria_fields: List[Dict[str, str]],
) -> Dict[str, Any]:
    """
    Search for entities (e.g. film festivals) matching specific criteria using the Parallel FindAll API.
    
    Args:
        intent: Description of what you are looking for (e.g. 'film festivals')
        criteria_fields: List of criteria dicts, e.g. [{"field": "name", "description": "festival name"}]
    """
    api_key = settings.parallel_api_key
    if not api_key:
        logger.warning("Parallel API key missing, findall_search fails.")
        raise RuntimeError("PARALLEL_API_KEY missing. FindAll is unavailable.")

    client = AsyncParallel(api_key=api_key)
    logger.info(f"Starting FindAll search with intent: {intent}")
    try:
        # P-05: We use entity_search instead of create for simple direct searches if possible,
        # but the spec says `findall.create / entity_search from FilmProfile`. 
        result = await client.beta.findall.create(
            intent=intent,
            criteria=criteria_fields,
            schemas={}
        )
        # Parse the result or return it raw
        # The result might be a pydantic model in the SDK, let's just return a dict
        return {"status": "success", "data": result.model_dump() if hasattr(result, "model_dump") else result}
    except Exception as e:
        logger.error(f"FindAll search failed: {e}")
        raise RuntimeError(f"FindAll API failed: {e}")

async def findall_enrich(
    entities: List[str],
    schemas: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Enrich a list of entity names with additional structured fields (e.g. deadline, fee range) using the Parallel FindAll API.
    
    Args:
        entities: List of entity names to enrich
        schemas: JSON schema dict describing the fields to extract per entity
    """
    api_key = settings.parallel_api_key
    if not api_key:
        logger.warning("Parallel API key missing, findall_enrich fails.")
        raise RuntimeError("PARALLEL_API_KEY missing. FindAll is unavailable.")

    client = AsyncParallel(api_key=api_key)
    logger.info(f"Starting FindAll enrich for {len(entities)} entities")
    try:
        result = await client.beta.findall.enrich(
            entities=entities,
            schemas=schemas
        )
        return {"status": "success", "data": result.model_dump() if hasattr(result, "model_dump") else result}
    except Exception as e:
        logger.error(f"FindAll enrich failed: {e}")
        raise RuntimeError(f"FindAll enrich API failed: {e}")
