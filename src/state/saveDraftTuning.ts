import type { Tuning } from '../core/tunings'
import { isSavedCustomTuning } from '../core/tunings'
import { persistLastActiveTuning, save as saveStored } from '../storage/tuningStore'

import { upsertCustomTuning } from './customTunings'

function commitSavedTuning(
  saved: Tuning,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): Tuning {
  saveStored(saved)
  persistLastActiveTuning(saved)
  setCustomTunings((list) => upsertCustomTuning(list, saved))
  return saved
}

export function saveDraftTuning(
  prev: Tuning,
  name: string,
  pending: Tuning | null,
  setCustomTunings: (value: Tuning[] | ((prev: Tuning[]) => Tuning[])) => void,
): Tuning {
  if (pending?.name === name && isSavedCustomTuning(pending)) {
    const updated: Tuning = { ...prev, id: pending.id, name }
    return commitSavedTuning(updated, setCustomTunings)
  }
  const saved: Tuning = { ...prev, id: `custom-${String(Date.now())}`, name }
  return commitSavedTuning(saved, setCustomTunings)
}
