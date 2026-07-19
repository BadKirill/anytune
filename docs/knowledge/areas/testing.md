# Testing

Tags: `test`, `vitest`, `playwright`, `e2e`

## Unit (Vitest)

- Command: `npm run test` (included in `npm run check`)
- Config: `vite.config.ts` excludes `e2e/**` from Vitest
- Rule: every `src/core/` module has colocated `*.test.ts`
- Also: `src/audio/pitchDetector.test.ts`, `src/storage/customTuningsStore.test.ts`
- Prefer behavior tests (F1 detection, analyzer nearest string, storage migrate)

## E2E (Playwright)

| File                        | Focus                                                             |
| --------------------------- | ----------------------------------------------------------------- |
| `e2e/helpers.ts`            | `stubMicrophone`, `setTestTone`, `stubMicrophoneDenied`, UI waits |
| `e2e/smoke.spec.ts`         | Deployed/live smoke                                               |
| `e2e/tuner.spec.ts`         | Core tuner flow with stub mic                                     |
| `e2e/custom-tuning.spec.ts` | Edit/save custom                                                  |
| `e2e/stop-tuning.spec.ts`   | Stop listening                                                    |

Commands:

- Local full: `npm run test:e2e`
- Live smoke: `npm run test:e2e:live` (or `PLAYWRIGHT_BASE_URL=...`)

## Patterns

- Mic stubbed with oscillators before `page.goto` so worklet→pitch→UI is deterministic.
- E2E / test files relax max-lines / cognitive complexity in ESLint.

## Open when

Adding coverage for new flows, flaky UI, or changing detection thresholds that
break stubbed frequencies.

## See also

- [audio.md](audio.md) · [ci-cd.md](ci-cd.md) · [patterns-and-rules.md](patterns-and-rules.md)
