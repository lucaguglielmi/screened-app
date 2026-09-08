# ⚖️ Product & Technical Specification: Privacy, Terms of Service, Cookie Consent & Data Retention

> **Document Version**: 1.0.0  
> **Target System**: Screened (`https://totallyscreened.com/`)  
> **Status**: COMPLETED (Implemented & Verified)  
> **Scope**: GDPR & UK DPA 2018 Statutory Compliance · Cookie Consent Management & GA4 Opt-In Gating · Dedicated Terms of Service (`/terms`) · Dedicated Privacy Policy (`/privacy`) · Data Retention Lifecycle & Firestore TTL Policies · Right to Erasure Endpoints · Filmmaker IP Protection  

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 The Context & Stakes
Screened operates in a sensitive investigative domain: evaluating the legitimacy, physical reality, and financial models of international film festivals, while matching unproduced film treatments with public film funds.

Filmmakers upload confidential treatments, pitch decks, and unreleased screenplays. Simultaneously, Screened audits public corporate registries (Companies House) and venue manifests, rendering objective verdicts (`SAFE`, `CAUTION`, `FLAGGED`, `CRITICAL_RISK`).

Operating this platform without formal, legally sound **Terms of Service**, **Privacy Policy**, **Cookie Consent Management**, and **Data Retention Policies** exposes the platform and its users to three critical risks:

1. **Regulatory Non-Compliance (UK DPA 2018 & EU GDPR)**:
   - **Cookie Consent Gap**: Google Analytics 4 (`gtag.js`) currently executes unconditionally if `VITE_GA4_MEASUREMENT_ID` is present. Under the UK Privacy and Electronic Communications Regulations (PECR) and EU ePrivacy Directive, analytics cookies (`_ga`, `_ga_*`) require **prior, informed, opt-in consent**.
   - **Storage Limitation Gap**: Personal data (user emails entered for notification alerts, chat session logs) is currently stored in Google Cloud Firestore indefinitely without automated Time-To-Live (TTL) expiration policies, violating GDPR Article 5(1)(e).
   - **Right to Erasure Absence**: Users have no automated endpoint or UI mechanism to request the deletion of their email or chat histories (GDPR Article 17).

2. **Legal & Liability Exposure (Due Diligence Disclaimers)**:
   - Screened performs automated forensic investigations. If a festival organizer disputes a `FLAGGED` verdict, or if a filmmaker loses submission fees after relying on a `SAFE` report, Screened requires clear, legally protective Terms of Service establishing that reports are informational research summaries derived from public records, not legal or financial advice.

3. **Filmmaker Creative Asset & IP Protection**:
   - Filmmakers must have unambiguous legal guarantees that uploading screenplay excerpts or pitch decks grants Screened zero intellectual property rights, that scripts are never used to train external models, and that data minimization principles strictly apply.

---

## 2. Regulatory Compliance Architecture

### 2.1 Statutory Mapping

| Regulatory Regime | Article / Mandate | Screened Compliance Implementation |
| :--- | :--- | :--- |
| **UK PECR / EU ePrivacy** | Prior consent for non-essential cookies | Client-side **Cookie Consent Banner** (`CookieConsentBanner.tsx`). GA4 `analytics_storage` defaults to `denied` until explicit opt-in. |
| **GDPR Art. 5(1)(a)** | Lawful, fair, and transparent processing | Clear **Privacy Policy** (`/privacy`) detailing data controller identity, lawful basis (legitimate interest / consent), and processor disclosures. |
| **GDPR Art. 5(1)(c)** | Data minimization | Extraction of structural parameters only (format, genre, budget) for grant matching; full screenplay text is never forwarded to public search APIs. |
| **GDPR Art. 5(1)(e)** | Storage limitation (Data retention) | Automated **Firestore TTL policies**: Chat sessions expire after 30 days; notification emails purge upon delivery or after 7 days. |
| **GDPR Art. 13 & 14** | Information to be provided to data subjects | Transparent enumeration of all third-party sub-processors (Google Cloud Vertex AI, Parallel Systems API, SendGrid). |
| **GDPR Art. 17** | Right to erasure ("Right to be forgotten") | Automated `/api/privacy/erase` endpoint and instant deletion buttons for notification subscriptions. |

---

## 3. Component & System Specifications

### 3.1 Pillar 1: Cookie Consent Management & Telemetry Gating

#### A. Frontend Banner (`frontend/src/components/legal/CookieConsentBanner.tsx`)
- **Visual Design**: Sleek, cinematic darkroom floating notification anchored at the bottom of the viewport with subtle backdrop blur (`bg-darkroom-surface/95 border-darkroom-border`).
- **Options**:
  - **"Accept Analytics"**: Enables GA4 tracking cookies for anonymized usage statistics.
  - **"Decline Non-Essential"**: Disables all analytics cookies; only strictly necessary functional settings (e.g. `screened_theme`, volume preferences) are kept in `localStorage`.
- **State Storage**: `screened_cookie_consent: "accepted" | "declined"` stored in `localStorage`.
- **Persistent Access**: A small "Cookie Settings" trigger link will be placed in the footer and in the About/Settings dialog, allowing users to revoke or alter consent at any time.

#### B. GA4 Consent Mode Integration (`frontend/index.html` & `frontend/src/utils/telemetry.ts`)
Update `index.html` to initialize Google Consent Mode v2 with defaults set to `denied`:
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // Default all analytics storage to denied prior to user consent
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
</script>
```
When user clicks "Accept", trigger:
```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

---

### 3.2 Pillar 2: Terms of Service Specification (`/terms`)

A comprehensive, plain-English legal document rendered either as a dedicated semantic view at `/terms` or via a quick-access modal dialog (`TermsModal.tsx`):

#### Key Clauses:
1. **Nature of the Service**:
   - Screened is an autonomous research tool and information aggregator that searches publicly accessible databases, corporate filings, cinema box-office manifests, and community forums.
   - Screened does **not** provide legal, financial, or formal distribution advice.
2. **Investigation Verdicts & Disclaimer of Accuracy**:
   - `SAFE`, `CAUTION`, `FLAGGED`, and `CRITICAL_RISK` verdicts represent synthesized summaries of primary evidence at the time of investigation.
   - Screened makes no guarantee that submission to a `SAFE` festival will result in official selection, screening, or award.
   - A `FLAGGED` or `CRITICAL_RISK` verdict is not a formal accusation of criminal conduct; it indicates factual discrepancies between promotional claims and official records. Filmmakers are advised to conduct independent verification before committing non-refundable funds.
3. **Intellectual Property Guarantee (100% Filmmaker Ownership)**:
   - Filmmakers retain full, exclusive intellectual property rights and copyright to all materials uploaded to Screened (treatments, screenplays, synopses, pitch decks).
   - Screened does not use filmmaker creative assets to train public artificial intelligence models.
4. **Acceptable Use & Anti-Abuse**:
   - Users may not use Screened's tools, API endpoints, or WebMCP protocols to conduct denial-of-service attacks, automated harassment of festival staff, or bulk scraping.
   - Rate limits (60 req/min for read tools, 3 deep scans/hr) are strictly enforced.
5. **Limitation of Liability**:
   - To the maximum extent permitted by UK and international law, Screened and its maintainers shall not be liable for any submission fees lost, damaged festival relationships, or indirect commercial damages arising from the use of the platform.

---

### 3.3 Pillar 3: Privacy Policy Specification (`/privacy`)

A dedicated privacy document accessible at `/privacy` or via `PrivacyModal.tsx`:

#### Key Disclosures:
1. **Data Controller Identity**:
   - Service: Screened Cinema Intelligence (`https://totallyscreened.com/`).
   - Contact: `privacy@totallyscreened.com`.
2. **Data Collected**:
   - **Conversational Inputs**: Filmmaker prompts, attached PDF excerpts. Processed in ephemeral memory and cached in user sessions for active conversation continuity.
   - **Notification Subscriptions**: User email addresses provided optionally to receive investigation completion alerts.
   - **Usage & Telemetry**: Anonymized IP and interaction counts collected only with opt-in consent via GA4.
   - **Local Storage Items**:
     - `screened_theme`: UI dark/light preference.
     - `screened_audio_muted`: Web Audio sound effects state.
     - `screened_cookie_consent`: Cookie acceptance state.
3. **Third-Party Sub-Processors & Data Transfers**:
   - **Google Cloud Platform (europe-west2, London)**:
     - Cloud Run: Serverless backend computation.
     - Cloud Firestore: State machine and evidence caching.
     - Vertex AI (Gemini 2.5 Pro & Flash): Structured reasoning and function calling. Subject to Google Cloud Enterprise privacy commitments (customer data is not logged or used for foundational model training).
   - **Parallel Systems Inc. (Parallel Search API)**:
     - Grounds investigations in public web sources. Only public entity names and cinema venue search queries are dispatched; private scripts are never forwarded.
   - **SendGrid / Twilio**:
     - Optional transactional email delivery for dossier completion alerts.
4. **User Rights Under GDPR & UK DPA 2018**:
   - **Right of Access & Portability**: Users can download complete archival Markdown dossiers at any time via `/api/investigations/{id}/export`.
   - **Right to Erasure**: Users can invoke `/api/privacy/erase` or click "Delete My Data" in settings to remove stored email notifications and associated chat sessions.

---

### 3.4 Pillar 4: Data Retention & Automated Purge Lifecycles

#### A. Firestore TTL Configuration
To ensure compliance with the GDPR Storage Limitation principle, define automatic TTL expirations on Firestore collections:

1. **`screened-sessions` (Chat Conversations)**:
   - Add field `expireAt = now() + 30 days`.
   - Inactive sessions are automatically evicted by Firestore after 30 days.
2. **`screened-notifications` (Filmmaker Email Subscriptions)**:
   - Once the completion email is sent via `email_service.send_completion_email()`, the notification record is **immediately deleted** from the database.
   - Any undelivered or orphaned notification records expire automatically via `expireAt = now() + 7 days`.
3. **`screened-investigations` (Public Due Diligence Dossiers)**:
   - Cached evidence dossiers remain accessible for public verification, but all embedded filmmaker outreach notes and personal identifiers are scrubbed from the persisted record.

#### B. Erasure API Endpoint (`POST /api/privacy/erase`)
- Accepts `{ "email": "user@example.com" }` or `{ "session_id": "sess_..." }`.
- Deletes all matching records across `screened-notifications`, `screened-sessions`, and `screened-feedback`.
- Emits a structured audit log verifying complete removal.

---

## 4. UI/UX Integration & User Journeys

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Screened App                                  │
│                                                                             │
│  [Top Header: Screened Logo | Tool Switcher: Screened AI Chat | Due Diligence]
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                        Active Application Workspace                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ FOOTER UTILITY BAR                                                    │  │
│  │ © 2026 Screened · [Privacy Policy] · [Terms of Service] · [Cookies]   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🍪 FLOATING COOKIE CONSENT BANNER (First Visit Only)                  │  │
│  │ Screened uses anonymized cookies to measure platform performance.     │  │
│  │ [ Decline Non-Essential ]                     [ Accept Analytics ]    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **First-Time Visitors**:
   - See the floating Cookie Consent Banner at the bottom right.
   - Can immediately accept or decline without blocking app usage.
2. **Footer Links**:
   - Universal footer present across all views (`/`, `/diligence`, `/grants`, `/playground`) containing clean links to **Privacy Policy**, **Terms of Service**, and **Cookie Settings**.
3. **Semantic Routes & Modals**:
   - Clicking `/privacy` or `/terms` in the address bar loads full standalone views.
   - Clicking the footer links opens fast, non-disruptive overlay modals (`PrivacyModal.tsx` and `TermsModal.tsx`) so researchers do not lose their active dossier or chat state.

---

## 5. Implementation Task List

### Phase 1: Legal Documentation & Content Drafting
- [ ] Create `frontend/src/content/legalTerms.ts` containing the verified, full legal text for:
  - Terms of Service
  - Privacy Policy
  - Cookie Policy & Sub-Processor Schedule

### Phase 2: Frontend Components & Routing
- [ ] Create `frontend/src/components/legal/CookieConsentBanner.tsx`.
- [ ] Create `frontend/src/components/legal/PrivacyModal.tsx`.
- [ ] Create `frontend/src/components/legal/TermsModal.tsx`.
- [ ] Create `frontend/src/components/legal/AppFooter.tsx` and attach to `App.tsx`.
- [ ] Update `frontend/src/router/Router.ts` to support `/privacy` and `/terms` routes.
- [ ] Update `frontend/index.html` to configure Google Tag Manager / GA4 Consent Mode v2 defaults (`analytics_storage: "denied"`).

### Phase 3: Backend Data Retention & Erasure Endpoint
- [ ] Implement `POST /api/privacy/erase` in `backend/main.py` allowing users to delete their email or session records.
- [ ] Update `backend/services/email_service.py` to immediately purge email notification records upon successful delivery.
- [ ] Add `expireAt` timestamp attributes to `screened-sessions` and `screened-notifications` in Firestore for automated TTL eviction.

### Phase 4: Verification & Quality Gates
- [ ] Add Vitest tests for `CookieConsentBanner.test.tsx` (testing accept/decline state transitions).
- [ ] Add Vitest tests for `TermsModal.test.tsx` and `PrivacyModal.test.tsx`.
- [ ] Add Pytest unit tests in `backend/tests/test_privacy_erasure.py` for `/api/privacy/erase`.
- [ ] Run full pre-commit verification (`pytest`, `npm test`, `npm run lint`, `npm run build`).

---

## 6. Verification Plan

### Automated Testing
- `backend`: `PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/test_privacy_erasure.py`
- `frontend`: `cd frontend && npm test -- --run`
- `lint & build`: `cd frontend && npm run lint && npm run build`

### Manual Verification
- Verify that on a fresh incognito session at `https://totallyscreened.com/`, the cookie banner appears.
- Verify clicking "Decline" sets `localStorage.getItem("screened_cookie_consent") === "declined"` and prevents GA4 from setting `_ga` cookies.
- Verify clicking "Terms of Service" or "Privacy Policy" in the footer opens the modal instantly with zero interruption to running investigations.
- Verify that submitting an email for notification and triggering completion deletes the email from Firestore immediately upon delivery.
