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

class ToolCallType(str, Enum):
    CONFIGURE_DUE_DILIGENCE = "configure_due_diligence"
    CONFIGURE_OPPORTUNITY_SCOUT = "configure_opportunity_scout"
    COMPARE_FESTIVALS_ARENA = "compare_festivals_arena"
    CONFIGURE_GRANT_SCOUT = "configure_grant_scout"
    ANALYZE_INVITATION_EMAIL = "analyze_invitation_email"
    COLLECT_FEATURE_FEEDBACK = "collect_feature_feedback"

class FeatureFeedbackToolArgs(BaseModel):
    """Arguments for the Fake Door Test feedback tool."""
    feature_name: str
    pitch: str = "We are currently evaluating this feature for our next release cycle."
    prompt_question: str = "What would you like and what are you trying to achieve?"
    suggested_options: List[str] = Field(default_factory=list)
    prefill_category: str = "FEATURE_REQUEST"

class DueDiligenceToolArgs(BaseModel):
    festival_name: str
    optional_url: Optional[str] = None
    city_country: Optional[str] = None
    suspected_concerns: Optional[List[str]] = None
    user_context: Optional[List[str]] = None
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
    recommended_grants: Optional[List[str]] = None
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

class AttachedFileMeta(BaseModel):
    name: str
    content: Optional[str] = None
    base64: Optional[str] = None
    mimeType: Optional[str] = None
    size: Optional[int] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    role: str  # "user" | "assistant" | "system"
    content: str
    toolCall: Optional[ChatToolCall] = None
    attachedFile: Optional[AttachedFileMeta] = None
    suggestedReplies: Optional[List[str]] = None
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

class SearchModeConfigResponse(BaseModel):
    current_mode: str
    available_modes: List[str] = ["fast", "basic", "advanced"]
    cost_table: Dict[str, str]

class SetSearchModeRequest(BaseModel):
    mode: str

class BenchmarkSearchRequest(BaseModel):
    target_name: str
    country: Optional[str] = None
    modes: List[str] = ["fast", "basic", "advanced"]

class ModeBenchmarkMetric(BaseModel):
    mode: str
    latency_ms: int
    records_found: int
    unique_domains: int
    mean_excerpt_chars: int
    estimated_cost_usd: float
    tier1_source_count: int
    top_domains: List[str] = Field(default_factory=list)
    sample_titles: List[str] = Field(default_factory=list)
    simulated_or_live: str = "live"

class BenchmarkSearchResponse(BaseModel):
    target_name: str
    timestamp: str
    comparisons: List[ModeBenchmarkMetric]
    key_takeaway: str

