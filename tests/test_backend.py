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
