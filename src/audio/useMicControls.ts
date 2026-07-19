import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'

import { onAppResume } from './appResume'
import { beginMicSession, stopMicSession } from './micSessionControl'
import { createMicWindowHandler } from './micWindowHandler'
import type { MicSession } from './micStream'
import type { PitchState } from './pitchState'

export function useMicControls(setState: Dispatch<SetStateAction<PitchState>>): {
  start: () => void
  stop: () => void
} {
  const sessionRef = useRef<MicSession | null>(null)
  const recentRef = useRef<number[]>([])
  const activeRef = useRef(false)
  const restartRef = useRef<() => void>(() => undefined)
  const handleWindow = useMemo(
    () => createMicWindowHandler(() => activeRef.current, recentRef.current, setState),
    [setState],
  )

  const restart = useCallback(() => {
    beginMicSession(
      { active: activeRef, session: sessionRef, recent: recentRef },
      setState,
      handleWindow,
      () => {
        restartRef.current()
      },
    )
  }, [handleWindow, setState])

  useEffect(() => {
    restartRef.current = restart
  }, [restart])

  const stop = useCallback(() => {
    stopMicSession(
      { active: activeRef, session: sessionRef, recent: recentRef },
      setState,
    )
  }, [setState])

  const start = useCallback(() => {
    activeRef.current = true
    // Always rebuild: a suspended/dead session can leave sessionRef set while silent.
    restart()
  }, [restart])

  useEffect(() => {
    const off = onAppResume(() => {
      if (activeRef.current) {
        restartRef.current()
      }
    })
    return off
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { start, stop }
}
