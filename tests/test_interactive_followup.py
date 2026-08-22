"""Tests for Interactive Multi-Step Follow-Up Dialogue Engine."""
import pytest
from backend.models import ChatRequest
from backend.agents.producer_desk import producer_desk_agent


@pytest.mark.asyncio
async def test_follow_up_probe_generation_for_festival_vetting():
    req = ChatRequest(message="Is Aldergate Film Festival legitimate?")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    probe_events = [e for e in events if e.get("type") == "FOLLOW_UP_PROBE"]
    assert len(probe_events) == 1
    probe = probe_events[0]["followUpProbe"]
    assert "Aldergate" in probe["question"]
    assert len(probe["options"]) >= 2
    assert any("email" in opt["label"].lower() or "venue" in opt["label"].lower() for opt in probe["options"])


@pytest.mark.asyncio
async def test_follow_up_probe_generation_for_opportunity_scouting():
    req = ChatRequest(message="Where should I submit my 15-minute sci-fi short film?")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    probe_events = [e for e in events if e.get("type") == "FOLLOW_UP_PROBE"]
    assert len(probe_events) == 1
    probe = probe_events[0]["followUpProbe"]
    assert len(probe["options"]) >= 2
    assert any("qualifier" in opt["label"].lower() or "bafta" in opt["label"].lower() or "early bird" in opt["label"].lower() or "premiere" in opt["label"].lower() for opt in probe["options"])
