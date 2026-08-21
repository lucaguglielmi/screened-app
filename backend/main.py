"""Main FastAPI Application for Screened."""
import logging
import time
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, PlainTextResponse
from pydantic import BaseModel

from backend.config import settings
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    DraftOutreachRequest,
    ApproveOutreachRequest,
    OutreachDraft,
    ResearchDomain,
    TestPipelineRequest,
    TestPipelineResponse,
)
from backend.db.firestore import db
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient
from backend.services.approval_service import approval_service
from backend.services.export_service import export_service
from backend.agents.outreach_drafter import OutreachDrafterAgent
from backend.orchestrator.events import broadcaster, EventType
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
outreach_drafter = OutreachDrafterAgent(gemini_client)


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
    """Retrieve full investigation state including confirmed entity, dossier, claims, and sources."""
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


# --- Milestone M3: Sandbox Outreach & Action Approval Endpoints ---

@app.post("/api/investigations/{investigation_id}/outreach/draft", response_model=OutreachDraft)
async def draft_outreach_inquiry(investigation_id: str, req: DraftOutreachRequest):
    """Draft a verification inquiry for a specific unverified claim or dispute."""
    inv = await db.get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    confirmed_entity_data = inv.get("confirmedEntity")
    if not confirmed_entity_data:
        raise HTTPException(status_code=400, detail="Entity must be confirmed before drafting outreach")

    entity = CandidateEntity(**confirmed_entity_data)

    target_claim = None
    if req.claimId:
        claims = await db.get_claims(investigation_id)
        for c in claims:
            if c.get("id") == req.claimId:
                target_claim = AtomicClaim(**c)
                break

    draft = await outreach_drafter.draft_inquiry(
        investigation_id=investigation_id,
        entity=entity,
        claim=target_claim,
        target_type=req.targetType,
        custom_note=req.filmmakerNote,
    )

    await approval_service.save_draft(draft)

    await broadcaster.emit(
        investigation_id=investigation_id,
        event_type=EventType.DOSSIER_SYNTHESIZING,
        agent_name="OutreachDrafter",
        message=f"Drafted verification inquiry for {entity.name}. Awaiting user cryptographic approval.",
        details={"draftId": draft.id, "payloadHash": draft.payloadHash},
    )

    return draft


@app.post("/api/investigations/{investigation_id}/outreach/approve", response_model=OutreachDraft)
async def approve_outreach_inquiry(investigation_id: str, req: ApproveOutreachRequest):
    """Verify exact SHA-256 payload hash and execute simulated sandbox delivery."""
    try:
        draft = await approval_service.approve_and_sandbox_send(
            draft_id=req.draftId,
            submitted_hash=req.payloadHash,
        )

        await broadcaster.emit(
            investigation_id=investigation_id,
            event_type=EventType.DOSSIER_READY,
            agent_name="ApprovalService",
            message=f"Outreach inquiry approved (SHA-256 verified) and executed in SANDBOX mode.",
            details={"draftId": draft.id, "executedAt": draft.executedAt},
        )

        return draft
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Approval failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/investigations/{investigation_id}/export")
async def export_investigation_dossier(investigation_id: str):
    """Export the complete signed investigation dossier as an archival Markdown report."""
    inv = await db.get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    claims = await db.get_claims(investigation_id)
    sources = await db.get_sources(investigation_id)

    markdown_content = export_service.generate_markdown(
        investigation_id=investigation_id,
        entity_data=inv.get("confirmedEntity") or {"name": inv.get("query", "Unknown")},
        dossier_data=inv.get("dossier") or {},
        claims=claims,
        sources=sources,
        disputes=inv.get("disputes", []),
    )

    filename = f"screened-dossier-{investigation_id[:8]}.md"
    return PlainTextResponse(
        content=markdown_content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@app.post("/api/test-pipeline", response_model=TestPipelineResponse)
async def test_walking_skeleton_pipeline(request: TestPipelineRequest):
    """Walking skeleton test endpoint executing live Parallel Search + Gemini claim extraction."""
    start_time = time.time()
    subject = request.festivalName.strip()
    if not subject:
        raise HTTPException(status_code=400, detail="Festival name is required")

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
