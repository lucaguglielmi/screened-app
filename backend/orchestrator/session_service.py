import uuid
import logging
from typing import Any, Optional

from google.adk.sessions import BaseSessionService, Session
from google.adk.sessions.base_session_service import GetSessionConfig, ListSessionsResponse
from google.adk.events.event import Event
from backend.db.firestore import db

logger = logging.getLogger("screened.orchestrator.session_service")

class FirestoreSessionService(BaseSessionService):
    """
    Persists ADK sessions, state, and events to the existing Firestore collections.
    session_id = investigation_id.
    """

    async def create_session(
        self,
        *,
        app_name: str,
        user_id: str,
        state: Optional[dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ) -> Session:
        sid = session_id or str(uuid.uuid4())
        session = Session(
            id=sid,
            app_name=app_name,
            user_id=user_id,
            state=state or {}
        )
        
        # We only save the ADK specific fields here. The rest of the investigation 
        # fields will be set by the Orchestrator/state_machine projection.
        await db.save_investigation(sid, {
            "id": sid,
            "adkAppName": app_name,
            "userId": user_id,
            "state": session.state
        })
        return session

    async def get_session(
        self,
        *,
        app_name: str,
        user_id: str,
        session_id: str,
        config: Optional[GetSessionConfig] = None,
    ) -> Optional[Session]:
        data = await db.get_investigation(session_id)
        if not data:
            return None
        
        session = Session(
            id=session_id,
            app_name=app_name,
            user_id=user_id,
            state=data.get("state", {})
        )
        
        # Load events
        raw_events = await db.get_events(session_id)
        for r in raw_events:
            if "event_type" not in r and "source" in r:  # Basic check if this is an ADK event vs legacy event
                try:
                    ev = Event.model_validate(r)
                    session.events.append(ev)
                except Exception as e:
                    logger.debug(f"Skipping non-ADK event: {e}")
                    
        return session

    async def list_sessions(
        self, *, app_name: str, user_id: Optional[str] = None
    ) -> ListSessionsResponse:
        # We don't currently list sessions via ADK in this app
        return ListSessionsResponse(sessions=[])

    async def delete_session(
        self, *, app_name: str, user_id: str, session_id: str
    ) -> None:
        pass # Not required for current flows

    async def append_event(self, session: Session, event: Event) -> Event:
        ev = await super().append_event(session, event)
        if ev.partial:
            return ev

        # Persist event
        event_dict = ev.model_dump(exclude_none=True, by_alias=True)
        event_dict["id"] = ev.id or str(uuid.uuid4())
        event_dict["investigationId"] = session.id
        await db.save_event(session.id, event_dict)
        
        # Persist updated state to investigation
        await db.save_investigation(session.id, {
            "state": session.state
        })
        
        return ev

    async def save_session(self, session: Session) -> None:
        """Saves the session state directly, avoiding ADK's event-only mutation requirement."""
        await db.save_investigation(session.id, {
            "state": session.state
        })
