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
import type { StringAnalysis } from './core/tunings'
import { DRAFT_TUNING_ID, useTunerState, type TunerState } from './state/appState'

type Modal = { kind: 'none' } | { kind: 'presets' } | { kind: 'edit'; index: number }

function gaugeCentsFor(analysis: StringAnalysis | null): number | null {
  if (!analysis) {
    return null
  }
  if (analysis.direction === 'in-tune') {
    return 0
  }
  return analysis.cents
}

function Header({
  state,
  onOpenPresets,
}: {
  state: TunerState
  onOpenPresets: () => void
}) {
  return (
    <header className="app-header">
      <h1 className="app-title">{UI.appName}</h1>
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
        key={state.tuningsRevision}
        customTunings={state.pickerTunings}
        activeTuning={state.tuning}
        canSaveDraft={state.tuning.id === DRAFT_TUNING_ID}
        onSelect={(tuning) => {
          state.selectTuning(tuning)
          onClose()
        }}
        onSaveDraft={(name) => {
          state.saveDraft(name)
        }}
        onDeleteCustom={state.deleteCustom}
        onRenameCustom={state.renameCustom}
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
          state.refreshMyTunings()
          setModal({ kind: 'presets' })
        }}
      />
      <ModeControls state={state} />
      <TunerGauge
        cents={gaugeCentsFor(analysis)}
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
