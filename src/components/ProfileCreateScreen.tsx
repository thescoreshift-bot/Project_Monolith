import { useState } from 'react'

export function ProfileCreateScreen({
  onSubmit,
  onBack,
  loading,
}: {
  onSubmit: (displayName: string) => Promise<void>
  onBack: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create profile.')
    }
  }

  return (
    <main className="auth-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Create Profile</h1>
        <p className="screen-header__subtitle">
          Choose a display name for leaderboards and online play (3–16 characters).
        </p>
      </header>
      <form className="auth-screen__form" onSubmit={handleSubmit}>
        <label className="auth-screen__field">
          <span className="panel-label">Display name</span>
          <input
            type="text"
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            placeholder="MonolithRunner"
            required
          />
        </label>
        {error && (
          <p className="auth-screen__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : 'Create Profile'}
        </button>
        <button type="button" className="btn" onClick={onBack} disabled={loading}>
          Back
        </button>
      </form>
    </main>
  )
}
