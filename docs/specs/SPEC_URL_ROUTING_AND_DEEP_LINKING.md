# 🌐 Product & Technical Specification: Semantic URL Routing & Direct Dossier Deep-Linking

> **Document Version**: 1.0.0-PROPOSED  
> **Target System**: Screened — Agentic Cinema Due Diligence & Funding Intelligence  
> **Status**: PENDING USER APPROVAL (Awaiting explicit verbal confirmation to execute)  
> **Scope**: Frontend Navigation & Routing Overhaul · Direct Dossier Deep-Linking · Browser History Bidirectionality · Zero-Stale State Navigation · Server-Side Fallback Validation  

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 The Problems
1. **Homepage Trap / Sticky Stale State**:
   - When a user runs an investigation (or enters demo mode `demo_pinco_pallino`), the investigation state is saved in `useInvestigation` React state and the URL query parameter is appended (`/?id=demo_pinco_pallino`).
   - When the user subsequently attempts to navigate to the Homepage (either by clicking the top-header "Screened" animated logo or the left navigation rail "S" icon):
     - The left navigation logo simply sets `activeTool` to `CONVERSATIONAL_DESK` without resetting `investigation` or clearing the URL query parameters.
     - The top header logo runs `handleReset()` which clears React state, but leaves `?id=...` in `window.location.search`.
     - Consequently, refreshing the page, hitting browser Back/Forward, or clicking back into "Festival Due Diligence" triggers `useInvestigation`'s hydration effect, which re-fetches the investigation and forces the user straight back into the dossier view.
2. **Invisible Navigation / Lack of Semantic URLs**:
   - The entire application currently shares a single generic URL path (`/`). Key workspaces such as **Festival Due Diligence**, **Grant & Funding Research**, **Why Screened Exists**, and **Festival Protection Guide** have no URL representation.
   - Users cannot bookmark, share, or deep-link to specific tools or documentation pages.
3. **Impaired Deep-Linking for Evidence Dossiers**:
   - While rudimentary query parameters (`/?id=...`) and regex matching (`/investigation/...`) exist in code, there is no standardized, clean, canonical URL format for sharing dossiers (e.g., `/diligence/demo_pinco_pallino`).
   - Exported Markdown and clipboard sharing buttons generate dated query-string links rather than clean canonical paths.

---

## 2. Proposed Architecture & Specification

### 2.1 Canonical Route Matrix

| Semantic URL Path | Target Workspace / View | Active Tool ID | Description & State Contract |
| :--- | :--- | :--- | :--- |
| **`/`** | **Screened AI (Conversational Hub)** | `CONVERSATIONAL_DESK` | Default homepage. Clears any loaded investigation from view. Fresh conversational chat desk. |
| **`/diligence`** | **Festival Due Diligence Portal** | `DUE_DILIGENCE` | Due diligence intake portal with search bar, recent search chips, and starting prompt chips. Fresh state ready for new search. |
| **`/diligence/:id`** | **Specific Evidence Dossier / Progress** | `DUE_DILIGENCE` | Deep-linked dossier for investigation `:id`. If status is `READY`, renders full dossier. If active, renders `LiveProgress` (SSE). If not found, renders clean 404 recovery. |
| **`/grants`** | **Grant & Funding Research** | `GRANT_SCOUT` | Institutional grant discovery, guidelines parser, and packaging checklist exporter. |
| **`/why-screened`** | **Why Screened Exists** | `WHY_SCREENED` | Forensic philosophy, 4-vector methodology, and platform baseline matrix. |
| **`/guide`** | **Festival Protection Guide** | `FESTIVAL_PROTECTION_GUIDE` | Anti-fraud defense manual, predatory fee traps, red flags, and vetting protocol. |
| **`/how-to-use`** | **How to Use Screened** | `HOW_TO_USE` | Step-by-step workflow guide and keyboard shortcut cheat sheet. |
| **`/playground`** | **Design Playground** | `DESIGN_PLAYGROUND` | UI design laboratory (guarded by dev flag / feature toggle). |

#### Backward Compatibility & Aliases:
- `/?id=:id` and `/?investigationId=:id` ➔ Normalized & replaced with `/diligence/:id` via `history.replaceState`.
- `/investigation/:id` ➔ Normalized & replaced with `/diligence/:id`.
- `/scout` ➔ Redirects to `/grants`.
- `/about` ➔ Redirects to `/why-screened`.
- `/protection-guide` ➔ Redirects to `/guide`.
- Any unmatched route (`*`) ➔ Gracefully redirects to `/`.

---

### 2.2 Client-Side History Router (`src/router/`)

To provide zero-latency transitions, zero bundle bloat, and complete type safety, a dedicated router module (`useAppRouter`) will be implemented:

```
┌─────────────────────────────────────────────────────────────┐
│                       useAppRouter                          │
├─────────────────────────────────────────────────────────────┤
│ • Listens to window.addEventListener("popstate")           │
│ • Parses window.location.pathname + search params           │
│ • Exposes currentRoute: RouteDefinition                     │
│ • Exposes navigate(path: string, options?: {replace})       │
│ • Dispatches custom "screened-navigation" events for sync    │
│ • Automatically updates document.title per route            │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│     LeftNavigation    │             │   App / Dossier View  │
│  • Visual active tab  │             │  • Dynamic workspace  │
│  • Zero-state links   │             │  • Deep-linked params │
└───────────────────────┘             └───────────────────────┘
```

#### Route Definition Interface:
```typescript
export type AppRoute =
  | { path: "/"; tool: "CONVERSATIONAL_DESK" }
  | { path: "/diligence"; tool: "DUE_DILIGENCE" }
  | { path: "/diligence/:id"; tool: "DUE_DILIGENCE"; investigationId: string }
  | { path: "/grants"; tool: "GRANT_SCOUT" }
  | { path: "/why-screened"; tool: "WHY_SCREENED" }
  | { path: "/guide"; tool: "FESTIVAL_PROTECTION_GUIDE" }
  | { path: "/how-to-use"; tool: "HOW_TO_USE" }
  | { path: "/playground"; tool: "DESIGN_PLAYGROUND" };
```

---

### 2.3 Comprehensive Fix for Homepage Trap

1. **Top Header Animated Logo (`Scr**ee**ned`)**:
   - Clicks call `navigateTo("/")`.
   - Clears active investigation (`setInvestigation(null)`), clears SSE activity stream, clears search query, and replaces browser URL with `/`.
   - **Guaranteed Behavior**: Clicking the header logo always brings the user back to the Screened AI conversational desk at `/`.
2. **Left Navigation App Logo ("S")**:
   - Changed from `handleSelectTool("CONVERSATIONAL_DESK")` to `navigateTo("/")`.
   - Clears lingering investigation and updates URL to `/`.
3. **Left Navigation "Festival Due Diligence" Icon**:
   - Clicks navigate to `/diligence`.
   - Always opens the clean search intake box.
   - If the user wants to return to their recent search, it is immediately available in the "Recent: ..." chip list or History drawer (⌘K).
4. **Investigation Launching**:
   - When an investigation starts (via search box, starter chip, command palette, or demo trigger) and returns an investigation object, the app immediately executes:
     `navigate(\`/diligence/${inv.id}\`)`
   - The browser address bar seamlessly reflects `/diligence/demo_pinco_pallino`.

---

### 2.4 Canonical Sharing & Deep-Linking

1. **Dossier Sticky Bar (`DossierStickyNav.tsx`)**:
   - Updated `canonicalUrl` calculation:
     ```typescript
     const canonicalUrl = `${window.location.origin}/diligence/${encodeURIComponent(entityId || "inv-001")}`;
     ```
   - Clicking "Share / Copy Link" copies this clean URL to the clipboard.
2. **Markdown Dossier Exporter (`EvidenceDossier.tsx`)**:
   - Exports reference the permanent canonical URL:
     `**Permanent Canonical URL**: https://screened.app/diligence/${entity.id}`
3. **Initial Hydration**:
   - When a user lands directly on `/diligence/:id` (via bookmark, shared link, or browser refresh):
     1. The router extracts `investigationId = :id`.
     2. Sets `activeTool = "DUE_DILIGENCE"`.
     3. Calls `fetchInvestigation(id)`.
     4. Renders loading skeleton, and once loaded, renders the full Evidence Dossier.

---

### 2.5 Cloud Run & Server-Side Fallback Validation

Cloud Run serves Screened using FastAPI with static file hosting in `backend/main.py`:
```python
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = frontend_dist / full_path
    if file_path.exists() and file_path.is_file():
        if file_path.suffix in [".html", ".json", ".webmanifest"]:
            return FileResponse(file_path, headers=NO_CACHE_HEADERS)
        return FileResponse(file_path)

    # SPA fallback returns index.html for all client routes
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file, headers=NO_CACHE_HEADERS)
```
- We will add automated backend tests in `tests/test_backend.py` to verify that GET requests to `/diligence`, `/diligence/demo_pinco_pallino`, `/grants`, `/why-screened`, and `/guide` return `HTTP 200 OK` with `index.html`.
- We will update the production smoke test script (`scripts/smoke.sh`) to verify direct deep-link resolution against the live Cloud Run service.

---

## 3. Implementation Plan & Work Breakdown

### Phase 1: Client Router Hook & Context (`frontend/src/router/`)
- Create `src/router/Router.ts` (route parsing, path matching, history wrapper, navigation dispatch).
- Create `src/router/useAppRouter.ts` (React hook integrating `popstate`, current route, query param extraction).
- Add unit tests for route matching, deep link parameter parsing, and legacy alias redirects.

### Phase 2: Refactor Navigation Components & Header
- Update [`LeftNavigation.tsx`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/components/navigation/LeftNavigation.tsx) and [`MobileNavigation.tsx`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/components/navigation/MobileNavigation.tsx) to use router links and dispatch `navigateTo(path)`.
- Update [`App.tsx`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/App.tsx) header logo to route to `/` and trigger complete state reset.
- Synchronize `CommandPalette.tsx`, `WhyScreened.tsx`, `FestivalProtectionGuide.tsx`, and `HowToUse.tsx` navigation callbacks.

### Phase 3: Investigation State & Deep Link Hydration
- Refactor [`useInvestigation.ts`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/hooks/useInvestigation.ts):
  - Strip legacy `updateUrlForInvestigation` manual query param munging.
  - Connect investigation hydration directly to router route params (`/diligence/:id`).
  - When new investigation is created, call `navigate(\`/diligence/${inv.id}\`)`.
- Update [`EvidenceDossier.tsx`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/components/EvidenceDossier.tsx) and [`DossierStickyNav.tsx`](file:///Users/lucaguglielmi/Desktop/git/screened-app/frontend/src/components/dossier/DossierStickyNav.tsx) canonical link generators.

### Phase 4: Server-Side SPA & Production Smoke Verification
- Add backend test cases verifying SPA fallback for semantic paths.
- Update `scripts/smoke.sh` to test direct deep link retrieval (`/diligence/demo_pinco_pallino`).
- Run full pre-commit verification (`npm test`, `npm run lint`, `npm run build`, `pytest`).

---

## 4. Verification & Acceptance Criteria

1. **Homepage Click Reset**:
   - From any dossier or deep page, clicking the Screened logo in the header or the "S" logo in the sidebar takes the user to `/` with the Conversational Desk visible, no lingering dossier, and URL showing `/`.
2. **Visible Semantic URLs**:
   - Visiting each navigation tab visibly changes the browser URL to `/diligence`, `/grants`, `/why-screened`, `/guide`, `/how-to-use`.
3. **Direct Dossier Deep Links**:
   - Opening `https://screened.../diligence/demo_pinco_pallino` directly loads the Pinco Pallino demo dossier (score 68).
   - Opening `/diligence/<custom_id>` fetches and displays that investigation.
4. **Browser Back / Forward Integration**:
   - Clicking Back from `/diligence/demo_pinco_pallino` returns to `/diligence` or `/`.
   - Clicking Forward returns to the dossier.
5. **Zero Regression Quality Gate**:
   - All frontend Vitest tests pass.
   - All backend Pytest tests pass.
   - Cloud Run deployment & smoke test pass with 100% green status.
