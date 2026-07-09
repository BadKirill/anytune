import type { Pitch } from '../core/music'
import type { Tuning } from '../core/tunings'
import {
  belongsInMyTunings,
  isSavedCustomTuning,
  isUnmodifiedPreset,
} from '../core/tunings/custom'

const LIST_KEY = 'anytune.v2.customTunings'
const ACTIVE_KEY = 'anytune.v2.activeTuning'
const LIST_SESSION_KEY = 'anytune.v2.customTunings.session'
const ACTIVE_SESSION_KEY = 'anytune.v2.activeTuning.session'

const LEGACY_LIST_KEY = 'anytune.customTunings'
const LEGACY_LIST_SESSION_KEY = 'anytune.customTunings.session'
const LEGACY_ACTIVE_KEY = 'anytune.lastActiveTuning'
const LEGACY_ACTIVE_SESSION_KEY = 'anytune.lastActiveTuning.session'

interface TuningListFile {
  v: 2
  tunings: Tuning[]
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

/** Repairs common storage glitches before a tuning is used. */
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

function readRaw(storage: Storage, key: string): unknown {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

function writeRaw(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be blocked on some mobile browsers until a user gesture.
  }
}

function tuningsFromRaw(raw: unknown): Tuning[] {
  if (!raw) {
    return []
  }
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Partial<TuningListFile>).tunings)
      ? (raw as Partial<TuningListFile>).tunings
      : null
  if (!list) {
    return []
  }
  return list
    .map(normalizeTuning)
    .filter((entry): entry is Tuning => entry !== null)
    .map(ensureStoredId)
    .filter(belongsInMyTunings)
}

function readLegacyTunings(): Tuning[] {
  const sources = [
    readRaw(localStorage, LEGACY_LIST_KEY),
    readRaw(sessionStorage, LEGACY_LIST_SESSION_KEY),
  ]
  const merged = new Map<string, Tuning>()
  for (const source of sources) {
    for (const tuning of tuningsFromRaw(source)) {
      merged.set(tuning.id, tuning)
    }
  }
  return [...merged.values()]
}

function ensureStoredId(tuning: Tuning): Tuning {
  if (isSavedCustomTuning(tuning) || isUnmodifiedPreset(tuning)) {
    return tuning
  }
  return { ...tuning, id: createCustomId() }
}

function writeTuningList(tunings: Tuning[]): void {
  const file: TuningListFile = { v: 2, tunings }
  writeRaw(localStorage, LIST_KEY, file)
  writeRaw(sessionStorage, LIST_SESSION_KEY, file)
}

function readTuningList(): Tuning[] {
  const current = tuningsFromRaw(readRaw(localStorage, LIST_KEY))
  if (current.length > 0) {
    return current
  }
  const session = tuningsFromRaw(readRaw(sessionStorage, LIST_SESSION_KEY))
  if (session.length > 0) {
    writeTuningList(session)
    return session
  }
  const legacy = readLegacyTunings()
  if (legacy.length > 0) {
    writeTuningList(legacy)
  }
  return legacy
}

function readLegacyActive(): Tuning | null {
  const keys = [LEGACY_ACTIVE_KEY, LEGACY_ACTIVE_SESSION_KEY]
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      const parsed = normalizeTuning(readRaw(storage, key))
      if (parsed && belongsInMyTunings(parsed)) {
        return parsed
      }
    }
  }
  return null
}

function clearActiveTuning(): void {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(ACTIVE_KEY)
    storage.removeItem(ACTIVE_SESSION_KEY)
    storage.removeItem(LEGACY_ACTIVE_KEY)
    storage.removeItem(LEGACY_ACTIVE_SESSION_KEY)
  }
}

/** All user-saved custom tunings from storage. */
export function readCustomTunings(): Tuning[] {
  return readTuningList().filter(isSavedCustomTuning)
}

/** Saves or replaces one custom tuning and marks it active. */
export function saveCustomTuning(tuning: Tuning): void {
  if (!isSavedCustomTuning(tuning)) {
    return
  }
  const next = [...readTuningList().filter((entry) => entry.id !== tuning.id), tuning]
  writeTuningList(next)
  writeActiveTuning(tuning)
}

/** Removes a saved custom tuning. */
export function deleteCustomTuning(id: string): void {
  writeTuningList(readTuningList().filter((entry) => entry.id !== id))
  if (readActiveTuning()?.id === id) {
    clearActiveTuning()
  }
}

/** Renames a saved custom tuning. */
export function renameCustomTuning(id: string, name: string): Tuning | null {
  const existing = readTuningList().find((entry) => entry.id === id)
  if (!existing) {
    return null
  }
  const updated: Tuning = { ...existing, name }
  saveCustomTuning(updated)
  return updated
}

function readStoredActive(storage: Storage, key: string): Tuning | null {
  const parsed = normalizeTuning(readRaw(storage, key))
  if (!parsed || !belongsInMyTunings(parsed)) {
    return null
  }
  const stored = ensureStoredId(parsed)
  if (!isSavedCustomTuning(parsed)) {
    saveCustomTuning(stored)
  }
  return stored
}

/** Last selected custom tuning, if any. */
export function readActiveTuning(): Tuning | null {
  for (const storage of [localStorage, sessionStorage]) {
    const active =
      readStoredActive(storage, ACTIVE_KEY) ??
      readStoredActive(storage, ACTIVE_SESSION_KEY)
    if (active) {
      return active
    }
  }
  const legacy = readLegacyActive()
  if (!legacy || !belongsInMyTunings(legacy)) {
    return null
  }
  const stored = ensureStoredId(legacy)
  saveCustomTuning(stored)
  return stored
}

/** Remembers which custom tuning is currently selected. */
export function writeActiveTuning(tuning: Tuning): void {
  if (!isSavedCustomTuning(tuning)) {
    clearActiveTuning()
    return
  }
  writeRaw(localStorage, ACTIVE_KEY, tuning)
  writeRaw(sessionStorage, ACTIVE_SESSION_KEY, tuning)
}

/** Builds the My tunings list for the picker — storage plus the live selection. */
export function myTuningsForPicker(active: Tuning): Tuning[] {
  const byId = new Map(
    readTuningList()
      .filter(isSavedCustomTuning)
      .map((tuning) => [tuning.id, tuning]),
  )
  if (belongsInMyTunings(active)) {
    const entry = isSavedCustomTuning(active) ? active : ensureStoredId(active)
    byId.set(entry.id, entry)
  }
  return [...byId.values()]
}

export function createCustomId(): string {
  return `custom-${String(Date.now())}`
}
