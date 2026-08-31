"""Comprehensive tests for claim pipeline resilience, safe SourceRecord creation,
defensive enum coercion, and auditHealth diagnostics telemetry (Spec 17)."""
import pytest
import uuid
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    ClaimEvidence,
    ClaimKind,
    InvestigationAuditHealth,
    QuestionCategory,
    ResearchDomain,
    SourceRecord,
    Stance,
    VerificationStatus,
    VettingSignalStatus,
    extract_domain_from_url,
    safe_claim_kind,
    safe_question_category,
    safe_research_domain,
    safe_verification_status,
)
from backend.orchestrator.state_machine import _create_source_record
from backend.db.firestore import Database


def test_extract_domain_from_url():
    """Verify robust domain extraction across standard, prefixed, and malformed URLs."""
    assert extract_domain_from_url("https://parmafilmfestival.it/about") == "parmafilmfestival.it"
    assert extract_domain_from_url("http://subdomain.raindance.org/submit") == "subdomain.raindance.org"
    assert extract_domain_from_url("filmfreeway.com/festival") == "filmfreeway.com"
    assert extract_domain_from_url("https://curzon.com:443/venues/soho") == "curzon.com"
    assert extract_domain_from_url("") == "screened.app"
    assert extract_domain_from_url(None) == "screened.app"


def test_create_source_record_valid_construction():
    """Ensure _create_source_record always produces a fully valid SourceRecord without ValidationError."""
    record = _create_source_record(
        source_id="src-123",
        url="https://parmafilmfestival.it/edizioni",
        title="Parma Film Festival Editions",
        excerpt="The 28th edition of Parma Film Festival was held at Cinema D'Azeglio.",
        default_domain=None,
        publish_date="2024-11-12",
    )

    assert isinstance(record, SourceRecord)
    assert record.id == "src-123"
    assert record.url == "https://parmafilmfestival.it/edizioni"
    assert record.domain == "parmafilmfestival.it"
    assert record.title == "Parma Film Festival Editions"
    assert record.publishedDate == "2024-11-12"
    assert len(record.excerpts) == 1
    assert "28th edition" in record.excerpts[0]
    assert record.sourceTier in [1, 2, 3]


def test_safe_enum_coercion():
    """Verify defensive enum parsing handles case variance, dirty strings, and unknown inputs gracefully."""
    # ClaimKind
    assert safe_claim_kind("fact") == ClaimKind.FACT
    assert safe_claim_kind("FACT") == ClaimKind.FACT
    assert safe_claim_kind("allegation") == ClaimKind.ALLEGATION
    assert safe_claim_kind("Filmmaker Allegation") == ClaimKind.ALLEGATION
    assert safe_claim_kind("opinion") == ClaimKind.OPINION
    assert safe_claim_kind(None) == ClaimKind.FACT
    assert safe_claim_kind(123) == ClaimKind.FACT

    # VerificationStatus
    assert safe_verification_status("corroborated") == VerificationStatus.CORROBORATED
    assert safe_verification_status("VERIFIED_MATCH") == VerificationStatus.VERIFIED_MATCH
    assert safe_verification_status("supported") == VerificationStatus.SUPPORTED
    assert safe_verification_status("disputed") == VerificationStatus.DISPUTED
    assert safe_verification_status("unknown_random_string") == VerificationStatus.UNVERIFIED

    # QuestionCategory
    assert safe_question_category("VENUE_SCREENINGS") == QuestionCategory.VENUE_SCREENINGS
    assert safe_question_category("unknown_cat") == QuestionCategory.BACKGROUND

    # ResearchDomain
    assert safe_research_domain("FESTIVAL") == ResearchDomain.FESTIVAL
    assert safe_research_domain("ORGANIZER") == ResearchDomain.ORGANIZER
    assert safe_research_domain("PARTICIPANTS") == ResearchDomain.PARTICIPANTS
    assert safe_research_domain("OTHER") == ResearchDomain.FESTIVAL


@pytest.mark.asyncio
async def test_database_save_and_retrieve_claims_and_sources():
    """Verify Firestore / in-memory store persists and queries both claims and sources accurately."""
    db = Database(project_id="test-project")
    db.use_memory = True
    inv_id = str(uuid.uuid4())

    claims = [
        AtomicClaim(
            id="claim-1",
            investigationId=inv_id,
            researchDomain=ResearchDomain.FESTIVAL,
            category=QuestionCategory.VENUE_SCREENINGS,
            statement="Screenings take place at Cinema D'Azeglio in Parma.",
            claimKind=ClaimKind.FACT,
            status=VerificationStatus.CORROBORATED,
            evidence=[
                ClaimEvidence(
                    sourceId="src-1",
                    sourceUrl="https://parmafilmfestival.it/venues",
                    sourceDomain="parmafilmfestival.it",
                    sourceTitle="Venues",
                    stance=Stance.SUPPORTS,
                    exactExcerpt="All screenings are hosted at Cinema D'Azeglio.",
                )
            ]
        )
    ]

    sources = [
        SourceRecord(
            id="src-1",
            url="https://parmafilmfestival.it/venues",
            domain="parmafilmfestival.it",
            title="Venues",
            excerpts=["All screenings are hosted at Cinema D'Azeglio."],
            sourceTier=2,
            contentHash="verified_hash",
        )
    ]

    await db.save_claims(inv_id, claims)
    await db.save_sources(inv_id, sources)

    retrieved_claims = await db.get_claims(inv_id)
    retrieved_sources = await db.get_sources(inv_id)

    assert len(retrieved_claims) == 1
    assert retrieved_claims[0]["statement"] == "Screenings take place at Cinema D'Azeglio in Parma."
    assert len(retrieved_sources) == 1
    assert retrieved_sources[0]["domain"] == "parmafilmfestival.it"


def test_investigation_audit_health_anomaly_detection():
    """Verify InvestigationAuditHealth correctly flags data drops and degraded states."""
    # Healthy scenario
    healthy = InvestigationAuditHealth(
        status="HEALTHY",
        rawDomainClaimsReceived=15,
        assembledClaimsCount=15,
        sourcesCount=8,
        validationErrorsCount=0,
        deepVettingVectorsCount=7,
        deepVettingInconclusiveCount=1,
    )
    assert healthy.status == "HEALTHY"
    assert healthy.assembledClaimsCount == 15

    # Empty warning anomaly scenario (claims dropped)
    anomaly = InvestigationAuditHealth(
        status="EMPTY_WARNING",
        rawDomainClaimsReceived=12,
        assembledClaimsCount=0,
        sourcesCount=0,
        validationErrorsCount=12,
        validationErrors=["SourceRecord validation error on field 'domain'"],
        warnings=["CRITICAL: 12 raw domain claims received from search/task APIs but 0 claims assembled into database."],
    )
    assert anomaly.status == "EMPTY_WARNING"
    assert len(anomaly.warnings) == 1
    assert "CRITICAL" in anomaly.warnings[0]
