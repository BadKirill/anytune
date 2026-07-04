import { useState } from 'react'

import './App.css'
import { InstallHint } from './components/InstallHint'
import { NotePicker } from './components/NotePicker'
import { PresetPicker } from './components/PresetPicker'
import { StringList } from './components/StringList'
import { TuneDirectionHint } from './components/TuneDirectionHint'
import { TunerGauge } from './components/TunerGauge'
import { UI } from './components/strings'
import { formatPitch } from './core/music'
import { DRAFT_TUNING_ID, useTunerState, type TunerState } from './state/appState'

type Modal = { kind: 'none' } | { kind: 'presets' } | { kind: 'edit'; index: number }

function Header({
  state,
  onOpenPresets,
}: {
  state: TunerState
  onOpenPresets: () => void
}) {
  return (
    <header className="app-header">
      <h1 className="app-title">
        any<span>tune</span>
      </h1>
      <button type="button" className="tuning-picker-button" onClick={onOpenPresets}>
        {state.tuning.name}
      </button>
    </header>
  )
}

function ModeControls({ state }: { state: TunerState }) {
  const listening = state.pitch.status === 'listening'
  const auto = state.manualStringIndex === null
  return (
    <div className="mode-row">
      <button
        type="button"
        className={auto ? 'chip chip-selected' : 'chip'}
        onClick={() => {
          state.selectString(null)
        }}
      >
        {UI.auto}
      </button>
      <button
        type="button"
        className={listening ? 'button-secondary' : 'button-primary'}
        onClick={listening ? state.pitch.stop : state.pitch.start}
      >
        {listening ? UI.stopListening : UI.startListening}
      </button>
    </div>
  )
}

function Modals({
  state,
  modal,
  onClose,
}: {
  state: TunerState
  modal: Modal
  onClose: () => void
}) {
  if (modal.kind === 'presets') {
    return (
      <PresetPicker
        customTunings={state.customTunings}
        canSaveDraft={state.tuning.id === DRAFT_TUNING_ID}
        onSelect={(tuning) => {
          state.selectTuning(tuning)
          onClose()
        }}
        onSaveDraft={(name) => {
          state.saveDraft(name)
          onClose()
        }}
        onDeleteCustom={state.deleteCustom}
        onClose={onClose}
      />
    )
  }
  if (modal.kind === 'edit') {
    const string = state.tuning.strings[modal.index]
    if (!string) {
      return null
    }
    return (
      <NotePicker
        initial={string.pitch}
        onConfirm={(pitch) => {
          state.editString(modal.index, pitch)
          onClose()
        }}
        onClose={onClose}
      />
    )
  }
  return null
}

function App() {
  const state = useTunerState()
  const [modal, setModal] = useState<Modal>({ kind: 'none' })
  const { tuning, analysis, pitch, manualStringIndex } = state

  const targetIndex = manualStringIndex ?? analysis?.stringIndex ?? null
  const targetString = targetIndex === null ? undefined : tuning.strings[targetIndex]

  return (
    <div className="app">
      <InstallHint />
      <Header
        state={state}
        onOpenPresets={() => {
          setModal({ kind: 'presets' })
        }}
      />
      <ModeControls state={state} />
      <TunerGauge
        cents={analysis?.cents ?? null}
        targetLabel={targetString ? formatPitch(targetString.pitch) : null}
        inTune={analysis?.direction === 'in-tune'}
      />
      <TuneDirectionHint
        pitch={pitch}
        analysis={analysis}
        tuning={tuning}
        manualMode={manualStringIndex !== null}
      />
      <StringList
        tuning={tuning}
        activeIndex={targetIndex}
        manualIndex={manualStringIndex}
        onSelect={state.selectString}
        onEdit={(index) => {
          setModal({ kind: 'edit', index })
        }}
      />
      <Modals
        state={state}
        modal={modal}
        onClose={() => {
          setModal({ kind: 'none' })
        }}
      />
    </div>
  )
}

export default App
