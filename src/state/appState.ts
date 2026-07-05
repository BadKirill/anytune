import { useCallback, useMemo, useState } from 'react'

import { usePitch } from '../audio/usePitch'
import type { Pitch } from '../core/music'
import { analyze, analyzeString, type StringAnalysis, type Tuning } from '../core/tunings'
import { listCustom } from '../storage/tuningStore'

import { defaultTuning } from './tuningDefaults'
import { useCustomTuningActions } from './useCustomTuningActions'

export const DRAFT_TUNING_ID = 'custom-draft'

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
  renameCustom: (id: string, name: string) => void
}

function computeAnalysis(
  frequency: number | null,
  tuning: Tuning,
  manualStringIndex: number | null,
): StringAnalysis | null {
  if (frequency === null) {
    return null
  }
  return manualStringIndex === null
    ? analyze(frequency, tuning)
    : analyzeString(frequency, tuning, manualStringIndex)
}

/** Single source of truth for the tuner screen. */
export function useTunerState(): TunerState {
  const [tuning, setTuning] = useState<Tuning>(defaultTuning)
  const [customTunings, setCustomTunings] = useState<Tuning[]>(listCustom)
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)
  const pitch = usePitch()
  const { saveDraft, deleteCustom, renameCustom } = useCustomTuningActions(
    tuning,
    setTuning,
    setCustomTunings,
  )

  const analysis = useMemo(
    () => computeAnalysis(pitch.frequency, tuning, manualStringIndex),
    [pitch.frequency, tuning, manualStringIndex],
  )

  const selectTuning = useCallback((next: Tuning) => {
    setTuning(next)
    setManualStringIndex(null)
  }, [])

  const editString = useCallback((index: number, notePitch: Pitch) => {
    setTuning((prev) => withEditedString(prev, index, notePitch))
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
    renameCustom,
  }
}
