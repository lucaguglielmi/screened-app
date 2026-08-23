# 🛰️ Engineering Specification: Parallel Deep Integration & ADK Adoption ("The Evidence Engine")

> **Document Version**: 2.1.0-SPEC
> **Target System**: Screened — Agentic Cinema Due Diligence
> **Architecture Pattern**: Google **ADK** multi-agent orchestration (`SequentialAgent` / `ParallelAgent` / `LlmAgent`) with Parallel as the exclusive Evidence Layer (Search · Extract · Task · FindAll · Monitor · Task Groups) and Gemini as the exclusive Reasoning Layer
> **Status**: Proposed for Implementation
> **Hackathon Compliance**: Agentic Cinema — Parallel Partner Track. LLM = **Gemini only** (Vertex AI, invoked exclusively through ADK `LlmAgent`s). Parallel **Chat API is explicitly OUT OF SCOPE** (it is an LLM-completion surface; hackathon rules require Gemini as the model). ADK adoption makes the "powered by Gemini and Google Cloud Agent Builder" requirement — and the repo's existing "ADK-based orchestration" claim — mechanically true.

---

## 1. Executive Summary

Two gaps separate the current codebase from what its own documentation and the hackathon brief describe:

1. **Parallel is underused.** The app calls exactly one Parallel endpoint — `client.search()` in `backend/tools/parallel_search.py` — in `basic`/`fast` mode, keeps ≤ 8 excerpt-only results, and does every downstream step with Gemini reasoning over those snippets. The `parallel-web` SDK already in `requirements.txt` (verified against v1.3.0) exposes six additional capabilities we do not use.
2. **ADK is claimed but absent.** `README.md:11` and `WHAT_THE_HUMAN_SHOULD_DO.md:30` describe "ADK-based orchestration", but there is no `google-adk` dependency and no ADK import anywhere. The "agents" are plain Python classes calling `google-genai` directly, sequenced by the hand-written `Orchestrator` in `backend/orchestrator/state_machine.py`, and the Producer Desk's "function calling" is keyword/regex inference.

This spec closes both gaps as one coherent architecture:

| Layer | Owner | Responsibilities |
| :--- | :--- | :--- |
| **Orchestration Layer** | **Google ADK 2.7+** | Agent composition (`SequentialAgent`, `ParallelAgent`), Gemini invocation (`LlmAgent`), real function calling, tool registry, session state, event stream, callbacks for observability |
| **Evidence Layer** | **Parallel** (via ADK `FunctionTool`s) | Web discovery (Search), full-document retrieval (Extract), deep multi-hop research with citations (Task API), entity discovery (FindAll), recurring surveillance (Monitor), batch execution (Task Groups) |
| **Reasoning Layer** | **Gemini 2.5 Pro / Flash (Vertex AI)** | The only LLM. Producer Desk conversation & genuine function calling, candidate-entity extraction, contradiction analysis, credibility scoring rationale, dossier narrative, scout fit-scoring |

Workstreams, ordered by dependency and impact:

| ID | Workstream | Core Technology | Priority |
| :--- | :--- | :--- | :--- |
| **A-01** | ADK Orchestration Adoption | `google-adk` (`LlmAgent`, `SequentialAgent`, `ParallelAgent`, `Runner`) | **P0 — foundation** |
| **P-01** | Deep Research Domain Agents | Parallel Task API (`task_run`) + streamed `events` | **P0 — flagship** |
| **P-02** | Verbatim Provenance Hardening | Parallel Extract API (`full_content`) | **P0** |
| **P-03** | Search API Deepening | `advanced_settings`, source policy, mode tiers | **P0 — do first** |
| **P-04** | Forensic Deep Vetting (real registries) | Task API + `source_policy` | P1 |
| **P-05** | Opportunity Scout on FindAll | `beta.findall` | P1 |
| **P-06** | Festival Watch (continuous monitoring) | Monitor API + webhooks + Task Groups | P2 — differentiator |
| **PP-01** | Playground & Documentation Parity | React Playground + steering docs | **Continuous — every phase** |
| **H-01…H-07** | Hackathon Submission Readiness (§15) | Demo mode, hardening, case studies, video, Devpost | **P0 — final week** |

---

## 2. Verified SDK Surfaces

Both SDK surfaces below were verified against installed packages; pin `parallel-web>=1.3.0` and add `google-adk>=2.7.0` to `requirements.txt`.

### 2.1 Parallel (`parallel-web` 1.3.0)

```python
client.search(search_queries=[...], objective=..., mode="turbo|fast|basic|advanced",
              max_chars_total=..., advanced_settings={
                  "max_results": int,
                  "excerpt_settings": {"max_chars_per_result": int},
                  "source_policy": {"include_domains": [...], "exclude_domains": [...], "after_date": date},
                  "fetch_policy": {"max_age_seconds": int, "timeout_seconds": float},
                  "location": str,
              }, session_id=...)

client.extract(urls=[...], objective=..., search_queries=[...], max_chars_total=...)
# → ExtractResult: {url, title, publish_date, excerpts[], full_content}

client.task_run.create(input=str|dict, processor="lite|base|core|pro|ultra",
                       task_spec={"output_schema": {"type": "json", "json_schema": {...}}},
                       source_policy={...}, enable_events=True, metadata={...},
                       webhook={...}, mcp_servers=[...])
client.task_run.events(run_id)   # SSE stream: progress messages + source stats
client.task_run.result(run_id)   # output + basis: per-field {reasoning, confidence, citations[{url, title, excerpts[]}]}
# TaskRunSourceStats: {num_sources_considered, num_sources_read, sources_read_sample}

client.task_group.create(...); client.task_group.add_runs(...); client.task_group.events(...)

client.monitor.create(frequency=..., type="event_stream|snapshot", processor="lite|base",
                      settings={...}, webhook={...})
client.monitor.events(monitor_id); client.monitor.trigger(monitor_id)

client.beta.findall.create(...) / .entity_search / .enrich / .extend / .result / .schema
```

### 2.2 Google ADK (`google-adk` 2.7.1)

```python
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, LoopAgent
from google.adk.runners import Runner
from google.adk.sessions import BaseSessionService, InMemorySessionService, DatabaseSessionService
from google.adk.tools import FunctionTool, LongRunningFunctionTool, AgentTool, ToolContext
from google.adk.events import Event, EventActions

LlmAgent(
    name=..., description=..., model="gemini-2.5-pro" | "gemini-2.5-flash",
    instruction=str | Callable,            # supports {state_key} templating
    tools=[FunctionTool(...), callable, ...],
    input_schema=PydanticModel, output_schema=PydanticModel | dict,   # structured output
    output_key="state_key",                # writes result into session.state
    generate_content_config=types.GenerateContentConfig(...),
    before_agent_callback / after_agent_callback,       # span open/close
    before_model_callback / after_model_callback,       # LLM interception (offline tests!)
    before_tool_callback / after_tool_callback,         # tool telemetry
    retry_config=..., timeout=...,
)

SequentialAgent(name=..., sub_agents=[...])   # pipeline stages, shared session.state
ParallelAgent(name=..., sub_agents=[...])     # concurrent fan-out

Runner(agent=root_agent, app_name="screened", session_service=...)
async for event in runner.run_async(user_id=..., session_id=...,
                                    new_message=..., state_delta={...}):
    ...  # Event stream: agent transfers, model deltas, tool calls/results, state changes
```

Key verified affordances relied on below: `output_key`/`state` for inter-agent data flow, `LongRunningFunctionTool` for human-in-the-loop pauses, `state_delta` on `run_async` for resuming with injected decisions, and `before_model_callback` returning a canned response to bypass the LLM entirely (the offline/test path).

---

## 3. A-01 · ADK Orchestration Adoption — Foundation

### 3.1 Goals & Non-Goals

**Goals**: every Gemini invocation flows through an ADK `LlmAgent`; pipeline sequencing/fan-out expressed as ADK workflow agents; Producer Desk uses *real* Gemini function calling via ADK tools (regex dispatch deleted); ADK event stream drives the existing SSE broadcaster and the Observability Lab; public REST API surface of `backend/main.py` is **unchanged** (frontend keeps working untouched during migration).

**Non-Goals**: deploying to Vertex AI Agent Engine (Cloud Run remains the runtime; ADK's `Runner` is embedded in FastAPI — noted as an optional stretch in §3.8); changing any endpoint contract; introducing any non-Gemini model.

### 3.2 Agent Mapping (current class → ADK construct)

| Current (`backend/agents/`) | ADK construct | Model | Notes |
| :--- | :--- | :--- | :--- |
| `ProducerDeskAgent` | `LlmAgent` "producer_desk", `tools=[configure_due_diligence, configure_opportunity_scout, configure_grant_scout, analyze_invitation_email, compare_festivals_arena, analyze_document]` | 2.5 Pro | **Real function calling replaces `_extract_or_infer_tool_call` regex.** Tool declarations already spec'd in `docs/done/SPEC_CONVERSATIONAL_PRODUCER_DESK.md` §4 — implement them as ADK `FunctionTool`s that return the `ChatToolCall` payload the frontend already renders |
| `DisambiguatorAgent` | `LlmAgent` "disambiguator", `tools=[parallel_search]`, `output_schema=CandidateList`, `output_key="candidates"` | 2.5 Flash | Same prompt, now with tool-driven search instead of pre-fetched excerpts |
| `PlannerAgent` | `LlmAgent` "planner", `output_schema=ResearchPlan`, `output_key="plan"` | 2.5 Pro | Pure reasoning, no tools |
| `FestivalAgent` / `OrganizerAgent` / `ParticipantsAgent` | 3 × `LlmAgent` inside a `ParallelAgent` "domain_research", each `tools=[parallel_task_run]` (P-01) with fallback `parallel_search`, `output_key="{domain}_findings"` | 2.5 Flash | Instruction templated from `{plan}` state; each agent drives its own Parallel Task run |
| `ClaimExtractorAgent` | Deterministic post-step (no LLM): basis→claim mapper + verbatim verifier, wrapped as a custom `BaseAgent` stage | — | With P-01, claims come from Parallel `basis`; Gemini extraction survives only in the fallback path |
| `ContradictionAnalystAgent` | `LlmAgent` "contradiction_analyst", `output_schema=DisputeList`, `output_key="disputes"` | 2.5 Pro | Reads claims from state |
| `DeepVettingAgent` | `ParallelAgent` "deep_vetting" of 5 dimension `LlmAgent`s, each `tools=[parallel_task_run]` with per-dimension `source_policy` (P-04) | 2.5 Flash | Scoring rationale by a final small `LlmAgent` |
| `ReportWriterAgent` | `LlmAgent` "report_writer", `output_schema=DossierReport`, `output_key="dossier"` | 2.5 Pro | Reads entity/claims/disputes/vetting from state |
| `OpportunityScoutAgent` | `LlmAgent` "scout", `tools=[findall_search, findall_enrich]` (P-05) | 2.5 Flash | Fit narrative only; entities/dates come from tools |
| `OutreachDrafterAgent` | `LlmAgent` "outreach_drafter" | 2.5 Flash | SHA-256 sealing stays in `approval_service.py` (deterministic, outside the agent) |

### 3.3 Pipeline Composition

```python
investigation_pipeline = SequentialAgent(
    name="investigation_pipeline",
    sub_agents=[
        planner,                                   # state["plan"]
        ParallelAgent(name="domain_research",      # state["festival_findings"] etc.
            sub_agents=[festival, organizer, participants]),
        claim_assembly,                            # deterministic BaseAgent: basis → AtomicClaims + verbatim check (P-02 Extract here)
        contradiction_analyst,                     # state["disputes"]
        ParallelAgent(name="deep_vetting",
            sub_agents=[corporate, domain_forensics, venue, jury, plagiarism]),
        vetting_scorer,                            # state["deep_vetting"]
        report_writer,                             # state["dossier"]
    ],
)
```

**Human-in-the-loop entity confirmation** keeps its two-phase REST shape, expressed in ADK state rather than bespoke status flags:
1. `POST /api/investigations` → `runner.run_async` on a small `disambiguation_agent`; its structured `candidates` land in session state and in the Firestore investigation record (status `AWAITING_ENTITY_CONFIRMATION`, exactly as today).
2. `POST /api/investigations/{id}/confirm-entity` → `runner.run_async` on `investigation_pipeline` with `state_delta={"confirmed_entity": ...}` injected into the same session.

Where an in-flight pause is needed inside a single run (future flows), use `LongRunningFunctionTool` — resume by re-invoking with the tool's result. Document both patterns in the Playground Architecture page (§9).

### 3.4 Sessions & State

- Implement **`FirestoreSessionService(BaseSessionService)`** (`backend/orchestrator/session_service.py`, new) persisting ADK sessions/state/events to the existing Firestore collections; session id = investigation id, so `resume_investigation` becomes "re-run the pipeline runner on the existing session from the last completed stage".
- Fallback: `InMemorySessionService` when Firestore is unreachable — preserving the repo's offline philosophy (`db/firestore.py` pattern).
- The Firestore *investigation document* remains the frontend-facing read model; a thin projector maps session state → the existing document shape after each stage, so **no frontend or endpoint changes are required**.

### 3.5 Event & Observability Bridge

`backend/orchestrator/adk_bridge.py` (new) consumes `runner.run_async(...)` events plus agent/tool callbacks and translates them onto the existing broadcaster (`orchestrator/events.py`):

| ADK signal | Emitted SSE event |
| :--- | :--- |
| `before_agent_callback` / `after_agent_callback` | existing per-phase events (`PLANNING_STARTED`, `PLAN_READY`, …) + new `AGENT_SPAN` `{agent, phase: start|end, ts, parent}` |
| `before_tool_callback` / `after_tool_callback` on Parallel tools | `TOOL_CALL_STARTED` / `TOOL_CALL_COMPLETED` `{tool, args_summary, duration_ms}` |
| Parallel `task_run.events` (pumped inside the tool) | `TASK_RUN_PROGRESS`, `TASK_RUN_SOURCE_STATS` |
| Model deltas (streaming, Producer Desk) | existing chat `TOKEN` events — ADK streaming replaces the manual 4-word chunker in `producer_desk.py` |
| `on_model_error_callback` / `on_tool_error_callback` | `ERROR` with agent attribution |

`AGENT_SPAN` events are persisted with the investigation's event log (SSE replay already exists), which makes the Playground's **Agent Observability Lab replayable from real runs** (§9.3).

### 3.6 The Orchestrator Becomes an Adapter

`state_machine.py` keeps its name and public methods (`start_investigation`, `confirm_entity`, `resume_investigation`) but shrinks to: create/load session → pick runner → pump events through the bridge → project state to Firestore. All sequencing logic moves into the agent tree. Status enum, event types, and REST contracts are untouched.

### 3.7 Offline & Test Strategy (critical repo invariant)

All tests must pass with **no API keys**:
- **LLM**: a shared `offline_model_callback` (`before_model_callback`) detects test/offline mode and returns canned structured responses per agent — ADK skips the real model call entirely. Fixtures live in `tests/fixtures/adk_responses/`.
- **Tools**: Parallel `FunctionTool`s keep their own fallback behavior (§8.2).
- New `tests/test_adk_pipeline.py`: full pipeline through `Runner` + `InMemorySessionService` with callback-injected responses; asserts state keys, SSE event sequence, and Firestore projection equivalence with the pre-migration pipeline (golden file).

### 3.8 Migration Steps

| Step | Scope | Risk gate |
| :--- | :--- | :--- |
| M1 | Add `google-adk>=2.7.0`; build `adk_bridge.py` + `FirestoreSessionService`; wrap **PlannerAgent only** as `LlmAgent` behind a feature flag `USE_ADK=true` | Golden-file diff: plan output & SSE parity vs legacy path |
| M2 | Migrate disambiguator + domain `ParallelAgent` + claim assembly | End-to-end investigation parity in staging |
| M3 | Migrate contradiction, vetting, report writer; delete legacy sequencing from `state_machine.py` | Full `tests/` green offline + live smoke (`scripts/smoke.sh`) |
| M4 | Producer Desk → `LlmAgent` with real function-calling tools; delete `_extract_or_infer_tool_call` regex block; ADK streaming → chat SSE | Every `ToolCallType` reachable via natural prompts (test matrix per tool) |
| M5 | Flip `USE_ADK` default on; remove flag after one green deploy | Cloud Run deploy + smoke |
| M6 *(optional stretch)* | Evaluate Vertex AI Agent Engine deployment of the pipeline agent for the "Agent Builder" story; document decision either way | N/A |

### 3.9 Acceptance Criteria

- `grep -ri adk backend/` returns real imports; `requirements.txt` pins `google-adk`; the steering doc's "ADK-based orchestration" sentence is **true**.
- Zero regex-based tool dispatch remains in `producer_desk.py`; tool invocation is Gemini function calling through ADK.
- SSE event stream observed by the frontend is a superset of today's (all existing event types still emitted, in order).
- All existing tests pass offline; new ADK pipeline test green; live smoke on Cloud Run green.
- Only Gemini model ids appear in `LlmAgent.model` across the codebase (compliance check in CI grep).

---

## 4. P-01 · Deep Research Domain Agents (Parallel Task API) — Flagship

### 4.1 Problem
Domain agents each make **one** shallow search call (`mode="basic"`, `max_results=6`), then Gemini invents atomic claims from ~6 short excerpts per domain. Coverage is thin, confidences un-calibrated, citations only as good as the returned snippet.

### 4.2 Design
Each domain `LlmAgent` (§3.2) drives **one Parallel Task run per domain** through a `parallel_task_run` `FunctionTool`:

- `input`: structured dict — entity (name, domain, city, founded year), the Planner's objective and queries for that domain, investigation intent.
- `processor`: mapped from the **Detail Dial** (§6.3): `base` (Summary) / `core` (Standard) / `pro` (Raw Evidence).
- `task_spec.output_schema`: JSON Schema mirroring `AtomicClaim` — `claims[]` with `statement`, `kind (FACT|ALLEGATION|OPINION)`, `subject`, `domain`, plus domain-specific fields (venue address & lease evidence for FESTIVAL; registered company & filings for ORGANIZER; named filmmaker accounts for PARTICIPANTS).
- `source_policy`: Tier-1 preference per domain (§7.2 registry).
- `enable_events=True`; `metadata={"investigation_id", "domain"}`; the tool pumps `task_run.events` into the SSE bridge while awaiting `task_run.result`.

**Claim assembly (deterministic, no LLM)**: the `claim_assembly` stage maps the Task result's `basis` — per-field `{reasoning, confidence, citations[{url, title, excerpts}]}` — into `AtomicClaim` + `ClaimEvidence`; citation URLs become/merge into `SourceRecord`s (tier via existing `determine_source_tier`). The verbatim-substring invariant is enforced against citation excerpts now, and against Extract `full_content` after P-02. Gemini claim extraction survives only as the offline/no-key fallback.

### 4.3 Acceptance Criteria
- A full investigation cites ≥ 3× more distinct sources than baseline (~18 excerpts).
- Every claim carries a Parallel-native confidence, displayed at the Raw Evidence dial level.
- SSE shows per-domain Parallel progress + source stats ("FestivalAgent: 47 sources considered, 12 read").
- Pipeline completes (degraded) with no `PARALLEL_API_KEY`; `tests/` green offline.

---

## 5. P-02 · Verbatim Provenance Hardening (Extract API)

### 5.1 Problem
"Every quote is a verified verbatim substring with a SHA-256 seal" is currently only checkable against short search excerpts, and `contentHash` hashes a concatenation of excerpts, not the source document.

### 5.2 Design
`ParallelExtractTool` (`backend/tools/parallel_extract.py`, new), invoked inside the `claim_assembly` stage:

1. Collect distinct citation URLs backing FACT/ALLEGATION claims (cap: top N=12 by tier, then citation count).
2. `client.extract(urls=batch, objective=...)` in batches of ≤ 5.
3. For each `ExtractResult` with `full_content`:
   - **Verify**: every quoted excerpt must be a verbatim substring of `full_content` (whitespace-normalized). Failures flip `verificationStatus` → `UNVERIFIED_EXCERPT` — never dropped, surfaced in Raw Evidence.
   - **Seal**: `SourceRecord.fullContentHash = sha256(full_content)`; keep excerpt hash for back-compat; adopt Extract's `publish_date` when Search lacked one.
4. Persist hash + length + retrieval timestamp in the Firestore ledger (not full text).

`CitationPopover.tsx` gains a provenance line: *"Verified against full document · sha256 ✓ · retrieved 2026-08-23"* vs *"Verified against excerpt only"*.

### 5.3 Acceptance Criteria
- ≥ 90% of Tier-1/2 FACT claims verified against `full_content` in a demo investigation.
- Tampered/paraphrased quote fixture detected and flagged (`tests/test_extract_verification.py`, new).
- Export (`export_service.py`) includes full-content hashes in the archival seal block.

---

## 6. P-03 · Search API Deepening (cheap wins, do first)

Small diffs in `backend/tools/parallel_search.py` and call sites; shippable in one PR **before** the ADK migration (the tool is reused as-is by ADK `FunctionTool`s).

### 6.1 Per-query fan-out with URL dedupe
The Planner's per-domain query sets are currently bundled into a single call capped at 6 results. Fan out **one call per query** (bounded by the semaphore, raised 3 → 5), merge, dedupe by normalized URL, keep per-query attribution in `SourceRecord.discoveredByQuery`. This stays the fallback pipeline after P-01.

### 6.2 `advanced_settings` everywhere
- `source_policy.include_domains` / `exclude_domains` per call site, from the shared tier registry (§7.2).
- `source_policy.after_date` where recency matters (participant feedback: last 3 years; open calls: current year).
- `excerpt_settings.max_chars_per_result = 1500`; `max_results = 10` per query, trimmed post-dedupe.
- `fetch_policy.max_age_seconds` for deadline-bearing pages.
- `session_id = investigation_id` on every call → Parallel-side tracing.

### 6.3 Mode/processor tied to the Detail Dial & entry point
| Entry point | Mode / Processor |
| :--- | :--- |
| Disambiguator candidate scan | `turbo` |
| Fallback domain research | `advanced` |
| Task API domain research (P-01) | processor `base` / `core` / `pro` by Detail Dial |
| Opportunity Scout quick pass | `basic` |

The Detail Dial becomes a *research depth* control, not just display density — a coherent judging story.

### 6.4 Acceptance Criteria
- Evidence pool ≥ 25 distinct deduped sources per investigation.
- All Search calls carry `session_id` + explicit `source_policy`.

---

## 7. P-04 · Forensic Deep Vetting on Real Registries (Task API + Source Policy)

### 7.1 Problem
`DeepVettingAgent` advertises "Companies House, WHOIS, rules plagiarism, jury dossiers" but makes **zero Parallel calls** — it is Gemini re-reading already-collected general sources.

### 7.2 Design
Five source-policied Task runs, one per dimension, run by the `deep_vetting` `ParallelAgent` (§3.3):

| Dimension | `source_policy.include_domains` | Task objective (sketch) |
| :--- | :--- | :--- |
| Corporate identity | `companieshouse.gov.uk`, `gov.uk`, `find-and-update.company-information.service.gov.uk` | Registered company behind {festival}, incorporation date, filings, officers, strike-off notices |
| Domain forensics | WHOIS/RDAP mirrors, `crt.sh`, hosting lookups | Registration age vs claimed founding year; registrant country vs claimed city |
| Venue reality | venue operators' domains, city listings, maps/press | Does the claimed venue exist, host public screenings, list this festival? |
| Jury & laurels | trade press, guild sites, IMDb | Do named jurors exist and acknowledge the role; are laurels third-party attributed? |
| Rules plagiarism | *(exclude the festival's own domain)* | Festivals whose rules/FAQ overlap verbatim with {festival}'s |

Per-dimension source policies live in a shared registry module **`backend/tools/source_tiers.py`** (new), replacing the hardcoded sets in `parallel_search.py` and feeding §6.2. The `vetting_scorer` `LlmAgent` computes `overallAuthenticityScore` **citing Parallel basis evidence only**.

### 7.3 Acceptance Criteria
- Vetting a real UK festival cites ≥ 1 `companieshouse.gov.uk` source retrieved *during* vetting (tier badge visible in `DeepVettingMatrix.tsx`).
- Vetting emits `TASK_RUN_PROGRESS` per dimension; score rationale references only cited findings.

---

## 8. P-05 · Opportunity Scout on FindAll

### 8.1 Design
1. `findall.create` / `entity_search` from `FilmProfile`: *"film festivals accepting {format}, {genre}, runtime ≤ {runtime} min, open calls with deadlines after {today}, {premiere-status} eligible"*.
2. `findall.enrich` each entity with the fields the UI already renders: deadline, fee range, qualification badges (BAFTA/BIFA/Oscars/FIAPF), premiere requirements, portal URL.
3. `findall.result` → `OpportunityCard` records; every enriched field carries citations → deadline chips get citation popovers; `.ics` export (`utils/calendar.ts`) embeds citation URLs in event descriptions.
4. **Gemini's role**: fit scoring and narrative only — never inventing entities, dates, or fees.
5. Fallback (FindAll is beta): current Search+Gemini path, UI-flagged "advisory — verify deadlines".

### 8.2 Failure Modes & Fallbacks (applies to all Parallel tools)
Every tool degrades gracefully, mirroring the Firestore in-memory fallback: Task → Search fan-out; FindAll → Search+Gemini; Extract → excerpt-only verification (claims flagged); Monitor → feature hidden without a webhook URL. All tests pass with no `PARALLEL_API_KEY`.

### 8.3 Acceptance Criteria
- No uncited deadline anywhere in Scout results.
- ≥ 10 candidate festivals for a mainstream profile; `.ics` events carry source URLs.

---

## 9. PP-01 · Playground & Documentation Parity Protocol — Continuous

> Mandated by `.agents/rules/spec_tracking_and_tool_parity.md`: every tool, modal, state, chat bubble, and pipeline change in the main app **must** have an exact interactive mirror in the Design Playground, and the steering docs must track the architecture. This section is the authoritative parity checklist for everything in this spec. **Each delivery phase (§12) is not "done" until its parity rows below are shipped in the same PR set.**

### 9.1 Architecture Page (`frontend/src/components/playground/ArchitecturePage.tsx`)

Rebuild the page around three explanatory panels so a judge (or new contributor) can understand *how everything works* post-migration:

1. **Layered diagram** — Orchestration (ADK) / Evidence (Parallel) / Reasoning (Gemini) with the six Parallel capabilities as labeled ports. Replace the current pipeline sketch.
2. **Live agent tree** — render the actual ADK composition (`SequentialAgent` → stages → `ParallelAgent` fan-outs) *generated from the backend*: new endpoint `GET /api/architecture/agent-tree` walks `root_agent.sub_agents` and returns `{name, type, model, tools[], output_key, children[]}`. The page renders whatever the code really is — the diagram can never drift from the implementation again (this endpoint is the parity mechanism itself).
3. **"What changed & why" ledger** — a versioned changelog panel (data-driven from a small TS constant) with one entry per workstream as it lands: what was replaced (e.g. "regex tool dispatch → ADK function calling"), which files, and how the new flow works, mirroring §3–§8 summaries. This is the in-product narrative for the demo video's architecture beat.

### 9.2 Agent Observability Lab (`AgentObservabilityLab.tsx`)

- **Real spans replace simulated ones.** Feed the span visualizer from the persisted `AGENT_SPAN` / `TOOL_CALL_*` / `TASK_RUN_*` events (§3.5): a "Load real investigation" picker replays any investigation's event log from Firestore into the existing OTel-style timeline; the simulator remains as "Demo mode".
- **Span schema documented in-lab**: agent spans (from ADK callbacks), tool spans (Parallel calls with duration + arg summaries), Task-run child spans (progress messages, `num_sources_considered/read`).
- **Token Stream Simulator** updated to the ADK streaming event shape used by the migrated Producer Desk (replacing the 4-word manual chunker's shape).

### 9.3 UI Gallery Lab (`UiGalleryLab.tsx`) — new states to mirror

| New UI state | Origin |
| :--- | :--- |
| Source-stats ticker per domain agent ("47 considered · 12 read") | P-01 §4.2 → `LiveProgress.tsx` |
| Claim confidence badge (Parallel-native confidence levels) | P-01 §4.2 |
| Provenance line variants: "full document ✓ sha256" vs "excerpt only" vs `UNVERIFIED_EXCERPT` flag | P-02 §5.2 → `CitationPopover.tsx` |
| Registry-tier citation badge (Companies House / WHOIS) in vetting matrix | P-04 §7.3 → `DeepVettingMatrix.tsx` |
| Cited deadline chip with popover (Scout) + "advisory" fallback flag | P-05 §8.1 → `OpportunityCard.tsx` |
| Festival Watch states: watching / event toast / re-vet offer / "Check now" | P-06 §10 → `HistorySidebar.tsx` + toast |
| Real function-call chip in chat (tool name + args mounted by ADK, replacing inferred dispatch) | A-01 §3.2 → `ChatBubble.tsx` tool cards |

Every state must be cycle-able in the gallery (loading / success / degraded-fallback / error), matching the existing playground convention.

### 9.4 Capabilities Modal (`CapabilitiesModal.tsx`)

Per the steering rule, add under the corresponding domain cards, each with 1-click `searchExamples`: **Full-Document Verification** (P-02), **Registry Vetting — Companies House & WHOIS** (P-04), **Verified Open-Call Discovery** (P-05), **Festival Watch — continuous monitoring** (P-06), **Research Depth Dial** (P-03/§6.3).

### 9.5 Design Tokens Lab (`DesignTokensLab.tsx`)

Register any new tokens introduced by the states above (confidence-level color ramp, verification-status badge colors, watch-alert accent) so they exist in both themes before the components ship.

### 9.6 Steering & Repository Documentation

| Document | Required update |
| :--- | :--- |
| `WHAT_THE_HUMAN_SHOULD_DO.md` §Architecture Tracking | Rewrite "Current State" to the three-layer architecture **once A-01 M3 lands** (the "ADK-based orchestration" sentence becomes true then, not before); log each phase in "Recent Changes"; keep parity with §9.1's ledger |
| `README.md` | Replace the single "Search Engine" stack row with the six-capability Parallel matrix + ADK orchestration row; update the architecture ASCII diagram to the agent tree; refresh test counts (currently stale at "15/15") |
| `.agents/rules/spec_tracking_and_tool_parity.md` | Add this spec to the tracked-spec list; extend the parity rule to cover the `agent-tree` endpoint (backend agent changes must keep the endpoint's walker accurate) |
| `docs/` | This document lands as `docs/SPEC_PARALLEL_ADK_EVIDENCE_ENGINE.md`; move to `docs/done/` on completion |

### 9.7 Parity Acceptance Criteria

- `GET /api/architecture/agent-tree` output matches the coded agent tree (asserted by `tests/test_architecture_endpoint.py`, new — this makes parity *tested*, not aspirational).
- Every row in §9.3's table has a gallery entry with all four states cycle-able.
- Observability Lab replays a real completed investigation end-to-end from Firestore events.
- No workstream PR merges without its §9 rows (checklist item in PR description).

---

## 10. P-06 · Festival Watch (Monitor API + Webhooks + Task Groups) — Differentiator

1. **Watch a festival**: from a completed dossier, "Watch this festival" → `monitor.create(type="event_stream", frequency=weekly, processor="lite", webhook={url: <cloud-run>/api/webhooks/parallel})` scoped to the entity's domain + trade press; `monitor_id` stored on the investigation.
2. **Watch a deadline** (Scout): `type="snapshot"` monitors on submission pages for deadline/fee changes of calendar-exported opportunities.
3. **Webhook receiver** (`POST /api/webhooks/parallel`, new): verify signature, persist to Firestore, emit SSE, and send Web Push (VAPID keys already provisioned in `.env.example`).
4. **Re-vet on signal**: material events offer one-click "Re-run Deep Vetting" (reuses P-04); batch re-vetting of all watched festivals via **Task Group** (one run per festival, group `events` → History sidebar).
5. Management UI in `HistorySidebar.tsx`; `monitor.trigger` exposed as "Check now" — the forced-event → webhook → toast loop is the demo video's money shot.
6. Guardrails: max 3 active monitors per session identity; weekly minimum frequency.

**Acceptance**: watch lifecycle survives container restarts (Firestore state); triggered event visibly lands as a toast within one demo take.

---

## 11. Cross-Cutting Concerns

### 11.1 Cost & Rate Governance
Central `ParallelBudget` helper: per-investigation ceilings (Summary dial ≤ 1 `base` task + extracts; Raw Evidence ≤ 3 `core`/`pro` tasks); spend estimates logged to Firestore. Keep semaphore bounds; exponential backoff on 429 (SDK retries + jittered app-level retry). Cache Search/Extract results in the hash ledger keyed by (normalized query/url, week). ADK `LlmAgent.retry_config`/`timeout` set on every agent.

### 11.2 Observability
Tag every Parallel call with `metadata`/`session_id` = investigation id. `TaskRunSourceStats` and ADK spans surface in the Observability Lab (§9.2). Parallel call counts/durations tracked on the Architecture page ledger.

### 11.3 Security
Webhook endpoint signature-verified and rate-limited (existing `slowapi`); no full extracted text stored; outreach remains sandboxed; no new secrets beyond the existing Secret Manager pattern (webhook signing secret added there).

---

## 12. Phased Delivery Plan

| Phase | Scope | Parity gate (§9) | Outcome for judging |
| :--- | :--- | :--- | :--- |
| **Phase 1** (1–2 days) | P-03 Search deepening + `source_tiers.py` registry | Capabilities modal: Depth Dial entry | Bigger evidence pool; source-policy story |
| **Phase 2** (2–3 days) | A-01 M1–M3: ADK skeleton, session service, event bridge, pipeline migration | Architecture page panels 1–2 + agent-tree endpoint; Observability Lab real-span replay | "ADK-based orchestration" becomes true; live agent tree |
| **Phase 3** (2–3 days) | P-01 Task-API domain agents; P-02 Extract verification; A-01 M4 (Producer Desk function calling) | Gallery states: source-stats, confidence, provenance; token-stream shape update; ledger entries | Flagship: Parallel *is* the research engine; provenance claim mechanically true; regex dispatch deleted |
| **Phase 4** (2 days) | P-04 registry vetting; P-05 FindAll scout; A-01 M5 flag flip | Gallery: registry badges, cited deadlines; Capabilities modal rows | Authenticity score backed by registries; no hallucinated deadlines |
| **Phase 5** (1–2 days) | P-06 Festival Watch; Task Group re-vetting; README/steering final pass; optional M6 Agent Engine evaluation | Watch states in gallery; §9.6 docs complete; stale README claims fixed | Live "watch" demo moment; docs judge-proof |
| **Phase 6** (2 days) | §15 Submission readiness: demo mode, endpoint hardening, case studies, video, Devpost | H-01 checklist 100% green | Judge's first five minutes are flawless |

**Calendar anchoring (deadline: Tue 9 Sep 2026, 23:00 GMT+2):** starting 24 Aug, Phases 1–5 land by **Thu 4 Sep** (code freeze for features), Phase 6 case studies + hardening by **Fri 5 Sep**, demo video recorded **Sat–Sun 6–7 Sep** (per H-06 beat sheet), Devpost submitted **Mon 8 Sep** — a full buffer day before the deadline. If schedule slips, cut from the bottom: P-06 Festival Watch degrades to the Monitor demo in the Playground only; P-05 FindAll falls back to §8.2's flagged Search path. **Never cut Phase 6** — an un-demoable feature is worth zero points.

---

## 13. Test Plan Additions

| Test file | Coverage |
| :--- | :--- |
| `tests/test_adk_pipeline.py` (new) | Full pipeline via `Runner` + `InMemorySessionService` + callback-injected model responses; state keys, event sequence, Firestore projection golden-file |
| `tests/test_adk_tools.py` (new) | Producer Desk function-calling matrix: every `ToolCallType` reachable; tool args validated |
| `tests/test_parallel_task.py` (new) | basis→claim mapping, confidence propagation, event bridging, fallback trigger |
| `tests/test_extract_verification.py` (new) | verbatim pass, tampered-quote flag, full-content hash seal |
| `tests/test_source_policy.py` (new) | per-domain include/exclude construction from `source_tiers.py` |
| `tests/test_findall_scout.py` (new) | criteria compilation, citation-bearing deadlines, beta-unavailable fallback |
| `tests/test_monitor_watch.py` (new) | monitor lifecycle persistence, webhook signature, SSE/push emission |
| `tests/test_architecture_endpoint.py` (new) | agent-tree endpoint matches coded composition (parity guard) |
| Existing suites | must stay green with no API keys (offline callbacks + tool fallbacks) |

---

## 14. Explicit Non-Goals

- **No Parallel Chat API** anywhere (hackathon rule: Gemini is the only LLM). The Producer Desk is an ADK `LlmAgent` on Gemini with real function calling.
- No second LLM of any kind; only `gemini-*` model ids may appear in `LlmAgent.model` (CI-checked). Parallel Task processors are research infrastructure returning cited structured data; all free-text reasoning is Gemini's.
- No REST contract changes; the frontend is only *extended* (new states), never migrated.
- No mandatory Agent Engine deployment (Cloud Run stays; M6 is an evaluation only).
- No real outbound email (Outreach stays sandboxed); Monitor webhooks are inbound only.
- No storage of full extracted document text (hashes + excerpts only).

---

## 15. Hackathon Submission Readiness (H-01 … H-07)

> The judging criteria are Technological Implementation, Design (a *complete product experience*), Potential Impact ("based on **what's demonstrated**"), and Quality of the Idea. Everything in §3–§10 raises the ceiling; this section makes sure the judges actually *see* it. A judge's evaluation is realistically: click the hosted URL, poke for five minutes, skim the repo, watch the video. Optimize exactly that path.

### H-01 · Submission Compliance Checklist (hard requirements from the brief)

| # | Requirement | Current state | Action |
| :--- | :--- | :--- | :--- |
| 1 | Public repo with **all** source + run instructions | Repo exists; README quickstart present | Re-run the README quickstart verbatim on a clean machine before submitting; fix any drift (pin `google-adk`/`parallel-web` versions) |
| 2 | License **detectable in the About section** | Apache 2.0 `LICENSE` present ✓ | Verify GitHub shows "Apache-2.0" in the repo sidebar/About; if not, ensure the file is stock-format so GitHub's detector recognizes it |
| 3 | **Actual runtime use** of Google Cloud + Parallel "imported and called in code, not just named in the README" | True, but a judge must find it | Add a README section **"Where the partner APIs are called"**: a table of `file:line` links — Parallel (`tools/parallel_search.py`, `tools/parallel_task.py`, `tools/parallel_extract.py`, monitor/webhook, findall) and Google Cloud (ADK agents, Vertex Gemini, Firestore, Secret Manager, Cloud Run). Make verification a 30-second job |
| 4 | Hosted project URL | Cloud Run live ✓ | Keep it warm and hardened (H-03, H-04) |
| 5 | 3-minute demo video, English, shows the agent **functioning as built** (explicitly *not* a cinematic trailer) | `09-DEMO-VIDEO-NOTES.md` referenced in steering doc but **missing from the repo** | Create it from the H-06 beat sheet; record real app usage with narration |
| 6 | Partner track selection | — | **Parallel track** on the Devpost form |
| 7 | Devpost form | — | Write the description mapped one-to-one to the four judging criteria (H-07) |

### H-02 · The Judge's First Five Minutes (demo mode)

A cold visitor must reach a "wow" without waiting 45+ seconds for a live pipeline or burning API budget:

- **Golden dossiers**: seed Firestore with 2–3 fully completed showcase investigations (see H-05). The landing experience and History sidebar offer **"▶ View a completed investigation"** as a one-click path to the full dossier — Detail Dial, provenance popovers, credibility radar, deep-vetting matrix — with zero latency and zero API spend. The SSE event-replay feature (already built) doubles as a **"Replay this investigation live"** button: the judge watches the whole agent pipeline stream past in seconds, from persisted events.
- **Curated starter chips** (`StarterPromptChips.tsx`): make the first three chips ones that are *rehearsed and reliable* — each triggering a distinct Producer Desk function call (due diligence, scout, compare arena).
- **Graceful budget exhaustion**: if Parallel/Gemini quota is exhausted mid-judging, the UI shows a friendly banner ("Live research is at capacity — explore a completed investigation") instead of a spinner or a stack trace. Wire this to the `ParallelBudget` helper (§11.1).

### H-03 · Uptime & Latency During the Judging Window

- **`min-instances`: 0 → 1** in `cloudbuild.yaml` from submission day through results (currently 0: the judge's first click pays a full cold start — Python + Firestore + Vertex init). Cost is a few dollars for the window; the first impression is priceless.
- Cloud Scheduler ping to `/healthz` every 5 minutes as a belt-and-braces warmer + free uptime log.
- **Deployment freeze** after the video is recorded — the hosted URL must match the video. Tag the submitted commit (`git tag hackathon-submission`) so judges and teammates can diff anything later.
- GCP **budget alert** on the project and a **reserve Parallel API key** (or confirmed credit headroom) held back for the judging window — do not let dev testing drain the same quota judges will hit.

### H-04 · Public-URL Hardening (abuse & cost protection)

The URL is public and unauthenticated with 7,800+ hackathon participants free to poke it. Today only 3 endpoints have `slowapi` limits (`/api/investigations` create, `/api/chat`, `/api/scout`). Add:

- Per-IP limits on **every** mutating/expensive endpoint: `confirm-entity`, `resume`, `outreach/draft`, `outreach/approve`, `analyze-doc`, `feedback`, batch endpoints.
- **Disable `/api/test-pipeline` in production** (`ENVIRONMENT=production` guard) — it currently lets anyone run pipeline machinery unauthenticated.
- Global concurrency cap on simultaneous live pipelines (queue beyond N=3, with an honest "queued" SSE event) so a burst can't stampede Vertex/Parallel quotas.
- Cap uploaded document size and reject non-text/PDF payloads server-side (the guard exists client-side; enforce it in `analyze-doc`).
- Firestore per-day investigation cap with the H-02 banner as the over-limit UX.

### H-05 · Demonstrated Impact: Two Published Case Studies

"Potential Impact … based on what's demonstrated" rewards receipts, not claims:

- Run the full pipeline on **two real, contrasting subjects**: one established festival with strong public records (e.g. a BAFTA-qualifying UK festival) and one *documented* problematic scheme (choose a case already covered by reputable press so every claim is citable).
- Export both dossiers (existing Markdown export + SHA-256 seals) to `docs/case-studies/`, link them from the README and the **Why Screened** page, and use them as the H-02 golden dossiers — one artifact serving three purposes.
- **Responsibility guardrail (do this regardless of the hackathon)**: the app publishes claims about real organizations. Enforce the existing neutral framing end-to-end — ALLEGATION vs FACT labels, citations on everything, no invented conclusions — and add a visible disclaimer to dossier views and exports: *"Screened aggregates and quotes public sources; it does not make accusations. Verify independently before acting."* This is both legally prudent and a differentiator judges notice: an agent system that handles allegations *carefully* is rarer than one that makes them.
- Quantify the baseline in the Why Screened matrix with the case-study numbers: sources consulted, claims verified, elapsed time, fees at risk — real measured values from the two runs, not estimates.

### H-06 · Demo Video Beat Sheet (3:00, becomes `09-DEMO-VIDEO-NOTES.md`)

| Time | Beat | On screen |
| :--- | :--- | :--- |
| 0:00–0:20 | The problem: submission fees lost to opaque festivals; one sentence on the manual baseline | Why Screened matrix |
| 0:20–0:55 | Producer Desk: natural prompt → **real Gemini function call** mounts the Mini-UI → 1-click launch | Chat + tool card + launch transition |
| 0:55–1:40 | Live pipeline: ADK agent tree lights up; Parallel source-stats ticker ("47 considered · 12 read"); dossier appears | LiveProgress + Architecture page agent tree (picture-in-picture) |
| 1:40–2:10 | Evidence: Detail Dial to Raw Evidence; citation popover with **full-document sha256 ✓**; contradiction panel | EvidenceDossier |
| 2:10–2:35 | Deep vetting: Companies House-cited authenticity score; credibility radar | DeepVettingMatrix |
| 2:35–2:50 | **Money shot**: Festival Watch — `monitor.trigger` fires, webhook lands, toast + push appear live | HistorySidebar + toast |
| 2:50–3:00 | Stack card: ADK orchestration · Gemini reasoning · Parallel evidence (6 APIs) · Cloud Run/Firestore; impact numbers from H-05 | Architecture page layered diagram |

Rules honored: real app functioning end-to-end, English narration, no cinematic filler. Record at 1080p+, rehearse the money shot with `monitor.trigger` ready in a terminal.

### H-07 · Repo & Devpost Hygiene (judge-skim-proofing)

- **Fix dangling references a skimming judge will trip over**: `WHAT_THE_HUMAN_SHOULD_DO.md` and `.agents/rules/` point to `RESEARCH/antigravity-plan/` and `09-DEMO-VIDEO-NOTES.md`, neither of which exists in the repo — create them or correct the references. Stale pointers read as sloppiness in an otherwise meticulous repo.
- README truthfulness pass (final): test counts (currently a stale "15/15" badge), the ADK claim (true only after M3), the architecture diagram (§9.6), and removal of the duplicate `motion`/`framer-motion` dependency noted during review.
- **Devpost description structured as the four judging criteria**, one short paragraph each: *Technological Implementation* (ADK agent tree + 6 Parallel APIs, link to the "Where the partner APIs are called" table), *Design* (complete product: dossier, playground, PWA, command palette), *Potential Impact* (case-study numbers), *Quality of the Idea* (verbatim-provenance invariant + continuous monitoring as the non-obvious angle).
- Screenshot set for the Devpost gallery: dossier with popover open, agent tree, vetting matrix, watch toast — the same four beats as the video.

### H-08 *(stretch, only if Phase 6 finishes early)* · Live "Judge Console"

A `/judge` route (linked from the README, not the nav) that condenses the whole evaluation into one screen: buttons for "Replay golden investigation", "Run live mini-investigation (rate-limited)", "View agent tree", "Trigger a watch event", plus the runtime-use table with file links. Judges are engineers under time pressure; removing every second of navigation friction between them and your best features is the cheapest possible score multiplier.
