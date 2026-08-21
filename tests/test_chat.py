"""Unit tests for Producer Desk Conversational Agent and Function Calling tools."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import ChatRequest, ChatMessage, ToolCallType
from backend.agents.producer_desk import producer_desk_agent


@pytest.mark.asyncio
async def test_producer_desk_agent_due_diligence_tool():
    req = ChatRequest(message="Is Aldergate Film Festival legitimate or a scam?")
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
    assert "Aldergate" in tool_call["args"]["festival_name"]


@pytest.mark.asyncio
async def test_producer_desk_agent_scout_tool():
    req = ChatRequest(message="I have a 15 min sci-fi short film. Where should I submit?")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_events) == 1
    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT.value
    assert tool_call["args"]["format"] == "SHORT"
    assert tool_call["args"]["genre"] == "Sci-Fi"


@pytest.mark.asyncio
async def test_producer_desk_agent_compare_tool():
    req = ChatRequest(message="Compare Sundance vs Tribeca for my documentary")
    events = []
    async for event in producer_desk_agent.process_chat(req):
        events.append(event)

    tool_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_events) == 1
    tool_call = tool_events[0]["toolCall"]
    assert tool_call["toolName"] == ToolCallType.COMPARE_FESTIVALS_ARENA.value


def test_chat_streaming_endpoint():
    client = TestClient(app)
    response = client.post(
        "/api/chat",
        json={"message": "Is Raindance Film Festival legit?"}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "data:" in response.text
