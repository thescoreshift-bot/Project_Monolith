export function DailyRunScreen({
  dailySeed,
  displayDate,
  regionName,
  modifier,
  loggedIn,
  hasProfile,
  hasActiveAttempt,
  hasDayRecord,
  currentAttemptScore,
  bestScore,
  currentCheckpointLabel,
  bestCheckpointLabel,
  totalAttempts,
  deathsThisAttempt,
  playerRank,
  onStartAttempt,
  onContinueAttempt,
  onRestartAttempt,
  onSubmitBest,
  onLeaderboard,
  onBack,
  submitBusy,
  submitMessage,
}: {
  dailySeed: string
  displayDate: string
  regionName: string
  modifier: import('../utils/dailyRun').DailyModifier
  loggedIn: boolean
  hasProfile: boolean
  hasActiveAttempt: boolean
  hasDayRecord: boolean
  currentAttemptScore: number
  bestScore: number
  currentCheckpointLabel: string
  bestCheckpointLabel: string
  totalAttempts: number
  deathsThisAttempt: number
  playerRank: number | null
  onStartAttempt: () => void
  onContinueAttempt: () => void
  onRestartAttempt: () => void
  onSubmitBest: () => void
  onLeaderboard: () => void
  onBack: () => void
  submitBusy?: boolean
  submitMessage?: string | null
}) {
  return (
    <main className="daily-run-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Daily Run</h1>
        <p className="screen-header__subtitle">
          Best survival record for today&apos;s seed. Current attempts reset on death;
          your best score is kept.
        </p>
      </header>

      <section className="daily-run-screen__card">
        <p>
          <span className="panel-label">Daily seed</span>
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

      <section className="daily-run-screen__scores">
        <p>
          <span className="panel-label">Current attempt score</span>
          <strong>{currentAttemptScore}</strong>
        </p>
        <p>
          <span className="panel-label">Best score</span>
          <strong>{bestScore}</strong>
        </p>
        <p>
          <span className="panel-label">Current checkpoint</span>
          {currentCheckpointLabel}
        </p>
        <p>
          <span className="panel-label">Best checkpoint</span>
          {bestCheckpointLabel}
        </p>
        <p>
          <span className="panel-label">Attempts today</span>
          {totalAttempts}
        </p>
        <p>
          <span className="panel-label">Deaths this attempt</span>
          {deathsThisAttempt}
        </p>
        {playerRank !== null && (
          <p className="daily-run-screen__rank" role="status">
            Your leaderboard rank: <strong>#{playerRank}</strong>
          </p>
        )}
      </section>

      {!loggedIn && (
        <p className="daily-run-screen__note">
          Offline mode: track your best run locally. Login to submit to the leaderboard.
        </p>
      )}
      {loggedIn && !hasProfile && (
        <p className="daily-run-screen__note" role="alert">
          Create a display name before submitting leaderboard scores.
        </p>
      )}

      {submitMessage && (
        <p className="daily-run-screen__note" role="status">
          {submitMessage}
        </p>
      )}

      <div className="daily-run-screen__actions">
        {hasActiveAttempt ? (
          <button type="button" className="btn btn--primary" onClick={onContinueAttempt}>
            Continue Current Attempt
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onStartAttempt}>
            {hasDayRecord ? 'Start New Attempt' : 'Start Daily Run'}
          </button>
        )}
        {hasActiveAttempt && (
          <button type="button" className="btn" onClick={onRestartAttempt}>
            Restart Attempt
          </button>
        )}
        {loggedIn && hasProfile && bestScore > 0 && (
          <button
            type="button"
            className="btn"
            disabled={submitBusy}
            onClick={onSubmitBest}
          >
            {submitBusy ? 'Submitting…' : 'Submit Best Score'}
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
