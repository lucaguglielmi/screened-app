"""Firestore Native Database Layer with in-memory fallback for Screened."""
import logging
from typing import Any, Dict, List, Optional
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
            logger.error(f"Firestore save_investigation failed: {e}. Writing to memory.", exc_info=True)
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
            logger.error(f"Firestore get_investigation failed: {e}", exc_info=True)
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
            logger.error(f"Firestore save_claims failed: {e}", exc_info=True)
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
            logger.error(f"Firestore get_claims failed: {e}", exc_info=True)
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
            logger.error(f"Firestore save_sources failed: {e}", exc_info=True)
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
            logger.error(f"Firestore get_sources failed: {e}", exc_info=True)
            return self._memory_store["sources"].get(investigation_id, [])


db = Database()
