import type { Tuning } from '../core/tunings'
import { isSavedCustomTuning } from '../core/tunings/custom'

const STORAGE_KEY = 'anytune.customTunings'
const SESSION_KEY = 'anytune.customTunings.session'
const LAST_ACTIVE_KEY = 'anytune.lastActiveTuning'
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

function isValidString(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }
  const string = value as { pitch?: { note?: unknown; octave?: unknown } }
  const pitch = string.pitch
  return !!pitch && typeof pitch.note === 'string' && typeof pitch.octave === 'number'
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
    Array.isArray(tuning.strings) &&
    tuning.strings.length > 0 &&
    tuning.strings.every(isValidString)
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
    mirrorSession(data.tunings)
    return true
  } catch {
    return false
  }
}

function readSession(): Tuning[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) {
      return []
    }
    return normaliseStored(JSON.parse(raw) as unknown).tunings.filter(isSavedCustomTuning)
  } catch {
    return []
  }
}

function mirrorSession(tunings: Tuning[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ v: VERSION, tunings }))
  } catch {
    // sessionStorage may be unavailable in some embedded browsers
  }
}

function mergeUniqueSaved(...groups: Tuning[][]): Tuning[] {
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

/** Lists user-saved custom tunings. */
export function listCustom(): Tuning[] {
  return mergeUniqueSaved(load().tunings.filter(isSavedCustomTuning), readSession())
}

/** Restores the last active custom tuning for this device, if any. */
export function loadLastActiveTuning(): Tuning | null {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as unknown
    if (isValidTuning(parsed) && isSavedCustomTuning(parsed)) {
      return parsed
    }
  } catch {
    return null
  }
  return null
}

/** Remembers the active custom tuning so it survives reloads and picker refresh. */
export function persistLastActiveTuning(tuning: Tuning): void {
  if (!isSavedCustomTuning(tuning)) {
    try {
      localStorage.removeItem(LAST_ACTIVE_KEY)
    } catch {
      // ignore
    }
    return
  }
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(tuning))
  } catch {
    // ignore
  }
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
  if (loadLastActiveTuning()?.id === id) {
    try {
      localStorage.removeItem(LAST_ACTIVE_KEY)
    } catch {
      // ignore
    }
  }
}
