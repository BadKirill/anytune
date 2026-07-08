import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isSavedCustomTuning, PRESET_TUNINGS, type Tuning } from '../core/tunings'

import {
  buildMyTuningsList,
  mergeStoredCustomTunings,
  upsertCustomTuning,
} from './customTunings'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => {
      data.clear()
    },
    key: () => null,
    get length() {
      return data.size
    },
  }
}

const SAVED: Tuning = {
  id: 'custom-1',
  name: 'Test',
  instrument: 'guitar',
  strings: [{ pitch: { note: 'E', octave: 2 } }],
}

describe('customTunings', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
    vi.stubGlobal('sessionStorage', memoryStorage())
  })

  it('adds the active saved tuning when the list is stale', () => {
    expect(buildMyTuningsList([], SAVED)).toEqual([SAVED])
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
      buildMyTuningsList([], {
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
