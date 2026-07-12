import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'

import type { Tuning } from '../core/tunings'
import {
  mergePickerTunings,
  persistTuningToList,
  readCustomTunings,
} from '../storage/customTuningsStore'

import {
  createDeleteCustomHandler,
  createRenameCustomHandler,
  createSaveDraftHandler,
} from './customTuningActions'

export function useSavedTunings(
  tuning: Tuning,
  setTuning: Dispatch<SetStateAction<Tuning>>,
) {
  const [savedTunings, setSavedTunings] = useState<Tuning[]>(() => readCustomTunings())
  const [tuningsRevision, setTuningsRevision] = useState(0)

  const bumpTunings = useCallback(() => {
    setTuningsRevision((revision) => revision + 1)
  }, [])

  const pickerTunings = useMemo(
    () => mergePickerTunings(savedTunings, tuning),
    [savedTunings, tuning],
  )

  const refreshMyTunings = useCallback(() => {
    persistTuningToList(tuning)
    setSavedTunings((previous) => {
      const stored = readCustomTunings()
      const base = stored.length > 0 ? stored : previous
      return mergePickerTunings(base, tuning)
    })
    bumpTunings()
  }, [bumpTunings, tuning])

  const saveDraft = useCallback(
    (name: string) => {
      createSaveDraftHandler(tuning, setTuning, setSavedTunings, bumpTunings)(name)
    },
    [bumpTunings, setTuning, tuning],
  )

  const deleteCustom = useCallback(
    (id: string) => {
      createDeleteCustomHandler(setTuning, setSavedTunings, bumpTunings)(id)
    },
    [bumpTunings, setTuning],
  )

  const renameCustom = useCallback(
    (id: string, name: string) => {
      createRenameCustomHandler(setTuning, setSavedTunings, bumpTunings)(id, name)
    },
    [bumpTunings, setTuning],
  )

  return {
    pickerTunings,
    tuningsRevision,
    saveDraft,
    deleteCustom,
    renameCustom,
    refreshMyTunings,
  }
}
