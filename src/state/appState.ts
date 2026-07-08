import { useCallback, useMemo, useState } from 'react'

import { usePitch } from '../audio/usePitch'
import { pitchesEqual, type Pitch } from '../core/music'
import { analyze, analyzeString, type StringAnalysis, type Tuning } from '../core/tunings'
import {
  listCustom,
  loadLastActiveTuning,
  persistLastActiveTuning,
} from '../storage/tuningStore'

import { mergeStoredCustomTunings } from './customTunings'
import { defaultTuning } from './tuningDefaults'
import { useCustomTuningActions } from './useCustomTuningActions'
import { useStableAnalysis } from './useStableAnalysis'

export const DRAFT_TUNING_ID = 'custom-draft'

function withEditedString(prev: Tuning, index: number, notePitch: Pitch): Tuning {
  const current = prev.strings[index]?.pitch
  if (current && pitchesEqual(current, notePitch)) {
    return prev
  }
  return {
    ...prev,
    id: DRAFT_TUNING_ID,
    name: prev.id === DRAFT_TUNING_ID ? prev.name : 'Custom',
    strings: prev.strings.map((s, i) => (i === index ? { pitch: notePitch } : s)),
  }
}

function initialCustomTunings(): Tuning[] {
  const stored = listCustom()
  const last = loadLastActiveTuning()
  return last ? mergeStoredCustomTunings(stored, [last]) : stored
}

function initialTuning(): Tuning {
  return loadLastActiveTuning() ?? defaultTuning()
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
  refreshCustomTunings: () => void
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
  const [tuning, setTuning] = useState<Tuning>(initialTuning)
  const [customTunings, setCustomTunings] = useState<Tuning[]>(initialCustomTunings)
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)
  const pitch = usePitch()
  const { saveDraft, deleteCustom, renameCustom } = useCustomTuningActions(
    setTuning,
    setCustomTunings,
  )

  const rawAnalysis = useMemo(
    () => computeAnalysis(pitch.frequency, tuning, manualStringIndex),
    [pitch.frequency, tuning, manualStringIndex],
  )
  const scope = `${tuning.id}:${manualStringIndex === null ? 'auto' : String(manualStringIndex)}`
  const analysis = useStableAnalysis(rawAnalysis, pitch.clarity, pitch.frequency, scope)

  const selectTuning = useCallback((next: Tuning) => {
    setTuning(next)
    setManualStringIndex(null)
    persistLastActiveTuning(next)
  }, [])

  const editString = useCallback((index: number, notePitch: Pitch) => {
    setTuning((prev) => withEditedString(prev, index, notePitch))
  }, [])

  const refreshCustomTunings = useCallback(() => {
    setCustomTunings((prev) => {
      const stored = mergeStoredCustomTunings(listCustom(), prev)
      const last = loadLastActiveTuning()
      return last ? mergeStoredCustomTunings(stored, [last]) : stored
    })
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
    refreshCustomTunings,
  }
}
