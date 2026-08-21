"""Approval and Sandbox Outreach Delivery Service."""
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from backend.db.firestore import db
from backend.models import (
    ApprovalStatus,
    OutreachDraft,
)
from backend.agents.outreach_drafter import compute_payload_hash

logger = logging.getLogger("screened.services.approval")


class ApprovalService:
    """Manages exact-payload SHA-256 approval verification and safe sandbox dispatch."""

    def __init__(self):
        self._drafts: Dict[str, OutreachDraft] = {}

    async def save_draft(self, draft: OutreachDraft) -> OutreachDraft:
        self._drafts[draft.id] = draft
        # Also persist to Firestore if available
        inv_data = await db.get_investigation(draft.investigationId) or {}
        drafts_list = inv_data.get("outreachDrafts", [])
        drafts_list.append(draft.model_dump())
        inv_data["outreachDrafts"] = drafts_list
        await db.save_investigation(draft.investigationId, inv_data)
        logger.info(f"Saved outreach draft {draft.id} with hash {draft.payloadHash}")
        return draft

    async def get_draft(self, draft_id: str) -> Optional[OutreachDraft]:
        return self._drafts.get(draft_id)

    async def approve_and_sandbox_send(
        self,
        draft_id: str,
        submitted_hash: str,
    ) -> OutreachDraft:
        """Verify SHA-256 payload hash and execute sandbox simulated delivery."""
        draft = await self.get_draft(draft_id)
        if not draft:
            raise ValueError(f"Draft {draft_id} not found")

        # Verify exact cryptographic payload hash
        recalculated_hash = compute_payload_hash(
            recipient=draft.recipientEmail,
            subject=draft.subject,
            body=draft.body,
            claim_id=draft.claimId,
        )

        if submitted_hash != draft.payloadHash or submitted_hash != recalculated_hash:
            logger.error(f"Hash mismatch! Submitted: {submitted_hash}, Calculated: {recalculated_hash}")
            raise ValueError("Exact payload hash mismatch! The draft content was modified or tampered with.")

        # Mark as approved and sandbox executed
        draft.status = ApprovalStatus.EXECUTED_SANDBOX
        draft.executedAt = datetime.now(timezone.utc).isoformat()
        self._drafts[draft_id] = draft

        # Persist updated status
        inv_data = await db.get_investigation(draft.investigationId) or {}
        drafts_list = inv_data.get("outreachDrafts", [])
        for i, d in enumerate(drafts_list):
            if d.get("id") == draft_id:
                drafts_list[i] = draft.model_dump()
                break
        inv_data["outreachDrafts"] = drafts_list
        await db.save_investigation(draft.investigationId, inv_data)

        logger.info(f"Draft {draft_id} successfully executed in SANDBOX mode (zero external SMTP traffic).")
        return draft


approval_service = ApprovalService()
