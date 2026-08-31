# Specification: Claim Pipeline Resilience, Deep Vetting 360° Dataflow & Investigation Diagnostic Auditing

## 🎯 Executive Overview
This specification delivers a robust, multi-layer architectural overhaul to resolve the "empty dossier / 0 claims" defect permanently. It addresses:
1. **Claim Assembly & Model Integrity**: Eliminating silent Pydantic validation drops, properly deriving mandatory `domain` properties on `SourceRecord`, hardening enum parsing, and persisting both claims and sources reliably to Firestore.
2. **Deep Vetting 360° Forensic Dataflow**: Un-siloing `DeepVettingAgent` so it ingests all scraped domain sources and claims, injects structured dimension evidence directly into `vetting_scorer`, expands domain tiers to international registries and un-restricted web searches, and adds `ALUMNI_FOOTPRINT` to active dimension agents.
3. **Self-Auditing Health & Fast-Diagnosis Telemetry**: Introducing a zero-overhead `auditHealth` diagnostic schema attached to every investigation record. If an investigation ever encounters parsing drops, source starvation, or degraded vector output, the system immediately logs structured alert signatures and embeds diagnostic telemetry in `GET /api/investigations/{id}` and `/api/diagnostics`, allowing instant root-cause identification when queried.

---

## 🏛️ Key Architectural Changes

### 1. Research Pipeline & Claim Assembly (`backend/orchestrator/state_machine.py`)

#### A. Defensive `SourceRecord` Construction
- **Root Cause**: `SourceRecord` requires `domain: str`. The claim assembly loop omitted `domain` and passed non-existent fields (`investigationId`, `relevanceScore`), throwing a `pydantic.ValidationError` that silently aborted claim saving.
- **Solution**:
  - Implement a safe helper `_create_source_record(...)` that safely extracts the registrable domain via `urllib.parse` / `tldextract` or falls back to `"web"`.
  - Only populate valid schema fields: `id`, `url`, `domain`, `title`, `publishedDate`, `retrievedAt`, `excerpts`, `sourceTier`, `contentHash`, `discoveredByQuery`.
  - Catch and record any individual source/claim serialization anomalies without aborting the claim itself.

#### B. Enum Defensive Coercion
- Safely parse `ClaimKind` and `VerificationStatus` with uppercase normalization and safe fallbacks:
  ```python
  def safe_claim_kind(val: Any) -> ClaimKind:
      try:
          return ClaimKind(str(val).upper())
      except (ValueError, KeyError, AttributeError):
          return ClaimKind.FACT
  ```

#### C. Full Source Persistence
- Call `await db.save_sources(investigation_id, all_sources)` during stage finalization so `/api/investigations/{id}` returns the complete source list to the frontend and export modules.

---

### 2. Deep Vetting 360° Forensic Engine (`backend/agents/deep_vetting.py`)

#### A. Full Context Ingestion
- Ingest `sources: List[SourceRecord]` and `claims: List[AtomicClaim]` into `DeepVettingAgent.analyze(...)`.
- Pre-populate dimension agents with relevant snippets (e.g., extracted rules copy for `BOILERPLATE_PLAGIARISM`, entity founding date & website for `DOMAIN_PROVENANCE`, registered address for `CORPORATE_REGISTRY`).

#### B. Direct Dimension State Injection into Scorer
- Update `DeepVettingAgent.analyze` to compile the outputs of all parallel dimension tasks into an explicit structured context block injected into `vetting_scorer`'s prompt.
- Ensure `vetting_scorer` has full ground-truth visibility over corporate registration records, domain WHOIS findings, venue corroborations, jury rosters, and image inspection results before generating `DeepVettingReport`.

#### C. Broaden Domain Tiers (`backend/tools/source_tiers.py`)
- **`CORPORATE_IDENTITY_DOMAINS`**: Expand beyond UK Companies House to include international registries, open corporate databases (`opencorporates.com`, `registroimprese.it`, `infogreffe.fr`, `handelsregister.de`, `sec.gov`, `guidestar.org`), and official municipal records.
- **`DOMAIN_FORENSICS_DOMAINS`**: Remove interactive-only WHOIS portals and enable open web search queries for domain history, archive announcements, and founding press.
- **Add `ALUMNI_FOOTPRINT` to `DIMENSIONS`**: Spawn an active agent inspecting IMDb festival laurels, BAFTA/BIFA shortlists, and Letterboxd alumni tags.

---

### 3. Investigation Diagnostic Health Audit & Fast Root-Cause Logging

#### A. Structured `InvestigationAuditHealth` Schema (`backend/models.py`)
Add an embedded diagnostic health block to `Investigation`:
```python
class InvestigationAuditHealth(BaseModel):
    status: str = "HEALTHY"  # "HEALTHY", "DEGRADED", "EMPTY_WARNING", "CRITICAL_FAILURE"
    rawDomainClaimsReceived: int = 0
    assembledClaimsCount: int = 0
    sourcesCount: int = 0
    validationErrorsCount: int = 0
    validationErrors: List[str] = Field(default_factory=list)
    deepVettingVectorsCount: int = 0
    deepVettingInconclusiveCount: int = 0
    warnings: List[str] = Field(default_factory=list)
    executionDurationMs: int = 0
```

#### B. Automatic Anomaly Detection on Finalization
Inside `state_machine.py` before finalizing:
1. If `assembledClaimsCount == 0` when `rawDomainClaimsReceived > 0`:
   - Mark `status = "EMPTY_WARNING"`
   - Append warning: `f"CRITICAL: {rawDomainClaimsReceived} raw claims extracted from search/task API but 0 claims assembled into database."`
   - Emit high-priority structured error log: `[CLAIM_PIPELINE_ANOMALY] Investigation {id} dropped all claims!`
2. If `deepVettingInconclusiveCount >= 5`:
   - Mark `status = "DEGRADED"`
   - Append warning: `f"Deep Vetting starvation: {deepVettingInconclusiveCount}/7 forensic vectors returned INCONCLUSIVE."`

#### C. Instant Diagnostic Visibility in API
- Include `auditHealth` in the response of `GET /api/investigations/{id}`.
- Expose investigation health tallies in `GET /api/diagnostics`.
- When developer or automated tools query an investigation, the exact reason for an empty dossier or missing vector is immediately readable without digging through raw server logs.

---

## 🚦 Acceptance Criteria & Verification Plan

### 1. Automated Unit & Integration Tests
- **`tests/test_claim_pipeline_resilience.py`**:
  - Test `SourceRecord` generation with various malformed / missing domain URLs.
  - Test Claim Assembly with mixed raw dict structures (fallback search format and Task API basis format).
  - Verify `save_claims` and `save_sources` persist non-empty collections to Firestore.
- **`tests/test_deep_vetting_full_dataflow.py`**:
  - Test `DeepVettingAgent.analyze` with pre-populated sources and claims.
  - Verify that `vetting_scorer` receives all dimension outputs and does NOT output generic *"Information was not provided"* placeholders when evidence exists.
  - Verify `ALUMNI_FOOTPRINT` is actively evaluated in `dimensions`.
- **`tests/test_investigation_audit_health.py`**:
  - Verify that `investigation.auditHealth` is correctly computed and flags any validation drop or data starvation.

### 2. Pre-Commit Quality Gate
- Frontend: `cd frontend && npm run lint && npm run build` (0 ESLint errors).
- Backend: `PYTHONPATH=. .venv/bin/pytest tests/ backend/tests/` (100% passing).
