"""Firestore Native Database Layer with in-memory fallback for Screened."""
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from google.cloud import firestore
from backend.config import settings
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    SourceRecord,
)

logger = logging.getLogger("screened.db.firestore")


class Database:
    """Firestore repository with in-memory fallback for local dev / tests."""

    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or settings.google_cloud_project
        self.use_memory = False
        self._memory_store: Dict[str, Dict[str, Any]] = {
            "investigations": {},
            "entities": {},
            "sources": {},
            "claims": {},
            "events": {},
            "feedback": {},
        }

        try:
            self.client = firestore.Client(project=self.project_id)
            logger.info(f"Connected to Cloud Firestore (project={self.project_id})")
        except Exception as e:
            logger.warning(f"Could not connect to live Firestore: {e}. Using in-memory store.")
            self.use_memory = True
            self.client = None

    async def save_investigation(self, investigation_id: str, data: Dict[str, Any]) -> None:
        if self.use_memory or not self.client:
            self._memory_store["investigations"][investigation_id] = data
            return
        try:
            self.client.collection("investigations").document(investigation_id).set(data, merge=True)
        except Exception as e:
            logger.exception(f"Firestore save_investigation failed: {e}. Writing to memory.")
            self._memory_store["investigations"][investigation_id] = data

    async def get_investigation(self, investigation_id: str) -> Optional[Dict[str, Any]]:
        if self.use_memory or not self.client:
            return self._memory_store["investigations"].get(investigation_id)
        try:
            doc = self.client.collection("investigations").document(investigation_id).get()
            if doc.exists:
                return doc.to_dict()
            return self._memory_store["investigations"].get(investigation_id)
        except Exception as e:
            logger.exception(f"Firestore get_investigation failed: {e}")
            return self._memory_store["investigations"].get(investigation_id)

    async def save_claims(self, investigation_id: str, claims: List[AtomicClaim]) -> None:
        if self.use_memory or not self.client:
            self._memory_store["claims"][investigation_id] = [c.model_dump() for c in claims]
            return
        try:
            batch = self.client.batch()
            for c in claims:
                doc_ref = self.client.collection("claims").document(c.id)
                data = c.model_dump()
                data["investigationId"] = investigation_id
                batch.set(doc_ref, data)
            batch.commit()
        except Exception as e:
            logger.exception(f"Firestore save_claims failed: {e}")
            self._memory_store["claims"][investigation_id] = [c.model_dump() for c in claims]

    async def get_claims(self, investigation_id: str) -> List[Dict[str, Any]]:
        if self.use_memory or not self.client:
            return self._memory_store["claims"].get(investigation_id, [])
        try:
            docs = self.client.collection("claims").where("investigationId", "==", investigation_id).stream()
            res = [d.to_dict() for d in docs]
            if not res:
                return self._memory_store["claims"].get(investigation_id, [])
            return res
        except Exception as e:
            logger.exception(f"Firestore get_claims failed: {e}")
            return self._memory_store["claims"].get(investigation_id, [])

    async def save_sources(self, investigation_id: str, sources: List[SourceRecord]) -> None:
        if self.use_memory or not self.client:
            self._memory_store["sources"][investigation_id] = [s.model_dump() for s in sources]
            return
        try:
            batch = self.client.batch()
            for s in sources:
                doc_ref = self.client.collection("sources").document(s.id)
                data = s.model_dump()
                data["investigationId"] = investigation_id
                batch.set(doc_ref, data)
            batch.commit()
        except Exception as e:
            logger.exception(f"Firestore save_sources failed: {e}")
            self._memory_store["sources"][investigation_id] = [s.model_dump() for s in sources]

    async def get_sources(self, investigation_id: str) -> List[Dict[str, Any]]:
        if self.use_memory or not self.client:
            return self._memory_store["sources"].get(investigation_id, [])
        try:
            docs = self.client.collection("sources").where("investigationId", "==", investigation_id).stream()
            res = [d.to_dict() for d in docs]
            if not res:
                return self._memory_store["sources"].get(investigation_id, [])
            return res
        except Exception as e:
            logger.exception(f"Firestore get_sources failed: {e}")
            return self._memory_store["sources"].get(investigation_id, [])

    async def save_event(self, investigation_id: str, event_data: Dict[str, Any]) -> None:
        if self.use_memory or not self.client:
            if investigation_id not in self._memory_store["events"]:
                self._memory_store["events"][investigation_id] = []
            self._memory_store["events"][investigation_id].append(event_data)
            return
        try:
            doc_ref = self.client.collection("events").document(event_data["id"])
            batch = self.client.batch()
            batch.set(doc_ref, event_data)
            batch.commit()
        except Exception as e:
            logger.exception(f"Firestore save_event failed: {e}")
            if investigation_id not in self._memory_store["events"]:
                self._memory_store["events"][investigation_id] = []
            self._memory_store["events"][investigation_id].append(event_data)

    def _parse_ts(self, ts: Any) -> float:
        if isinstance(ts, (int, float)):
            return float(ts)
        elif isinstance(ts, str):
            try:
                return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
            except Exception:
                pass
        return 0.0

    async def get_events(self, investigation_id: str) -> List[Dict[str, Any]]:
        if self.use_memory or not self.client:
            res = self._memory_store["events"].get(investigation_id, [])
            return sorted(res, key=lambda x: self._parse_ts(x.get("timestamp")))
        try:
            docs = self.client.collection("investigations").document(investigation_id).collection("events").stream()
            res = [d.to_dict() for d in docs]
            if not res:
                return self._memory_store["events"].get(investigation_id, [])
            return sorted(res, key=lambda x: self._parse_ts(x.get("timestamp")))
        except Exception as e:
            logger.exception(f"Firestore get_events failed: {e}")
            return self._memory_store["events"].get(investigation_id, [])

    async def save_feedback_item(self, feedback: Any) -> None:
        data = feedback.model_dump() if hasattr(feedback, "model_dump") else feedback
        feedback_id = data.get("id")
        
        if self.use_memory or not self.client:
            self._memory_store["feedback"][feedback_id] = data
            return
        try:
            self.client.collection("feedback").document(feedback_id).set(data)
        except Exception as e:
            logger.exception(f"Firestore save_feedback_item failed: {e}")
            self._memory_store["feedback"][feedback_id] = data

    async def get_all_feedback_items(self) -> List[Dict[str, Any]]:
        if self.use_memory or not self.client:
            return sorted(list(self._memory_store["feedback"].values()), key=lambda x: self._parse_ts(x.get("timestamp")), reverse=True)
        try:
            docs = self.client.collection("feedback").stream()
            res = [d.to_dict() for d in docs]
            if not res:
                return sorted(list(self._memory_store["feedback"].values()), key=lambda x: self._parse_ts(x.get("timestamp")), reverse=True)
            return sorted(res, key=lambda x: self._parse_ts(x.get("timestamp")), reverse=True)
        except Exception as e:
            logger.exception(f"Firestore get_all_feedback_items failed: {e}")
            return sorted(list(self._memory_store["feedback"].values()), key=lambda x: self._parse_ts(x.get("timestamp")), reverse=True)


db = Database()
