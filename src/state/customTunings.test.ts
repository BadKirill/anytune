import { describe, expect, it } from 'vitest'

import type { Tuning } from '../core/tunings'

import { DRAFT_TUNING_ID } from './appState'
import {
  customTuningsForMenu,
  isSavedCustomTuning,
  upsertCustomTuning,
} from './customTunings'

const SAVED: Tuning = {
  id: 'custom-1',
  name: 'Test',
  instrument: 'guitar',
  strings: [{ pitch: { note: 'E', octave: 2 } }],
}

const DRAFT: Tuning = {
  id: DRAFT_TUNING_ID,
  name: 'Custom',
  instrument: 'guitar',
  strings: [{ pitch: { note: 'E', octave: 2 } }],
}

describe('customTunings', () => {
  it('recognises saved custom tunings', () => {
    expect(isSavedCustomTuning(SAVED)).toBe(true)
    expect(isSavedCustomTuning(DRAFT)).toBe(false)
  })

  it('adds the active saved tuning when the list is stale', () => {
    expect(customTuningsForMenu([], SAVED)).toEqual([SAVED])
  })

  it('upserts by id', () => {
    const renamed = { ...SAVED, name: 'Renamed' }
    expect(upsertCustomTuning([SAVED], renamed)).toEqual([renamed])
  })
})
