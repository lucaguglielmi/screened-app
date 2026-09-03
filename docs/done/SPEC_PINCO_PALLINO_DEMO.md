# SPECIFICATION: Pinco Pallino Film Festival Demo Mode

## 1. Overview
This document defines the definitive "Demo Mode" for the Screened platform. To ensure a consistent, high-impact demonstration of the platform's capabilities—especially regarding low-data/high-data states (the Detail Dial) and advanced personnel/jury forensics—all legacy mock entities (e.g., Aldergate, Raindance, Phantom Indie) will be deprecated. The single source of truth for demonstrations will be the **Pinco Pallino Film Festival (London, UK)**.

---

## 2. Deep Review of Existing Demo / Jury Logic

Before implementing the new demo, we must sanitize the current environment. 

### 2.1 Legacy Demo Logic to be REMOVED / REPLACED
*   **`backend/scripts/seed_dossiers.py`**: Currently seeds "Raindance" and "Phantom Indie". *Action: Delete or completely rewrite to seed ONLY the Pinco Pallino JSON payload.*
*   **`frontend/src/components/playground/DesignPlayground.tsx`**: Contains hardcoded "Aldergate Film Festival (Test Entity)" data. *Action: Deprecate or wire directly to the Pinco Pallino state.*
*   **Hardcoded "Aldergate" stubs**: Any fallback files in the backend generating Aldergate results must be stripped out.

### 2.2 Existing Jury / Personnel Logic to be RETAINED & UTILIZED
The actual business logic and UI for parsing jury data is robust and will be fully utilized by the Pinco Pallino payload:
*   **Backend Schemas**: `DeepVettingAgent`'s `PERSONNEL_DOSSIER` category and the `jury_laurels` LlmAgent. The demo payload will map its data directly into these existing schemas.
*   **Frontend UI**: `CredibilityRadar.tsx` (Organizer & Jury axis), `DeepVettingMatrix.tsx` (Key Personnel & Jury Dossiers), and `PersonnelNetworkDiagram.tsx`. The new Pinco Pallino data is specifically designed to "light up" these components with complex graph connections (e.g., overlapping company ownerships).

---

## 3. Trigger Mechanism & User Flow

1.  **Entry Point**: The user types `"demo mode"` (or `"demo"`, case-insensitive) into the main Chat (`ChatContainer.tsx` / `producer_desk.py`).
2.  **Intercept**: The chat interface (or the Producer Desk agent) intercepts this exact string.
3.  **Response**: The assistant replies with a brief acknowledgment (e.g., *"Initializing Demonstration Workspace for Pinco Pallino Film Festival..."*).
4.  **Auto-Launch**: The system bypasses standard LLM planning and triggers a dedicated mock API endpoint (e.g., `/api/investigations/demo`) that initiates the fast-tracked SSE (Server-Sent Events) stream.

---

## 4. The 15-20s Accelerated Loading Sequence (SSE Stream)

To showcase the platform's intelligence without making the user wait 3 minutes, the demo will use a hardcoded time-series of Server-Sent Events spanning exactly ~18 seconds.

| Time (sec) | SSE Event Type | UI Representation (LiveProgress.tsx) |
| :--- | :--- | :--- |
| **0s - 3s** | `PLANNING_STARTED` | Stage 1 Active: *"Formulating parallel investigation strategy..."* |
| **3s - 7s** | `DOMAIN_SEARCH_STARTED` | Stage 2 Active: Rapidly firing mock events:<br>- *"Querying Companies House for Pinco Pallino Film CIC..."*<br>- *"Scraping BFI Southbank physical rental manifests..."*<br>- *"Fetching Letterboxd filmmaker reviews..."* |
| **7s - 11s** | `CONTRADICTIONS_ANALYZING` | Stage 3 & 4 Active: *"Cross-referencing Jury Chair corporate filings against submission fees..."* |
| **11s - 16s**| `DOSSIER_SYNTHESIZING` | Stage 5 Active: *"Synthesizing deep-vetting matrix and provenance graphs..."* |
| **17s** | `DOSSIER_READY` | Chime sound. The fully populated Evidence Dossier is mounted. |

---

## 5. The "Gold Standard" Pinco Pallino Data Payload

The resulting dossier must be the richest, most detailed payload the app has ever seen, designed to perfectly demonstrate the **Detail Dial** (Simplified -> Balanced -> Full Evidence -> I am not human).

### 5.1 Base Entity Profile
*   **Name**: Pinco Pallino Film Festival
*   **Location**: London, UK
*   **Venue**: Genesis Cinema Whitechapel & BFI Southbank
*   **Overall Score**: 78/100 (Amber/Green - Legitimate but with operational red flags)

### 5.2 Specific Forensic Flags (To populate Contradictions & Network Graphs)
1.  **Conflict of Interest / Cross-Selling**: 
    *   *Data Point*: 3 key associates (Festival Director, Lead Programmer, Jury Chair) are listed as co-directors of **Pallino Media Lab Ltd** and **IndiePitch Consulting**.
    *   *Flag*: These entities actively sell distribution consulting and DCP packaging to the same filmmakers submitting to the festival.
2.  **Repeat Winner Anomaly**: 
    *   *Data Point*: The "Best International Short" was won by the exact same director two years in a row (2024 & 2025). 
    *   *Flag*: The winning director co-produced a film with the festival's Lead Programmer in 2023.
3.  **Communication & Ghosting**: 
    *   *Data Point*: 14 user reviews aggregated from Letterboxd and Reddit (`r/Filmmakers`).
    *   *Flag*: Severe complaints about a 3–5 week communication blackout prior to notification dates, with late-notified rejections.
4.  **Aggressive Fee Escalation**:
    *   *Data Point*: Early bird entry is £28.
    *   *Flag*: Spikes unnaturally to £85 in the final 10 days without corresponding value increases.

### 5.3 Detail Dial Mapping
The frontend `EvidenceDossier.tsx` and `DetailDial.tsx` will filter the rendering of this JSON payload:
*   **Mode 1 (Simplified / Low Data)**: Shows only the 78/100 score, the Radar chart, and 4 bullet points summarizing the flags above.
*   **Mode 2 (Balanced / More Data)**: Unlocks the Contradiction panels and dispute cards showing the clash between the festival's stated rules and the Companies House filings.
*   **Mode 3 (Full Evidence / Deep Vetting)**: Unlocks the full `PersonnelNetworkDiagram` (showing the web between the Festival, IndiePitch Consulting, and the Jury members), full `AtomicClaim` citations with exact URLs, and the Filmmaker Checklist.
*   **Mode 4 (I am not human)**: Renders the raw JSON-LD, graph traversal metrics, and system-level provenance tokens.

---

## 6. QA & Verification Phase (Dedicated Double-Check)

*Implementation must NOT be considered complete until this QA phase is executed and passed.*

### 6.1 Data Purity Check
- [ ] Search the entire codebase for `Aldergate`, `Raindance`, and `Phantom Indie` mock data. Ensure they are entirely disabled or removed.
- [ ] Verify that the Pinco Pallino dataset is the *only* mock data powering the UI when `demo mode` is invoked.

### 6.2 UX / Flow Verification
- [ ] Verify that typing `"demo mode"` in the chat triggers the flow without requiring a backend LLM round-trip (must be instant).
- [ ] Verify the SSE stream timings. Does the loader transition smoothly across all 5 stages in ~15-20 seconds?
- [ ] Ensure the pulsating mini-loader dot appears during the active event stream.

### 6.3 Detail Dial & Jury Logic Verification
- [ ] **Jury Radar**: Ensure the `Organizer & Jury` axis on the Credibility Radar correctly reads the Pinco Pallino data and registers a lower score due to the conflict of interest.
- [ ] **Network Diagram**: Ensure the `PersonnelNetworkDiagram` visually connects the Jury Chair, Director, and Programmer to "Pallino Media Lab Ltd".
- [ ] **Detail Dial Transitions**: Scrub the dial from 1 to 4. Ensure Mode 1 hides the dense network graph and citations, while Mode 3 reveals them flawlessly. Ensure Mode 4 drops into the developer JSON view.

---
*Status: SPECIFICATION DRAFT - Pending User Approval.*
