import { useState } from 'react'
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements'
import {
  CREATURE_ARCHIVE_ENTRIES,
  formatArchiveNumber,
  getArchiveFamilyLine,
  type CreatureArchiveEntry,
} from '../data/creatureArchive'
import { ARCHIVE_QUEST_BY_ID } from '../data/archiveQuests'
import { GEAR_ITEMS } from '../data/gearItems'
import { ITEMS } from '../data/items'
import { BADGES_BY_ID } from '../data/badges'
import { getTitleDefinition } from '../data/titles'
import { getPortraitForArchiveEntry } from '../data/creaturePortraits'
import type { ElementType } from '../data/starters'
import { CreaturePortrait } from './CreaturePortrait'
import {
  claimAchievement,
  claimArchiveQuest,
  claimDailyLoginReward,
  getArchiveSummary,
  getCollectionTotals,
  getDailyQuestRewardPreview,
  getDailyResetRemaining,
  getDailyRewardPreview,
  getNextDailyStreakDay,
  getWeeklyResetRemaining,
  markArchiveViewed,
  type RetentionRewardGrant,
  type RetentionState,
  type CreatureArchiveProgress,
} from '../utils/retentionSystem'
import { hasRetentionGrantValue } from '../utils/rewardGrants'

function formatClaimRewardMessage(summary: string): string {
  const parts = summary.split(', ').map((part) => {
    const coinMatch = /^(\d+) coins$/.exec(part)
    if (coinMatch) return `+${coinMatch[1]} coins`
    return part
  })
  return `Quest reward claimed: ${parts.join(', ')}`
}

function isArchiveEntryUnlocked(
  entry: CreatureArchiveEntry,
  progress?: CreatureArchiveProgress,
): boolean {
  if (!progress) return false
  return entry.familyOrder === 0 ? progress.recruited : progress.evolved
}

type ArchiveTab =
  | 'dailyRewards'
  | 'dailyQuests'
  | 'weeklyQuests'
  | 'achievements'
  | 'creatureArchive'
  | 'collectionLog'
  | 'titles'

type MonolithArchiveScreenProps = {
  state: RetentionState
  partyLevel: number
  regionId: string
  onBack: () => void
  onStateChange: (
    next: RetentionState,
    claimedReward?: RetentionRewardGrant | null,
  ) => void
  onApplyRewardMessage: (msg: string) => void
}

const TABS: { id: ArchiveTab; label: string }[] = [
  { id: 'dailyRewards', label: 'Daily Rewards' },
  { id: 'dailyQuests', label: 'Daily Quests' },
  { id: 'weeklyQuests', label: 'Weekly Quests' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'creatureArchive', label: 'Creature Archive' },
  { id: 'collectionLog', label: 'Collection Log' },
  { id: 'titles', label: 'Titles' },
]

export function MonolithArchiveScreen({
  state,
  partyLevel,
  regionId,
  onBack,
  onStateChange,
  onApplyRewardMessage,
}: MonolithArchiveScreenProps) {
  const [tab, setTab] = useState<ArchiveTab>('dailyRewards')
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'seen' | 'seenOnly' | 'recruited' | 'unknown'>('all')
  const [typeFilter, setTypeFilter] = useState<ElementType | 'all'>('all')
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null)

  const summary = getArchiveSummary(state)
  const collectionTotals = getCollectionTotals()
  const streakDay = getNextDailyStreakDay(state)
  const todayPreview = getDailyRewardPreview(streakDay)

  function handleClaimDaily() {
    const { state: next, reward } = claimDailyLoginReward(state)
    if (!hasRetentionGrantValue(reward)) return
    onStateChange(next, reward)
    onApplyRewardMessage(formatClaimRewardMessage(reward.summary))
  }

  function handleClaimQuest(questId: string, weekly: boolean) {
    const { state: next, reward } = claimArchiveQuest(
      state,
      questId,
      weekly,
      partyLevel,
      regionId,
    )
    if (!reward) return
    onStateChange(next, reward)
    onApplyRewardMessage(formatClaimRewardMessage(reward.summary))
  }

  function handleClaimAchievement(id: string) {
    const { state: next, reward } = claimAchievement(state, id)
    if (!reward) return
    if (reward.titleId) {
      onStateChange(next, null)
      onApplyRewardMessage(`Quest reward claimed: ${reward.summary}`)
      return
    }
    if (!hasRetentionGrantValue(reward)) return
    onStateChange(next, reward)
    onApplyRewardMessage(formatClaimRewardMessage(reward.summary))
  }

  function openTab(next: ArchiveTab) {
    setTab(next)
    if (next === 'creatureArchive') {
      onStateChange(markArchiveViewed(state))
    }
  }

  const filteredArchive = CREATURE_ARCHIVE_ENTRIES.filter((e) => {
    const p = state.creatureArchive[e.creatureId]
    if (typeFilter !== 'all' && e.type !== typeFilter) return false
    if (archiveFilter === 'seen') return p?.seen
    if (archiveFilter === 'seenOnly') return p?.seen && !isArchiveEntryUnlocked(e, p)
    if (archiveFilter === 'recruited') return p?.recruited
    if (archiveFilter === 'unknown') return !p?.seen
    return true
  })

  const selected = selectedCreatureId
    ? CREATURE_ARCHIVE_ENTRIES.find((e) => e.creatureId === selectedCreatureId)
    : null

  return (
    <main className="archive-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Monolith Archive</h1>
        <p className="screen-header__subtitle">
          Daily rewards, quests, achievements, and discovery records.
        </p>
      </header>

      <nav className="archive-tabs" aria-label="Archive sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`archive-tabs__btn${tab === t.id ? ' archive-tabs__btn--active' : ''}`}
            onClick={() => openTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="archive-panel">
        {tab === 'dailyRewards' && (
          <DailyRewardsPanel
            state={state}
            streakDay={streakDay}
            todayPreview={todayPreview}
            onClaim={handleClaimDaily}
          />
        )}

        {tab === 'dailyQuests' && (
          <QuestList
            quests={state.dailyQuests.quests}
            retentionState={state}
            resetLabel={`Resets in ${getDailyResetRemaining()}`}
            partyLevel={partyLevel}
            regionId={regionId}
            onClaim={(id) => handleClaimQuest(id, false)}
          />
        )}

        {tab === 'weeklyQuests' && (
          <QuestList
            quests={state.weeklyQuests.quests}
            retentionState={state}
            resetLabel={`Resets in ${getWeeklyResetRemaining()}`}
            partyLevel={partyLevel}
            regionId={regionId}
            onClaim={(id) => handleClaimQuest(id, true)}
          />
        )}

        {tab === 'achievements' && (
          <ul className="archive-achievement-list">
            {ACHIEVEMENT_DEFINITIONS.map((a) => {
              const prog = state.achievements[a.id]
              const unlocked = prog?.unlocked
              const claimed = prog?.claimed
              return (
                <li
                  key={a.id}
                  className={`archive-achievement${unlocked ? ' archive-achievement--unlocked' : ''}`}
                >
                  <div className="archive-achievement__head">
                    <strong>{a.title}</strong>
                    <span className="archive-achievement__cat">{a.category}</span>
                  </div>
                  <p>{a.description}</p>
                  <div className="archive-progress">
                    <div
                      className="archive-progress__bar"
                      style={{
                        width: `${Math.min(100, ((prog?.progress ?? 0) / a.required) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="archive-achievement__progress">
                    {Math.min(prog?.progress ?? 0, a.required)} / {a.required}
                  </p>
                  <p className="archive-achievement__reward">
                    Reward:{' '}
                    {a.reward.type === 'coins'
                      ? `${a.reward.amount} coins`
                      : a.reward.type === 'title'
                        ? `Title — ${a.reward.titleName}`
                        : 'Gear'}
                  </p>
                  {unlocked && !claimed && (
                    <button
                      type="button"
                      className="btn btn--small btn--primary"
                      onClick={() => handleClaimAchievement(a.id)}
                    >
                      Claim
                    </button>
                  )}
                  {claimed && <span className="archive-claimed">Claimed</span>}
                  {!unlocked && <span className="archive-locked">Locked</span>}
                </li>
              )
            })}
          </ul>
        )}

        {tab === 'creatureArchive' && (
          <>
            <p className="archive-summary">
              Seen: {summary.seen} / {summary.total} · Recruited: {summary.recruited} / {summary.total} · Evolved: {summary.evolved} / {summary.total}
            </p>
            <div className="archive-filters">
              <select
                value={archiveFilter}
                onChange={(e) => setArchiveFilter(e.target.value as typeof archiveFilter)}
              >
                <option value="all">All</option>
                <option value="seen">Seen</option>
                <option value="seenOnly">Seen only</option>
                <option value="recruited">Recruited</option>
                <option value="unknown">Unknown</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              >
                <option value="all">All types</option>
                {(['Fire', 'Water', 'Grass', 'Electric', 'Ground'] as ElementType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="archive-creature-grid">
              {filteredArchive.map((e) => {
                const p = state.creatureArchive[e.creatureId]
                const seen = Boolean(p?.seen)
                const unlocked = isArchiveEntryUnlocked(e, p)
                const seenOnly = seen && !unlocked
                return (
                  <button
                    key={e.creatureId}
                    type="button"
                    className={`archive-creature-card${!seen ? ' archive-creature-card--unknown' : seenOnly ? ' archive-creature-card--seen-only' : ' archive-creature-card--unlocked'}`}
                    onClick={() => setSelectedCreatureId(e.creatureId)}
                  >
                    <CreaturePortrait
                      type={e.type}
                      portraitUrl={seen ? getPortraitForArchiveEntry(e) : null}
                      alt={seen ? e.name : 'Unknown creature'}
                      size="sm"
                      unseen={!seen}
                      dimmed={seenOnly}
                      idle={unlocked}
                      className="archive-creature-card__portrait"
                    />
                    <span className="archive-creature-card__num">{formatArchiveNumber(e.archiveNumber)}</span>
                    <strong>{seen ? e.name : '???'}</strong>
                    <span>{seen ? e.type : 'Unknown'}</span>
                    <span className="archive-creature-card__icons">
                      {seenOnly && (
                        <span className="archive-creature-card__badge">Seen only</span>
                      )}
                      {unlocked && e.familyOrder === 0 && p?.recruited && (
                        <span className="archive-creature-card__badge">Recruited</span>
                      )}
                      {unlocked && e.familyOrder > 0 && p?.evolved && (
                        <span className="archive-creature-card__badge">Evolved</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
            {selected && (() => {
              const selectedProgress = state.creatureArchive[selected.creatureId]
              const selectedSeen = Boolean(selectedProgress?.seen)
              const selectedUnlocked = isArchiveEntryUnlocked(selected, selectedProgress)
              const selectedSeenOnly = selectedSeen && !selectedUnlocked
              return (
              <aside className="archive-creature-detail">
                <CreaturePortrait
                  type={selected.type}
                  portraitUrl={selectedSeen ? getPortraitForArchiveEntry(selected) : null}
                  alt={selectedSeen ? selected.name : 'Unknown creature'}
                  size="lg"
                  unseen={!selectedSeen}
                  dimmed={selectedSeenOnly}
                  idle={selectedUnlocked}
                  className="archive-creature-detail__portrait"
                />
                <h3>
                  {formatArchiveNumber(selected.archiveNumber)}{' '}
                  {selectedSeen ? selected.name : '???'}
                </h3>
                <p>
                  {selectedSeen
                    ? selectedSeenOnly
                      ? `${selected.description} (Seen in battle — recruit or evolve to unlock full record.)`
                      : selected.description
                    : 'Undiscovered creature.'}
                </p>
                <p>
                  Type:{' '}
                  {selectedSeen ? selected.type : 'Unknown'}
                </p>
                {selectedProgress?.regionFirstSeen && (
                  <p>First seen in: {selectedProgress.regionFirstSeen}</p>
                )}
                {selectedSeenOnly && (
                  <p className="archive-creature-card__badge">Seen only — not yet in your party</p>
                )}
                <p className="archive-evolution-line">
                  {getArchiveFamilyLine(selected.familyId).map((f, i) => {
                    const fp = state.creatureArchive[f.creatureId]
                    const label = fp?.seen ? f.name : '???'
                    return (
                      <span key={f.creatureId}>
                        {i > 0 ? ' → ' : ''}
                        {formatArchiveNumber(f.archiveNumber)} {label}
                      </span>
                    )
                  })}
                </p>
                <button type="button" className="btn btn--small" onClick={() => setSelectedCreatureId(null)}>
                  Close
                </button>
              </aside>
              )
            })()}
          </>
        )}

        {tab === 'collectionLog' && (
          <CollectionLogPanel state={state} totals={collectionTotals} />
        )}

        {tab === 'titles' && (
          <div className="archive-titles">
            <p>Profile titles unlocked through achievements and weekly quests.</p>
            {state.titles.length === 0 ? (
              <p>No titles unlocked yet.</p>
            ) : (
              <ul>
                {state.titles.map((t) => {
                  const def = getTitleDefinition(t)
                  return (
                    <li key={t}>
                      {def ? (
                        <>
                          <strong>{def.name}</strong> — {def.description}
                        </>
                      ) : (
                        t.replace(/-/g, ' ')
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <button type="button" className="btn" onClick={onBack}>Back</button>
    </main>
  )
}

function DailyRewardsPanel({
  state,
  streakDay,
  todayPreview,
  onClaim,
}: {
  state: RetentionState
  streakDay: number
  todayPreview: { summary: string }
  onClaim: () => void
}) {
  const nextPreview = getDailyRewardPreview(streakDay >= 7 ? 1 : streakDay + 1)
  return (
    <div className="archive-daily-rewards">
      <p>Current streak: Day {state.dailyRewards.currentStreak || streakDay} / 7</p>
      <p>Today&apos;s reward: {todayPreview.summary}</p>
      <p>Next reward preview: {nextPreview.summary}</p>
      {state.dailyRewards.claimedToday ? (
        <p className="archive-claimed">Claimed today</p>
      ) : (
        <button type="button" className="btn btn--primary" onClick={onClaim}>
          Claim daily reward
        </button>
      )}
    </div>
  )
}

function QuestList({
  quests,
  retentionState,
  resetLabel,
  partyLevel,
  regionId,
  onClaim,
}: {
  quests: RetentionState['dailyQuests']['quests']
  retentionState: RetentionState
  resetLabel: string
  partyLevel: number
  regionId: string
  onClaim: (id: string) => void
}) {
  return (
    <div>
      <p className="archive-reset">{resetLabel}</p>
      <ul className="archive-quest-list">
        {quests.map((q) => {
          const def = ARCHIVE_QUEST_BY_ID[q.questId]
          if (!def) return null
          const preview = getDailyQuestRewardPreview(
            q.questId,
            partyLevel,
            regionId,
            retentionState,
          )
          return (
            <li key={q.questId} className="archive-quest">
              <strong>{def.title}</strong>
              <p>{def.description}</p>
              <p>Progress: {q.current} / {q.required}</p>
              <p>Reward: {preview.summary}</p>
              {q.completed && !q.claimed && (
                <button type="button" className="btn btn--small btn--primary" onClick={() => onClaim(q.questId)}>
                  Claim
                </button>
              )}
              {q.claimed && <span className="archive-claimed">Claimed</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CollectionLogPanel({
  state,
  totals,
}: {
  state: RetentionState
  totals: ReturnType<typeof getCollectionTotals>
}) {
  const gearFound = Object.keys(state.collectionLog.gear).length
  const consumableFound = Object.keys(state.collectionLog.consumables).length
  const materialFound = Object.keys(state.collectionLog.materials).length
  const badgeFound = Object.keys(state.collectionLog.badges).length

  return (
    <div className="archive-collection">
      <section>
        <h3>Gear ({gearFound} / {totals.gear})</h3>
        <ul>
          {Object.keys(GEAR_ITEMS).map((id) => (
            <li key={id}>{state.collectionLog.gear[id] ? GEAR_ITEMS[id]!.name : '???'}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Consumables ({consumableFound} / {totals.consumables})</h3>
        <ul>
          {Object.values(ITEMS).filter((i) => i.category === 'consumable').map((i) => (
            <li key={i.id}>{state.collectionLog.consumables[i.id] ? i.name : '???'}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Materials ({materialFound} / {totals.materials})</h3>
        <ul>
          {Object.values(ITEMS).filter((i) => i.category === 'material').map((i) => (
            <li key={i.id}>{state.collectionLog.materials[i.id] ? i.name : '???'}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Badges ({badgeFound} / {totals.badges})</h3>
        <ul>
          {Object.keys(BADGES_BY_ID).map((id) => (
            <li key={id}>{state.collectionLog.badges[id] ? BADGES_BY_ID[id]!.name : '???'}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
