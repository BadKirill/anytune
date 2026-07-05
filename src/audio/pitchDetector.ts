import { PitchDetector } from 'pitchy'

export interface PitchReading {
  frequency: number
  clarity: number
}

/** Readings below this clarity are noise, not a played string. */
const MIN_CLARITY = 0.9
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

/** Detects the fundamental pitch of a sample window; null if nothing reliable. */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
): PitchReading | null {
  const [frequency, clarity] = detectorFor(samples.length).findPitch(samples, sampleRate)
  const usable =
    clarity >= MIN_CLARITY &&
    frequency >= MIN_FREQUENCY_HZ &&
    frequency <= MAX_FREQUENCY_HZ
  return usable ? { frequency, clarity } : null
}
