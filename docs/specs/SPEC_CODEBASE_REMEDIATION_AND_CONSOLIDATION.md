# 🛠️ Specification: Full Codebase Remediation, Consolidation & Hardening

**Document Path**: `docs/specs/SPEC_CODEBASE_REMEDIATION_AND_CONSOLIDATION.md`  
**Status**: IN_PROGRESS  
**Author**: Antigravity  

---

## 1. Objectives & Scope

This specification executes the full technical debt cleanup, bug fixing, modularization, and gap remediation identified during the repository audit:

1. **Hygiene & Spec Consolidation**:
   - Clean obsolete one-off root migration scripts (`fix_*.py`, `remove_*.py`, `update_*.py`, `test_local.py`, `test_adk.py`).
   - Prune redundant virtual environment folders (`venv/`, `venv2/`), keeping `.venv/`.
   - Consolidate legacy specs in `docs/done/` into a single high-level architectural decision summary `docs/decisions/ARCHITECTURE_DECISIONS_SUMMARY.md` and remove outdated completed spec files.

2. **Firestore Event Collection Path Fix**:
   - Align `backend/db/firestore.py` so `save_event` writes to `investigations/{investigation_id}/events/{event_id}` matching `get_events` subcollection queries.

3. **Multi-Instance Cloud Run SSE Synchronization**:
   - Enhance `backend/orchestrator/events.py` with multi-instance support and cross-process event synchronization via Firestore / background fallback checking.

4. **Component & Agent Modularization**:
   - Deconstruct `frontend/src/components/EvidenceDossier.tsx` (2,010 lines) into focused subcomponents:
     - `frontend/src/components/dossier/DossierHeader.tsx`
     - `frontend/src/components/dossier/EvidenceLedger.tsx`
     - `frontend/src/components/dossier/AiDossierView.tsx`
   - Split `backend/agents/opportunity_scout.py` by extracting grant diligence logic into `backend/agents/grant_scout.py` while preserving 100% backwards-compatible APIs and exports.

5. **Frontend Bundle Optimization**:
   - Configure `manualChunks` in `frontend/vite.config.ts` for `@xyflow/react`, `motion`, `lucide-react`, and `react/react-dom` to eliminate the >500 kB build chunk warning.

6. **Scattered Demo Mode Consolidation**:
   - Create `backend/services/demo_service.py` to centralize all "Pinco Pallino" demo detection, mock payloads, and mock SSE generation, replacing ad-hoc string comparisons across `main.py`, `firestore.py`, and `state_machine.py`.

7. **CI/CD Quality Gate**:
   - Update `.github/workflows/test.yml` to run Node.js setup, `npm run lint`, and `npm run build` alongside Python pytest.

8. **Architecture Gaps & State Management**:
   - Add explicit architectural comments regarding deferred frontend test suite (intentionally deferred until workflow maturity) in `frontend/package.json` and `frontend/README.md`.
   - Add explicit caching strategy comments in `backend/tools/parallel_search.py`, `backend/tools/parallel_task.py`, and `backend/services/gemini_client.py`.
   - Decompose `frontend/src/App.tsx` state into dedicated custom hooks:
     - `frontend/src/hooks/useInvestigation.ts`
     - `frontend/src/hooks/useSSEEvents.ts`
     - `frontend/src/hooks/useKeyboardShortcuts.ts`

---

## 2. Execution Plan

- [ ] **Step 1**: Create `docs/decisions/ARCHITECTURE_DECISIONS_SUMMARY.md` consolidating legacy specs, remove `docs/done/` specs, and delete root scratch scripts.
- [ ] **Step 2**: Fix `backend/db/firestore.py` event path bug.
- [ ] **Step 3**: Harden `backend/orchestrator/events.py` for multi-instance event streaming.
- [ ] **Step 4**: Modularize `EvidenceDossier.tsx` and extract `grant_scout.py`.
- [ ] **Step 5**: Update `frontend/vite.config.ts` with manual rollup chunks and verify build.
- [ ] **Step 6**: Implement `backend/services/demo_service.py` and centralize demo interception.
- [ ] **Step 7**: Update `.github/workflows/test.yml` with frontend quality gate.
- [ ] **Step 8**: Add deferred testing & caching architectural comments.
- [ ] **Step 9**: Refactor `App.tsx` with dedicated custom hooks.
- [ ] **Step 10**: Execute full verification (`npm run lint && npm run build` + `pytest`).
- [ ] **Step 11**: Remove this spec file upon 100% completion.
