import { normalizePluck, synthesizePluck } from '../core/signal/pluckedTone'
import { pitchToFrequency, type Pitch } from '../core/music'

const NOTE_DURATION_S = 1.8

let context: AudioContext | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null
let nodes: AudioNode[] = []

function getContext(): AudioContext {
  context ??= new AudioContext()
  return context
}

function clearPlayback(): void {
  if (stopTimer) {
    clearTimeout(stopTimer)
    stopTimer = null
  }
  for (const node of nodes) {
    node.disconnect()
  }
  nodes = []
}

function track(...added: AudioNode[]): void {
  nodes.push(...added)
}

function pluckBuffer(ctx: AudioContext, frequency: number): AudioBuffer {
  const samples = normalizePluck(
    synthesizePluck(frequency, ctx.sampleRate, NOTE_DURATION_S),
  )
  const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
  buffer.copyToChannel(samples, 0)
  return buffer
}

function bodyFilter(ctx: AudioContext, source: AudioNode): AudioNode {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2800
  filter.Q.value = 0.6
  source.connect(filter)
  track(filter)
  return filter
}

/** Plays a short plucked-string reference tone for ear comparison. */
export function playReferencePitch(pitch: Pitch): void {
  clearPlayback()
  const ctx = getContext()
  void ctx.resume()

  const frequency = pitchToFrequency(pitch)
  const source = ctx.createBufferSource()
  source.buffer = pluckBuffer(ctx, frequency)

  const output = ctx.createGain()
  output.gain.setValueAtTime(0.55, ctx.currentTime)
  output.connect(ctx.destination)
  track(source, output)

  const filtered = bodyFilter(ctx, source)
  filtered.connect(output)
  source.start()

  stopTimer = setTimeout(clearPlayback, NOTE_DURATION_S * 1000 + 80)
}
