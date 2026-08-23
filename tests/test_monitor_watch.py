import pytest
from fastapi.testclient import TestClient
import hmac
import hashlib
import json
from datetime import datetime, timezone

from backend.main import app
from backend.config import settings

client = TestClient(app)

def test_receive_parallel_webhook_valid_signature():
    # Setup test data
    settings.parallel_webhook_secret = "test-secret"
    payload = {"metadata": {"investigation_id": "inv_123"}, "status": "updated"}
    payload_bytes = json.dumps(payload).encode("utf-8")
    
    timestamp = str(int(datetime.now(timezone.utc).timestamp()))
    signed_payload = f"{timestamp}.{payload_bytes.decode('utf-8')}"
    
    signature = hmac.new(
        settings.parallel_webhook_secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "x-parallel-signature": signature,
        "x-parallel-timestamp": timestamp
    }
    
    response = client.post("/api/webhooks/parallel", content=payload_bytes, headers=headers)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_receive_parallel_webhook_invalid_signature():
    settings.parallel_webhook_secret = "test-secret"
    payload = {"metadata": {"investigation_id": "inv_123"}, "status": "updated"}
    
    timestamp = str(int(datetime.now(timezone.utc).timestamp()))
    
    headers = {
        "x-parallel-signature": "invalid-signature",
        "x-parallel-timestamp": timestamp
    }
    
    response = client.post("/api/webhooks/parallel", json=payload, headers=headers)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid signature"}

def test_receive_parallel_webhook_missing_headers():
    payload = {"metadata": {"investigation_id": "inv_123"}, "status": "updated"}
    
    response = client.post("/api/webhooks/parallel", json=payload)
    assert response.status_code == 400
