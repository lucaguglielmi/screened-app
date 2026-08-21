"""Main FastAPI Application for Screened."""
import logging
import os
import time
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import settings
from backend.models import (
    ResearchDomain,
    TestPipelineRequest,
    TestPipelineResponse,
)
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient

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

# Initialize tool clients
parallel_tool = ParallelSearchTool()
gemini_client = GeminiClient()


@app.get("/healthz")
async def health_check():
    """Liveness probe returning application health and version."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "parallel_configured": bool(settings.parallel_api_key),
    }


@app.post("/api/test-pipeline", response_model=TestPipelineResponse)
async def test_walking_skeleton_pipeline(request: TestPipelineRequest):
    """Walking skeleton test endpoint executing live Parallel Search + Gemini claim extraction."""
    start_time = time.time()
    subject = request.festivalName.strip()
    if not subject:
        raise HTTPException(status_code=400, detail="Festival name is required")

    logger.info(f"Triggering Walking Skeleton pipeline for: {subject}")

    try:
        # Step 1: Parallel Search Discovery
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

        # Step 2: Gemini Claim Extraction
        claims = await gemini_client.extract_claims_from_sources(
            subject_name=subject,
            sources=sources,
            research_domain=ResearchDomain.FESTIVAL,
        )

        # Step 3: Gemini Summary Synthesis
        summary = await gemini_client.generate_dossier_summary(
            subject_name=subject,
            claims=claims,
        )

        duration = round(time.time() - start_time, 2)
        logger.info(f"Pipeline completed in {duration}s. Sources: {len(sources)}, Claims: {len(claims)}")

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
