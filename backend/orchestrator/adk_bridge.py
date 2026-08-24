import logging
from typing import Any, AsyncGenerator

from google.adk.events.event import Event
from backend.orchestrator.events import EventType, broadcaster
from backend.models import InvestigationStatus

logger = logging.getLogger("screened.orchestrator.adk_bridge")

async def pump_adk_events(investigation_id: str, runner_stream: AsyncGenerator[Event, None]) -> None:
    """
    Consumes runner.run_async(...) events plus agent/tool callbacks and 
    translates them onto the existing broadcaster.
    """
    try:
        async for event in runner_stream:
            # We skip partial events for the broad strokes, 
            # but model deltas are handled via streaming callback or here if we prefer.
            if event.partial:
                # Could emit TOKEN events here if the event contains model text delta
                if event.source and event.source.agent_name == "producer_desk":
                    # Producer Desk streaming handled separately or here
                    pass
                continue
                
            # Let's map ADK events to SSE events based on the Spec.
            if event.actions and getattr(event.actions, "error", None):
                await broadcaster.emit(
                    investigation_id=investigation_id,
                    event_type=EventType.ERROR,
                    agent_name=event.source.agent_name if event.source else "ADK",
                    message=f"Agent error: {event.actions.error}"
                )

            # We can also detect tool call completions, etc.
            # But according to spec, we use `before_agent_callback`, `before_tool_callback` etc.
            # to emit these events. So maybe `adk_bridge` exposes those callbacks instead!
            
    except Exception as e:
        logger.exception(f"Error pumping ADK events for {investigation_id}: {e}")
        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.ERROR,
            agent_name="Orchestrator",
            message=f"ADK runner error: {str(e)}"
        )


def make_agent_callbacks(investigation_id: str):
    """
    Returns callbacks for LlmAgent/SequentialAgent/ParallelAgent 
    to bridge to our broadcaster.
    """
    async def before_agent(agent_name: str, context: Any, **kwargs):
        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.PLANNING_STARTED, # Map properly based on agent_name later
            agent_name=agent_name,
            message=f"Agent {agent_name} starting..."
        )

    async def after_agent(agent_name: str, context: Any, **kwargs):
        pass
        
    return before_agent, after_agent

def make_tool_callbacks(investigation_id: str):
    async def before_tool(tool_name: str, context: Any, **kwargs):
        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.DOMAIN_SEARCH_STARTED,
            agent_name="Parallel Tool",
            message=f"Executing tool {tool_name}..."
        )
    async def after_tool(tool_name: str, context: Any, **kwargs):
        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.DOMAIN_SEARCH_COMPLETED,
            agent_name="Parallel Tool",
            message=f"Completed tool {tool_name}."
        )
    return before_tool, after_tool

def offline_model_callback(agent_name: str, **kwargs):
    """Bypasses LLM in test/offline environments."""
    pass
