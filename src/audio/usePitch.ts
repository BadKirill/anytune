import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'

import { isPitchDetectionSuppressed } from './pitchGate'
import {
  MicStreamError,
  startMicSession,
  type MicError,
  type MicSession,
} from './micStream'
import { detectPitch, frequencyJumpCents } from './pitchDetector'

const MEDIAN_WINDOW = 5
/** Reject sudden octave-drop artifacts as a string fades out. */
const MAX_JUMP_CENTS = 150

export type PitchStatus = 'idle' | 'starting' | 'listening' | 'error'

export interface PitchState {
  status: PitchStatus
  error: MicError | null
  /** Median-filtered frequency in Hz; null while no string is sounding. */
  frequency: number | null
  clarity: number | null
}

const IDLE_STATE: PitchState = {
  status: 'idle',
  error: null,
  frequency: null,
  clarity: null,
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

function isStableJump(frequency: number, recent: number[]): boolean {
  if (recent.length === 0) {
    return true
  }
  return frequencyJumpCents(median(recent), frequency) <= MAX_JUMP_CENTS
}

function applyReading(
  reading: { frequency: number; clarity: number } | null,
  recentRef: RefObject<number[]>,
  setState: Dispatch<SetStateAction<PitchState>>,
) {
  if (!reading || !isStableJump(reading.frequency, recentRef.current)) {
    recentRef.current = []
    setState((prev) => ({ ...prev, frequency: null, clarity: null }))
    return
  }
  const recent = [...recentRef.current, reading.frequency].slice(-MEDIAN_WINDOW)
  recentRef.current = recent
  setState((prev) => ({
    ...prev,
    frequency: median(recent),
    clarity: reading.clarity,
  }))
}

/** Starts/stops the mic pipeline and exposes a smoothed pitch reading. */
export function usePitch(): PitchState & { start: () => void; stop: () => void } {
  const [state, setState] = useState<PitchState>(IDLE_STATE)
  const sessionRef = useRef<MicSession | null>(null)
  const recentRef = useRef<number[]>([])
  const activeRef = useRef(false)

  const handleWindow = useCallback((samples: Float32Array, sampleRate: number) => {
    if (!activeRef.current || isPitchDetectionSuppressed()) {
      return
    }
    applyReading(detectPitch(samples, sampleRate), recentRef, setState)
  }, [])

  const stop = useCallback(() => {
    activeRef.current = false
    recentRef.current = []
    setState(IDLE_STATE)
    sessionRef.current?.stop()
    sessionRef.current = null
  }, [])

  const start = useCallback(() => {
    if (sessionRef.current) {
      return
    }
    activeRef.current = true
    setState({ ...IDLE_STATE, status: 'starting' })
    startMicSession(handleWindow).then(
      (session) => {
        if (!activeRef.current) {
          session.stop()
          return
        }
        sessionRef.current = session
        setState({ ...IDLE_STATE, status: 'listening' })
      },
      (error: unknown) => {
        const reason = error instanceof MicStreamError ? error.reason : 'unavailable'
        setState({ ...IDLE_STATE, status: 'error', error: reason })
      },
    )
  }, [handleWindow])

  useEffect(() => stop, [stop])

  return { ...state, start, stop }
}
