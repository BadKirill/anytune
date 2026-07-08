import { useCallback, useRef } from 'react'

import type { Tuning } from '../core/tunings'
import { isSavedCustomTuning } from '../core/tunings'
import {
  listCustom,
  persistLastActiveTuning,
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
  setTuning: (value: Tuning | ((prev: Tuning) => Tuning)) => void,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): CustomTuningActions {
  const pendingSaveRef = useRef<Tuning | null>(null)

  const saveDraft = useCallback(
    (name: string) => {
      setTuning((prev) => {
        const pending = pendingSaveRef.current
        if (pending?.name === name && isSavedCustomTuning(pending)) {
          return pending
        }
        const saved: Tuning = { ...prev, id: `custom-${String(Date.now())}`, name }
        pendingSaveRef.current = saved
        saveStored(saved)
        persistLastActiveTuning(saved)
        setCustomTunings((list) => upsertCustomTuning(list, saved))
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
      const existing = listCustom().find((t) => t.id === id)
      if (!existing) {
        return
      }
      const updated: Tuning = { ...existing, name }
      saveStored(updated)
      persistLastActiveTuning(updated)
      setCustomTunings((prev) => upsertCustomTuning(prev, updated))
      setTuning((prev) => (prev.id === id ? updated : prev))
      if (pendingSaveRef.current?.id === id) {
        pendingSaveRef.current = updated
      }
    },
    [setTuning, setCustomTunings],
  )

  return { saveDraft, deleteCustom, renameCustom }
}
