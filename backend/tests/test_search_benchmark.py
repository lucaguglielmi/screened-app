"""Unit tests for Parallel Search Benchmark, dynamic mode switching, and /grantscout chat gateway."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

client = TestClient(app)


def test_get_search_mode_config():
    """Verify retrieval of runtime search mode configuration and cost table."""
    res = client.get("/api/config/search-mode")
    assert res.status_code == 200
    data = res.json()
    assert "current_mode" in data
    assert data["current_mode"] in ["fast", "basic", "advanced"]
    assert "available_modes" in data
    assert set(data["available_modes"]) == {"fast", "basic", "advanced"}
    assert "cost_table" in data
    assert "fast" in data["cost_table"]
    assert "80% cost reduction" in data["cost_table"]["fast"]


def test_set_search_mode_config():
    """Verify dynamic switching between search modes with validation."""
    initial_mode = settings.parallel_default_search_mode
    try:
        # Switch to basic
        res = client.post("/api/config/search-mode", json={"mode": "basic"})
        assert res.status_code == 200
        data = res.json()
        assert data["current_mode"] == "basic"
        assert settings.parallel_default_search_mode == "basic"

        # Switch to advanced
        res = client.post("/api/config/search-mode", json={"mode": "advanced"})
        assert res.status_code == 200
        data = res.json()
        assert data["current_mode"] == "advanced"
        assert settings.parallel_default_search_mode == "advanced"

        # Invalid mode rejection
        res_bad = client.post("/api/config/search-mode", json={"mode": "turbo_ultra"})
        assert res_bad.status_code == 400
        assert "Invalid search mode" in res_bad.json()["detail"]

        # Restore to fast
        res_fast = client.post("/api/config/search-mode", json={"mode": "fast"})
        assert res_fast.status_code == 200
        assert settings.parallel_default_search_mode == "fast"
    finally:
        settings.parallel_default_search_mode = initial_mode


def test_benchmark_search_endpoint():
    """Verify empirical benchmark execution across European festival presets."""
    payload = {
        "target_name": "Edinburgh International Film Festival",
        "country": "United Kingdom",
        "modes": ["fast", "basic", "advanced"]
    }
    res = client.post("/api/playground/benchmark-search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target_name"] == "Edinburgh International Film Festival"
    assert "timestamp" in data
    assert "key_takeaway" in data
    assert "80% cost reduction" in data["key_takeaway"]

    comparisons = data["comparisons"]
    assert len(comparisons) == 3
    modes_returned = [c["mode"] for c in comparisons]
    assert modes_returned == ["fast", "basic", "advanced"]

    # Verify metric fields
    for metric in comparisons:
        assert metric["latency_ms"] > 0
        assert metric["records_found"] > 0
        assert metric["unique_domains"] > 0
        assert metric["mean_excerpt_chars"] > 0
        assert metric["estimated_cost_usd"] > 0
        assert isinstance(metric["top_domains"], list)
        assert metric["simulated_or_live"] in ["live", "calibrated_empirical", "fallback_empirical"]

    # Fast mode cost should be $0.001 vs $0.005 for basic/advanced
    fast_m = next(c for c in comparisons if c["mode"] == "fast")
    basic_m = next(c for c in comparisons if c["mode"] == "basic")
    assert fast_m["estimated_cost_usd"] < basic_m["estimated_cost_usd"]


@pytest.mark.asyncio
async def test_grantscout_chat_command():
    """Verify that /grantscout in Producer Desk chat yields configure_grant_scout with test mode guidance."""
    from backend.agents.producer_desk import producer_desk_agent
    from backend.models import ChatRequest

    req = ChatRequest(message="/grantscout The Lost Reel")
    events = []
    async for ev in producer_desk_agent.process_chat(req):
        events.append(ev)

    # Verify tool call was generated
    tool_call_events = [e for e in events if e.get("type") == "TOOL_CALL"]
    assert len(tool_call_events) > 0
    tc = tool_call_events[0]["toolCall"]
    assert tc["toolName"] == "configure_grant_scout"
    assert tc["args"]["project_title"] == "The Lost Reel"

    # Verify token stream contains test mode messaging
    tokens = "".join([e.get("token", "") for e in events if e.get("type") == "TOKEN"])
    assert "test mode" in tokens.lower() or "grant scout" in tokens.lower()
