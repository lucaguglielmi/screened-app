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
    assert data["parallel_configured"] is True


def test_test_pipeline_validation():
    response = client.post("/api/test-pipeline", json={"festivalName": ""})
    assert response.status_code == 400


def test_feedback_endpoints():
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

