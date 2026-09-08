"""Canonical Pydantic models for Screened."""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
import uuid

from backend.models.base import *

class CorporateEntity(BaseModel):
    legalName: str
    registrationNumber: Optional[str] = None
    status: str = "ACTIVE"
    incorporationDate: Optional[str] = None
    registeredAddress: Optional[str] = None
    associatedFestivals: List[str] = Field(default_factory=list)
    connectedEntities: List[str] = Field(default_factory=list)
    flags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

class TransparencyMetric(BaseModel):
    score: int = 80
    status: str = "HIGH"  # 'HIGH' | 'MEDIUM' | 'LOW'
    notes: str = ""

class TransparencyIndexBreakdown(BaseModel):
    screeningVenue: Optional[TransparencyMetric] = None
    feeStructure: Optional[TransparencyMetric] = None
    organizerTrackRecord: Optional[TransparencyMetric] = None
    participantFeedback: Optional[TransparencyMetric] = None

class DossierTransparencyIndex(BaseModel):
    score: int = 80
    confidenceLevel: str = "HIGH"
    breakdown: Optional[TransparencyIndexBreakdown] = None

class DossierContradictionClaim(BaseModel):
    statement: str
    status: Optional[str] = None
    claimKind: Optional[str] = None
    researchDomain: Optional[str] = None

class DossierContradiction(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    claimA: DossierContradictionClaim
    claimB: DossierContradictionClaim
    reconciliationNote: Optional[str] = None
    domain: Optional[str] = None

class DossierSourceSummary(BaseModel):
    id: Optional[str] = None
    domain: str
    url: str
    title: str
    sourceTier: Optional[int] = 2
    extractedClaimsCount: Optional[int] = None

class DossierReport(BaseModel):
    executiveSummary: str
    festivalOverview: str = ""
    organizerProfile: str = ""
    participantFeedback: str = ""
    unresolvedQuestions: List[str] = Field(default_factory=list)
    filmmakerChecklist: List[str] = Field(default_factory=list)
    keyPersons: Optional[List[str]] = None
    previousEditions: Optional[List[PreviousEditionRecord]] = None
    corporateEntity: Optional[CorporateEntity] = None
    premiereRisk: Optional[PremiereRiskAssessment] = None
    feeEscalation: Optional[FeeEscalationModel] = None
    forensicSummary: Optional[ForensicIntelligenceSummary] = None

class EvidenceDossier(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    investigationId: str
    festivalName: str
    officialDomain: Optional[str] = None
    reportSummary: str
    festivalDomainSummary: Optional[str] = None
    organizerDomainSummary: Optional[str] = None
    participantsDomainSummary: Optional[str] = None
    fitDomainSummary: Optional[str] = None
    contradictions: Optional[List[DossierContradiction]] = None
    atomicClaims: Optional[List[AtomicClaim]] = None
    transparencyIndex: Optional[DossierTransparencyIndex] = None
    sources: Optional[List[DossierSourceSummary]] = None
    overallRisk: Optional[str] = None
    recommendedAction: Optional[str] = None
    keyPersonnel: Optional[List[KeyPerson]] = None
    deepVetting: Optional[DeepVettingReport] = None
    corporateEntity: Optional[CorporateEntity] = None
    previousEditions: Optional[List[PreviousEditionRecord]] = None
    premiereRisk: Optional[PremiereRiskAssessment] = None
    feeEscalation: Optional[FeeEscalationModel] = None
    forensicSummary: Optional[ForensicIntelligenceSummary] = None
    generatedAt: Optional[str] = None

class PreviousEditionAward(BaseModel):
    awardName: str
    winnerTitle: str
    recipientName: Optional[str] = None
    recipientAvatarUrl: Optional[str] = None
    winnerUrl: Optional[str] = None
    imdbUrl: Optional[str] = None

class PreviousEditionPress(BaseModel):
    headline: str
    publisher: str
    url: Optional[str] = None

class PreviousEditionRecord(BaseModel):
    year: int
    editionNumber: Optional[str] = None
    heldLocation: Optional[str] = None
    heldDates: Optional[str] = None
    awards: Optional[List[PreviousEditionAward]] = None
    pressCoverage: Optional[List[PreviousEditionPress]] = None
    notes: Optional[str] = None

