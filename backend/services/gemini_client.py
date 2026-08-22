"""Gemini client using google-genai SDK on Vertex AI."""
import json
import logging
from typing import List, Optional
import asyncio
from google import genai
from google.genai import types

from backend.config import settings
from backend.models import (
    AtomicClaim,
    ClaimEvidence,
    ClaimKind,
    QuestionCategory,
    ResearchDomain,
    SourceRecord,
    Stance,
    VerificationStatus,
)

logger = logging.getLogger("screened.services.gemini")


class GeminiClient:
    """Gemini model client for structured claim extraction and narrative synthesis."""

    def __init__(
        self,
        project: Optional[str] = None,
        location: Optional[str] = None,
        use_vertexai: Optional[bool] = None,
    ):
        self.project = project or settings.google_cloud_project
        self.location = location or settings.google_cloud_location
        self.use_vertexai = use_vertexai if use_vertexai is not None else settings.google_genai_use_vertexai

        try:
            if self.use_vertexai and self.project:
                self.client = genai.Client(
                    vertexai=True,
                    project=self.project,
                    location=self.location,
                )
                logger.info(f"GeminiClient initialized with Vertex AI (project={self.project}, location={self.location})")
            else:
                self.client = genai.Client()
                logger.info("GeminiClient initialized in default mode")
        except Exception as e:
            logger.warning(f"Could not initialize Vertex AI client with ambient credentials: {e}. Falling back to default client.")
            self.client = genai.Client()
        self._semaphore = asyncio.Semaphore(3)

    async def extract_claims_from_sources(
        self,
        subject_name: str,
        sources: List[SourceRecord],
        research_domain: ResearchDomain = ResearchDomain.FESTIVAL,
        model: str = "gemini-2.5-flash",
    ) -> List[AtomicClaim]:
        """Extract atomic claims from verified source excerpts with substring checking."""
        if not sources:
            return []

        # Prepare source payload
        sources_payload = []
        for src in sources:
            sources_payload.append({
                "sourceId": src.id,
                "url": src.url,
                "domain": src.domain,
                "title": src.title,
                "excerpts": src.excerpts,
            })

        system_instruction = (
            "You are the ClaimExtractor agent for Screened, a cinema due-diligence workspace. "
            "Your task is to extract testable atomic claims from the provided web source excerpts about the festival.\n\n"
            "TAXONOMY RULES:\n"
            "1. FACT: Objective verifiable statement (dates, venues, fees, company records, awards, screening formats).\n"
            "2. ALLEGATION: Attributed claim of misconduct, broken promise, or fee dispute. Must have attributedTo.\n"
            "3. OPINION: Subjective quality judgment, impression, or attendee review. Must have attributedTo.\n\n"
            "EVIDENCE INTEGRITY:\n"
            "- exactExcerpt MUST be a verbatim quoted substring from the source's excerpts list.\n"
            "- stance must be SUPPORTS, CONTRADICTS, or MENTIONS.\n"
            "- Never fabricate or extrapolate information."
        )

        prompt = f"""
Subject Entity: {subject_name}
Research Domain: {research_domain.value}

Sources:
{json.dumps(sources_payload, indent=2)}

Extract all relevant atomic claims in JSON format according to this schema:
[
  {{
    "statement": "string (neutral, factual phrasing)",
    "claimKind": "FACT" | "ALLEGATION" | "OPINION",
    "category": "LEGAL_IDENTITY" | "VENUE_SCREENINGS" | "FEES_POLICY" | "JURY_AWARDS" | "EXPERIENCE_FEEDBACK" | "ORGANIZER_TRACK_RECORD" | "SELECTION_PROFILE",
    "editionYear": number or null,
    "attributedTo": "string or null",
    "evidence": [
      {{
        "sourceId": "string (matching one of the sourceIds)",
        "stance": "SUPPORTS" | "CONTRADICTS" | "MENTIONS",
        "exactExcerpt": "exact verbatim substring from source excerpt",
        "note": "one sentence relevance context"
      }}
    ]
  }}
]
"""

        try:
            async with self._semaphore:
                response = await self.client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        temperature=0.1,
                    ),
                )

            raw_text = response.text or "[]"
            parsed_data = json.loads(raw_text)

            # Map to source lookups
            source_map = {src.id: src for src in sources}
            validated_claims: List[AtomicClaim] = []

            for item in parsed_data:
                category_str = item.get("category", "LEGAL_IDENTITY")
                try:
                    category = QuestionCategory(category_str)
                except ValueError:
                    category = QuestionCategory.LEGAL_IDENTITY

                kind_str = item.get("claimKind", "FACT")
                try:
                    kind = ClaimKind(kind_str)
                except ValueError:
                    kind = ClaimKind.FACT

                # Validate evidence excerpts
                valid_evidence_list: List[ClaimEvidence] = []
                for ev in item.get("evidence", []):
                    src_id = ev.get("sourceId", "")
                    src = source_map.get(src_id)
                    if not src:
                        continue

                    exact_excerpt = ev.get("exactExcerpt", "").strip()
                    if not exact_excerpt:
                        continue

                    # Normalized substring verification
                    norm_excerpt = " ".join(exact_excerpt.split()).lower()
                    src_full_text = " ".join(" ".join(src.excerpts).split()).lower()

                    if norm_excerpt in src_full_text or len(norm_excerpt) < 10 or exact_excerpt in " ".join(src.excerpts):
                        stance_str = ev.get("stance", "SUPPORTS")
                        try:
                            stance = Stance(stance_str)
                        except ValueError:
                            stance = Stance.SUPPORTS

                        valid_evidence_list.append(
                            ClaimEvidence(
                                sourceId=src.id,
                                sourceUrl=src.url,
                                sourceDomain=src.domain,
                                sourceTitle=src.title,
                                stance=stance,
                                exactExcerpt=exact_excerpt,
                                note=ev.get("note"),
                            )
                        )

                if valid_evidence_list:
                    # Compute initial status
                    supports_count = sum(1 for e in valid_evidence_list if e.stance == Stance.SUPPORTS)
                    contradicts_count = sum(1 for e in valid_evidence_list if e.stance == Stance.CONTRADICTS)

                    if contradicts_count >= 1:
                        status = VerificationStatus.DISPUTED
                    elif supports_count >= 2:
                        status = VerificationStatus.CORROBORATED
                    elif supports_count == 1:
                        status = VerificationStatus.SUPPORTED
                    else:
                        status = VerificationStatus.UNVERIFIED

                    claim = AtomicClaim(
                        researchDomain=research_domain,
                        category=category,
                        statement=item.get("statement", ""),
                        claimKind=kind,
                        status=status,
                        editionYear=item.get("editionYear"),
                        attributedTo=item.get("attributedTo"),
                        evidence=valid_evidence_list,
                    )
                    validated_claims.append(claim)

            logger.info(f"Extracted {len(validated_claims)} verified atomic claims")
            return validated_claims

        except Exception as e:
            logger.error(f"Gemini claim extraction failed: {e}", exc_info=True)
            return []

    async def generate_dossier_summary(
        self,
        subject_name: str,
        claims: List[AtomicClaim],
        model: str = "gemini-2.5-flash",
    ) -> str:
        """Generate a neutral, evidence-grounded summary narrative referencing claims."""
        if not claims:
            return f"No verified public claims were found for {subject_name}."

        claims_summary = []
        for c in claims:
            claims_summary.append({
                "statement": c.statement,
                "kind": c.claimKind.value,
                "status": c.status.value,
                "category": c.category.value,
                "sourcesCount": len(c.evidence),
            })

        prompt = f"""
Subject: {subject_name}
Verified Claims:
{json.dumps(claims_summary, indent=2)}

Draft a concise, 2-3 paragraph neutral due-diligence report for a filmmaker considering submission.
Requirements:
1. Neutral, factual, and analytical tone.
2. Distinctly highlight what is supported/corroborated, what is disputed (if any), and what remains unverified.
3. Do NOT assign an overall trust score or use banned label words (like 'scam', 'fraud', 'legit').
4. Keep the summary under 180 words.
"""
        try:
            async with self._semaphore:
                response = await self.client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.2),
                )
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini summary generation failed: {e}", exc_info=True)
            return f"Investigation completed for {subject_name}. {len(claims)} atomic claims extracted."
