import { describe, expect, it } from 'vitest'

import { initialPitchStabilizerState, stabilizePitchDisplay } from './pitchStabilizer'

const NOW = 1_000

function stabilize(
  state = initialPitchStabilizerState(),
  cents: number,
  clarity = 0.95,
  nowMs = NOW,
) {
  return stabilizePitchDisplay(state, {
    cents,
    direction: cents < -5 ? 'tighten' : cents > 5 ? 'loosen' : 'in-tune',
    clarity,
    nowMs,
    hasSignal: true,
  })
}

describe('stabilizePitchDisplay', () => {
  it('damps sharp attack transients', () => {
    const first = stabilize(undefined, 18, 0.95, NOW)
    expect(first.cents).toBeLessThan(18)
    expect(first.cents).toBeGreaterThan(6)
  })

  it('latches to center after consecutive in-tune readings', () => {
    const first = stabilize(undefined, 2, 0.95, NOW)
    const second = stabilize(first.state, 3, 0.95, NOW + 40)
    expect(second.cents).toBe(0)
    expect(second.direction).toBe('in-tune')
    expect(second.state.latched).toBe(true)
  })

  it('holds center through small flat drift while the note fades', () => {
    let state = initialPitchStabilizerState()
    state = stabilize(state, 1, 0.95, NOW).state
    state = stabilize(state, 2, 0.95, NOW + 40).state
    expect(state.latched).toBe(true)

    const decay = stabilizePitchDisplay(state, {
      cents: -10,
      direction: 'tighten',
      clarity: 0.95,
      nowMs: NOW + 80,
      hasSignal: true,
    })
    expect(decay.cents).toBe(0)
    expect(decay.direction).toBe('in-tune')
  })

  it('releases the latch after a large detune', () => {
    let state = initialPitchStabilizerState()
    state = stabilize(state, 0, 0.95, NOW).state
    state = stabilize(state, 1, 0.95, NOW + 40).state
    const unlocked = stabilize(state, 20, 0.95, NOW + 500)
    expect(unlocked.state.latched).toBe(false)
    expect(unlocked.cents).toBeGreaterThan(10)
  })
})
