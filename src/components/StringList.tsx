import { playReferencePitch } from '../audio/referenceTone'
import { formatPitch, pitchToMidi, type Pitch } from '../core/music'
import type { Tuning } from '../core/tunings'

/** Visual string thickness in px: lower pitch = thicker string, like real gauges. */
function stringThickness(pitch: Pitch): number {
  const midi = pitchToMidi(pitch)
  const E4_MIDI = 64
  return Math.min(6.5, Math.max(1, (E4_MIDI - midi) * 0.14 + 1))
}

function StringGauge({ pitch, active }: { pitch: Pitch; active: boolean }) {
  const thickness = stringThickness(pitch)
  return (
    <svg className="string-gauge" viewBox="0 0 280 12" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill="currentColor" opacity={active ? 0.9 : 0.5} />
      <line
        x1="6"
        y1="6"
        x2="274"
        y2="6"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity={active ? 1 : 0.75}
      />
      <circle cx="274" cy="6" r="2" fill="currentColor" opacity={active ? 0.9 : 0.5} />
    </svg>
  )
}

interface StringListProps {
  tuning: Tuning
  /** String currently detected or targeted; highlighted. */
  activeIndex: number | null
  /** Manually targeted string (null = auto mode). */
  manualIndex: number | null
  onSelect: (index: number | null) => void
  onEdit: (index: number) => void
}

export function StringList({
  tuning,
  activeIndex,
  manualIndex,
  onSelect,
  onEdit,
}: StringListProps) {
  const handleTap = (index: number) => {
    const string = tuning.strings[index]
    if (string) {
      playReferencePitch(string.pitch)
    }
    if (manualIndex === index) {
      onEdit(index)
    } else {
      onSelect(index)
    }
  }

  const displayOrder = [...tuning.strings.entries()].reverse()

  return (
    <div className="string-list">
      {displayOrder.map(([index, string]) => {
        const classes = [
          'string-button',
          index === activeIndex ? 'string-active' : '',
          index === manualIndex ? 'string-manual' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div key={index} className="string-item">
            <StringGauge pitch={string.pitch} active={index === activeIndex} />
            <button
              type="button"
              className={classes}
              onClick={() => {
                handleTap(index)
              }}
            >
              <span className="string-number">{index + 1}</span>
              <span className="string-note">{formatPitch(string.pitch)}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
