"""Tests for Document Analysis and Multimodal Script/Email Intake."""
import pytest
from backend.models import (
    DocumentAnalysisRequest,
    DocumentAnalysisKind,
    FilmFormat,
    ChatRequest,
)
from backend.agents.producer_desk import producer_desk_agent


@pytest.mark.asyncio
async def test_script_treatment_extraction_fallback():
    script_text = """
TITLE: NEON SHADOWS
FORMAT: Short Film (18 min)
GENRE: Sci-Fi Thriller
LOGLINE: A cybersecurity auditor in Neo-London discovers a covert biometric surveillance backdoor operated by an underground cartel.
BUDGET: £35,000 Micro
    """
    req = DocumentAnalysisRequest(
        fileName="neon-shadows-synopsis.txt",
        fileContent=script_text
    )
    res = await producer_desk_agent.analyze_document(req)
    assert res.detectedKind == DocumentAnalysisKind.SCRIPT_TREATMENT
    assert "neon shadows" in res.filmTitle.lower() or "neon-shadows" in res.filmTitle.lower()
    assert any(g in res.genre.lower() for g in ["sci-fi", "thriller"])
    assert res.runtimeMinutes == 18
    assert res.format == FilmFormat.SHORT
    assert "cybersecurity" in res.logline.lower() or "surveillance" in res.logline.lower() or "biometric" in res.logline.lower()


@pytest.mark.asyncio
async def test_invitation_email_extraction_fallback():
    email_text = """
Dear Filmmaker,
Congratulations! We are delighted to inform you of the official selection for Apex Global Cinema Awards 2026.
To receive your official laurel and physical engraved trophy, please submit your certificate fee of $180 via the link below.
Use waiver code DISCEARLY for 10% off the screening gala ticket.
    """
    req = DocumentAnalysisRequest(
        fileName="apex-awards-invitation.txt",
        fileContent=email_text
    )
    res = await producer_desk_agent.analyze_document(req)
    assert res.detectedKind == DocumentAnalysisKind.INVITATION_EMAIL
    assert "apex" in res.festivalClaimed.lower()
    assert res.feeWaiverOffered is True
    assert res.trophyFeeRequested is True
    assert len(res.redFlagSignals) > 0


@pytest.mark.asyncio
async def test_process_chat_with_attached_document():
    req = ChatRequest(
        message="What festivals should I submit this project to?",
        attachedFileName="script_treatment.txt",
        attachedFileContent="TITLE: THE LAST EMBERS\nFORMAT: Feature Film\nGENRE: Drama\nRUNTIME: 102 minutes\nLOGLINE: A retired firefighter returns to his highland hometown to investigate a string of arson attacks."
    )
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_call_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_call_events) == 1
    tool_call = tool_call_events[0]["toolCall"]
    assert tool_call["toolName"] == "configure_opportunity_scout"
    assert "last embers" in tool_call["args"]["film_title"].lower() or "script_treatment" in tool_call["args"]["film_title"].lower()
    assert tool_call["args"]["format"] == "FEATURE"
