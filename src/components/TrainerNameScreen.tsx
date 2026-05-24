import { useState } from 'react'
import {
  normalizeSaveSlotName,
  validateSaveSlotName,
} from '../utils/saveSlotMeta'
import type { SaveSlotId } from '../utils/saveSystem'

type TrainerNameScreenProps = {
  slotId: SaveSlotId
  mode: 'newGame' | 'rename'
  initialName?: string
  busy?: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function TrainerNameScreen({
  slotId,
  mode,
  initialName = '',
  busy = false,
  onConfirm,
  onCancel,
}: TrainerNameScreenProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validateSaveSlotName(name)
    if (validation) {
      setError(validation)
      return
    }
    setError(null)
    onConfirm(normalizeSaveSlotName(name))
  }

  return (
    <main className="trainer-name-screen">
      <div className="trainer-name-screen__dialog">
        <header className="screen-header">
          <h1 className="screen-header__title">Name Your Trainer</h1>
          <p className="screen-header__subtitle">
            {mode === 'rename'
              ? `Rename save file for Slot ${slotId}. This name appears on leaderboards.`
              : `Choose a name for Slot ${slotId}. This is your save file and trainer name.`}
          </p>
        </header>

        <form className="trainer-name-screen__form" onSubmit={handleSubmit}>
          <label className="trainer-name-screen__label" htmlFor="trainer-name-input">
            Trainer / save name
          </label>
          <input
            id="trainer-name-input"
            className="trainer-name-screen__input"
            type="text"
            maxLength={16}
            autoComplete="off"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. AshRunner"
          />
          <p className="trainer-name-screen__hint">
            3–16 characters · letters, numbers, spaces, _ and -
          </p>
          {error && (
            <p className="trainer-name-screen__error" role="alert">
              {error}
            </p>
          )}
          <div className="trainer-name-screen__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={busy}
            >
              {mode === 'rename' ? 'Save Name' : 'Continue'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
