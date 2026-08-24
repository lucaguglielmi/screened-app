"""Unit and integration tests for DeepVettingAgent and 360° forensic dimensions (Spec 14)."""
import pytest
from unittest.mock import MagicMock, AsyncMock
from backend.models import (
    DeepVettingDimension,
    DeepVettingReport,
    QuestionCategory,
    SourceRecord,
    VettingSignalStatus,
)
from backend.agents.deep_vetting import DeepVettingAgent
from backend.services.gemini_client import GeminiClient


@pytest.fixture
def mock_gemini():
    client = MagicMock(spec=GeminiClient)
    client.client = MagicMock()
    return client


@pytest.fixture
def sample_sources():
    return [
        SourceRecord(
            url="https://raindance.org/about/",
            domain="raindance.org",
            title="About Raindance Film Festival",
            excerpts=[
                "Raindance Film Festival is an independent film festival operating since 1993.",
                "Official screenings occur at Curzon Soho and Vue West End in London.",
                "Raindance is accredited by BAFTA and BIFA for British Short Film qualifying.",
            ],
            sourceTier=1,
        ),
        SourceRecord(
            url="https://find-and-update.company-information.service.gov.uk/company/02849884",
            domain="find-and-update.company-information.service.gov.uk",
            title="RAINDANCE FILM FESTIVAL LIMITED - Companies House",
            excerpts=[
                "Company number 02849884. Incorporated on 1 September 1993. Status: Active.",
                "Registered office address: 10 Craven Street, London, WC2N 5PE.",
            ],
            sourceTier=1,
        ),
    ]


@pytest.mark.asyncio
async def test_deep_vetting_fallback_dimensions(mock_gemini, sample_sources, monkeypatch):
    # Simulate LLM failure to test robust deterministic fallback
    mock_gemini.client.models.generate_content.side_effect = Exception("Vertex API timeout")

    async def mock_get_session(*args, **kwargs):
        return None
        
    from backend.orchestrator.session_service import FirestoreSessionService
    monkeypatch.setattr(FirestoreSessionService, "get_session", mock_get_session)
    monkeypatch.setattr(FirestoreSessionService, "create_session", AsyncMock())

    agent = DeepVettingAgent(mock_gemini)
    report = await agent.analyze(
        festival_name="Raindance Film Festival",
        sources=sample_sources,
        optional_url="https://raindance.org",
        city_country="London, UK",
    )

    assert isinstance(report, DeepVettingReport)
    assert report.festivalName == "Raindance Film Festival"
    assert report.overallAuthenticityScore >= 0 and report.overallAuthenticityScore <= 100
    assert len(report.dimensions) == 7

    # Verify all 7 Spec 14 vectors exist
    dim_keys = {d.dimensionKey for d in report.dimensions}
    expected_keys = {
        "CORPORATE_REGISTRY",
        "DOMAIN_PROVENANCE",
        "BOILERPLATE_PLAGIARISM",
        "PERSONNEL_DOSSIER",
        "VENUE_CORROBORATION",
        "ALUMNI_FOOTPRINT",
        "IMAGE_PROVENANCE",
    }
    assert dim_keys == expected_keys

    for dim in report.dimensions:
        assert isinstance(dim.category, QuestionCategory)
        assert isinstance(dim.status, VettingSignalStatus)
        assert dim.confidenceScore >= 0 and dim.confidenceScore <= 100
        assert len(dim.signalsFound) > 0


@pytest.mark.asyncio
async def test_deep_vetting_successful_synthesis(mock_gemini, sample_sources, monkeypatch):
    mock_report = DeepVettingReport(
        festivalName="Raindance Film Festival",
        overallAuthenticityScore=94,
        totalFlags=0,
        dimensions=[
            DeepVettingDimension(
                dimensionKey="CORPORATE_REGISTRY",
                title="Corporate Entity Verification",
                category=QuestionCategory.CORPORATE_REGISTRY,
                status=VettingSignalStatus.VERIFIED_AUTHENTIC,
                confidenceScore=95,
                summary="Active UK Limited company registered with Companies House since 1993 with valid filings.",
                signalsFound=["Active company number 02849884", "30+ years continuous incorporation history"],
                corroboratingSources=["find-and-update.company-information.service.gov.uk"],
                riskWeight="LOW"
            )
        ]
    )

    class MockStep:
        class Data:
            def __init__(self, report):
                self.report = report
        def __init__(self, report):
            self.data = self.Data(report)

    async def mock_run_async(*args, **kwargs):
        yield MockStep(mock_report)

    from google.adk.runners import Runner
    monkeypatch.setattr(Runner, "run_async", mock_run_async)
    
    class MockSession:
        def __init__(self):
            self.state = {"deep_vetting_report": mock_report.model_dump()}
            
    async def mock_get_session(*args, **kwargs):
        return MockSession()
        
    from backend.orchestrator.session_service import FirestoreSessionService
    monkeypatch.setattr(FirestoreSessionService, "get_session", mock_get_session)
    monkeypatch.setattr(FirestoreSessionService, "create_session", AsyncMock())

    agent = DeepVettingAgent(mock_gemini)
    report = await agent.analyze(
        festival_name="Raindance Film Festival",
        sources=sample_sources,
        optional_url="https://raindance.org",
        city_country="London, UK",
    )

    assert report.overallAuthenticityScore == 94
    corp_dim = next(d for d in report.dimensions if d.dimensionKey == "CORPORATE_REGISTRY")
    assert corp_dim.status == VettingSignalStatus.VERIFIED_AUTHENTIC
    assert corp_dim.confidenceScore == 95
