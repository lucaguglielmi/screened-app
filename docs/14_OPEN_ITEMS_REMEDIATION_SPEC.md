# 🔎 14. Verification Remediation Spec (Open Items)

> **Document Version**: 1.1.0
> **Target System**: Screened — Agentic Cinema Due Diligence
> **Status**: Completed

This document outlines the required engineering tasks to align the application's implementation with its documented architecture, testing standards, and presentation requirements.

---

## Execution Order
To ensure unblocked development, the following sequence is required:
1. **Fix `state_machine.py` `Runner.run_async` payload** (unblocks the ADK orchestration layer).
2. **Fix `FirestoreSessionService` memory-merge** (unblocks the local test suite).
3. **Execute remaining tasks** across UI, Security, Presentation, and Operations.

---

## 1. Pipeline Execution & ADK Integration

**Tasks to Complete:**
- The `PlannerAgent` requires `new_message` arguments in `Runner.run_async` (`state_machine.py:372`) to execute correctly.
- Domain `LlmAgent`s require an explicit `model` configuration (`domain_agents.py:43`).
- `OpportunityScout` requires updated ADK memory imports and corrected event schemas.
- Ensure all enum values referenced by `state_machine.py` and `adk_bridge.py` (`QuestionCategory.BACKGROUND`, `Stance.SUPPORTING`, `EventType.SEARCH_STARTED`, `EventType.SEARCH_COMPLETED`) are defined in `models.py` and `events.py`.
- Import `SourceRecord` in `main.py` to support caching for `/api/investigations/{id}/deep-vetting`.
- Introduce a `STRICT_MODE` environment variable to ensure exceptions bubble up during testing, rather than executing alternative fallback paths.

**Acceptance Check:**
- Run `STRICT_MODE=true python -m pytest tests/test_end_to_end.py`. The pipeline must execute via ADK classes without triggering the `except` fallback handlers.

## 2. Test Suite Validity

**Tasks to Complete:**
- Update `FirestoreSessionService` in memory mode to perform a dictionary merge (`dict.update()`) rather than overwriting existing records.
- Reorganize test initialization in `conftest.py` so that module singletons utilize mocked ADK clients.
- Update end-to-end test assertions to reflect the intended ADK pipeline execution outputs.

**Acceptance Check:**
- Run `pytest`. All tests must pass, and the memory-mode data store must retain pipeline progress state between steps.

## 3. Core User Flow & UI

**Tasks to Complete:**
- Adjust `handleDeepScreen` in `App.tsx` so state updates navigate the user to the active pipeline view rather than returning to `CONVERSATIONAL_DESK`.
- Resolve the hardcoded `darkroom-*` utility classes. While `index.css` provides a full `paper-*` palette for light mode, the literal migration applied static `darkroom-*` classes throughout the components, breaking the `paper-x dark:darkroom-x` pattern. Update components to utilize the responsive switching pattern.
- Implement code-splitting (`React.lazy`) for heavy UI components (e.g., framer-motion flow diagrams) to reduce initial chunk size.

**Acceptance Check:**
- Toggle the OS or browser to light mode and verify the application renders using the `paper-*` palette across all routes.

## 4. Public Exposure & Security

**Tasks to Complete:**
- Update `GET /api/feedback` to either exclude PII (names and emails) from `FeedbackItem` responses or restrict access to authenticated administrators.
- Implement timestamp expiration checks (e.g., 5-minute window) for webhook endpoints in `webhooks.py`.
- Remove the `expected_signature` value from webhook validation warning logs.
- Enforce array length limits (e.g., maximum 20 items) on `POST /api/investigations/batch`.
- Sanitize `detail` messages in HTTP 400/500 exception handlers to abstract internal implementation details.
- Implement concurrency limits or token quotas on resource-intensive LLM endpoints.

**Acceptance Check:**
- Send a request to `GET /api/feedback` as an unauthenticated user and verify that email addresses are not present in the payload.

## 5. Data Presentation

**Tasks to Complete:**
- Update the Deep Vetting Matrix to display explicit "PREVIEW DATA" or "SAMPLE" banners when rendering fallback fixtures (e.g., the Raindance Film Festival placeholder).
- Modify `deep_vetting.py` (`_get_fallback_dimensions`) to indicate fallback status rather than returning `VERIFIED_AUTHENTIC` states with static registry citations.
- Update `DetailDial.tsx` to compute a cryptographic SHA-256 hash of the investigation dossier JSON, replacing the padded hex string generation.
- Remove seeded feedback entries in `main.py` (fictional names and emails) that currently render as user testimonials.
- Update `WhyScreened.tsx` to utilize dynamic or properly disclaimed statistics and quotes.
- Mark "Aldergate Film Festival" explicitly as a test/demo entity across the application.

**Acceptance Check:**
- Load a pipeline without an active report and verify that the UI explicitly labels the displayed matrix as "PREVIEW DATA".

## 6. Operations & Deployment

**Tasks to Complete:**
- Configure `base_url` resolution in `monitor_tools.py` to target the correct production host (`screened-pludf2u7yq-nw.a.run.app`).
- Update deployment scripts (`deploy.sh`, `deploy.yml`) to inject required environment variables (`DIAGNOSTICS_TOKEN`, `VITE_GA4_MEASUREMENT_ID`, `TASK_QUEUE_NAME`) and apply necessary IAM roles.
- Add a dependency step in the GitHub deploy workflow to require successful test execution (`needs: test`).
- Configure a staging environment or an admin token override for `smoke.sh` to bypass the 403 Forbidden check on `/api/test-pipeline`.
- Require explicit Cloud Tasks configuration during deployment, preventing fallback to unmanaged asyncio tasks.

**Acceptance Check:**
- Run `deploy.sh` and verify that the Cloud Run service successfully provisions with `DIAGNOSTICS_TOKEN` present in its environment variables.

## 7. Documentation Updates

**Tasks to Complete:**
- Update the README and DEVPOST_SUBMISSION to align descriptions of evidence verification with the intended behavior of the ADK integration.
- Update `SPEC_PARALLEL_ADK_EVIDENCE_ENGINE.md` to accurately reflect the current implementation phase.
- Remove or correct the reference to `13_DATA_PROTECTION_PII_MIDDLEWARE_SPEC.md`, ensuring all PII handling documentation accurately describes the implemented client-side approach.

**Acceptance Check:**
- Verify that a `grep` for "13_DATA_PROTECTION_PII_MIDDLEWARE_SPEC.md" across the repository returns no active requirement links.
