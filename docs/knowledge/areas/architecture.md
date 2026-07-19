# Architecture & data flow

Tags: `architecture`, `layers`, `data-flow`

## Intent

One portable domain core + thin platform shells. UI and mic can be swapped;
music/tuning math stays pure.

## Data flow

```
getUserMedia (AGC/NS/EC OFF)
  → AudioWorklet ring buffer (WINDOW 8192, post ~85ms)
  → detectPitch(pitchy MPM) + clarity gate
  → median / jump filter (micWindowHandler)
  → usePitch → useTunerState
  → analyze(frequency, tuning) or analyzeString(manual)
  → stabilizePitchDisplay (attack lock, decay hold)
  → TunerGauge / TuneDirectionHint / StringList highlight
```

Parallel path: presets + string edits → `Tuning` → storage (`active` + custom list)
→ same analyzer.

## Layer contracts

| Layer              | May import                                        | Must not                                      |
| ------------------ | ------------------------------------------------- | --------------------------------------------- |
| `src/core/*`       | other core, nothing else                          | react, DOM, audio, components, state, storage |
| `src/audio/*`      | core/music, core/signal (as needed), browser APIs | components UI details                         |
| `src/storage/*`    | core/tunings, core/music types                    | React                                         |
| `src/state/*`      | audio hooks, core, storage                        | —                                             |
| `src/components/*` | core types/helpers, UI only                       | pitch detection internals                     |

## Entry points

- App bootstrap: `src/main.tsx` → `App.tsx`
- Screen state: `src/state/appState.ts` → `useTunerState`
- Pitch pipeline: `src/audio/usePitch.ts`
- Domain barrel: `src/core/music`, `src/core/tunings`

## Related docs

- Plan / roadmap: `docs/DEVELOPMENT_PLAN.md` (steps 1–7 done; 8 Capacitor, 9 device)
- Agent workflow: `AGENTS.md`
- Patterns: [patterns-and-rules.md](patterns-and-rules.md)

## When to open source

Touch architecture only when changing layer boundaries, new top-level folders,
or the mic→UI pipeline shape. Prefer area pages for normal features.

## See also

- [patterns-and-rules.md](patterns-and-rules.md) · [audio.md](audio.md) · [state.md](state.md) · [file-index.md](file-index.md)
