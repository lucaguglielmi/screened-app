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


@pytest.mark.asyncio
async def test_create_festival_monitor_success():
    from unittest.mock import AsyncMock, MagicMock, patch
    from backend.tools.monitor_tools import create_festival_monitor

    settings.parallel_api_key = "test-parallel-key"
    with patch("parallel.AsyncParallel") as MockParallel:
        mock_instance = MockParallel.return_value
        mock_instance.monitor = MagicMock()
        mock_instance.monitor.create = AsyncMock(return_value=MagicMock(id="mon_fest_999"))

        result = await create_festival_monitor(
            target_url="https://genesiscinema.co.uk",
            frequency="weekly",
            investigation_id="inv_test_abc",
        )

        assert "Created monitor mon_fest_999" in result
        mock_instance.monitor.create.assert_called_once()
        call_kwargs = mock_instance.monitor.create.call_args.kwargs
        assert call_kwargs["frequency"] == "7d"
        assert call_kwargs["type"] == "event_stream"
        assert "genesiscinema.co.uk" in call_kwargs["settings"]["query"]
        assert call_kwargs["metadata"] == {"inv_id": "inv_test_abc"}
        assert "/api/webhooks/parallel" in call_kwargs["webhook"]["url"]


@pytest.mark.asyncio
async def test_create_festival_monitor_ssrf_blocked():
    from backend.tools.monitor_tools import create_festival_monitor

    settings.parallel_api_key = "test-parallel-key"
    result = await create_festival_monitor(target_url="http://127.0.0.1:8080/admin")
    assert "SSRF blocked" in result


@pytest.mark.asyncio
async def test_create_festival_monitor_missing_key():
    from backend.tools.monitor_tools import create_festival_monitor

    orig_key = settings.parallel_api_key
    try:
        settings.parallel_api_key = ""
        result = await create_festival_monitor(target_url="https://genesiscinema.co.uk")
        assert "PARALLEL_API_KEY missing" in result
    finally:
        settings.parallel_api_key = orig_key


@pytest.mark.asyncio
async def test_trigger_monitor_success():
    from unittest.mock import AsyncMock, MagicMock, patch
    from backend.tools.monitor_tools import trigger_monitor

    settings.parallel_api_key = "test-parallel-key"
    with patch("parallel.AsyncParallel") as MockParallel:
        mock_instance = MockParallel.return_value
        mock_instance.monitor = MagicMock()
        mock_instance.monitor.trigger = AsyncMock(return_value=None)

        result = await trigger_monitor("mon_fest_999")
        assert result == "Triggered successfully"
        mock_instance.monitor.trigger.assert_called_once_with("mon_fest_999")


@pytest.mark.asyncio
async def test_create_task_group_success():
    from unittest.mock import AsyncMock, MagicMock, patch
    from backend.tools.monitor_tools import create_task_group

    settings.parallel_api_key = "test-parallel-key"
    with patch("parallel.AsyncParallel") as MockParallel:
        mock_instance = MockParallel.return_value
        mock_instance.task_group = MagicMock()
        mock_instance.task_group.create = AsyncMock(return_value=MagicMock(id="tg_group_888"))

        result = await create_task_group(["mon_1", "mon_2"])
        assert "Created task group tg_group_888" in result
        mock_instance.task_group.create.assert_called_once()


def test_festival_watch_demo_workflow():
    # Test activate demo watch
    res_watch = client.post(
        "/api/investigations/demo-pinco-pallino-2026/watch",
        json={"targetUrl": "https://genesiscinema.co.uk", "frequency": "weekly", "type": "snapshot"}
    )
    assert res_watch.status_code == 200
    data = res_watch.json()
    assert data["status"] == "active"
    assert "Pinco Pallino" in data["message"]

    # Test trigger demo watch drift check
    res_trigger = client.post("/api/investigations/demo-pinco-pallino-2026/watch/trigger")
    assert res_trigger.status_code == 200
    trigger_data = res_trigger.json()
    assert trigger_data["status"] == "triggered"
    assert trigger_data["alert"]["alertType"] == "FEE_ESCALATION"
    assert "+40% late fee surge" in trigger_data["alert"]["delta"]

    # Test get watch status
    res_status = client.get("/api/investigations/demo-pinco-pallino-2026/watch")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "active"
    assert len(status_data["recentAlerts"]) > 0

