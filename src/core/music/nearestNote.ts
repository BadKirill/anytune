import { frequencyToMidiFloat } from './frequency'
import { midiToPitch, type Pitch } from './notes'

/** Nearest equal-temperament pitch for a frequency (12-TET, A4 = 440 Hz). */
export function nearestPitch(frequency: number): Pitch {
  return midiToPitch(frequencyToMidiFloat(frequency))
}
