# Refactor Code Smells & Architecture Improvements
Status: COMPLETED (Implemented & Verified)

## 1. Goal Description
The objective of this specification is to address three key code smells and structural inaccuracies identified during the repository review:
*   **3A. Demo Logic Bleeding into Core Production Routes:** Removing explicit demo-mode interception (`demo_service`) from `backend/main.py`.
*   **3C. Megalithic `models.py`:** Splitting the 1,000+ line `backend/models.py` into a modular `backend/models/` package.
*   **3D. Inline Imports:** Removing inline module imports used to dodge circular dependencies, primarily by untangling the dependency graph.

## 2. Proposed Changes

### Component 1: `backend/models/` (Addressing 3C - Megalithic Models)
Split `backend/models.py` into a directory structure organized by domain. 

#### [NEW] `backend/models/__init__.py`
*   Exports all models so that existing top-level imports (e.g., `from backend.models import AtomicClaim`) continue to work seamlessly without breaking the entire codebase.

#### [NEW] `backend/models/base.py`
*   Contains core utilities (`generate_uuid`, `get_current_iso`) and foundational enums/types (`ResearchDomain`, `QuestionCategory`, `VettingSignalStatus`, `VerificationStatus`).

#### [NEW] `backend/models/investigation.py`
*   Contains core types: `Investigation`, `CandidateEntity`, `AtomicClaim`, `SourceRecord`, `Evidence`, `DisputeRecord`, `InvestigationAuditHealth`, `CreateInvestigationRequest`, etc.

#### [NEW] `backend/models/dossier.py`
*   Contains reporting types: `DossierReport`, `EvidenceDossier`, `ForensicIntelligenceSummary`, `CorporateEntity`, `TransparencyIndex`, etc.

#### [NEW] `backend/models/scout.py`
*   Contains discovery types: `FilmProfile`, `FestivalOpportunity`, `GrantOpportunity`, `GrantScoutRequest`, `GrantChecklistResponse`, etc.

#### [NEW] `backend/models/outreach.py`
*   Contains messaging types: `OutreachDraft`, `DraftOutreachRequest`, `ApproveOutreachRequest`.

#### [NEW] `backend/models/deep_vetting.py`
*   Contains forensic types: `DeepVettingReport`, `DeepVettingDimension`, `KeyPerson`, `ImageForensicRecord`.

#### [NEW] `backend/models/chat.py`
*   Contains conversational & tool types: `ChatRequest`, `DocumentAnalysisRequest`, `ToolCallType`, `DueDiligenceToolArgs`, etc.

#### [DELETE] `backend/models.py`
*   Remove the monolithic file.

---

### Component 2: Demo Logic Extraction (Addressing 3A)
Remove the hardcoded demo intercepts from `main.py`.

#### [MODIFY] `backend/main.py`
*   Remove `import demo_service` from `main.py`.
*   Remove `if demo_service.is_demo_query(query):` and related demo blocks from all endpoints (`/api/investigations`, `/api/investigations/{id}`, `/api/investigations/batch`, `/api/investigations/{id}/watch`, etc.).
*   Route all logic through the core orchestrator and database.

#### [NEW] `backend/routers/demo.py` (Optional / Alternative)
*   If demo mode is still required for the deployed hackathon app, expose a dedicated `/api/demo/...` router that implements the static responses.
*   *Design Decision for User:* Do you want to keep the demo functionality accessible via a separate clean router (e.g., `/api/demo/...`), or completely remove demo payloads from the production backend? (See Open Questions).

#### [MODIFY] `backend/services/demo_service.py` & `backend/demo_payloads.py`
*   Move these files into `backend/tests/fixtures/` if they are only needed for testing, OR move them to `backend/demo/` if retaining demo capabilities.

---

### Component 3: Removing Inline Imports (Addressing 3D)
Untangle the dependencies that necessitated inline imports.

#### [MODIFY] `backend/main.py`
*   Remove the inline import: `from backend.models import InvestigationAuditHealth`.
*   Move it to the top of the file. By splitting `models.py`, any previous circular dependency between `main.py` and `models.py` (if it existed via a service import) should be naturally resolved.

#### [MODIFY] `backend/orchestrator/state_machine.py`
*   Remove the inline import: `from backend.tools.source_tiers import determine_source_tier`. Move it to the top of the file.

#### [MODIFY] `scripts/generate_contracts.py`
*   Update the AST parser to scan the entire `backend/models/` directory instead of just `backend/models.py`, ensuring that the `npm run check-contracts` task continues to accurately generate TypeScript definitions for the frontend.

## 3. Open Questions

> [!WARNING]
> **Demo Functionality**
> Currently, typing specific demo queries (e.g. "Pinco Pallino Film Festival") triggers hardcoded payloads. If we remove this interception from the core `/api/investigations` routes, the frontend will attempt to run a real AI investigation on these queries unless updated.
> *   **Option 1:** Remove demo functionality entirely from the production app.
> *   **Option 2:** Move demo routes to `/api/demo/investigations` and update the frontend to route there when in demo mode.
> *   **Option 3:** Introduce an `InvestigationService` layer and use dependency injection to seamlessly return demo data without cluttering the router logic.
> 
> *Which approach would you prefer?*

## 4. Verification Plan

### Automated Tests
- Run `PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/` to ensure the model refactoring didn't break any backend tests.
- Run `npm run check-contracts` in `frontend/` to ensure TypeScript generation still correctly parses all models from the new directory structure.
- Run `npm run lint && npm run build` in `frontend/` to ensure no typing regressions occurred.
- Run `npm run test` in `frontend/` to verify UI components.

### Manual Verification
- Start the API server and create a standard investigation to ensure the core orchestrator pipeline still executes correctly without the demo interceptors failing.

### Component 4: Design Playground Architecture & Routing (New Requirements)
Enhance the Design Playground to use individual routes, remove the 'All' tab, and upgrade the Architecture schema to use modern interactive UI elements.

#### [MODIFY] `frontend/src/router/Router.ts`
*   Add explicit routes for each playground section (e.g., `/playground/ui`, `/playground/loaders`, `/playground/chat`, `/playground/architecture`, `/playground/benchmark`, `/playground/feedback`).
*   Ensure these routes are accessible via direct links but remain unlisted from the main navigation.

#### [MODIFY] `frontend/src/components/playground/DesignPlayground.tsx`
*   Refactor the tab state to read from the current URL route.
*   Remove the `ALL` (All Components) tab and its corresponding logic.

#### [MODIFY] `frontend/src/components/playground/ArchitecturePage.tsx`
*   Replace the static D2 SVG render with an interactive `@xyflow/react` (React Flow) component, bringing it to parity with the `SyndicateClusterGraph` used in the dossier page.
*   Implement animated arrows (`animated: true` on edges) to show data flow between the Client, WebMCP/Server MCP, Google ADK Orchestrator, Gemini AI, and Parallel Evidence API.
*   Verify and refine the architecture definitions to ensure it accurately reflects the current decoupled state (especially noting the new modular `models` layout and removed demo mocks).
