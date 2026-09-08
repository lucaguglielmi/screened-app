---
name: screened-grant-scout
description: >-
  Matches independent film projects to verified institutional public funds, national lotteries
  (BFI, Creative Europe, Doc Society), and generates 4-pillar submission packaging checklists.
  Use when the user asks for grant funding, film financing schemes, public subsidies, co-production
  opportunities, or application guidelines for an independent film project.
---

# Screened Grant Scout & Submission Packaging Runbook

Use this skill when an independent filmmaker, producer, or director is seeking non-repayable grants, national film lottery funds, development subsidies, or co-production backing.

---

## 1. Project Parameter Extraction & Data Minimization

Extract the following non-confidential project attributes from the user's inquiry:
1. **Format & Genre**: (e.g. Narrative Feature, Short Fiction, Documentary Series, XR / Immersive)
2. **Target Budget Tier**:
   - Micro-budget: Under £50k / \$60k
   - Low-budget Indie: £50k–£250k / \$60k–\$300k
   - Mid-budget Independent: £250k–£1.5M / \$300k–\$2M
3. **Production Stage**: Development / Script Stage, Pre-Production, Principal Photography, or Post-Production / Finishing Fund.
4. **Territory / Eligibility Anchor**: Primary producer residency, filming locations, or co-production treaties (e.g., UK BFI / National Lottery, Creative Europe MEDIA, Eurimages, Sundance Documentary Fund).

> [!IMPORTANT]
> **Filmmaker IP Protection**: Never extract or transmit full unproduced screenplay texts, character dialogue drafts, or confidential investor terms to external search tools. Limit all external queries strictly to structural project parameters.

---

## 2. Institutional Fund Query

Invoke the Screened MCP tool `screened_scout_grants` with the normalized parameters:
```json
{
  "genre": "<extracted_genre>",
  "budget_tier": "<budget_tier>",
  "stage": "<development|production|post>",
  "territory": "<country_or_region>"
}
```

Evaluate returned funding programs for:
- **Non-repayable Grant Status**: Confirm funding is an outright non-repayable grant or soft-loan recoupable only on commercial profit, not debt financing.
- **Deadlines & Rolling Windows**: Confirm whether the funding round is currently accepting applications or has upcoming deadlines.
- **Matched Funding Rules**: Note any requirement for matched private equity or regional tax credit spend.

---

## 3. Four-Pillar Submission Packaging Runbook

Prepare a packaging guide for the filmmaker covering the 4 pillars institutional grant panels inspect:

1. **Pillar 1: Logline & Creative Vision**
   - High-concept logline (25–35 words).
   - Director's thematic statement: Why this story must be told now, and why this director is uniquely positioned to tell it.
2. **Pillar 2: Finance Plan & Budget Realism**
   - Realistic top-sheet summary with contingency reserve (minimum 7–10%).
   - Indication of local spend qualifying for regional tax relief (e.g. UK Independent Film Tax Relief).
3. **Pillar 3: Key Creative Team & Track Record**
   - Producer and director bios highlighting previous festival screenings, awards, or credited work.
   - Commitment to diversity, equity, and sustainable production standards (e.g., BAFTA albert certification).
4. **Pillar 4: Audience Design & Cultural Impact**
   - Targeted primary and secondary festival premiere tiers.
   - Community impact, educational outreach, or theatrical release roadmap.

---

## 4. Grant Intelligence Brief Format

Deliver the scout report to the filmmaker in this clear format:

```markdown
### 🏛️ Grant Scouting Brief: [Project Title / Format]

**Project Profile**: [Format] | [Target Budget] | [Stage] | [Territory]

#### 💰 Matched Public & Institutional Funds
1. **[Fund Name]** — *[Award Ceiling, e.g., Up to £50,000]*
   - **Funder**: [e.g. BFI National Lottery Filmmaking Fund / Doc Society]
   - **Deadline**: [Date or Rolling Application]
   - **Key Eligibility**: [Eligibility requirements, e.g. First/second-time UK directors]
   - **Official Portal**: [Verified Funder URL]

#### 📋 4-Pillar Application Readiness Checklist
- [ ] **Creative**: Director's vision statement drafted & trimmed to under 2 pages.
- [ ] **Finance**: Top-sheet budget matches fund ceiling + realistic matched funding ratio.
- [ ] **Team**: Creative key bios formatted to funder specifications.
- [ ] **Audience**: Distribution roadmap targets verified A-tier & accredited festivals.

#### 💡 Scout Advice
[Specific guidance on funder priorities and submission timing to maximize approval probability.]
```
