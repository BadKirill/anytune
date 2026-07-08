import type { Pitch } from '../core/music'
import type { Tuning } from '../core/tunings'
import { appearsInMyTunings, isSavedCustomTuning } from '../core/tunings/custom'

const STORAGE_KEY = 'anytune.customTunings'
const SESSION_KEY = 'anytune.customTunings.session'
const LAST_ACTIVE_KEY = 'anytune.lastActiveTuning'
const LAST_ACTIVE_SESSION_KEY = 'anytune.lastActiveTuning.session'
const VERSION = 1

interface StoredTunings {
  v: number
  tunings: Tuning[]
}

function emptyStore(): StoredTunings {
  return { v: VERSION, tunings: [] }
}

function parseOctave(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeString(value: unknown): Tuning['strings'][number] | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const pitch = (value as { pitch?: { note?: unknown; octave?: unknown } }).pitch
  if (typeof pitch?.note !== 'string') {
    return null
  }
  const octave = parseOctave(pitch.octave)
  if (octave === null) {
    return null
  }
  return { pitch: { note: pitch.note as Pitch['note'], octave } }
}

/** Repairs common storage glitches (e.g. string octaves) before validation. */
export function normalizeTuning(value: unknown): Tuning | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const tuning = value as Partial<Tuning>
  if (
    typeof tuning.id !== 'string' ||
    typeof tuning.name !== 'string' ||
    (tuning.instrument !== 'guitar' && tuning.instrument !== 'bass') ||
    !Array.isArray(tuning.strings) ||
    tuning.strings.length === 0
  ) {
    return null
  }

  const strings = tuning.strings
    .map(normalizeString)
    .filter((entry): entry is Tuning['strings'][number] => entry !== null)
  if (strings.length === 0) {
    return null
  }

  return {
    id: tuning.id,
    name: tuning.name,
    instrument: tuning.instrument,
    strings,
  }
}

function normaliseStored(raw: unknown): StoredTunings {
  if (!raw || typeof raw !== 'object') {
    return emptyStore()
  }

  const tunings = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Partial<StoredTunings>).tunings)
      ? (raw as Partial<StoredTunings>).tunings
      : null
  if (!tunings) {
    return emptyStore()
  }

  return {
    v: VERSION,
    tunings: tunings
      .map(normalizeTuning)
      .filter((entry): entry is Tuning => entry !== null),
  }
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
    mirrorSession(data.tunings)
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

function clearLastActive(): void {
  try {
    localStorage.removeItem(LAST_ACTIVE_KEY)
    sessionStorage.removeItem(LAST_ACTIVE_SESSION_KEY)
  } catch {
    // ignore
  }
}

function readLastActiveFrom(storage: Storage, key: string): Tuning | null {
  try {
    const raw = storage.getItem(key)
    if (!raw) {
      return null
    }
    const parsed = normalizeTuning(JSON.parse(raw) as unknown)
    return parsed && appearsInMyTunings(parsed) ? parsed : null
  } catch {
    return null
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
  return (
    readLastActiveFrom(localStorage, LAST_ACTIVE_KEY) ??
    readLastActiveFrom(sessionStorage, LAST_ACTIVE_SESSION_KEY) ??
    readLastActiveFrom(localStorage, LAST_ACTIVE_SESSION_KEY) ??
    readLastActiveFrom(sessionStorage, LAST_ACTIVE_KEY)
  )
}

/** Remembers the active custom tuning so it survives reloads and picker refresh. */
export function persistLastActiveTuning(tuning: Tuning): void {
  if (!appearsInMyTunings(tuning)) {
    clearLastActive()
    return
  }
  const json = JSON.stringify(tuning)
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, json)
  } catch {
    // ignore
  }
  try {
    sessionStorage.setItem(LAST_ACTIVE_SESSION_KEY, json)
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
    clearLastActive()
  }
}
