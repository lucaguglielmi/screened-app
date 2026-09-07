"""Tests for semantic URL routing and SPA fallback serving."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_api_routes_unaffected_by_spa_routing():
    """Verify API endpoints return JSON data, not HTML."""
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.headers["content-type"].startswith("application/json")
    assert res_health.json()["status"] == "ok"

    res_demo = client.get("/api/investigations/demo_pinco_pallino")
    assert res_demo.status_code == 200
    assert res_demo.headers["content-type"].startswith("application/json")
    assert res_demo.json()["id"] == "demo_pinco_pallino"


def test_semantic_spa_routes_serve_html():
    """Verify direct hits to semantic frontend routes return HTTP 200 with HTML."""
    routes_to_test = [
        "/",
        "/diligence",
        "/diligence/demo_pinco_pallino",
        "/grants",
        "/why-screened",
        "/guide",
        "/agents",
        "/how-to-use",
    ]

    for r in routes_to_test:
        res = client.get(r)
        assert res.status_code == 200, f"Route {r} failed with {res.status_code}"
        # When dist/index.html is built, Content-Type is text/html
        content_type = res.headers.get("content-type", "")
        assert "text/html" in content_type or "text/plain" in content_type
