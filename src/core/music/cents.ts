const CENTS_PER_OCTAVE = 1200

/**
 * Signed distance in cents from target to actual frequency.
 * Positive = actual is sharp (loosen the string), negative = flat (tighten).
 */
export function centsBetween(actualFrequency: number, targetFrequency: number): number {
  return CENTS_PER_OCTAVE * Math.log2(actualFrequency / targetFrequency)
}
