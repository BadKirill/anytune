import { centsBetween, pitchToFrequency } from '../music'
import type { Tuning } from './types'

export type TuneDirection = 'tighten' | 'loosen' | 'in-tune'

export interface StringAnalysis {
  /** Index into tuning.strings of the closest target string. */
  stringIndex: number
  /** Signed offset in cents from the target: positive = sharp. */
  cents: number
  direction: TuneDirection
}

/** Within this many cents of the target the string counts as in tune. */
export const IN_TUNE_CENTS = 5

function directionFor(cents: number): TuneDirection {
  if (Math.abs(cents) <= IN_TUNE_CENTS) {
    return 'in-tune'
  }
  return cents < 0 ? 'tighten' : 'loosen'
}

/**
 * Matches a detected frequency to the nearest string of the tuning
 * (nearest on the log scale, i.e. by cents) and reports how far off it is.
 */
export function analyze(frequency: number, tuning: Tuning): StringAnalysis | null {
  let best: { index: number; cents: number } | null = null
  for (const [index, string] of tuning.strings.entries()) {
    const cents = centsBetween(frequency, pitchToFrequency(string.pitch))
    if (!best || Math.abs(cents) < Math.abs(best.cents)) {
      best = { index, cents }
    }
  }
  if (!best) {
    return null
  }
  return {
    stringIndex: best.index,
    cents: best.cents,
    direction: directionFor(best.cents),
  }
}
