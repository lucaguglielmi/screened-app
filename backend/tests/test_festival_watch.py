"""Tests for Festival Watch (Parallel Monitor) endpoints and SSRF defense."""
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.demo_service import DEMO_INVESTIGATION_ID


@pytest.mark.asyncio
async def test_demo_watch_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get initial watch status
        res = await client.get(f"/api/investigations/{DEMO_INVESTIGATION_ID}/watch")
        assert res.status_code == 200

        # 2. Activate watch
        res = await client.post(
            f"/api/investigations/{DEMO_INVESTIGATION_ID}/watch",
            json={"targetUrl": "https://genesiscinema.co.uk", "frequency": "weekly", "type": "snapshot"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "active"
        assert "mon_demo_pinco_pallino" in data["monitorId"]
        assert data["targetUrl"] == "https://genesiscinema.co.uk"

        # 3. Trigger drift alert
        res = await client.post(f"/api/investigations/{DEMO_INVESTIGATION_ID}/watch/trigger")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "triggered"
        assert "alert" in data
        assert "+40% late fee surge" in data["alert"]["delta"]
        assert "Genesis Cinema" in data["alert"]["summary"]


@pytest.mark.asyncio
async def test_watch_ssrf_blocking():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a dummy investigation
        create_res = await client.post(
            "/api/investigations",
            json={"query": "Real Test Film Fest", "intent": "Vet before submitting"}
        )
        assert create_res.status_code == 200
        inv_id = create_res.json()["id"]

        # Attempt to watch private loopback IP
        res = await client.post(
            f"/api/investigations/{inv_id}/watch",
            json={"targetUrl": "http://127.0.0.1:8000/internal"}
        )
        assert res.status_code in (400, 403)

        # Attempt to watch cloud metadata IP
        res = await client.post(
            f"/api/investigations/{inv_id}/watch",
            json={"targetUrl": "http://169.254.169.254/computeMetadata/v1/"}
        )
        assert res.status_code in (400, 403)
