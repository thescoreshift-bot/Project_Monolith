import { useState } from 'react'

export function LoginScreen({
  onLogin,
  onBack,
  loading,
}: {
  onLogin: (email: string, password: string) => Promise<void>
  onBack: () => void
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onLogin(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    }
  }

  return (
    <main className="auth-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Login</h1>
        <p className="screen-header__subtitle">Sign in to sync cloud saves across devices.</p>
      </header>
      <form className="auth-screen__form" onSubmit={handleSubmit}>
        <label className="auth-screen__field">
          <span className="panel-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth-screen__field">
          <span className="panel-label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="auth-screen__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <button type="button" className="btn" onClick={onBack} disabled={loading}>
          Back
        </button>
      </form>
    </main>
  )
}

export function RegisterScreen({
  onRegister,
  onBack,
  loading,
}: {
  onRegister: (email: string, password: string) => Promise<void>
  onBack: () => void
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      await onRegister(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    }
  }

  return (
    <main className="auth-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Create Account</h1>
        <p className="screen-header__subtitle">Register to store two cloud save slots.</p>
      </header>
      <form className="auth-screen__form" onSubmit={handleSubmit}>
        <label className="auth-screen__field">
          <span className="panel-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth-screen__field">
          <span className="panel-label">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="auth-screen__field">
          <span className="panel-label">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="auth-screen__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
        <button type="button" className="btn" onClick={onBack} disabled={loading}>
          Back
        </button>
      </form>
    </main>
  )
}

export function AccountScreen({
  email,
  displayName,
  cloudConfigured,
  cloudSlotCount,
  onLogout,
  onBack,
  onChangeUsername,
  usernameBusy,
  usernameError,
  loggingOut,
}: {
  email: string
  displayName?: string
  cloudConfigured: boolean
  cloudSlotCount: number
  onLogout: () => void
  onBack: () => void
  onChangeUsername: (newName: string) => Promise<void>
  usernameBusy?: boolean
  usernameError?: string | null
  loggingOut: boolean
}) {
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(displayName ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    try {
      await onChangeUsername(newName)
      setEditingName(false)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not update name.')
    }
  }

  const nameError = localError ?? usernameError

  return (
    <main className="auth-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Account</h1>
        <p className="screen-header__subtitle">Cloud save profile</p>
      </header>
      <div className="auth-screen__info">
        <p>
          <span className="panel-label">Email</span>
          {email}
        </p>
        <p>
          <span className="panel-label">Trainer name</span>
          {displayName ?? 'Not set — create one when using Daily Run or Play'}
        </p>
        {!editingName ? (
          <button
            type="button"
            className="btn btn--small"
            onClick={() => {
              setNewName(displayName ?? '')
              setLocalError(null)
              setEditingName(true)
            }}
            disabled={!cloudConfigured || loggingOut}
          >
            Change Username
          </button>
        ) : (
          <form className="auth-screen__inline-form" onSubmit={(e) => void handleSaveUsername(e)}>
            <label className="auth-screen__field">
              <span className="panel-label">New trainer name</span>
              <input
                type="text"
                value={newName}
                maxLength={16}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </label>
            {nameError && (
              <p className="auth-screen__error" role="alert">
                {nameError}
              </p>
            )}
            <div className="auth-screen__inline-actions">
              <button type="submit" className="btn btn--primary btn--small" disabled={usernameBusy}>
                {usernameBusy ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => setEditingName(false)}
                disabled={usernameBusy}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        <p>
          <span className="panel-label">Save mode</span>
          Cloud
        </p>
        <p>
          <span className="panel-label">Cloud saves</span>
          {!cloudConfigured
            ? 'Supabase not configured — add .env keys to enable cloud saves.'
            : `${cloudSlotCount} / 2 slots in use`}
        </p>
      </div>
      <div className="auth-screen__actions">
        <button type="button" className="btn btn--primary" onClick={onLogout} disabled={loggingOut}>
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
        <button type="button" className="btn" onClick={onBack} disabled={loggingOut}>
          Back
        </button>
      </div>
    </main>
  )
}
