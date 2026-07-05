import { describe, expect, it } from 'vitest'

import { removeDcOffset, stringToneScore } from './windowAnalysis'

const SAMPLE_RATE = 48000
const WINDOW_SIZE = 8192

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

describe('windowAnalysis', () => {
  it('stringToneScore is high for a plucked guitar tone', () => {
    const tone = removeDcOffset(pluckedTone(110))
    expect(stringToneScore(tone, SAMPLE_RATE, 110)).toBeGreaterThan(0.15)
  })

  it('stringToneScore is low for white noise', () => {
    const noise = removeDcOffset(new Float32Array(WINDOW_SIZE))
    for (let i = 0; i < WINDOW_SIZE; i += 1) {
      noise[i] = Math.random() * 2 - 1
    }
    expect(stringToneScore(noise, SAMPLE_RATE, 110)).toBe(0)
  })

  it('stringToneScore accepts a strong pure tone without harmonics', () => {
    const tone = removeDcOffset(new Float32Array(WINDOW_SIZE))
    for (let i = 0; i < WINDOW_SIZE; i += 1) {
      tone[i] = Math.sin((2 * Math.PI * 110 * i) / SAMPLE_RATE)
    }
    expect(stringToneScore(tone, SAMPLE_RATE, 110)).toBeGreaterThan(0.15)
  })

  it('removeDcOffset centers the window', () => {
    const biased = new Float32Array(4)
    biased[0] = 1
    biased[1] = 1
    biased[2] = 1
    biased[3] = 1
    const centered = removeDcOffset(biased)
    expect(centered[0]).toBeCloseTo(0)
  })
})
