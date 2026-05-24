import { useState } from 'react'
import type { PvpChallenge } from '../utils/pvpSystem'
import { summarizePvpTeam } from '../utils/pvpSystem'

export function FriendBattleScreen({
  loggedIn,
  hasActiveRun,
  myChallenge,
  lookupChallenge,
  lookupCode,
  onLookupCodeChange,
  onGenerateCode,
  onFindChallenge,
  onChallengeTeam,
  onCopyCode,
  busy,
  message,
  resultMessage,
  onBack,
}: {
  loggedIn: boolean
  hasActiveRun: boolean
  myChallenge: PvpChallenge | null
  lookupChallenge: PvpChallenge | null
  lookupCode: string
  onLookupCodeChange: (code: string) => void
  onGenerateCode: () => void
  onFindChallenge: () => void
  onChallengeTeam: () => void
  onCopyCode: (code: string) => void
  busy: boolean
  message: string | null
  resultMessage: string | null
  onBack: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy(code: string) {
    onCopyCode(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="friend-battle-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Friend Battle</h1>
        <p className="screen-header__subtitle">
          Friend Battle uses an AI-controlled copy of your friend&apos;s team. This
          is not live real-time PvP yet.
        </p>
      </header>

      {message && (
        <p className="friend-battle-screen__message" role="status">
          {message}
        </p>
      )}

      {resultMessage && (
        <p className="friend-battle-screen__result" role="status">
          {resultMessage}
        </p>
      )}

      <section className="friend-battle-screen__panel">
        <h2 className="panel-label">Generate Friend Code</h2>
        {!loggedIn && (
          <p className="friend-battle-screen__hint">
            Login to generate and share a friend code.
          </p>
        )}
        {loggedIn && !hasActiveRun && (
          <p className="friend-battle-screen__hint">
            Continue a run from Play to generate a code from your current team.
          </p>
        )}
        {myChallenge ? (
          <div className="friend-battle-screen__code-box">
            <p>
              Your active code: <strong>{myChallenge.code}</strong>
            </p>
            <p className="friend-battle-screen__hint">
              Team power {myChallenge.team_power} · Highest Lv.{' '}
              {myChallenge.highest_level} · {myChallenge.badges_count} badges
            </p>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => handleCopy(myChallenge.code)}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            disabled={!loggedIn || !hasActiveRun || busy}
            onClick={onGenerateCode}
          >
            {busy ? 'Generating…' : 'Generate Friend Code'}
          </button>
        )}
      </section>

      <section className="friend-battle-screen__panel">
        <h2 className="panel-label">Enter Friend Code</h2>
        <div className="friend-battle-screen__lookup">
          <input
            type="text"
            className="friend-battle-screen__input"
            placeholder="MONO-7K2Q"
            value={lookupCode}
            onChange={(e) => onLookupCodeChange(e.target.value)}
          />
          <button
            type="button"
            className="btn"
            disabled={busy || !lookupCode.trim()}
            onClick={onFindChallenge}
          >
            Find Challenge
          </button>
        </div>

        {lookupChallenge && (
          <div className="friend-battle-screen__preview">
            <p>
              <strong>{lookupChallenge.creator_display_name}</strong>&apos;s team
            </p>
            <p>{summarizePvpTeam(lookupChallenge.team_snapshot)}</p>
            <p className="friend-battle-screen__hint">
              Highest Lv. {lookupChallenge.highest_level} · Badges{' '}
              {lookupChallenge.badges_count} · Power {lookupChallenge.team_power}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!hasActiveRun || busy}
              onClick={onChallengeTeam}
            >
              Challenge Team
            </button>
            {!hasActiveRun && (
              <p className="friend-battle-screen__hint">
                Continue a run to challenge this team.
              </p>
            )}
          </div>
        )}
      </section>

      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
