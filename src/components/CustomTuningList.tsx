import { useState } from 'react'

import type { Tuning } from '../core/tunings'
import { CustomTuningRow } from './CustomTuningRow'
import { UI } from './strings'

interface CustomTuningListProps {
  tunings: Tuning[]
  showEmptyHint?: boolean
  onSelect: (tuning: Tuning) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function CustomTuningList({
  tunings,
  showEmptyHint = true,
  onSelect,
  onDelete,
  onRename,
}: CustomTuningListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const submitEdit = () => {
    if (!editingId) {
      return
    }
    const trimmed = editName.trim()
    if (trimmed !== '') {
      onRename(editingId, trimmed)
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <>
      <h3>{UI.myTunings}</h3>
      {tunings.length === 0 && showEmptyHint ? (
        <p className="hint hint-muted">{UI.noCustomTunings}</p>
      ) : (
        tunings.map((tuning) => (
          <CustomTuningRow
            key={tuning.id}
            tuning={tuning}
            editing={editingId === tuning.id}
            editName={editName}
            onSelect={onSelect}
            onDelete={onDelete}
            onStartEdit={(next) => {
              setEditingId(next.id)
              setEditName(next.name)
            }}
            onEditNameChange={setEditName}
            onSubmitEdit={submitEdit}
          />
        ))
      )}
    </>
  )
}
