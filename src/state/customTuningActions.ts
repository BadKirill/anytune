import type { Dispatch, SetStateAction } from 'react'

import type { Tuning } from '../core/tunings'
import {
  createCustomId,
  deleteCustomTuning,
  renameCustomTuning,
  saveCustomTuning,
  upsertInList,
} from '../storage/customTuningsStore'

import { defaultTuning } from './tuningDefaults'

export function createSaveDraftHandler(
  tuning: Tuning,
  setTuning: Dispatch<SetStateAction<Tuning>>,
  setSavedTunings: Dispatch<SetStateAction<Tuning[]>>,
  bumpTunings: () => void,
): (name: string) => void {
  return (name: string) => {
    const trimmed = name.trim()
    if (trimmed === '') {
      return
    }
    const saved: Tuning = { ...tuning, id: createCustomId(), name: trimmed }
    saveCustomTuning(saved)
    setTuning(saved)
    setSavedTunings((list) => upsertInList(list, saved))
    bumpTunings()
  }
}

export function createDeleteCustomHandler(
  setTuning: Dispatch<SetStateAction<Tuning>>,
  setSavedTunings: Dispatch<SetStateAction<Tuning[]>>,
  bumpTunings: () => void,
): (id: string) => void {
  return (id: string) => {
    deleteCustomTuning(id)
    setSavedTunings((list) => list.filter((entry) => entry.id !== id))
    setTuning((prev) => (prev.id === id ? defaultTuning() : prev))
    bumpTunings()
  }
}

export function createRenameCustomHandler(
  setTuning: Dispatch<SetStateAction<Tuning>>,
  setSavedTunings: Dispatch<SetStateAction<Tuning[]>>,
  bumpTunings: () => void,
): (id: string, name: string) => void {
  return (id: string, name: string) => {
    const updated = renameCustomTuning(id, name)
    if (!updated) {
      return
    }
    setSavedTunings((list) => upsertInList(list, updated))
    setTuning((prev) => (prev.id === id ? updated : prev))
    bumpTunings()
  }
}
