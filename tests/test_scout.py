"""Unit tests for Opportunity Scout Discovery and Strategy Engine."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import (
    FilmFormat,
    FilmProfile,
    PremiereGoal,
)

client = TestClient(app)


def test_film_profile_instantiation():
    profile = FilmProfile(
        title="The Silent Echo",
        format=FilmFormat.SHORT,
        genre="Drama",
        runtimeMinutes=14,
        premiereGoal=PremiereGoal.WORLD_PREMIERE,
        targetRegions=["UK & Europe"],
        budgetTier="Micro (< $50k)",
    )
    assert profile.title == "The Silent Echo"
    assert profile.format == FilmFormat.SHORT
    assert profile.runtimeMinutes == 14


def test_scout_api_endpoint():
    payload = {
        "profile": {
            "title": "Neon Horizons",
            "format": "SHORT",
            "genre": "Sci-Fi",
            "runtimeMinutes": 12,
            "premiereGoal": "WORLD_PREMIERE",
            "targetRegions": ["UK & Europe", "North America"],
            "budgetTier": "Micro (< $50k)",
        }
    }
    response = client.post("/api/scout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "opportunities" in data
    assert "strategySummary" in data
    assert data["filmTitle"] == "Neon Horizons"
    assert isinstance(data["opportunities"], list)


def test_grant_scout_api_endpoint():
    payload = {
        "projectTitle": "The Last Reel",
        "format": "FEATURE",
        "genre": "Drama",
        "productionStage": "Production",
        "budgetTier": "Low (< £250k)",
        "fundingNeeded": "£50,000",
        "filmmakerRegion": "UK & Europe",
        "targetGrantTypes": ["Production Support"],
    }
    response = client.post("/api/grants/scout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "grants" in data
    assert "strategySummary" in data
    assert data["projectTitle"] == "The Last Reel"
    assert isinstance(data["grants"], list)
    assert data["grantsFound"] >= 1
    # Verify structure of grant item
    first_grant = data["grants"][0]
    assert "title" in first_grant
    assert "fundingBody" in first_grant
    assert "amountRange" in first_grant
    assert "fitScore" in first_grant

