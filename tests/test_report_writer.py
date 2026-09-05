"""Unit tests for ReportWriterAgent schema parsing, anti-redundancy synthesis, and pro-to-flash fallback."""
import json
import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.agents.report_writer import ReportWriterAgent, DossierReport
from backend.models import CandidateEntity, AtomicClaim, ResearchDomain, QuestionCategory, ClaimKind, VerificationStatus
from backend.agents.contradiction_analyst import DisputeRecord


@pytest.fixture
def sample_entity():
    return CandidateEntity(
        id="ent_test",
        name="Pinco Pallino Film Festival",
        officialDomain="pincopallino.com",
        cityCountry="London, UK",
        confidence=0.95,
        matchRationale="Primary match",
    )


@pytest.fixture
def sample_claims():
    return [
        AtomicClaim(
            id="cl_1",
            statement="Submissions require a World or UK Premiere for competition.",
            claimKind=ClaimKind.FACT,
            category=QuestionCategory.SELECTION_PROFILE,
            researchDomain=ResearchDomain.FESTIVAL,
            status=VerificationStatus.CORROBORATED,
            evidence=[],
        ),
        AtomicClaim(
            id="cl_2",
            statement="Late entry fee is £85 compared to £28 early bird.",
            claimKind=ClaimKind.FACT,
            category=QuestionCategory.FEES_POLICY,
            researchDomain=ResearchDomain.FESTIVAL,
            status=VerificationStatus.CORROBORATED,
            evidence=[],
        ),
    ]


@pytest.fixture
def sample_disputes():
    return [
        DisputeRecord(
            pointOfContention="Venue Screening Ground Truth",
            claimA="Festival advertises gala at BFI Southbank NFT1.",
            claimB="Venue records confirm only 2-hour private room hire at Genesis Cinema Studio 4.",
            category="VENUE_SCREENINGS",
            guidance="Verify directly with cinema box office.",
        )
    ]


@pytest.mark.asyncio
async def test_report_writer_parses_full_forensic_schema(sample_entity, sample_claims, sample_disputes):
    mock_gemini = MagicMock()
    mock_models = MagicMock()
    mock_gemini.client.models = mock_models

    mock_llm_response = {
        "executiveSummary": "Pinco Pallino Film Festival is an unaccredited private screening event operating under dissolved corporate entities.",
        "festivalOverview": "Physical screenings occur via private hire at Genesis Cinema Studio 4.",
        "organizerProfile": "Operated by Pallino Media Lab Ltd, dissolved on Companies House in March 2024.",
        "participantFeedback": "Filmmakers report delayed notifications and unlisted Vimeo links with < 5 views.",
        "unresolvedQuestions": ["Verify physical screening schedule directly with Genesis Cinema box office."],
        "filmmakerChecklist": ["Verify DCP format requirement", "Request screening contract"],
        "keyPersons": ["Arthur Smith - Festival Director"],
        "previousEditions": [],
        "premiereRisk": {
            "riskScore": 82,
            "riskLevel": "HIGH_BURN_RISK",
            "premiereDemand": "World or UK Premiere Demanded",
            "accreditationStatus": "Unaccredited (Not BAFTA/BIFA Qualifying)",
            "buyerPressFootprint": "Zero verified trade press or distributors",
            "verdictRationale": "Demands premiere exclusivity without trade exposure.",
            "recommendation": "Do not burn your World Premiere here.",
        },
        "feeEscalation": {
            "currency": "£",
            "tiers": [
                {"tierName": "Super Early Bird", "amount": 28, "currency": "£", "deadlineDate": "15 Jan", "surgePercentage": 0},
                {"tierName": "Late Deadline", "amount": 85, "currency": "£", "deadlineDate": "1 Aug", "surgePercentage": 203},
            ],
            "spikeAlert": "Aggressive 203% fee surge in late submission windows.",
            "averageMarketFee": "£32 average for UK indie short film entries",
            "percentile": 92,
        },
        "forensicSummary": {
            "scamPattern": {
                "status": "RED_FLAG",
                "headline": "Dissolved Corporate Entity",
                "summary": "Operating company was dissolved while continuing to solicit fees.",
                "educationalContext": "Shell entity scheme to evade liabilities.",
                "signals": ["Dissolved on Companies House"],
                "relatedEntities": ["Pallino Media Lab Ltd"],
            },
            "juryConflict": {
                "status": "RED_FLAG",
                "headline": "Self-Dealing Laureates",
                "summary": "Director awards client films.",
                "educationalContext": "Jury independence rule violation.",
                "signals": ["Programmer consulting business"],
                "relatedEntities": ["Arthur Smith"],
            },
            "venueReality": {
                "status": "MISMATCH",
                "headline": "Advertised Gala vs 4-Wall Private Room Reality",
                "summary": "No contract with BFI Southbank; only 2-hour private room hire.",
                "educationalContext": "Curated Cinema Selection vs. 4-Wall Rental.",
                "signals": ["Genesis Cinema private room hire"],
                "relatedEntities": ["BFI Southbank", "Genesis Cinema"],
            },
        },
    }

    mock_response_obj = MagicMock()
    mock_response_obj.text = json.dumps(mock_llm_response)
    mock_models.generate_content.return_value = mock_response_obj

    agent = ReportWriterAgent(gemini=mock_gemini)
    report = await agent.write_report(
        entity=sample_entity,
        claims=sample_claims,
        sources=[],
        disputes=sample_disputes,
    )

    assert isinstance(report, DossierReport)
    assert report.executiveSummary.startswith("Pinco Pallino Film Festival")
    assert report.premiereRisk is not None
    assert report.premiereRisk.riskScore == 82
    assert report.premiereRisk.riskLevel.value == "HIGH_BURN_RISK"
    assert report.feeEscalation is not None
    assert len(report.feeEscalation.tiers) == 2
    assert report.feeEscalation.tiers[1].surgePercentage == 203
    assert report.forensicSummary is not None
    assert report.forensicSummary.venueReality.headline == "Advertised Gala vs 4-Wall Private Room Reality"
    assert report.forensicSummary.scamPattern.status.value == "RED_FLAG"


@pytest.mark.asyncio
async def test_report_writer_fallback_from_pro_to_flash(sample_entity, sample_claims):
    mock_gemini = MagicMock()
    mock_models = MagicMock()
    mock_gemini.client.models = mock_models

    fallback_response = {
        "executiveSummary": "Synthesized via fallback model.",
        "festivalOverview": "Venues verified.",
        "organizerProfile": "Organizers verified.",
        "participantFeedback": "Reviews verified.",
        "unresolvedQuestions": [],
        "filmmakerChecklist": ["Step 1"],
        "keyPersons": [],
        "previousEditions": [],
    }
    mock_success_obj = MagicMock()
    mock_success_obj.text = json.dumps(fallback_response)

    # First call (gemini-2.5-pro) raises an exception; second call (gemini-2.5-flash) succeeds
    mock_models.generate_content.side_effect = [
        Exception("ResourceExhausted: gemini-2.5-pro quota exceeded"),
        mock_success_obj,
    ]

    agent = ReportWriterAgent(gemini=mock_gemini)
    report = await agent.write_report(
        entity=sample_entity,
        claims=sample_claims,
        sources=[],
        disputes=[],
    )

    assert report.executiveSummary == "Synthesized via fallback model."
    assert mock_models.generate_content.call_count == 2
    # Verify the two models called
    first_call_model = mock_models.generate_content.call_args_list[0].kwargs.get("model")
    second_call_model = mock_models.generate_content.call_args_list[1].kwargs.get("model")
    assert first_call_model == "gemini-2.5-pro"
    assert second_call_model == "gemini-2.5-flash"
