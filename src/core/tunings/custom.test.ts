import { describe, expect, it } from 'vitest'

import {
  belongsInMyTunings,
  isDraftTuning,
  isSavedCustomTuning,
  isUnmodifiedPreset,
} from './custom'
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

describe('belongsInMyTunings', () => {
  it('includes saved customs and edited presets but not drafts or bare presets', () => {
    const preset = PRESET_TUNINGS[0]
    expect(belongsInMyTunings(SAVED)).toBe(true)
    if (preset) {
      expect(belongsInMyTunings(preset)).toBe(false)
      expect(isUnmodifiedPreset(preset)).toBe(true)
      expect(belongsInMyTunings({ ...preset, name: 'Test23' })).toBe(true)
    }
    expect(
      belongsInMyTunings({
        ...SAVED,
        id: 'custom-draft',
        name: 'Custom',
      }),
    ).toBe(false)
    expect(isDraftTuning({ ...SAVED, id: 'custom-draft' })).toBe(true)
  })
})
