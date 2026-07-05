import { pitchToFrequency, type Pitch } from '../core/music'
import { normalizePluck, synthesizePluck } from '../core/signal/pluckedTone'
import { suppressPitchDetection } from './pitchGate'

const NOTE_DURATION_S = 1.6
const SUPPRESS_MS = NOTE_DURATION_S * 1000 + 250

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

function guitarChain(ctx: AudioContext, source: AudioNode, frequency: number): AudioNode {
  const highPass = ctx.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = 70
  source.connect(highPass)
  track(highPass)

  const body = ctx.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = Math.min(220, frequency * 1.5)
  body.Q.value = 0.9
  body.gain.value = 4
  highPass.connect(body)
  track(body)

  const lowPass = ctx.createBiquadFilter()
  lowPass.type = 'lowpass'
  lowPass.frequency.value = 1900
  lowPass.Q.value = 0.5
  body.connect(lowPass)
  track(lowPass)

  return lowPass
}

/** Plays a short plucked-string reference tone for ear comparison. */
export function playReferencePitch(pitch: Pitch): void {
  clearPlayback()
  suppressPitchDetection(SUPPRESS_MS)

  const ctx = getContext()
  void ctx.resume()

  const frequency = pitchToFrequency(pitch)
  const source = ctx.createBufferSource()
  source.buffer = pluckBuffer(ctx, frequency)

  const output = ctx.createGain()
  output.gain.setValueAtTime(0.5, ctx.currentTime)
  output.connect(ctx.destination)
  track(source, output)

  const chain = guitarChain(ctx, source, frequency)
  chain.connect(output)
  source.start()

  stopTimer = setTimeout(clearPlayback, NOTE_DURATION_S * 1000 + 80)
}
