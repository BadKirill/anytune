# Core: music

Tags: `music`, `midi`, `frequency`, `cents`, `notes`  
Path: `src/core/music/`

## Role

Pure music math. No React/DOM. Barrel: `index.ts` re-exports notes, frequency, cents.

## Modules

| File           | Exports / purpose                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `notes.ts`     | `NOTE_NAMES`, `NoteName`, `Pitch`, `pitchToMidi`, `midiToPitch`, `formatPitch`, `pitchesEqual` |
| `frequency.ts` | `midiToFrequency`, `frequencyToMidiFloat`, `pitchToFrequency` (A4=440, MIDI 69)                |
| `cents.ts`     | `centsBetween(actual, target)` — +sharp / −flat                                                |
| `*.test.ts`    | A4, E2, F1≈43.65, G#1, round-trips                                                             |

## Patterns

- Plain functions; constants for A4 and semitone math.
- `Pitch = { note, octave }`; MIDI C0 base used in conversions.

## Open when

Changing note naming, frequency formula, cents sign convention, or bass-range
expectations. Callers: tunings analyzer, pitch detector tests, UI labels.

## See also

- [core-tunings.md](core-tunings.md) · [audio.md](audio.md) · [components.md](components.md)
