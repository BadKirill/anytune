import type { MicError } from './micStream'

export type PitchStatus = 'idle' | 'starting' | 'listening' | 'error'

export interface PitchState {
  status: PitchStatus
  error: MicError | null
  frequency: number | null
  clarity: number | null
}
