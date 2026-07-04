import { describe, expect, it } from 'vitest'

import { centsBetween } from './cents'

describe('centsBetween', () => {
  it('returns 0 when actual matches target', () => {
    expect(centsBetween(440, 440)).toBe(0)
  })

  it('returns +100 for one semitone sharp and -100 for one semitone flat', () => {
    const semitoneUp = 440 * 2 ** (1 / 12)
    expect(centsBetween(semitoneUp, 440)).toBeCloseTo(100, 6)
    expect(centsBetween(440, semitoneUp)).toBeCloseTo(-100, 6)
  })

  it('is antisymmetric', () => {
    expect(centsBetween(452, 440)).toBeCloseTo(-centsBetween(440, 452), 9)
  })

  it('returns +1200 for one octave up', () => {
    expect(centsBetween(880, 440)).toBeCloseTo(1200, 6)
  })
})
