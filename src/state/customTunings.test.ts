import { describe, expect, it } from 'vitest'

import { isSavedCustomTuning, PRESET_TUNINGS, type Tuning } from '../core/tunings'

import {
  customTuningsForMenu,
  mergeStoredCustomTunings,
  upsertCustomTuning,
} from './customTunings'

const SAVED: Tuning = {
  id: 'custom-1',
  name: 'Test',
  instrument: 'guitar',
  strings: [{ pitch: { note: 'E', octave: 2 } }],
}

describe('customTunings', () => {
  it('adds the active saved tuning when the list is stale', () => {
    expect(customTuningsForMenu([], SAVED)).toEqual([SAVED])
  })

  it('keeps in-memory tunings when storage is empty', () => {
    expect(mergeStoredCustomTunings([], [SAVED])).toEqual([SAVED])
  })

  it('upserts by id', () => {
    const renamed = { ...SAVED, name: 'Renamed' }
    expect(upsertCustomTuning([SAVED], renamed)).toEqual([renamed])
  })

  it('includes any non-preset active tuning', () => {
    expect(
      customTuningsForMenu([], {
        ...SAVED,
        id: 'user-tuning-99',
        name: 'Test 28383',
      }),
    ).toHaveLength(1)
    const preset = PRESET_TUNINGS[0]
    if (preset) {
      expect(isSavedCustomTuning(preset)).toBe(false)
    }
  })
})
