import { useCallback } from 'react'

import type { Tuning } from '../core/tunings'
import {
  listCustom,
  remove as removeStored,
  save as saveStored,
} from '../storage/tuningStore'

import { upsertCustomTuning } from './customTunings'
import { defaultTuning } from './tuningDefaults'

interface CustomTuningActions {
  saveDraft: (name: string) => void
  deleteCustom: (id: string) => void
  renameCustom: (id: string, name: string) => void
}

export function useCustomTuningActions(
  tuning: Tuning,
  setTuning: (value: Tuning | ((prev: Tuning) => Tuning)) => void,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): CustomTuningActions {
  const saveDraft = useCallback(
    (name: string) => {
      const saved: Tuning = { ...tuning, id: `custom-${String(Date.now())}`, name }
      saveStored(saved)
      setCustomTunings((prev) => upsertCustomTuning(prev, saved))
      setTuning(saved)
    },
    [tuning, setTuning, setCustomTunings],
  )

  const deleteCustom = useCallback(
    (id: string) => {
      removeStored(id)
      setCustomTunings(listCustom())
      setTuning((prev) => (prev.id === id ? defaultTuning() : prev))
    },
    [setTuning, setCustomTunings],
  )

  const renameCustom = useCallback(
    (id: string, name: string) => {
      const existing = listCustom().find((t) => t.id === id)
      if (!existing) {
        return
      }
      const updated: Tuning = { ...existing, name }
      saveStored(updated)
      setCustomTunings((prev) => upsertCustomTuning(prev, updated))
      setTuning((prev) => (prev.id === id ? updated : prev))
    },
    [setTuning, setCustomTunings],
  )

  return { saveDraft, deleteCustom, renameCustom }
}
