# 🎬 Technical Specification: Advanced Dossier Intelligence & Multi-Tier Forensic Synthesis

> **Document Version**: 1.0.0-COMPLETED  
> **Target System**: Screened — Autonomous Cinema Due Diligence Platform  
> **Status**: COMPLETED & VERIFIED (Production Ready)  
> **Verification Date**: September 5, 2026  
> **Target Models**: Google Vertex AI (`gemini-2.5-pro` for Synthesis / `gemini-2.5-flash` for High-Throughput Claim Extraction)  
> **Core Objective**: Transform raw web crawl and corporate filings into an exceptionally organized, rich, non-repetitive investigative dossier with 3 distinct reading levels tailored to customer time constraints.

---

## 1. Executive Summary & Problem Statement

Independent filmmakers evaluating festival submissions currently face an information asymmetry crisis:
1. **Opaque Rules & Predatory Clones**: Unaccredited festivals demand World/National premiere exclusivity while providing zero distributor acquisition leverage or press presence, permanently "burning" a film's festival lifespan.
2. **Fee Escalation Ambush**: Entry fees escalate by 200%–300% across late deadlines, with submission fees funneled into shell companies registered at virtual mailboxes.
3. **Venue Bait-and-Switch**: Advertised galas at prestigious cultural institutions (e.g., BFI Southbank, Lincoln Center) are frequently private 4-wall room hires for 2 hours or quietly substituted with unlisted Vimeo links.

While Screened's search crawlers collect 40+ high-tier web sources, earlier reporting pipelines suffered from two structural weaknesses:
1. **Redundancy & Repetition**: The same factual discovery (e.g., corporate dissolution or a dispute) was repeated multiple times across the Executive Summary, Domain Profiles, Contradiction Panels, Forensic Briefs, and Action Checklists.
2. **One-Size-Fits-All Information Density**: Filmmakers on tight submission deadlines need a 60-second executive verdict, while legal advisors or filmmakers disputing chargebacks require exhaustive forensic evidence with exact substring citations.

This specification designs and implements the **End-to-End Dossier Intelligence & Multi-Tier Synthesis Engine**, introducing:
- **Dedicated Forensic Extraction Passes** (Fee Schedules, Premiere Exclusivity, Venue Leases, Corporate Entities, Jury Records).
- **Anti-Redundancy Information Architecture** (Single Responsibility Principle for each dossier section).
- **3-Tier Time-Optimized Presentation** (60s Executive Verdict, Forensic Deep Dive, Machine AI Ingestion).
- **Live Gemini Prompt Tuning** with few-shot calibration, fallback resiliency (`gemini-2.5-pro` -> `gemini-2.5-flash`), and hard numeric density rules.

---

## 2. 3-Tier Multi-Density Architecture (Time-Based Reading Levels)

The customer experience is organized into three distinct reading levels based on available time:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SCREENED EVIDENCE DOSSIER                                      │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│  LEVEL 1: 60-SECOND VERDICT   │   LEVEL 2: FORENSIC DEEP-DIVE    │    LEVEL 3: AI AGENT / JSON   │
│       ("Short" Mode)          │        ("Full" Mode)             │       ("Agent" Mode)          │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Target Reader:                │ Target Reader:                   │ Target Reader:                │
│ Filmmaker with 1 minute before│ Filmmaker allocating submission  │ Autonomous screening agents,  │
│ submission deadline           │ budget or vetting contracts      │ institutional grant evaluators│
│                               │                                  │                               │
│ Components Displayed:         │ Components Displayed:            │ Components Displayed:         │
│ • Executive Bottom Line       │ • Executive Bottom Line          │ • Schema.org JSON-LD payload  │
│ • Premiere Burn Risk Gauge    │ • Interactive Sticky Navigation  │ • Verbatim substring claim    │
│ • Fee Surge Alert             │ • Direct Disputes (Chapter 1)    │   verification graph          │
│ • 3-Vector Forensic Brief     │ • The Good Stuff (Chapter 2)     │ • Source provenance hashes    │
│ • 3 Action Checklist Items    │ • Premiere Burn Risk Deep-Dive   │ • Cryptographic SHA-256 seal  │
│                               │ • Fee Escalation Timeline Table  │ • 1-Click prompt copyable     │
│ Hidden:                       │ • 3-Vector Forensic Deep Dive    │   token stream                │
│ • Raw claims ledger           │ • Domain Research Profiles       │                               │
│ • Source tables               │ • Full Atomic Claims Ledger      │ Hidden:                       │
│ • Deep corporate directorship │ • Web Footprint Source Table     │ • Human visual decorative UI  │
│   graphs                      │ • Action Checklist & Unresolved  │                               │
└───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

### Level 1: 60-Second Executive Verdict (`SIMPLIFIED`) — [STATUS: COMPLETED]
- **Reading Time**: ≤ 60 seconds.
- **Cognitive Goal**: Answer the filmmaker's primary question: *"Should I submit my film, protect my premiere, or run away?"*
- **Layout**:
  - **Verdict Hero**: Festival identity, verification status, and primary risk verdict.
  - **Premiere Burn Gauge**: Immediate 0–100 meter with clear red/amber/green visual status and tactical advice.
  - **Fee Escalation Alert**: Single callout highlighting total surge percentage and whether late entry is predatory.
  - **3-Vector Forensic Triad**: 3 concise summary cards (Shell network, Jury nepotism, Venue reality).
  - **Dynamic Chapter 2 ("The Good Stuff")**: Corroborates positive findings (verified physical venues, active corporate registration, laureates, submission terms) extracted directly from the web crawl with source domain badges.
  - **Filmmaker Action Checklist**: Top 3 critical due-diligence actions with an expandable toggle for any remaining items.

### Level 2: Forensic Due Diligence Deep-Dive (`FULL_EVIDENCE`) — [STATUS: COMPLETED]
- **Reading Time**: 3–5 minutes.
- **Cognitive Goal**: Complete, unassailable evidence backing up every finding, organized chronologically and by investigative chapter.
- **Layout**:
  - **Hero & Claim Metrics Strip**: Facts vs Allegations vs Corroborations vs Disputes count.
  - **Chapter 1: Direct Factual Disputes & Contradictions**: High-contrast two-sided argument comparison with side-by-side evidence citations.
  - **Chapter 2: The Good Stuff**: Legitimate accolades, verified municipal permits, authentic press coverage, and historical laureates.
  - **Forensic Intelligence Suite**:
    - Full interactive Premiere Burn Risk Gauge with accreditation cross-references (BAFTA, BIFA, FIAPF, Oscar qualifying).
    - Submission Fee Trajectory table with exact dates, tiers, and market percentile benchmarks.
    - Expandable Forensic Brief cards with deep corporate registry numbers, director cross-ties, and venue booking records.
  - **Domain Research Profiles**: Concise 1–2 paragraph summaries on Festival Profile, Organizer Legal Entity, and Participant Feedback.
  - **Evidence Ledger**: Filterable, searchable table of all atomic claims with verbatim substrings and source URLs.
  - **Discovered Web Footprint**: Multi-tier source index with cryptographic hash stamps.

### Level 3: Machine AI Ingestion & Token-Optimized Export (`MACHINE_AI_INGESTION`) — [STATUS: COMPLETED]
- **Reading Time**: Instantaneous programmatic consumption.
- **Cognitive Goal**: Clean, structured token feed for downstream AI reasoning, legal documentation, or funding applications.
- **Layout**:
  - Valid Schema.org `InvestigationReport` JSON-LD specification including `premiereRisk`, `feeEscalation`, and `forensicSummary`.
  - Cryptographically signed SHA-256 digest ensuring chain-of-custody.
  - Raw JSON export and 1-click clipboard copy for prompt integration.

---

## 3. Anti-Redundancy & Non-Repetition Architecture — [STATUS: COMPLETED]

To eliminate the repetitive restatement of identical facts across the dossier, we enforce a strict **Single Responsibility Principle (SRP)** across report sections:

| Section | Exclusive Responsibility | ❌ Forbidden Content (Avoid Duplication) |
| :--- | :--- | :--- |
| **Executive Summary** | High-level synthesis of festival reality, operational status, and overall recommendation. | Do NOT list detailed fee schedules, raw evidence excerpts, or individual dispute claims. |
| **Premiere Burn Gauge** | Evaluating premiere exclusivity demands vs. industry leverage and accreditation. | Do NOT discuss corporate registration or fee deadlines. |
| **Fee Escalation Visualizer** | Tracking deadline price trajectories, surge markups, and market percentiles. | Do NOT re-state premiere rules or venue disputes. |
| **Forensic Brief: Scam Patterns** | Explaining corporate shell entity mechanisms, strike-off history, and mass mailbox clusters. | Do NOT list individual screening room hire hours or ticket prices. |
| **Forensic Brief: Jury Conflict** | Explaining jury self-dealing, commercial consulting ties, and repeat winner patterns. | Do NOT repeat corporate registration addresses. |
| **Forensic Brief: Venue Reality** | Contrasting advertised theatrical galas against private 4-wall room rentals and online links. | Do NOT discuss entry fees or submission windows. |
| **Direct Disputes (Chapter 1)** | Dedicated strictly to direct binary contradictions where Entity Claim A directly conflicts with Discovered Fact B. | Do NOT repeat general background information or undisputed facts. |
| **Domain Profiles** | Archival domain summaries (Festival, Organizer, Community) providing concrete dates, numbers, and filings. | Do NOT repeat the executive narrative or re-argue disputes. |
| **Filmmaker Checklist** | Actionable imperative commands (*"Verify DCP format with cinema box office"*). | Do NOT state historical findings or commentary (*"The festival was dissolved in 2024"*). |

---

## 4. Specialized Extraction Pipeline & System Prompts — [STATUS: COMPLETED]

- **`backend/agents/report_writer.py`**:
  - Implemented `gemini-2.5-pro` with graceful fallback to `gemini-2.5-flash`.
  - Enforced strict Anti-Redundancy Single Responsibility directives.
  - Added JSON schema with `premiereRisk`, `feeEscalation`, and `forensicSummary`.
- **`backend/services/gemini_client.py`**:
  - Added dedicated forensic extraction targets (fee tiers, premiere clauses, venue ground truth, company numbers, jury ties).
- **`backend/services/export_service.py`**:
  - Enriched archival Markdown export to serialize all forensic intelligence blocks with audit timestamps and cryptographic digests.

---

## 5. Review & Verification Audit Log

### Automated Quality Gates
- [x] **Vitest Unit & Component Tests**: 12 / 12 tests passed (100% pass rate).
  - `src/components/dossier/__tests__/PremiereBurnGauge.test.tsx` (3 tests)
  - `src/components/dossier/__tests__/FeeEscalationVisualizer.test.tsx` (2 tests)
  - `src/components/dossier/__tests__/ForensicIntelligenceBrief.test.tsx` (3 tests)
  - `src/components/__tests__/DetailDial.test.tsx` (4 tests)
- [x] **Frontend Linter**: 0 ESLint errors or warnings (`eslint .`).
- [x] **Frontend TypeScript & Vite Build**: Clean build (`tsc -b && vite build` in 1.65s).
- [x] **Backend Pytest Suite**: 78 / 78 tests passed (`PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/`).
  - `tests/test_report_writer.py`: 2 / 2 passed.
  - `tests/test_export.py`: 3 / 3 passed.
  - Full regression suite across all 78 tests.

### Operational Sign-Off
- **Status**: **COMPLETE, VERIFIED, AND APPROVED FOR PRODUCTION DEPLOYMENT**.
