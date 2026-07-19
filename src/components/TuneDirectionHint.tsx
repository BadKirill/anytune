import { formatPitch } from '../core/music'
import type { ChromaticAnalysis, StringAnalysis, Tuning } from '../core/tunings'
import type { PitchState } from '../audio/usePitch'
import type { DisplayAnalysis } from '../state/appState'
import { UI } from './strings'

interface TuneDirectionHintProps {
  pitch: PitchState
  analysis: DisplayAnalysis | null
  tuning: Tuning
  manualMode: boolean
  chromatic: boolean
}

const MIC_ERRORS = {
  'permission-denied': UI.micDenied,
  'no-microphone': UI.micMissing,
  unavailable: UI.micUnavailable,
} as const

type HintView =
  { tone: 'error' | 'normal' | 'muted' | 'in-tune'; text: string } | { tone: 'empty' }

function directionSuffix(label: string, direction: StringAnalysis['direction']): string {
  if (direction === 'in-tune') {
    return `${label}: ${UI.inTune}`
  }
  return `${label}: ${direction === 'tighten' ? UI.tighten : UI.loosen}`
}

function stringDirectionText(analysis: StringAnalysis, tuning: Tuning): string {
  const string = tuning.strings[analysis.stringIndex]
  if (!string) {
    return ''
  }
  const label = `${UI.stringWord} ${String(analysis.stringIndex + 1)} (${formatPitch(string.pitch)})`
  return directionSuffix(label, analysis.direction)
}

function chromaticDirectionText(analysis: ChromaticAnalysis): string {
  return directionSuffix(formatPitch(analysis.pitch), analysis.direction)
}

function analysisHint(analysis: DisplayAnalysis, tuning: Tuning): HintView {
  const text =
    analysis.kind === 'string'
      ? stringDirectionText(analysis, tuning)
      : chromaticDirectionText(analysis)
  return {
    tone: analysis.direction === 'in-tune' ? 'in-tune' : 'normal',
    text,
  }
}

function idleListeningText(chromatic: boolean, manualMode: boolean): string {
  if (chromatic) {
    return UI.playANote
  }
  return manualMode ? UI.playSelectedString : UI.playAnyString
}

function pitchStatusHint(
  pitch: PitchState,
  analysis: DisplayAnalysis | null,
  chromatic: boolean,
  manualMode: boolean,
): HintView | null {
  if (pitch.status === 'error' && pitch.error) {
    return { tone: 'error', text: MIC_ERRORS[pitch.error] }
  }
  if (pitch.status === 'starting') {
    return { tone: 'normal', text: UI.starting }
  }
  if (pitch.status === 'listening' && !analysis) {
    return { tone: 'normal', text: idleListeningText(chromatic, manualMode) }
  }
  return null
}

function resolveHint({
  pitch,
  analysis,
  tuning,
  manualMode,
  chromatic,
}: TuneDirectionHintProps): HintView {
  const fromPitch = pitchStatusHint(pitch, analysis, chromatic, manualMode)
  if (fromPitch) {
    return fromPitch
  }
  if (analysis) {
    return analysisHint(analysis, tuning)
  }
  if (chromatic) {
    return { tone: 'empty' }
  }
  return { tone: 'muted', text: UI.tapAgainToEdit }
}

function hintClassName(tone: HintView['tone']): string {
  if (tone === 'error') {
    return 'hint hint-error'
  }
  if (tone === 'in-tune') {
    return 'hint hint-in-tune'
  }
  if (tone === 'muted' || tone === 'empty') {
    return 'hint hint-muted'
  }
  return 'hint'
}

export function TuneDirectionHint(props: TuneDirectionHintProps) {
  const view = resolveHint(props)
  if (view.tone === 'empty') {
    return <p className={hintClassName(view.tone)} aria-hidden="true" />
  }
  return <p className={hintClassName(view.tone)}>{view.text}</p>
}
