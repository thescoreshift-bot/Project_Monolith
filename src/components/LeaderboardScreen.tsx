import type { LeaderboardRow } from '../utils/leaderboardSystem'

export function LeaderboardScreen({
  dailySeed,
  displayDate,
  rows,
  playerRank,
  loggedIn,
  loading,
  errorMessage,
  activeTab,
  onTabChange,
  onBack,
}: {
  dailySeed: string
  displayDate: string
  rows: LeaderboardRow[]
  playerRank: number | null
  loggedIn: boolean
  loading: boolean
  errorMessage?: string | null
  activeTab: 'today' | 'week' | 'all'
  onTabChange: (tab: 'today' | 'week' | 'all') => void
  onBack: () => void
}) {
  return (
    <main className="leaderboard-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Leaderboard</h1>
        <p className="screen-header__subtitle">
          {displayDate} · {dailySeed}
        </p>
      </header>

      <div className="leaderboard-screen__tabs" role="tablist">
        <button
          type="button"
          className={`btn btn--small${activeTab === 'today' ? ' btn--primary' : ''}`}
          onClick={() => onTabChange('today')}
        >
          Today
        </button>
        <button type="button" className="btn btn--small" disabled title="Coming soon">
          This Week
        </button>
        <button type="button" className="btn btn--small" disabled title="Coming soon">
          All-Time
        </button>
      </div>

      {!loggedIn && (
        <p className="leaderboard-screen__note">Login to submit scores.</p>
      )}
      {loggedIn && playerRank !== null && (
        <p className="leaderboard-screen__rank" role="status">
          Your rank today: <strong>#{playerRank}</strong>
        </p>
      )}

      {errorMessage && (
        <p className="leaderboard-screen__note leaderboard-screen__note--error" role="alert">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p>Loading leaderboard…</p>
      ) : rows.length === 0 && !errorMessage ? (
        <p className="leaderboard-screen__empty">No scores yet. Be the first!</p>
      ) : (
        <ol className="leaderboard-list">
          {rows.map((row, index) => (
            <li key={row.id} className="leaderboard-row">
              <span className="leaderboard-row__rank">#{index + 1}</span>
              <div className="leaderboard-row__body">
                <strong>{row.display_name}</strong>
                <span className="leaderboard-row__meta">
                  {row.score} pts · {row.starter_name ?? 'Unknown'} Lv
                  {row.highest_level} · {row.badges_earned} badges
                  {row.completed ? ' · Cleared' : ''}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
