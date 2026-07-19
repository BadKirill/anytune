# State

Tags: `state`, `hooks`, `useTunerState`  
Path: `src/state/`

## Role

Compose tuner screen state without Redux/Zustand. Single hook surface for `App`.

## Modules

| File                     | Role                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `appState.ts`            | `useTunerState`, `TunerState`, draft edit, analysis routing |
| `useSavedTunings.ts`     | Custom list, picker merge, save/delete/rename               |
| `useStableAnalysis.ts`   | Raw analysis + clarity/freq → `stabilizePitchDisplay`       |
| `customTuningActions.ts` | Factories: save draft / delete / rename                     |
| `tuningDefaults.ts`      | `defaultTuning()` from presets                              |

## `TunerState` surface

- Data: `tuning`, `pickerTunings`, `tuningsRevision`, `manualStringIndex`, `analysis`, `pitch`
- Actions: `selectTuning`, `selectString`, `editString`, `saveDraft`, `deleteCustom`, `renameCustom`, `refreshMyTunings`

## Analysis routing

```
frequency + tuning + manualStringIndex
  → null frequency? null
  → manual null? analyze(frequency, tuning)
  → else analyzeString(frequency, tuning, index)
  → useStableAnalysis(..., scope=`${tuning.id}:${auto|index}`)
```

Scope reset clears stabilizer latch when tuning/mode changes.

## Draft lifecycle

1. `editString` → `withEditedString`: if pitch changed, set `id = custom-draft`,
   name `Custom` (keep name if already draft).
2. `saveDraft(name)` (via saved-tunings actions) persists through storage and
   selects the saved tuning.
3. `selectTuning` writes active tuning to storage and clears manual string.

## Patterns

- Hook composition only — no global store.
- Storage + core predicates stay out of components.

## Open when

Mode switching, draft lifecycle, picker contents, analysis wiring to UI.

## See also

- [audio.md](audio.md) — `usePitch`
- [core-tunings.md](core-tunings.md) — analyze / draft ids
- [core-signal.md](core-signal.md) — stabilizer
- [storage.md](storage.md) — persistence
- [components.md](components.md) — consumers
