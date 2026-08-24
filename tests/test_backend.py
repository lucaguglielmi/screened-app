"""Unit and integration tests for Screened backend."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Screened"
    assert isinstance(data["parallel_configured"], bool)


def test_test_pipeline_validation():
    response = client.post("/api/test-pipeline", json={"festivalName": ""})
    assert response.status_code == 400


def test_feedback_endpoints():
    for i in range(3):
        client.post("/api/feedback", json={
            "rating": 5,
            "category": "GENERAL",
            "comment": f"Seed {i}",
        })

    # Test GET feedback
    get_res = client.get("/api/feedback")
    assert get_res.status_code == 200
    feedbacks = get_res.json()
    assert len(feedbacks) >= 3

    # Test POST feedback
    post_res = client.post("/api/feedback", json={
        "rating": 5,
        "category": "ACCURACY",
        "comment": "Outstanding multi-agent verification!",
        "authorName": "Test Director",
        "authorEmail": "director@test.com"
    })
    assert post_res.status_code == 200
    created = post_res.json()
    assert created["rating"] == 5
    assert created["authorName"] == "Test Director"

    # Verify item is in list
    get_res_2 = client.get("/api/feedback")
    assert get_res_2.status_code == 200
    assert len(get_res_2.json()) == len(feedbacks) + 1


def test_version_endpoints_and_cache_headers():
    # Test /api/version
    res = client.get("/api/version")
    assert res.status_code == 200
    data = res.json()
    assert "version" in data
    assert "commitSha" in data
    assert "buildTime" in data

    # Verify anti-caching headers
    assert "no-cache" in res.headers.get("Cache-Control", "")
    assert "no-store" in res.headers.get("Cache-Control", "")
    assert res.headers.get("Pragma") == "no-cache"

    # Test /version.json
    res_vjson = client.get("/version.json")
    assert res_vjson.status_code == 200
    assert "no-cache" in res_vjson.headers.get("Cache-Control", "")


