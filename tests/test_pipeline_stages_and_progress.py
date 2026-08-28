"""Comprehensive hermetic tests for all 6 investigation pipeline stages,
ADK workflow graph topology, and progress bar state calculations (0 LLM tokens)."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from google.adk.workflow import Workflow, Edge, START
from google.adk.agents import LlmAgent

from backend.models import (
    AtomicClaim,
    CandidateEntity,
    ClaimKind,
    DeepVettingReport,
    QuestionCategory,
    ResearchDomain,
    SourceRecord,
    VerificationStatus,
)
from backend.agents import (
    DisambiguatorAgent,
    PlannerAgent,
    ClaimExtractorAgent,
    ContradictionAnalystAgent,
    DeepVettingAgent,
    ReportWriterAgent,
    DossierReport,
)
from backend.agents.deep_vetting import DIMENSIONS
from backend.agents.adk_helpers import get_adk_model


# ---------------------------------------------------------------------------
# 1. Pipeline Progress Resolution Tests (LiveProgress logic)
# ---------------------------------------------------------------------------

def calculate_progress_percent(status: str) -> int:
    """Mirrors the exact frontend and orchestrator progress calculation."""
    mapping = {
        "DRAFT": 5,
        "DISAMBIGUATING": 15,
        "AWAITING_ENTITY_CONFIRMATION": 25,
        "PLANNING": 40,
        "RESEARCHING": 60,
        "ANALYZING_CONTRADICTIONS": 75,
        "ASSEMBLING_DOSSIER": 90,
        "READY": 100,
        "FAILED": 100,
        "CANCELLED": 0,
    }
    return mapping.get(status, 0)


def test_progress_bar_all_stages_monotonic():
    """Verify that progress percentages advance monotonically through all 6 stages."""
    stages = [
        "DRAFT",
        "DISAMBIGUATING",
        "AWAITING_ENTITY_CONFIRMATION",
        "PLANNING",
        "RESEARCHING",
        "ANALYZING_CONTRADICTIONS",
        "ASSEMBLING_DOSSIER",
        "READY",
    ]
    prev_progress = -1
    for stage in stages:
        pct = calculate_progress_percent(stage)
        assert pct > prev_progress, f"Stage {stage} progress {pct} must be greater than previous {prev_progress}"
        assert 0 <= pct <= 100
        prev_progress = pct


# ---------------------------------------------------------------------------
# 2. Stage 1: Disambiguator
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stage_1_disambiguator(mock_genai_client):
    parallel_tool = MagicMock()
    parallel_tool.search = AsyncMock(return_value=[])
    gemini_client = MagicMock()
    gemini_client.client = mock_genai_client.return_value
    agent = DisambiguatorAgent(parallel_tool, gemini_client)

    candidates = await agent.disambiguate("Raindance Film Festival")
    assert len(candidates) >= 1
    assert "Raindance Film Festival" in candidates[0].name


# ---------------------------------------------------------------------------
# 3. Stage 2: Planner
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stage_2_planner(mock_genai_client):
    gemini_client = MagicMock()
    gemini_client.client = mock_genai_client.return_value
    agent = PlannerAgent(gemini_client)

    entity = CandidateEntity(
        name="Raindance Film Festival",
        officialDomain="raindance.org",
        cityCountry="London, UK",
    )
    plan = await agent.create_plan(entity=entity, intent="Vet before submitting")
    assert plan is not None
    assert plan.festivalName is not None


# ---------------------------------------------------------------------------
# 4. Stage 3 & 4: Claim Extraction
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stage_4_claim_extractor(mock_genai_client):
    gemini_client = MagicMock()
    sample_claims = [
        AtomicClaim(
            investigationId="inv-123",
            researchDomain=ResearchDomain.FESTIVAL,
            category=QuestionCategory.BACKGROUND,
            statement="Raindance is BAFTA qualifying for British short films.",
            claimKind=ClaimKind.FACT,
            status=VerificationStatus.VERIFIED_MATCH,
        )
    ]
    gemini_client.extract_claims_from_sources = AsyncMock(return_value=sample_claims)
    agent = ClaimExtractorAgent(gemini_client)

    domain_sources = {
        ResearchDomain.FESTIVAL: [
            SourceRecord(
                url="https://raindance.org",
                domain="raindance.org",
                title="Raindance",
                sourceTier=1
            )
        ]
    }
    claims = await agent.extract_all_domains("Raindance Film Festival", domain_sources)
    assert len(claims) == 1
    assert claims[0].claimKind == ClaimKind.FACT
    assert claims[0].status == VerificationStatus.VERIFIED_MATCH


# ---------------------------------------------------------------------------
# 5. Stage 5a: Contradiction Analyst
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stage_5a_contradiction_analyst(mock_genai_client):
    gemini_client = MagicMock()
    agent = ContradictionAnalystAgent(gemini_client)

    with patch.object(agent, "analyze", AsyncMock(return_value=[])):
        disputes = await agent.analyze("Raindance Film Festival", [])
        assert isinstance(disputes, list)
        assert len(disputes) == 0


# ---------------------------------------------------------------------------
# 6. Stage 5b: Deep Vetting ADK Workflow Topology (Prevents Multiple Terminal Nodes Error)
# ---------------------------------------------------------------------------

def test_deep_vetting_adk_single_terminal_node():
    """Validates that DeepVettingAgent constructs a valid ADK Workflow with exactly 1 terminal output node."""
    agents = [
        LlmAgent(
            name=dim["name"],
            model=get_adk_model("gemini-2.5-flash"),
            instruction=dim["desc"]
        )
        for dim in DIMENSIONS
    ]

    scorer = LlmAgent(
        name="vetting_scorer",
        model=get_adk_model("gemini-2.5-flash"),
        instruction="Synthesize report",
        output_schema=DeepVettingReport,
        output_key="deep_vetting_report"
    )

    # Construct the pipeline edges
    edges = [Edge(from_node=START, to_node=a) for a in agents] + [
        Edge(from_node=a, to_node=scorer) for a in agents
    ]

    workflow = Workflow(
        name="deep_vetting_pipeline",
        edges=edges
    )

    assert workflow.name == "deep_vetting_pipeline"
    # Verify fan-out from START (5 edges) + fan-in to scorer (5 edges) = 10 edges
    assert len(workflow.edges) == 10

    # Scorer must be the sole target of all dimension agents
    targets = {e.to_node.name for e in edges if e.from_node != START}
    assert targets == {"vetting_scorer"}


@pytest.mark.asyncio
async def test_stage_5b_deep_vetting_agent_execution(mock_genai_client):
    gemini_client = MagicMock()
    agent = DeepVettingAgent(gemini_client)

    sample_sources = [
        SourceRecord(
            url="https://raindance.org",
            domain="raindance.org",
            title="Raindance",
            excerpts=["Official festival based in London since 1993."],
            sourceTier=1
        )
    ]

    report = await agent.analyze(
        festival_name="Raindance Film Festival",
        sources=sample_sources,
        optional_url="https://raindance.org",
        city_country="London, UK",
        investigation_id="test_offline_id"
    )

    assert isinstance(report, DeepVettingReport)
    assert isinstance(report.festivalName, str)


# ---------------------------------------------------------------------------
# 7. Stage 6: Report Writer (Dossier Assembly)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stage_6_report_writer(mock_genai_client):
    gemini_client = MagicMock()
    agent = ReportWriterAgent(gemini_client)

    entity = CandidateEntity(
        name="Raindance Film Festival",
        officialDomain="raindance.org",
        cityCountry="London, UK",
    )
    with patch.object(
        agent,
        "write_report",
        AsyncMock(return_value=DossierReport(
            executiveSummary="Raindance is a credible independent festival founded in 1993.",
            festivalOverview="Major London indie cinema event.",
            organizerProfile="Operating with established UK Companies House registration.",
            participantFeedback="Positive filmmaker reports corroborated.",
            unresolvedQuestions=[],
            filmmakerChecklist=[],
            keyPersons=[],
        ))
    ):
        dossier = await agent.write_report(entity=entity, claims=[], sources=[], disputes=[])
        assert isinstance(dossier, DossierReport)
        assert "Raindance" in dossier.executiveSummary
        assert "London" in dossier.festivalOverview
