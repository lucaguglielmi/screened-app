# Agent Steering Rules & Verification Policy

## 1. Specification & Execution Policy
- **Physical Spec Files on Request**: When the user requests a spec (e.g. "spec this out", "create a spec"), ALWAYS create a physical specification file in the repository (e.g. `docs/specs/...`) and commit to designing the complete technical solution.
- **Never Auto-Start Execution**: NEVER automatically begin implementation/execution of a specification without explicit user confirmation and go-ahead.
- **Persistent Pending Spec Reminders**: If a specification has been written but remains unexecuted or partially executed, actively and persistently remind the user about it in subsequent interactions until it is completed.

## 2. Pre-Commit Verification (Strict)
- **Frontend Quality Gate**: Always run `npm run lint && npm run build` inside `frontend/` before committing. Never commit code with ESLint errors, unused variables, or `any` type violations.
- **Backend Quality Gate**: Always execute the full test suite with `PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/` before committing.
- **Defensive Cloud Imports**: Ensure all module-level variables (e.g. `OIDC_SERVICE_ACCOUNT`, `QUEUE_PATH`, `tasks_client`) are defined with safe fallbacks outside `try/except` blocks so unit tests in CI runners (without GCP credentials) never trigger `NameError`.

## 3. Post-Push CI & Deployment Monitoring (Mandatory)
- **Verify GitHub Actions**: Immediately after `git push`, check live CI status using `gh run list -L 2`.
- **Zero CI Failures**: Both the `Tests` workflow and `Deploy Screened to Google Cloud Run` workflow must complete with `success`.
- **Immediate Auto-Remediation**: If any GitHub Actions run fails, inspect the failure logs (`gh run view <id> --log-failed`), resolve the root cause, re-verify locally, push the fix, and monitor until green.

## 4. Production Smoke Testing
- After every deployment, always run `./scripts/smoke.sh https://screened-786241671474.europe-west2.run.app` and verify live endpoints return expected schemas and status codes.
