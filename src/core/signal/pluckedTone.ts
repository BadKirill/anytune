/**
 * Karplus-Strong plucked-string synthesis (pure TS).
 * Feeds noise into a delay loop with averaging low-pass — sounds like a guitar pluck.
 */
export function synthesizePluck(
  frequency: number,
  sampleRate: number,
  durationS: number,
): Float32Array {
  const periodSamples = Math.max(2, Math.round(sampleRate / frequency))
  const totalSamples = Math.floor(sampleRate * durationS)
  const output = new Float32Array(totalSamples)
  const line = new Float32Array(periodSamples)

  for (let i = 0; i < periodSamples; i += 1) {
    line[i] = (Math.random() * 2 - 1) * 0.6
  }

  const damping = dampingFor(frequency)
  let pos = 0

  for (let i = 0; i < totalSamples; i += 1) {
    const nextPos = (pos + 1) % periodSamples
    const sample = line[pos]
    const neighbor = line[nextPos]
    if (sample === undefined || neighbor === undefined) {
      break
    }
    const filtered = (sample + neighbor) * 0.5 * damping
    line[pos] = filtered
    output[i] = filtered
    pos = nextPos
  }

  return output
}

function dampingFor(frequency: number): number {
  if (frequency < 80) {
    return 0.9996
  }
  if (frequency < 150) {
    return 0.9992
  }
  return 0.9985
}

/** Normalizes peak amplitude so every note is similarly loud. */
export function normalizePluck(samples: Float32Array, targetPeak = 0.85): Float32Array {
  let peak = 0
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample))
  }
  if (peak < 1e-6) {
    return samples
  }
  const scale = targetPeak / peak
  const out = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i]
    out[i] = sample === undefined ? 0 : sample * scale
  }
  return out
}
