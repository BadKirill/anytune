import { DEFAULT_TUNING_ID, PRESET_TUNINGS, type Tuning } from '../core/tunings'

export function defaultTuning(): Tuning {
  const preset =
    PRESET_TUNINGS.find((t) => t.id === DEFAULT_TUNING_ID) ?? PRESET_TUNINGS[0]
  if (!preset) {
    throw new Error('No preset tunings defined')
  }
  return preset
}
