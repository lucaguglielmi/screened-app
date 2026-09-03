# Technical Specification: Shareable Dossier URLs, Background Notifications & Factual Pivot

**Document ID**: `SPEC_SHAREABLE_DOSSIER_NOTIFICATIONS_AND_FACTUAL_PIVOT`  
**Status**: `PENDING APPROVAL` (Do not execute without explicit user go-ahead)  
**Author**: Antigravity  
**Created**: 2026-08-30  

---

## 1. Overview & Business Objectives

This specification addresses four core product enhancements for the Screened intelligence platform:
1. **Permanent & Shareable Dossier URLs**: Enable filmmakers and producers to bookmark, refresh, and share canonical investigation links (e.g. `https://screened.app/?id=inv_123` or `/investigation/inv_123`) that retain full dossier state for days or weeks.
2. **"Come Back Later" Notifications (PWA Push & Email)**: Allow users to start a deep multi-agent investigation, safely close the browser tab, and receive immediate alerts when the dossier is ready.
3. **Mandatory Testing Disclaimer in Email Notification**: Clearly inform filmmakers that the festival research engine is fully functional but still experimental, requiring independent verification.
4. **Factual Pivot & Score Removal**: Eliminate arbitrary numeric scores (e.g. "Authenticity Score: 34%") in favor of hard verified facts and corroborations, accompanied by a comprehensive legal notice card at the bottom of the dossier.

---

## 2. Architecture & Technical Design

### A. Shareable & Persistent Dossier URLs

#### 1. Routing & URL State Synchronization
- **Frontend URL Scheme**: Support parameter query (`/?id=:id`) and path-based routing (`/investigation/:id`) for seamless SPA routing and browser bookmarking.
- **State Hydration on Mount** (`frontend/src/App.tsx`):
  - On application load, inspect `window.location.search` (`?id=...`) and pathname (`/investigation/...`).
  - If an `investigationId` is present:
    - Set `loading = true`.
    - Fetch `GET /api/investigations/{id}`.
    - If status is `READY`, immediately hydrate `investigation` state and render `EvidenceDossier`.
    - If status is `PLANNING`, `RESEARCHING`, or `DISAMBIGUATING`, render `LiveProgress` and subscribe to `GET /api/investigations/{id}/events` via Server-Sent Events (SSE).
- **URL Synchronization**:
  - When a new investigation is created or entity is confirmed, call `window.history.pushState({}, '', ?id=${investigation.id})` so the URL reflects the active investigation without a page reload.
- **Share Button**:
  - In the sticky navigation bar of `EvidenceDossier.tsx`, add a "Share Link" action button with a link icon. Clicking copies the canonical URL to the clipboard with an animated checkmark and tooltip confirmation (`"Share link copied!"`).

#### 2. Backend Persistence Guarantees
- Ensure `backend/db/firestore.py` stores the full dossier payload in Cloud Firestore under the `investigations` collection, including:
  - `confirmedEntity`, `dossier` (with `previousEditions`, `keyPersonnel`, `corporateEntity`), `claims`, `sources`, `disputes`, `transparencyIndex`, `status`, `createdAt`.
- Ensure `GET /api/investigations/{id}` resolves both live Firestore documents and demo mock fixtures (`demo_pinco_pallino`).

---

### B. "Come Back Later" Notifications (PWA Web Push & Email)

#### 1. Frontend "Notify When Ready" Intake
- In `LiveProgress.tsx`, display a notification tray below the progress timeline while `status !== 'READY'`:
  - **Web Push Button**: `"Enable Browser Notification"` (triggers `Notification.requestPermission()`).
  - **Email Intake**: An inline input `[ filmmaker@example.com ]` with a `"Notify Me"` button.
  - Submitting sends a request to `POST /api/investigations/{id}/notifications`.

#### 2. Backend Notification Dispatcher
- **Endpoint**: `POST /api/investigations/{id}/notifications`
  - Payload: `{ email?: string, pushSubscription?: object }`
  - Stores the email and push tokens in the Firestore document for `investigation_id`.
- **Completion Hook** (`backend/orchestrator/state_machine.py`):
  - When the orchestrator finishes synthesizing the dossier and transitions status to `READY`:
    1. If `notificationEmail` exists: Dispatch completion email via `backend/services/email_service.py`.
    2. If `pushSubscription` or web clients are registered: Send Web Push notification.

#### 3. Email Notification Template & Required Language
- **Email Subject**: `Your Forensic Dossier for {festival_name} is Ready | Screened`
- **Email Content**:
  ```html
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0B0D13; color: #F1F5F9; border-radius: 16px;">
    <h2 style="color: #22D3EE; margin-bottom: 8px;">Screened Intelligence Report</h2>
    <p style="font-size: 16px; color: #E2E8F0;">
      Your investigative dossier for <strong>{festival_name}</strong> is now compiled and ready for review.
    </p>
    
    <div style="margin: 20px 0; padding: 16px; background: #1E293B; border-left: 4px solid #F59E0B; border-radius: 8px; font-size: 13px; color: #CBD5E1; line-height: 1.5;">
      <strong>⚠️ Testing Notice &amp; Filmmaker Verification Advisory:</strong><br>
      Please note that the festival research functionality is fully working but still in active testing. Automated agents synthesize open public records and web sources, which may occasionally contain mistakes, outdated information, or omissions that require further validation from you. Always verify critical entry fees, dates, and screening venues before making submission decisions.
    </div>

    <a href="{dossier_url}" style="display: inline-block; background: #22D3EE; color: #0B0D13; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-top: 12px;">
      View Complete Dossier &rarr;
    </a>
  </div>
  ```

---

### C. Factual Pivot & Score Removal

#### 1. Removal of Arbitrary Numeric Scores
- **Rationale**: Filmmakers need verifiable evidence, not arbitrary AI-generated grades or fear-inducing scorecards.
- **Changes**:
  - Remove all percentage score badges (e.g., `Authenticity Score: 34%`, `Overall Authenticity: 34`) from:
    - `EvidenceDossier.tsx`
    - `LiveProgress.tsx`
    - `DeepVettingCard.tsx`
    - Markdown & JSON exports
  - Replace score widgets with **Factual Evidence Summaries**:
    - **Corroborated Records**: Count of verified primary sources (e.g. *18 public registries & press articles*).
    - **Atomic Claims**: Count of extracted statements (*24 claims analyzed*).
    - **Flagged Inconsistencies**: Count of uncorroborated claims or contradictions (*2 disputed points*).
    - **Corporate Standing**: Verified legal entity status (*Active Company Number #123456*).

---

### D. Legal Disclaimer Notice ("Legal Mumbo Jumbo")

#### 1. Dossier Footer Disclaimer Card
- Add a prominent, professionally styled legal notice card at the bottom of `EvidenceDossier.tsx`:
  - **Container**: `rounded-2xl p-6 bg-darkroom-card/80 border border-darkroom-border text-slate-400 text-xs leading-relaxed space-y-2`
  - **Icon**: `Scale` / `ShieldAlert` in muted slate.
  - **Title**: `Legal Disclaimer & Experimental Product Notice`
  - **Body Copy**:
    > *"Screened is an experimental intelligence platform designed to assist filmmakers and creators in conducting due diligence on film festivals and funding opportunities. All findings, directorship graphs, and claim evaluations are synthesized automatically from publicly accessible internet records, corporate registries, and media archives. Because web sources and automated extraction methods may contain errors, discrepancies, or out-of-date information, Screened makes no warranties regarding the absolute accuracy, completeness, or timeliness of this dossier. This report is provided for informational and preliminary vetting purposes only and does not constitute legal, business, or investment advice. Users are solely responsible for independently corroborating festival terms, venue bookings, entry fees, and award structures before submitting films or entering contractual agreements."*

---

## 3. Implementation Plan by Component

### Component 1: Frontend Routing & Shareable URLs
- [ ] In `frontend/src/App.tsx`:
  - Read `?id=...` parameter on mount and fetch investigation state.
  - Sync browser history via `window.history.pushState` on investigation creation and entity confirmation.
  - Support deep-linking to specific dossier sections (`?id=...#key-personnel`).
- [ ] In `frontend/src/components/EvidenceDossier.tsx`:
  - Add "Share Dossier Link" button to sticky header with clipboard copy and toast feedback.

### Component 2: Background Notifications & Email Dispatcher
- [ ] In `frontend/src/components/LiveProgress.tsx`:
  - Add "Notify me when ready" drawer with Web Push permission requester and Email intake input.
- [ ] In `backend/models.py`:
  - Add `NotificationSubscriptionRequest` schema.
- [ ] In `backend/main.py`:
  - Add `POST /api/investigations/{id}/notifications` endpoint.
- [ ] In `backend/services/email_service.py`:
  - Create email dispatcher with HTML template containing the mandatory testing disclaimer and dossier CTA link.
- [ ] In `backend/orchestrator/state_machine.py`:
  - Invoke notification service upon reaching `READY` status.

### Component 3: Factual Pivot & Score Removal
- [ ] In `frontend/src/components/EvidenceDossier.tsx`:
  - Replace numeric authenticity score gauges with factual metric badges (Corroborated Records, Extracted Claims, Disputes).
- [ ] In `frontend/src/components/LiveProgress.tsx`:
  - Remove score references from stage progress and metrics summary.
- [ ] In `backend/demo_payloads.py`:
  - Update demo fixture to present factual corroborations without arbitrary numeric grading.

### Component 4: Legal Disclaimer Card & Export Parity
- [ ] In `frontend/src/components/EvidenceDossier.tsx`:
  - Add the Legal Disclaimer & Experimental Product Notice card at the bottom of the dossier view.
  - Include the legal disclaimer in the downloaded Markdown report.

---

## 4. Verification Plan

### Automated Testing
- Backend unit tests:
  - `backend/tests/test_notifications.py`: Verify notification registration, validation, and email dispatch on `READY`.
  - `tests/test_backend.py`: Verify `GET /api/investigations/{id}` returns complete persisted dossier state.
- Frontend build & lint:
  - `npm run lint && npm run build` inside `frontend/`.

### Manual & Smoke Verification
- Create an investigation, copy shareable URL, open in private incognito window, verify dossier loads directly.
- Enter notification email in LiveProgress, complete investigation, verify email payload and disclaimer text.
- Verify that no numeric scores appear in the UI and the Legal Disclaimer card renders cleanly.
