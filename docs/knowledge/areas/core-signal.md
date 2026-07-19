# Core: signal

Tags: `stabilizer`, `pluck`, `signal`, `jitter`  
Path: `src/core/signal/`

## Role

Pure signal helpers: steady the needle for display, synthesize plucked tones for
reference audio and tests.

## Modules

| File                 | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `pitchStabilizer.ts` | Pure state machine: lock, attack damp, decay hold, unlock |
| `pluckedTone.ts`     | Karplus-Strong-style `synthesizePluck` + `normalizePluck` |
| `*.test.ts`          | Lock/unlock behavior; pluck energy shape                  |

## Stabilizer contracts (`pitchStabilizer.ts`)

| Constant                 | Value               | Meaning                               |
| ------------------------ | ------------------- | ------------------------------------- |
| `LOCK_READINGS`          | 2                   | Consecutive in-tune readings to latch |
| `ATTACK_MS`              | 200                 | Attack window for sharp damping       |
| `UNLOCK_CENTS`           | 14                  | Jump that breaks latch                |
| `DECAY_HOLD_MS`          | 450                 | Hold last reading after signal loss   |
| `SHARP_ATTACK_THRESHOLD` | 6                   | Cents above which attack damp applies |
| `SHARP_DAMPING`          | 0.35                | Multiply sharp cents during attack    |
| `MIN_CLARITY`            | 0.5                 | Ignore weaker updates                 |
| in-tune                  | `IN_TUNE_CENTS` (5) | From analyzer                         |

API: `initialPitchStabilizerState`, `stabilizePitchDisplay(input) → { cents, direction, state }`.

Wired from `src/state/useStableAnalysis.ts` (not from audio directly).

## Pluck synth

`synthesizePluck(frequency, sampleRate, durationSec)` + `normalizePluck` — used by
`src/audio/referenceTone.ts` and detector tests.

## Open when

Needle jitter, false unlocks, attack sharpness, reference/test tone synthesis.

## See also

- [core-tunings.md](core-tunings.md) — `IN_TUNE_CENTS` / direction
- [state.md](state.md) — `useStableAnalysis`
- [audio.md](audio.md) — reference tone + raw pitch
