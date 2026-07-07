import { isSavedCustomTuning, type Tuning } from '../core/tunings'

export function upsertCustomTuning(list: Tuning[], tuning: Tuning): Tuning[] {
  return [...list.filter((entry) => entry.id !== tuning.id), tuning]
}

function mergeUniqueCustom(...groups: Tuning[][]): Tuning[] {
  const merged: Tuning[] = []
  for (const group of groups) {
    for (const tuning of group) {
      if (!isSavedCustomTuning(tuning)) {
        continue
      }
      if (!merged.some((entry) => entry.id === tuning.id)) {
        merged.push(tuning)
      }
    }
  }
  return merged
}

/** Builds the My tunings list from storage, React state, and the active tuning. */
export function customTuningsForMenu(list: Tuning[], active: Tuning): Tuning[] {
  return mergeUniqueCustom(list, isSavedCustomTuning(active) ? [active] : [])
}

/** Merges freshly loaded storage with in-memory tunings so nothing disappears. */
export function mergeStoredCustomTunings(stored: Tuning[], inMemory: Tuning[]): Tuning[] {
  return mergeUniqueCustom(stored, inMemory)
}
