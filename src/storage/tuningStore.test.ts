import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tuning } from '../core/tunings'
import {
  listCustom,
  loadLastActiveTuning,
  persistLastActiveTuning,
  remove,
  save,
} from './tuningStore'

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
    vi.stubGlobal('sessionStorage', memoryStorage())
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

  it('loads legacy array-only storage', () => {
    localStorage.setItem('anytune.customTunings', JSON.stringify([TUNING]))
    expect(listCustom()).toEqual([TUNING])
  })

  it('does not save built-in presets as custom tunings', () => {
    expect(
      save({
        id: 'guitar-standard',
        name: 'Test',
        instrument: 'guitar',
        strings: TUNING.strings,
      }),
    ).toBe(false)
    expect(listCustom()).toEqual([])
  })

  it('restores the last active custom tuning', () => {
    save(TUNING)
    persistLastActiveTuning(TUNING)
    expect(loadLastActiveTuning()).toEqual(TUNING)
  })

  it('falls back to session storage when local storage is empty', () => {
    sessionStorage.setItem(
      'anytune.customTunings.session',
      JSON.stringify({ v: 1, tunings: [TUNING] }),
    )
    expect(listCustom()).toEqual([TUNING])
  })

  it('normalizes string octaves when loading legacy storage', () => {
    localStorage.setItem(
      'anytune.customTunings',
      JSON.stringify([
        {
          ...TUNING,
          strings: [{ pitch: { note: 'F', octave: '1' } }],
        },
      ]),
    )
    expect(listCustom()).toEqual([
      {
        ...TUNING,
        strings: [{ pitch: { note: 'F', octave: 1 } }],
      },
    ])
  })

  it('restores last active tuning from session storage', () => {
    sessionStorage.setItem('anytune.lastActiveTuning.session', JSON.stringify(TUNING))
    expect(loadLastActiveTuning()).toEqual(TUNING)
  })
})
