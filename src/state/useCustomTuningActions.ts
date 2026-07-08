import { useCallback, useRef } from 'react'

import type { Tuning } from '../core/tunings'
import { listCustom, remove as removeStored } from '../storage/tuningStore'

import { defaultTuning } from './tuningDefaults'
import { renameStoredTuning } from './renameStoredTuning'
import { saveDraftTuning } from './saveDraftTuning'

interface CustomTuningActions {
  saveDraft: (name: string) => void
  deleteCustom: (id: string) => void
  renameCustom: (id: string, name: string) => void
  resetSaveDraft: () => void
}

export function useCustomTuningActions(
  setTuning: (value: Tuning | ((prev: Tuning) => Tuning)) => void,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): CustomTuningActions {
  const pendingSaveRef = useRef<Tuning | null>(null)

  const resetSaveDraft = useCallback(() => {
    pendingSaveRef.current = null
  }, [])

  const saveDraft = useCallback(
    (name: string) => {
      setTuning((prev) => {
        const saved = saveDraftTuning(
          prev,
          name,
          pendingSaveRef.current,
          setCustomTunings,
        )
        pendingSaveRef.current = saved
        return saved
      })
    },
    [setTuning, setCustomTunings],
  )

  const deleteCustom = useCallback(
    (id: string) => {
      removeStored(id)
      setCustomTunings(listCustom())
      pendingSaveRef.current = null
      setTuning((prev) => (prev.id === id ? defaultTuning() : prev))
    },
    [setTuning, setCustomTunings],
  )

  const renameCustom = useCallback(
    (id: string, name: string) => {
      const updated = renameStoredTuning(id, name, setCustomTunings)
      if (!updated) {
        return
      }
      setTuning((prev) => (prev.id === id ? updated : prev))
      if (pendingSaveRef.current?.id === id) {
        pendingSaveRef.current = updated
      }
    },
    [setTuning, setCustomTunings],
  )

  return { saveDraft, deleteCustom, renameCustom, resetSaveDraft }
}
