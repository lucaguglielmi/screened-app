"""Report Writer Agent synthesizing neutral, structured due-diligence dossiers."""
import json
import logging
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from google.genai import types

from backend.models import (
    AtomicClaim,
    CandidateEntity,
    SourceRecord,
    PreviousEditionRecord,
    PreviousEditionAward,
    PreviousEditionPress,
)
from backend.agents.contradiction_analyst import DisputeRecord
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.report_writer")


class DossierReport(BaseModel):
    executiveSummary: str
    festivalOverview: str
    organizerProfile: str
    participantFeedback: str
    unresolvedQuestions: List[str] = Field(default_factory=list)
    filmmakerChecklist: List[str] = Field(default_factory=list)
    keyPersons: List[str] = Field(default_factory=list)
    previousEditions: List[PreviousEditionRecord] = Field(default_factory=list)


class ReportWriterAgent:
    """Produces the final comprehensive, neutral editorial dossier."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def write_report(
        self,
        entity: CandidateEntity,
        claims: List[AtomicClaim],
        sources: List[SourceRecord],
        disputes: List[DisputeRecord],
    ) -> DossierReport:
        logger.info(f"Generating comprehensive dossier for: {entity.name} (claims: {len(claims)}, sources: {len(sources)})")

        if not claims:
            return DossierReport(
                executiveSummary=f"No verified public records or claims could be corroborated for {entity.name}.",
                festivalOverview="No verified physical venue, fee structure, or past edition records found in public archives.",
                organizerProfile="No verifiable legal corporate entity or director profiles identified in public trade registers.",
                participantFeedback="No filmmaker community reviews or past participant accounts discovered.",
                unresolvedQuestions=[
                    f"Verify official festival existence directly with local film commission or municipality in {entity.cityCountry or 'the region'}.",
                    "Request direct proof of theatrical screening venues and past catalog archives from festival organizers.",
                ],
                filmmakerChecklist=[
                    "Do not submit entry fees without independent verification of physical screening theater leases.",
                    "Verify corporate registration in official government entity database.",
                ],
                keyPersons=[],
                previousEditions=[],
            )

        claims_summary = [
            {
                "domain": c.researchDomain.value,
                "category": c.category.value,
                "statement": c.statement,
                "kind": c.claimKind.value,
                "status": c.status.value,
                "evidenceCount": len(c.evidence),
            }
            for c in claims
        ]

        disputes_summary = [
            {
                "pointOfContention": d.pointOfContention,
                "claimA": d.claimA,
                "claimB": d.claimB,
            }
            for d in disputes
        ]

        prompt = f"""
You are the Lead Report Writer for Screened, a cinema due-diligence workspace.
Generate a structured, neutral, and strictly factual investigative dossier for a filmmaker evaluating this festival.

Subject: {entity.name}
Location: {entity.cityCountry or 'Not specified'}
Official Site: {entity.officialDomain or 'Not specified'}
Verified Claims:
{json.dumps(claims_summary, indent=2)}

Disputed / Contradictory Points:
{json.dumps(disputes_summary, indent=2)}

Sources Count: {len(sources)}

CRITICAL EDITORIAL RULES:
1. Strict neutrality. Do not give an overall score or subjective trust rating.
2. Never use banned emotional words (like 'scam', 'fraudulent', 'legit', 'fake').
3. HARD FACTS DENSITY: Prioritize concrete data points in every sentence—exact monetary submission amounts (£, $, €), company registration numbers, exact filing dates, venue physical addresses, acceptance percentages, and direct quoted phrases from public records.
4. Eliminate AI generalities, speculative fluff, and filler transitions (e.g. avoid 'It is important to note', 'Screened investigated', 'Filmmakers should be mindful').
5. Keep all sections dense, factual, and concise (1-2 structured paragraphs max per section).
6. Extract key organizers, directors, or prominent individuals associated with the festival from the evidence into a list of strings formatted as 'Name - Role' (e.g. 'Arthur Smith - Festival Director'). If none are found, return an empty list.
7. PREVIOUS EDITIONS: Extract past edition history, screening venues/dates, and official award winners with film titles and URLs if present in the evidence.

Return a JSON object conforming to this schema:
{{
  "executiveSummary": "string (1-2 concise paragraphs summarizing hard verified ground truth with figures and dates)",
  "festivalOverview": "string (1-2 concise paragraphs detailing verified venues, addresses, fee schedules, dates, and screening format realities)",
  "organizerProfile": "string (1-2 concise paragraphs on registered corporate entity numbers, Companies House filings, leadership directors, and cross-company ties)",
  "participantFeedback": "string (1-2 concise paragraphs citing specific quoted filmmaker testimonies, delay lengths in weeks, and communication logs)",
  "unresolvedQuestions": ["factual question 1", "factual question 2"],
  "filmmakerChecklist": ["actionable due-diligence step 1", "actionable step 2"],
  "keyPersons": ["Name - Role"],
  "previousEditions": [
    {{
      "year": 2024,
      "editionNumber": "32nd Edition",
      "heldLocation": "Curzon Soho, London",
      "heldDates": "Oct 20-30, 2024",
      "awards": [
        {{
          "awardName": "Grand Jury Prize",
          "winnerTitle": "Film Title",
          "recipientName": "Director Name",
          "winnerUrl": "https://..."
        }}
      ],
      "pressCoverage": [
        {{
          "headline": "Variety review",
          "publisher": "Variety",
          "url": "https://..."
        }}
      ],
      "notes": "string"
    }}
  ]
}}
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

            raw = json.loads(response.text or "{}")
            
            raw_editions = raw.get("previousEditions", [])
            parsed_editions = []
            for ed in raw_editions:
                if isinstance(ed, dict) and "year" in ed:
                    try:
                        parsed_editions.append(PreviousEditionRecord.model_validate(ed))
                    except Exception:
                        pass

            return DossierReport(
                executiveSummary=raw.get("executiveSummary", f"Investigation completed for {entity.name} with {len(claims)} verified claims."),
                festivalOverview=raw.get("festivalOverview", "Verified festival details compiled from public records."),
                organizerProfile=raw.get("organizerProfile", "Verified organizer details compiled from public filings."),
                participantFeedback=raw.get("participantFeedback", "Community feedback compiled from public discussions."),
                unresolvedQuestions=raw.get("unresolvedQuestions", ["Confirm physical screening venue with cinema box office."]),
                filmmakerChecklist=raw.get("filmmakerChecklist", [
                    "Verify premiere status requirements",
                    "Check refund policy in official regulations",
                    "Confirm screening format requirements",
                ]),
                keyPersons=raw.get("keyPersons", []),
                previousEditions=parsed_editions,
            )
        except Exception as e:
            logger.exception(f"ReportWriter failed: {e}")
            return DossierReport(
                executiveSummary=f"Investigation completed for {entity.name}. Extracted {len(claims)} verified claims across {len(sources)} sources.",
                filmmakerChecklist=["Review official festival regulations", "Check entry fee deadlines"],
                keyPersons=[],
                previousEditions=[],
            )
