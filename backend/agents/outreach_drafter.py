"""Outreach Drafter Agent for generating professional verification inquiries."""
import hashlib
import json
import logging
from typing import Optional
from google.genai import types

from backend.models import (
    AtomicClaim,
    CandidateEntity,
    OutreachDraft,
    ApprovalStatus,
)
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.outreach_drafter")


def compute_payload_hash(recipient: str, subject: str, body: str, claim_id: Optional[str] = None) -> str:
    """Compute deterministic SHA-256 hash of the exact draft payload."""
    payload_str = f"{recipient.strip()}|{subject.strip()}|{body.strip()}|{claim_id or ''}"
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()


class OutreachDrafterAgent:
    """Drafts clear, neutral verification inquiry emails regarding specific claims or disputes."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def draft_inquiry(
        self,
        investigation_id: str,
        entity: CandidateEntity,
        claim: Optional[AtomicClaim] = None,
        target_type: str = "FESTIVAL_ORGANIZER",
        custom_note: Optional[str] = None,
    ) -> OutreachDraft:
        logger.info(f"Drafting outreach inquiry for {entity.name} (target={target_type})")

        claim_context = claim.statement if claim else "General festival verification & screening inquiry"
        claim_category = claim.category.value if claim else "GENERAL"

        prompt = f"""
You are the Outreach Assistant for an independent filmmaker considering submitting a film to {entity.name}.
Write a polite, professional, and concise email inquiry to clarify a specific point of information before submitting.

Target Recipient Type: {target_type} (e.g. Festival Submissions Team or Venue Box Office)
Festival Name: {entity.name}
Festival Domain: {entity.officialDomain or 'official festival portal'}
Specific Point to Clarify: "{claim_context}" (Category: {claim_category})
Filmmaker Specific Notes: "{custom_note or 'None'}"

CRITICAL REQUIREMENTS:
1. Highly polite, professional, and respectful tone.
2. Direct and concise (under 120 words).
3. Clearly state the inquiry (e.g., confirming physical screening venue, DCP projection format, or premiere eligibility criteria).
4. Include placeholder contact information for the filmmaker.

Return a JSON object:
{{
  "recipientName": "Festival Submissions Coordinator",
  "recipientEmail": "submissions@{entity.officialDomain or 'festival.org'}",
  "subject": "Inquiry regarding {entity.name} 2026 Submission - [Film Title]",
  "body": "Dear {entity.name} Team,\\n\\nI am preparing to submit my independent short/feature film to your upcoming edition and would appreciate a quick clarification regarding...\\n\\nThank you for your time and guidance.\\n\\nBest regards,\\n[Filmmaker Name]\\n[Contact Info]"
}}
"""
        try:
            response = self.gemini.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            raw = json.loads(response.text or "{}")

            recipient_email = raw.get("recipientEmail", f"submissions@{entity.officialDomain or 'festival.org'}")
            recipient_name = raw.get("recipientName", "Festival Submissions Coordinator")
            subject = raw.get("subject", f"Inquiry regarding {entity.name} Submission")
            body = raw.get("body", f"Dear {entity.name} Team,\n\nI would like to clarify submission details for your upcoming edition.\n\nBest regards,\n[Filmmaker Name]")

            payload_hash = compute_payload_hash(
                recipient=recipient_email,
                subject=subject,
                body=body,
                claim_id=claim.id if claim else None,
            )

            return OutreachDraft(
                investigationId=investigation_id,
                claimId=claim.id if claim else None,
                targetAudience=target_type,
                recipientEmail=recipient_email,
                recipientName=recipient_name,
                subject=subject,
                body=body,
                payloadHash=payload_hash,
                status=ApprovalStatus.PENDING_APPROVAL,
            )

        except Exception as e:
            logger.error(f"Outreach drafting failed: {e}", exc_info=True)
            fallback_body = f"Dear {entity.name} Submissions Team,\n\nI am preparing to submit my project and would like to confirm your screening format and venue details.\n\nBest regards,\n[Filmmaker Name]"
            fallback_hash = compute_payload_hash(
                recipient=f"info@{entity.officialDomain or 'festival.org'}",
                subject=f"Inquiry: {entity.name} Submission Details",
                body=fallback_body,
                claim_id=claim.id if claim else None,
            )
            return OutreachDraft(
                investigationId=investigation_id,
                claimId=claim.id if claim else None,
                targetAudience=target_type,
                recipientEmail=f"info@{entity.officialDomain or 'festival.org'}",
                recipientName="Festival Management",
                subject=f"Inquiry: {entity.name} Submission Details",
                body=fallback_body,
                payloadHash=fallback_hash,
                status=ApprovalStatus.PENDING_APPROVAL,
            )
