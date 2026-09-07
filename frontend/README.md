# Screened Frontend

Modern React 19 + TypeScript + Vite + Tailwind CSS v4 single-page application for Screened intelligence and diligence dossiers.

## Architecture & Testing Notes

### Frontend Testing & Verification
> **Quality & Verification Architecture**:
> 1. Strict TypeScript type-checking (`tsc -b`)
> 2. Zero-tolerance ESLint quality gates (`npm run lint`)
> 3. Production build bundle validation (`npm run build`)
> 4. Component-level unit testing with Vitest (`npm test` — 19 tests across DetailDial, FeeEscalationVisualizer, PremiereBurnGauge, ForensicIntelligenceBrief, and SyndicateClusterGraph)
> 5. Full end-to-end integration verification (`tests/test_end_to_end.py`, `tests/test_demo_mode.py`)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run quality gate
npm run lint && npm run build
```
