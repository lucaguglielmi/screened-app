<p align="center">
  <a href="https://screened-786241671474.europe-west2.run.app">
    <img src="frontend/public/assets/screened-logo.svg" alt="Screened — Agentic Cinema Due Diligence" width="96" height="96" />
  </a>
</p>

<h1 align="center">Screened</h1>

<p align="center">
  <strong>Agentic Due Diligence & Credibility Intelligence for Independent Cinema</strong><br />
  <em>Built for the Google ADK & Parallel Search Hackathon</em>
</p>

<p align="center">
  <a href="https://screened-786241671474.europe-west2.run.app">
    <img src="https://img.shields.io/badge/Live_Demo-Cloud_Run_(London)-6366F1?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/lucaguglielmi/screened-app">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Tests-101_Passed_100%25-10B981?style=for-the-badge&logo=pytest&logoColor=white" alt="Backend Tests" />
  <img src="https://img.shields.io/badge/Vitest-46_Passed_100%25-10B981?style=for-the-badge&logo=vitest&logoColor=white" alt="Frontend Tests" />
  <img src="https://img.shields.io/badge/Architecture-D2_v0.9.0-6366F1?style=for-the-badge&logo=diagramsdotnet&logoColor=white" alt="D2 Architecture" />
  <img src="https://img.shields.io/badge/Agent_Protocols-WebMCP_+_MCP_+_Antigravity-A855F7?style=for-the-badge&logo=google&logoColor=white" alt="WebMCP, MCP, and Antigravity" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-818CF8?style=for-the-badge&logo=apache&logoColor=white" alt="License" />
</p>

---

## 🎬 The Mission

Every year, independent filmmakers spend thousands of pounds on festival submission fees, often encountering unverified screening venues, steep fee escalations, unclear premiere policies, or awards that fail to qualify for major honors (BAFTA, BIFA, Oscars).

**Screened** transforms cinema due-diligence from guesswork into an autonomous, transparent multi-agent investigation. Rather than assigning an arbitrary or blackbox "trust score", Screened functions as an investigative research room:
1. **Screened AI (Conversational Agent Hub)**: Talks with filmmakers, analyzes queries or uploaded PDF scripts/emails, and autonomously dispatches specialized tools via **Gemini Function Calling API**.
2. **Dissects Subject Entities**: Scrutinizes legal identity, physical venues, fee schedules, jury background, and filmmaker community feedback.
3. **Gathers Public Evidence**: Pulls verified data from official registries, festival archives, major trade publications (Variety, ScreenDaily), and community forums.
4. **Cites Every Atomic Claim**: Direct links to verbatim quotes with source tier tags, retrieval timestamps, and SHA-256 report fingerprints.
5. **Tri-Protocol Agent Access**: Allows external AI assistants to cross-examine dossiers via **Google Antigravity Plugin**, **WebMCP (`WebMCP/2026`)**, and **Headless Server MCP**.
6. **Scouts Strategic Opportunities & Grants**: Matches film profiles to verified open calls and public institutional grant funds (BFI, Screen Scotland, Arts Council, Sundance) with `.ics` calendar exports.

---

## ⚡ Live Demo & Quick Links

- **🌐 Live Cloud Run Application**: [https://screened-786241671474.europe-west2.run.app](https://screened-786241671474.europe-west2.run.app)
- **🤖 Screened Agents & WebMCP Protocol**: [https://screened-786241671474.europe-west2.run.app/agents](https://screened-786241671474.europe-west2.run.app/agents)
- **⚖️ Why Screened (Impact & Baseline Matrix)**: [https://screened-786241671474.europe-west2.run.app](https://screened-786241671474.europe-west2.run.app) (Click "Why Screened" in Left Nav)
- **🎨 Interactive Design Playground & D2 Architecture Hub**: [https://screened-786241671474.europe-west2.run.app/playground](https://screened-786241671474.europe-west2.run.app/playground)
- **📦 GitHub Repository**: [https://github.com/lucaguglielmi/screened-app](https://github.com/lucaguglielmi/screened-app)
- **🏢 Google Cloud Project**: `screened-hackathon` (`europe-west2` — London)

---

## 🏗️ Multi-Agent & Dual-Protocol Architecture

Screened operates a distributed multi-agent intelligence pipeline orchestrated via **Google Agent Development Kit (ADK)**, reasoned with **Vertex AI (Gemini 2.5 Pro & Flash)**, grounded on **Parallel Search API**, and accessible through both **In-Browser WebMCP** and **Headless Server MCP**:

<p align="center">
  <img src="assets/architecture-d2.svg" alt="Screened Multi-Agent & Dual-Protocol Architecture (D2 v0.9.0)" width="100%" />
</p>

> **D2 Source Specification**: The formal architecture diagram is compiled from [`docs/architecture-system.d2`](docs/architecture-system.d2) using `d2 -t 200 -c docs/architecture-system.d2 assets/architecture-d2.svg`. It can be viewed and explored interactively inside the [Design Playground](/playground).

---

## 🚀 Key Innovations

### 1. Screened AI & Low-Friction Intake
- Autonomous conversational entry point powered by **Gemini 2.5 Pro Function Calling**.
- Embeds streamlined **Generative Mini-App cards** inside chat bubbles:
  - **`MiniDueDiligence`**: Low-friction pre-flight intake card (Festival Name + Freeform context).
  - **`GrantIntakeCard`**: Institutional funding and public grant matcher (BFI, Screen Scotland, Arts Council, Sundance).
  - **`DocumentDropzone`**: Multimodal extraction for PDF scripts, treatments, and invitation correspondence.
- **1-Click Workspace Transition**: Seamlessly launches full research pipelines with pre-populated parameters.

### 2. 4-Tier Magic Toolbar ("How Much Data Do You Want To See?")
- **`1. Simplified`**: Executive brief for quick 10-second verdict, 4-Vector Radar, and top 3 takeaways. Zero clutter.
- **`2. Balanced`**: Producer digest featuring the **React Flow Entity Provenance Graph**, 3-domain narrative syntheses, and actionable filmmaker checklist.
- **`3. Full Evidence`**: Forensic investigative deep dive displaying verbatim quoted substrings, publication dates, source tiers (Tier 1 Registry, Tier 2 Trade, Tier 3 Forum), and side-by-side contradiction panels.
- **`4. I am not human`**: Machine & AI ingestion mode rendering raw JSON-LD schemas and uncompressed plain-text dumps with 1-click token copy.
- **Dedicated Export Actions**: **`🚀 Send to Antigravity`** (copies structured agent context to clipboard) and **`📥 Download data as .md file`** (instant client-side `.md` dossier export).

### 3. Interactive React Flow Diagram Suite (`@xyflow/react` v12)
- **`EntityProvenanceGraph`**: Due Diligence search graph connecting Target Entity → Official Domain → UK Companies House → Physical Theater Leases → Directors → Corroborated Claims with interactive click-to-cite popovers.
- **`VersusDecisionTree`**: Interactive comparison decision tree with dynamic priority switches (*Max Prestige vs Low Fee ROI vs Premiere Protection*) dynamically re-routing the optimal submission path.
- **`OverlapVennFlow` & `DeadlineRaceTimeline`**: Visualizing shared accreditation honours (BAFTA, BIFA, Oscars) and deadline collision schedules.

### 4. Credibility & Transparency Radar
- 4-vector breakdown gauge evaluating:
  - **Screening Venue** (*Physical Leases vs Unlisted Streaming*)
  - **Fee & Prize Structure** (*Clear Fees vs Trophy Markups*)
  - **Organizer & Jury** (*Company Filings vs Track Record Flags*)
  - **Community Feedback** (*Verified Filmmaker Accounts*)
- Dynamically calculated transparency index score out of 100 with color-coded confidence badges.

### 5. Exact-Payload Action Approval with SHA-256 Integrity
- Before any inquiry email is drafted to festival organizers, the system computes `sha256(recipient + subject + body + claim_id)`.
- The user reviews the exact payload in the **Action Approval Gate Modal**.
- Execution runs in **Sandbox Mode** with report fingerprint logging in Cloud Firestore.

### 6. Opportunity Scout with `.ics` Calendar Export
- Filmmakers enter their project profile (*Short, Feature, Documentary*, genre, runtime, budget tier).
- Screened discovers open call-for-entries, deadline schedules, and qualification badges (*BAFTA*, *BIFA*, *Oscars*, *FIAPF*).
- **`.ics` Calendar Generator**: 1-click export of deadlines with automatic reminders into Google Calendar / Apple Calendar.

### 7. Why Screened: Measured Baseline Matrix & Empirical Research
- Direct comparison matrix of **Manual Due Diligence (3–5 Hours, £0–£180 in lost fees, zero auditable traces)** vs **Screened Autonomous Pipeline (< 45 Seconds, 100% quoted substring audit, zero fees at risk)**.
- Features 4 documented empirical themes from independent UK filmmakers (*Fee Without Screening*, *High Acceptance Laurel Mills*, *Unverified Venues*, *Inactive Corporate Entities*).

### 8. Global Command Palette (`⌘K` / `Ctrl+K`)
- Instant keyboard-driven workspace navigation, festival candidate searches, audio controls, and export triggers accessible from anywhere.

### 9. Interactive Design Playground & D2 Architecture Hub (`/playground`)
- A dedicated visual component workbench featuring:
  - **D2 Vector Architecture Schema**: High-resolution interactive schema viewer with zoom, reset, fullscreen lightbox, and raw `.d2` script export.
  - **Live Component Studio**: Review and test UI states, loaders, generative mini-app cards, and color tokens.
  - **Agent Observability Lab**: Live **Token Stream Simulator** and **OpenTelemetry Agent Span Visualizer**.
  - **Filmmaker Feedback Repository**: Searchable user intelligence and feature demand logs.

### 10. Multi-Protocol Agent Ecosystem: WebMCP, Server MCP & Google Antigravity Plugin
Screened is accessible by both human filmmakers and autonomous external AI agents through three native protocols:
- **Google Antigravity & Gemini Plugin**: Native workspace plugin located in `.agents/plugins/screened/` equipped with progressive disclosure skills (`screened-festival-diligence`, `screened-grant-scout`) and forensic rules (`rules/AGENTS.md`) connecting directly to Screened's Cloud Run MCP gateway over SSE.
- **In-Browser WebMCP (`WebMCP/2026`)**: An in-page, DOM-accessible agent protocol exposed via `window.__screened_web_mcp__`. Browser-based AI assistants (Chrome with WebMCP flags, Claude Computer Use, Gemini Live, Cursor) can audit dossiers, inspect claims, and dispatch investigations via `webmcp:call` and `webmcp:result` DOM CustomEvents with live visual evidence spotlighting.
- **Headless Server MCP (Anthropic MCP v1.x)**: Standardized Model Context Protocol server running over SSE (`/api/mcp/sse`) and JSON-RPC 2.0 (`/api/mcp/messages`, `/api/mcp/rpc`). Enables desktop tools (Claude Desktop, Cursor IDE, Antigravity) to query Screened's dossier ledger via 7 specialized forensic tools.
- *Learn more*: See the manuals in [`docs/GEMINI_ANTIGRAVITY_INTEGRATION.md`](docs/GEMINI_ANTIGRAVITY_INTEGRATION.md), [`docs/WEBMCP.md`](docs/WEBMCP.md), [`docs/MCP.md`](docs/MCP.md), and [`docs/specs/SPEC_GEMINI_ANTIGRAVITY_PLUGIN.md`](docs/specs/SPEC_GEMINI_ANTIGRAVITY_PLUGIN.md), or test tools directly in the [Screened Agents Hub](/agents).

---

## 🛠️ Technology Stack & Cloud Architecture

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Evidence Engine** | **Parallel Domain** | 6-Capability Matrix: Search, Extract (Verbatim), Task API, FindAll, Monitor (Drift), Task Groups |
| **Orchestration** | **Cloud Tasks & ADK** | Durable queues, `ParallelAgent`, `SequentialAgent`, `LlmAgent` orchestrating workflows |
| **Agent Intelligence** | Vertex AI (`google-genai` SDK) | Gemini 2.5 Pro (Function Calling & Synthesis) + Gemini 2.5 Flash (Disambiguation) |
| **Dual Agent Protocols** | **WebMCP & Server MCP** | In-browser DOM event bus (`window.__screened_web_mcp__`) + JSON-RPC 2.0 SSE (`/api/mcp/sse`) |
| **Architecture Schema** | **D2 Lang (v0.9.0)** | Declarative system diagram compiled to vector SVG (`docs/architecture-system.d2`) |
| **Backend API** | FastAPI + Uvicorn + Pydantic v2 | High-performance asynchronous REST & Server-Sent Events (SSE) |
| **Database** | Google Cloud Firestore (Native) | Real-time investigation state, audit trail, and cached source hash ledger |
| **Secrets & Keys** | Google Cloud Secret Manager | Secure runtime injection of `parallel-api-key` and `session-signing-key` |
| **Cloud Hosting** | Google Cloud Run | Serverless, auto-scaling container deployment in `europe-west2` (London) |
| **Frontend UI** | React 19 + Vite + TypeScript | High-performance modern SPA in cinematic darkroom theme |
| **Navigation & Portals** | React Portals (`createPortal`) | Viewport-safe mobile slide-over drawer and modal stacking contexts |
| **Audio Engine** | Web Audio API Oscillator Synthesis | Zero-latency synthesized dial clicks, chimes, and instant mute |
| **Design System** | Tailwind CSS v4 (`@theme`) + Lucide Icons | Editorial theme (`Fraunces` serif, `Instrument Sans`, `Spline Sans Mono`) |

---

## 🧪 Automated Testing & Verification

Screened includes full unit, integration, and end-to-end multi-agent test suites:

```bash
# Run pytest test suite
PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/

# Run frontend Vitest unit test suite
cd frontend && npm test
```

### Test Results Summary:
- `tests/test_backend.py`: Healthz probe & test pipeline validation (4/4 passed)
- `tests/test_chat.py`: Screened AI agent & Gemini Function Calling tools (7/7 passed)
- `tests/test_claim_pipeline_resilience.py`: Claim extraction, basis mapping & source tier resilience (5/5 passed)
- `tests/test_deep_vetting.py`: 360° Forensic Deep Vetting ADK synthesis (4/4 passed)
- `tests/test_deep_vetting_full_dataflow.py`: Full dataflow vetting matrix and source attribution (2/2 passed)
- `tests/test_demo_mode.py`: Pinco Pallino demo mode, SSE timings & legacy entity sanitization (11/11 passed)
- `tests/test_document_analysis.py`: PDF dossier extraction & multimodal email analysis (4/4 passed)
- `tests/test_end_to_end.py`: Asynchronous multi-agent investigation lifecycle (1/1 passed)
- `tests/test_export.py`: Archival Markdown export & SHA-256 digest seal (3/3 passed)
- `tests/test_grant_diligence.py`: Institutional funding and grant matching (5/5 passed)
- `tests/test_monitor_watch.py`: Autonomous watchlists, notification dispatch & drift checks (3/3 passed)
- `tests/test_multi_agent.py`: Disambiguator, Planner, and API routes (3/3 passed)
- `tests/test_notifications.py`: Web Push & in-app SSE notification streams (4/4 passed)
- `tests/test_outreach.py`: SHA-256 payload hashing & sandbox approval verification (2/2 passed)
- `tests/test_pipeline_stages_and_progress.py`: Live progress SSE sequence & event broadcasting (8/8 passed)
- `tests/test_report_writer.py`: Multi-domain narrative synthesis & Markdown export (2/2 passed)
- `tests/test_scout.py`: FilmProfile validation & `/api/scout` opportunity discovery (3/3 passed)
- `tests/test_vcr_toggle.py`: LLM Record & Replay VCR toggle, cassette configuration & credential scrubbing (5/5 passed)
- `backend/tests/test_architecture_endpoint.py`: Architecture diagram node/edge generation endpoint (1/1 passed)
- `backend/tests/test_cloud_tasks.py`: Cloud Tasks worker URL, internal auth enforcement & task dispatching (4/4 passed)
- `backend/tests/test_mcp_security.py`: MCP rate limiting, SSRF quarantine & input sanitization (8/8 passed)
- `backend/tests/test_mcp_server.py`: MCP tool listing, SSE session lifecycle & JSON-RPC execution (9/9 passed)
- `backend/tests/test_routing.py`: Frontend SPA fallback & API route separation (2/2 passed)
- **Total Backend Tests: 101 / 101 tests passed (100%)**
- **Total Frontend Unit Tests: 46 / 46 component tests passed with Vitest (`npm test`)**

> **Note on CI Workflow**: Continuous Integration enforces zero-tolerance TypeScript compilation (`tsc -b`), strict ESLint quality gates, and automated production builds, while unit test suites run during pre-commit and deployment verification.

---

## 💻 Local Development Setup

### 1. Clone & Configure Environment

```bash
git clone https://github.com/lucaguglielmi/screened-app.git
cd screened-app

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set API Keys

```bash
cp .env.example .env
# Set your PARALLEL_API_KEY and GOOGLE_CLOUD_PROJECT
```

### 3. Build & Run

```bash
# Terminal 1: Build & run Frontend
cd frontend
npm install
npm run build
cd ..

# Terminal 2: Run FastAPI Backend
PYTHONPATH=. .venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser at **`http://127.0.0.1:8000`** to start investigating!

---

## 🔍 Where the Partner APIs are Called

To verify hackathon compliance, here is exactly where the Partner APIs are invoked in the codebase:

| Service | Feature | File & Function |
| :--- | :--- | :--- |
| **Parallel** | Search & Extract | `backend/tools/parallel_extract.py` (`ParallelExtractTool`) |
| **Parallel** | Task API | `backend/tools/parallel_task.py` (`parallel_task_run`) |
| **Parallel** | FindAll | `backend/tools/findall_tools.py` (`OpportunityScoutTool`) |
| **Parallel** | Monitor & Webhooks | `backend/tools/monitor_tools.py` (`create_festival_monitor`), `backend/routers/webhooks.py` |
| **Google Cloud** | ADK Orchestration | `backend/orchestrator/state_machine.py` (`Orchestrator`) |
| **Google Cloud** | ADK Agents | `backend/agents/producer_desk.py`, `backend/agents/deep_vetting.py` |
| **Google Cloud** | Gemini 2.5 Pro / Flash | Orchestrated via `LlmAgent` across all agent modules (`backend/agents/`) |
| **Google Cloud** | Firestore & Secrets | `backend/db/firestore.py`, `backend/config.py` |
| **Protocol / Bridge** | WebMCP (In-Browser) | `frontend/src/utils/webMcpBridge.ts` (`window.__screened_web_mcp__`), `frontend/src/components/HowToUse.tsx` |
| **Protocol / Bridge** | Server MCP (SSE & RPC) | `backend/routers/mcp.py` (`/api/mcp/sse`, `/api/mcp/messages`, `/api/mcp/rpc`) |
| **Architecture** | D2 Vector Specification | `docs/architecture-system.d2`, `assets/architecture-d2.svg` |

---

## 📜 License

Distributed under the **Apache 2.0 License**. See `LICENSE` for details.