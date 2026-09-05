export type ResearchDomain = 'FESTIVAL' | 'ORGANIZER' | 'PARTICIPANTS' | 'FEES' | 'VENUES' | 'CLAIMS' | 'FIT';

export type ClaimKind = 'FACT' | 'ALLEGATION' | 'OPINION';

export type VerificationStatus = 'CORROBORATED' | 'SUPPORTED' | 'DISPUTED' | 'UNVERIFIED';

export type Stance = 'SUPPORTS' | 'CONTRADICTS' | 'MENTIONS';

export type DetailDensity =
  | 'SIMPLIFIED'
  | 'BALANCED'
  | 'FULL_EVIDENCE'
  | 'MACHINE_AI_INGESTION'
  | 'SUMMARY'
  | 'STANDARD'
  | 'EVIDENCE';

export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED_SANDBOX';

export type ActiveTool =
  | 'CONVERSATIONAL_DESK'
  | 'DUE_DILIGENCE'
  | 'GRANT_SCOUT'
  | 'OPPORTUNITY_SCOUT'
  | 'DESIGN_PLAYGROUND'
  | 'WHY_SCREENED'
  | 'FESTIVAL_PROTECTION_GUIDE'
  | 'HOW_TO_USE';

export type FilmFormat = 'SHORT' | 'FEATURE' | 'DOCUMENTARY' | 'ANIMATION' | 'EPISODIC';

export type PremiereGoal =
  'WORLD_PREMIERE' | 'INTERNATIONAL_PREMIERE' | 'NATIONAL_PREMIERE' | 'NO_PREFERENCE';

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

export interface Evidence {
  sourceId: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string;
  exactExcerpt: string;
  relevanceExplanation?: string;
  confidenceScore?: number;
  extractedAt?: string;
  retrievalQuery?: string;
  domainTier?: string;
  note?: string;
  stance?: Stance;
}

export interface AtomicClaim {
  id: string;
  investigationId: string;
  researchDomain: ResearchDomain;
  category: string;
  statement: string;
  claimKind: ClaimKind;
  status: VerificationStatus;
  editionYear?: number;
  attributedTo?: string;
  evidence: Evidence[];
}

export interface SourceRecord {
  id: string;
  url: string;
  domain: string;
  title: string;
  publisher?: string;
  firstSeenAt: string;
  sourceTier: number;
  contentHash: string;
}

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

export interface DisputeRecord {
  id: string;
  pointOfContention: string;
  category: string;
  editionYear?: number;
  claimA: string;
  evidenceA: Evidence[];
  claimB: string;
  evidenceB: Evidence[];
  guidance: string;
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

export type PremiereRiskLevel = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_BURN_RISK';

export interface PremiereRiskAssessment {
  riskScore: number;
  riskLevel: PremiereRiskLevel;
  premiereDemand: string;
  accreditationStatus: string;
  buyerPressFootprint: string;
  verdictRationale: string;
  recommendation: string;
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
  status: 'VERIFIED_AUTHENTIC' | 'INFORMATIONAL' | 'AMBER_WARNING' | 'RED_FLAG' | 'MISMATCH';
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

export interface TransparencyMetric {
  score: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
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
  contradictions?: Array<{
    id: string;
    claimA: { statement: string; status?: string; claimKind?: string; researchDomain?: string };
    claimB: { statement: string; status?: string; claimKind?: string; researchDomain?: string };
    reconciliationNote?: string;
    domain?: string;
  }>;
  atomicClaims?: AtomicClaim[];
  transparencyIndex?: {
    score: number;
    confidenceLevel: string;
    breakdown?: {
      screeningVenue?: TransparencyMetric;
      feeStructure?: TransparencyMetric;
      organizerTrackRecord?: TransparencyMetric;
      participantFeedback?: TransparencyMetric;
    };
  };
  sources?: Array<{
    id: string;
    domain: string;
    url: string;
    title: string;
    sourceTier: number;
    extractedClaimsCount?: number;
  }>;
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

export interface DiagramGraphPayload {
  nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
  }>;
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

export interface FilmProfile {
  title: string;
  year: string;
  genre: string;
  runtimeMinutes: number;
  premiereGoals: PremiereGoal[];
  targetRegions: string[];
  neverReleased: boolean;
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

export interface ScoutResponse {
  filmTitle: string;
  opportunitiesFound: number;
  opportunities: FestivalOpportunity[];
  strategySummary: string;
  durationSeconds: number;
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
}

export interface ParseGrantGuidelinesRequest {
  fileName: string;
  fileContent: string;
  mimeType?: string;
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

export interface GrantChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requiredFormat: string;
  priority: 'Critical' | 'Recommended' | 'Optional';
  isCompleted: boolean;
  guidanceTip: string;
}

export interface GrantChecklistRequest {
  grantId?: string;
  grantOpportunity?: GrantOpportunity;
  projectTitle: string;
  format?: FilmFormat;
  genre?: string;
  productionStage?: string;
  budgetTier?: string;
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


export interface ActivityEvent {
  id: string;
  investigationId: string;
  timestamp: string;
  eventType: string;
  agentName: string;
  message: string;
  details?: {
    candidates?: CandidateEntity[];
    [key: string]: unknown;
  };
}

export type VettingSignalStatus =
  'VERIFIED_AUTHENTIC' | 'INFORMATIONAL' | 'AMBER_WARNING' | 'RED_FLAG' | 'INCONCLUSIVE';

export interface KeyPerson {
  name: string;
  roles: string[];
  companies?: string[];
  associatedFestivals?: string[];
  isFestivalMillSuspect?: boolean;
  hasDistributionOverlap?: boolean;
  flags?: string[];
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

export type ImageAssetType =
  | 'LAUREL_GRAPHIC'
  | 'VENUE_PHOTO'
  | 'RED_CARPET'
  | 'AWARD_TROPHY'
  | 'JURY_HEADSHOT';

export type ImageMatchClassification =
  | 'STOCK_PHOTO'
  | 'TEMPLATE_LAUREL'
  | 'AUTHENTIC_LIVE'
  | 'SYNTHETIC_RENDER'
  | 'CLONED_ACROSS_NETWORK'
  | 'INCONCLUSIVE';

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
  category: string;
  status: VettingSignalStatus;
  confidenceScore: number;
  summary: string;
  signalsFound: string[];
  corroboratingSources: string[];
  riskWeight: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageArtifacts?: ImageForensicRecord[];
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
}

export interface InvestigationAuditHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'EMPTY_WARNING' | 'CRITICAL_FAILURE';
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
}
