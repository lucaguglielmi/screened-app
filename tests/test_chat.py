"""Unit tests for Producer Desk Conversational Agent and Function Calling tools."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import ChatRequest, ChatMessage, ToolCallType
from backend.agents.producer_desk import producer_desk_agent


@pytest.mark.asyncio
async def test_producer_desk_agent_due_diligence_tool():
    req = ChatRequest(message="Is Pinco Pallino Film Festival legitimate or a scam?")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    assert len(events) > 0
    token_events = [e for e in events if e.get("type") == "TOKEN"]
    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]

    assert len(token_events) > 0
    assert len(tool_events) == 1
    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.CONFIGURE_DUE_DILIGENCE.value
    assert "Pinco Pallino" in tool_call["args"]["festival_name"]


@pytest.mark.asyncio
async def test_producer_desk_agent_grant_tool():
    req = ChatRequest(message="Find £25k documentary production grants and public funding schemes in the UK")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_events) == 1
    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.CONFIGURE_GRANT_SCOUT.value


@pytest.mark.asyncio
async def test_producer_desk_agent_email_invitation_intent():
    req = ChatRequest(message="I received a festival invitation email offering a fee waiver. Is it legitimate?")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_events) == 1
    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.CONFIGURE_DUE_DILIGENCE.value


def test_chat_streaming_endpoint():
    client = TestClient(app)
    response = client.post(
        "/api/chat",
        json={"message": "Is Raindance Film Festival legit?"}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "data:" in response.text


@pytest.mark.asyncio
async def test_generic_festival_intent_shows_intake_card():
    req = ChatRequest(message="I want to research a film festival")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    probe_events = [e for e in events if e.get("type") == "FOLLOW_UP_PROBE"]

    # Must call a tool with empty festival to show Intake card
    assert len(tool_events) == 1
    assert tool_events[0]["toolCall"]["toolName"] == ToolCallType.CONFIGURE_DUE_DILIGENCE.value
    # Must NOT provide follow-up probe
    assert len(probe_events) == 0


@pytest.mark.asyncio
async def test_generic_grant_intent_shows_intake_card():
    req = ChatRequest(message="Help me find film grants and funding opportunities")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    probe_events = [e for e in events if e.get("type") == "FOLLOW_UP_PROBE"]

    assert len(tool_events) == 1
    assert tool_events[0]["toolCall"]["toolName"] == ToolCallType.CONFIGURE_GRANT_SCOUT.value
    assert len(probe_events) == 0


@pytest.mark.asyncio
async def test_specific_festival_name_without_question_triggers_tool():
    """Verify typing raw festival names like 'parma film festival' triggers configure_due_diligence with tokens."""
    req = ChatRequest(message="parma film festival")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    token_events = [e for e in events if e.get("type") == "TOKEN"]
    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]

    assert len(token_events) > 0
    full_text = "".join(t["token"] for t in token_events).strip()
    assert len(full_text) > 0
    assert len(tool_events) == 1

    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.CONFIGURE_DUE_DILIGENCE.value
    assert "Parma" in tool_call["args"]["festival_name"]


