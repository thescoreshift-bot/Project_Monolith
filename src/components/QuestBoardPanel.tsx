import type { ReactNode } from 'react'
import type { QuestDefinition } from '../data/quests'
import { getQuestById } from '../data/quests'
import type { QuestProgressEntry, QuestState } from '../utils/questSystem'
import {
  formatQuestProgress,
  getActiveQuests,
  getAvailableQuests,
  getCompletedUnclaimedQuests,
} from '../utils/questSystem'
import type { QuestRunContext } from '../utils/questSystem'

export function QuestBoardPanel({
  questState,
  ctx,
  message,
  onAccept,
  onClaim,
}: {
  questState: QuestState
  ctx: QuestRunContext
  message: string | null
  onAccept: (questId: string) => void
  onClaim: (questId: string) => void
}) {
  const available = getAvailableQuests(questState, ctx)
  const active = getActiveQuests(questState)
  const claimable = getCompletedUnclaimedQuests(questState)
  const claimed = questState.claimedQuestIds
    .map((id) => getQuestById(id))
    .filter((q): q is QuestDefinition => q != null)

  return (
    <section className="quest-board" aria-label="Quest board">
      <div className="quest-board__npc">
        <h2 className="quest-board__npc-name">Quest Broker Mira</h2>
        <p className="quest-board__npc-text">
          I track field requests from across the region. Complete them for rewards.
        </p>
      </div>

      {message && (
        <p className="quest-board__message" role="status">
          {message}
        </p>
      )}

      {claimable.length > 0 && (
        <QuestSection title="Ready to Claim">
          {claimable.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              entry={questState.progress[quest.id]}
              onAccept={onAccept}
              onClaim={onClaim}
              showClaim
            />
          ))}
        </QuestSection>
      )}

      {active.length > 0 && (
        <QuestSection title="Active Quests">
          {active.map((quest) => {
            const entry = questState.progress[quest.id]
            if (entry?.completed) return null
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                entry={entry}
                onAccept={onAccept}
                onClaim={onClaim}
              />
            )
          })}
        </QuestSection>
      )}

      {available.length > 0 && (
        <QuestSection title="Available Quests">
          {available.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              entry={questState.progress[quest.id]}
              onAccept={onAccept}
              onClaim={onClaim}
              showAccept
            />
          ))}
        </QuestSection>
      )}

      {claimed.length > 0 && (
        <QuestSection title="Claimed Quests">
          {claimed.slice(-5).map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              entry={questState.progress[quest.id]}
              onAccept={onAccept}
              onClaim={onClaim}
              claimed
            />
          ))}
        </QuestSection>
      )}
    </section>
  )
}

function QuestSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="quest-board__section">
      <h3 className="panel-label">{title}</h3>
      <ul className="quest-board__list">{children}</ul>
    </div>
  )
}

function QuestCard({
  quest,
  entry,
  onAccept,
  onClaim,
  showAccept,
  showClaim,
  claimed,
}: {
  quest: QuestDefinition
  entry?: QuestProgressEntry
  onAccept: (id: string) => void
  onClaim: (id: string) => void
  showAccept?: boolean
  showClaim?: boolean
  claimed?: boolean
}) {
  return (
    <li className="quest-card">
      <p className="quest-card__title">{quest.title}</p>
      <p className="quest-card__desc">{quest.description}</p>
      {entry && !claimed && (
        <p className="quest-card__progress">
          Progress: {formatQuestProgress(entry)}
        </p>
      )}
      <p className="quest-card__reward">Reward: {quest.rewardPreview}</p>
      {claimed && <p className="quest-card__status">Claimed</p>}
      {entry?.completed && !entry.claimed && (
        <p className="quest-card__status quest-card__status--complete">Completed</p>
      )}
      {showAccept && (
        <button type="button" className="btn btn--small" onClick={() => onAccept(quest.id)}>
          Accept
        </button>
      )}
      {showClaim && entry?.completed && !entry.claimed && (
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={() => onClaim(quest.id)}
        >
          Claim Reward
        </button>
      )}
    </li>
  )
}
