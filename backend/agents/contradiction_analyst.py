"""Contradiction Analyst Agent for detecting conflicting claims and evidence."""
import json
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from google.genai import types
import uuid

from backend.models import AtomicClaim, ClaimEvidence, VerificationStatus, DisputeRecord
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.contradiction_analyst")


class ContradictionAnalystAgent:
    """Analyzes claims to surface direct factual or narrative contradictions."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def analyze(
        self,
        subject_name: str,
        claims: List[AtomicClaim],
    ) -> List[DisputeRecord]:
        if len(claims) < 2:
            return []

        logger.info(f"Analyzing {len(claims)} claims for contradictions in: {subject_name}")

        claims_payload = []
        for c in claims:
            claims_payload.append({
                "id": c.id,
                "domain": c.researchDomain.value,
                "category": c.category.value,
                "statement": c.statement,
                "kind": c.claimKind.value,
                "editionYear": c.editionYear,
                "attributedTo": c.attributedTo,
                "evidence": [e.model_dump() for e in c.evidence],
            })

        prompt = f"""
You are the Contradiction Analyst for Screened, a cinema due-diligence intelligence workspace.
Analyze the following atomic claims for {subject_name} to identify any genuine contradictions, disputes, or conflicting accounts (e.g. physical vs online screenings, fee disputes, refund promises vs refusals, contradictory venue listings).

Claims:
{json.dumps(claims_payload, indent=2)}

If there are conflicting claims, return a JSON list of Dispute objects:
[
  {{
    "pointOfContention": "string (clear summary of the disagreement)",
    "category": "LEGAL_IDENTITY" | "VENUE_SCREENINGS" | "FEES_POLICY" | "JURY_AWARDS" | "EXPERIENCE_FEEDBACK" | "ORGANIZER_TRACK_RECORD" | "SELECTION_PROFILE",
    "editionYear": number or null,
    "claimA_id": "string ID of claim A",
    "claimB_id": "string ID of claim B",
    "guidance": "string (practical neutral advice for a filmmaker evaluating this specific conflict)"
  }}
]

If there are NO contradictions or opposing claims, return an empty array `[]`.
"""
        try:
            response = self.gemini.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )

            raw_disputes = json.loads(response.text or "[]")
            claim_map = {c.id: c for c in claims}

            disputes: List[DisputeRecord] = []
            for d in raw_disputes:
                c_a = claim_map.get(d.get("claimA_id", ""))
                c_b = claim_map.get(d.get("claimB_id", ""))

                if c_a and c_b:
                    # Update status of both claims to DISPUTED
                    c_a.status = VerificationStatus.DISPUTED
                    c_b.status = VerificationStatus.DISPUTED

                    disputes.append(
                        DisputeRecord(
                            pointOfContention=d.get("pointOfContention", "Contradictory information found"),
                            category=d.get("category", c_a.category.value),
                            editionYear=d.get("editionYear", c_a.editionYear),
                            claimA=c_a.statement,
                            evidenceA=c_a.evidence,
                            claimB=c_b.statement,
                            evidenceB=c_b.evidence,
                            guidance=d.get("guidance", "Verify directly with the venue before submitting."),
                        )
                    )

            logger.info(f"Detected {len(disputes)} direct contradictions")
            return disputes

        except Exception as e:
            logger.exception(f"Contradiction analysis failed: {e}")
            return []
