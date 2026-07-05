/** Root mean square amplitude of a sample window. */
export function rms(samples: Float32Array): number {
  let sum = 0
  for (const sample of samples) {
    sum += sample * sample
  }
  return Math.sqrt(sum / samples.length)
}

/** Removes DC offset so rumble does not skew pitch detection. */
export function removeDcOffset(samples: Float32Array): Float32Array {
  let sum = 0
  for (const sample of samples) {
    sum += sample
  }
  const mean = sum / samples.length
  const out = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i]
    if (sample === undefined) {
      continue
    }
    out[i] = sample - mean
  }
  return out
}

function correlateAt(
  samples: Float32Array,
  sampleRate: number,
  frequency: number,
): number {
  let sinSum = 0
  let cosSum = 0
  for (let i = 0; i < samples.length; i += 1) {
    const phase = (2 * Math.PI * frequency * i) / sampleRate
    const sample = samples[i]
    if (sample === undefined) {
      continue
    }
    sinSum += sample * Math.sin(phase)
    cosSum += sample * Math.cos(phase)
  }
  return Math.hypot(sinSum, cosSum) / samples.length
}

/**
 * Scores how closely the window matches a plucked string at `frequency`.
 * Returns 0 for broadband noise; higher for tonal string energy with harmonics.
 */
export function stringToneScore(
  samples: Float32Array,
  sampleRate: number,
  frequency: number,
): number {
  const level = rms(samples)
  if (level < 1e-6) {
    return 0
  }

  const fundamental = correlateAt(samples, sampleRate, frequency) / level
  const second = correlateAt(samples, sampleRate, frequency * 2) / level
  const third = correlateAt(samples, sampleRate, frequency * 3) / level

  if (fundamental < 0.055) {
    return 0
  }

  const hasHarmonics = second >= fundamental * 0.08
  const strongFundamental = fundamental >= 0.12
  if (!hasHarmonics && !strongFundamental) {
    return 0
  }

  return fundamental + second * 0.5 + third * 0.25
}
