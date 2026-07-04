import { formatPitch } from '../core/music'
import type { Tuning } from '../core/tunings'

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

  return (
    <div className="string-list">
      {tuning.strings.map((string, index) => {
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
  )
}
