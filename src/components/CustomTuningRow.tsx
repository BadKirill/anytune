import { formatPitch } from '../core/music'
import type { Tuning } from '../core/tunings'
import { TextField } from './TextField'
import { UI } from './strings'

function CustomTuningEditRow({
  editName,
  onEditNameChange,
  onSubmitEdit,
}: {
  editName: string
  onEditNameChange: (name: string) => void
  onSubmitEdit: () => void
}) {
  return (
    <div className="custom-tuning-item">
      <div className="save-draft-row">
        <TextField
          value={editName}
          placeholder={UI.namePlaceholder}
          onChange={onEditNameChange}
          onSubmit={onSubmitEdit}
        />
        <button type="button" className="button-primary" onClick={onSubmitEdit}>
          {UI.save}
        </button>
      </div>
    </div>
  )
}

function CustomTuningDisplayRow({
  tuning,
  onSelect,
  onDelete,
  onStartEdit,
}: {
  tuning: Tuning
  onSelect: (tuning: Tuning) => void
  onDelete: (id: string) => void
  onStartEdit: (tuning: Tuning) => void
}) {
  return (
    <div className="custom-tuning-item">
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
      <div className="custom-tuning-actions">
        <button
          type="button"
          className="custom-tuning-action"
          onClick={() => {
            onStartEdit(tuning)
          }}
        >
          {UI.rename}
        </button>
        <button
          type="button"
          className="custom-tuning-action custom-tuning-action-danger"
          onClick={() => {
            onDelete(tuning.id)
          }}
        >
          {UI.delete}
        </button>
      </div>
    </div>
  )
}

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

export function CustomTuningRow(props: CustomTuningRowProps) {
  if (props.editing) {
    return (
      <CustomTuningEditRow
        editName={props.editName}
        onEditNameChange={props.onEditNameChange}
        onSubmitEdit={props.onSubmitEdit}
      />
    )
  }

  return (
    <CustomTuningDisplayRow
      tuning={props.tuning}
      onSelect={props.onSelect}
      onDelete={props.onDelete}
      onStartEdit={props.onStartEdit}
    />
  )
}
