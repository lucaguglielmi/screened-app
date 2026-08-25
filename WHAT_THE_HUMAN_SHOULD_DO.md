# What The Human Should Do

This document tracks all manual decisions, credentials, review items, and actions required from the human creator. 
Whenever the user asks *"what's next?"* or *"what should we work on?"*, the assistant will review this file, cross-reference active specs, and present pending items.

---

## 📋 Active Items for the Human Creator

| ID | Category | Item Description | Status | Target Phase |
| :--- | :--- | :--- | :--- | :--- |
| **HUMAN-01** | **API Credentials** | Confirm whether optional production integrations (e.g. real Companies House API key or real Gmail sandbox OAuth) should be supplied or if parallel search scraping suffices. | `COMPLETED` [2026-08-24] - Relying entirely on Parallel Search scraping. | Phase 2 (Data Protection & Depth) |
| **HUMAN-02** | **Test Files for Upload** | Prepare sample test files for upload testing: 1 sample festival invitation email (`.txt`/`.eml`/`.pdf`), 1 sample short film synopsis (`.pdf`), and 1 dummy video file (`.mp4` to test video upload rejection guard). | `COMPLETED` [2026-08-24] - Generated dummy files in `tests/fixtures/uploads/`. | Phase 1 (Drag & Drop Intake) |
| **HUMAN-03** | **Grant Databases** | Review initial curated list of UK/International film grants (BFI Filmmaking Fund, Screen Scotland, Tribeca All Access, Sundance Documentary Fund) for seed data in the Grant Tool. | `COMPLETED` [2026-08-24] - Deep review complete. Added Hubert Bals Fund and Cinereach to the master list. Approved. | Phase 1 (Grant Intake Tool) |
| **HUMAN-04** | **PII Masking Thresholds** | Review the PII masking rules and ensure they describe the implemented client-side approach via piiVault. | `COMPLETED` [2026-08-24] - Implemented Client-Side PII Masking via piiVault. | Final Phase |
| **HUMAN-05** | **Video Pitch & Demo** | Once all UI tools and playground tabs are finalized, record the 3-minute hackathon demo video following the script in `09-DEMO-VIDEO-NOTES.md`. | `PENDING`| Hackathon Submission |
| **HUMAN-06** | **OTel Verification** | Ensure OpenTelemetry integration points map exactly to the actual ADK agent trace identifiers in production. | `PENDING` | Phase 1 (Observability) |
| **HUMAN-07** | **Cloud Tasks Config** | Provision Cloud Tasks queue via `gcloud tasks queues create screened-tasks --location=europe-west2`. | `COMPLETED` [2026-08-24] - Queue provisioned successfully via gcloud CLI. | Phase 2 (Orchestration) |
| **HUMAN-08** | **Architecture Page** | Ensure the new graphical architecture diagram accurately aligns with the frontend `ArchitecturePage.tsx` live visualizer. | `COMPLETED` [2026-08-24] - Added PII and Telemetry layers. | Phase 4 (Submission) |
| **HUMAN-09** | **GA4 Properties** | Update GA4 properties inside the Google Analytics console to create custom dimensions matching our new tracking schema. | `COMPLETED` [2026-08-24] - Created new property and added custom dimensions manually. | Phase 4 (Submission) |
| **HUMAN-10** | **Diagnostics Token** | Provision the `DIAGNOSTICS_TOKEN` secret in Secret Manager and map it to the Cloud Run deployment. Without this, `/api/diagnostics` will perpetually return 404 in production. | `PENDING` | Operations |
| **HUMAN-11** | **IAM Grants for Telemetry** | Grant the necessary IAM roles for Cloud Trace, Cloud Logging, and Error Reporting to the Cloud Run service account to enable the observability stack. | `PENDING` | Operations |

---

## 🔄 Lifecycle Protocol
1. When an item is resolved by the human, mark it `COMPLETED [YYYY-MM-DD]`.
2. If new human tasks emerge during implementation (e.g. verifying external accounts, providing custom logos), add them here immediately.
3. On every *"what's next?"* query, check if any completed items can be archived and summarize the remaining ones.
4. **Mandatory Release Protocol (Test, Merge to Main, Commit, Push, Deploy)**:
   - **Test**: Run `npm --prefix frontend run build` and `PYTHONPATH=. ./venv2/bin/pytest -q`.
   - **Fix**: Automatically investigate and resolve any test/build failures without waiting for permission.
   - **Merge**: Ensure changes are merged cleanly into `main`.
   - **Commit & Push**: Stage all changes (`git add .`), write a clear commit message, and push to `origin main`.
   - **Deploy & Verify**: Run `./deploy.sh` to trigger Google Cloud Build and Cloud Run deployment, then verify the live URL (`https://screened-pludf2u7yq-nw.a.run.app`).


---

## 🏗️ Architecture Tracking (Steering Section)
This section serves as a high-level live tracker for our application architecture. Whenever significant architectural changes occur (new agents, modified pipelines, database migrations), they should be documented here and reflected in the UI Playground's Architecture Page.

- **Current State:** Three-layer architecture (Orchestration Layer via Google ADK, Evidence Layer via Parallel, Reasoning Layer via Gemini), using Firestore for state management.
- **Recent Changes:** 
  - **ADK-Based Orchestration**: Migrated to ADK's `LlmAgent`, `SequentialAgent`, and `ParallelAgent` for pipeline and Producer Desk function calling (replacing legacy regex logic).
  - **Evidence Engine Integration**: Deepened Parallel Search integration, implemented Task and Monitor tools, and enabled verbatim provenance via Extract API.
  - **Playground Parity**: Implemented live `/api/architecture/agent-tree` and updated Agent Observability Labs.
- **Next Steps:** Maintain parity between this section and the interactive Architecture UI component.
