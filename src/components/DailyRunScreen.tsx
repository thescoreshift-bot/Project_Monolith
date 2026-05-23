import type { DailyModifier } from '../utils/dailyRun'

export function DailyRunScreen({
  dailySeed,
  displayDate,
  regionName,
  modifier,
  loggedIn,
  hasProfile,
  inProgress,
  onStart,
  onContinue,
  onLeaderboard,
  onBack,
}: {
  dailySeed: string
  displayDate: string
  regionName: string
  modifier: DailyModifier
  loggedIn: boolean
  hasProfile: boolean
  inProgress: boolean
  onStart: () => void
  onContinue: () => void
  onLeaderboard: () => void
  onBack: () => void
}) {
  return (
    <main className="daily-run-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Daily Run</h1>
        <p className="screen-header__subtitle">
          Everyone plays the same route today. Compete on the leaderboard.
        </p>
      </header>

      <section className="daily-run-screen__card">
        <p>
          <span className="panel-label">Today&apos;s seed</span>
          <strong>{dailySeed}</strong>
        </p>
        <p>
          <span className="panel-label">Date</span>
          {displayDate}
        </p>
        <p>
          <span className="panel-label">Region</span>
          {regionName}
        </p>
        <p>
          <span className="panel-label">Daily modifier</span>
          <strong>{modifier.name}</strong> — {modifier.description}
        </p>
      </section>

      {!loggedIn && (
        <p className="daily-run-screen__note">
          Offline mode: play the daily route locally. Login to submit scores to the
          leaderboard.
        </p>
      )}
      {loggedIn && !hasProfile && (
        <p className="daily-run-screen__note" role="alert">
          Create a display name before submitting leaderboard scores.
        </p>
      )}

      <div className="daily-run-screen__actions">
        {inProgress ? (
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            Continue Daily Run
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onStart}>
            Start Daily Run
          </button>
        )}
        <button type="button" className="btn" onClick={onLeaderboard}>
          View Leaderboard
        </button>
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
      </div>
    </main>
  )
}
