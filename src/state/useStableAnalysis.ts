import { useMemo, useRef } from 'react'

import {
  initialPitchStabilizerState,
  stabilizePitchDisplay,
  type PitchStabilizerState,
} from '../core/signal/pitchStabilizer'
import type { TuneDirection } from '../core/tunings'

export interface CentsDirection {
  cents: number
  direction: TuneDirection
}

function stabilizeAnalysis<T extends CentsDirection>(
  stabilizer: PitchStabilizerState,
  raw: T | null,
  clarity: number | null,
  hasSignal: boolean,
): { analysis: T | null; stabilizer: PitchStabilizerState } {
  const nowMs = performance.now()
  if (!raw) {
    const result = stabilizePitchDisplay(stabilizer, {
      cents: 0,
      direction: 'in-tune',
      clarity: clarity ?? 0,
      nowMs,
      hasSignal: false,
    })
    return { analysis: null, stabilizer: result.state }
  }

  const result = stabilizePitchDisplay(stabilizer, {
    cents: raw.cents,
    direction: raw.direction,
    clarity: clarity ?? 0,
    nowMs,
    hasSignal,
  })

  return {
    analysis: {
      ...raw,
      cents: result.cents,
      direction: result.direction,
    },
    stabilizer: result.state,
  }
}

/** Stabilizes needle display for string or chromatic analysis payloads. */
export function useStableAnalysis<T extends CentsDirection>(
  rawAnalysis: T | null,
  clarity: number | null,
  frequency: number | null,
  scope: string,
): T | null {
  const stabilizerRef = useRef<PitchStabilizerState>(initialPitchStabilizerState())
  const scopeRef = useRef(scope)

  if (scopeRef.current !== scope) {
    stabilizerRef.current = initialPitchStabilizerState()
    scopeRef.current = scope
  }

  return useMemo(() => {
    const stabilized = stabilizeAnalysis(
      stabilizerRef.current,
      rawAnalysis,
      clarity,
      frequency !== null,
    )
    stabilizerRef.current = stabilized.stabilizer
    return stabilized.analysis
  }, [rawAnalysis, clarity, frequency])
}
