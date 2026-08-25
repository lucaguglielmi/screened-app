# 🛠️ Engineering Specification: Architecture Remediation & Hardening

> **Document Version**: 1.0.0-SPEC
> **Target System**: Screened — Agentic Cinema Due Diligence
> **Purpose**: Formalizing the solutions to the 8 gap-analysis areas identified in the Codebase Review Checklist (Baseline `cd11962`). 
> **Status**: Approved for Implementation

---

## 1. ADK Orchestration & Event Model Parity

### 1.1 `Runner` Adoption
The ADK requires agents to be invoked through a `Runner` to handle event streaming, state management, and lifecycle hooks correctly. 
- **Requirement:** Refactor `ProducerDeskAgent` in `backend/agents/producer_desk.py` to use `Runner(agent=agent).run_async(new_message=user_message)` instead of directly calling `await agent.run_async(prompt=...)`.
- **Requirement:** Ensure `Runner.run_async` is supplied with the correct required kwargs (`user_id`, `session_id`, `new_message`, etc.) in all call sites, including `state_machine.py`.

### 1.2 Session State Mechanics
ADK agents read and write state through `state_delta` emitted during runs, handled by the `BaseSessionService`.
- **Requirement:** `FirestoreSessionService` (and the `InMemorySessionService`) must strictly match the `BaseSessionService` interface.
- **Requirement:** State updates in `state_machine.py` should be injected via `state_delta` rather than direct Firestore mutation where possible.

### 1.3 Strict Agent Configuration
- **Requirement:** In `opportunity_scout.py`, decouple tool execution from structured output generation. ADK does not natively support combining `output_schema` and `tools` on a single agent efficiently; split this into a `SequentialAgent` where the first fetches data via tools and the second formats the state into the structured `OpportunityCard` schema.
- **Requirement:** Provide an explicit model definition to the `ParallelAgent` sub-agents in `domain_agents.py` if they lack it.

### 1.4 Event Bridge Alignment
- **Requirement:** Ensure `backend/orchestrator/adk_bridge.py` consumes ADK `Event` objects correctly. The `Event` class schema in ADK must be respected (check attributes like `event.data`, `event.agent_name` rather than assuming dict/custom shapes).

---

## 2. Truthful Fallbacks & Data Integrity

### 2.1 UI Fallback Labeling
A due diligence application cannot present hallucinated or fallback content as verified fact.
- **Requirement:** Modify `DeepVettingMatrix.tsx` and `EvidenceDossier.tsx` so that if the backend returns no deep vetting report or missing scores, the UI explicitly renders a "No Data Available" or "Pending Deep Vetting" state rather than injecting hardcoded dimension labels and arbitrary confidence values.
- **Requirement:** The "SHA-256 digest" exported by the system must actually be a hash of the retrieved source documents, not a client-side mocked string. Remove all hardcoded claims of `sha256` hashing from the UI if the backend does not provide it.

### 2.2 Seed Data Clarification
- **Requirement:** Any data produced by `seed_dossiers.py` and rendered to unauthenticated users must carry a prominent `[DEMO DATA]` badge in the UI. 

---

## 3. Public Exposure & API Hardening

### 3.1 Rate Limiting & Abuse Prevention
- **Requirement:** Apply `slowapi` rate limits globally across all mutating and expensive endpoints (`/api/investigations/batch`, `/api/investigations/{id}/confirm-entity`, `/api/webhooks/parallel`, `/api/chat`, etc.).
- **Requirement:** Ensure the `slowapi` configuration trusts the correct headers (e.g., `X-Forwarded-For`) to read the actual client IP behind the Cloud Run load balancer.

### 3.2 Error Obfuscation
- **Requirement:** Audit all FastAPI route handlers. Catch internal exceptions and return a generic `500 Internal Server Error` message to clients, rather than leaking stack traces or internal exception details (`detail=str(e)`).

### 3.3 CORS & Webhook Security
- **Requirement:** In `backend/main.py`, remove the conflicting CORS configuration (`allow_origins=["*"]` with `allow_credentials=True`). Explicitly list production origins, or set `allow_credentials=False`.
- **Requirement:** Validate webhook signature freshness (add a replay window check) in `routers/webhooks.py`.

---

## 4. Frontend Resilience

### 4.1 Dependency Deduplication
- **Requirement:** Audit `frontend/package.json` to resolve conflicts between `motion` and `framer-motion`. Remove unused animation packages.

### 4.2 SSE Stability
- **Requirement:** In `App.tsx`, implement an `onerror` handler for the `EventSource` connection. Ensure that auto-reconnections gracefully resume the stream without duplicating past events in the UI.

### 4.3 Styling Strictness
- **Requirement:** Remove hardcoded hex colors (e.g., `bg-[#0E1124]`) from main views (`ChatContainer.tsx`, `OpportunityScout.tsx`). Replace them with CSS variables/tokens that respect the OS `prefers-color-scheme`.

---

## 5. Backend Runtime & Cloud Run Execution

### 5.1 Eliminating Disconnected Async Tasks
Cloud Run allocates CPU *only* during active request processing. Background tasks launched via `asyncio.create_task()` that outlive the HTTP response will be immediately throttled or killed.
- **Requirement:** For the investigation pipeline, bind the execution of the ADK `Runner` strictly to the lifecycle of the active SSE connection endpoint (`/api/investigations/{id}/stream`). Do not use fire-and-forget `asyncio.create_task()` in standard REST POST handlers unless returning immediately. 

### 5.2 Firestore Concurrency
- **Requirement:** Transition all document updates in `backend/db/firestore.py` and `session_service.py` to use `merge=True` or explicit FieldPath updates, preventing concurrent domain agents from overwriting each other's state changes.

---

## 6. Test Suite Robustness

### 6.1 Mock Initialization Order
- **Requirement:** In `tests/conftest.py`, ensure ADK mocks are registered *before* FastAPI imports the application routes and singletons, so that the tests accurately cover the mocked agent behavior.

### 6.2 Offline Validation
- **Requirement:** Ensure the CI script and local `pytest` commands pass flawlessly in a zero-keys environment, asserting the fallback logic triggers correctly.

