# Screened Frontend

Modern React 19 + TypeScript + Vite + Tailwind CSS v4 single-page application for Screened intelligence and diligence dossiers.

## Architecture & Testing Notes

### Frontend Testing Status
> **Architecture Decision**: Frontend component and unit testing (e.g., Vitest / React Testing Library) was **intentionally left out until the code and UI workflows achieve greater maturity**. 
> 
> Currently, UI quality and regression prevention are enforced through:
> 1. Strict TypeScript type-checking (`tsc -b`)
> 2. Zero-tolerance ESLint quality gates (`npm run lint`)
> 3. Production build bundle validation (`npm run build`)
> 4. Backend end-to-end integration tests (`tests/test_end_to_end.py`, `tests/test_demo_mode.py`)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run quality gate
npm run lint && npm run build
```
