"""Main FastAPI Application for Screened."""
import json
import logging
import os
import asyncio
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, PlainTextResponse
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Header

from backend.config import settings
from backend.routers import webhooks
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    DraftOutreachRequest,
    ApproveOutreachRequest,
    OutreachDraft,
    ResearchDomain,
    SourceRecord,
    ScoutRequest,
    ScoutResponse,
    TestPipelineRequest,
    TestPipelineResponse,
    ChatRequest,
    DeepVettingReport,
    DocumentAnalysisRequest,
    DocumentAnalysisResult,
    FeedbackItem,
    FeedbackCreateRequest,
)
from backend.db.firestore import db
from backend.tools.parallel_search import ParallelSearchTool
from backend.services.gemini_client import GeminiClient
from backend.services.approval_service import approval_service
from backend.services.export_service import export_service
from backend.agents.outreach_drafter import OutreachDrafterAgent
from backend.agents.opportunity_scout import OpportunityScoutAgent
from backend.agents.deep_vetting import DeepVettingAgent
from backend.agents.producer_desk import producer_desk_agent
from backend.orchestrator.events import broadcaster, EventType
from backend.orchestrator.state_machine import orchestrator


# LLM concurrency limiter
llm_semaphore = asyncio.Semaphore(5)


try:
    import google.cloud.logging
    client = google.cloud.logging.Client()
    client.setup_logging()
except Exception as e:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logging.warning(f"Could not initialize Google Cloud Logging: {e}. Falling back to basic logging.")

logger = logging.getLogger("screened.main")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Agentic Cinema Due-Diligence Workspace (Parallel Track)",
)

import collections
recent_spans = collections.deque(maxlen=50)
recent_errors = collections.deque(maxlen=50)
fallbacks_fired = collections.deque(maxlen=50)

class DiagnosticsLogHandler(logging.Handler):
    def emit(self, record):
        if record.levelno >= logging.ERROR:
            recent_errors.appendleft({
                "at": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
                "logger": record.name,
                "type": getattr(record, "levelname", "ERROR"),
                "message": record.getMessage(),
                "traceId": getattr(record, "traceId", None),
                "count": 1
            })
        fallback = getattr(record, "fallbackPath", None)
        if fallback:
            fallbacks_fired.appendleft({
                "path": fallback,
                "count": 1,
                "lastAt": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
                "lastReason": record.getMessage()
            })

diag_handler = DiagnosticsLogHandler()
logging.getLogger().addHandler(diag_handler)


try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, SimpleSpanProcessor, SpanExporter, SpanExportResult
    from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.sdk.resources import Resource

    class RecentSpansExporter(SpanExporter):
        def export(self, spans):
            for span in spans:
                recent_spans.appendleft(span)
            return SpanExportResult.SUCCESS
        def shutdown(self):
            pass
        def force_flush(self, timeout_millis=30000):
            return True

    resource = Resource.create({"service.name": "screened-backend"})
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)
    
    tracer_provider.add_span_processor(SimpleSpanProcessor(RecentSpansExporter()))

    try:
        exporter = CloudTraceSpanExporter()
        tracer_provider.add_span_processor(BatchSpanProcessor(exporter))
    except Exception as e:
        logger.warning(f"CloudTraceSpanExporter failed to initialize: {e}. Traces will only be available locally.")

    FastAPIInstrumentor.instrument_app(app)
except Exception as e:
    logger.warning(f"Could not initialize OpenTelemetry: {e}")

# CORS configuration
if settings.environment == "production":
    allowed_origins = [
        "https://screened-pludf2u7yq-nw.a.run.app",
        "https://screened.app",
        "https://screened-hackathon.web.app",
        "https://screened-hackathon.firebaseapp.com"
    ]
    allow_origin_regex = r"https://screened-hackathon--.*\.web\.app"
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    allow_origin_regex = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

parallel_tool = ParallelSearchTool()
gemini_client = GeminiClient()
outreach_drafter = OutreachDrafterAgent(gemini_client)
opportunity_scout = OpportunityScoutAgent(parallel_tool, gemini_client)
deep_vetting_agent = DeepVettingAgent(gemini_client)


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


# Include routers
app.include_router(webhooks.router)

# Anti-caching headers for HTML, version JSON, and SPA responses
NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
}

frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"


def get_current_version_payload() -> Dict[str, Any]:
    """Helper to resolve current app version, git commit sha, and build timestamp."""
    version_file = frontend_dist / "version.json" if frontend_dist.exists() else None
    if version_file and version_file.exists():
        try:
            with open(version_file, "r") as f:
                return json.load(f)
        except Exception:
            pass

    return {
        "version": settings.app_version,
        "commitSha": os.getenv("COMMIT_SHA", "dev"),
        "buildTime": os.getenv("BUILD_TIME", datetime.now(timezone.utc).isoformat()),
        "environment": settings.environment,
    }


@app.get("/healthz")
@app.get("/api/health")
@app.get("/api/healthz")
async def health_check():
    """Liveness probe returning application health, GCP status, Parallel SDK status, and version."""
    v_data = get_current_version_payload()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": v_data.get("version", settings.app_version),
        "commitSha": v_data.get("commitSha", "unknown"),
        "buildTime": v_data.get("buildTime", ""),
        "environment": settings.environment,
        "parallel_configured": bool(settings.parallel_api_key),
        "gcp_project": settings.google_cloud_project,
        "gcp_location": settings.google_cloud_location,
    }


@app.get("/api/traces/recent")
async def get_recent_traces():
    """Returns the 50 most recent OpenTelemetry spans for the Observability Lab."""
    return [{
        "name": span.name,
        "context": {
            "trace_id": format(span.context.trace_id, "032x"),
            "span_id": format(span.context.span_id, "016x"),
        },
        "start_time": span.start_time,
        "end_time": span.end_time,
        "attributes": dict(span.attributes) if span.attributes else {}
    } for span in recent_spans]


@app.get("/api/version")
@app.get("/version.json")
async def get_version_info():
    """Returns live deployment metadata with strict anti-caching headers for client update detection."""
    payload = get_current_version_payload()
    return Response(
        content=json.dumps(payload),
        media_type="application/json",
        headers=NO_CACHE_HEADERS,
    )


@app.get("/api/diagnostics")
async def get_diagnostics(authorization: str = Header(None)):
    diag_token = os.getenv("DIAGNOSTICS_TOKEN")
    if not diag_token or authorization != f"Bearer {diag_token}":
        raise HTTPException(status_code=404, detail="Not found")

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "service": {
            "version": settings.app_version,
            "commitSha": os.getenv("COMMIT_SHA", "dev"),
            "environment": settings.environment,
            "instanceId": os.getenv("K_REVISION", "local"),
            "uptimeSeconds": 0
        },
        "config": {
            "useAdk": True,
            "parallelConfigured": bool(settings.parallel_api_key),
            "tracingEnabled": True,
            "strictMode": False
        },
        "recentErrors": list(recent_errors),
        "recentSpans": [{
            "traceId": format(span.context.trace_id, "032x"),
            "name": span.name,
            "service": "screened",
            "durationMs": (span.end_time - span.start_time) // 1000000 if span.end_time and span.start_time else 0,
            "status": span.status.status_code.name if span.status else "OK",
            "tokens": span.attributes.get("tokens") if span.attributes else None
        } for span in recent_spans],
        "fallbacksFired": list(fallbacks_fired),
        "counters": {
            "investigationsStarted": 0,
            "investigationsFailed": 0,
            "parallelCalls": 0,
            "geminiCalls": 0,
            "sseClients": 0
        }
    }


class TaskDisambiguatePayload(BaseModel):
    investigation_id: str
    query: str
    optional_url: Optional[str] = None

class TaskPipelinePayload(BaseModel):
    investigation_id: str
    entity: dict
    intent: str

@app.post("/api/internal/tasks/disambiguate")
async def task_disambiguate(payload: TaskDisambiguatePayload, request: Request):
    await orchestrator._run_disambiguation(payload.investigation_id, payload.query, payload.optional_url)
    return {"status": "ok"}

@app.post("/api/internal/tasks/pipeline")
async def task_pipeline(payload: TaskPipelinePayload, request: Request):
    entity = CandidateEntity(**payload.entity)
    await orchestrator._execute_full_research_pipeline(payload.investigation_id, entity, payload.intent)
    return {"status": "ok"}




@app.post("/api/investigations")
@limiter.limit("10/minute")
async def create_investigation(req: CreateInvestigationRequest, request: Request):
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

@app.post("/api/investigations/batch")
@limiter.limit("30/minute")
async def get_investigation_batch(investigation_ids: list[str], request: Request):
    """Retrieve summaries for multiple investigations (e.g. for History sidebar)."""
    if len(investigation_ids) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 investigations allowed in batch request")
    results = []
    for inv_id in investigation_ids:
        try:
            inv = await db.get_investigation(inv_id)
            if inv:
                # Omit large collections like claims and sources for the summary view
                results.append(inv)
        except Exception as e:
            logger.exception(f"Failed to fetch investigation {inv_id} for batch: {e}")
    return results


@app.post("/api/investigations/{investigation_id}/resume")
@limiter.limit("10/minute")
async def resume_investigation(investigation_id: str, request: Request):
    """Resume a failed or interrupted investigation."""
    try:
        inv = await orchestrator.resume_investigation(investigation_id)
        return inv
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid request to resume investigation")
    except Exception as e:
        logger.exception(f"Failed to resume investigation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while resuming investigation")


@app.post("/api/investigations/{investigation_id}/confirm-entity")
@limiter.limit("10/minute")
async def confirm_entity(investigation_id: str, req: ConfirmEntityRequest, request: Request):
    """Confirm disambiguated entity and launch parallel 3-domain research core."""
    try:
        inv = await orchestrator.confirm_entity(
            investigation_id=investigation_id,
            entity_data=req.model_dump(),
        )
        return inv
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid request to confirm entity")
    except Exception as e:
        logger.exception(f"Failed to confirm entity: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while confirming entity")


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


# --- Conversational Producer Desk Streaming Chat Endpoint ---

@app.post("/api/chat")
@limiter.limit("20/minute")
async def chat_with_producer_desk(req: ChatRequest, request: Request):
    """Conversational endpoint streaming agent reasoning and embedded Function Calling tools."""
    async def event_generator():
        try:
            async for event in producer_desk_agent.process_chat(req):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.exception(f"Chat streaming error: {e}")
            yield f"data: {json.dumps({'type': 'ERROR', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/chat/analyze-doc", response_model=DocumentAnalysisResult)
@limiter.limit("10/minute")
async def analyze_document_endpoint(req: DocumentAnalysisRequest, request: Request):
    """Analyzes an uploaded script, synopsis, treatment, or invitation email."""
    try:
        async with llm_semaphore:
            return await producer_desk_agent.analyze_document(req)
    except Exception as e:
        logger.exception(f"Document analysis endpoint failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during document analysis")


# --- Milestone M4: Opportunity Scout Endpoint ---


@app.post("/api/scout", response_model=ScoutResponse)
@limiter.limit("10/minute")
async def scout_festival_opportunities(req: ScoutRequest, request: Request):
    """Discover tailored festival submission opportunities for a specific film profile."""
    try:
        response = await opportunity_scout.scout_opportunities(req.profile)
        return response
    except Exception as e:
        logger.exception(f"Opportunity scout failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during opportunity scouting")


# --- Milestone M3: Sandbox Outreach & Action Approval Endpoints ---

@app.post("/api/investigations/{investigation_id}/outreach/draft", response_model=OutreachDraft)
@limiter.limit("10/minute")
async def draft_outreach_inquiry(investigation_id: str, req: DraftOutreachRequest, request: Request):
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
@limiter.limit("10/minute")
async def approve_outreach_inquiry(investigation_id: str, req: ApproveOutreachRequest, request: Request):
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
        raise HTTPException(status_code=400, detail="Invalid request to approve outreach")
    except Exception as e:
        logger.exception(f"Approval failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing approval")


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
    if settings.environment == "production":
        raise HTTPException(status_code=403, detail="Test pipeline disabled in production")
    
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

        async with llm_semaphore:
            deep_vetting = await deep_vetting_agent.analyze(
                festival_name=subject,
                sources=sources,
                optional_url=request.optionalUrl,
            )

        duration = round(time.time() - start_time, 2)
        return TestPipelineResponse(
            festivalName=subject,
            sourcesFound=len(sources),
            sources=sources,
            extractedClaims=claims,
            deepVetting=deep_vetting,
            summaryNarrative=summary,
            durationSeconds=duration,
        )

    except Exception as e:
        logger.exception(f"Test pipeline failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during test pipeline execution")


@app.get("/api/investigations/{investigation_id}/deep-vetting", response_model=DeepVettingReport)
async def get_investigation_deep_vetting(investigation_id: str):
    """Retrieve the 360° forensic vetting dimensions report for an active or completed investigation."""
    inv = await db.get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    deep_vetting_data = inv.get("deepVetting")
    if deep_vetting_data:
        return DeepVettingReport(**deep_vetting_data)

    # If not yet generated, synthesize on-the-fly from saved sources
    entity_data = inv.get("confirmedEntity") or {"name": inv.get("query", "Unknown")}
    sources_data = await db.get_sources(investigation_id)
    sources = [SourceRecord(**s) for s in sources_data]

    async with llm_semaphore:
        report = await deep_vetting_agent.analyze(
            festival_name=entity_data.get("name", "Unknown"),
            sources=sources,
            optional_url=entity_data.get("officialDomain"),
            city_country=entity_data.get("cityCountry"),
        )

    inv["deepVetting"] = report.model_dump()
    await db.save_investigation(investigation_id, inv)
    return report


@app.on_event("startup")
async def startup_event():
    pass


@app.get("/api/feedback", response_model=list[FeedbackItem])
async def get_all_feedback():
    """Retrieve all submitted filmmaker feedback items without PII."""
    items = await db.get_all_feedback_items()
    for item in items:
        item["authorName"] = None
        item["authorEmail"] = None
    return items


@app.post("/api/feedback", response_model=FeedbackItem)
@limiter.limit("10/minute")
async def submit_feedback(req: FeedbackCreateRequest, request: Request):
    """Submit new filmmaker user feedback."""
    item = FeedbackItem(
        rating=req.rating,
        category=req.category,
        comment=req.comment,
        authorName=req.authorName or "Anonymous Filmmaker",
        authorEmail=req.authorEmail,
    )
    await db.save_feedback_item(item)
    logger.info(f"New filmmaker feedback received: rating={item.rating}, cat={item.category}")
    return item


@app.get("/api/architecture/agent-tree")
async def get_agent_tree():
    """Returns the multi-agent orchestration architecture for UI visualization."""
    from backend.orchestrator.state_machine import build_root_agent
    root_agent = build_root_agent()
    
    nodes = []
    
    def walk_agent(agent, parent_id=None):
        node = {
            "id": agent.name,
            "type": agent.__class__.__name__,
            "label": getattr(agent, "description", None) or agent.name,
        }
        
        if hasattr(agent, "model") and agent.model:
            node["model"] = agent.model
            
        if hasattr(agent, "output_key") and agent.output_key:
            node["output_key"] = agent.output_key
            
        if hasattr(agent, "tools") and agent.tools:
            node["tools"] = [getattr(t, "name", str(t)) for t in agent.tools]
            
        if parent_id:
            node["parent"] = parent_id
            
        nodes.append(node)
        
        if hasattr(agent, "sub_agents") and agent.sub_agents:
            for sub in agent.sub_agents:
                walk_agent(sub, agent.name)
                
    walk_agent(root_agent)
    return {"nodes": nodes}


# Mount Frontend static files if built
if frontend_dist.exists():
    class CacheControlledStaticFiles(StaticFiles):
        """Custom StaticFiles class that adds immutable long-cache headers to Vite chunk assets."""
        def file_response(self, *args, **kwargs) -> Response:
            response = super().file_response(*args, **kwargs)
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return response

    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", CacheControlledStaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            # Never cache HTML, JSON, or manifest files
            if file_path.suffix in [".html", ".json", ".webmanifest"]:
                return FileResponse(file_path, headers=NO_CACHE_HEADERS)
            return FileResponse(file_path)

        # SPA index.html fallback must ALWAYS have strict anti-caching headers
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file, headers=NO_CACHE_HEADERS)
        return PlainTextResponse("Screened Frontend is building or dist is not available.", status_code=200)

