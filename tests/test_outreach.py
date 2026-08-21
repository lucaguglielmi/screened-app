"""Unit tests for Outreach Drafter, SHA-256 Hashing, and Sandbox Approval."""
import pytest
from backend.models import (
    ApprovalStatus,
    AtomicClaim,
    CandidateEntity,
    ClaimKind,
    QuestionCategory,
    ResearchDomain,
)
from backend.agents.outreach_drafter import compute_payload_hash
from backend.services.approval_service import ApprovalService, approval_service


def test_payload_hash_consistency():
    recipient = "submissions@raindance.org"
    subject = "Inquiry: Premiere Policy"
    body = "Dear Team, can you confirm premiere rules?"
    claim_id = "claim-123"

    hash_1 = compute_payload_hash(recipient, subject, body, claim_id)
    hash_2 = compute_payload_hash(recipient, subject, body, claim_id)
    assert hash_1 == hash_2
    assert len(hash_1) == 64  # SHA-256 hex length

    # Modifying body should change hash
    modified_hash = compute_payload_hash(recipient, subject, body + " Extra text", claim_id)
    assert hash_1 != modified_hash


@pytest.mark.asyncio
async def test_approval_and_sandbox_execution():
    service = ApprovalService()
    entity = CandidateEntity(name="Test Fest", officialDomain="testfest.org", descriptor="Test")
    
    from backend.models import OutreachDraft
    draft = OutreachDraft(
        investigationId="inv-test-1",
        recipientEmail="contact@testfest.org",
        recipientName="Coordinator",
        subject="Clarification",
        body="Body text",
        payloadHash=compute_payload_hash("contact@testfest.org", "Clarification", "Body text"),
        status=ApprovalStatus.PENDING_APPROVAL,
    )
    await service.save_draft(draft)

    # Valid approval with matching hash
    executed_draft = await service.approve_and_sandbox_send(draft.id, draft.payloadHash)
    assert executed_draft.status == ApprovalStatus.EXECUTED_SANDBOX
    assert executed_draft.executedAt is not None

    # Invalid approval with tampered hash should fail
    with pytest.raises(ValueError):
        await service.approve_and_sandbox_send(draft.id, "tampered_hash_1234567890abcdef")
