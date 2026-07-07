import { PRESET_TUNINGS } from './presets'
import type { Tuning } from './types'

const DRAFT_TUNING_ID = 'custom-draft'
const PRESET_IDS = new Set(PRESET_TUNINGS.map((preset) => preset.id))

/** True for any user-owned tuning that is not a built-in preset or unsaved draft. */
export function isSavedCustomTuning(tuning: Tuning): boolean {
  if (tuning.id === DRAFT_TUNING_ID) {
    return false
  }
  return !PRESET_IDS.has(tuning.id)
}
