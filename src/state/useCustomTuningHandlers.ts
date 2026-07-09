import { useCallback, type Dispatch, type SetStateAction } from 'react'

import type { Tuning } from '../core/tunings'
import {
  createCustomId,
  deleteCustomTuning,
  renameCustomTuning,
  saveCustomTuning,
} from '../storage/customTuningsStore'

import { defaultTuning } from './tuningDefaults'

export function useCustomTuningHandlers(
  setTuning: Dispatch<SetStateAction<Tuning>>,
  bumpTunings: () => void,
) {
  const saveDraft = useCallback(
    (name: string) => {
      setTuning((prev) => {
        const saved: Tuning = { ...prev, id: createCustomId(), name }
        saveCustomTuning(saved)
        return saved
      })
      bumpTunings()
    },
    [bumpTunings, setTuning],
  )

  const deleteCustom = useCallback(
    (id: string) => {
      deleteCustomTuning(id)
      setTuning((prev) => (prev.id === id ? defaultTuning() : prev))
      bumpTunings()
    },
    [bumpTunings, setTuning],
  )

  const renameCustom = useCallback(
    (id: string, name: string) => {
      const updated = renameCustomTuning(id, name)
      if (!updated) {
        return
      }
      setTuning((prev) => (prev.id === id ? updated : prev))
      bumpTunings()
    },
    [bumpTunings, setTuning],
  )

  return { saveDraft, deleteCustom, renameCustom }
}
