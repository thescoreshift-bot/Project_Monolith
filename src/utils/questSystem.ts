import { BALANCE } from '../data/balance'
import { REGIONS } from '../data/regions'
import type { QuestDefinition, QuestRewardTier } from '../data/quests'
import { getQuestById, QUEST_DEFINITIONS } from '../data/quests'
import type { TrainerInventory } from './inventorySystem'
import { getPartyHighestLevel } from './regionRewards'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { rollShopGearOffers } from './gearSystem'
import {
  grantQuestReward,
  type QuestRewardPayload,
  type RunRewardState,
} from './rewardGrants'

export type QuestProgressEntry = {
  questId: string
  currentAmount: number
  requiredAmount: number
  completed: boolean
  claimed: boolean
  accepted: boolean
}

export type QuestState = {
  activeQuestIds: string[]
  completedQuestIds: string[]
  claimedQuestIds: string[]
  progress: Record<string, QuestProgressEntry>
  totalCompletedCount: number
}

export type QuestEventType =
  | 'battleWon'
  | 'enemyDefeated'
  | 'alphaDefeated'
  | 'eliteDefeated'
  | 'gymTrainerDefeated'
  | 'gymLeaderDefeated'
  | 'bossDefeated'
  | 'nodeCleared'
  | 'abilityUsed'
  | 'creatureRecruited'
  | 'recoveryUsed'
  | 'coinsCollected'
  | 'eventCompleted'
  | 'gearEquipped'
  | 'itemCollected'
  | 'gearCollected'
  | 'questClaimed'

export type QuestEventPayload = {
  nodeType?: string
  encounterKind?: string
  enemyKind?: string
  enemyType?: string
  regionId?: string
  abilityType?: string
  amount?: number
  itemId?: string
}

export type QuestRunContext = {
  starter: RunCreature
  recruits: PartyCreature[]
  currentRegionId: string
  earnedBadges: string[]
}

export type ScaledQuestReward = {
  coins: number
  starterXp: number
  recruitXp: number
  items: { itemId: string; quantity: number }[]
  gearId?: string
  summary: string
}

export type QuestUpdateResult = {
  state: QuestState
  newlyCompleted: QuestDefinition[]
}

export function createDefaultQuestState(): QuestState {
  return {
    activeQuestIds: [],
    completedQuestIds: [],
    claimedQuestIds: [],
    progress: {},
    totalCompletedCount: 0,
  }
}

export function normalizeQuestState(raw?: Partial<QuestState> | null): QuestState {
  if (!raw || typeof raw !== 'object') return createDefaultQuestState()
  const progress: Record<string, QuestProgressEntry> = {}
  if (raw.progress && typeof raw.progress === 'object') {
    for (const [key, val] of Object.entries(raw.progress)) {
      if (!val || typeof val !== 'object') continue
      progress[key] = {
        questId: val.questId ?? key,
        currentAmount: Math.max(0, val.currentAmount ?? 0),
        requiredAmount: Math.max(1, val.requiredAmount ?? 1),
        completed: Boolean(val.completed),
        claimed: Boolean(val.claimed),
        accepted: Boolean(val.accepted),
      }
    }
  }
  return {
    activeQuestIds: Array.isArray(raw.activeQuestIds) ? [...raw.activeQuestIds] : [],
    completedQuestIds: Array.isArray(raw.completedQuestIds)
      ? [...raw.completedQuestIds]
      : [],
    claimedQuestIds: Array.isArray(raw.claimedQuestIds) ? [...raw.claimedQuestIds] : [],
    progress,
    totalCompletedCount: Math.max(0, raw.totalCompletedCount ?? 0),
  }
}

function getRegionIndex(regionId: string): number {
  return REGIONS.findIndex((r) => r.id === regionId) + 1
}

function isQuestUnlocked(
  quest: QuestDefinition,
  state: QuestState,
  ctx: QuestRunContext,
): boolean {
  const partyLevel = getPartyHighestLevel(ctx.starter, ctx.recruits)
  if (partyLevel < quest.minLevel) return false
  if (quest.minRegionIndex && getRegionIndex(ctx.currentRegionId) < quest.minRegionIndex) {
    return false
  }
  if (!quest.repeatable && state.claimedQuestIds.includes(quest.id)) return false
  if (!quest.repeatable && state.completedQuestIds.includes(quest.id)) return false
  if (state.activeQuestIds.includes(quest.id)) return false
  return true
}

export function getAvailableQuests(
  state: QuestState,
  ctx: QuestRunContext,
  limit = 5,
): QuestDefinition[] {
  const unlocked = QUEST_DEFINITIONS.filter((q) => isQuestUnlocked(q, state, ctx))
  const tutorial = unlocked.filter((q) => q.category === 'tutorial')
  const other = unlocked.filter((q) => q.category !== 'tutorial')
  const pool = [...tutorial, ...other]
  return pool.slice(0, limit)
}

export function getActiveQuests(state: QuestState): QuestDefinition[] {
  return state.activeQuestIds
    .map((id) => getQuestById(id))
    .filter((q): q is QuestDefinition => q != null)
}

export function getCompletedUnclaimedQuests(state: QuestState): QuestDefinition[] {
  return state.activeQuestIds
    .concat(state.completedQuestIds)
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map((id) => getQuestById(id))
    .filter((q): q is QuestDefinition => {
      if (!q) return false
      const p = state.progress[q.id]
      return Boolean(p?.completed && !p.claimed)
    })
}

export function acceptQuest(state: QuestState, questId: string): QuestState {
  const quest = getQuestById(questId)
  if (!quest || state.activeQuestIds.includes(questId)) return state
  if (!quest.repeatable && state.claimedQuestIds.includes(questId)) return state

  const progress: QuestProgressEntry = {
    questId,
    currentAmount: 0,
    requiredAmount: quest.requiredAmount,
    completed: false,
    claimed: false,
    accepted: true,
  }

  return {
    ...state,
    activeQuestIds: [...state.activeQuestIds, questId],
    progress: { ...state.progress, [questId]: progress },
  }
}

function matchesQuestEvent(
  quest: QuestDefinition,
  event: QuestEventType,
  payload: QuestEventPayload,
  ctx: QuestRunContext,
): boolean {
  switch (quest.type) {
    case 'defeatEnemies':
      if (event !== 'enemyDefeated' && event !== 'battleWon') return false
      if (quest.target === 'any') return true
      if (quest.target === 'ember-coast') return ctx.currentRegionId === 'ember-coast'
      return payload.enemyKind === 'normal' || event === 'battleWon'
    case 'clearBattleNodes':
      return event === 'nodeCleared' && payload.nodeType === 'battle'
    case 'defeatAlpha':
      return (
        event === 'alphaDefeated' ||
        (event === 'enemyDefeated' &&
          (payload.encounterKind === 'alphaNest' || payload.enemyKind === 'alpha'))
      )
    case 'defeatElites':
      return (
        event === 'eliteDefeated' ||
        (event === 'enemyDefeated' &&
          (payload.encounterKind === 'elite' || payload.enemyKind === 'elite'))
      )
    case 'winGymBattle':
      return (
        event === 'gymTrainerDefeated' ||
        event === 'gymLeaderDefeated' ||
        (event === 'battleWon' &&
          (payload.encounterKind === 'gymTrainer' ||
            payload.encounterKind === 'gymLeader'))
      )
    case 'collectCoins':
      return event === 'coinsCollected'
    case 'recruitCreature':
      return event === 'creatureRecruited'
    case 'useAbility':
      return event === 'abilityUsed'
    case 'useAbilityType':
      return (
        event === 'abilityUsed' &&
        quest.abilityType != null &&
        payload.abilityType === quest.abilityType
      )
    case 'healAtRecoveryStation':
      return event === 'recoveryUsed'
    case 'completeEvents':
      return event === 'eventCompleted'
    case 'equipGear':
      return event === 'gearEquipped'
    default:
      return false
  }
}

export function updateQuestProgress(
  state: QuestState,
  event: QuestEventType,
  payload: QuestEventPayload,
  ctx: QuestRunContext,
): QuestUpdateResult {
  const newlyCompleted: QuestDefinition[] = []
  let next = { ...state, progress: { ...state.progress } }

  for (const questId of state.activeQuestIds) {
    const quest = getQuestById(questId)
    const entry = next.progress[questId]
    if (!quest || !entry || entry.completed || entry.claimed) continue
    if (!matchesQuestEvent(quest, event, payload, ctx)) continue

    const increment =
      event === 'coinsCollected' ? Math.max(1, payload.amount ?? 1) : 1
    const currentAmount = Math.min(
      entry.requiredAmount,
      entry.currentAmount + increment,
    )
    const completed = currentAmount >= entry.requiredAmount
    next.progress[questId] = {
      ...entry,
      currentAmount,
      completed,
    }
    if (completed) {
      newlyCompleted.push(quest)
      if (!next.completedQuestIds.includes(questId)) {
        next.completedQuestIds = [...next.completedQuestIds, questId]
      }
    }
  }

  return { state: next, newlyCompleted }
}

/** Central Recovery Station quest progress hook. */
export function trackQuestProgressEvent(
  state: QuestState,
  event: QuestEventType,
  payload: QuestEventPayload,
  ctx: QuestRunContext,
): QuestUpdateResult {
  return updateQuestProgress(state, event, payload, ctx)
}

export function getRewardTier(
  ctx: QuestRunContext,
  quest: QuestDefinition,
): QuestRewardTier {
  const partyLevel = getPartyHighestLevel(ctx.starter, ctx.recruits)
  const regionIndex = getRegionIndex(ctx.currentRegionId)
  let tier: QuestRewardTier = quest.rewardTier
  if (partyLevel >= 20 || regionIndex >= 4) tier = Math.max(tier, 4) as QuestRewardTier
  else if (partyLevel >= 15 || regionIndex >= 3) tier = Math.max(tier, 3) as QuestRewardTier
  else if (partyLevel >= 10 || regionIndex >= 2) tier = Math.max(tier, 2) as QuestRewardTier
  return tier
}

export function calculateQuestReward(
  quest: QuestDefinition,
  ctx: QuestRunContext,
  totalCompletedCount: number,
): ScaledQuestReward {
  const tier = getRewardTier(ctx, quest)
  const bonus =
    1 +
    Math.floor(totalCompletedCount / 5) * BALANCE.questRewardBonusPerFiveCompleted

  const tierCoins = [35, 80, 140, 220][tier - 1] ?? 35
  const tierXp = [20, 45, 75, 120][tier - 1] ?? 20

  const coins = Math.round(tierCoins * bonus)
  const starterXp = Math.round(tierXp * bonus)
  const recruitXp = Math.round(tierXp * 0.6 * bonus)

  const items: { itemId: string; quantity: number }[] = []
  let gearId: string | undefined
  const parts: string[] = [`${coins} coins`, `${starterXp} XP`]

  switch (quest.id) {
    case 'field-trainee':
      items.push({ itemId: 'small-potion', quantity: 2 })
      parts.push('2× Small Potion')
      break
    case 'safe-recovery':
      items.push({ itemId: 'monolith-fragment', quantity: 1 })
      parts.push('Monolith Fragment')
      break
    case 'build-a-team':
    case 'first-badge-path':
    case 'elite-hunter':
    case 'alpha-scout':
    case 'ember-patrol':
    case 'storm-challenge': {
      const offers = rollShopGearOffers(ctx.currentRegionId)
      if (offers[0]) {
        gearId = offers[0]
        parts.push('gear reward')
      }
      break
    }
    case 'event-runner':
      items.push({ itemId: 'small-potion', quantity: 1 })
      parts.push('Small Potion')
      break
    case 'coin-collector':
      parts[0] = `${Math.round(coins * 0.5)} bonus coins`
      break
    default:
      break
  }

  return {
    coins,
    starterXp,
    recruitXp,
    items,
    gearId,
    summary: parts.join(', '),
  }
}

export type ClaimQuestResult = {
  state: QuestState
  starter: RunCreature
  recruits: PartyCreature[]
  inventory: TrainerInventory
  rewardSummary: string
}

export function claimQuestReward(
  state: QuestState,
  questId: string,
  ctx: QuestRunContext,
  inventory: TrainerInventory,
): ClaimQuestResult | null {
  const quest = getQuestById(questId)
  const entry = state.progress[questId]
  if (!quest || !entry || !entry.completed || entry.claimed) return null

  const reward = calculateQuestReward(quest, ctx, state.totalCompletedCount)
  const payload: QuestRewardPayload = {
    coins: reward.coins,
    xpToActiveParty: reward.starterXp,
    xpToParty: reward.recruitXp,
    consumables: reward.items,
    gear: reward.gearId ? [reward.gearId] : undefined,
  }
  const granted = grantQuestReward(payload, {
    starter: ctx.starter,
    recruits: ctx.recruits,
    inventory,
  })

  const nextProgress = {
    ...state.progress,
    [questId]: { ...entry, claimed: true },
  }
  const nextActive = quest.repeatable
    ? state.activeQuestIds.filter((id) => id !== questId)
    : state.activeQuestIds

  return {
    state: {
      ...state,
      activeQuestIds: nextActive,
      claimedQuestIds: [...state.claimedQuestIds, questId],
      progress: nextProgress,
      totalCompletedCount: state.totalCompletedCount + 1,
    },
    starter: granted.runState.starter,
    recruits: granted.runState.recruits,
    inventory: granted.runState.inventory,
    rewardSummary: granted.summary,
  }
}

export { grantQuestReward, type QuestRewardPayload, type RunRewardState }

export function formatQuestProgress(entry: QuestProgressEntry): string {
  return `${entry.currentAmount} / ${entry.requiredAmount}`
}
