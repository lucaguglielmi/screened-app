# Screened Frontend

A fast, responsive web interface for independent filmmakers, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## 🎨 Design & Philosophy

The frontend is designed with a **cinematic darkroom aesthetic** inspired by film grading suites and editing bays:
- **No Clutter**: Essential facts and verdicts are prioritized so filmmakers can make decisions in seconds.
- **Choose Your Level of Detail**: A 4-tier detail dial lets you switch between a 10-second executive summary, a balanced visual graph, full forensic citations, or raw JSON-LD machine data.
- **Interactive Evidence Graphs**: Visual networks built with `@xyflow/react` showing how festivals connect to registered companies, directors, and screening venues.
- **Built-in Synthesized Audio**: Gentle sound effects powered by the browser's Web Audio API (oscillator synthesis) that give tactile feedback without loading heavy audio files. Can be muted anytime with the `M` key.

---

## 🧪 Testing & Quality Gates

Every change must pass strict automated quality checks:
1. **TypeScript Verification**: Strict compilation check (`npm run build` / `tsc -b`).
2. **ESLint Checks**: Zero-warning code quality gate (`npm run lint`).
3. **Unit & Component Tests**: 55 unit tests running via **Vitest** (`npm test`), testing every critical component including the Authenticity Dial, Fee Visualizer, and Decision Trees.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Run all tests and type checks
npm test
npm run lint && npm run build
```

