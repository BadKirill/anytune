import type { Tuning } from '../core/tunings'

const STORAGE_KEY = 'anytune.customTunings'
const VERSION = 1

interface StoredTunings {
  v: number
  tunings: Tuning[]
}

function load(): StoredTunings {
  const empty: StoredTunings = { v: VERSION, tunings: [] }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return empty
  }
  try {
    const parsed = JSON.parse(raw) as StoredTunings
    return parsed.v === VERSION && Array.isArray(parsed.tunings) ? parsed : empty
  } catch {
    return empty
  }
}

function persist(data: StoredTunings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function isStoredCustomTuning(tuning: Tuning): boolean {
  return tuning.id.startsWith('custom-') && tuning.id !== 'custom-draft'
}

/** Lists user-saved custom tunings. */
export function listCustom(): Tuning[] {
  return load().tunings.filter(isStoredCustomTuning)
}

/** Saves a custom tuning, replacing any existing one with the same id. */
export function save(tuning: Tuning): boolean {
  const data = load()
  data.tunings = [...data.tunings.filter((t) => t.id !== tuning.id), tuning]
  return persist(data)
}

/** Removes a custom tuning by id. */
export function remove(id: string): void {
  const data = load()
  data.tunings = data.tunings.filter((t) => t.id !== id)
  persist(data)
}
