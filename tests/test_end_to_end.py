"""Async End-to-End integration test simulating a full investigation flow."""
import asyncio
import pytest
import httpx
from httpx import ASGITransport
from backend.main import app


@pytest.mark.asyncio
async def test_full_investigation_lifecycle():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        # Step 1: Start investigation
        start_resp = await ac.post("/api/investigations", json={"query": "Aldergate Film Festival"})
        assert start_resp.status_code == 200
        inv_data = start_resp.json()
        inv_id = inv_data["id"]

        # Step 2: Poll for candidate entity from disambiguation
        candidates = []
        for _ in range(15):
            await asyncio.sleep(1)
            poll_resp = await ac.get(f"/api/investigations/{inv_id}")
            assert poll_resp.status_code == 200
            data = poll_resp.json()
            if data.get("candidates") and len(data["candidates"]) > 0:
                candidates = data["candidates"]
                break

        assert len(candidates) > 0, "Disambiguator should find at least 1 candidate entity"
        selected_entity = candidates[0]

        # Step 3: Confirm entity and trigger 3-domain parallel research
        confirm_resp = await ac.post(f"/api/investigations/{inv_id}/confirm-entity", json=selected_entity)
        assert confirm_resp.status_code == 200

        # Step 4: Verify state transitions
        updated_resp = await ac.get(f"/api/investigations/{inv_id}")
        assert updated_resp.status_code == 200
        updated_data = updated_resp.json()
        assert updated_data["status"] in [
            "PLANNING", "RESEARCHING", "ANALYZING_CONTRADICTIONS", "ASSEMBLING_DOSSIER", "READY"
        ]
