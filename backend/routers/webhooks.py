import hashlib
import hmac
import logging
import time
from typing import Dict, Any

from fastapi import APIRouter, Request, Header, HTTPException

from backend.config import settings
from backend.orchestrator.events import broadcaster, EventType

logger = logging.getLogger("screened.routers.webhooks")
router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/parallel")
async def receive_parallel_webhook(
    request: Request,
    x_parallel_signature: str = Header(None),
    x_parallel_timestamp: str = Header(None)
):
    if not x_parallel_signature or not x_parallel_timestamp:
        raise HTTPException(status_code=400, detail="Missing signature headers")

    if settings.environment == "production" and settings.parallel_webhook_secret == "dev-webhook-secret":
        logger.exception("Refusing to verify webhook with dev secret in production.")
        raise HTTPException(status_code=500, detail="Configuration error")

    payload = await request.body()
    
    # Reconstruct the signed payload
    signed_payload = f"{x_parallel_timestamp}.{payload.decode('utf-8')}"
    
    # Compute signature
    expected_signature = hmac.new(
        settings.parallel_webhook_secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    # Check expiration (5 minutes)
    try:
        ts = float(x_parallel_timestamp)
        if abs(time.time() - ts) > 300:
            raise HTTPException(status_code=400, detail="Webhook timestamp expired")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")

    if not hmac.compare_digest(expected_signature, x_parallel_signature):
        logger.warning("Invalid webhook signature.")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    meta = data.get("metadata", {})
    investigation_id = meta.get("investigation_id") or meta.get("inv_id") or "system"
    
    logger.info(f"Received valid webhook for {investigation_id}: {data}")

    await broadcaster.emit(
        investigation_id=investigation_id,
        event_type=EventType.WATCH_EVENT_RECEIVED,
        agent_name="System",
        message="Festival Watch monitor triggered.",
        details=data
    )

    return {"status": "ok"}


# ==============================================================================
# ARCHITECTURAL DECISION / POST-HACKATHON ROADMAP:
# Inbound Festival Director Response Processing (SendGrid Inbound Parse Webhook):
#
# There is currently NO inbound email webhook configured to ingest replies from
# festival directors or organizers back into the Firestore dossier.
#
# THIS IS INTENTIONAL FOR THE HACKATHON:
# Ingesting unstructured third-party communications into an active forensic evidence
# graph introduces complex legal, compliance, and privacy considerations:
#   1. GDPR / UK DPA: Ingesting third-party PII without prior direct consent.
#   2. Prompt Injection & Forensic Poisoning: Hostile text in inbound emails
#      attempting to override agent risk scoring or claim verification.
#   3. Defamation / Disputed Evidence: Corroboration requirements before updating verdicts.
#
# This decision is intentionally postponed until after the hackathon and after
# conducting a formal review with a compliance officer to establish proper data
# sanitization, quarantine pipelines, and evidentiary standards.
# ==============================================================================

