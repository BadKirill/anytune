import { useState } from 'react'

import { formatPitch } from '../core/music'
import { PRESET_TUNINGS, type Instrument, type Tuning } from '../core/tunings'
import { UI } from './strings'

interface PresetPickerProps {
  customTunings: Tuning[]
  canSaveDraft: boolean
  onSelect: (tuning: Tuning) => void
  onSaveDraft: (name: string) => void
  onDeleteCustom: (id: string) => void
  onClose: () => void
}

function tuningSummary(tuning: Tuning): string {
  return tuning.strings.map((s) => formatPitch(s.pitch)).join(' ')
}

function TuningRow({
  tuning,
  onSelect,
  onDelete,
}: {
  tuning: Tuning
  onSelect: (tuning: Tuning) => void
  onDelete?: (id: string) => void
}) {
  return (
    <div className="tuning-row">
      <button
        type="button"
        className="tuning-row-main"
        onClick={() => {
          onSelect(tuning)
        }}
      >
        <span className="tuning-name">{tuning.name}</span>
        <span className="tuning-notes">{tuningSummary(tuning)}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          className="button-danger"
          onClick={() => {
            onDelete(tuning.id)
          }}
        >
          {UI.delete}
        </button>
      )}
    </div>
  )
}

function SaveDraftForm({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="save-form">
      <input
        type="text"
        value={name}
        placeholder={UI.namePlaceholder}
        onChange={(event) => {
          setName(event.target.value)
        }}
      />
      <button
        type="button"
        className="button-primary"
        disabled={name.trim() === ''}
        onClick={() => {
          onSave(name.trim())
        }}
      >
        {UI.save}
      </button>
    </div>
  )
}

function presetsFor(instrument: Instrument): Tuning[] {
  return PRESET_TUNINGS.filter((t) => t.instrument === instrument)
}

export function PresetPicker({
  customTunings,
  canSaveDraft,
  onSelect,
  onSaveDraft,
  onDeleteCustom,
  onClose,
}: PresetPickerProps) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet sheet-tall"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <h2>{UI.tunings}</h2>
        {canSaveDraft && <SaveDraftForm onSave={onSaveDraft} />}
        <h3>{UI.guitar}</h3>
        {presetsFor('guitar').map((tuning) => (
          <TuningRow key={tuning.id} tuning={tuning} onSelect={onSelect} />
        ))}
        <h3>{UI.bass}</h3>
        {presetsFor('bass').map((tuning) => (
          <TuningRow key={tuning.id} tuning={tuning} onSelect={onSelect} />
        ))}
        {customTunings.length > 0 && <h3>{UI.myTunings}</h3>}
        {customTunings.map((tuning) => (
          <TuningRow
            key={tuning.id}
            tuning={tuning}
            onSelect={onSelect}
            onDelete={onDeleteCustom}
          />
        ))}
        <div className="sheet-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            {UI.close}
          </button>
        </div>
      </div>
    </div>
  )
}
