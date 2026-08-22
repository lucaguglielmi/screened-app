export type ResearchDomain = 'FESTIVAL' | 'ORGANIZER' | 'PARTICIPANTS' | 'FIT';

export type ClaimKind = 'FACT' | 'ALLEGATION' | 'OPINION';

export type VerificationStatus = 'CORROBORATED' | 'SUPPORTED' | 'DISPUTED' | 'UNVERIFIED';

export type Stance = 'SUPPORTS' | 'CONTRADICTS' | 'MENTIONS';

export type DetailDensity = 'SUMMARY' | 'STANDARD' | 'EVIDENCE';

export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED_SANDBOX';

export type ActiveTool = 'CONVERSATIONAL_DESK' | 'DUE_DILIGENCE' | 'OPPORTUNITY_SCOUT' | 'DESIGN_PLAYGROUND' | 'WHY_SCREENED';



export type FilmFormat = 'SHORT' | 'FEATURE' | 'DOCUMENTARY' | 'ANIMATION' | 'EPISODIC';

export type PremiereGoal = 'WORLD_PREMIERE' | 'INTERNATIONAL_PREMIERE' | 'NATIONAL_PREMIERE' | 'NO_PREFERENCE';

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
  sourceUrl?: string;
  sourceDomain?: string;
  sourceTitle?: string;
  stance: Stance;
  exactExcerpt: string;
  note?: string;
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
  publishedDate?: string;
  retrievedAt: string;
  excerpts: string[];
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

export interface DossierReport {
  executiveSummary: string;
  festivalOverview: string;
  organizerProfile: string;
  participantFeedback: string;
  unresolvedQuestions: string[];
  filmmakerChecklist: string[];
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
  format: FilmFormat;
  genre: string;
  runtimeMinutes: number;
  premiereGoal: PremiereGoal;
  targetRegions: string[];
  budgetTier: string;
  targetDeadlineMonth?: string;
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

export interface ActivityEvent {
  id: string;
  investigationId: string;
  timestamp: string;
  eventType: string;
  agentName: string;
  message: string;
  details?: any;
}

export type VettingSignalStatus = 'VERIFIED_AUTHENTIC' | 'INFORMATIONAL' | 'AMBER_WARNING' | 'RED_FLAG' | 'INCONCLUSIVE';

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
}

export interface DeepVettingReport {
  festivalName: string;
  overallAuthenticityScore: number;
  totalFlags: number;
  dimensions: DeepVettingDimension[];
  generatedAt: string;
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
}
