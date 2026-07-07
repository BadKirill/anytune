import type { Tuning } from '../core/tunings'
import { isSavedCustomTuning } from '../core/tunings/custom'

const STORAGE_KEY = 'anytune.customTunings'
const VERSION = 1

interface StoredTunings {
  v: number
  tunings: Tuning[]
}

function emptyStore(): StoredTunings {
  return { v: VERSION, tunings: [] }
}

function normaliseStored(raw: unknown): StoredTunings {
  if (!raw || typeof raw !== 'object') {
    return emptyStore()
  }

  if (Array.isArray(raw)) {
    return { v: VERSION, tunings: raw.filter(isValidTuning) }
  }

  const record = raw as Partial<StoredTunings>
  if (!Array.isArray(record.tunings)) {
    return emptyStore()
  }

  return {
    v: record.v === VERSION ? VERSION : VERSION,
    tunings: record.tunings.filter(isValidTuning),
  }
}

function isValidTuning(value: unknown): value is Tuning {
  if (!value || typeof value !== 'object') {
    return false
  }
  const tuning = value as Partial<Tuning>
  return (
    typeof tuning.id === 'string' &&
    typeof tuning.name === 'string' &&
    (tuning.instrument === 'guitar' || tuning.instrument === 'bass') &&
    Array.isArray(tuning.strings)
  )
}

function load(): StoredTunings {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return emptyStore()
  }
  try {
    return normaliseStored(JSON.parse(raw) as unknown)
  } catch {
    return emptyStore()
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

/** Lists user-saved custom tunings. */
export function listCustom(): Tuning[] {
  return load().tunings.filter(isSavedCustomTuning)
}

/** Saves a custom tuning, replacing any existing one with the same id. */
export function save(tuning: Tuning): boolean {
  if (!isSavedCustomTuning(tuning)) {
    return false
  }
  const data = load()
  data.tunings = [...data.tunings.filter((entry) => entry.id !== tuning.id), tuning]
  return persist(data)
}

/** Removes a custom tuning by id. */
export function remove(id: string): void {
  const data = load()
  data.tunings = data.tunings.filter((entry) => entry.id !== id)
  persist(data)
}
