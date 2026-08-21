<p align="center">
  <a href="https://screened-786241671474.europe-west2.run.app">
    <img src="frontend/public/assets/screened-logo.svg" alt="Screened — Agentic Cinema Due Diligence" width="96" height="96" />
  </a>
</p>

<h1 align="center">Screened</h1>

<p align="center">
  <strong>Agentic Due Diligence & Credibility Intelligence for Independent Cinema</strong><br />
  <em>Built for the Google ADK & Parallel Search Hackathon</em>
</p>

<p align="center">
  <a href="https://screened-786241671474.europe-west2.run.app">
    <img src="https://img.shields.io/badge/Live_Demo-Cloud_Run_(London)-6366F1?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/lucaguglielmi/screened-app">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Tests-11_Passed_100%25-10B981?style=for-the-badge&logo=pytest&logoColor=white" alt="Test Status" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-818CF8?style=for-the-badge&logo=apache&logoColor=white" alt="License" />
</p>

---

## 🎬 The Mission

Every year, independent filmmakers spend thousands of pounds on festival submission fees, only to encounter opaque screening venues, predatory organizers, deceptive premiere policies, or awards that fail to qualify for major honors (BAFTA, BIFA, Oscars).

**Screened** transforms cinema due-diligence from guesswork into an autonomous, transparent multi-agent investigation. Rather than assigning an arbitrary or blackbox "trust score", Screened functions as an investigative research room:
1. **Dissects Subject Entities** across legal identity, physical venues, fee schedules, jury prestige, and filmmaker community feedback.
2. **Gathers Public Evidence** from official registries, festival archives, major trade publications (Variety, ScreenDaily), and community forums.
3. **Cites Every Atomic Claim** directly to verbatim quotes with source tier tags, retrieval timestamps, and cryptographic payload hashes.
4. **Scouts Strategic Opportunities** matching filmmaker film profiles (genre, runtime, premiere goals) to verified open calls and qualifying deadline schedules.

---

## ⚡ Live Demo & Quick Links

- **🌐 Live Cloud Run Application**: [https://screened-786241671474.europe-west2.run.app](https://screened-786241671474.europe-west2.run.app)
- **📦 GitHub Repository**: [https://github.com/lucaguglielmi/screened-app](https://github.com/lucaguglielmi/screened-app)
- **🏢 Google Cloud Project**: `screened-hackathon` (`europe-west2` — London)

---

## 🏗️ Multi-Agent Architecture

Screened operates an orchestrated pipeline of 8 specialized autonomous agents using **Vertex AI (Gemini 2.5 Pro & Gemini 2.5 Flash)** and the **Parallel Search API**:

```
                       [ Filmmaker Input Query ]
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 1. Disambiguator Agent (Gemini 2.5 Flash + Parallel Search)      │
│    - Resolves entity names, cities, founded years & domains      │
│    - Renders interactive Candidate Cards for human confirmation  │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ [ User Confirms Entity ]
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. Planner Agent (Gemini 2.5 Pro)                                │
│    - Formulates deep investigation queries across 3 core domains │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            ▼                     ▼                     ▼
┌───────────────────────┐ ┌────────────────┐ ┌─────────────────────┐
│ 3. Festival Agent     │ │ Organizer Agent│ │ Participants Agent  │
│   (Parallel Search)   │ │(Parallel Search│ │  (Parallel Search)  │
│  Venues, Fees, Dates  │ │ Companies, Past│ │ Filmmaker Feedback, │
│  & Screening Formats  │ │ Track Records  │ │ Community Disputes  │
└───────────┬───────────┘ └───────┬────────┘ └──────────┬──────────┘
            └─────────────────────┼─────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. Claim Extractor Agent (Verbatim Substring Matching)           │
│    - Extracts atomic claims (FACT, ALLEGATION, OPINION)          │
│    - Classifies source tiers (Tier 1: Registry, Tier 2: Trade)   │
│    - Enforces verbatim exact excerpt verification invariant      │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
┌──────────────────────────────────────┐ ┌─────────────────────────┐
│ 5. Contradiction Analyst Agent       │ │ 6. Report Writer Agent  │
│    - Reconciles conflicting claims   │ │    - Executive overview │
│    - Side-by-side dispute comparison │ │    - 3-domain narrative │
│    - Filmmaker risk guidance         │ │    - Action checklist   │
└──────────────────┬───────────────────┘ └────────────┬────────────┘
                   └─────────────────┬────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. Detail Dial & Evidence Dossier (React + Tailwind v4)          │
│    - 3-Level Density: Summary · Standard · Raw Evidence          │
│    - Hover/Click Citation Popovers with exact source excerpts    │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
┌──────────────────────────────────────┐ ┌─────────────────────────┐
│ 8. Outreach Drafter & Approval Gate  │ │ 9. Opportunity Scout    │
│    - Drafts inquiries to organizers  │ │    - Film profile match │
│    - Cryptographic SHA-256 seal      │ │    - Deadline calendar  │
│    - Safe simulated sandbox delivery │ │    - 1-Click Deep Screen│
└──────────────────────────────────────┘ └─────────────────────────┘
```

---

## 🚀 Key Innovations

### 1. The Detail Dial (Interactive Density Control)
- **`Summary`**: High-level synthesis for quick executive review, domain summaries, and dispute highlights.
- **`Standard`**: Atomic claims categorized by subject with kind (Fact, Allegation, Opinion) and verification status badges.
- **`Raw Evidence`**: Deep-dive display exposing verbatim quoted substrings, publication dates, source tiers, and SHA-256 provenance hashes.

### 2. Contradiction Analysis & Side-by-Side Dispute Comparison
Replaces simplistic true/false flags with calibrated evidence states:
- **`CORROBORATED`**: Supported by multiple Tier 1/2 independent sources.
- **`SUPPORTED`**: Single verified source citation.
- **`DISPUTED`**: Direct factual conflict (e.g. physical theater screening vs online-only VOD) rendered with side-by-side evidence cards and filmmaker guidance.
- **`UNVERIFIED`**: Claim made without external backing.

### 3. Exact-Payload Action Approval with SHA-256 Integrity
Before any inquiry email is drafted to festival organizers:
- The system generates `sha256(recipient + subject + body + claim_id)`.
- The user reviews the exact payload in the **Action Approval Gate Modal**.
- Execution runs in **Sandbox Mode** with cryptographic audit logging in Cloud Firestore, guaranteeing zero unapproved external spam.

### 4. Opportunity Scout (Strategy & Deadline Matcher)
- Independent filmmakers input film title, format (*Short, Feature, Documentary*), genre, runtime, budget tier, and premiere strategy (*World, International, None*).
- Screened uses **Parallel Search** to discover open call-for-entries, deadline schedules, and accreditation badges (*BAFTA Qualifying*, *BIFA Qualifying*, *Oscar Qualifying*, *FIAPF Accredited*).
- Includes a **1-Click "Deep Screen"** button to immediately run full multi-agent due-diligence on any discovered festival.

---

## 🛠️ Technology Stack & Cloud Architecture

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Search Engine** | `ParallelSearchTool` (`parallel-web` Python SDK) | Real-time web discovery across trade registries, press archives, and forums |
| **Agent Intelligence** | Vertex AI (`google-genai` SDK) | Gemini 2.5 Pro (Planning & Synthesis) + Gemini 2.5 Flash (Disambiguation) |
| **Backend API** | FastAPI + Uvicorn + Pydantic v2 | High-performance asynchronous REST & Server-Sent Events (SSE) |
| **Database** | Google Cloud Firestore (Native) | Real-time investigation state, audit trail, and cached source hash ledger |
| **Secrets & Keys** | Google Cloud Secret Manager | Secure runtime injection of `parallel-api-key` and `session-signing-key` |
| **Cloud Hosting** | Google Cloud Run | Serverless, auto-scaling container deployment in `europe-west2` (London) |
| **Frontend UI** | React 19 + Vite + TypeScript | High-performance modern SPA with dark/light mode toggle |
| **Design System** | Tailwind CSS v4 (`@theme`) + Lucide Icons | Editorial theme (`Fraunces` serif, `Instrument Sans`, `Spline Sans Mono`) |

---

## 🧪 Automated Testing & Verification

Screened includes full unit, integration, and end-to-end multi-agent test suites:

```bash
# Run pytest test suite
PYTHONPATH=. .venv/bin/pytest tests/
```

### Test Results Summary:
- `tests/test_backend.py`: Healthz probe & test pipeline validation (2/2 passed)
- `tests/test_end_to_end.py`: Asynchronous multi-agent investigation lifecycle (1/1 passed)
- `tests/test_export.py`: Archival Markdown export & SHA-256 digest seal (1/1 passed)
- `tests/test_multi_agent.py`: Disambiguator, Planner, and API routes (3/3 passed)
- `tests/test_outreach.py`: SHA-256 payload hashing & sandbox approval verification (2/2 passed)
- `tests/test_scout.py`: FilmProfile validation & `/api/scout` opportunity discovery (2/2 passed)
- **Total: 11 / 11 tests passed (100%)**

---

## 💻 Local Development Setup

### 1. Clone & Configure Environment

```bash
git clone https://github.com/lucaguglielmi/screened-app.git
cd screened-app

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set API Keys

```bash
cp .env.example .env
# Set your PARALLEL_API_KEY and GOOGLE_CLOUD_PROJECT
```

### 3. Build & Run

```bash
# Terminal 1: Build & run Frontend
cd frontend
npm install
npm run build
cd ..

# Terminal 2: Run FastAPI Backend
PYTHONPATH=. .venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser at **`http://127.0.0.1:8000`** to start investigating!

---

## 📜 License

Distributed under the **Apache 2.0 License**. See `LICENSE` for details.