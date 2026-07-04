import { useState } from 'react'

import { NOTE_NAMES, type NoteName, type Pitch } from '../core/music'
import { useLockBodyScroll } from './useLockBodyScroll'
import { UI } from './strings'

const OCTAVES = [0, 1, 2, 3, 4, 5, 6]

interface NotePickerProps {
  initial: Pitch
  onConfirm: (pitch: Pitch) => void
  onClose: () => void
}

function ChipGrid<T extends string | number>({
  values,
  selected,
  onPick,
}: {
  values: readonly T[]
  selected: T
  onPick: (value: T) => void
}) {
  return (
    <div className="note-grid">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          className={value === selected ? 'chip chip-selected' : 'chip'}
          onClick={() => {
            onPick(value)
          }}
        >
          {value}
        </button>
      ))}
    </div>
  )
}

export function NotePicker({ initial, onConfirm, onClose }: NotePickerProps) {
  const [note, setNote] = useState<NoteName>(initial.note)
  const [octave, setOctave] = useState<number>(initial.octave)
  useLockBodyScroll()

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <h2>{UI.pickNote}</h2>
        <ChipGrid values={NOTE_NAMES} selected={note} onPick={setNote} />
        <h3>{UI.octave}</h3>
        <ChipGrid values={OCTAVES} selected={octave} onPick={setOctave} />
        <div className="sheet-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            {UI.close}
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              onConfirm({ note, octave })
            }}
          >
            {UI.done}
          </button>
        </div>
      </div>
    </div>
  )
}
