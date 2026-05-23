import type { RunScoreSnapshot } from '../utils/runScore'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'

export function RunSummaryScreen({
  dailySeed,
  score,
  starter,
  recruits,
  badgesEarned,
  evolutionsCount,
  loggedIn,
  hasProfile,
  submitBusy,
  submitMessage,
  onSubmit,
  onLeaderboard,
  onMenu,
}: {
  dailySeed: string
  score: RunScoreSnapshot
  starter: RunCreature
  recruits: PartyCreature[]
  badgesEarned: number
  evolutionsCount: number
  loggedIn: boolean
  hasProfile: boolean
  submitBusy: boolean
  submitMessage: string | null
  onSubmit: () => void
  onLeaderboard: () => void
  onMenu: () => void
}) {
  const party = [starter, ...recruits]

  return (
    <main className="run-summary-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Run Summary</h1>
        <p className="screen-header__subtitle">{dailySeed}</p>
      </header>

      <section className="run-summary-screen__score">
        <p className="run-summary-screen__total">
          Final score: <strong>{score.total}</strong>
        </p>
        <p className="panel-label">Score breakdown</p>
        <ul className="run-summary-screen__breakdown">
          {score.breakdown.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <span className={line.points < 0 ? 'run-summary-screen__neg' : ''}>
                {line.points > 0 ? '+' : ''}
                {line.points}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="run-summary-screen__team">
        <p className="panel-label">Final team</p>
        <ul>
          {party.map((c) => (
            <li key={c === starter ? 'starter' : (c as PartyCreature).id}>
              {c.name} · {c.type} · Lv {c.level} · HP {c.currentHp}/{c.maxHp}
            </li>
          ))}
        </ul>
        <p>
          Badges: {badgesEarned} · Evolutions: {evolutionsCount}
        </p>
      </section>

      {submitMessage && (
        <p className="run-summary-screen__msg" role="status">
          {submitMessage}
        </p>
      )}

      <div className="run-summary-screen__actions">
        {loggedIn && hasProfile ? (
          <button
            type="button"
            className="btn btn--primary"
            disabled={submitBusy}
            onClick={onSubmit}
          >
            {submitBusy ? 'Submitting…' : 'Submit Score'}
          </button>
        ) : (
          <p className="run-summary-screen__note">
            {!loggedIn
              ? 'Login required to submit to leaderboard.'
              : 'Create a display name on your account to submit scores.'}
          </p>
        )}
        <button type="button" className="btn" onClick={onLeaderboard}>
          View Leaderboard
        </button>
        <button type="button" className="btn" onClick={onMenu}>
          Return to Menu
        </button>
      </div>
    </main>
  )
}
