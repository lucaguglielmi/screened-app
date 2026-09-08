"""Canonical Pydantic models for Screened."""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
import uuid

from backend.models.base import *
from backend.models.investigation import *
from backend.models.deep_vetting import *
from backend.models.dossier import *

class FilmProfile(BaseModel):
    title: str = "Untitled Project"
    year: str = ""
    genre: str = "Drama"
    runtimeMinutes: int = 15
    premiereGoals: List[PremiereGoal] = Field(default_factory=lambda: [PremiereGoal.WORLD_PREMIERE])
    targetRegions: List[str] = Field(default_factory=lambda: ["UK & Europe", "North America"])
    neverReleased: bool = False
    format: Optional[FilmFormat] = FilmFormat.SHORT
    premiereGoal: Optional[PremiereGoal] = PremiereGoal.WORLD_PREMIERE
    budgetTier: Optional[str] = "Micro / Indie (< $100k)"
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
    targetGrantTypes: Optional[List[str]] = None
    page: Optional[int] = 1
    pageSize: Optional[int] = 10
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

