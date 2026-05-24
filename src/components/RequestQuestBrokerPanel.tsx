import type { RequestQuestDefinition } from '../data/requestQuests'
import { getPartyHighestLevel } from '../utils/regionRewards'
import type { RequestQuestRunContext, RequestQuestState } from '../utils/requestQuestSystem'
import {
  getOfferedRequestQuests,
  REQUEST_REFRESH_COST,
} from '../utils/requestQuestSystem'

export function RequestQuestBrokerPanel({
  state,
  ctx,
  message,
  activeCount,
  canRefreshFree,
  onAccept,
  onRefresh,
}: {
  state: RequestQuestState
  ctx: RequestQuestRunContext
  message: string | null
  activeCount: number
  canRefreshFree: boolean
  onAccept: (questId: string) => void
  onRefresh: () => void
}) {
  const offered = getOfferedRequestQuests(state)

  return (
    <section className="quest-board" aria-label="Request quests">
      <div className="quest-board__npc">
        <h2 className="quest-board__npc-name">Quest Broker Mira</h2>
        <p className="quest-board__npc-text">
          Looking for work? I have field requests from nearby routes. Complete them and
          I&apos;ll reward you.
        </p>
      </div>

      {message && (
        <p className="quest-board__message" role="status">
          {message}
        </p>
      )}

      <p className="quest-board__hint">
        Active requests: {activeCount} / 3
      </p>

      <div className="quest-board__refresh">
        <button type="button" className="btn btn--small" onClick={onRefresh}>
          Refresh Requests
          {canRefreshFree ? ' (free today)' : ` (${REQUEST_REFRESH_COST} coins)`}
        </button>
      </div>

      {offered.length === 0 ? (
        <p className="quest-board__empty">No requests available. Try refreshing the board.</p>
      ) : (
        <ul className="quest-board__list">
          {offered.map((quest) => (
            <RequestOfferCard
              key={quest.id}
              quest={quest}
              partyLevel={getPartyHighestLevel(ctx.starter, ctx.recruits)}
              onAccept={onAccept}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function RequestOfferCard({
  quest,
  partyLevel,
  onAccept,
}: {
  quest: RequestQuestDefinition
  partyLevel: number
  onAccept: (id: string) => void
}) {
  const locked = partyLevel < quest.minLevel
  return (
    <li className="quest-card">
      <h3 className="quest-card__title">{quest.title}</h3>
      <p className="quest-card__desc">{quest.description}</p>
      <p className="quest-card__reward">Reward: {quest.rewardPreview}</p>
      {quest.minLevel > 1 && (
        <p className="quest-card__req">Suggested Lv. {quest.minLevel}+</p>
      )}
      <button
        type="button"
        className="btn btn--small btn--primary"
        disabled={locked}
        onClick={() => onAccept(quest.id)}
      >
        Accept Request
      </button>
    </li>
  )
}
