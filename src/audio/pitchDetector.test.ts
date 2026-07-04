import { describe, expect, it } from 'vitest'

import { detectPitch } from './pitchDetector'

const SAMPLE_RATE = 48000
const WINDOW_SIZE = 8192

/** Synthesizes a decaying plucked-string-like tone with a few harmonics. */
function pluckedTone(frequency: number): Float32Array {
  const samples = new Float32Array(WINDOW_SIZE)
  for (let i = 0; i < WINDOW_SIZE; i += 1) {
    const t = i / SAMPLE_RATE
    const envelope = Math.exp(-t * 1.5)
    samples[i] =
      envelope *
      (Math.sin(2 * Math.PI * frequency * t) +
        0.5 * Math.sin(2 * Math.PI * 2 * frequency * t) +
        0.25 * Math.sin(2 * Math.PI * 3 * frequency * t))
  }
  return samples
}

describe('detectPitch', () => {
  it('detects low bass F1 (~43.65 Hz, Demiurge low string)', () => {
    const reading = detectPitch(pluckedTone(43.65), SAMPLE_RATE)
    expect(reading).not.toBeNull()
    expect(reading?.frequency).toBeCloseTo(43.65, 0)
  })

  it('detects guitar low E2 (~82.41 Hz)', () => {
    const reading = detectPitch(pluckedTone(82.41), SAMPLE_RATE)
    expect(reading?.frequency).toBeCloseTo(82.41, 0)
  })

  it('detects A4 (440 Hz)', () => {
    const reading = detectPitch(pluckedTone(440), SAMPLE_RATE)
    expect(reading?.frequency).toBeCloseTo(440, 0)
  })

  it('rejects silence', () => {
    expect(detectPitch(new Float32Array(WINDOW_SIZE), SAMPLE_RATE)).toBeNull()
  })

  it('rejects white noise', () => {
    const noise = new Float32Array(WINDOW_SIZE)
    for (let i = 0; i < WINDOW_SIZE; i += 1) {
      noise[i] = Math.random() * 2 - 1
    }
    expect(detectPitch(noise, SAMPLE_RATE)).toBeNull()
  })
})
