import { useCallback, useState } from 'react'

import { usePitch } from '../audio/usePitch'
import { pitchesEqual, type Pitch } from '../core/music'
import { analyze, analyzeString, type StringAnalysis, type Tuning } from '../core/tunings'
import { DRAFT_TUNING_ID } from '../core/tunings/custom'
import {
  myTuningsForPicker,
  readActiveTuning,
  writeActiveTuning,
} from '../storage/customTuningsStore'

import { defaultTuning } from './tuningDefaults'
import { useCustomTuningHandlers } from './useCustomTuningHandlers'
import { useStableAnalysis } from './useStableAnalysis'

export { DRAFT_TUNING_ID }

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

export interface TunerState {
  tuning: Tuning
  tuningsRevision: number
  myTunings: Tuning[]
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
  const [tuning, setTuning] = useState<Tuning>(
    () => readActiveTuning() ?? defaultTuning(),
  )
  const [tuningsRevision, setTuningsRevision] = useState(0)
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)
  const pitch = usePitch()

  const bumpTunings = useCallback(() => {
    setTuningsRevision((revision) => revision + 1)
  }, [])

  const { saveDraft, deleteCustom, renameCustom } = useCustomTuningHandlers(
    setTuning,
    bumpTunings,
  )

  void tuningsRevision
  const myTunings = myTuningsForPicker(tuning)

  const rawAnalysis = computeAnalysis(pitch.frequency, tuning, manualStringIndex)
  const scope = `${tuning.id}:${manualStringIndex === null ? 'auto' : String(manualStringIndex)}`
  const analysis = useStableAnalysis(rawAnalysis, pitch.clarity, pitch.frequency, scope)

  const selectTuning = useCallback((next: Tuning) => {
    setTuning(next)
    setManualStringIndex(null)
    writeActiveTuning(next)
  }, [])

  const editString = useCallback((index: number, notePitch: Pitch) => {
    setTuning((prev) => withEditedString(prev, index, notePitch))
  }, [])

  return {
    tuning,
    tuningsRevision,
    myTunings,
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
