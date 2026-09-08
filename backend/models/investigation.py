"""Canonical Pydantic models for Screened."""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
import uuid

from backend.models.base import *

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
    stance: Stance = Stance.SUPPORTS
    exactExcerpt: str
    note: Optional[str] = None
    verificationStatus: Optional[VerificationStatus] = None
    relevanceExplanation: Optional[str] = None
    confidenceScore: Optional[int] = None
    extractedAt: Optional[str] = None
    retrievalQuery: Optional[str] = None
    domainTier: Optional[str] = None

Evidence = ClaimEvidence

class AtomicClaim(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    investigationId: str = ""
    researchDomain: ResearchDomain
    category: Union[QuestionCategory, str] = QuestionCategory.BACKGROUND
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

class DisputeRecord(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    pointOfContention: str
    category: str
    editionYear: Optional[int] = None
    claimA: str
    evidenceA: List[ClaimEvidence] = Field(default_factory=list)
    claimB: str
    evidenceB: List[ClaimEvidence] = Field(default_factory=list)
    guidance: str

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

class Investigation(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    status: InvestigationStatus = InvestigationStatus.DRAFT
    query: str
    optionalUrl: Optional[str] = None
    intent: str = "Vet before submitting"
    createdAt: str = Field(default_factory=get_current_iso)
    updatedAt: str = Field(default_factory=get_current_iso)
    candidates: List[CandidateEntity] = Field(default_factory=list)
    confirmedEntity: Optional[CandidateEntity] = None
    sourcesCount: int = 0
    claimsCount: int = 0
    dossier: Optional[DossierReport] = None
    disputes: List[DisputeRecord] = Field(default_factory=list)
    claims: Optional[List[AtomicClaim]] = Field(default_factory=list)
    sources: Optional[List[SourceRecord]] = Field(default_factory=list)
    outreachDrafts: Optional[List[OutreachDraft]] = Field(default_factory=list)
    deepVetting: Optional[DeepVettingReport] = None
    auditHealth: Optional[InvestigationAuditHealth] = None
    premiereRisk: Optional[PremiereRiskAssessment] = None
    feeEscalation: Optional[FeeEscalationModel] = None
    forensicSummary: Optional[ForensicIntelligenceSummary] = None

class CreateInvestigationRequest(BaseModel):
    query: str = Field(..., max_length=200)
    optionalUrl: Optional[str] = Field(None, max_length=500)
    intent: str = Field("Vet before submitting", max_length=100)

class ConfirmEntityRequest(BaseModel):
    name: str = Field(..., max_length=200)
    entityType: str = Field("FESTIVAL", max_length=50)
    officialDomain: Optional[str] = Field(None, max_length=500)
    cityCountry: Optional[str] = Field(None, max_length=200)
    foundedYear: Optional[int] = None
    descriptor: str = Field("", max_length=1000)

class TaskDisambiguatePayload(BaseModel):
    investigation_id: str
    query: str
    optional_url: Optional[str] = None

class TaskPipelinePayload(BaseModel):
    investigation_id: str
    entity: Dict[str, Any] = Field(default_factory=dict)
    intent: str = "Vet before submitting"

class EventType(str, Enum):
    INVESTIGATION_STARTED = "INVESTIGATION_STARTED"
    DISAMBIGUATING = "DISAMBIGUATING"
    CANDIDATES_FOUND = "CANDIDATES_FOUND"
    ENTITY_CONFIRMED = "ENTITY_CONFIRMED"
    PLANNING_STARTED = "PLANNING_STARTED"
    PLAN_READY = "PLAN_READY"
    DOMAIN_SEARCH_STARTED = "DOMAIN_SEARCH_STARTED"
    DOMAIN_SEARCH_COMPLETED = "DOMAIN_SEARCH_COMPLETED"
    CLAIMS_EXTRACTING = "CLAIMS_EXTRACTING"
    CLAIMS_EXTRACTED = "CLAIMS_EXTRACTED"
    CONTRADICTIONS_ANALYZING = "CONTRADICTIONS_ANALYZING"
    CONTRADICTION_DETECTED = "CONTRADICTION_DETECTED"
    DOSSIER_SYNTHESIZING = "DOSSIER_SYNTHESIZING"
    DEEP_VETTING_ANALYZING = "DEEP_VETTING_ANALYZING"
    DEEP_VETTING_COMPLETED = "DEEP_VETTING_COMPLETED"
    DOSSIER_READY = "DOSSIER_READY"
    WATCHDOG_ESCALATION = "WATCHDOG_ESCALATION"
    WATCH_EVENT_RECEIVED = "WATCH_EVENT_RECEIVED"
    TASK_RUN_PROGRESS = "TASK_RUN_PROGRESS"
    TASK_RUN_SOURCE_STATS = "TASK_RUN_SOURCE_STATS"
    ERROR = "ERROR"

class ActivityEventDetails(BaseModel):
    candidates: Optional[List[CandidateEntity]] = None
    model_config = {"extra": "allow"}

class ActivityEvent(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    investigationId: str
    timestamp: str = Field(default_factory=get_current_iso)
    eventType: EventType
    agentName: str
    message: str
    details: Optional[ActivityEventDetails] = None


class PrivacyEraseRequest(BaseModel):
    email: Optional[str] = Field(None, description="Email address to scrub across notification subscriptions and feedback.")
    sessionId: Optional[str] = Field(None, description="Session ID to scrub across conversational history.")


class PrivacyEraseResponse(BaseModel):
    status: str
    erasedRecordsCount: int
    message: str

