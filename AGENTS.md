# AnyTune — agent guide

AnyTune is a mobile-first guitar/bass tuner with fully editable per-string tunings.
One TypeScript codebase: Vite + React PWA, wrapped with Capacitor for the app stores.

## Read first

- [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) — architecture, decisions, and the step-by-step development plan. Keep it updated when steps complete or decisions change.
- [.cursor/rules/code-style.md](.cursor/rules/code-style.md) — enforced code-style rules.

## Hard rules

- `src/core/` must stay pure TypeScript: no React, no DOM, no browser APIs (enforced by ESLint). This keeps a future React Native migration cheap.
- Run `npm run check` (lint + format + typecheck + tests) before finishing any task; it must pass.
- Microphone capture must keep `echoCancellation`, `noiseSuppression`, and `autoGainControl` disabled — they destroy low-frequency tuner input.
