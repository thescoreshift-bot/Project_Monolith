export function DailyDefeatScreen({
  attemptScore,
  bestScore,
  bestCheckpointLabel,
  newBestSaved,
  onRestart,
  onLeaderboard,
  onMenu,
}: {
  attemptScore: number
  bestScore: number
  bestCheckpointLabel: string
  newBestSaved: boolean
  onRestart: () => void
  onLeaderboard: () => void
  onMenu: () => void
}) {
  return (
    <main className="daily-defeat-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Daily Attempt Failed</h1>
        <p className="screen-header__subtitle">
          Your current attempt ended. Your best score for today is preserved.
        </p>
      </header>

      {newBestSaved && (
        <p className="daily-defeat-screen__highlight" role="status">
          New best score saved!
        </p>
      )}

      <section className="daily-defeat-screen__stats">
        <p>
          <span className="panel-label">Current attempt score</span>
          <strong>{attemptScore}</strong> (reset)
        </p>
        <p>
          <span className="panel-label">Best score today</span>
          <strong>{bestScore}</strong>
        </p>
        <p>
          <span className="panel-label">Best checkpoint</span>
          {bestCheckpointLabel}
        </p>
      </section>

      <div className="daily-defeat-screen__actions">
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          Restart Daily Attempt
        </button>
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
