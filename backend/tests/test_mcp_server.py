"""Tests for Model Context Protocol (MCP) server endpoints."""
import json
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_mcp_initialize():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "1",
        "method": "initialize",
        "params": {}
    })
    assert res.status_code == 200
    data = res.json()
    assert data["jsonrpc"] == "2.0"
    assert data["id"] == "1"
    assert "result" in data
    assert data["result"]["protocolVersion"] == "2024-11-05"
    assert "tools" in data["result"]["capabilities"]
    assert "resources" in data["result"]["capabilities"]
    assert "prompts" in data["result"]["capabilities"]


def test_mcp_tools_list():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "2",
        "method": "tools/list",
        "params": {}
    })
    assert res.status_code == 200
    data = res.json()
    tools = data["result"]["tools"]
    tool_names = [t["name"] for t in tools]
    assert "screened_ask_dossier" in tool_names
    assert "screened_inspect_claim" in tool_names
    assert "screened_verify_sources" in tool_names
    assert "screened_start_investigation" in tool_names
    assert "screened_scout_grants" in tool_names


def test_mcp_tool_call_ask_dossier():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "3",
        "method": "tools/call",
        "params": {
            "name": "screened_ask_dossier",
            "arguments": {
                "dossier_id": "demo_pinco_pallino",
                "query": "Is the screening venue confirmed?"
            }
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert "result" in data
    content = data["result"]["content"][0]["text"]
    parsed = json.loads(content)
    assert parsed["dossier_id"] == "demo_pinco_pallino"
    assert "answer" in parsed
    assert "confidence_score" in parsed


def test_mcp_tool_call_inspect_claim():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "4",
        "method": "tools/call",
        "params": {
            "name": "screened_inspect_claim",
            "arguments": {
                "dossier_id": "demo_pinco_pallino",
                "claim_id": "c1"
            }
        }
    })
    assert res.status_code == 200
    data = res.json()
    content = json.loads(data["result"]["content"][0]["text"])
    assert "statement" in content
    assert "primary_evidence" in content
    assert "<untrusted_evidence_data" in content["primary_evidence"]


def test_mcp_tool_call_verify_sources():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "5",
        "method": "tools/call",
        "params": {
            "name": "screened_verify_sources",
            "arguments": {
                "dossier_id": "demo_pinco_pallino"
            }
        }
    })
    assert res.status_code == 200
    content = json.loads(res.json()["result"]["content"][0]["text"])
    assert content["total_sources_audited"] >= 0


def test_mcp_tool_call_scout_grants():
    res = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "6",
        "method": "tools/call",
        "params": {
            "name": "screened_scout_grants",
            "arguments": {
                "project_title": "Northern Shadows",
                "budget_usd": 40000,
                "genre": "Documentary Short",
                "country": "United Kingdom"
            }
        }
    })
    assert res.status_code == 200
    content = json.loads(res.json()["result"]["content"][0]["text"])
    assert content["matched_grants_count"] >= 1
    assert "grants" in content


def test_mcp_resources_list_and_read():
    res_list = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "7",
        "method": "resources/list"
    })
    assert res_list.status_code == 200
    uris = [r["uri"] for r in res_list.json()["result"]["resources"]]
    assert "screened://dossiers/demo_pinco_pallino" in uris

    res_read = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "8",
        "method": "resources/read",
        "params": {
            "uri": "screened://dossiers/demo_pinco_pallino"
        }
    })
    assert res_read.status_code == 200
    assert "contents" in res_read.json()["result"]


def test_mcp_prompts_list_and_get():
    res_list = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "9",
        "method": "prompts/list"
    })
    assert res_list.status_code == 200
    prompts = [p["name"] for p in res_list.json()["result"]["prompts"]]
    assert "audit_festival" in prompts

    res_get = client.post("/api/mcp", json={
        "jsonrpc": "2.0",
        "id": "10",
        "method": "prompts/get",
        "params": {
            "name": "audit_festival",
            "arguments": {"festival_name": "Sundance"}
        }
    })
    assert res_get.status_code == 200
    messages = res_get.json()["result"]["messages"]
    assert "Sundance" in messages[0]["content"]["text"]


@pytest.mark.asyncio
async def test_mcp_sse_endpoint_stream():
    from backend.routers.mcp import mcp_sse_endpoint
    from starlette.requests import Request

    scope = {"type": "http", "method": "GET", "path": "/api/mcp/sse", "headers": []}
    req = Request(scope)
    res = await mcp_sse_endpoint(req)
    assert res.media_type == "text/event-stream"
    assert "no-cache" in res.headers["cache-control"]

    gen = res.body_iterator
    first_event = await anext(gen)
    assert "event: endpoint" in first_event
    assert "/api/mcp/messages?sessionId=" in first_event
    await gen.aclose()

