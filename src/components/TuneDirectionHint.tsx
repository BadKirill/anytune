import { formatPitch } from '../core/music'
import type { StringAnalysis, Tuning } from '../core/tunings'
import type { PitchState } from '../audio/usePitch'
import { UI } from './strings'

interface TuneDirectionHintProps {
  pitch: PitchState
  analysis: StringAnalysis | null
  tuning: Tuning
  manualMode: boolean
}

const MIC_ERRORS = {
  'permission-denied': UI.micDenied,
  'no-microphone': UI.micMissing,
  unavailable: UI.micUnavailable,
} as const

function directionText(analysis: StringAnalysis, tuning: Tuning): string {
  const string = tuning.strings[analysis.stringIndex]
  if (!string) {
    return ''
  }
  const label = `${UI.stringWord} ${String(analysis.stringIndex + 1)} (${formatPitch(string.pitch)})`
  if (analysis.direction === 'in-tune') {
    return `${label}: ${UI.inTune}`
  }
  return `${label}: ${analysis.direction === 'tighten' ? UI.tighten : UI.loosen}`
}

export function TuneDirectionHint({
  pitch,
  analysis,
  tuning,
  manualMode,
}: TuneDirectionHintProps) {
  if (pitch.status === 'error' && pitch.error) {
    return <p className="hint hint-error">{MIC_ERRORS[pitch.error]}</p>
  }
  if (pitch.status === 'starting') {
    return <p className="hint">{UI.starting}</p>
  }
  if (pitch.status === 'listening' && !analysis) {
    return <p className="hint">{manualMode ? UI.playSelectedString : UI.playAnyString}</p>
  }
  if (analysis) {
    const inTune = analysis.direction === 'in-tune'
    return (
      <p className={`hint${inTune ? ' hint-in-tune' : ''}`}>
        {directionText(analysis, tuning)}
      </p>
    )
  }
  return <p className="hint hint-muted">{UI.tapAgainToEdit}</p>
}
