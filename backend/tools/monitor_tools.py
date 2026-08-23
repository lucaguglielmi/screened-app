import logging
from typing import Dict, Any, List
from google.genai.types import FunctionDeclaration, Tool, Type

logger = logging.getLogger("screened.tools.monitor_tools")

# Parallel API schema functions

def create_festival_monitor(target_url: str, type: str = "snapshot", frequency: str = "weekly") -> str:
    """
    Creates a Parallel Monitor to watch a target festival's webpage or domain for updates.
    
    Args:
        target_url (str): The URL of the festival page to watch.
        type (str): Type of monitor. Can be 'snapshot' (for specific page diffs) or 'event_stream'. Defaults to 'snapshot'.
        frequency (str): Polling frequency. Defaults to 'weekly'.
    """
    logger.info(f"Creating Parallel monitor for {target_url} (type={type}, freq={frequency})")
    # Stub: This will integrate with Parallel SDK `client.monitor.create(...)`
    # We would return the monitor_id from the response.
    return "mon_12345_mock"

def trigger_monitor(monitor_id: str) -> str:
    """
    Force triggers an existing Parallel Monitor to check for updates immediately.
    
    Args:
        monitor_id (str): The ID of the monitor to trigger.
    """
    logger.info(f"Triggering Parallel monitor {monitor_id}")
    # Stub: Integrates with `client.monitor.trigger(monitor_id)`
    return "Triggered successfully"

def create_task_group(monitor_ids: List[str]) -> str:
    """
    Creates a Parallel Task Group for batch operations on a list of monitors or targets.
    
    Args:
        monitor_ids (list): List of monitor IDs to group together.
    """
    logger.info(f"Creating Task Group for {len(monitor_ids)} monitors.")
    # Stub: Integrates with `client.task_group.create(...)`
    return "tg_98765_mock"

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
