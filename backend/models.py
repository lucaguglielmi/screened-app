"""Canonical Pydantic models for Screened investigation data."""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
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
    CORPORATE_REGISTRY = "CORPORATE_REGISTRY"
    PERSONNEL_DOSSIER = "PERSONNEL_DOSSIER"
    BOILERPLATE_PLAGIARISM = "BOILERPLATE_PLAGIARISM"
    DOMAIN_PROVENANCE = "DOMAIN_PROVENANCE"
    VENUE_CORROBORATION = "VENUE_CORROBORATION"
    ALUMNI_FOOTPRINT = "ALUMNI_FOOTPRINT"
    IMAGE_PROVENANCE = "IMAGE_PROVENANCE"


class VettingSignalStatus(str, Enum):
    VERIFIED_AUTHENTIC = "VERIFIED_AUTHENTIC"
    INFORMATIONAL = "INFORMATIONAL"
    AMBER_WARNING = "AMBER_WARNING"
    RED_FLAG = "RED_FLAG"
    INCONCLUSIVE = "INCONCLUSIVE"


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


class DeepVettingDimension(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    dimensionKey: str  # e.g., "CORPORATE_REGISTRY", "DOMAIN_PROVENANCE", "BOILERPLATE_PLAGIARISM", "PERSONNEL_DOSSIER", "VENUE_CORROBORATION", "ALUMNI_FOOTPRINT", "IMAGE_PROVENANCE"
    title: str
    category: QuestionCategory
    status: VettingSignalStatus
    confidenceScore: int = Field(default=85, ge=0, le=100)
    summary: str
    signalsFound: List[str] = Field(default_factory=list)
    corroboratingSources: List[str] = Field(default_factory=list)
    riskWeight: str = "MEDIUM"  # "LOW", "MEDIUM", "HIGH", "CRITICAL"


class DeepVettingReport(BaseModel):
    festivalName: str
    overallAuthenticityScore: int = Field(default=80, ge=0, le=100)
    totalFlags: int = 0
    dimensions: List[DeepVettingDimension] = Field(default_factory=list)
    generatedAt: str = Field(default_factory=get_current_iso)


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
    deepVetting: Optional[DeepVettingReport] = None
    summaryNarrative: str
    durationSeconds: float


# --- Conversational Producer Desk & Tool Models ---

class ToolCallType(str, Enum):
    CONFIGURE_DUE_DILIGENCE = "configure_due_diligence"
    CONFIGURE_OPPORTUNITY_SCOUT = "configure_opportunity_scout"
    COMPARE_FESTIVALS_ARENA = "compare_festivals_arena"
    CONFIGURE_GRANT_SCOUT = "configure_grant_scout"
    ANALYZE_INVITATION_EMAIL = "analyze_invitation_email"


class DueDiligenceToolArgs(BaseModel):
    festival_name: str
    optional_url: Optional[str] = None
    city_country: Optional[str] = None
    suspected_concerns: List[str] = Field(default_factory=list)
    user_context: List[str] = Field(default_factory=list)
    preflight_summary: str


class OpportunityScoutToolArgs(BaseModel):
    film_title: str = "Untitled Film"
    format: FilmFormat = FilmFormat.SHORT
    genre: str = "Drama"
    runtime_minutes: int = 15
    premiere_goal: PremiereGoal = PremiereGoal.WORLD_PREMIERE
    budget_tier: str = "Micro (< £50k)"
    target_regions: List[str] = Field(default_factory=lambda: ["UK & Europe"])
    strategy_rationale: str


class CompareFestivalsToolArgs(BaseModel):
    festival_a: str
    festival_b: str
    key_comparison_vectors: List[str] = Field(default_factory=list)
    verdict_summary: str


class GrantScoutToolArgs(BaseModel):
    project_title: str = "Untitled Project"
    grant_category: str = "DEVELOPMENT_AND_PRODUCTION"
    target_amount: str = "£25,000"
    production_stage: str = "Production"
    filmmaker_region: str = "UK & Europe"
    recommended_grants: List[str] = Field(default_factory=lambda: ["BFI Filmmaking Fund", "Screen Scotland", "Sundance Doc Fund"])
    grant_strategy_summary: str


class InvitationEmailToolArgs(BaseModel):
    festival_claimed: str
    sender_domain: str
    fee_waiver_offered: bool = False
    upfront_payment_requested: Optional[str] = None
    red_flag_signals: List[str] = Field(default_factory=list)
    initial_verdict: str


class ChatToolCall(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    toolName: ToolCallType
    args: Dict[str, Any] = Field(default_factory=dict)


class ChatMessage(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    role: str  # "user" | "assistant" | "system"
    content: str
    toolCall: Optional[ChatToolCall] = None
    timestamp: str = Field(default_factory=get_current_iso)


class DocumentAnalysisKind(str, Enum):
    SCRIPT_TREATMENT = "SCRIPT_TREATMENT"
    INVITATION_EMAIL = "INVITATION_EMAIL"
    GENERAL_DOCUMENT = "GENERAL_DOCUMENT"


class DocumentAnalysisResult(BaseModel):
    detectedKind: DocumentAnalysisKind
    fileName: str
    fileSizeBytes: int = 0
    extractedSummary: str
    filmTitle: Optional[str] = None
    format: Optional[FilmFormat] = None
    genre: Optional[str] = None
    runtimeMinutes: Optional[int] = None
    logline: Optional[str] = None
    budgetTier: Optional[str] = None
    suggestedPremiereGoal: Optional[PremiereGoal] = None
    keyThemes: List[str] = Field(default_factory=list)
    festivalClaimed: Optional[str] = None
    senderDomain: Optional[str] = None
    feeWaiverOffered: Optional[bool] = None
    trophyFeeRequested: Optional[bool] = None
    redFlagSignals: List[str] = Field(default_factory=list)
    recommendedAction: Optional[str] = None


class DocumentAnalysisRequest(BaseModel):
    fileName: str
    fileContent: Optional[str] = None
    fileBase64: Optional[str] = None
    mimeType: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    conversationHistory: List[ChatMessage] = Field(default_factory=list)
    attachedFileName: Optional[str] = None
    attachedFileContent: Optional[str] = None
    attachedFileBase64: Optional[str] = None
    attachedFileMimeType: Optional[str] = None

