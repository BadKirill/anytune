import type { Tuning } from '../core/tunings'

const DRAFT_TUNING_ID = 'custom-draft'

/** True for persisted user tunings, not the unsaved draft. */
export function isSavedCustomTuning(tuning: Tuning): boolean {
  return tuning.id.startsWith('custom-') && tuning.id !== DRAFT_TUNING_ID
}

export function upsertCustomTuning(list: Tuning[], tuning: Tuning): Tuning[] {
  return [...list.filter((entry) => entry.id !== tuning.id), tuning]
}

/** Ensures the active saved tuning appears in the picker even if state was stale. */
export function customTuningsForMenu(list: Tuning[], active: Tuning): Tuning[] {
  const merged = isSavedCustomTuning(active) ? upsertCustomTuning(list, active) : list
  return merged.filter((entry) => isSavedCustomTuning(entry))
}
