"""Main FastAPI Application for Screened."""
import logging
import time
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from backend.config import settings
from backend.models import (
    ResearchDomain,
    TestPipelineRequest,
    TestPipelineResponse,
)
from backend.db.firestore import db
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient
from backend.orchestrator.events import broadcaster
from backend.orchestrator.state_machine import orchestrator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("screened.main")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Agentic Cinema Due-Diligence Workspace (Parallel Track)",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parallel_tool = ParallelSearchTool()
gemini_client = GeminiClient()


class CreateInvestigationRequest(BaseModel):
    query: str
    optionalUrl: Optional[str] = None
    intent: str = "Vet before submitting"


class ConfirmEntityRequest(BaseModel):
    name: str
    entityType: str = "FESTIVAL"
    officialDomain: Optional[str] = None
    cityCountry: Optional[str] = None
    foundedYear: Optional[int] = None
    descriptor: str = ""


@app.get("/healthz")
async def health_check():
    """Liveness probe returning application health, GCP status, and Parallel SDK status."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "parallel_configured": bool(settings.parallel_api_key),
        "gcp_project": settings.google_cloud_project,
        "gcp_location": settings.google_cloud_location,
    }


@app.post("/api/investigations")
async def create_investigation(req: CreateInvestigationRequest):
    """Start a new festival investigation and trigger disambiguation."""
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Festival query is required")

    inv = await orchestrator.start_investigation(
        query=query,
        optional_url=req.optionalUrl,
        intent=req.intent,
    )
    return inv


@app.get("/api/investigations/{investigation_id}")
async def get_investigation(investigation_id: str):
    """Retrieve full investigation state including confirmed entity and dossier."""
    inv = await db.get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    claims = await db.get_claims(investigation_id)
    sources = await db.get_sources(investigation_id)

    inv["claims"] = claims
    inv["sources"] = sources
    return inv


@app.post("/api/investigations/{investigation_id}/confirm-entity")
async def confirm_entity(investigation_id: str, req: ConfirmEntityRequest):
    """Confirm disambiguated entity and launch parallel 3-domain research core."""
    try:
        inv = await orchestrator.confirm_entity(
            investigation_id=investigation_id,
            entity_data=req.model_dump(),
        )
        return inv
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to confirm entity: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/investigations/{investigation_id}/events")
async def stream_investigation_events(investigation_id: str):
    """Server-Sent Events (SSE) streaming real-time multi-agent activity."""
    return StreamingResponse(
        broadcaster.event_generator(investigation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/test-pipeline", response_model=TestPipelineResponse)
async def test_walking_skeleton_pipeline(request: TestPipelineRequest):
    """Walking skeleton test endpoint executing live Parallel Search + Gemini claim extraction."""
    start_time = time.time()
    subject = request.festivalName.strip()
    if not subject:
        raise HTTPException(status_code=400, detail="Festival name is required")

    logger.info(f"Triggering Walking Skeleton pipeline for: {subject}")

    try:
        search_queries = [
            f"{subject} submission fees screening venue",
            f"{subject} film festival edition history awards",
        ]
        objective = f"Discover official policies, submission fees, venue locations, and organizer details for {subject}"
        
        sources = await parallel_tool.search(
            queries=search_queries,
            objective=objective,
            mode="basic",
            max_results=6,
        )

        claims = await gemini_client.extract_claims_from_sources(
            subject_name=subject,
            sources=sources,
            research_domain=ResearchDomain.FESTIVAL,
        )

        summary = await gemini_client.generate_dossier_summary(
            subject_name=subject,
            claims=claims,
        )

        duration = round(time.time() - start_time, 2)
        return TestPipelineResponse(
            festivalName=subject,
            sourcesFound=len(sources),
            sources=sources,
            extractedClaims=claims,
            summaryNarrative=summary,
            durationSeconds=duration,
        )

    except Exception as e:
        logger.error(f"Walking skeleton pipeline failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Mount Frontend static files if built
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
