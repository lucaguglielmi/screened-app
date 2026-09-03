"""Dedicated router for Film Grant & Public Funding Diligence Engine (Phases 2 & 3)."""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.models import (
    GrantScoutRequest,
    GrantScoutResponse,
    GrantOpportunity,
    ParseGrantGuidelinesRequest,
    GrantGuidelinesAnalysis,
    GrantChecklistRequest,
    GrantChecklistResponse,
    GrantExportKitRequest,
    GrantExportKitResponse,
)
from backend.agents.opportunity_scout import OpportunityScoutAgent
from backend.services.gemini_client import GeminiClient
from backend.tools.parallel_search import ParallelSearchTool

logger = logging.getLogger("screened.routers.grants")
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/grants", tags=["grants"])
gemini_client = GeminiClient()
parallel_tool = ParallelSearchTool()
opportunity_scout = OpportunityScoutAgent(parallel_tool=parallel_tool, gemini=gemini_client)


@router.post("/scout", response_model=GrantScoutResponse)
@limiter.limit("20/minute")
async def scout_film_grants(req: GrantScoutRequest, request: Request):
    """Discover institutional public film funds, grants, and regional production support with pagination and sorting."""
    try:
        response = await opportunity_scout.scout_grants(req)
        return response
    except Exception as e:
        logger.exception(f"Grant scout failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during grant scouting")


@router.post("/parse-guidelines", response_model=GrantGuidelinesAnalysis)
@limiter.limit("15/minute")
async def parse_grant_guidelines(req: ParseGrantGuidelinesRequest, request: Request):
    """Extract clause-by-clause eligibility, funding caps, and deliverables from official guidelines."""
    try:
        analysis = await opportunity_scout.parse_guidelines(req)
        return analysis
    except Exception as e:
        logger.exception(f"Guideline parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during guideline parsing")


@router.post("/checklist", response_model=GrantChecklistResponse)
@limiter.limit("20/minute")
async def generate_grant_checklist(req: GrantChecklistRequest, request: Request):
    """Generate a bespoke 4-pillar submission packaging checklist tailored to a target grant."""
    try:
        checklist = await opportunity_scout.generate_checklist(req)
        return checklist
    except Exception as e:
        logger.exception(f"Checklist generation failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during checklist generation")


@router.post("/checklist/export", response_model=GrantExportKitResponse)
@limiter.limit("20/minute")
async def export_submission_readiness_kit(req: GrantExportKitRequest, request: Request):
    """Export 1-click tailored submission readiness kit with Markdown binder, ICS calendar, and SHA-256 seal."""
    try:
        export_kit = opportunity_scout.export_readiness_kit(req)
        return export_kit
    except Exception as e:
        logger.exception(f"Readiness kit export failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during readiness kit export")


@router.get("/catalog", response_model=List[GrantOpportunity])
@limiter.limit("30/minute")
async def get_grant_catalog(request: Request, region: Optional[str] = None):
    """Retrieve verified catalog of international, European, North American, and UK film funds."""
    try:
        req = GrantScoutRequest(
            projectTitle="Catalog Query",
            filmmakerRegion=region or "International",
        )
        return opportunity_scout.get_curated_grants(req)
    except Exception as e:
        logger.exception(f"Grant catalog retrieval failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during catalog retrieval")
