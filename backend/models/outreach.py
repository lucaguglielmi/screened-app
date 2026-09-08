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

