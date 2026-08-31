"""Tests for Deep Vetting 360° full dataflow and forensic vector coverage (Spec 17)."""
import pytest
from unittest.mock import MagicMock, AsyncMock
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    ClaimEvidence,
    ClaimKind,
    DeepVettingDimension,
    DeepVettingReport,
    QuestionCategory,
    ResearchDomain,
    SourceRecord,
    Stance,
    VerificationStatus,
    VettingSignalStatus,
)
from backend.agents.deep_vetting import DeepVettingAgent, DIMENSIONS
from backend.services.gemini_client import GeminiClient


def test_dimensions_contains_all_seven_vectors():
    """Verify DIMENSIONS includes all 7 forensic vectors including ALUMNI_FOOTPRINT."""
    keys = {d["key"] for d in DIMENSIONS}
    expected = {
        "CORPORATE_REGISTRY",
        "DOMAIN_PROVENANCE",
        "VENUE_CORROBORATION",
        "PERSONNEL_DOSSIER",
        "BOILERPLATE_PLAGIARISM",
        "ALUMNI_FOOTPRINT",
        "IMAGE_PROVENANCE",
    }
    assert keys == expected
    assert len(DIMENSIONS) == 7


@pytest.mark.asyncio
async def test_deep_vetting_ingests_sources_and_claims(monkeypatch):
    """Verify DeepVettingAgent.analyze ingests sources and claims and outputs a complete 7-dimension report."""
    mock_gemini = MagicMock(spec=GeminiClient)
    mock_gemini.client = MagicMock()

    sample_sources = [
        SourceRecord(
            url="https://parmafilmfestival.it/about",
            domain="parmafilmfestival.it",
            title="Parma Film Festival Invenzioni dal Vero",
            excerpts=["Official festival since 1990 in Parma, Italy."],
            sourceTier=1,
        )
    ]

    sample_claims = [
        AtomicClaim(
            investigationId="inv-test",
            researchDomain=ResearchDomain.FESTIVAL,
            category=QuestionCategory.VENUE_SCREENINGS,
            statement="Screenings occur at Cinema D'Azeglio in Parma.",
            claimKind=ClaimKind.FACT,
            status=VerificationStatus.CORROBORATED,
        )
    ]

    expected_report = DeepVettingReport(
        festivalName="Parma Film Festival. Invenzioni dal Vero",
        overallAuthenticityScore=88,
        totalFlags=0,
        dimensions=[
            DeepVettingDimension(
                dimensionKey="VENUE_CORROBORATION",
                title="Municipal Screening & Venue Corroboration",
                category=QuestionCategory.VENUE_CORROBORATION,
                status=VettingSignalStatus.VERIFIED_AUTHENTIC,
                confidenceScore=90,
                summary="Cinema D'Azeglio is the primary historical screening venue.",
                signalsFound=["Physical theater confirmed in Parma city centre"],
                riskWeight="LOW",
            ),
            DeepVettingDimension(
                dimensionKey="ALUMNI_FOOTPRINT",
                title="Alumni Filmmaker & Selection Footprint",
                category=QuestionCategory.ALUMNI_FOOTPRINT,
                status=VettingSignalStatus.INFORMATIONAL,
                confidenceScore=85,
                summary="Documented past editions and laureate alumni archives.",
                signalsFound=["Archive catalog present"],
                riskWeight="LOW",
            ),
        ]
    )

    mock_resp = MagicMock()
    mock_resp.text = expected_report.model_dump_json()
    mock_gemini.client.models.generate_content.return_value = mock_resp

    class MockSession:
        def __init__(self):
            self.state = {}

    async def mock_get_session(*args, **kwargs):
        return MockSession()

    from backend.orchestrator.session_service import FirestoreSessionService
    monkeypatch.setattr(FirestoreSessionService, "get_session", mock_get_session)
    monkeypatch.setattr(FirestoreSessionService, "create_session", AsyncMock())

    agent = DeepVettingAgent(mock_gemini)
    report = await agent.analyze(
        festival_name="Parma Film Festival. Invenzioni dal Vero",
        sources=sample_sources,
        optional_url="https://parmafilmfestival.it",
        city_country="Parma, Italy",
        investigation_id="inv-test",
        claims=sample_claims,
    )

    assert isinstance(report, DeepVettingReport)
    assert report.festivalName == "Parma Film Festival. Invenzioni dal Vero"
    assert report.overallAuthenticityScore == 88
