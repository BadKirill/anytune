import { describe, expect, it } from 'vitest'

import { midiToFrequency, pitchToFrequency } from './frequency'
import { nearestPitch } from './nearestNote'
import type { Pitch } from './notes'

describe('nearestPitch', () => {
  it('maps exact A4 and E2 to themselves', () => {
    expect(nearestPitch(440)).toEqual<Pitch>({ note: 'A', octave: 4 })
    expect(nearestPitch(pitchToFrequency({ note: 'E', octave: 2 }))).toEqual<Pitch>({
      note: 'E',
      octave: 2,
    })
  })

  it('rounds a frequency between two semitones to the nearer note', () => {
    const a4 = midiToFrequency(69)
    const aSharp4 = midiToFrequency(70)
    const nearerA = a4 * 2 ** (20 / 1200)
    const nearerASharp = aSharp4 * 2 ** (-20 / 1200)
    expect(nearestPitch(nearerA)).toEqual<Pitch>({ note: 'A', octave: 4 })
    expect(nearestPitch(nearerASharp)).toEqual<Pitch>({ note: 'A#', octave: 4 })
  })

  it('detects low bass F1', () => {
    expect(nearestPitch(pitchToFrequency({ note: 'F', octave: 1 }))).toEqual<Pitch>({
      note: 'F',
      octave: 1,
    })
  })
})
