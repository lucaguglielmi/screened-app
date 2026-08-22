# What The Human Should Do

This document tracks all manual decisions, credentials, review items, and actions required from the human creator. 
Whenever the user asks *"what's next?"* or *"what should we work on?"*, the assistant will review this file, cross-reference active specs, and present pending items.

---

## 📋 Active Items for the Human Creator

| ID | Category | Item Description | Status | Target Phase |
| :--- | :--- | :--- | :--- | :--- |
| **HUMAN-01** | **API Credentials** | Confirm whether optional production integrations (e.g. real Companies House API key or real Gmail sandbox OAuth) should be supplied or if parallel search scraping suffices. | `PENDING` | Phase 2 (Data Protection & Depth) |
| **HUMAN-02** | **Test Files for Upload** | Prepare sample test files for upload testing: 1 sample festival invitation email (`.txt`/`.eml`/`.pdf`), 1 sample short film synopsis (`.pdf`), and 1 dummy video file (`.mp4` to test video upload rejection guard). | `READY TO TEST` | Phase 1 (Drag & Drop Intake) |
| **HUMAN-03** | **Grant Databases** | Review initial curated list of UK/International film grants (BFI Filmmaking Fund, Screen Scotland, Tribeca All Access, Sundance Documentary Fund) for seed data in the Grant Tool. | `IN REVIEW` | Phase 1 (Grant Intake Tool) |
| **HUMAN-04** | **PII Masking Thresholds** | Review the PII masking rules in `13_DATA_PROTECTION_PII_MIDDLEWARE_SPEC.md` before approving execution. | `HOLD FOR LATER` | Final Phase |
| **HUMAN-05** | **Video Pitch & Demo** | Once all UI tools and playground tabs are finalized, record the 3-minute hackathon demo video following the script in `09-DEMO-VIDEO-NOTES.md`. | `BLOCKED BY UI POLISH`| Hackathon Submission |

---

## 🔄 Lifecycle Protocol
1. When an item is resolved by the human, mark it `COMPLETED [YYYY-MM-DD]`.
2. If new human tasks emerge during implementation (e.g. verifying external accounts, providing custom logos), add them here immediately.
3. On every *"what's next?"* query, check if any completed items can be archived and summarize the remaining ones.

---

## 🏗️ Architecture Tracking (Steering Section)
This section serves as a high-level live tracker for our application architecture. Whenever significant architectural changes occur (new agents, modified pipelines, database migrations), they should be documented here and reflected in the UI Playground's Architecture Page.

- **Current State:** ADK-based orchestration with Parallel Search & Gemini clients, using Firestore for state management.
- **Recent Changes (2026-08-22):** 
  - **Resumption Endpoint**: Added `POST /api/investigations/{id}/resume` to restart failed/interrupted pipelines.
  - **SSE Event Log Replay**: Integrated Firestore event persistence so refreshed tabs catch up on past pipeline steps immediately.
  - **Feedback Store Persistence**: Transitioned filmmaker feedback store from in-memory array to persistent Firestore collection.
  - **Concurrency Limits**: Implemented `asyncio.Semaphore(3)` bounds on Parallel Search and Gemini API calls to prevent rate-limiting.
- **Next Steps:** Maintain parity between this section and the interactive Architecture UI component.
