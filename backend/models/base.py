"""Canonical Pydantic models for Screened."""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
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
    FEES = "FEES"
    VENUES = "VENUES"
    CLAIMS = "CLAIMS"
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
    MISMATCH = "MISMATCH"
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
    SIMPLIFIED = "SIMPLIFIED"
    BALANCED = "BALANCED"
    FULL_EVIDENCE = "FULL_EVIDENCE"
    MACHINE_AI_INGESTION = "MACHINE_AI_INGESTION"
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

