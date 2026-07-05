import { PitchDetector } from 'pitchy'

export interface PitchReading {
  frequency: number
  clarity: number
}

/** Below the lowest useful bass note (drop F# on a 5-string is ~23 Hz overtone-rich). */
const MIN_FREQUENCY_HZ = 25
/** Above the highest string fundamental we care about. */
const MAX_FREQUENCY_HZ = 1000

const detectors = new Map<number, PitchDetector<Float32Array>>()

function detectorFor(windowSize: number): PitchDetector<Float32Array> {
  let detector = detectors.get(windowSize)
  if (!detector) {
    detector = PitchDetector.forFloat32Array(windowSize)
    detectors.set(windowSize, detector)
  }
  return detector
}

/** Bass fundamentals need a slightly lower clarity bar than high strings. */
export function minClarityFor(frequency: number): number {
  if (frequency < 60) {
    return 0.82
  }
  if (frequency < 100) {
    return 0.86
  }
  return 0.9
}

/** Detects the fundamental pitch of a sample window; null if nothing reliable. */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
): PitchReading | null {
  const [frequency, clarity] = detectorFor(samples.length).findPitch(samples, sampleRate)
  const usable =
    clarity >= minClarityFor(frequency) &&
    frequency >= MIN_FREQUENCY_HZ &&
    frequency <= MAX_FREQUENCY_HZ
  return usable ? { frequency, clarity } : null
}

/** Signed cents distance between two frequencies. */
export function frequencyJumpCents(fromHz: number, toHz: number): number {
  return Math.abs(1200 * Math.log2(toHz / fromHz))
}
