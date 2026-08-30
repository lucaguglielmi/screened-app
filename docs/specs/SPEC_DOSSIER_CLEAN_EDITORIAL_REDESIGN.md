# Specification: Clean Editorial Dossier Redesign & Visual De-Cluttering

## 🎯 Executive Overview
This specification addresses UI clutter and visual fatigue across the Screened Evidence Dossier. The goal is to eliminate nested "card-in-a-card" containers, remove unnecessary bounding boxes, calm the typography, and reduce saturated rainbow badge colors. The dossier will transition from an over-containerized dashboard to an **elegant, high-legibility forensic intelligence brief** with clean editorial structure and restrained typography.

---

## 🏛️ Key Design Principles

1. **Zero Nested Cards ("Flat Document Hierarchy")**:
   - No card should ever live inside another bounding card.
   - Parent section wrappers (`#section-overview`, `#section-domains`, `#section-network`, `#section-claims`, `#section-checklist`, `#section-sources`) will shed heavy `bg-darkroom-surface`, `rounded-3xl`, and `shadow-2xl` boxes, rendering as open editorial sections separated by airy spacing and subtle baseline rules (`border-b border-darkroom-border/30`).
   - Items within sections (e.g. claims ledger, sources list, previous editions, personnel) will render as clean, readable rows or subtle flat cards directly on the canvas.

2. **Calm & Restrained Typography**:
   - **Headings**: Editorial serif (`font-serif font-semibold text-white tracking-tight text-xl sm:text-2xl`) with clear hierarchy.
   - **Prose**: Generous line-height (`leading-relaxed text-slate-200 text-sm sm:text-base font-sans`).
   - **Metadata & Citations**: Subtle mono labels (`font-mono text-xs uppercase tracking-wider text-slate-400`).
   - Remove aggressive uppercase neon text in favor of understated, readable typography.

3. **Subdued Color Palette**:
   - Replace saturated neon purple, emerald, and yellow badge pills with soft, desaturated semantic accents (e.g., muted amber/rose for attention items, quiet slate/emerald for corroborated records).
   - Neutralize backgrounds to cohesive deep tones with subtle contrast.

---

## 📐 Detailed Component Changes

### 1. `frontend/src/components/EvidenceDossier.tsx`
- **Header & Profile Section**:
  - Convert from a heavy bounding card into a clean document masthead with large festival title, verified domain link, est. date, and location.
  - Simplify top metric bar into a subtle borderless inline counter strip.
- **Sticky Navigation Bar**:
  - Keep the compact sticky header with reading progress bar, table of contents burger, and detail density dial, but flatten backgrounds into clean frosted glass.
- **Section Layouts**:
  - **Executive Overview**: Open prose section with editorial serif text without bounding card frame.
  - **3-Domain Syntheses**: Render as a clean 3-column editorial grid with subtle top border rules rather than 3 bulky cards inside a parent container.
  - **Atomic Claims & Citations Ledger**: Clean flat table/list with subtle dividers, clear domain labels, and muted status tags.
  - **Discovered Web Sources**: Clean grid of minimal source links with domain tier indicators directly on the surface.
  - **Legal Advisory Card**: Clean, quiet advisory notice card with muted text.

### 2. `frontend/src/components/investigation/DeepVettingMatrix.tsx`
- **Container Cleanup**:
  - Remove outer gradient banner box and black nested counters.
  - Render the 7 Forensic Vectors as an open expandable accordion list directly on the document flow without outer container nesting.
  - Desaturate signal badges and risk weights.

### 3. `frontend/src/components/investigation/KeyPersonnelCardList.tsx` & `PersonnelNetworkDiagram.tsx`
- Remove double container borders.
- Present key personnel forensic cards as clean flat profiles with avatars and verification badges.

### 4. `frontend/src/components/investigation/PreviousEditionsSection.tsx`
- Clean chronological timeline / year cards without heavy nested shadows.

### 5. `frontend/src/components/CredibilityRadar.tsx` & `ContradictionPanel.tsx`
- Streamline claim counts and contradiction cards with subtle, readable typography.

---

## 🚦 Acceptance Criteria
- [ ] No nested card-in-a-card layouts exist anywhere in the dossier flow.
- [ ] Section backgrounds feel light, calm, and readable without claustrophobic multi-layer borders.
- [ ] Typography uses calm, legible slate tones with appropriate font sizing and line spacing.
- [ ] All interactive features (Sticky Table of Contents, 3-Bar Density Dial, Search Filters, Markdown/PDF exports, Copy Shareable URL) remain 100% functional.
- [ ] Full quality gate passing (`npm run lint && npm run build` and `pytest`).
