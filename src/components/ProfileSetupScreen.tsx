import { useState } from 'react'
import { validateDisplayName } from '../utils/profileSystem'

export function ProfileSetupScreen({
  onSubmit,
  onBack,
  loading,
  setupError,
}: {
  onSubmit: (displayName: string) => Promise<void>
  onBack: () => void
  loading: boolean
  setupError?: string | null
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validateDisplayName(name)
    if (validation) {
      setError(validation)
      return
    }
    setError(null)
    try {
      await onSubmit(name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create trainer name.')
    }
  }

  const displayError = error ?? setupError

  return (
    <main className="auth-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Create Your Trainer Name</h1>
        <p className="screen-header__subtitle">
          This name will appear on leaderboards and online features.
        </p>
      </header>
      <form className="auth-screen__form" onSubmit={(e) => void handleSubmit(e)}>
        <label className="auth-screen__field">
          <span className="panel-label">Trainer name</span>
          <input
            type="text"
            value={name}
            maxLength={16}
            autoComplete="nickname"
            onChange={(e) => setName(e.target.value)}
            placeholder="MonolithRunner"
            required
          />
        </label>
        <p className="auth-screen__hint">
          3–16 characters · letters, numbers, spaces, _ and -
        </p>
        {displayError && (
          <p className="auth-screen__error" role="alert">
            {displayError}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create'}
        </button>
        <button type="button" className="btn" onClick={onBack} disabled={loading}>
          Back
        </button>
      </form>
    </main>
  )
}
