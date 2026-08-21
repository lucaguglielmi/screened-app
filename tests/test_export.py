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
