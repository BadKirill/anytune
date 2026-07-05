import { formatPitch } from '../core/music'
import type { Tuning } from '../core/tunings'
import { SwipeableRow } from './SwipeableRow'
import { TextField } from './TextField'
import { UI } from './strings'

interface CustomTuningRowProps {
  tuning: Tuning
  editing: boolean
  editName: string
  onSelect: (tuning: Tuning) => void
  onDelete: (id: string) => void
  onStartEdit: (tuning: Tuning) => void
  onEditNameChange: (name: string) => void
  onSubmitEdit: () => void
}

export function CustomTuningRow({
  tuning,
  editing,
  editName,
  onSelect,
  onDelete,
  onStartEdit,
  onEditNameChange,
  onSubmitEdit,
}: CustomTuningRowProps) {
  if (editing) {
    return (
      <TextField
        value={editName}
        placeholder={UI.namePlaceholder}
        onChange={onEditNameChange}
        onSubmit={onSubmitEdit}
      />
    )
  }

  return (
    <SwipeableRow
      onDelete={() => {
        onDelete(tuning.id)
      }}
      onEdit={() => {
        onStartEdit(tuning)
      }}
    >
      <button
        type="button"
        className="list-row"
        onClick={() => {
          onSelect(tuning)
        }}
      >
        <span className="list-row-title">{tuning.name}</span>
        <span className="list-row-subtitle">
          {tuning.strings.map((s) => formatPitch(s.pitch)).join(' ')}
        </span>
      </button>
    </SwipeableRow>
  )
}
