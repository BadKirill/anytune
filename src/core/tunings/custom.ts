import { pitchesEqual } from '../music'

import { PRESET_TUNINGS } from './presets'
import type { Tuning } from './types'

export const DRAFT_TUNING_ID = 'custom-draft'

/** True when the user has saved a custom tuning (id is `custom-<timestamp>`). */
export function isSavedCustomTuning(tuning: Tuning): boolean {
  return tuning.id.startsWith('custom-') && tuning.id !== DRAFT_TUNING_ID
}

export function isDraftTuning(tuning: Tuning): boolean {
  return tuning.id === DRAFT_TUNING_ID
}

/** True when the tuning still matches a built-in preset (id, name, and pitches). */
export function isUnmodifiedPreset(tuning: Tuning): boolean {
  const preset = PRESET_TUNINGS.find((entry) => entry.id === tuning.id)
  if (!preset) {
    return false
  }
  if (tuning.name !== preset.name || tuning.strings.length !== preset.strings.length) {
    return false
  }
  return tuning.strings.every((string, index) => {
    const presetPitch = preset.strings[index]?.pitch
    return presetPitch !== undefined && pitchesEqual(string.pitch, presetPitch)
  })
}

/** True when the tuning should appear under My tunings (saved custom or edited preset). */
export function belongsInMyTunings(tuning: Tuning): boolean {
  if (isDraftTuning(tuning)) {
    return false
  }
  if (isSavedCustomTuning(tuning)) {
    return true
  }
  return !isUnmodifiedPreset(tuning)
}
