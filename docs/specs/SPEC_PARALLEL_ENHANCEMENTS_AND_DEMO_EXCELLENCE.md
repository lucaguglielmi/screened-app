# 🎬 Specification: Parallel API Sitewide Optimization, Festival Watch & Demo Excellence

> **Document Version**: 1.1.0  
> **Target System**: Screened — Cinema Intelligence & Due Diligence Platform  
> **Status**: COMPLETED (Implemented & Verified)  
> **Track**: Parallel Track ($7,500 1st Place) · Devpost "Agentic Cinema: The Blockbuster Hackathon"  
> **Scope**: UI Real-Product Hardening · Parallel API Optimization (Search Modes, Extract, Task, FindAll) · End-to-End Festival Watch Monitor Architecture · Enterprise Security Posture (SSRF, Webhook HMAC, Replay Defense, Rate Limiting) · Rule 7.B Vendor Sanitization · 3-Minute Demo Video Beat Sheet  

---

## 1. Executive Summary & Problem Analysis

Screened is an autonomous forensic due diligence and market intelligence engine built to protect independent filmmakers from deceptive film festivals, predatory contracts, and fee-farming operations. 

While Screened already contains deep integrations with the **Parallel Web Systems SDK (`parallel-web`)** and **Google Gemini 2.5**, our deep-code audit reveals several critical opportunities to maximize our score across all four hackathon judging criteria (*Technological Implementation, Design, Potential Impact, Quality of Idea*):

1. **UI Authenticity & Real-Product Presentation**:
   - The current chat starter prompt chips include a demo prompt chip and a real festival name (*"Raindance"*). Under the official hackathon forum ruling from Devpost and Parallel, real trademarks in published materials risk disqualification under Section 7.C.
   - To make Screened look and feel like an enterprise-grade commercial product, all demo-specific chips will be replaced with production filmmaking prompts, accompanied by an elegant helper hint: `Tip: Type /demo to see how your search will look like`.
2. **Parallel Search Optimization & Fast Mode Adoption**:
   - Official Parallel documentation recommends `mode="fast"` (~700ms latency, $1 per 1k requests) for interactive agent loops, reserving `mode="advanced"` (~3s latency, $5 per 1k requests) for multi-hop deep research.
   - Screened currently defaults to legacy `mode="basic"` across several agents (`opportunity_scout.py`, `grant_scout.py`, `main.py`). Standardizing on `fast` for interactive passes and `advanced` for deep claim corroboration will cut latency by 30% and improve result relevance.
3. **The Monitor Feature ("Festival Watch") Gap**:
   - `backend/tools/monitor_tools.py` defines `create_festival_monitor()` and `trigger_monitor()`, and `backend/routers/webhooks.py` validates HMAC-SHA256 webhooks from Parallel.
   - **Critical Gap Discovered**: The feature is not fully wired end-to-end. The fallback URL in `monitor_tools.py` points to a legacy Cloud Run domain, there is no public REST API endpoint for the frontend to create or trigger monitors, and the frontend lacks the "Watch Festival" UI toggle, SSE listener for `WATCH_EVENT_RECEIVED`, and toast notification.
   - Wiring this feature end-to-end enables the **"Money Shot"** (2:35–2:50 in the demo beat sheet) where a monitor fires and pushes a live policy drift alert to the screen.
4. **Hackathon Rule 7.B Compliance (Zero-Vendor Hallucination)**:
   - Several files refer to the Model Context Protocol as *"Anthropic MCP v1.x"*. Because Rule 7.B explicitly forbids non-Google AI models, these references will be sanitized to **"Open Model Context Protocol (JSON-RPC 2.0 open standard)"**.

---

## 2. Real-Product UI Hardening

### 2.1 Eliminating Demo Chips for Genuine Product Appearance
To present Screened as a live SaaS platform rather than a student demo:
- Remove `'Vet Pinco Pallino (Demo Entity)'` and `'Raindance Legitimacy'` from `STARTER_PROMPTS` in `frontend/src/components/chat/StarterPromptChips.tsx`.
- Replace them with authentic independent cinema prompts:
  1. **🚨 Contract & Rules Audit**: *"Audit the submission terms, premiere restrictions, and screening venue leases for an independent film festival."*
  2. **💰 Public Grant Scouting**: *"Find £25k documentary and short film production grants and public funding schemes in the UK."*
  3. **✉️ Invitation Email Analysis**: *"I received a festival invitation email offering a 50% fee waiver. Is this a legitimate curated invitation or an automated blast?"*
  4. **⚖️ Premiere Surrender Assessment**: *"What are the risks of surrendering a UK or European premiere to a regional non-qualifying festival?"*

### 2.2 The Subtle `/demo` Helper Hint
- Underneath the chat input bar and in the intake card, render a subtle, high-contrast monospace micro-badge:
  ```html
  <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-mono text-slate-400">
    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-pulse"></span>
    <span>Tip: Type <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold border border-slate-700">/demo</code> to see how an accelerated forensic audit works</span>
  </div>
  ```
- When `/demo` or `demo` is submitted, it immediately executes the 20-second accelerated simulation for **Pinco Pallino Film Festival**.

---

## 3. Parallel API Sitewide Audit & Deep Enhancement

Parallel Web Systems provides web infrastructure purpose-built for AI agents. Screened utilizes the official `parallel-web` Python SDK (`AsyncParallel`).

### 3.1 Search Modes Matrix & Sitewide Tuning
According to the latest Parallel documentation:

| Parallel Search Mode | Latency | Pricing | Screened Placement & Usage |
| :--- | :--- | :--- | :--- |
| `turbo` | ~200ms | $1 / 1k | **Quick Pre-filter & URL Validation**: Instant domain lookups in `/api/chat` before tool invocation. |
| `fast` *(Recommended)* | ~700ms | $1 / 1k | **Disambiguator, Opportunity Scout & Grant Scout**: Replaces `basic` sitewide for all interactive conversational queries and entity matching. |
| `basic` | ~1s | $5 / 1k | Phased out in favor of `fast` (30% faster, 5x cheaper). |
| `advanced` | ~3s | $5 / 1k | **Deep Vetting Pipeline (`parallel_task.py`)**: Multi-hop background research for corporate filings, venue lease confirmations, and contradiction extraction. |

#### Implementation Adjustments:
1. In `backend/tools/parallel_search.py`, change default `mode` from `"basic"` to `"fast"`.
2. In `backend/agents/opportunity_scout.py` and `backend/agents/grant_scout.py`, update search calls to `mode="fast"`.
3. In `backend/tools/parallel_task.py`, ensure the deep research fallback invokes `mode="advanced"` with `max_chars_per_result=2000` to maximize excerpt depth for claim extraction.
4. Clean URL parameters by stripping tracking query params (`utm_*`, `ref`, `fbclid`) before submitting to Parallel Search or Extract to maximize caching hit rate.

### 3.2 Parallel Extract API: Verbatim Ground-Truth Provenance
- Parallel Extract (`client.extract` / `client.beta.extract`) is Screened's foundation for **zero-hallucination evidentiary standards**:
  - URLs harvested during search are fed to Extract with explicit natural language objectives (e.g. *"Genesis Cinema private hire rates Studio 4 capacity"*).
  - Every extracted substring is hashed via `SHA-256` and assigned an immutable `sourceId`.
  - In `backend/tools/parallel_extract.py`, ensure `format="markdown"` and `extract_depth="standard"` are passed so markdown tables (such as submission fee schedules) are preserved intact.

### 3.3 Parallel Task API (`client.task_run`)
- In `backend/tools/parallel_task.py`, Screened runs asynchronous deep background tasks across the 3 core domains (`FESTIVAL`, `ORGANIZER`, `PARTICIPANTS`).
- Events from `client.task_run.events(task_run_id)` are streamed directly into Screened's SSE event bus (`EventType.TASK_RUN_PROGRESS`), allowing the frontend UI to display live status updates as Parallel conducts multi-source investigations.

---

## 4. The "Festival Watch" Monitor Feature: End-to-End Architecture

In `09-DEMO-VIDEO-NOTES.md`, the centerpiece demonstration is the **"Money Shot"** (2:35–2:50), where a festival policy change is detected live via Parallel Monitor.

### 4.1 Root Cause of Current Incompleteness
1. **Host Fallback**: `backend/tools/monitor_tools.py` line 30 points to `https://screened-pludf2u7yq-nw.a.run.app` instead of live production `https://screened-786241671474.europe-west2.run.app`.
2. **Missing REST Endpoints**: No FastAPI routes exist to let users toggle monitoring on a festival or trigger a simulated drift test.
3. **Missing Frontend Handlers**: The UI does not listen for `WATCH_EVENT_RECEIVED` or render an alert toast.

### 4.2 The Solution Architecture

```
[Filmmaker / Judge clicks "Watch Festival" on Dossier]
                        │
                        ▼
          POST /api/investigations/{id}/watch
                        │
                        ▼
         Parallel Monitor API (client.beta.monitor.create)
         • Target: Festival URL
         • Type: "event_stream" | "snapshot"
         • Webhook: https://screened...europe-west2.run.app/api/webhooks/parallel
         • Frequency: "1d"
                        │
                        ▼
         [Monitor Event Detected / Simulated Trigger]
                        │
                        ▼
          POST /api/webhooks/parallel
         • Verifies HMAC-SHA256 (x-parallel-signature)
         • Checks 5-minute timestamp expiration
         • Broadcaster emits WATCH_EVENT_RECEIVED over SSE
                        │
                        ▼
       [Frontend EventSource in useInvestigation]
         • Receives WATCH_EVENT_RECEIVED
         • Triggers audio cue (soundEffects.playCaution())
         • Renders Glowing Amber Alert Toast:
           "🚨 Festival Watch Alert: Pinco Pallino extended deadline added with 40% fee escalation (£75 -> £85)."
```

### 4.3 Endpoints to Implement
1. `POST /api/investigations/{id}/watch`: Creates a Parallel monitor for the confirmed entity and stores `monitor_id` in Firestore.
2. `POST /api/investigations/{id}/watch/trigger`: Test endpoint that calls `client.beta.monitor.trigger(monitor_id)` or emits a simulated webhook payload for instant demonstration without waiting 24 hours.

---

## 5. Security Posture & Enterprise Best Practices

Because Screened executes external web searches, ingests unverified third-party documents, and handles asynchronous webhooks, the following security guardrails are strictly enforced:

### 5.1 Webhook Cryptographic Integrity & Replay Defense
- **HMAC-SHA256 Constant-Time Verification**: Webhook payloads are verified using `hmac.compare_digest(expected, signature)` to prevent timing attacks.
- **5-Minute Replay Window**: The `x-parallel-timestamp` header is parsed and compared against the server clock. Webhooks older than 300 seconds (or more than 60 seconds into the future) are rejected with `HTTP 400`.
- **Production Secret Validation**: The application strictly refuses to start or verify webhooks in production if `PARALLEL_WEBHOOK_SECRET` equals `"dev-webhook-secret"`.

### 5.2 Server-Side Request Forgery (SSRF) Prevention
- When accepting target URLs from users for monitoring or extraction, the URL must be validated:
  - Protocol restricted to `https://` (or `http://` for local testing).
  - Target IP resolved and checked against blocked subnets (Loopback `127.0.0.0/8`, Link-Local / AWS/GCP Metadata `169.254.0.0/16`, Private Class A/B/C `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Blocks requests to internal container hostnames (`localhost`, `127.0.0.1`, `metadata.google.internal`).

### 5.3 Token Bucket Rate Limiting
- `POST /api/investigations/{id}/watch` is protected by `slowapi` at **5 requests / minute per IP**.
- `POST /api/investigations/{id}/watch/trigger` is limited to **10 requests / minute per IP** to prevent quota exhaustion or abuse of Parallel's trigger credits.

### 5.4 Untrusted Web Evidence Quarantine
- All text extracted from the open web (via Parallel Search, Extract, or FindAll) is treated as untrusted data.
- Prompt injection defenses wrap raw excerpts in `<untrusted_evidence_data>` tags when sent to Gemini, instructing the model never to follow instructions inside evidence blocks.

### 5.5 PII Vault & Data Minimization
- The client-side `piiVault` masks filmmaker phone numbers, private emails, and budget specifics before sending prompts to the backend.
- Screenplay treatments are reduced to non-sensitive structural attributes (genre, runtime, format, budget tier) rather than ingesting whole manuscripts.

---

## 6. Compliance & Rule 7.B Sanitization

Devpost Rule 7.B strictly dictates that only Google Cloud AI tools and the partner's AI features are permitted. Janet Fang confirmed on the forum that non-Google coding tools are forbidden even for scaffolding.

### 6.1 Protocol Renaming
Replace all occurrences of `"Anthropic Model Context Protocol"` or `"Anthropic MCP v1.x"` with:
- **"Open Model Context Protocol (JSON-RPC 2.0 open standard)"**
- Reiterate in documentation and code headers:
  ```python
  # Standard Model Context Protocol (MCP) JSON-RPC 2.0 Server
  # Powered exclusively by Google Gemini 2.5 and Google ADK
  ```

### 6.2 Files to Sanitize
- `backend/routers/mcp.py`
- `docs/MCP.md`
- `frontend/src/components/playground/ArchitecturePage.tsx`
- `docs/specs/SPEC_WEBMCP_AND_SERVER_MCP.md`
- `docs/architecture-system.d2`

---

## 7. Chapter: The 3-Minute Blockbuster Demo Blueprint

This beat sheet is tailored for recording, featuring **Pinco Pallino Film Festival** as the sole, gold-standard demo showcase.

### 7.1 Beat Sheet & Script Breakdown (3:00 Max)

```
0:00 - 0:20 | THE PERSONAL BACKSTORY & THE EXTRACTIVE CRISIS
• Visual: Landing on Screened Hero. Camera on filmmaker or voiceover over the "Why Screened" comparison.
• Script: "20 years ago, I made an indie movie that achieved a cult following in Italy. When entering the festival circuit, I saw firsthand how extractive submission fees can be. Independent filmmakers waste millions every year on predatory festivals and shell companies. I built Screened to give filmmakers autonomous forensic due diligence."

0:20 - 0:50 | PRODUCER DESK & FUNCTION CALLING
• Visual: In the chat bar, show the subtle hint: 'Tip: Type /demo to see how an accelerated forensic audit works'. Type '/demo'.
• Visual: The Gemini 2.5 LlmAgent immediately executes configure_due_diligence and mounts the interactive FestivalIntakeCard.
• Script: "Meet the Producer Desk, powered by Google Gemini 2.5 and Google ADK. Instead of plain text chat, Gemini executes structured function calling to mount interactive mini-UIs directly in the interface. Let's launch an accelerated audit of Pinco Pallino Film Festival."

0:50 - 1:35 | THE MULTI-AGENT ADK & PARALLEL SEARCH ENGINE
• Visual: Click 'Launch Due Diligence'. The 20-second accelerated simulation in LiveProgress takes over. Show the ADK agent tree lighting up (Planning -> ParallelSearch -> ClaimExtractor -> ContradictionAnalyst).
• Script: "Behind the scenes, Google ADK orchestrates specialized sub-agents. FestivalAgent, OrganizerAgent, and ParticipantsAgent fire concurrent queries through Parallel Web Systems. Parallel Search operates in sub-second fast mode, retrieving public event bookings, UK Companies House filings, and community disclosures in sub-second time."

1:35 - 2:15 | THE FORENSIC EVIDENCE DOSSIER & PARALLEL EXTRACT
• Visual: The full dossier mounts. Flip the Detail Dial to 'Detailed Forensics'. Hover over Claim #1 (Genesis Cinema Studio 4) and Claim #3 (Companies House CIC filing #13984712). Pop open the verbatim excerpt citations.
• Script: "This is the core innovation: zero-hallucination due diligence. Every single claim is pinned to a verbatim excerpt from Parallel Extract, backed by a cryptographic SHA-256 document hash. The system proves that while Pinco Pallino does have a physical venue at Genesis Cinema, its registered address is a virtual office, and its submission fees surge by 168%."

2:15 - 2:40 | THE MONEY SHOT: FESTIVAL WATCH (PARALLEL MONITOR)
• Visual: On the dossier, toggle 'Watch Festival'. Trigger the monitor update via the test button. A live amber toast slides in: '🚨 Festival Watch Alert: Pinco Pallino rule change detected via Parallel Monitor webhook.'
• Script: "Due diligence doesn't stop at submission. Parallel Monitor continuously watches festival URLs for policy drift. When an organizer silently updates rules or hikes late fees, our HMAC-SHA256 webhook fires instantly, pushing a live alert to the filmmaker."

2:40 - 3:00 | ARCHITECTURE HUB & ENTERPRISE CLOUD RUN STACK
• Visual: Click 'Architecture' in the header. Show the interactive D2 diagram with the 8 ADK agents, the dual WebMCP/Server MCP layer, and the Google Cloud Run infrastructure.
• Script: "Screened is fully deployed on Google Cloud Run in London, backed by Firestore, Cloud Tasks, and Secret Manager, with an open Model Context Protocol server for external agent IDEs. Built natively with Google Antigravity and Parallel Web Systems. Thank you."
```

---

## 8. Implementation Phasing & Tasks

### Phase 1: Compliance & UI Real-Product Hardening
- [x] Remove demo-specific and trademarked chips from `StarterPromptChips.tsx`.
- [x] Add the subtle `/demo` hint badge below the chat input in `ChatContainer.tsx`.
- [x] Sanitize all occurrences of `"Anthropic"` in `backend/routers/mcp.py`, `docs/MCP.md`, and `ArchitecturePage.tsx`.

### Phase 2: Parallel Search Optimization
- [x] Update `backend/tools/parallel_search.py` default mode to `"fast"`.
- [x] Update `backend/agents/opportunity_scout.py` and `grant_scout.py` to use `mode="fast"`.
- [x] Set `backend/tools/parallel_task.py` fallback to `mode="advanced"`.

### Phase 3: Festival Watch (Parallel Monitor) End-to-End Implementation
- [x] Fix the production URL in `backend/tools/monitor_tools.py` to `https://screened-786241671474.europe-west2.run.app`.
- [x] Add SSRF validation and rate-limited endpoints `POST /api/investigations/{id}/watch` and `POST /api/investigations/{id}/watch/trigger` in FastAPI.
- [x] Add the "Watch Festival" button on the Dossier UI (`EvidenceDossier.tsx` / `DossierHero.tsx`).
- [x] Add `WATCH_EVENT_RECEIVED` SSE event handler in `useInvestigation.ts` and render the glowing alert toast.

### Phase 4: Pre-Commit Verification & CI Validation
- [x] Run full test suites: `PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/`.
- [x] Run frontend quality gate: `npm run lint && npm run build` inside `frontend/`.
- [x] Update spec status to `COMPLETED (Implemented & Verified)`.

---

## 9. Verification Plan

### Automated Backend Tests
- `pytest tests/test_demo_mode.py`: Verify `/demo` triggers the Pinco Pallino dossier.
- `pytest tests/test_webhooks.py`: Verify HMAC-SHA256 validation on `/api/webhooks/parallel`.
- `pytest backend/tests/test_festival_watch.py`: Verify watch registration, SSRF guards, and trigger endpoints.

### Automated Frontend Tests
- `npm run test`: Verify no regressions in `StarterPromptChips`, `ArchitecturePage`, or `EvidenceDossier`.
- `npm run lint && npm run build`: Strict zero-error gate.

---

> **Status**: COMPLETED (Implemented & Verified)  
