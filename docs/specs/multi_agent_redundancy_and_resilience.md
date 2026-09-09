# Multi-Agent Redundancy & Resilience Architecture
**Status:** COMPLETED (Implemented & Verified)
**Date:** 2026-09-09

## 1. Overview
The current Screened intelligence pipeline relies on single-point-of-failure agent executions with linear `asyncio.gather()` orchestration. While API retries and model fallbacks (Pro -> Flash) provide baseline stability against rate limits, a logical failure (hallucination) or infrastructure failure (Cloud Run timeout) within a single dimension agent can degrade the entire Dossier. 

This specification outlines a three-tier architecture upgrade to guarantee enterprise-grade resilience: **Hierarchical Agent Supervision**, **Multi-Agent Consensus**, and **Asynchronous Queueing**.

## Option 1: Native Enterprise Redundancy (The "Heavy" Approach)

### Architectural Pillars
1. **Tier 1 - The Supervisor / Worker Pattern (Hierarchical):** A `DossierSupervisor` validates JSON output and logical coherence of 7 isolated `DimensionWorker` agents, re-prompting on failures.
2. **Tier 2 - Multi-Agent Consensus (Horizontal):** For high-risk dossiers, 3 independent `ForensicAnalyst` agents evaluate the payload, and a `JudgeAgent` requires a 2-out-of-3 consensus.
3. **Tier 3 - Queue-Based Orchestration (Infrastructure):** Decoupling execution using Cloud Tasks to isolate container failures (e.g., OOMs) and automatically retry individual dimensions.

### Pros
* **Bulletproof Reliability:** Guarantees 100% complete dossiers even in the face of partial API outages or edge-case hallucinations.
* **Invisible to the User:** The complexity is entirely handled backend-side; the user just gets a perfect report.
* **Production-Ready:** Uses standard distributed system patterns tailored for LLMs.

### Cons
* **Cost:** Massive token cost increase (up to 300%+ for Consensus dimensions).
* **Latency:** Generating a dossier jumps from ~10 seconds to potentially 30–45 seconds.
* **Complexity:** Extremely difficult to debug distributed state across 7 tasks and 5 agents.

---

## Option 2: BYO Agent via Official MCP Server (The "Open Ecosystem" PoC)

### Concept
Instead of brute-forcing redundancy on Screened's backend, we lean into the open agentic ecosystem. Screened acts as an **Intelligence API Engine**, doing the heavy lifting (scraping, Companies House queries, cross-referencing). Once the raw data is extracted, the user can **Bring Their Own Agent (BYOA)** using the Model Context Protocol (MCP) to synthesize the final dossier based on their own custom logic, risk tolerance, or internal studio guidelines.

### How it Works (Leveraging Existing Architecture)
Screened already implements a robust, production-ready MCP Server via Server-Sent Events (SSE) at `/api/mcp/sse`. We will extend this infrastructure to provide a highly polished BYOA experience.

1. **The Standard UX:** Regular users click around the web app. The pipeline runs as it does today, utilizing the basic retries we implemented. 
2. **The BYOA Interface (`/diligence/<id>/BYOA`):** 
   * A power user navigates to the BYOA tab on any dossier.
   * Instead of a standard web page, they see a sleek "Developer Terminal" interface.
   * It provides 1-click copy-paste configurations to instantly add the Screened MCP Server to clients like Claude Desktop, Cursor, or Google Antigravity.
3. **Smart Routing & Search:**
   * If a user types `/mcp`, `mcp`, `/BYOA`, or `BYOA` into the global search bar, the UI will intercept it and route them to a dedicated MCP onboarding page. This page will provide instructions on how to connect external agents and how to navigate to the agent-friendly dossier pages.
4. **Agent Tab Callout:**
   * When a user views the native "Agent" tab on an existing dossier, a new banner/callout will be added. It will mention: *"Want to process this intelligence with your own AI? Access the raw parallel-extracted data via our Agent-Friendly API,"* linking them directly to the BYOA interface.
5. **Advertising the Capability:**
   * Add a bright, glowing **"MCP"** badge/icon to the mobile menu and the left-hand navigation toolbar to drive awareness of the professional developer API.
6. **Native MCP Prompts (The "Recipes"):**
   * We will extend the existing `prompts/list` capability in `backend/routers/mcp.py`.
   * We will add specific "Recipes" as native MCP Prompts (e.g., `spawn_multi_agent_review`, `laurel_mill_fraud_check`, `cross_reference_audit`).
   * When a user connects their agent (like Antigravity), they can simply say: *"Give me the cross-reference audit prompt for Screened,"* and the MCP server will supply the exact instructions to force their local AI to audit Screened's findings via web search.

### Pros
* **Highly Innovative:** "Bring Your Own Agent" via MCP for forensic synthesis is cutting-edge. It positions Screened as an indispensable intelligence layer for enterprise workflows.
* **Zero Added Latency/Cost for Screened:** The synthesis token cost and processing time are entirely offloaded to the user's local agent/LLM.
* **Polished & Native:** Leverages standard MCP protocol features (like `prompts/list` and `tools/list`) to provide a frictionless, professional developer experience.

### Cons
* **Niche Audience:** Designed for power users, data journalists, or enterprise clients with their own MCP-compatible clients.
* **Loss of Formatting Control:** Screened cannot guarantee how the final dossier will look, as the user's local agent dictates the final markdown formatting.

## 3. General UI Enhancements
* **Search Timer Popover Update:** Because deep vetting via decoupled Cloud Tasks (or external agents) can be significantly slower than a basic sync loop, update the "SEARCH TIMER" popover in the UI to include a prominent warning message: *"This research can take 15 minutes or more."*
