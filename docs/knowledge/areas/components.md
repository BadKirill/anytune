# Components / UI

Tags: `ui`, `gauge`, `picker`, `sheet`, `strings`  
Paths: `src/components/`, `src/App.tsx`, `src/App.css`, `src/index.css`

## Composition

`App.tsx` owns modal union (`none` | `presets` | `edit`) and lays out:

Header (title + tuning name) → TunerGauge → TuneDirectionHint → ModeControls →
StringList → InstallHint → modals (PresetPicker / NotePicker).

## Components

| File                                           | Role                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `TunerGauge.tsx`                               | SVG needle ±50¢, green in-tune                                   |
| `StringList.tsx`                               | String buttons + thickness gauge; auto highlight / manual select |
| `TuneDirectionHint.tsx`                        | Direction / idle / mic error copy                                |
| `PresetPicker.tsx`                             | Presets by instrument + My tunings + save draft                  |
| `CustomTuningList.tsx` / `CustomTuningRow.tsx` | Saved customs: rename/delete/swipe                               |
| `NotePicker.tsx`                               | Note + octave chips in Sheet                                     |
| `Sheet.tsx`                                    | Bottom sheet modal shell                                         |
| `SwipeableRow.tsx` + `useSwipeOffset.ts`       | Reveal edit/delete actions                                       |
| `TextField.tsx`                                | Named input for save/rename                                      |
| `InstallHint.tsx`                              | iOS add-to-home; dismissed via localStorage                      |
| `useLockBodyScroll.ts`                         | Lock scroll when sheet open                                      |
| `strings.ts`                                   | **All** user-facing English strings (`UI`)                       |

## Patterns

- Touch-first chips/buttons; dark theme in CSS.
- Localization-ready: never hardcode user copy outside `strings.ts`.
- Presentational components; side effects live in state/audio/storage.

## Open when

Layout, gauge feel, picker lists, swipe UX, install hint, copy changes.

## See also

- [state.md](state.md) · [core-tunings.md](core-tunings.md) · UI copy in `src/components/strings.ts`
