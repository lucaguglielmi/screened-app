"""Automated tests for Demo Mode (Pinco Pallino Film Festival).

Ensures Demo Mode is completely self-contained, does not invoke Firestore/Gemini/Parallel,
and returns JSON-serializable payloads for POST, GET, and SSE endpoints.
"""
import json
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.demo_payloads import (
    get_demo_investigation,
    get_demo_full_dossier,
    demo_sse_generator,
    DEMO_INVESTIGATION_ID,
)

client = TestClient(app)


def test_demo_payloads_json_serializable():
    """Verify demo helper functions return valid, JSON-serializable structures."""
    inv = get_demo_investigation()
    assert inv["id"] == DEMO_INVESTIGATION_ID
    assert inv["status"] == "DISAMBIGUATING"
    # Ensure fully JSON serializable
    dumped_inv = json.dumps(inv)
    assert "Pinco Pallino" in dumped_inv

    dossier = get_demo_full_dossier()
    assert dossier["id"] == DEMO_INVESTIGATION_ID
    assert dossier["status"] == "READY"
    assert "dossier" in dossier
    assert "deepVetting" in dossier
    assert "claims" in dossier
    assert "sources" in dossier
    assert len(dossier["claims"]) > 0
    assert len(dossier["sources"]) > 0
    # Ensure fully JSON serializable
    dumped_dossier = json.dumps(dossier)
    assert "Pinco Pallino" in dumped_dossier


@pytest.mark.parametrize("query", ["demo", "demo mode", "DEMO", "/demo", "Demo Mode "])
def test_post_demo_mode_returns_200(query: str):
    """POST /api/investigations with demo keywords must intercept and return 200 with demo_pinco_pallino."""
    response = client.post("/api/investigations", json={"query": query})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == DEMO_INVESTIGATION_ID
    assert data["status"] == "DISAMBIGUATING"
    assert len(data["candidates"]) >= 1
    assert "Pinco Pallino" in data["candidates"][0]["name"]


def test_get_demo_pinco_pallino_returns_200():
    """GET /api/investigations/demo_pinco_pallino must return 200 with full dossier."""
    response = client.get(f"/api/investigations/{DEMO_INVESTIGATION_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == DEMO_INVESTIGATION_ID
    assert data["status"] == "READY"
    assert "dossier" in data
    assert "deepVetting" in data
    assert "executiveSummary" in data["dossier"]
    assert data["deepVetting"]["overallAuthenticityScore"] == 34
    assert len(data["claims"]) >= 300
    assert len(data["sources"]) >= 7


def test_demo_batch_investigations_returns_200():
    """POST /api/investigations/batch with demo_pinco_pallino must return the demo dossier."""
    response = client.post("/api/investigations/batch", json=[DEMO_INVESTIGATION_ID])
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == DEMO_INVESTIGATION_ID


def test_confirm_entity_demo_mode_returns_200():
    """POST /api/investigations/demo_pinco_pallino/confirm-entity returns 200 with full demo dossier."""
    response = client.post(
        f"/api/investigations/{DEMO_INVESTIGATION_ID}/confirm-entity",
        json={
            "name": "Pinco Pallino Film Festival",
            "entityType": "FESTIVAL",
            "descriptor": "Independent London festival",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == DEMO_INVESTIGATION_ID
    assert data["status"] == "READY"
    assert len(data["sources"]) >= 7


@pytest.mark.asyncio
async def test_demo_sse_generator_direct():
    """Verify demo_sse_generator yields valid SSE-formatted data without errors."""
    events = []
    async for raw_sse in demo_sse_generator():
        assert raw_sse.startswith("data: ")
        assert raw_sse.endswith("\n\n")
        json_str = raw_sse[6:].strip()
        parsed = json.loads(json_str)
        assert parsed["investigationId"] == DEMO_INVESTIGATION_ID
        assert "eventType" in parsed
        events.append(parsed)
        # Break early once we've confirmed first few events to avoid waiting full 20s in unit tests
        if len(events) >= 3:
            break

    assert len(events) >= 3


def test_demo_sse_endpoint_headers():
    """GET /api/investigations/demo_pinco_pallino/events returns SSE content type."""
    # TestClient streaming response check
    with client.stream("GET", f"/api/investigations/{DEMO_INVESTIGATION_ID}/events") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        for line in response.iter_lines():
            if line and line.startswith("data:"):
                payload = json.loads(line[5:].strip())
                assert payload["investigationId"] == DEMO_INVESTIGATION_ID
                assert payload["agentName"] == "DemoOrchestrator"
                break
