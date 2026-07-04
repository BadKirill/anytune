import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tuning } from '../core/tunings'
import { listCustom, remove, save } from './tuningStore'

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

const TUNING: Tuning = {
  id: 'custom-1',
  name: 'Demiurge',
  instrument: 'bass',
  strings: [
    { pitch: { note: 'F', octave: 1 } },
    { pitch: { note: 'A#', octave: 1 } },
    { pitch: { note: 'D#', octave: 2 } },
    { pitch: { note: 'G#', octave: 2 } },
  ],
}

describe('tuningStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
  })

  it('starts empty', () => {
    expect(listCustom()).toEqual([])
  })

  it('saves and lists a tuning', () => {
    save(TUNING)
    expect(listCustom()).toEqual([TUNING])
  })

  it('replaces a tuning saved with the same id', () => {
    save(TUNING)
    save({ ...TUNING, name: 'Renamed' })
    expect(listCustom()).toHaveLength(1)
    expect(listCustom()[0]?.name).toBe('Renamed')
  })

  it('removes a tuning by id', () => {
    save(TUNING)
    remove(TUNING.id)
    expect(listCustom()).toEqual([])
  })

  it('recovers from corrupted storage', () => {
    localStorage.setItem('anytune.customTunings', 'not json {')
    expect(listCustom()).toEqual([])
  })
})
