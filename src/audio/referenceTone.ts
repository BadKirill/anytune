import { pitchToFrequency, type Pitch } from '../core/music'

const NOTE_DURATION_S = 1.4

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

function addOscillator(
  ctx: AudioContext,
  frequency: number,
  outputGain: number,
  destination: GainNode,
): void {
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = frequency
  const level = ctx.createGain()
  level.gain.value = outputGain
  osc.connect(level)
  level.connect(destination)
  osc.start()
  osc.stop(ctx.currentTime + NOTE_DURATION_S)
  nodes.push(osc, level)
}

/** Plays a short reference tone so the player can compare against the target string. */
export function playReferencePitch(pitch: Pitch): void {
  clearPlayback()
  const ctx = getContext()
  void ctx.resume()

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + NOTE_DURATION_S)
  gain.connect(ctx.destination)
  nodes.push(gain)

  const frequency = pitchToFrequency(pitch)
  addOscillator(ctx, frequency, 1, gain)
  addOscillator(ctx, frequency * 2, 0.15, gain)

  stopTimer = setTimeout(clearPlayback, NOTE_DURATION_S * 1000 + 50)
}
