<p align="center">
  <a href="https://screened-pludf2u7yq-nw.a.run.app">
    <img src="frontend/public/assets/screened-logo.svg" alt="Screened — Agentic Cinema Due Diligence" width="96" height="96" />
  </a>
</p>

<h1 align="center">Screened</h1>

<p align="center">
  <strong>Agentic Due Diligence & Credibility Intelligence for Independent Cinema</strong><br />
  <em>Built for the Google ADK & Parallel Search Hackathon</em>
</p>

<p align="center">
  <a href="https://screened-pludf2u7yq-nw.a.run.app">
    <img src="https://img.shields.io/badge/Live_Demo-Cloud_Run_(London)-6366F1?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/lucaguglielmi/screened-app">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Tests-15_Passed_100%25-10B981?style=for-the-badge&logo=pytest&logoColor=white" alt="Test Status" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-818CF8?style=for-the-badge&logo=apache&logoColor=white" alt="License" />
</p>

---

## 🎬 The Mission

Every year, independent filmmakers spend thousands of pounds on festival submission fees, only to encounter opaque screening venues, predatory organizers, deceptive premiere policies, or awards that fail to qualify for major honors (BAFTA, BIFA, Oscars).

**Screened** transforms cinema due-diligence from guesswork into an autonomous, transparent multi-agent investigation. Rather than assigning an arbitrary or blackbox "trust score", Screened functions as an investigative research room:
1. **The Producer Desk (Conversational Agent)**: Talks with filmmakers, analyzes queries or uploaded PDF scripts/emails, and autonomously dispatches specialized tools via **Gemini Function Calling API**.
2. **Dissects Subject Entities**: Scrutinizes legal identity, physical venues, fee schedules, jury prestige, and filmmaker community feedback.
3. **Gathers Public Evidence**: Pulls verified data from official registries, festival archives, major trade publications (Variety, ScreenDaily), and community forums.
4. **Cites Every Atomic Claim**: Direct links to verbatim quotes with source tier tags, retrieval timestamps, and cryptographic payload hashes.
5. **Scouts Strategic Opportunities**: Matches film profiles (genre, runtime, premiere goals) to verified open calls, qualification roadmaps, and deadline calendar (`.ics`) exports.

---

## ⚡ Live Demo & Quick Links

- **🌐 Live Cloud Run Application**: [https://screened-pludf2u7yq-nw.a.run.app](https://screened-pludf2u7yq-nw.a.run.app)
- **⚖️ Why Screened (Impact & Baseline Matrix)**: [https://screened-pludf2u7yq-nw.a.run.app](https://screened-pludf2u7yq-nw.a.run.app) (Click "Why Screened" in Left Nav)
- **🎨 Interactive Design Playground & OTel Tracing Lab**: [https://screened-pludf2u7yq-nw.a.run.app](https://screened-pludf2u7yq-nw.a.run.app) (Click "Design Lab" in Nav)
- **📦 GitHub Repository**: [https://github.com/lucaguglielmi/screened-app](https://github.com/lucaguglielmi/screened-app)
- **🏢 Google Cloud Project**: `screened-hackathon` (`europe-west2` — London)

---

## 🏗️ Multi-Agent Architecture

Screened operates an orchestrated pipeline of specialized autonomous agents using **Vertex AI (Gemini 2.5 Pro & Gemini 2.5 Flash)** and the **Parallel Search API**:

```
                       [ Filmmaker Prompt / PDF Drop ]
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. Producer Desk Agent (Gemini 2.5 Pro Function Calling)                 │
│    - Autonomous intent classifier & executive conversational advisor     │
│    - Dispatches: configure_due_diligence / configure_opportunity_scout  │
│    - Mounts interactive Generative Mini-UIs directly in chat stream      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ [ 1-Click Launch Trigger ]
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 2. Disambiguator Agent (Gemini 2.5 Flash + Parallel Search)              │
│    - Resolves entity names, cities, founded years & domains              │
│    - Renders interactive Candidate Cards for human confirmation          │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ [ User Confirms Entity ]
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 3. Planner Agent (Gemini 2.5 Pro)                                        │
│    - Formulates deep investigation queries across 3 core domains         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
               ┌─────────────────────┼─────────────────────┐
               ▼                     ▼                     ▼
┌──────────────────────────┐ ┌────────────────┐ ┌──────────────────────────┐
│ 4. Festival Agent        │ │5. Organizer Ag.│ │ 6. Participants Agent    │
│    (Parallel Search)     │ │(Parallel Search│ │    (Parallel Search)     │
│   Venues, Fees, Dates    │ │ Companies, Past│ │   Filmmaker Feedback,    │
│   & Screening Formats    │ │ Track Records  │ │   Community Disputes     │
└──────────────┬───────────┘ └───────┬────────┘ └──────────┬───────────────┘
               └─────────────────────┼─────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 7. Claim Extractor Agent (Verbatim Substring Matching)                   │
│    - Extracts atomic claims (FACT, ALLEGATION, OPINION)                  │
│    - Classifies source tiers (Tier 1: Registry, Tier 2: Trade)           │
│    - Enforces verbatim exact excerpt verification invariant              │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
┌─────────────────────────────────────────┐ ┌──────────────────────────────┐
│ 8. Contradiction Analyst Agent          │ │ 9. Report Writer Agent       │
│    - Reconciles conflicting claims      │ │    - Executive overview      │
│    - Side-by-side dispute comparison    │ │    - 3-domain narrative      │
│    - 4-Vector Credibility Radar score   │ │    - Action checklist        │
└────────────────────┬────────────────────┘ └──────────────┬───────────────┘
                     └───────────────────┬─────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 10. Detail Dial & Evidence Dossier (React 19 + Tailwind v4)              │
│     - 3-Level Density: Summary · Standard · Raw Evidence                 │
│     - Hover/Click Citation Popovers with exact source excerpts           │
│     - Live in-dossier claim search & formatted Print/PDF export          │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
┌─────────────────────────────────────────┐ ┌──────────────────────────────┐
│ 11. Outreach Drafter & Approval Gate    │ │ 12. Opportunity Scout        │
│     - Drafts inquiries to organizers    │ │     - Film profile matcher   │
│     - Cryptographic SHA-256 seal        │ │     - .ics Calendar export   │
│     - Safe simulated sandbox delivery   │ │     - Accreditation tooltips │
└─────────────────────────────────────────┘ └──────────────────────────────┘
```

---

## 🚀 Key Innovations

### 1. The Producer Desk & Generative Mini-UIs
- Autonomous conversational entry point powered by **Gemini 2.5 Pro Function Calling**.
- Embeds interactive **Generative Mini-App cards** inside chat bubbles:
  - **`MiniDueDiligence`**: Pre-flight probe with target resolution and concern tracks (`#00D29E`).
  - **`MiniScoutCard`**: Film profile matrix with interactive runtime and budget sliders (`#F43F5E`).
  - **`MiniCompareArena`**: Side-by-side head-to-head match-up card (e.g., *Raindance vs LIFF*).
- **1-Click Workspace Transition**: Seamlessly launches full research pipelines with pre-populated parameters.

### 2. The Detail Dial (Interactive Density Control)
- **`Summary`**: High-level synthesis for quick executive review, domain summaries, and dispute highlights.
- **`Standard`**: Atomic claims categorized by subject with kind (Fact, Allegation, Opinion) and verification status badges.
- **`Raw Evidence`**: Deep-dive display exposing verbatim quoted substrings, publication dates, source tiers, and SHA-256 provenance hashes.

### 3. Credibility & Transparency Radar
- 4-vector breakdown gauge evaluating:
  - **Screening Venue** (*Physical Leases vs Unlisted Streaming*)
  - **Fee & Prize Structure** (*Clear Fees vs Trophy Markups*)
  - **Organizer & Jury** (*Company Filings vs Track Record Flags*)
  - **Community Feedback** (*Verified Filmmaker Accounts*)
- Dynamically calculated transparency index score out of 100 with color-coded confidence badges.

### 4. Exact-Payload Action Approval with SHA-256 Integrity
- Before any inquiry email is drafted to festival organizers, the system computes `sha256(recipient + subject + body + claim_id)`.
- The user reviews the exact payload in the **Action Approval Gate Modal**.
- Execution runs in **Sandbox Mode** with cryptographic audit logging in Cloud Firestore.

### 5. Opportunity Scout with `.ics` Calendar Export & Accreditation Tooltips
- Filmmakers enter their project profile (*Short, Feature, Documentary*, genre, runtime, budget tier).
- Screened discovers open call-for-entries, deadline schedules, and qualification badges (*BAFTA*, *BIFA*, *Oscars*, *FIAPF*).
- **`.ics` Calendar Generator**: 1-click export of deadlines with automatic reminders into Google Calendar / Apple Calendar.

### 6. Why Screened: Measured Baseline Matrix & Empirical Research
- Direct comparison matrix of **Manual Due Diligence (3–5 Hours, £0–£180 in lost fees, zero cryptographic audit)** vs **Screened Autonomous Pipeline (< 45 Seconds, 100% quoted substring audit, zero fees at risk)**.
- Features 4 documented empirical fraud themes from independent UK filmmakers (*Fee Without Screening*, *Laurel Mills*, *Phantom Venues*, *Ghost Organizers*).

### 7. Global Command Palette (`⌘K` / `Ctrl+K`)
- Instant keyboard-driven workspace teleportation, festival candidate jump-searches, theme toggles, audio controls, and export triggers accessible from anywhere.

### 8. Interactive Design Playground & Agent Observability Lab
- A dedicated visual component studio to review, test, state-cycle, and modify all chat bubbles, loaders, and mini-app cards with a live **Token Stream Simulator** and **OpenTelemetry Agent Span Visualizer**.

---

## 🛠️ Technology Stack & Cloud Architecture

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Search Engine** | `ParallelSearchTool` (`parallel-web` Python SDK) | Real-time web discovery across trade registries, press archives, and forums |
| **Agent Intelligence** | Vertex AI (`google-genai` SDK) | Gemini 2.5 Pro (Function Calling & Synthesis) + Gemini 2.5 Flash (Disambiguation) |
| **Backend API** | FastAPI + Uvicorn + Pydantic v2 | High-performance asynchronous REST & Server-Sent Events (SSE) |
| **Database** | Google Cloud Firestore (Native) | Real-time investigation state, audit trail, and cached source hash ledger |
| **Secrets & Keys** | Google Cloud Secret Manager | Secure runtime injection of `parallel-api-key` and `session-signing-key` |
| **Cloud Hosting** | Google Cloud Run | Serverless, auto-scaling container deployment in `europe-west2` (London) |
| **Frontend UI** | React 19 + Vite + TypeScript | High-performance modern SPA with dark/light mode toggle |
| **Navigation & Portals** | React Portals (`createPortal`) | Viewport-safe mobile slide-over drawer and modal stacking contexts |
| **Audio Engine** | Web Audio API Oscillator Synthesis | Zero-latency synthesized dial clicks, chimes, and instant mute |
| **Design System** | Tailwind CSS v4 (`@theme`) + Lucide Icons | Editorial theme (`Fraunces` serif, `Instrument Sans`, `Spline Sans Mono`) |

---

## 🧪 Automated Testing & Verification

Screened includes full unit, integration, and end-to-end multi-agent test suites:

```bash
# Run pytest test suite
PYTHONPATH=. .venv/bin/pytest tests/
```

### Test Results Summary:
- `tests/test_chat.py`: Producer Desk agent & Gemini Function Calling tools (4/4 passed)
- `tests/test_backend.py`: Healthz probe & test pipeline validation (2/2 passed)
- `tests/test_end_to_end.py`: Asynchronous multi-agent investigation lifecycle (1/1 passed)
- `tests/test_export.py`: Archival Markdown export & SHA-256 digest seal (1/1 passed)
- `tests/test_multi_agent.py`: Disambiguator, Planner, and API routes (3/3 passed)
- `tests/test_outreach.py`: SHA-256 payload hashing & sandbox approval verification (2/2 passed)
- `tests/test_scout.py`: FilmProfile validation & `/api/scout` opportunity discovery (2/2 passed)
- **Total: 15 / 15 tests passed (100%)**

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