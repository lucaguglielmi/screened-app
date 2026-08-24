# 🔎 14. Verification Remediation Spec (Open Items)

> **Document Version**: 1.0.0
> **Target System**: Screened — Agentic Cinema Due Diligence
> **Status**: Proposed for Implementation

This document outlines the reality of the codebase relative to the Open Items Review, confirming significant gaps between the application's presented behavior, its documentation, and its actual execution. It serves as the remediation plan.

---

## 1. Pipeline Execution & ADK Integration
**Findings:**
The ADK-based pipeline is fundamentally broken and relies on silent fallbacks.
- The `PlannerAgent` fails due to missing `new_message` arguments in `Runner.run_async` (`state_machine.py:372`).
- Domain `LlmAgent`s lack a `model` configuration (`domain_agents.py:43`).
- `OpportunityScout` imports non-existent ADK modules (`google.adk.sessions.memory`), uses incorrect event schemas, and unconditionally degrades to a Gemini fallback.
- `state_machine.py` and `adk_bridge.py` reference undefined enums (`QuestionCategory.BACKGROUND`, `Stance.SUPPORTING`, `EventType.SEARCH_STARTED`, `EventType.SEARCH_COMPLETED`).
- `SourceRecord` is used but not imported in `main.py`, crashing `/api/investigations/{id}/deep-vetting` on cache misses.
- Agent failures are silently swallowed, allowing degraded fallbacks to run without failing the overarching pipeline visibly.

**Remediation:**
- Fix `Runner.run_async` invocations to include `new_message` as `types.Content`.
- Explicitly define models for domain `LlmAgent`s.
- Correct ADK memory imports and event types in `OpportunityScout`.
- Add missing enum values to `models.py` and `events.py`.
- Import `SourceRecord` in `main.py`.
- Implement a `STRICT_MODE` environment variable to bypass `try/except` fallbacks during testing.

## 2. Test Suite Validity
**Findings:**
Tests are passing against the fallback paths, not the ADK pipeline.
- `FirestoreSessionService` in memory mode destructively overwrites dictionaries instead of merging (`firestore.py:41`), breaking local end-to-end tests.
- 100% test pass claims are inaccurate; the ADK integration is currently crashing the pipeline.
- `conftest.py` applies mocks *after* module singletons instantiate, causing the singletons to bypass mocks or fall back gracefully.

**Remediation:**
- Fix memory mode in `FirestoreSessionService` to perform a dictionary merge (`dict.update()`).
- Reorganize test initialization so module singletons utilize mocked ADK clients correctly.
- Fix broken end-to-end assertions.

## 3. Core User Flow & UI
**Findings:**
- `handleDeepScreen` in `App.tsx` calls `handleReset()` *after* setting the active tool to `DUE_DILIGENCE`. React state batching throws the user back to `CONVERSATIONAL_DESK`, meaning the user never sees the live pipeline.
- No light mode testing was performed; color tokens are largely missing for it.
- Frontend chunks exceed 500kB (React + Motion), requiring dynamic imports for faster TTI.

**Remediation:**
- Reorder state updates in `handleDeepScreen` to navigate properly.
- Lock the app to dark mode (`dark` class on html/body) or implement missing light mode tokens.
- Add code-splitting (`React.lazy`) for heavy UI components (e.g., flow diagrams).

## 4. Public Exposure & Security
**Findings:**
- `GET /api/feedback` leaks seeded PII (full names and emails).
- Webhook endpoints (`webhooks.py`) do not validate timestamp age, allowing indefinite replay attacks.
- Webhook signature mismatches log the *expected* HMAC, leaking valid signatures to logs.
- `POST /api/investigations/batch` accepts unbounded lists, creating a DoS vector.
- Exceptions (`ValueError`) are returned as `detail=str(e)` to the client, exposing internal implementation details.
- No rate limiting on token usage or concurrency bounds exist for expensive `/api/investigations` endpoints.

**Remediation:**
- Remove PII from `FeedbackItem` responses or restrict the endpoint to authenticated admins.
- Add timestamp expiration checks (e.g., 5 mins) to webhooks.
- Remove `expected_signature` from warning logs.
- Enforce maximum array lengths (e.g., 20) on batch endpoints.
- Sanitize HTTP 400/500 `detail` responses.
- Implement concurrency locks or token quotas for LLM endpoints.

## 5. Fabricated Presentation
**Findings:**
The application fabricates data to appear functional:
- The Deep Vetting Matrix displays a highly detailed preview fixture (Raindance Film Festival) if the real report fails or is missing, with no "SAMPLE" label.
- The "Audit SHA-256 Digest" simply maps the festival name characters to hex and pads to 64 chars. It is not a cryptographic hash.
- `WhyScreened.tsx` quotes and statistics are hardcoded and fabricated.
- "Aldergate Film Festival" is a fictional entity presented as a real suggestion.
- The Demo Video script relies on UI states that currently only render via these fabrications.

**Remediation:**
- Add explicit "PREVIEW DATA" banners to all fallback fixtures.
- Compute a real SHA-256 hash of the investigation dossier JSON in `DetailDial.tsx`.
- Disclaim or replace fabricated quotes in `WhyScreened.tsx`.
- Clearly demarcate "Aldergate Film Festival" as a test/demo entity.

## 6. Operations & Deployment
**Findings:**
- Webhooks are sent to `screened-hackathon.a.run.app`, but the app is hosted at `screened-pludf2u7yq-nw.a.run.app`.
- Deployment scripts (`deploy.sh`, `deploy.yml`) fail to inject new environment variables (`DIAGNOSTICS_TOKEN`, `VITE_GA4_MEASUREMENT_ID`, etc.) and IAM roles.
- The GitHub deploy workflow does not depend on test success.
- `smoke.sh` hits `/api/test-pipeline`, which returns 403 Forbidden in production.
- Cloud Tasks falls back silently to `asyncio` if misconfigured, risking background task termination on Cloud Run scale-to-zero.

**Remediation:**
- Correct the `base_url` resolution in `monitor_tools.py` to use the actual production host.
- Update deployment scripts to include all required environment variables and secrets.
- Block deployment if tests fail (`needs: test` in Actions).
- Create a dedicated staging environment for `smoke.sh` or use an admin token to bypass the 403.
- Enforce Cloud Tasks configuration and fail loudly if omitted, to avoid silent data loss.

## 7. Documentation Discrepancies
**Findings:**
- Claims of "100% Verifiable Evidence" and "never hallucinated evidence" in DEVPOST and README contradict the UI fixtures and fallback behavior.
- `SPEC_PARALLEL_ADK_EVIDENCE_ENGINE.md` is outdated regarding the current partial ADK implementation.
- `13_DATA_PROTECTION_PII_MIDDLEWARE_SPEC.md` does not exist, yet `WHAT_THE_HUMAN_SHOULD_DO.md` claims it is completed via a client-side sanitizer.

**Remediation:**
- Align the README and Devpost submission with reality (remove "never hallucinated" claims until the UI stops faking data).
- Update the ADK spec to reflect current implementation status.
- Remove or correct the reference to the missing PII middleware spec.
