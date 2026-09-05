"""Unit tests for Dossier Markdown Export and SHA-256 Digest."""
import pytest
from backend.services.export_service import export_service


def test_markdown_export_generation():
    entity_data = {
        "name": "Aldergate Film Festival",
        "cityCountry": "London, UK",
        "officialDomain": "aldergatefilmfestival.org",
    }
    dossier_data = {
        "executiveSummary": "Executive summary content.",
        "festivalOverview": "Festival overview content.",
        "organizerProfile": "Organizer profile content.",
        "participantFeedback": "Feedback content.",
        "filmmakerChecklist": ["Verify premiere status", "Confirm DCP format"],
        "unresolvedQuestions": ["Is there an online showcase?"],
    }
    claims = [
        {
            "claimKind": "FACT",
            "category": "VENUE_SCREENINGS",
            "status": "CORROBORATED",
            "statement": "Physical screenings take place in London.",
            "evidence": [{"sourceId": "s1"}],
        }
    ]
    sources = [
        {
            "sourceTier": 1,
            "domain": "bfi.org.uk",
            "title": "BFI Listing",
            "url": "https://bfi.org.uk/festivals/aldergate",
        }
    ]
    disputes = []

    markdown = export_service.generate_markdown(
        investigation_id="inv-export-123",
        entity_data=entity_data,
        dossier_data=dossier_data,
        claims=claims,
        sources=sources,
        disputes=disputes,
    )

    assert "# Screened Investigation Dossier: Aldergate Film Festival" in markdown
    assert "Dossier SHA-256 Digest" in markdown
    assert "bfi.org.uk" in markdown
    assert "Physical screenings take place in London." in markdown


def test_markdown_export_with_forensic_intelligence():
    entity_data = {"name": "Pinco Pallino Film Festival", "cityCountry": "London, UK"}
    premiere_risk = {
        "riskScore": 82,
        "riskLevel": "HIGH_BURN_RISK",
        "premiereDemand": "World or UK Premiere Demanded",
        "accreditationStatus": "Unaccredited (Not BAFTA/BIFA Qualifying)",
        "buyerPressFootprint": "Zero verified trade press",
        "verdictRationale": "Exclusivity demanded without distributor presence.",
        "recommendation": "Do NOT submit as World or UK Premiere.",
    }
    fee_escalation = {
        "currency": "£",
        "tiers": [
            {"tierName": "Super Early", "amount": 28, "deadlineDate": "15 Jan", "surgePercentage": 0},
            {"tierName": "Late", "amount": 85, "deadlineDate": "1 Aug", "surgePercentage": 203},
        ],
        "spikeAlert": "Aggressive 203% fee surge in late submission windows.",
        "averageMarketFee": "£32 average for UK indie short film entries",
        "percentile": 92,
    }
    forensic_summary = {
        "scamPattern": {
            "status": "RED_FLAG",
            "headline": "Dissolved Entity & Virtual Maildrop Footprint",
            "summary": "Operating company dissolved via strike-off.",
            "educationalContext": "Shell Entity Scheme.",
            "signals": ["Dissolved on Companies House", "71-75 Shelton Street mass mailbox"],
        },
        "juryConflict": {
            "status": "RED_FLAG",
            "headline": "Self-Dealing & Undisclosed Commercial Ties",
            "summary": "Festival director awards client films.",
            "educationalContext": "Jury Independence Standard.",
            "signals": ["Co-owned consulting firm", "Repeat laureates with commercial ties"],
        },
        "venueReality": {
            "status": "MISMATCH",
            "headline": "Advertised Gala vs 4-Wall Private Room Reality",
            "summary": "No contract with BFI Southbank; only 2-hour private room hire.",
            "educationalContext": "Curated Cinema Selection vs. 4-Wall Rental.",
            "signals": ["Genesis Cinema private hire", "Vimeo link substitution"],
        },
    }

    markdown = export_service.generate_markdown(
        investigation_id="demo_pinco_pallino",
        entity_data=entity_data,
        dossier_data={},
        claims=[],
        sources=[],
        disputes=[],
        premiere_risk=premiere_risk,
        fee_escalation=fee_escalation,
        forensic_summary=forensic_summary,
    )

    assert "## 🕵️ Forensic Intelligence Brief (Scam Realities)" in markdown
    assert "Dissolved Entity & Virtual Maildrop Footprint" in markdown
    assert "Self-Dealing & Undisclosed Commercial Ties" in markdown
    assert "Advertised Gala vs 4-Wall Private Room Reality" in markdown
    assert "Curated Cinema Selection vs. 4-Wall Rental" in markdown
    assert "## ⚖️ Premiere Value vs. Burn Risk Assessment" in markdown
    assert "**82 / 100** (`HIGH_BURN_RISK`)" in markdown
    assert "## 💰 Submission Fee Trajectory & Escalation Schedule" in markdown
    assert "Aggressive 203% fee surge in late submission windows." in markdown
    assert "| Super Early | 15 Jan | **£28** | Baseline |" in markdown
    assert "| Late | 1 Aug | **£85** | +203% |" in markdown


@pytest.mark.asyncio
async def test_demo_export_endpoint():
    from httpx import AsyncClient, ASGITransport
    from backend.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/investigations/demo_pinco_pallino/export")
        assert res.status_code == 200
        assert "attachment; filename=\"screened-dossier-demo_pin.md\"" in res.headers["content-disposition"]
        text = res.text
        assert "Pinco Pallino Film Festival" in text
        assert "Forensic Intelligence Brief" in text
        assert "Premiere Value vs. Burn Risk Assessment" in text
        assert "Submission Fee Trajectory" in text

