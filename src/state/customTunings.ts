import { appearsInMyTunings, type Tuning } from '../core/tunings'
import { listCustom, loadLastActiveTuning } from '../storage/tuningStore'

export function upsertCustomTuning(list: Tuning[], tuning: Tuning): Tuning[] {
  return [...list.filter((entry) => entry.id !== tuning.id), tuning]
}

function mergeUniqueForMenu(...groups: Tuning[][]): Tuning[] {
  const merged: Tuning[] = []
  for (const group of groups) {
    for (const tuning of group) {
      if (!appearsInMyTunings(tuning)) {
        continue
      }
      if (!merged.some((entry) => entry.id === tuning.id)) {
        merged.push(tuning)
      }
    }
  }
  return merged
}

/** Builds My tunings from storage, React state, last active, and the live selection. */
export function buildMyTuningsList(inMemory: Tuning[], active: Tuning): Tuning[] {
  const lastActive = loadLastActiveTuning()
  const groups: Tuning[][] = [listCustom(), inMemory]
  if (lastActive) {
    groups.push([lastActive])
  }
  if (appearsInMyTunings(active)) {
    groups.push([active])
  }
  return mergeUniqueForMenu(...groups)
}

/** @deprecated Use buildMyTuningsList — kept for tests. */
export function customTuningsForMenu(list: Tuning[], active: Tuning): Tuning[] {
  return buildMyTuningsList(list, active)
}

function mergeUniqueCustom(...groups: Tuning[][]): Tuning[] {
  const merged: Tuning[] = []
  for (const group of groups) {
    for (const tuning of group) {
      if (!appearsInMyTunings(tuning)) {
        continue
      }
      if (!merged.some((entry) => entry.id === tuning.id)) {
        merged.push(tuning)
      }
    }
  }
  return merged
}

/** Merges freshly loaded storage with in-memory tunings so nothing disappears. */
export function mergeStoredCustomTunings(stored: Tuning[], inMemory: Tuning[]): Tuning[] {
  return mergeUniqueCustom(stored, inMemory)
}
