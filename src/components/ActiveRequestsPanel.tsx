import type { RequestQuestDefinition } from '../data/requestQuests'
import { getRequestQuestById } from '../data/requestQuests'
import type {
  RequestQuestProgressEntry,
  RequestQuestState,
} from '../utils/requestQuestSystem'
import {
  formatRequestQuestProgress,
  getActiveRequestQuests,
  getCompletedUnclaimedRequestQuests,
} from '../utils/requestQuestSystem'

export function ActiveRequestsPanel({
  state,
  message,
  onClaim,
  onAbandon,
}: {
  state: RequestQuestState
  message: string | null
  onClaim: (questId: string) => void
  onAbandon: (questId: string) => void
}) {
  const active = getActiveRequestQuests(state).filter((q) => {
    const entry = state.progress[q.id]
    return entry && !entry.completed
  })
  const claimable = getCompletedUnclaimedRequestQuests(state)
  const claimed = state.claimedRequests
    .map((id) => getRequestQuestById(id))
    .filter((q): q is RequestQuestDefinition => q != null)
    .slice(-5)

  return (
    <section className="quest-board" aria-label="Active requests">
      <h2 className="panel-label">Active Requests</h2>

      {message && (
        <p className="quest-board__message" role="status">
          {message}
        </p>
      )}

      {claimable.length > 0 && (
        <div className="quest-board__section">
          <h3 className="quest-board__section-title">
            Ready to Claim
            <span className="quest-board__badge" aria-hidden>
              !
            </span>
          </h3>
          <ul className="quest-board__list">
            {claimable.map((quest) => (
              <RequestProgressCard
                key={quest.id}
                quest={quest}
                entry={state.progress[quest.id]!}
                showClaim
                onClaim={onClaim}
                onAbandon={onAbandon}
              />
            ))}
          </ul>
        </div>
      )}

      {active.length > 0 ? (
        <div className="quest-board__section">
          <h3 className="quest-board__section-title">In Progress</h3>
          <ul className="quest-board__list">
            {active.map((quest) => (
              <RequestProgressCard
                key={quest.id}
                quest={quest}
                entry={state.progress[quest.id]}
                onClaim={onClaim}
                onAbandon={onAbandon}
              />
            ))}
          </ul>
        </div>
      ) : (
        claimable.length === 0 && (
          <p className="quest-board__empty">No active requests. Visit Request Quests to accept work.</p>
        )
      )}

      {claimed.length > 0 && (
        <div className="quest-board__section quest-board__section--muted">
          <h3 className="quest-board__section-title">Recently Claimed</h3>
          <ul className="quest-board__list">
            {claimed.map((quest) => (
              <li key={quest.id} className="quest-card quest-card--claimed">
                <span>{quest.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function RequestProgressCard({
  quest,
  entry,
  showClaim,
  onClaim,
  onAbandon,
}: {
  quest: RequestQuestDefinition
  entry: RequestQuestProgressEntry | undefined
  showClaim?: boolean
  onClaim: (id: string) => void
  onAbandon: (id: string) => void
}) {
  if (!entry) return null
  const progress = formatRequestQuestProgress(entry)

  return (
    <li className="quest-card">
      <h3 className="quest-card__title">{quest.title}</h3>
      <p className="quest-card__desc">{quest.description}</p>
      <p className="quest-card__progress">Progress: {progress}</p>
      <p className="quest-card__reward">Reward: {quest.rewardPreview}</p>
      {showClaim || entry.completed ? (
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={() => onClaim(quest.id)}
        >
          Claim Reward
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--small"
          onClick={() => {
            if (window.confirm(`Abandon "${quest.title}"? You will not receive a reward.`)) {
              onAbandon(quest.id)
            }
          }}
        >
          Abandon
        </button>
      )}
    </li>
  )
}
