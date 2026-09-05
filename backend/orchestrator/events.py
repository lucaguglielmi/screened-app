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
from backend.models import EventType, ActivityEvent

logger = logging.getLogger(__name__)


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
                logger.exception(f"Failed to replay event: {e}")

        return queue

    def unsubscribe(self, investigation_id: str, queue: asyncio.Queue) -> None:
        if investigation_id in self._listeners:
            try:
                self._listeners[investigation_id].remove(queue)
                if not self._listeners[investigation_id]:
                    del self._listeners[investigation_id]
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
        seen_event_ids = set()
        try:
            while True:
                try:
                    event: ActivityEvent = await asyncio.wait_for(queue.get(), timeout=2.5)
                    if event.id not in seen_event_ids:
                        seen_event_ids.add(event.id)
                        payload = json.dumps(event.model_dump())
                        yield f"event: message\ndata: {payload}\n\n"
                    queue.task_done()
                except asyncio.TimeoutError:
                    # Multi-instance synchronization check:
                    # Query Firestore/DB for events saved by worker containers
                    try:
                        persisted_events = await db.get_events(investigation_id)
                        for evt_data in persisted_events:
                            eid = evt_data.get("id")
                            if eid and eid not in seen_event_ids:
                                seen_event_ids.add(eid)
                                try:
                                    evt = ActivityEvent(**evt_data)
                                    payload = json.dumps(evt.model_dump())
                                    yield f"event: message\ndata: {payload}\n\n"
                                except Exception:
                                    pass
                    except Exception as sync_err:
                        logger.debug(f"Cross-instance event sync check error: {sync_err}")

                    # Heartbeat comment to keep Cloud Run connection active
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self.unsubscribe(investigation_id, queue)


broadcaster = EventBroadcaster()
