import type { Tuning } from '../core/tunings'
import {
  listCustom,
  persistLastActiveTuning,
  save as saveStored,
} from '../storage/tuningStore'

import { upsertCustomTuning } from './customTunings'

export function renameStoredTuning(
  id: string,
  name: string,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): Tuning | null {
  const existing = listCustom().find((t) => t.id === id)
  if (!existing) {
    return null
  }
  const updated: Tuning = { ...existing, name }
  saveStored(updated)
  persistLastActiveTuning(updated)
  setCustomTunings((prev) => upsertCustomTuning(prev, updated))
  return updated
}
