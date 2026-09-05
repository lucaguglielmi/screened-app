/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated from canonical Pydantic v2 models in backend/models.py
 * Generator: scripts/generate_contracts.py
 * Timestamp: 2026-09-05T10:28:41Z
 *
 * To regenerate, run:
 *   npm run generate-contracts  (from frontend/)
 *   or: python scripts/generate_contracts.py  (from project root)
 */

// ============================================================================
// 1. ENUMS & CONST ARRAYS
// ============================================================================

export type ApprovalStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED_SANDBOX';

export const APPROVAL_STATUSES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'EXECUTED_SANDBOX',
] as const;

export type ClaimKind =
  | 'FACT'
  | 'ALLEGATION'
  | 'OPINION';

export const CLAIM_KINDS = [
  'FACT',
  'ALLEGATION',
  'OPINION',
] as const;

export type DetailDensity =
  | 'SIMPLIFIED'
  | 'BALANCED'
  | 'FULL_EVIDENCE'
  | 'MACHINE_AI_INGESTION'
  | 'SUMMARY'
  | 'STANDARD'
  | 'EVIDENCE';

export const DETAIL_DENSITIES = [
  'SIMPLIFIED',
  'BALANCED',
  'FULL_EVIDENCE',
  'MACHINE_AI_INGESTION',
  'SUMMARY',
  'STANDARD',
  'EVIDENCE',
] as const;

export type DocumentAnalysisKind =
  | 'SCRIPT_TREATMENT'
  | 'INVITATION_EMAIL'
  | 'GENERAL_DOCUMENT';

export const DOCUMENT_ANALYSIS_KINDS = [
  'SCRIPT_TREATMENT',
  'INVITATION_EMAIL',
  'GENERAL_DOCUMENT',
] as const;

export type EventType =
  | 'INVESTIGATION_STARTED'
  | 'DISAMBIGUATING'
  | 'CANDIDATES_FOUND'
  | 'ENTITY_CONFIRMED'
  | 'PLANNING_STARTED'
  | 'PLAN_READY'
  | 'DOMAIN_SEARCH_STARTED'
  | 'DOMAIN_SEARCH_COMPLETED'
  | 'CLAIMS_EXTRACTING'
  | 'CLAIMS_EXTRACTED'
  | 'CONTRADICTIONS_ANALYZING'
  | 'CONTRADICTION_DETECTED'
  | 'DOSSIER_SYNTHESIZING'
  | 'DEEP_VETTING_ANALYZING'
  | 'DEEP_VETTING_COMPLETED'
  | 'DOSSIER_READY'
  | 'WATCHDOG_ESCALATION'
  | 'WATCH_EVENT_RECEIVED'
  | 'TASK_RUN_PROGRESS'
  | 'TASK_RUN_SOURCE_STATS'
  | 'ERROR';

export const EVENT_TYPES = [
  'INVESTIGATION_STARTED',
  'DISAMBIGUATING',
  'CANDIDATES_FOUND',
  'ENTITY_CONFIRMED',
  'PLANNING_STARTED',
  'PLAN_READY',
  'DOMAIN_SEARCH_STARTED',
  'DOMAIN_SEARCH_COMPLETED',
  'CLAIMS_EXTRACTING',
  'CLAIMS_EXTRACTED',
  'CONTRADICTIONS_ANALYZING',
  'CONTRADICTION_DETECTED',
  'DOSSIER_SYNTHESIZING',
  'DEEP_VETTING_ANALYZING',
  'DEEP_VETTING_COMPLETED',
  'DOSSIER_READY',
  'WATCHDOG_ESCALATION',
  'WATCH_EVENT_RECEIVED',
  'TASK_RUN_PROGRESS',
  'TASK_RUN_SOURCE_STATS',
  'ERROR',
] as const;

export type FeedbackCategory =
  | 'ACCURACY'
  | 'RECOMMENDATIONS'
  | 'CHAT_INTELLIGENCE'
  | 'UI_DESIGN'
  | 'FEATURE_REQUEST'
  | 'GENERAL';

export const FEEDBACK_CATEGORIES = [
  'ACCURACY',
  'RECOMMENDATIONS',
  'CHAT_INTELLIGENCE',
  'UI_DESIGN',
  'FEATURE_REQUEST',
  'GENERAL',
] as const;

export type FilmFormat =
  | 'SHORT'
  | 'FEATURE'
  | 'DOCUMENTARY'
  | 'ANIMATION'
  | 'EPISODIC';

export const FILM_FORMATS = [
  'SHORT',
  'FEATURE',
  'DOCUMENTARY',
  'ANIMATION',
  'EPISODIC',
] as const;

export type ImageAssetType =
  | 'LAUREL_GRAPHIC'
  | 'VENUE_PHOTO'
  | 'RED_CARPET'
  | 'AWARD_TROPHY'
  | 'JURY_HEADSHOT';

export const IMAGE_ASSET_TYPES = [
  'LAUREL_GRAPHIC',
  'VENUE_PHOTO',
  'RED_CARPET',
  'AWARD_TROPHY',
  'JURY_HEADSHOT',
] as const;

export type ImageMatchClassification =
  | 'STOCK_PHOTO'
  | 'TEMPLATE_LAUREL'
  | 'AUTHENTIC_LIVE'
  | 'SYNTHETIC_RENDER'
  | 'CLONED_ACROSS_NETWORK'
  | 'INCONCLUSIVE';

export const IMAGE_MATCH_CLASSIFICATIONS = [
  'STOCK_PHOTO',
  'TEMPLATE_LAUREL',
  'AUTHENTIC_LIVE',
  'SYNTHETIC_RENDER',
  'CLONED_ACROSS_NETWORK',
  'INCONCLUSIVE',
] as const;

export type InvestigationStatus =
  | 'DRAFT'
  | 'DISAMBIGUATING'
  | 'AWAITING_ENTITY_CONFIRMATION'
  | 'PLANNING'
  | 'RESEARCHING'
  | 'ANALYZING_CONTRADICTIONS'
  | 'ASSEMBLING_DOSSIER'
  | 'READY'
  | 'DRAFTING_OUTREACH'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING_SANDBOX_SEND'
  | 'FAILED'
  | 'CANCELLED';

export const INVESTIGATION_STATUSES = [
  'DRAFT',
  'DISAMBIGUATING',
  'AWAITING_ENTITY_CONFIRMATION',
  'PLANNING',
  'RESEARCHING',
  'ANALYZING_CONTRADICTIONS',
  'ASSEMBLING_DOSSIER',
  'READY',
  'DRAFTING_OUTREACH',
  'AWAITING_APPROVAL',
  'EXECUTING_SANDBOX_SEND',
  'FAILED',
  'CANCELLED',
] as const;

export type PremiereGoal =
  | 'WORLD_PREMIERE'
  | 'INTERNATIONAL_PREMIERE'
  | 'NATIONAL_PREMIERE'
  | 'NO_PREFERENCE';

export const PREMIERE_GOALS = [
  'WORLD_PREMIERE',
  'INTERNATIONAL_PREMIERE',
  'NATIONAL_PREMIERE',
  'NO_PREFERENCE',
] as const;

export type PremiereRiskLevel =
  | 'LOW_RISK'
  | 'MODERATE_RISK'
  | 'HIGH_BURN_RISK';

export const PREMIERE_RISK_LEVELS = [
  'LOW_RISK',
  'MODERATE_RISK',
  'HIGH_BURN_RISK',
] as const;

export type QuestionCategory =
  | 'BACKGROUND'
  | 'LEGAL_IDENTITY'
  | 'VENUE_SCREENINGS'
  | 'FEES_POLICY'
  | 'JURY_AWARDS'
  | 'EXPERIENCE_FEEDBACK'
  | 'ORGANIZER_TRACK_RECORD'
  | 'SELECTION_PROFILE'
  | 'CORPORATE_REGISTRY'
  | 'PERSONNEL_DOSSIER'
  | 'BOILERPLATE_PLAGIARISM'
  | 'DOMAIN_PROVENANCE'
  | 'VENUE_CORROBORATION'
  | 'ALUMNI_FOOTPRINT'
  | 'IMAGE_PROVENANCE';

export const QUESTION_CATEGORIES = [
  'BACKGROUND',
  'LEGAL_IDENTITY',
  'VENUE_SCREENINGS',
  'FEES_POLICY',
  'JURY_AWARDS',
  'EXPERIENCE_FEEDBACK',
  'ORGANIZER_TRACK_RECORD',
  'SELECTION_PROFILE',
  'CORPORATE_REGISTRY',
  'PERSONNEL_DOSSIER',
  'BOILERPLATE_PLAGIARISM',
  'DOMAIN_PROVENANCE',
  'VENUE_CORROBORATION',
  'ALUMNI_FOOTPRINT',
  'IMAGE_PROVENANCE',
] as const;

export type ResearchDomain =
  | 'FESTIVAL'
  | 'ORGANIZER'
  | 'PARTICIPANTS'
  | 'FEES'
  | 'VENUES'
  | 'CLAIMS'
  | 'FIT';

export const RESEARCH_DOMAINS = [
  'FESTIVAL',
  'ORGANIZER',
  'PARTICIPANTS',
  'FEES',
  'VENUES',
  'CLAIMS',
  'FIT',
] as const;

export type Stance =
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'MENTIONS';

export const STANCES = [
  'SUPPORTS',
  'CONTRADICTS',
  'MENTIONS',
] as const;

export type ToolCallType =
  | 'configure_due_diligence'
  | 'configure_opportunity_scout'
  | 'compare_festivals_arena'
  | 'configure_grant_scout'
  | 'analyze_invitation_email';

export const TOOL_CALL_TYPES = [
  'configure_due_diligence',
  'configure_opportunity_scout',
  'compare_festivals_arena',
  'configure_grant_scout',
  'analyze_invitation_email',
] as const;

export type VerificationStatus =
  | 'CORROBORATED'
  | 'SUPPORTED'
  | 'DISPUTED'
  | 'UNVERIFIED'
  | 'VERIFIED_MATCH'
  | 'UNVERIFIED_EXCERPT';

export const VERIFICATION_STATUSES = [
  'CORROBORATED',
  'SUPPORTED',
  'DISPUTED',
  'UNVERIFIED',
  'VERIFIED_MATCH',
  'UNVERIFIED_EXCERPT',
] as const;

export type VettingSignalStatus =
  | 'VERIFIED_AUTHENTIC'
  | 'INFORMATIONAL'
  | 'AMBER_WARNING'
  | 'RED_FLAG'
  | 'MISMATCH'
  | 'INCONCLUSIVE';

export const VETTING_SIGNAL_STATUSES = [
  'VERIFIED_AUTHENTIC',
  'INFORMATIONAL',
  'AMBER_WARNING',
  'RED_FLAG',
  'MISMATCH',
  'INCONCLUSIVE',
] as const;

// ============================================================================
// 2. PYDANTIC DOMAIN INTERFACES
// ============================================================================

export interface CandidateEntity {
  id: string;
  name: string;
  entityType: string;
  officialDomain?: string;
  cityCountry?: string;
  foundedYear?: number;
  descriptor: string;
  sourceIds: string[];
}

export interface ActivityEventDetails {
  candidates?: CandidateEntity[];
}

export interface ActivityEvent {
  id: string;
  investigationId: string;
  timestamp: string;
  eventType: EventType;
  agentName: string;
  message: string;
  details?: ActivityEventDetails;
}

export interface ApproveOutreachRequest {
  draftId: string;
  payloadHash: string;
  userConfirmed: boolean;
}

export interface ClaimEvidence {
  sourceId: string;
  sourceUrl?: string;
  sourceDomain?: string;
  sourceTitle?: string;
  stance: Stance;
  exactExcerpt: string;
  note?: string;
  verificationStatus?: VerificationStatus;
  relevanceExplanation?: string;
  confidenceScore?: number;
  extractedAt?: string;
  retrievalQuery?: string;
  domainTier?: string;
}

export interface AtomicClaim {
  id: string;
  investigationId: string;
  researchDomain: ResearchDomain;
  category: QuestionCategory | string;
  statement: string;
  claimKind: ClaimKind;
  status: VerificationStatus;
  editionYear?: number;
  attributedTo?: string;
  evidence: ClaimEvidence[];
}

export interface AttachedFileMeta {
  name: string;
  content?: string;
  base64?: string;
  mimeType?: string;
  size?: number;
}

export interface ChatToolCall {
  id: string;
  toolName: ToolCallType;
  args: Record<string, unknown>;
}

export interface FollowUpOption {
  id: string;
  label: string;
  promptText: string;
  badge?: string;
}

export interface InteractiveFollowUpProbe {
  id: string;
  question: string;
  options: FollowUpOption[];
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  toolCall?: ChatToolCall;
  attachedFile?: AttachedFileMeta;
  suggestedReplies?: string[];
  followUpProbe?: InteractiveFollowUpProbe;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  attachedFileName?: string;
  attachedFileContent?: string;
  attachedFileBase64?: string;
  attachedFileMimeType?: string;
}

export interface CompareFestivalsToolArgs {
  festival_a: string;
  festival_b: string;
  key_comparison_vectors: string[];
  verdict_summary: string;
}

export interface ConfirmEntityRequest {
  name: string;
  entityType: string;
  officialDomain?: string;
  cityCountry?: string;
  foundedYear?: number;
  descriptor: string;
}

export interface CorporateEntity {
  legalName: string;
  registrationNumber?: string;
  status: string;
  incorporationDate?: string;
  registeredAddress?: string;
  associatedFestivals: string[];
  connectedEntities: string[];
  flags: string[];
  notes?: string;
}

export interface CreateInvestigationRequest {
  query: string;
  optionalUrl?: string;
  intent: string;
}

export interface ImageForensicRecord {
  id: string;
  assetType: ImageAssetType;
  claimedUrl: string;
  claimedDescription: string;
  classification: ImageMatchClassification;
  originMatchUrl?: string;
  originMatchTitle?: string;
  confidenceScore: number;
  forensicNotes: string;
}

export interface DeepVettingDimension {
  id: string;
  dimensionKey: string;
  title: string;
  category: QuestionCategory;
  status: VettingSignalStatus;
  confidenceScore: number;
  summary: string;
  signalsFound: string[];
  corroboratingSources: string[];
  riskWeight: string;
  imageArtifacts?: ImageForensicRecord[];
}

export interface KeyPerson {
  name: string;
  roles: string[];
  role?: string;
  appointmentDate?: string;
  companies?: string[];
  otherDirectorships?: string[];
  associatedFestivals?: string[];
  flags?: string[];
  isFestivalMillSuspect?: boolean;
  hasDistributionOverlap?: boolean;
  notes?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  companiesHouseUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  imdbUrl?: string;
  wikipediaUrl?: string;
  twitterUrl?: string;
}

export interface DeepVettingReport {
  festivalName: string;
  overallAuthenticityScore: number;
  totalFlags: number;
  dimensions: DeepVettingDimension[];
  keyPersonnel?: KeyPerson[];
  imageArtifacts?: ImageForensicRecord[];
  disclaimer?: string;
  generatedAt: string;
  degraded?: boolean;
}

export interface DisputeRecord {
  id: string;
  pointOfContention: string;
  category: string;
  editionYear?: number;
  claimA: string;
  evidenceA: ClaimEvidence[];
  claimB: string;
  evidenceB: ClaimEvidence[];
  guidance: string;
}

export interface DocumentAnalysisRequest {
  fileName: string;
  fileContent?: string;
  fileBase64?: string;
  mimeType?: string;
}

export interface DocumentAnalysisResult {
  detectedKind: DocumentAnalysisKind;
  fileName: string;
  fileSizeBytes: number;
  extractedSummary: string;
  filmTitle?: string;
  format?: FilmFormat;
  genre?: string;
  runtimeMinutes?: number;
  logline?: string;
  budgetTier?: string;
  suggestedPremiereGoal?: PremiereGoal;
  keyThemes: string[];
  festivalClaimed?: string;
  senderDomain?: string;
  feeWaiverOffered?: boolean;
  trophyFeeRequested?: boolean;
  redFlagSignals: string[];
  recommendedAction?: string;
}

export interface DossierContradictionClaim {
  statement: string;
  status?: string;
  claimKind?: string;
  researchDomain?: string;
}

export interface DossierContradiction {
  id: string;
  claimA: DossierContradictionClaim;
  claimB: DossierContradictionClaim;
  reconciliationNote?: string;
  domain?: string;
}

export interface FeeTier {
  tierName: string;
  amount: number;
  currency: string;
  deadlineDate?: string;
  surgePercentage: number;
}

export interface FeeEscalationModel {
  currency: string;
  tiers: FeeTier[];
  spikeAlert?: string;
  averageMarketFee?: string;
  percentile?: number;
}

export interface ForensicTrioItem {
  status: VettingSignalStatus;
  headline: string;
  summary: string;
  educationalContext?: string;
  signals: string[];
  relatedEntities?: string[];
}

export interface ForensicIntelligenceSummary {
  scamPattern: ForensicTrioItem;
  juryConflict: ForensicTrioItem;
  venueReality: ForensicTrioItem;
}

export interface PremiereRiskAssessment {
  riskScore: number;
  riskLevel: PremiereRiskLevel;
  premiereDemand: string;
  accreditationStatus: string;
  buyerPressFootprint: string;
  verdictRationale: string;
  recommendation: string;
}

export interface PreviousEditionAward {
  awardName: string;
  winnerTitle: string;
  recipientName?: string;
  recipientAvatarUrl?: string;
  winnerUrl?: string;
  imdbUrl?: string;
}

export interface PreviousEditionPress {
  headline: string;
  publisher: string;
  url?: string;
}

export interface PreviousEditionRecord {
  year: number;
  editionNumber?: string;
  heldLocation?: string;
  heldDates?: string;
  awards?: PreviousEditionAward[];
  pressCoverage?: PreviousEditionPress[];
  notes?: string;
}

export interface DossierReport {
  executiveSummary: string;
  festivalOverview: string;
  organizerProfile: string;
  participantFeedback: string;
  unresolvedQuestions: string[];
  filmmakerChecklist: string[];
  keyPersons?: string[];
  previousEditions?: PreviousEditionRecord[];
  corporateEntity?: CorporateEntity;
  premiereRisk?: PremiereRiskAssessment;
  feeEscalation?: FeeEscalationModel;
  forensicSummary?: ForensicIntelligenceSummary;
}

export interface DossierSourceSummary {
  id?: string;
  domain: string;
  url: string;
  title: string;
  sourceTier?: number;
  extractedClaimsCount?: number;
}

export interface TransparencyMetric {
  score: number;
  status: string;
  notes: string;
}

export interface TransparencyIndexBreakdown {
  screeningVenue?: TransparencyMetric;
  feeStructure?: TransparencyMetric;
  organizerTrackRecord?: TransparencyMetric;
  participantFeedback?: TransparencyMetric;
}

export interface DossierTransparencyIndex {
  score: number;
  confidenceLevel: string;
  breakdown?: TransparencyIndexBreakdown;
}

export interface DraftOutreachRequest {
  claimId?: string;
  disputeId?: string;
  targetType: string;
  filmmakerNote?: string;
}

export interface DueDiligenceToolArgs {
  festival_name: string;
  optional_url?: string;
  city_country?: string;
  suspected_concerns?: string[];
  user_context?: string[];
  preflight_summary: string;
}

export interface EvidenceDossier {
  id: string;
  investigationId: string;
  festivalName: string;
  officialDomain?: string;
  reportSummary: string;
  festivalDomainSummary?: string;
  organizerDomainSummary?: string;
  participantsDomainSummary?: string;
  fitDomainSummary?: string;
  contradictions?: DossierContradiction[];
  atomicClaims?: AtomicClaim[];
  transparencyIndex?: DossierTransparencyIndex;
  sources?: DossierSourceSummary[];
  overallRisk?: string;
  recommendedAction?: string;
  keyPersonnel?: KeyPerson[];
  deepVetting?: DeepVettingReport;
  corporateEntity?: CorporateEntity;
  previousEditions?: PreviousEditionRecord[];
  premiereRisk?: PremiereRiskAssessment;
  feeEscalation?: FeeEscalationModel;
  forensicSummary?: ForensicIntelligenceSummary;
  generatedAt?: string;
}

export interface FeedbackCreateRequest {
  rating: number;
  category: string;
  comment: string;
  authorName?: string;
  authorEmail?: string;
}

export interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  comment: string;
  authorName?: string;
  authorEmail?: string;
  timestamp: string;
  status: string;
}

export interface FestivalOpportunity {
  id: string;
  name: string;
  cityCountry: string;
  officialDomain?: string;
  nextDeadline: string;
  deadlineTier: string;
  feeEstimate: string;
  accreditationTags: string[];
  strategicFitRationale: string;
  eligibilityNotes: string;
  submissionUrl?: string;
}

export interface FilmProfile {
  title: string;
  year: string;
  genre: string;
  runtimeMinutes: number;
  premiereGoals: PremiereGoal[];
  targetRegions: string[];
  neverReleased: boolean;
  format?: FilmFormat;
  premiereGoal?: PremiereGoal;
  budgetTier?: string;
  targetDeadlineMonth?: string;
}

export interface GrantChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requiredFormat: string;
  priority: string;
  isCompleted: boolean;
  guidanceTip: string;
}

export interface GrantOpportunity {
  id: string;
  title: string;
  fundingBody: string;
  category: string;
  amountRange: string;
  deadlineDate?: string;
  deadlineLabel: string;
  eligibleStages: string[];
  eligibleRegions: string[];
  eligibleFormats: string[];
  keyCriteria: string[];
  guidelinesUrl?: string;
  applicationPortalUrl?: string;
  fitScore: number;
  fitRationale: string;
  officialUrl?: string;
  matchScore?: number;
  matchReason?: string;
  keyRequirements: string[];
  grantKind?: string;
}

export interface GrantChecklistRequest {
  grantId?: string;
  grantOpportunity?: GrantOpportunity;
  projectTitle: string;
  format: FilmFormat;
  genre: string;
  productionStage: string;
  budgetTier: string;
  directorName?: string;
  leadProducer?: string;
}

export interface GrantChecklistResponse {
  grantTitle: string;
  fundingBody: string;
  projectTitle: string;
  items: GrantChecklistItem[];
  readinessScore: number;
  packagingAdvice: string;
  submissionDeadline?: string;
}

export interface GrantExportKitRequest {
  checklist: GrantChecklistResponse;
}

export interface GrantExportKitResponse {
  markdownContent: string;
  sha256Digest: string;
  icsContent: string;
  exportTimestamp: string;
}

export interface GrantGuidelinesAnalysis {
  fundingBody: string;
  grantTitle: string;
  maxAwardAmount: string;
  matchFundingPercentage?: string;
  eligibilityCriteria: string[];
  nationalityOrResidencyRules: string[];
  requiredDeliverables: string[];
  keyDates: string[];
  culturalTestRequired: boolean;
  guidelineSummary: string;
}

export interface GrantScoutRequest {
  projectTitle: string;
  format: FilmFormat;
  genre: string;
  productionStage: string;
  budgetTier: string;
  fundingNeeded: string;
  filmmakerRegion: string;
  targetGrantTypes?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface GrantScoutResponse {
  projectTitle: string;
  grantsFound: number;
  grants: GrantOpportunity[];
  strategySummary: string;
  durationSeconds: number;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
  opportunitiesFound?: number;
  opportunities?: GrantOpportunity[];
}

export interface GrantScoutToolArgs {
  project_title: string;
  grant_category: string;
  target_amount: string;
  production_stage: string;
  filmmaker_region: string;
  recommended_grants?: string[];
  grant_strategy_summary: string;
}

export interface InvestigationAuditHealth {
  status: string;
  rawDomainClaimsReceived: number;
  assembledClaimsCount: number;
  sourcesCount: number;
  validationErrorsCount: number;
  validationErrors: string[];
  deepVettingVectorsCount: number;
  deepVettingInconclusiveCount: number;
  warnings: string[];
  executionDurationMs: number;
}

export interface OutreachDraft {
  id: string;
  investigationId: string;
  claimId?: string;
  targetAudience: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  payloadHash: string;
  status: ApprovalStatus;
  createdAt: string;
  executedAt?: string;
}

export interface SourceRecord {
  id: string;
  url: string;
  domain: string;
  title: string;
  publishedDate?: string;
  retrievedAt: string;
  excerpts: string[];
  sourceTier: number;
  contentHash: string;
  discoveredByQuery?: string;
}

export interface Investigation {
  id: string;
  status: InvestigationStatus;
  query: string;
  optionalUrl?: string;
  intent: string;
  createdAt: string;
  updatedAt: string;
  candidates: CandidateEntity[];
  confirmedEntity?: CandidateEntity;
  sourcesCount: number;
  claimsCount: number;
  dossier?: DossierReport;
  disputes: DisputeRecord[];
  claims?: AtomicClaim[];
  sources?: SourceRecord[];
  outreachDrafts?: OutreachDraft[];
  deepVetting?: DeepVettingReport;
  auditHealth?: InvestigationAuditHealth;
  premiereRisk?: PremiereRiskAssessment;
  feeEscalation?: FeeEscalationModel;
  forensicSummary?: ForensicIntelligenceSummary;
}

export interface InvitationEmailToolArgs {
  festival_claimed: string;
  sender_domain: string;
  fee_waiver_offered: boolean;
  upfront_payment_requested?: string;
  red_flag_signals: string[];
  initial_verdict: string;
}

export interface NotificationSubscriptionRequest {
  email?: string;
  pushSubscription?: Record<string, unknown>;
}

export interface OpportunityScoutToolArgs {
  film_title: string;
  format: FilmFormat;
  genre: string;
  runtime_minutes: number;
  premiere_goal: PremiereGoal;
  budget_tier: string;
  target_regions: string[];
  strategy_rationale: string;
}

export interface ParseGrantGuidelinesRequest {
  fileName: string;
  fileContent: string;
  mimeType?: string;
}

export interface ScoutRequest {
  profile: FilmProfile;
}

export interface ScoutResponse {
  filmTitle: string;
  opportunitiesFound: number;
  opportunities: FestivalOpportunity[];
  strategySummary: string;
  durationSeconds: number;
}

export interface TaskDisambiguatePayload {
  investigation_id: string;
  query: string;
  optional_url?: string;
}

export interface TaskPipelinePayload {
  investigation_id: string;
  entity: Record<string, unknown>;
  intent: string;
}

export interface TestPipelineRequest {
  festivalName: string;
  optionalUrl?: string;
  additionalContext?: string;
  intent: string;
}

export interface TestPipelineResponse {
  festivalName: string;
  sourcesFound: number;
  sources: SourceRecord[];
  extractedClaims: AtomicClaim[];
  deepVetting?: DeepVettingReport;
  summaryNarrative: string;
  durationSeconds: number;
}

// ============================================================================
// 3. CANONICAL CONVENIENCE ALIASES
// ============================================================================

export type Evidence = ClaimEvidence;
export type DossierType = EvidenceDossier;
export type DueDiligenceArgs = DueDiligenceToolArgs;
export type OpportunityScoutArgs = OpportunityScoutToolArgs;
export type CompareFestivalsArgs = CompareFestivalsToolArgs;
export type GrantScoutArgs = GrantScoutToolArgs;
export type InvitationEmailArgs = InvitationEmailToolArgs;
