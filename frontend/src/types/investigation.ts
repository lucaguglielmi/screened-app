export type ResearchDomain = 'FESTIVAL' | 'ORGANIZER' | 'PARTICIPANTS' | 'FIT';

export type ClaimKind = 'FACT' | 'ALLEGATION' | 'OPINION';

export type VerificationStatus = 'CORROBORATED' | 'SUPPORTED' | 'DISPUTED' | 'UNVERIFIED';

export type Stance = 'SUPPORTS' | 'CONTRADICTS' | 'MENTIONS';

export type InvestigationStatus = 
  | 'DRAFT'
  | 'DISAMBIGUATING'
  | 'AWAITING_ENTITY_CONFIRMATION'
  | 'PLANNING'
  | 'RESEARCHING'
  | 'ANALYZING_CONTRADICTIONS'
  | 'ASSEMBLING_DOSSIER'
  | 'READY'
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

export interface ActivityEvent {
  id: string;
  investigationId: string;
  timestamp: string;
  eventType: string;
  agentName: string;
  message: string;
  details?: any;
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
}
