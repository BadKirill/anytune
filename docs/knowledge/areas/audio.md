# Audio pipeline

Tags: `mic`, `worklet`, `pitchy`, `agc`, `reference-tone`  
Path: `src/audio/`

## Hard constraints

- `getUserMedia` audio: **echoCancellation / noiseSuppression / autoGainControl = false**
- Analysis window: **8192** samples (`capture-processor.ts`, pitchy)
- Usable band: **25–1000 Hz** (`MIN_FREQUENCY_HZ` / `MAX_FREQUENCY_HZ`)

## Clarity gate (`minClarityFor`)

| Frequency   | Min clarity |
| ----------- | ----------- |
| &lt; 60 Hz  | 0.82        |
| &lt; 100 Hz | 0.86        |
| else        | 0.90        |

Bass fundamentals get a slightly lower bar; still reject weak detections.

## Pipeline modules

| File                   | Role                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `micStream.ts`         | Start session, typed `MicError` / `MicStreamError`, AudioContext + worklet |
| `capture-processor.ts` | Ring buffer; post Float32 window every ~4096 frames (~85 ms @ 48 kHz)      |
| `pitchDetector.ts`     | `detectPitch`, `minClarityFor`, `frequencyJumpCents`                       |
| `micWindowHandler.ts`  | Median of last 5; reject jumps &gt; 150¢ unless stable                     |
| `micSessionControl.ts` | `beginMicSession` / `stopMicSession` (status + teardown)                   |
| `useMicControls.ts`    | Hook wiring start/stop + resume                                            |
| `usePitch.ts`          | Public `{ status, error, frequency, clarity, start, stop }`                |
| `pitchState.ts`        | `PitchStatus`, `PitchState`                                                |
| `pitchGate.ts`         | Suppress detection while reference tone plays                              |
| `referenceTone.ts`     | Plucked reference note (uses `core/signal/pluckedTone`)                    |
| `appResume.ts`         | Visibility / pageshow resume handlers                                      |
| `worklet-types.d.ts`   | Worklet typings                                                            |

## Session lifecycle

`idle` → `starting` (`beginMicSession`) → `listening` | `error`  
`stopMicSession` clears refs, stops worklet/tracks, returns `idle`.

On audio graph end, mic stream may schedule `restart` via timeout if still active.

## Patterns

- Worklet posts windows; main thread detects pitch — no UI here.
- Components call `state.pitch.start/stop` only.
- Tests: `pitchDetector.test.ts` with synthesized plucks including F1.

## Open when

Mic permission UX, detection quality, window size, AGC mistakes, start/stop bugs,
reference tone interference with listening.

## See also

- [core-signal.md](core-signal.md) — pluck synth + display stabilizer (via state)
- [core-music.md](core-music.md) — Hz / cents math
- [state.md](state.md) — consumes `usePitch`
- [testing.md](testing.md) — oscillator mic stub
