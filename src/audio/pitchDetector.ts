import { removeDcOffset, rms, stringToneScore } from '../core/signal/windowAnalysis'
import { PitchDetector } from 'pitchy'

export interface PitchReading {
  frequency: number
  clarity: number
}

export interface DetectPitchOptions {
  /** Adaptive ambient noise floor tracked by the mic pipeline. */
  noiseFloorRms?: number
}

/** Readings below this clarity are noise, not a played string. */
const MIN_CLARITY = 0.85
/** Below the lowest useful bass note (drop F# on a 5-string is ~23 Hz overtone-rich). */
const MIN_FREQUENCY_HZ = 25
/** Above the highest string fundamental we care about. */
const MAX_FREQUENCY_HZ = 1000
/** Minimum signal level before we even run pitch detection. */
const MIN_RMS_ABSOLUTE = 0.004
/** Signal must exceed the tracked noise floor by this factor. */
const NOISE_FLOOR_MARGIN = 3.5
/** Plucked strings have strong harmonics; broadband noise does not. */
const MIN_STRING_TONE_SCORE = 0.15

const detectors = new Map<number, PitchDetector<Float32Array>>()

function detectorFor(windowSize: number): PitchDetector<Float32Array> {
  let detector = detectors.get(windowSize)
  if (!detector) {
    detector = PitchDetector.forFloat32Array(windowSize)
    detectors.set(windowSize, detector)
  }
  return detector
}

function passesNoiseGate(level: number, noiseFloorRms: number | undefined): boolean {
  const floor = Math.max(MIN_RMS_ABSOLUTE, (noiseFloorRms ?? 0) * NOISE_FLOOR_MARGIN)
  return level >= floor
}

/** Detects the fundamental pitch of a sample window; null if nothing reliable. */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  options: DetectPitchOptions = {},
): PitchReading | null {
  const conditioned = removeDcOffset(samples)
  const level = rms(conditioned)
  if (!passesNoiseGate(level, options.noiseFloorRms)) {
    return null
  }

  const [frequency, clarity] = detectorFor(samples.length).findPitch(
    conditioned,
    sampleRate,
  )
  const inRange =
    clarity >= MIN_CLARITY &&
    frequency >= MIN_FREQUENCY_HZ &&
    frequency <= MAX_FREQUENCY_HZ
  if (!inRange) {
    return null
  }

  if (stringToneScore(conditioned, sampleRate, frequency) < MIN_STRING_TONE_SCORE) {
    return null
  }

  return { frequency, clarity }
}

/** Exposed so the mic pipeline can track ambient noise between plucks. */
export function windowRms(samples: Float32Array): number {
  return rms(removeDcOffset(samples))
}
