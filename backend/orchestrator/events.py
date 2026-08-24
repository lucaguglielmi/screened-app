"""Event streaming system using Server-Sent Events (SSE) for real-time investigation progress."""
import asyncio
import json
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel, Field
import uuid
from backend.db.firestore import db

logger = logging.getLogger("screened.orchestrator.events")


class EventType(str, Enum):
    INVESTIGATION_STARTED = "INVESTIGATION_STARTED"
    DISAMBIGUATING = "DISAMBIGUATING"
    CANDIDATES_FOUND = "CANDIDATES_FOUND"
    ENTITY_CONFIRMED = "ENTITY_CONFIRMED"
    PLANNING_STARTED = "PLANNING_STARTED"
    PLAN_READY = "PLAN_READY"
    DOMAIN_SEARCH_STARTED = "DOMAIN_SEARCH_STARTED"
    DOMAIN_SEARCH_COMPLETED = "DOMAIN_SEARCH_COMPLETED"
    CLAIMS_EXTRACTING = "CLAIMS_EXTRACTING"
    CLAIMS_EXTRACTED = "CLAIMS_EXTRACTED"
    CONTRADICTIONS_ANALYZING = "CONTRADICTIONS_ANALYZING"
    CONTRADICTION_DETECTED = "CONTRADICTION_DETECTED"
    DOSSIER_SYNTHESIZING = "DOSSIER_SYNTHESIZING"
    DEEP_VETTING_ANALYZING = "DEEP_VETTING_ANALYZING"
    DEEP_VETTING_COMPLETED = "DEEP_VETTING_COMPLETED"
    DOSSIER_READY = "DOSSIER_READY"
    WATCHDOG_ESCALATION = "WATCHDOG_ESCALATION"
    WATCH_EVENT_RECEIVED = "WATCH_EVENT_RECEIVED"
    TASK_RUN_PROGRESS = "TASK_RUN_PROGRESS"
    TASK_RUN_SOURCE_STATS = "TASK_RUN_SOURCE_STATS"
    ERROR = "ERROR"


class ActivityEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investigationId: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    eventType: EventType
    agentName: str
    message: str
    details: Optional[Dict] = None


class EventBroadcaster:
    """Pub/sub queue manager for Server-Sent Events."""

    def __init__(self):
        self._listeners: Dict[str, List[asyncio.Queue]] = {}
        self._history: Dict[str, List[ActivityEvent]] = {}

    async def subscribe(self, investigation_id: str) -> asyncio.Queue:
        if investigation_id not in self._listeners:
            self._listeners[investigation_id] = []
        queue: asyncio.Queue = asyncio.Queue()
        self._listeners[investigation_id].append(queue)
        
        # Replay past events to new subscriber
        past_events = await db.get_events(investigation_id)
        for evt_data in past_events:
            try:
                evt = ActivityEvent(**evt_data)
                queue.put_nowait(evt)
            except Exception as e:
                logger.error(f"Failed to replay event: {e}", exc_info=True)

        return queue

    def unsubscribe(self, investigation_id: str, queue: asyncio.Queue) -> None:
        if investigation_id in self._listeners:
            try:
                self._listeners[investigation_id].remove(queue)
                if not self._listeners[investigation_id]:
                    del self._listeners[investigation_id]
                    # No more active clients listening to this SSE, cancel any running background tasks
                    from backend.orchestrator.state_machine import orchestrator
                    orchestrator.cancel_task(investigation_id)
            except ValueError:
                pass

    async def emit(
        self,
        investigation_id: str,
        event_type: EventType,
        agent_name: str,
        message: str,
        details: Optional[Dict] = None,
    ) -> ActivityEvent:
        event = ActivityEvent(
            investigationId=investigation_id,
            eventType=event_type,
            agentName=agent_name,
            message=message,
            details=details,
        )

        await db.save_event(investigation_id, event.model_dump())

        logger.info(f"[{investigation_id}] [{agent_name}] {event_type.value}: {message}")

        listeners = self._listeners.get(investigation_id, [])
        for queue in listeners:
            await queue.put(event)

        return event

    async def event_generator(self, investigation_id: str) -> AsyncGenerator[str, None]:
        queue = await self.subscribe(investigation_id)
        try:
            while True:
                event: ActivityEvent = await queue.get()
                payload = json.dumps(event.model_dump())
                yield f"event: message\ndata: {payload}\n\n"
                queue.task_done()
        except asyncio.CancelledError:
            pass
        finally:
            self.unsubscribe(investigation_id, queue)


broadcaster = EventBroadcaster()
