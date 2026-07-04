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

function persist(data: StoredTunings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Lists user-saved custom tunings. */
export function listCustom(): Tuning[] {
  return load().tunings
}

/** Saves a custom tuning, replacing any existing one with the same id. */
export function save(tuning: Tuning): void {
  const data = load()
  data.tunings = [...data.tunings.filter((t) => t.id !== tuning.id), tuning]
  persist(data)
}

/** Removes a custom tuning by id. */
export function remove(id: string): void {
  const data = load()
  data.tunings = data.tunings.filter((t) => t.id !== id)
  persist(data)
}
