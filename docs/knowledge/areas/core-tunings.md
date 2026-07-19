# Core: tunings

Tags: `tuning`, `preset`, `analyzer`, `custom`, `draft`  
Path: `src/core/tunings/`

## Role

Tuning model, built-in presets, nearest-string analysis, custom/draft predicates.

## Types (`types.ts`)

- `Instrument = 'guitar' | 'bass'`
- `InstrumentString = { pitch: Pitch }`
- `Tuning = { id, name, instrument, strings }`

## Modules

| File          | Key API                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `presets.ts`  | `PRESET_TUNINGS`, `DEFAULT_TUNING_ID` (`guitar-standard`)                                                                |
| `analyzer.ts` | `IN_TUNE_CENTS = 5`, `analyze`, `analyzeString`, `TuneDirection`, `StringAnalysis`                                       |
| `custom.ts`   | `DRAFT_TUNING_ID`, `isSavedCustomTuning`, `isDraftTuning`, `isUnmodifiedPreset`, `belongsInMyTunings`, `appearsInPicker` |
| `index.ts`    | barrel                                                                                                                   |

## Analyzer behavior

- Auto: nearest target on log-frequency scale → cents + direction.
- Manual: fixed string index via `analyzeString`.
- Direction: `tighten` (flat) / `loosen` (sharp) / `in-tune` (|¢| ≤ 5).

## Custom / draft rules

- Edits flip id to `custom-draft` until saved (state layer).
- `belongsInMyTunings` / `appearsInPicker` gate what shows in PresetPicker lists.

## Open when

New presets, in-tune threshold, string matching, draft/My tunings membership.
Storage and state depend on these predicates — keep them in sync.

## See also

- [core-music.md](core-music.md) · [storage.md](storage.md) · [state.md](state.md) · [components.md](components.md)
