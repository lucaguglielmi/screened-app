import logging
from typing import Dict, Any, List
from google.genai.types import FunctionDeclaration, Tool, Type

logger = logging.getLogger("screened.tools.monitor_tools")

# Parallel API schema functions

async def create_festival_monitor(target_url: str, type: str = "snapshot", frequency: str = "weekly") -> str:
    """
    Creates a Parallel Monitor to watch a target festival's webpage or domain for updates.
    
    Args:
        target_url (str): The URL of the festival page to watch.
        type (str): Type of monitor. Can be 'snapshot' (for specific page diffs) or 'event_stream'. Defaults to 'snapshot'.
        frequency (str): Polling frequency. Defaults to 'weekly'.
    """
    logger.info(f"Creating Parallel monitor for {target_url} (type={type}, freq={frequency})")
    from backend.config import settings
    from parallel import AsyncParallel
    import os
    
    api_key = settings.parallel_api_key
    if not api_key:
        logger.warning("Parallel API key missing, create_festival_monitor fails.")
        return "PARALLEL_API_KEY missing. Monitor is unavailable."

    client = AsyncParallel(api_key=api_key)
    # Best-effort base URL detection
    base_url = "https://screened-hackathon.a.run.app" if settings.environment == "production" else "https://localhost:8000"
    webhook_url = f"{base_url}/api/webhooks/parallel"

    try:
        res = await client.beta.monitor.create(
            frequency=frequency,
            type=type,
            processor="lite",
            webhook={"url": webhook_url},
            target={"url": target_url}
        )
        # res.id if it's an object, else dict access
        monitor_id = getattr(res, "id", None) or (res.get("id") if isinstance(res, dict) else str(res))
        return f"Created monitor {monitor_id}"
    except Exception as e:
        logger.exception(f"Failed to create monitor: {e}")
        return f"Failed to create monitor: {e}"

async def trigger_monitor(monitor_id: str) -> str:
    """
    Force triggers an existing Parallel Monitor to check for updates immediately.
    
    Args:
        monitor_id (str): The ID of the monitor to trigger.
    """
    logger.info(f"Triggering Parallel monitor {monitor_id}")
    from backend.config import settings
    from parallel import AsyncParallel
    
    api_key = settings.parallel_api_key
    if not api_key:
        return "PARALLEL_API_KEY missing."

    client = AsyncParallel(api_key=api_key)
    try:
        await client.beta.monitor.trigger(monitor_id)
        return "Triggered successfully"
    except Exception as e:
        logger.exception(f"Failed to trigger monitor: {e}")
        return f"Failed to trigger monitor: {e}"

async def create_task_group(monitor_ids: List[str]) -> str:
    """
    Creates a Parallel Task Group for batch operations on a list of monitors or targets.
    
    Args:
        monitor_ids (list): List of monitor IDs to group together.
    """
    logger.info(f"Creating Task Group for {len(monitor_ids)} monitors.")
    from backend.config import settings
    from parallel import AsyncParallel
    
    api_key = settings.parallel_api_key
    if not api_key:
        return "PARALLEL_API_KEY missing."

    client = AsyncParallel(api_key=api_key)
    try:
        # Creating a task group (assuming the SDK supports beta.task_group.create)
        res = await client.beta.task_group.create(items=[{"type": "monitor", "id": mid} for mid in monitor_ids])
        tg_id = getattr(res, "id", None) or (res.get("id") if isinstance(res, dict) else str(res))
        return f"Created task group {tg_id}"
    except Exception as e:
        logger.exception(f"Failed to create task group: {e}")
        return f"Failed to create task group: {e}"

# ADK Tool Definitions

create_festival_monitor_tool = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="create_festival_monitor",
            description="Creates a Parallel Monitor to watch a target festival's webpage or domain for updates.",
            parameters={
                "type": Type.OBJECT,
                "properties": {
                    "target_url": {"type": Type.STRING, "description": "The URL of the festival page to watch."},
                    "type": {"type": Type.STRING, "description": "Type of monitor. Can be 'snapshot' or 'event_stream'."},
                    "frequency": {"type": Type.STRING, "description": "Polling frequency. Defaults to 'weekly'."},
                },
                "required": ["target_url"],
            }
        )
    ]
)

trigger_monitor_tool = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="trigger_monitor",
            description="Force triggers an existing Parallel Monitor to check for updates immediately.",
            parameters={
                "type": Type.OBJECT,
                "properties": {
                    "monitor_id": {"type": Type.STRING, "description": "The ID of the monitor to trigger."},
                },
                "required": ["monitor_id"],
            }
        )
    ]
)

create_task_group_tool = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="create_task_group",
            description="Creates a Parallel Task Group for batch operations on a list of monitors.",
            parameters={
                "type": Type.OBJECT,
                "properties": {
                    "monitor_ids": {
                        "type": Type.ARRAY, 
                        "items": {"type": Type.STRING},
                        "description": "List of monitor IDs to group together."
                    },
                },
                "required": ["monitor_ids"],
            }
        )
    ]
)
