import hashlib
import hmac
import logging
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
        logger.error("Refusing to verify webhook with dev secret in production.")
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
    
    if not hmac.compare_digest(expected_signature, x_parallel_signature):
        logger.warning(f"Invalid webhook signature. Expected {expected_signature}, got {x_parallel_signature}")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    investigation_id = data.get("metadata", {}).get("investigation_id", "system")
    
    logger.info(f"Received valid webhook for {investigation_id}: {data}")

    await broadcaster.emit(
        investigation_id=investigation_id,
        event_type=EventType.WATCH_EVENT_RECEIVED,
        agent_name="System",
        message="Festival Watch monitor triggered.",
        details=data
    )

    return {"status": "ok"}
