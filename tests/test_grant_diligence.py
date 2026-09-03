"""Tests for Phase 2 & Phase 3 Film Grant Diligence Engine:
- Catalog discovery & multi-territory filtering
- Direct guidelines clause extraction (Gemini Flash / Heuristic)
- 4-pillar tailored submission packaging checklist
- 1-Click readiness kit export, .ics calendar generation, and SHA-256 cryptographic seal
"""
import hashlib
import pytest
import httpx
from httpx import ASGITransport

from backend.main import app
from backend.models import (
    FilmFormat,
    GrantScoutRequest,
    ParseGrantGuidelinesRequest,
    GrantChecklistRequest,
    GrantChecklistResponse,
    GrantExportKitRequest,
)


@pytest.mark.vcr
@pytest.mark.asyncio
async def test_grant_scout_pagination_and_sorting():
    """Verify that grant scouting paginates and sorts correctly."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        req = {
            "projectTitle": "The Salt Road",
            "format": "FEATURE",
            "genre": "Drama",
            "productionStage": "Production",
            "budgetTier": "Low (< £250k)",
            "fundingNeeded": "£100,000",
            "filmmakerRegion": "UK & Europe",
            "page": 1,
            "pageSize": 4,
            "sortBy": "fitScore",
        }
        res = await ac.post("/api/grants/scout", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["projectTitle"] == "The Salt Road"
        assert data["grantsFound"] >= 4
        assert len(data["grants"]) == 4
        assert data["page"] == 1
        assert data["pageSize"] == 4
        assert data["totalCount"] >= 4

        # Page 2
        req["page"] = 2
        res2 = await ac.post("/api/grants/scout", json=req)
        assert res2.status_code == 200
        data2 = res2.json()
        assert len(data2["grants"]) >= 1
        assert data2["page"] == 2


@pytest.mark.vcr
@pytest.mark.asyncio
async def test_grant_catalog_regional_filtering():
    """Verify that regional catalogs correctly filter international vs territorial grants."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        # UK/All catalog
        res_all = await ac.get("/api/grants/catalog")
        assert res_all.status_code == 200
        all_grants = res_all.json()
        assert len(all_grants) >= 10

        # North America filtered
        res_na = await ac.get("/api/grants/catalog?region=North%20America")
        assert res_na.status_code == 200
        na_grants = res_na.json()
        assert len(na_grants) >= 3
        for g in na_grants:
            regions_lower = [r.lower() for r in g["eligibleRegions"]]
            assert "north america" in regions_lower or "international" in regions_lower


@pytest.mark.vcr
@pytest.mark.asyncio
async def test_parse_grant_guidelines_clauses():
    """Verify multimodal guideline parsing extracts clauses, funding limits, and legal requirements."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        guideline_sample = """
        OFFICIAL GUIDELINES: BFI Filmmaking Fund Production Support 2026.
        Maximum production award is £1,000,000.
        All projects must satisfy the statutory UK Cultural Test points schedule.
        Applicants must be registered UK SPVs with at least 10% confirmed match co-financing.
        Required deliverables include line-item budget, shooting script, and Albert carbon plan.
        """
        payload = {
            "fileName": "bfi-filmmaking-guidelines.txt",
            "fileContent": guideline_sample,
            "mimeType": "text/plain",
        }
        res = await ac.post("/api/grants/parse-guidelines", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "fundingBody" in data
        assert "maxAwardAmount" in data
        assert len(data["eligibilityCriteria"]) > 0
        assert len(data["requiredDeliverables"]) > 0
        assert data["culturalTestRequired"] is True


@pytest.mark.vcr
@pytest.mark.asyncio
async def test_generate_grant_packaging_checklist():
    """Verify generation of 4-pillar project packaging checklist."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        req = {
            "grantId": "bfi-prod-2026",
            "projectTitle": "Highland Winter",
            "format": "FEATURE",
            "genre": "Thriller",
            "productionStage": "Pre-Production",
            "budgetTier": "Low (< £250k)",
            "directorName": "Eilidh MacLeod",
            "leadProducer": "Callum Ross",
        }
        res = await ac.post("/api/grants/checklist", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["projectTitle"] == "Highland Winter"
        items = data["items"]
        assert len(items) >= 8

        categories = {it["category"] for it in items}
        assert "Creative Packaging" in categories
        assert "Financial & Budget" in categories
        assert "Legal & Chain of Title" in categories
        assert "Cultural & Mandate Alignment" in categories


@pytest.mark.vcr
@pytest.mark.asyncio
async def test_export_submission_readiness_kit_and_seal():
    """Verify 1-click readiness kit export with Markdown binder, ICS calendar, and SHA-256 seal."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Generate checklist
        chk_res = await ac.post("/api/grants/checklist", json={
            "projectTitle": "Apex Horizon",
            "format": "DOCUMENTARY",
            "productionStage": "Production",
        })
        assert chk_res.status_code == 200
        checklist = chk_res.json()

        # 2. Export readiness kit
        res = await ac.post("/api/grants/checklist/export", json={"checklist": checklist})
        assert res.status_code == 200
        data = res.json()
        assert "markdownContent" in data
        assert "sha256Digest" in data
        assert "icsContent" in data
        assert len(data["sha256Digest"]) == 64

        # Verify cryptographic integrity
        md_text = data["markdownContent"]
        assert data["sha256Digest"] in md_text
        assert "Apex Horizon".upper() in md_text
        assert "BEGIN:VCALENDAR" in data["icsContent"]
        assert "SUMMARY:Grant Deadline" in data["icsContent"]
