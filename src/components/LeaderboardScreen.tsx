import type { LeaderboardRow } from '../utils/leaderboardSystem'
import {
  formatLeaderboardSeedLabel,
  isCampaignLeaderboardSeed,
  parseLeaderboardCheckpointMeta,
} from '../utils/leaderboardSystem'

export function LeaderboardScreen({
  seed,
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
  seed: string
  displayDate: string
  rows: LeaderboardRow[]
  playerRank: number | null
  loggedIn: boolean
  loading: boolean
  errorMessage?: string | null
  activeTab: 'daily' | 'campaign'
  onTabChange: (tab: 'daily' | 'campaign') => void
  onBack: () => void
}) {
  const isCampaign = isCampaignLeaderboardSeed(seed) || activeTab === 'campaign'

  return (
    <main className="leaderboard-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Leaderboard</h1>
        <p className="screen-header__subtitle">
          {isCampaign ? formatLeaderboardSeedLabel(seed) : `${displayDate} · ${seed}`}
        </p>
      </header>

      <div className="leaderboard-screen__tabs" role="tablist">
        <button
          type="button"
          className={`btn btn--small${activeTab === 'daily' ? ' btn--primary' : ''}`}
          onClick={() => onTabChange('daily')}
        >
          Daily Run
        </button>
        <button
          type="button"
          className={`btn btn--small${activeTab === 'campaign' ? ' btn--primary' : ''}`}
          onClick={() => onTabChange('campaign')}
        >
          Campaign
        </button>
      </div>

      <p className="leaderboard-screen__note">
        {isCampaign
          ? 'Campaign tracks your furthest progression on a save slot. Defeats do not reset your entry — only improvements are posted.'
          : 'Daily Run uses one life per attempt. Your best score for today is kept and ranked.'}
      </p>

      {!loggedIn && (
        <p className="leaderboard-screen__note">Login to submit scores.</p>
      )}
      {loggedIn && playerRank !== null && (
        <p className="leaderboard-screen__rank" role="status">
          Your rank: <strong>#{playerRank}</strong>
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
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Region</th>
                <th>Badges</th>
                <th>Nodes</th>
                <th>Highest Lv</th>
                <th>Evolutions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const meta = parseLeaderboardCheckpointMeta(row.final_team)
                return (
                  <tr key={row.id}>
                    <td>#{index + 1}</td>
                    <td>{row.display_name}</td>
                    <td>{row.score}</td>
                    <td>{row.region ?? '—'}</td>
                    <td>{row.badges_earned}</td>
                    <td>{meta?.nodesCleared ?? '—'}</td>
                    <td>{row.highest_level}</td>
                    <td>{row.evolutions_count}</td>
                    <td>{row.completed ? 'Cleared' : 'In progress'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
