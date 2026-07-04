import { pitchToMidi, type Pitch } from './notes'

const A4_FREQUENCY_HZ = 440
const A4_MIDI = 69
const SEMITONES_PER_OCTAVE = 12

/** Frequency in Hz of a MIDI note number (equal temperament, A4 = 440 Hz). */
export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY_HZ * 2 ** ((midi - A4_MIDI) / SEMITONES_PER_OCTAVE)
}

/** Fractional MIDI number of a frequency, e.g. 440 Hz -> 69, 445 Hz -> ~69.2. */
export function frequencyToMidiFloat(frequency: number): number {
  return A4_MIDI + SEMITONES_PER_OCTAVE * Math.log2(frequency / A4_FREQUENCY_HZ)
}

/** Frequency in Hz of a pitch, e.g. A4 -> 440. */
export function pitchToFrequency(pitch: Pitch): number {
  return midiToFrequency(pitchToMidi(pitch))
}
