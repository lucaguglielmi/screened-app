"""Canonical Pydantic models for Screened investigation data."""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import uuid


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_current_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ResearchDomain(str, Enum):
    FESTIVAL = "FESTIVAL"
    ORGANIZER = "ORGANIZER"
    PARTICIPANTS = "PARTICIPANTS"
    FIT = "FIT"


class QuestionCategory(str, Enum):
    LEGAL_IDENTITY = "LEGAL_IDENTITY"
    VENUE_SCREENINGS = "VENUE_SCREENINGS"
    FEES_POLICY = "FEES_POLICY"
    JURY_AWARDS = "JURY_AWARDS"
    EXPERIENCE_FEEDBACK = "EXPERIENCE_FEEDBACK"
    ORGANIZER_TRACK_RECORD = "ORGANIZER_TRACK_RECORD"
    SELECTION_PROFILE = "SELECTION_PROFILE"


class ClaimKind(str, Enum):
    FACT = "FACT"
    ALLEGATION = "ALLEGATION"
    OPINION = "OPINION"


class VerificationStatus(str, Enum):
    CORROBORATED = "CORROBORATED"
    SUPPORTED = "SUPPORTED"
    DISPUTED = "DISPUTED"
    UNVERIFIED = "UNVERIFIED"


class Stance(str, Enum):
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    MENTIONS = "MENTIONS"


class InvestigationStatus(str, Enum):
    DRAFT = "DRAFT"
    DISAMBIGUATING = "DISAMBIGUATING"
    AWAITING_ENTITY_CONFIRMATION = "AWAITING_ENTITY_CONFIRMATION"
    PLANNING = "PLANNING"
    RESEARCHING = "RESEARCHING"
    ANALYZING_CONTRADICTIONS = "ANALYZING_CONTRADICTIONS"
    ASSEMBLING_DOSSIER = "ASSEMBLING_DOSSIER"
    READY = "READY"
    DRAFTING_OUTREACH = "DRAFTING_OUTREACH"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    EXECUTING_SANDBOX_SEND = "EXECUTING_SANDBOX_SEND"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class ApprovalStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTED_SANDBOX = "EXECUTED_SANDBOX"


class DetailDensity(str, Enum):
    SUMMARY = "SUMMARY"
    STANDARD = "STANDARD"
    EVIDENCE = "EVIDENCE"


class FilmFormat(str, Enum):
    SHORT = "SHORT"
    FEATURE = "FEATURE"
    DOCUMENTARY = "DOCUMENTARY"
    ANIMATION = "ANIMATION"
    EPISODIC = "EPISODIC"


class PremiereGoal(str, Enum):
    WORLD_PREMIERE = "WORLD_PREMIERE"
    INTERNATIONAL_PREMIERE = "INTERNATIONAL_PREMIERE"
    NATIONAL_PREMIERE = "NATIONAL_PREMIERE"
    NO_PREFERENCE = "NO_PREFERENCE"


class SourceRecord(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    url: str
    domain: str
    title: str
    publishedDate: Optional[str] = None
    retrievedAt: str = Field(default_factory=get_current_iso)
    excerpts: List[str] = Field(default_factory=list)
    sourceTier: int = Field(default=2, ge=1, le=3)
    contentHash: str = ""


class ClaimEvidence(BaseModel):
    sourceId: str
    sourceUrl: Optional[str] = None
    sourceDomain: Optional[str] = None
    sourceTitle: Optional[str] = None
    stance: Stance
    exactExcerpt: str
    note: Optional[str] = None


class AtomicClaim(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    investigationId: str = ""
    researchDomain: ResearchDomain
    category: QuestionCategory
    statement: str
    claimKind: ClaimKind
    status: VerificationStatus = VerificationStatus.UNVERIFIED
    editionYear: Optional[int] = None
    attributedTo: Optional[str] = None
    evidence: List[ClaimEvidence] = Field(default_factory=list)


class CandidateEntity(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    entityType: str = "FESTIVAL"
    officialDomain: Optional[str] = None
    cityCountry: Optional[str] = None
    foundedYear: Optional[int] = None
    descriptor: str = ""
    sourceIds: List[str] = Field(default_factory=list)


class OutreachDraft(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    investigationId: str
    claimId: Optional[str] = None
    targetAudience: str = "Festival Management"
    recipientEmail: str
    recipientName: str
    subject: str
    body: str
    payloadHash: str = ""
    status: ApprovalStatus = ApprovalStatus.PENDING_APPROVAL
    createdAt: str = Field(default_factory=get_current_iso)
    executedAt: Optional[str] = None


class DraftOutreachRequest(BaseModel):
    claimId: Optional[str] = None
    disputeId: Optional[str] = None
    targetType: str = "FESTIVAL_ORGANIZER"
    filmmakerNote: Optional[str] = None


class ApproveOutreachRequest(BaseModel):
    draftId: str
    payloadHash: str
    userConfirmed: bool = True


# --- Milestone M4: Opportunity Scout Models ---

class FilmProfile(BaseModel):
    title: str = "Untitled Project"
    format: FilmFormat = FilmFormat.SHORT
    genre: str = "Drama"
    runtimeMinutes: int = 15
    premiereGoal: PremiereGoal = PremiereGoal.WORLD_PREMIERE
    targetRegions: List[str] = Field(default_factory=lambda: ["UK & Europe", "North America"])
    budgetTier: str = "Micro / Indie (< $100k)"
    targetDeadlineMonth: Optional[str] = None


class FestivalOpportunity(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    cityCountry: str
    officialDomain: Optional[str] = None
    nextDeadline: str
    deadlineTier: str = "Regular Deadline"
    feeEstimate: str = "£35 - £55"
    accreditationTags: List[str] = Field(default_factory=list)  # e.g. ["BAFTA_QUALIFYING", "BIFA_QUALIFYING"]
    strategicFitRationale: str
    eligibilityNotes: str
    submissionUrl: Optional[str] = None


class ScoutRequest(BaseModel):
    profile: FilmProfile


class ScoutResponse(BaseModel):
    filmTitle: str
    opportunitiesFound: int
    opportunities: List[FestivalOpportunity]
    strategySummary: str
    durationSeconds: float


class TestPipelineRequest(BaseModel):
    festivalName: str
    optionalUrl: Optional[str] = None
    intent: str = "Vet before submitting"


class TestPipelineResponse(BaseModel):
    festivalName: str
    sourcesFound: int
    sources: List[SourceRecord]
    extractedClaims: List[AtomicClaim]
    summaryNarrative: str
    durationSeconds: float
