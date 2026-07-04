import { useCallback, useMemo, useState } from 'react'

import { usePitch } from '../audio/usePitch'
import type { Pitch } from '../core/music'
import {
  analyze,
  analyzeString,
  DEFAULT_TUNING_ID,
  PRESET_TUNINGS,
  type StringAnalysis,
  type Tuning,
} from '../core/tunings'
import {
  listCustom,
  remove as removeStored,
  save as saveStored,
} from '../storage/tuningStore'

export const DRAFT_TUNING_ID = 'custom-draft'

function defaultTuning(): Tuning {
  const preset =
    PRESET_TUNINGS.find((t) => t.id === DEFAULT_TUNING_ID) ?? PRESET_TUNINGS[0]
  if (!preset) {
    throw new Error('No preset tunings defined')
  }
  return preset
}

function withEditedString(prev: Tuning, index: number, notePitch: Pitch): Tuning {
  return {
    ...prev,
    id: DRAFT_TUNING_ID,
    name: prev.id === DRAFT_TUNING_ID ? prev.name : 'Custom',
    strings: prev.strings.map((s, i) => (i === index ? { pitch: notePitch } : s)),
  }
}

export interface TunerState {
  tuning: Tuning
  customTunings: Tuning[]
  /** null = auto mode: the analyzer picks the closest string. */
  manualStringIndex: number | null
  analysis: StringAnalysis | null
  pitch: ReturnType<typeof usePitch>
  selectTuning: (tuning: Tuning) => void
  selectString: (index: number | null) => void
  editString: (index: number, pitch: Pitch) => void
  saveDraft: (name: string) => void
  deleteCustom: (id: string) => void
}

/** Single source of truth for the tuner screen. */
export function useTunerState(): TunerState {
  const [tuning, setTuning] = useState<Tuning>(defaultTuning)
  const [customTunings, setCustomTunings] = useState<Tuning[]>(listCustom)
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)
  const pitch = usePitch()

  const analysis = useMemo(() => {
    if (pitch.frequency === null) {
      return null
    }
    return manualStringIndex === null
      ? analyze(pitch.frequency, tuning)
      : analyzeString(pitch.frequency, tuning, manualStringIndex)
  }, [pitch.frequency, tuning, manualStringIndex])

  const selectTuning = useCallback((next: Tuning) => {
    setTuning(next)
    setManualStringIndex(null)
  }, [])

  const editString = useCallback((index: number, notePitch: Pitch) => {
    setTuning((prev) => withEditedString(prev, index, notePitch))
  }, [])

  const saveDraft = useCallback(
    (name: string) => {
      const saved: Tuning = { ...tuning, id: `custom-${String(Date.now())}`, name }
      saveStored(saved)
      setCustomTunings(listCustom())
      setTuning(saved)
    },
    [tuning],
  )

  const deleteCustom = useCallback((id: string) => {
    removeStored(id)
    setCustomTunings(listCustom())
  }, [])

  return {
    tuning,
    customTunings,
    manualStringIndex,
    analysis,
    pitch,
    selectTuning,
    selectString: setManualStringIndex,
    editString,
    saveDraft,
    deleteCustom,
  }
}
