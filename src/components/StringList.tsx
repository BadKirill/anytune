import { formatPitch, pitchToMidi, type Pitch } from '../core/music'
import type { Tuning } from '../core/tunings'

/** Visual string thickness in px: lower pitch = thicker string, like real gauges. */
function stringThickness(pitch: Pitch): number {
  const midi = pitchToMidi(pitch)
  const E4_MIDI = 64
  return Math.min(5, Math.max(1.2, (E4_MIDI - midi) * 0.12 + 1.2))
}

const NECK_PADDING_X = 14
const NECK_PADDING_Y = 10
const STRING_GAP = 14

function neckHeight(stringCount: number): number {
  return NECK_PADDING_Y * 2 + (stringCount - 1) * STRING_GAP
}

function stringY(visualIndex: number): number {
  return NECK_PADDING_Y + visualIndex * STRING_GAP
}

function NeckStringLine({
  pitch,
  visualIndex,
  active,
  lineEnd,
  sourceIndex,
}: {
  pitch: Pitch
  visualIndex: number
  active: boolean
  lineEnd: number
  sourceIndex: number
}) {
  const y = stringY(visualIndex)
  const thickness = stringThickness(pitch)
  const lineClass = active
    ? 'string-neck-line string-neck-line-active'
    : 'string-neck-line'
  const pinClass = active ? 'string-neck-pin string-neck-pin-active' : 'string-neck-pin'
  return (
    <g key={sourceIndex}>
      <circle cx={NECK_PADDING_X} cy={y} r="1.6" className={pinClass} />
      <line
        x1={NECK_PADDING_X}
        y1={y}
        x2={lineEnd}
        y2={y}
        className={lineClass}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      <circle cx={lineEnd} cy={y} r="1.6" className={pinClass} />
    </g>
  )
}

function GuitarNeck({
  strings,
  activeIndex,
}: {
  strings: Tuning['strings']
  activeIndex: number | null
}) {
  const count = strings.length
  const height = neckHeight(count)
  const width = 120
  const lineEnd = width - NECK_PADDING_X

  return (
    <svg
      className="string-neck-svg"
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width={width - 2}
        height={height - 2}
        rx="10"
        className="string-neck-board"
      />
      {strings.map((string, visualIndex) => (
        <NeckStringLine
          key={count - 1 - visualIndex}
          sourceIndex={count - 1 - visualIndex}
          pitch={string.pitch}
          visualIndex={visualIndex}
          active={count - 1 - visualIndex === activeIndex}
          lineEnd={lineEnd}
        />
      ))}
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
    if (manualIndex === index) {
      onEdit(index)
    } else {
      onSelect(index)
    }
  }

  const displayOrder = [...tuning.strings.entries()].reverse()

  return (
    <div className="string-neck">
      <GuitarNeck strings={tuning.strings} activeIndex={activeIndex} />
      <div className="string-neck-notes">
        {displayOrder.map(([index, string]) => {
          const classes = [
            'string-button',
            index === activeIndex ? 'string-active' : '',
            index === manualIndex ? 'string-manual' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={index}
              type="button"
              className={classes}
              onClick={() => {
                handleTap(index)
              }}
            >
              <span className="string-number">{index + 1}</span>
              <span className="string-note">{formatPitch(string.pitch)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
