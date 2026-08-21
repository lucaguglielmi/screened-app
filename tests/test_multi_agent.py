"""Unit tests for Screened multi-agent orchestration and API endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import CandidateEntity, ResearchDomain
from backend.agents.planner import DomainPlan, InvestigationPlan

client = TestClient(app)


def test_create_investigation():
    response = client.post("/api/investigations", json={"query": "Raindance Film Festival"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["query"] == "Raindance Film Festival"
    assert data["status"] in ["DISAMBIGUATING", "AWAITING_ENTITY_CONFIRMATION"]


def test_get_investigation_not_found():
    response = client.get("/api/investigations/non-existent-id")
    assert response.status_code == 404


def test_domain_plan_structure():
    plan = DomainPlan(
        domain=ResearchDomain.FESTIVAL,
        objective="Test objective",
        searchQueries=["query 1", "query 2"],
        keyQuestions=["question 1"],
    )
    assert plan.domain == ResearchDomain.FESTIVAL
    assert len(plan.searchQueries) == 2
