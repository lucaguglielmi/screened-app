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
    PremiereRiskAssessment,
    FeeEscalationModel,
    ForensicIntelligenceSummary,
    DossierReport,
    DisputeRecord,
)
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.report_writer")


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

CRITICAL EDITORIAL & ANTI-REDUNDANCY RULES:
1. Strict neutrality. Do not give an overall score or subjective trust rating.
2. Never use banned emotional words (like 'scam', 'fraudulent', 'legit', 'fake'). State the objective factual mechanism.
3. HARD FACTS DENSITY: Prioritize concrete data points in every sentence—exact monetary submission amounts (£, $, €), company registration numbers, exact filing dates, venue physical addresses, acceptance percentages, and direct quoted phrases from public records.
4. ANTI-REDUNDANCY ENFORCEMENT: Enforce strict Single Responsibility across report sections. Do NOT repeat identical facts across multiple sections:
   - executiveSummary: Synthesizes high-level operational status, core risk verdict, and bottom-line submission advice. Do NOT list detailed individual fees or raw dispute quotes here.
   - festivalOverview: Strictly physical venues, physical addresses, screening formats, and screening schedule reality. Do NOT discuss corporate registration or fee deadlines here.
   - organizerProfile: Strictly registered corporate entity numbers, Companies House/state filings, active/resigned directors, and registered office addresses. Do NOT repeat venue details here.
   - participantFeedback: Strictly quoted filmmaker community reviews, communication turnaround times, and award delivery logs. Do NOT repeat corporate numbers here.
   - premiereRisk: Dedicated assessment of premiere exclusivity demand vs industry buyer presence and accreditation.
   - feeEscalation: Dedicated timeline of deadline price tiers, late surge spikes, and market benchmarks.
   - forensicSummary: Dedicated analysis of the 3 specific fraud/scam mechanics (shell entity network, jury self-dealing/nepotism, and 4-wall private rental realities).
   - filmmakerChecklist: Actionable due diligence steps formatted as imperative commands (e.g. 'Verify DCP screening format with box office'). Do NOT restate historical facts.
5. Extract key organizers, directors, or prominent individuals associated with the festival into 'keyPersons' formatted as 'Name - Role'.
6. PREVIOUS EDITIONS: Extract past edition history, screening venues/dates, and official award winners with film titles and URLs if present in the evidence.

Return a JSON object conforming to this schema:
{{
  "executiveSummary": "string (1-2 concise paragraphs summarizing hard verified ground truth with figures and dates)",
  "festivalOverview": "string (1-2 concise paragraphs detailing verified venues, addresses, fee schedules, dates, and screening format realities)",
  "organizerProfile": "string (1-2 concise paragraphs on registered corporate entity numbers, Companies House filings, leadership directors, and cross-company ties)",
  "participantFeedback": "string (1-2 concise paragraphs citing specific quoted filmmaker testimonies, delay lengths in weeks, and communication logs)",
  "unresolvedQuestions": ["factual question 1", "factual question 2"],
  "filmmakerChecklist": ["actionable due-diligence step 1", "actionable due-diligence step 2"],
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
  ],
  "premiereRisk": {{
    "riskScore": 75,
    "riskLevel": "HIGH_BURN_RISK" | "MODERATE_RISK" | "LOW_RISK",
    "premiereDemand": "World or UK Premiere Demanded",
    "accreditationStatus": "Unaccredited (Not BAFTA/BIFA Qualifying)",
    "buyerPressFootprint": "Zero verified trade press or distributors",
    "verdictRationale": "Exclusivity demanded without distributor presence or trade leverage.",
    "recommendation": "Do not burn your World Premiere here. Save for accredited festivals."
  }},
  "feeEscalation": {{
    "currency": "£",
    "tiers": [
      {{
        "tierName": "Super Early Bird",
        "amount": 28,
        "currency": "£",
        "deadlineDate": "15 Jan",
        "surgePercentage": 0
      }},
      {{
        "tierName": "Early Bird",
        "amount": 38,
        "currency": "£",
        "deadlineDate": "1 Mar",
        "surgePercentage": 35
      }},
      {{
        "tierName": "Late Deadline",
        "amount": 85,
        "currency": "£",
        "deadlineDate": "1 Aug",
        "surgePercentage": 203
      }}
    ],
    "spikeAlert": "Aggressive 203% fee surge detected in late submission windows (£28 -> £85).",
    "averageMarketFee": "£32 average for UK indie short film entries",
    "percentile": 92
  }},
  "forensicSummary": {{
    "scamPattern": {{
      "status": "RED_FLAG" | "AMBER_WARNING" | "VERIFIED_AUTHENTIC",
      "headline": "Dissolved Corporate Entity & Virtual Maildrop Footprint",
      "summary": "Operating company was dissolved while continuing to solicit entry fees.",
      "educationalContext": "Shell Entity Scheme: Predatory festivals frequently register entities at mass maildrop forwarding addresses, dissolve them to evade refund liabilities, and operate through clone networks.",
      "signals": [
        "Operating entity dissolved on Companies House",
        "Registered office at mass corporate mailbox"
      ],
      "relatedEntities": ["Operating Entity Ltd"]
    }},
    "juryConflict": {{
      "status": "RED_FLAG" | "AMBER_WARNING" | "VERIFIED_AUTHENTIC",
      "headline": "Undisclosed Commercial Ties & Self-Dealing Laureates",
      "summary": "Festival leadership co-owns PR or consulting firms awarding laurels to commercial clients.",
      "educationalContext": "Jury Independence Standard: Legitimate festivals maintain strict recusal policies prohibiting jury members from awarding honors to business partners or clients.",
      "signals": [
        "Programmer co-owns consulting firm targeting submitters",
        "Winner co-produced commercial project with leadership"
      ],
      "relatedEntities": ["Consulting Firm Ltd"]
    }},
    "venueReality": {{
      "status": "MISMATCH" | "AMBER_WARNING" | "VERIFIED_AUTHENTIC",
      "headline": "Advertised Theatrical Gala vs. 4-Wall Private Room Reality",
      "summary": "Festival marketing advertises red-carpet galas at major institutions, but records reveal only an hourly private room hire or unlisted Vimeo links.",
      "educationalContext": "Curated Cinema Selection vs. 4-Wall Rental: In an authentic festival, the cinema directly curates, tickets, and publishes the festival on its box office schedule. A 4-wall rental is an hourly room hire that anyone can buy with zero programming vetting.",
      "signals": [
        "Institution screening claim refuted: No box office ticket listing",
        "Venue manifest indicates private room hire, not curated season"
      ],
      "relatedEntities": ["Institution Cinema"]
    }}
  }}
}}
"""
        try:
            try:
                response = self.gemini.client.models.generate_content(
                    model="gemini-2.5-pro",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    ),
                )
            except Exception as pro_err:
                logger.warning(f"gemini-2.5-pro synthesis attempt failed ({pro_err}), falling back to gemini-2.5-flash")
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

            parsed_premiere_risk = None
            if isinstance(raw.get("premiereRisk"), dict):
                try:
                    parsed_premiere_risk = PremiereRiskAssessment.model_validate(raw["premiereRisk"])
                except Exception:
                    pass

            parsed_fee_escalation = None
            if isinstance(raw.get("feeEscalation"), dict):
                try:
                    parsed_fee_escalation = FeeEscalationModel.model_validate(raw["feeEscalation"])
                except Exception:
                    pass

            parsed_forensic_summary = None
            if isinstance(raw.get("forensicSummary"), dict):
                try:
                    parsed_forensic_summary = ForensicIntelligenceSummary.model_validate(raw["forensicSummary"])
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
                premiereRisk=parsed_premiere_risk,
                feeEscalation=parsed_fee_escalation,
                forensicSummary=parsed_forensic_summary,
            )
        except Exception as e:
            logger.exception(f"ReportWriter failed: {e}")
            return DossierReport(
                executiveSummary=f"Investigation completed for {entity.name}. Extracted {len(claims)} verified claims across {len(sources)} sources.",
                filmmakerChecklist=["Review official festival regulations", "Check entry fee deadlines"],
                keyPersons=[],
                previousEditions=[],
            )
