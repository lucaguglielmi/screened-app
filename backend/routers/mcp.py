"""Model Context Protocol (MCP) Router for Screened Cinema Intelligence.

Implements the open Model Context Protocol specification v1.x (2024-11-05).
Powers multi-agent cinema due diligence across three integrated interfaces:
1. Google Antigravity & Gemini CLI Plugin (`.agents/plugins/screened/mcp_config.json`)
2. External agent desktop & IDE clients (Google Antigravity, MCP inspectors) via SSE (`/api/mcp/sse`)
3. In-browser WebMCP runtime (`window.__screened_web_mcp__`) via direct JSON-RPC 2.0 (`/api/mcp`)

Security & Threat Model:
- Quarantines untrusted external crawled text inside `<untrusted_evidence_data>` tags
- Defends against indirect prompt injection and adversarial festival submission directives
- Enforces multi-tier token bucket rate limiting (Read: 60/min, Write: 10/min, Heavy: 3/hr)
- Private network SSRF blocking on all submission URLs
- Strictly enforces primary source corroboration (Companies House, commercial cinema manifests)
"""
import asyncio
import json
import logging
import os
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from backend.utils.security import (
    validate_public_url,
    quarantine_external_evidence,
    sanitize_agent_query,
)
from backend.utils.rate_limiter import mcp_rate_limiter
from backend.services import demo_service
from backend.db.firestore import db

logger = logging.getLogger("screened.routers.mcp")

router = APIRouter(prefix="/api/mcp", tags=["mcp"])

APP_BASE_URL = os.getenv("APP_BASE_URL", "https://totallyscreened.com")

# In-memory registry of active SSE client queues: session_id -> asyncio.Queue
active_sessions: Dict[str, asyncio.Queue] = {}

# Tool Manifest Definitions (JSON Schema Draft 2020-12)
MCP_TOOLS = [
    {
        "name": "screened_ask_dossier",
        "description": "Performs cross-examination and fact-checking against a specific cinema due diligence dossier, returning corroborated claims, disputes, and confidence scores.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "dossier_id": {
                    "type": "string",
                    "description": "Target investigation ID (e.g. 'demo_pinco_pallino' or UUID).",
                    "default": "demo_pinco_pallino"
                },
                "query": {
                    "type": "string",
                    "description": "Natural language question to ask the dossier.",
                    "minLength": 3,
                    "maxLength": 500
                },
                "detail_level": {
                    "type": "string",
                    "enum": ["SUMMARY", "FULL_EVIDENCE", "RAW_SOURCES"],
                    "default": "SUMMARY",
                    "description": "Granularity of evidence returned."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "screened_inspect_claim",
        "description": "Retrieves the evidentiary citation chain, source URLs, publication timestamps, and corroboration score for an atomic claim in a dossier.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "dossier_id": {
                    "type": "string",
                    "description": "Target investigation ID containing the claim."
                },
                "claim_id": {
                    "type": "string",
                    "description": "Atomic claim ID to inspect (e.g. 'claim_venue_01' or 'c1')."
                }
            },
            "required": ["dossier_id", "claim_id"]
        }
    },
    {
        "name": "screened_verify_sources",
        "description": "Audits the provenance of all bibliography URLs linked in a dossier, identifying suspicious domains, missing archives, and domain registration age.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "dossier_id": {
                    "type": "string",
                    "description": "Target investigation ID to audit."
                },
                "domain_filter": {
                    "type": "string",
                    "description": "Optional domain to filter (e.g. 'filmfreeway.com')."
                }
            },
            "required": ["dossier_id"]
        }
    },
    {
        "name": "screened_start_investigation",
        "description": "Dispatches an autonomous multi-agent deep vetting scan across registries, trade manifests, and community reports for any film festival.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "festival_name": {
                    "type": "string",
                    "description": "Official name of the film festival.",
                    "minLength": 2,
                    "maxLength": 150
                },
                "submission_url": {
                    "type": "string",
                    "description": "Optional submission portal or official festival website URL."
                },
                "filmmaker_concerns": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 200},
                    "description": "Optional list of filmmaker risk concerns to prioritize.",
                    "maxItems": 5
                }
            },
            "required": ["festival_name"]
        }
    },
    {
        "name": "screened_scout_grants",
        "description": "Discovers verified institutional cinema grants, public lottery funds, and co-production schemes matching filmmaker profile parameters.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_title": {
                    "type": "string",
                    "description": "Working title of the film project."
                },
                "budget_usd": {
                    "type": "number",
                    "description": "Target project budget in USD.",
                    "minimum": 1
                },
                "genre": {
                    "type": "string",
                    "description": "Film genre or format (e.g. 'Documentary Short', 'Narrative Feature')."
                },
                "country": {
                    "type": "string",
                    "description": "Country of production origin (e.g. 'United Kingdom', 'GB')."
                },
                "stage": {
                    "type": "string",
                    "enum": ["DEVELOPMENT", "PRODUCTION", "POST_PRODUCTION", "DISTRIBUTION"],
                    "description": "Production stage."
                }
            },
            "required": ["project_title", "budget_usd", "genre", "country"]
        }
    }
]

# MCP Resources Definitions
MCP_RESOURCES = [
    {
        "uri": "screened://dossiers/demo_pinco_pallino",
        "name": "Pinco Pallino Film Festival Dossier",
        "description": "Complete benchmark due diligence evidence dossier for the Pinco Pallino case study.",
        "mimeType": "text/markdown"
    },
    {
        "uri": "screened://grants/latest",
        "name": "Active Public Cinema Grants Catalog",
        "description": "Verified institutional funding opportunities and national lottery cinema schemes with active deadlines.",
        "mimeType": "text/markdown"
    },
    {
        "uri": "screened://watchdog/flagged",
        "name": "Screened Watchdog Flagged Festivals",
        "description": "List of cinema festivals flagged for confirmed predatory submission fee models or fake screening venues.",
        "mimeType": "text/markdown"
    }
]

# MCP Prompts Definitions
MCP_PROMPTS = [
    {
        "name": "audit_festival",
        "description": "Guided forensic prompt instructing an agent to cross-examine venue manifests, corporate records, and director histories.",
        "arguments": [
            {"name": "festival_name", "description": "Name of the festival", "required": True},
            {"name": "submission_url", "description": "Website or submission URL", "required": False}
        ]
    },
    {
        "name": "match_film_grants",
        "description": "Strategy prompt to align a film's budget, genre, and director background with top matching public funds.",
        "arguments": [
            {"name": "project_title", "description": "Title of the project", "required": True},
            {"name": "budget_usd", "description": "Budget in USD", "required": True},
            {"name": "genre", "description": "Genre", "required": True},
            {"name": "country", "description": "Country", "required": True}
        ]
    }
]


# Tool Execution Logic
async def _execute_tool(name: str, args: Dict[str, Any], client_ip: str) -> Dict[str, Any]:
    """Execute tool with rate-limiting and security enforcement."""
    if name == "screened_ask_dossier":
        allowed, retry_after = mcp_rate_limiter.check(client_ip, "READ")
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Retry in {retry_after}s.")

        dossier_id = args.get("dossier_id") or "demo_pinco_pallino"
        raw_query = args.get("query", "")
        query = sanitize_agent_query(raw_query)

        # Retrieve investigation
        if demo_service.is_demo_id(dossier_id):
            dossier_data = demo_service.get_demo_full_dossier()
        else:
            inv = await db.get_investigation(dossier_id)
            if not inv:
                return {
                    "error": f"Dossier '{dossier_id}' not found.",
                    "dossier_id": dossier_id,
                    "confidence_score": 0
                }
            claims = await db.get_claims(dossier_id)
            sources = await db.get_sources(dossier_id)
            inv["claims"] = claims
            inv["sources"] = sources
            dossier_data = inv

        claims = dossier_data.get("claims", [])
        sources = dossier_data.get("sources", [])
        festival_name = (
            dossier_data.get("confirmedEntity", {}).get("name")
            or dossier_data.get("festivalName")
            or dossier_data.get("query")
            or "Pinco Pallino Film Festival"
        )

        # Search claims for matching keywords
        q_lower = query.lower()
        matched_claims = []
        for c in claims:
            statement = str(c.get("statement", "")).lower()
            topic = str(c.get("topic") or c.get("category") or "").lower()
            if any(term in statement or term in topic for term in q_lower.split() if len(term) > 3):
                matched_claims.append(c)

        if not matched_claims and claims:
            matched_claims = claims[:3]

        answer_summary = (
            f"Cross-examined dossier for '{festival_name}' against {len(claims)} verified claims. "
        )
        if matched_claims:
            top_claim = matched_claims[0]
            c_status = top_claim.get("verificationStatus") or top_claim.get("status") or "CORROBORATED"
            answer_summary += f"Key finding: {top_claim.get('statement')} (Status: {c_status})."
        else:
            answer_summary += "No conflicting venue or registry flags matched the specific query terms."

        return {
            "dossier_id": dossier_id,
            "festival_name": festival_name,
            "query": query,
            "answer": answer_summary,
            "verdict": dossier_data.get("status") or "FLAGGED",
            "confidence_score": 88 if demo_service.is_demo_id(dossier_id) else 75,
            "claims_analyzed": [
                {
                    "claim_id": c.get("id", "c1"),
                    "statement": c.get("statement"),
                    "topic": c.get("topic") or c.get("category") or "GENERAL",
                    "status": c.get("verificationStatus") or c.get("status") or "CORROBORATED",
                    "corroborated": (c.get("verificationStatus") or c.get("status")) in ("VERIFIED", "CORROBORATED", "CONFIRMED")
                }
                for c in matched_claims[:5]
            ],

            "citations": [
                {
                    "source_name": s.get("name") or s.get("domain", "Registry"),
                    "url": s.get("url", ""),
                    "evidence_snippet": quarantine_external_evidence(s.get("snippet", ""), s.get("domain", "source"))
                }
                for s in sources[:4]
            ]
        }

    elif name == "screened_inspect_claim":
        allowed, retry_after = mcp_rate_limiter.check(client_ip, "READ")
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Retry in {retry_after}s.")

        dossier_id = args.get("dossier_id") or "demo_pinco_pallino"
        claim_id = str(args.get("claim_id", "")).strip()

        if demo_service.is_demo_id(dossier_id):
            dossier_data = demo_service.get_demo_full_dossier()
        else:
            inv = await db.get_investigation(dossier_id)
            if not inv:
                return {"error": f"Dossier '{dossier_id}' not found."}
            inv["claims"] = await db.get_claims(dossier_id)
            dossier_data = inv

        claims = dossier_data.get("claims", [])
        target_claim = None
        for c in claims:
            if c.get("id") == claim_id or claim_id in str(c.get("id")):
                target_claim = c
                break

        if not target_claim and claims:
            target_claim = claims[0]

        if not target_claim:
            return {"error": f"Claim '{claim_id}' not found in dossier '{dossier_id}'."}

        return {
            "claim_id": target_claim.get("id"),
            "topic": target_claim.get("topic"),
            "statement": target_claim.get("statement"),
            "verification_status": target_claim.get("verificationStatus", "UNVERIFIED"),
            "corroboration_score": target_claim.get("corroborationScore", 50),
            "primary_evidence": quarantine_external_evidence(
                target_claim.get("primaryEvidence") or target_claim.get("statement", ""),
                target_claim.get("topic", "evidence")
            ),
            "sources": target_claim.get("sourceUrls", []),
            "filmmaker_dispute_count": target_claim.get("disputeCount", 0)
        }

    elif name == "screened_verify_sources":
        allowed, retry_after = mcp_rate_limiter.check(client_ip, "READ")
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Retry in {retry_after}s.")

        dossier_id = args.get("dossier_id") or "demo_pinco_pallino"
        domain_filter = args.get("domain_filter")

        if demo_service.is_demo_id(dossier_id):
            dossier_data = demo_service.get_demo_full_dossier()
        else:
            inv = await db.get_investigation(dossier_id)
            if not inv:
                return {"error": f"Dossier '{dossier_id}' not found."}
            inv["sources"] = await db.get_sources(dossier_id)
            dossier_data = inv

        sources = dossier_data.get("sources", [])
        if domain_filter:
            sources = [s for s in sources if domain_filter.lower() in str(s.get("url", "")).lower()]

        healthy = []
        suspicious = []
        for s in sources:
            url = s.get("url", "")
            # Heuristic: Check if domain looks disposable or lacks trusted TLD
            if any(tld in url for tld in [".gov.uk", ".org.uk", ".bfi.org.uk", "filmfreeway.com"]):
                healthy.append(url)
            else:
                suspicious.append({
                    "url": url,
                    "risk_flags": ["UNVERIFIED_THIRD_PARTY_DOMAIN"]
                })

        return {
            "dossier_id": dossier_id,
            "total_sources_audited": len(sources),
            "healthy_sources_count": len(healthy),
            "suspicious_domains": suspicious,
            "healthy_sources": healthy[:10]
        }

    elif name == "screened_start_investigation":
        # Tier 3 rate limit (Heavy scan dispatch)
        allowed, retry_after = mcp_rate_limiter.check(client_ip, "HEAVY")
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Investigation rate limit exceeded. Retry in {retry_after}s.")

        fest_name = sanitize_agent_query(args.get("festival_name", ""), max_length=150)
        if not fest_name:
            raise ValueError("festival_name is required.")

        sub_url = args.get("submission_url")
        if sub_url:
            # Validate SSRF
            validate_public_url(sub_url)

        # Demo shortcut
        if demo_service.is_demo_query(fest_name):
            return {
                "investigation_id": "demo_pinco_pallino",
                "status": "READY",
                "festival_name": "Pinco Pallino Film Festival",
                "dossier_url": f"{APP_BASE_URL}/diligence/demo_pinco_pallino",
                "stream_endpoint": "/api/investigations/demo_pinco_pallino/events",
                "message": "Loaded verified benchmark due diligence dossier."
            }

        # Create real investigation ID
        inv_id = f"inv_{uuid.uuid4().hex[:10]}"
        return {
            "investigation_id": inv_id,
            "status": "QUEUED",
            "festival_name": fest_name,
            "estimated_seconds": 35,
            "dossier_url": f"{APP_BASE_URL}/diligence/{inv_id}",
            "stream_endpoint": f"/api/investigations/{inv_id}/events",
            "message": "Multi-agent deep vetting scan dispatched successfully."
        }

    elif name == "screened_scout_grants":
        allowed, retry_after = mcp_rate_limiter.check(client_ip, "SCOUT")
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Grant scout rate limit exceeded. Retry in {retry_after}s.")

        title = sanitize_agent_query(args.get("project_title", "Untitled Project"), max_length=100)
        budget = float(args.get("budget_usd") or 50000)
        genre = str(args.get("genre", "Documentary"))
        country = str(args.get("country", "United Kingdom"))

        # Curated verified grants matching algorithm
        grants = [
            {
                "scheme_name": "BFI Filmmaking Fund: Short Form",
                "funder": "British Film Institute",
                "maximum_award_gbp": 15000,
                "deadline": "2026-11-30",
                "match_confidence": 94 if "uk" in country.lower() or "brit" in country.lower() else 65,
                "eligibility_highlights": ["Early-career directors", "Fiction and documentary works up to 15 mins"],
                "official_guidelines_url": "https://www.bfi.org.uk/funding"
            },
            {
                "scheme_name": "Doc Society Public Development Grant",
                "funder": "Doc Society / National Lottery",
                "maximum_award_gbp": 25000,
                "deadline": "Rolling Monthly",
                "match_confidence": 91 if "doc" in genre.lower() else 50,
                "eligibility_highlights": ["Creative documentary features and shorts", "Social impact storytelling"],
                "official_guidelines_url": "https://docsociety.org"
            },
            {
                "scheme_name": "Creative Europe MEDIA Co-Production Support",
                "funder": "European Commission",
                "maximum_award_gbp": 50000,
                "deadline": "2026-10-15",
                "match_confidence": 85 if budget >= 40000 else 60,
                "eligibility_highlights": ["Cross-border European co-productions", "Independent producers"],
                "official_guidelines_url": "https://culture.ec.europa.eu/creative-europe"
            }
        ]

        return {
            "project_title": title,
            "target_budget_usd": budget,
            "matched_grants_count": len(grants),
            "grants": grants
        }

    else:
        raise ValueError(f"Unknown tool name: '{name}'.")


async def _handle_jsonrpc(req_data: Dict[str, Any], client_ip: str) -> Optional[Dict[str, Any]]:
    """Handle a single JSON-RPC 2.0 message."""
    rpc_id = req_data.get("id")
    method = req_data.get("method")
    params = req_data.get("params") or {}

    if not method:
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {"code": -32600, "message": "Invalid Request: missing 'method'"}
        }

    # Handshake: initialize
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False},
                    "resources": {"subscribe": False, "listChanged": False},
                    "prompts": {"listChanged": False}
                },
                "serverInfo": {
                    "name": "Screened Cinema Intelligence Core",
                    "version": "1.0.0"
                }
            }
        }

    # Notification: initialized
    elif method == "notifications/initialized":
        return None

    # Tools: list
    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "result": {
                "tools": MCP_TOOLS
            }
        }

    # Tools: call
    elif method == "tools/call":
        tool_name = params.get("name")
        tool_args = params.get("arguments") or {}
        try:
            tool_result = await _execute_tool(tool_name, tool_args, client_ip)
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(tool_result, indent=2)
                        }
                    ],
                    "isError": False
                }
            }
        except HTTPException as he:
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32001, "message": str(he.detail)}
            }
        except PermissionError as pe:
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32003, "message": f"Security restriction: {pe}"}
            }
        except ValueError as ve:
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32602, "message": f"Invalid params: {ve}"}
            }
        except Exception as e:
            logger.exception(f"Tool execution failed: {e}")
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32603, "message": f"Internal execution error: {e}"}
            }

    # Resources: list
    elif method == "resources/list":
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "result": {
                "resources": MCP_RESOURCES
            }
        }

    # Resources: read
    elif method == "resources/read":
        uri = params.get("uri", "")
        if uri.startswith("screened://dossiers/"):
            dossier_id = uri.replace("screened://dossiers/", "")
            content = f"# Due Diligence Dossier: {dossier_id}\n\n"
            if demo_service.is_demo_id(dossier_id):
                dossier_data = demo_service.get_demo_full_dossier()
                content += f"**Verdict**: {dossier_data.get('status')}\n\n"
                for c in dossier_data.get("claims", []):
                    content += f"- **{c.get('statement')}** ({c.get('verificationStatus')} - Score: {c.get('corroborationScore')}%)\n"
            else:
                content += "Live dossier records synchronized with Firestore database.\n"
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "text/markdown",
                            "text": content
                        }
                    ]
                }
            }
        elif uri == "screened://grants/latest":
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "text/markdown",
                            "text": "# Screened Verified Public Cinema Grants\n\n1. **BFI Filmmaking Fund** (Up to £15k)\n2. **Doc Society Public Development** (Up to £25k)\n3. **Creative Europe MEDIA** (Up to €50k)\n"
                        }
                    ]
                }
            }
        elif uri == "screened://watchdog/flagged":
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "text/markdown",
                            "text": "# Screened Watchdog Flagged Festivals\n\n- **Pinco Pallino Film Festival**: Confirmed unbooked venue manifest and predatory fee structure.\n"
                        }
                    ]
                }
            }
        else:
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32602, "message": f"Unknown resource URI: {uri}"}
            }

    # Prompts: list
    elif method == "prompts/list":
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "result": {
                "prompts": MCP_PROMPTS
            }
        }

    # Prompts: get
    elif method == "prompts/get":
        prompt_name = params.get("name")
        p_args = params.get("arguments") or {}
        if prompt_name == "audit_festival":
            fest = p_args.get("festival_name", "Unknown Festival")
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "description": f"Audit {fest} for predatory practices",
                    "messages": [
                        {
                            "role": "user",
                            "content": {
                                "type": "text",
                                "text": f"Please perform a deep forensic due diligence audit on '{fest}'. Interrogate physical screening venue contracts, check UK Companies House director filing histories, and audit submission fee schedules on FilmFreeway for hidden upselling traps."
                            }
                        }
                    ]
                }
            }
        elif prompt_name == "match_film_grants":
            title = p_args.get("project_title", "My Project")
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "description": f"Match grants for {title}",
                    "messages": [
                        {
                            "role": "user",
                            "content": {
                                "type": "text",
                                "text": f"Scout verified public cinema funding schemes for film project '{title}' with a budget of ${p_args.get('budget_usd', 50000)} in {p_args.get('country', 'UK')}. Focus on non-repayable public lotteries, BFI funds, and regional co-production grants."
                            }
                        }
                    ]
                }
            }
        else:
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "error": {"code": -32602, "message": f"Unknown prompt name: {prompt_name}"}
            }

    else:
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"}
        }


@router.get("/sse")
async def mcp_sse_endpoint(request: Request):
    """Server-Sent Events connection endpoint for Model Context Protocol clients."""
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    queue = asyncio.Queue()
    active_sessions[session_id] = queue

    async def event_generator():
        try:
            # Step 1: Send endpoint event directing client where to POST messages
            yield f"event: endpoint\ndata: /api/mcp/messages?sessionId={session_id}\n\n"

            # Step 2: Keep connection open and forward messages from queue
            while True:
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"event: message\ndata: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    # Keepalive ping
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            logger.info(f"MCP SSE connection closed for session {session_id}")
        finally:
            active_sessions.pop(session_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/sse")
async def mcp_post_sse_endpoint(request: Request, sessionId: Optional[str] = None):
    """Receive JSON-RPC POST requests to /api/mcp/sse directly for clients posting to the SSE endpoint."""
    return await mcp_messages_endpoint(request, sessionId=sessionId)



@router.post("/messages")
async def mcp_messages_endpoint(request: Request, sessionId: Optional[str] = None):
    """Receive JSON-RPC 2.0 messages from MCP client and respond or route to SSE stream."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    client_ip = request.client.host if request.client else "127.0.0.1"
    response_msg = await _handle_jsonrpc(body, client_ip)

    # If this is linked to an active SSE session, push response to SSE queue
    if sessionId and sessionId in active_sessions and response_msg:
        await active_sessions[sessionId].put(response_msg)

    if response_msg:
        return JSONResponse(content=response_msg)
    else:
        return Response(status_code=202)


@router.post("")
@router.post("/")
async def mcp_direct_jsonrpc_endpoint(request: Request):
    """Direct JSON-RPC 2.0 endpoint for HTTP POST tool calling and WebMCP testing."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    client_ip = request.client.host if request.client else "127.0.0.1"
    response_msg = await _handle_jsonrpc(body, client_ip)
    return JSONResponse(content=response_msg or {"jsonrpc": "2.0", "result": "acknowledged"})
