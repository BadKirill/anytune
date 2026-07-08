import { describe, expect, it } from 'vitest'

import { appearsInMyTunings, isSavedCustomTuning } from './custom'
import { PRESET_TUNINGS } from './presets'
import type { Tuning } from './types'

const SAVED: Tuning = {
  id: 'custom-1',
  name: 'Test',
  instrument: 'guitar',
  strings: [{ pitch: { note: 'E', octave: 2 } }],
}

describe('isSavedCustomTuning', () => {
  it('accepts saved custom ids and rejects presets and draft', () => {
    const preset = PRESET_TUNINGS[0]
    expect(preset).toBeDefined()
    expect(isSavedCustomTuning(SAVED)).toBe(true)
    if (preset) {
      expect(isSavedCustomTuning(preset)).toBe(false)
    }
    expect(
      isSavedCustomTuning({
        ...SAVED,
        id: 'custom-draft',
      }),
    ).toBe(false)
  })
})

describe('appearsInMyTunings', () => {
  it('includes saved customs and renamed legacy preset entries', () => {
    const preset = PRESET_TUNINGS[0]
    expect(appearsInMyTunings(SAVED)).toBe(true)
    if (preset) {
      expect(appearsInMyTunings(preset)).toBe(false)
      expect(appearsInMyTunings({ ...preset, name: 'Test23' })).toBe(true)
    }
  })
})
