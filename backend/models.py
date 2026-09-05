"""Canonical Pydantic models for Screened investigation data."""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
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
    BACKGROUND = "BACKGROUND"
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
    VERIFIED_MATCH = "VERIFIED_MATCH"
    UNVERIFIED_EXCERPT = "UNVERIFIED_EXCERPT"


class Stance(str, Enum):
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    MENTIONS = "MENTIONS"


class ImageAssetType(str, Enum):
    LAUREL_GRAPHIC = "LAUREL_GRAPHIC"
    VENUE_PHOTO = "VENUE_PHOTO"
    RED_CARPET = "RED_CARPET"
    AWARD_TROPHY = "AWARD_TROPHY"
    JURY_HEADSHOT = "JURY_HEADSHOT"


class ImageMatchClassification(str, Enum):
    STOCK_PHOTO = "STOCK_PHOTO"
    TEMPLATE_LAUREL = "TEMPLATE_LAUREL"
    AUTHENTIC_LIVE = "AUTHENTIC_LIVE"
    SYNTHETIC_RENDER = "SYNTHETIC_RENDER"
    CLONED_ACROSS_NETWORK = "CLONED_ACROSS_NETWORK"
    INCONCLUSIVE = "INCONCLUSIVE"


class ImageForensicRecord(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    assetType: ImageAssetType = ImageAssetType.VENUE_PHOTO
    claimedUrl: str = ""
    claimedDescription: str = ""
    classification: ImageMatchClassification = ImageMatchClassification.INCONCLUSIVE
    originMatchUrl: Optional[str] = None
    originMatchTitle: Optional[str] = None
    confidenceScore: int = Field(default=85, ge=0, le=100)
    forensicNotes: str = ""


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
    discoveredByQuery: Optional[str] = None


class ClaimEvidence(BaseModel):
    sourceId: str
    sourceUrl: Optional[str] = None
    sourceDomain: Optional[str] = None
    sourceTitle: Optional[str] = None
    stance: Stance
    exactExcerpt: str
    note: Optional[str] = None
    verificationStatus: Optional[VerificationStatus] = None


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
    imageArtifacts: List[ImageForensicRecord] = Field(default_factory=list)


class PreviousEditionAward(BaseModel):
    awardName: str
    winnerTitle: str
    recipientName: Optional[str] = None
    winnerUrl: Optional[str] = None


class PreviousEditionPress(BaseModel):
    headline: str
    publisher: str
    url: Optional[str] = None


class PreviousEditionRecord(BaseModel):
    year: int
    editionNumber: Optional[str] = None
    heldLocation: Optional[str] = None
    heldDates: Optional[str] = None
    awards: List[PreviousEditionAward] = Field(default_factory=list)
    pressCoverage: List[PreviousEditionPress] = Field(default_factory=list)
    notes: str = ""


class KeyPerson(BaseModel):
    name: str
    roles: List[str] = Field(default_factory=list)
    role: Optional[str] = None
    appointmentDate: Optional[str] = None
    companies: List[str] = Field(default_factory=list)
    otherDirectorships: List[str] = Field(default_factory=list)
    associatedFestivals: List[str] = Field(default_factory=list)
    flags: List[str] = Field(default_factory=list)
    isFestivalMillSuspect: bool = False
    hasDistributionOverlap: bool = False
    notes: str = ""
    avatarUrl: Optional[str] = None
    linkedinUrl: Optional[str] = None
    companiesHouseUrl: Optional[str] = None
    facebookUrl: Optional[str] = None
    websiteUrl: Optional[str] = None
    imdbUrl: Optional[str] = None
    wikipediaUrl: Optional[str] = None
    twitterUrl: Optional[str] = None


class DeepVettingReport(BaseModel):
    festivalName: str
    overallAuthenticityScore: int = Field(default=80, ge=0, le=100)
    totalFlags: int = 0
    dimensions: List[DeepVettingDimension] = Field(default_factory=list)
    keyPersonnel: List[KeyPerson] = Field(default_factory=list)
    imageArtifacts: List[ImageForensicRecord] = Field(default_factory=list)
    disclaimer: str = "This analysis is generated by an automated AI tool and may contain inaccuracies or false positives. All findings regarding individuals, corporate directorships, and potential conflicts of interest must be manually reviewed and corroborated before taking action."
    generatedAt: str = Field(default_factory=get_current_iso)
    degraded: bool = False


class PremiereRiskLevel(str, Enum):
    LOW_RISK = "LOW_RISK"
    MODERATE_RISK = "MODERATE_RISK"
    HIGH_BURN_RISK = "HIGH_BURN_RISK"


class PremiereRiskAssessment(BaseModel):
    riskScore: int = Field(default=50, ge=0, le=100)
    riskLevel: PremiereRiskLevel = PremiereRiskLevel.MODERATE_RISK
    premiereDemand: str = "No Premiere Requirement"
    accreditationStatus: str = "Unaccredited"
    buyerPressFootprint: str = "Limited trade and buyer presence"
    verdictRationale: str = ""
    recommendation: str = ""


class FeeTier(BaseModel):
    tierName: str
    amount: float
    currency: str = "£"
    deadlineDate: Optional[str] = None
    surgePercentage: int = 0


class FeeEscalationModel(BaseModel):
    currency: str = "£"
    tiers: List[FeeTier] = Field(default_factory=list)
    spikeAlert: Optional[str] = None
    averageMarketFee: Optional[str] = None
    percentile: Optional[int] = None


class ForensicTrioItem(BaseModel):
    status: VettingSignalStatus = VettingSignalStatus.INFORMATIONAL
    headline: str
    summary: str
    educationalContext: Optional[str] = None
    signals: List[str] = Field(default_factory=list)
    relatedEntities: List[str] = Field(default_factory=list)


class ForensicIntelligenceSummary(BaseModel):
    scamPattern: ForensicTrioItem
    juryConflict: ForensicTrioItem
    venueReality: ForensicTrioItem


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


class GrantOpportunity(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    title: str
    fundingBody: str
    category: str = "Production & Development"
    amountRange: str
    deadlineDate: Optional[str] = None
    deadlineLabel: str = "Upcoming Round"
    eligibleStages: List[str] = Field(default_factory=list)
    eligibleRegions: List[str] = Field(default_factory=list)
    eligibleFormats: List[str] = Field(default_factory=list)
    keyCriteria: List[str] = Field(default_factory=list)
    guidelinesUrl: Optional[str] = None
    applicationPortalUrl: Optional[str] = None
    fitScore: int = 85
    fitRationale: str = ""
    officialUrl: Optional[str] = None
    matchScore: Optional[int] = None
    matchReason: Optional[str] = None
    keyRequirements: List[str] = Field(default_factory=list)
    grantKind: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if self.matchScore is not None and (self.fitScore == 85 or self.fitScore is None):
            self.fitScore = self.matchScore
        if not self.fitRationale and self.matchReason:
            self.fitRationale = self.matchReason
        if not self.guidelinesUrl and self.officialUrl:
            self.guidelinesUrl = self.officialUrl
        if not self.keyCriteria and self.keyRequirements:
            self.keyCriteria = self.keyRequirements


class GrantScoutRequest(BaseModel):
    projectTitle: str
    format: FilmFormat = FilmFormat.SHORT
    genre: str = "Drama"
    productionStage: str = "Production"
    budgetTier: str = "Micro / Indie (< £50k)"
    fundingNeeded: str = "£25,000"
    filmmakerRegion: str = "UK & Europe"
    targetGrantTypes: List[str] = Field(default_factory=list)
    page: int = 1
    pageSize: int = 10
    sortBy: Optional[str] = "fitScore"


class GrantScoutResponse(BaseModel):
    projectTitle: str
    grantsFound: int = 0
    grants: List[GrantOpportunity] = Field(default_factory=list)
    strategySummary: str
    durationSeconds: float
    totalCount: Optional[int] = None
    page: Optional[int] = 1
    pageSize: Optional[int] = 10
    hasMore: Optional[bool] = False
    opportunitiesFound: Optional[int] = None
    opportunities: Optional[List[GrantOpportunity]] = None

    def model_post_init(self, __context: Any) -> None:
        if not self.grants and self.opportunities:
            self.grants = self.opportunities
        if not self.grantsFound and self.opportunitiesFound:
            self.grantsFound = self.opportunitiesFound
        if self.totalCount is None:
            self.totalCount = self.grantsFound



class ParseGrantGuidelinesRequest(BaseModel):
    fileName: str
    fileContent: str  # Plain text or base64
    mimeType: Optional[str] = "text/plain"


class GrantGuidelinesAnalysis(BaseModel):
    fundingBody: str
    grantTitle: str
    maxAwardAmount: str
    matchFundingPercentage: Optional[str] = None
    eligibilityCriteria: List[str] = Field(default_factory=list)
    nationalityOrResidencyRules: List[str] = Field(default_factory=list)
    requiredDeliverables: List[str] = Field(default_factory=list)
    keyDates: List[str] = Field(default_factory=list)
    culturalTestRequired: bool = False
    guidelineSummary: str


class GrantChecklistItem(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    category: str  # Creative Packaging, Financial & Budget, Legal & Chain of Title, Cultural & Mandate Alignment
    title: str
    description: str
    requiredFormat: str
    priority: str = "Critical"  # Critical, Recommended, Optional
    isCompleted: bool = False
    guidanceTip: str = ""


class GrantChecklistRequest(BaseModel):
    grantId: Optional[str] = None
    grantOpportunity: Optional[GrantOpportunity] = None
    projectTitle: str
    format: FilmFormat = FilmFormat.FEATURE
    genre: str = "Drama"
    productionStage: str = "Production"
    budgetTier: str = "Low (< £250k)"
    directorName: Optional[str] = None
    leadProducer: Optional[str] = None


class GrantChecklistResponse(BaseModel):
    grantTitle: str
    fundingBody: str
    projectTitle: str
    items: List[GrantChecklistItem] = Field(default_factory=list)
    readinessScore: int = 0
    packagingAdvice: str
    submissionDeadline: Optional[str] = None


class GrantExportKitRequest(BaseModel):
    checklist: GrantChecklistResponse


class GrantExportKitResponse(BaseModel):
    markdownContent: str
    sha256Digest: str
    icsContent: str
    exportTimestamp: str


class TestPipelineRequest(BaseModel):
    festivalName: str
    optionalUrl: Optional[str] = None
    additionalContext: Optional[str] = None
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


class FollowUpOption(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    label: str
    promptText: str
    badge: Optional[str] = None


class InteractiveFollowUpProbe(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    question: str
    options: List[FollowUpOption] = Field(default_factory=list)


class ChatMessage(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    role: str  # "user" | "assistant" | "system"
    content: str
    toolCall: Optional[ChatToolCall] = None
    suggestedReplies: List[str] = Field(default_factory=list)
    followUpProbe: Optional[InteractiveFollowUpProbe] = None
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
    fileName: str = Field(..., max_length=500)
    fileContent: Optional[str] = Field(None, max_length=500000)
    fileBase64: Optional[str] = None
    mimeType: Optional[str] = Field(None, max_length=100)

    @field_validator("mimeType")
    @classmethod
    def validate_mime_type(cls, v: Optional[str]) -> Optional[str]:
        if v and not (v.startswith("text/") or v == "application/pdf"):
            raise ValueError("Only text and PDF files are allowed.")
        return v


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=3000)
    conversationHistory: List[ChatMessage] = Field(default_factory=list)
    attachedFileName: Optional[str] = Field(None, max_length=500)
    attachedFileContent: Optional[str] = Field(None, max_length=500000)
    attachedFileBase64: Optional[str] = None
    attachedFileMimeType: Optional[str] = Field(None, max_length=100)

    @field_validator("attachedFileMimeType")
    @classmethod
    def validate_attached_mime_type(cls, v: Optional[str]) -> Optional[str]:
        if v and not (v.startswith("text/") or v == "application/pdf"):
            raise ValueError("Only text and PDF files are allowed.")
        return v


class FeedbackCategory(str, Enum):
    ACCURACY = "ACCURACY"
    RECOMMENDATIONS = "RECOMMENDATIONS"
    CHAT_INTELLIGENCE = "CHAT_INTELLIGENCE"
    UI_DESIGN = "UI_DESIGN"
    FEATURE_REQUEST = "FEATURE_REQUEST"
    GENERAL = "GENERAL"


class FeedbackItem(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    rating: int = Field(ge=1, le=5)
    category: str = "GENERAL"
    comment: str
    authorName: Optional[str] = None
    authorEmail: Optional[str] = None
    timestamp: str = Field(default_factory=get_current_iso)
    status: str = "RECEIVED"


class FeedbackCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    category: str = Field("GENERAL", max_length=50)
    comment: str = Field(..., max_length=2000)
    authorName: Optional[str] = Field(None, max_length=100)
    authorEmail: Optional[str] = Field(None, max_length=150)


class NotificationSubscriptionRequest(BaseModel):
    email: Optional[str] = Field(None, max_length=200)
    pushSubscription: Optional[Dict[str, Any]] = None


class InvestigationAuditHealth(BaseModel):
    status: str = "HEALTHY"  # "HEALTHY", "DEGRADED", "EMPTY_WARNING", "CRITICAL_FAILURE"
    rawDomainClaimsReceived: int = 0
    assembledClaimsCount: int = 0
    sourcesCount: int = 0
    validationErrorsCount: int = 0
    validationErrors: List[str] = Field(default_factory=list)
    deepVettingVectorsCount: int = 0
    deepVettingInconclusiveCount: int = 0
    warnings: List[str] = Field(default_factory=list)
    executionDurationMs: int = 0


def extract_domain_from_url(url: Optional[str]) -> str:
    """Safely extract the registrable domain or hostname from a URL with fallback."""
    if not url:
        return "screened.app"
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url if "://" in url else f"https://{url}")
        host = parsed.netloc.lower() or parsed.path.lower()
        host = host.split(":")[0].strip("/")
        return host or "screened.app"
    except Exception:
        return "screened.app"


def safe_claim_kind(val: Any) -> ClaimKind:
    """Defensively parse ClaimKind from any string or enum."""
    if isinstance(val, ClaimKind):
        return val
    try:
        clean = str(val).upper().strip()
        if "ALLEGATION" in clean:
            return ClaimKind.ALLEGATION
        if "OPINION" in clean:
            return ClaimKind.OPINION
        return ClaimKind.FACT
    except Exception:
        return ClaimKind.FACT


def safe_verification_status(val: Any) -> VerificationStatus:
    """Defensively parse VerificationStatus from any string or enum."""
    if isinstance(val, VerificationStatus):
        return val
    try:
        clean = str(val).upper().strip()
        for status in VerificationStatus:
            if status.value == clean:
                return status
        if "CORROBORATED" in clean or "MATCH" in clean:
            return VerificationStatus.CORROBORATED
        if "SUPPORT" in clean:
            return VerificationStatus.SUPPORTED
        if "DISPUTE" in clean:
            return VerificationStatus.DISPUTED
        return VerificationStatus.UNVERIFIED
    except Exception:
        return VerificationStatus.UNVERIFIED


def safe_question_category(val: Any) -> QuestionCategory:
    """Defensively parse QuestionCategory from any string or enum."""
    if isinstance(val, QuestionCategory):
        return val
    try:
        clean = str(val).upper().strip()
        for cat in QuestionCategory:
            if cat.value == clean:
                return cat
        return QuestionCategory.BACKGROUND
    except Exception:
        return QuestionCategory.BACKGROUND


def safe_research_domain(val: Any) -> ResearchDomain:
    """Defensively parse ResearchDomain from any string or enum."""
    if isinstance(val, ResearchDomain):
        return val
    try:
        clean = str(val).upper().strip()
        for dom in ResearchDomain:
            if dom.value == clean:
                return dom
        if "FESTIVAL" in clean:
            return ResearchDomain.FESTIVAL
        if "ORGANIZER" in clean:
            return ResearchDomain.ORGANIZER
        if "PARTICIPANT" in clean:
            return ResearchDomain.PARTICIPANTS
        return ResearchDomain.FESTIVAL
    except Exception:
        return ResearchDomain.FESTIVAL




