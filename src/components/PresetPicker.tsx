import { useMemo, useState } from 'react'

import { formatPitch } from '../core/music'
import { PRESET_TUNINGS, type Instrument, type Tuning } from '../core/tunings'
import { appearsInPicker } from '../core/tunings/custom'
import { mergePickerTunings } from '../storage/customTuningsStore'
import { CustomTuningList } from './CustomTuningList'
import { Sheet } from './Sheet'
import { TextField } from './TextField'
import { UI } from './strings'

interface PresetPickerProps {
  customTunings: Tuning[]
  activeTuning: Tuning
  canSaveDraft: boolean
  onSelect: (tuning: Tuning) => void
  onSaveDraft: (name: string) => void
  onDeleteCustom: (id: string) => void
  onRenameCustom: (id: string, name: string) => void
  onClose: () => void
}

function PresetRow({
  tuning,
  onSelect,
}: {
  tuning: Tuning
  onSelect: (tuning: Tuning) => void
}) {
  return (
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
  )
}

function SaveDraftField({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (trimmed !== '') {
      onSave(trimmed)
      setName('')
    }
  }

  return (
    <div className="save-draft-block">
      <p className="hint hint-muted">{UI.saveHint}</p>
      <div className="save-draft-row">
        <TextField
          value={name}
          placeholder={UI.namePlaceholder}
          onChange={setName}
          onSubmit={submit}
        />
        <button
          type="button"
          className="button-primary save-draft-button"
          aria-label={UI.save}
          onClick={submit}
        >
          {UI.save}
        </button>
      </div>
    </div>
  )
}

function presetsFor(instrument: Instrument): Tuning[] {
  return PRESET_TUNINGS.filter((t) => t.instrument === instrument)
}

export function PresetPicker({
  customTunings,
  activeTuning,
  canSaveDraft,
  onSelect,
  onSaveDraft,
  onDeleteCustom,
  onRenameCustom,
  onClose,
}: PresetPickerProps) {
  const myTunings = useMemo(
    () => mergePickerTunings(customTunings, activeTuning),
    [activeTuning, customTunings],
  )

  return (
    <Sheet onClose={onClose} tall>
      <h2>{UI.tunings}</h2>
      {canSaveDraft && (
        <>
          <h3>{UI.saveCurrent}</h3>
          <SaveDraftField onSave={onSaveDraft} />
        </>
      )}
      <CustomTuningList
        tunings={myTunings}
        showEmptyHint={!appearsInPicker(activeTuning)}
        onSelect={onSelect}
        onDelete={onDeleteCustom}
        onRename={onRenameCustom}
      />
      <h3>{UI.guitar}</h3>
      {presetsFor('guitar').map((tuning) => (
        <PresetRow key={tuning.id} tuning={tuning} onSelect={onSelect} />
      ))}
      <h3>{UI.bass}</h3>
      {presetsFor('bass').map((tuning) => (
        <PresetRow key={tuning.id} tuning={tuning} onSelect={onSelect} />
      ))}
    </Sheet>
  )
}
