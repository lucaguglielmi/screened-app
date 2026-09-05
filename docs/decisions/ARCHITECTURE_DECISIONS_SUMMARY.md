# 🏛️ Screened: Architecture Decisions & Historical Specifications Summary

This document consolidates all high-level architectural, technical, and product design decisions made across previous iterations and specifications into a single canonical reference.

---

## Decision 001: 2-Pillar Product Focus
* **Decision**: Focus Screened entirely around two core workflows:
  1. **Festival Due Diligence** (forensic entity investigation, venue lease verification, company registries, alumni feedback, 4-vector credibility radar, exact SHA-256 outreach sandbox).
  2. **Grant & Public Funding Diligence** (UK/EU institutional fund discovery, eligibility guidelines clause extraction, 4-pillar packaging checklist, and 1-click calendar/binder export).
* **Superseded Concepts**: Generic script coverage, artistic dialogue critiques, private slate loans, and automated submission payments were explicitly deemed out-of-scope.

---

## Decision 002: Dual-Model Gemini Architecture on Google Cloud Vertex AI
* **Decision**: Standardize on **Gemini 2.5 Pro** and **Gemini 2.5 Flash** hosted on Vertex AI (`europe-west2`):
  - **Gemini 2.5 Pro**: Used for high-level multi-agent reasoning, deep contradiction analysis, and conversational orchestration.
  - **Gemini 2.5 Flash**: Used for high-throughput multimodal document ingestion (scripts, treatments, PDFs up to 500k chars) and structured claim extractions.
* **Fallback & Safety**: If Vertex AI ambient credentials are unavailable, clients safely fall back to standard Gemini API keys without throwing uncaught exceptions.

---

## Decision 003: Parallel Evidence Engine with Verbatim Substring Citation
* **Decision**: Web intelligence is gathered exclusively via **Parallel Web Search** and **Parallel Task APIs**.
* **Citation Integrity**: Every extracted atomic claim must include verbatim exact excerpts found in retrieved sources, tagged with source tiers (Tier 1: Official/Government, Tier 2: Reputable Industry Press, Tier 3: Forum/Social Feedback). Unsubstantiated claims are flagged as UNVERIFIED.

---

## Decision 004: 4-Vector Forensic Credibility Radar
* **Decision**: The credibility score is computed mathematically across four distinct vectors:
  1. **Venue Legitimacy** (screening cinema leases, DCI projection, physical presence).
  2. **Fee Transparency** (submission fees vs screening fee compensation, refund terms).
  3. **Organizer Track Record** (corporate entity registration, festival directors, legal history).
  4. **Filmmaker Feedback** (alumni footprint, attendee sentiment, dispute history).

---

## Decision 005: Cryptographic SHA-256 Human-in-the-Loop Outreach Approval
* **Decision**: Screened never automatically sends outreach or inquiry emails. When drafting an inquiry to organizers or venues, the backend computes a SHA-256 digest of the exact payload. The inquiry can only execute in SANDBOX mode if the user cryptographically confirms the matching hash.

---

## Decision 006: Deterministic Gold-Standard Demo ("Pinco Pallino Film Festival")
* **Decision**: To enable friction-free demonstrations without incurring external API quotas or search latency, entering `"Pinco Pallino"`, `"demo"`, or `"demo mode"` intercepts the pipeline and returns a full, pre-computed rich dossier with simulated live SSE streaming.

---

## Decision 007: Institutional Grant Diligence & Submission Readiness Kit
* **Decision**: Curate verified institutional film funds (BFI, Screen Scotland, Arts Council, National Lottery, Sundance Doc Fund, Eurimages).
* **Guidelines Parsing**: Extract eligibility criteria clause-by-clause.
* **Export Kit**: Generate tailored submission packaging checklists, `.ics` calendar files with automated reminders, and archival Markdown binders.

---

## Decision 008: Cloud Tasks for Cloud Run Scale-to-Zero & Asynchronous Execution
* **Decision**: Cloud Tasks enqueues long-running disambiguation and 3-domain research tasks, allowing HTTP endpoints to return immediately (`202 Accepted` / job ID) and avoid Cloud Run gateway timeouts.
