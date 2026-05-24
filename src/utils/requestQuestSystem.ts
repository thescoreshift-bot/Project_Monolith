import { BALANCE } from '../data/balance'
import { getItemDefinition } from '../data/items'
import { REGIONS } from '../data/regions'
import type { RequestQuestDefinition, RequestQuestRewardTier } from '../data/requestQuests'
import {
  getRequestQuestById,
  REQUEST_QUEST_DEFINITIONS,
} from '../data/requestQuests'
import type { TrainerInventory } from './inventorySystem'
import { getPartyHighestLevel } from './regionRewards'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { rollShopGearOffers } from './gearSystem'
import { getTodayDateKey } from './dailyRun'
import {
  grantQuestReward,
  type QuestRewardPayload,
} from './rewardGrants'
import type { QuestEventPayload, QuestEventType } from './questSystem'

export const MAX_ACTIVE_REQUEST_QUESTS = 3
export const REQUEST_REFRESH_COST = 10

export type RequestQuestProgressEntry = {
  questId: string
  currentAmount: number
  requiredAmount: number
  completed: boolean
  claimed: boolean
  accepted: boolean
}

export type RequestQuestState = {
  availableRequests: string[]
  activeRequests: string[]
  completedRequests: string[]
  claimedRequests: string[]
  progress: Record<string, RequestQuestProgressEntry>
  lastRefreshDate: string | null
  freeRefreshUsedToday: boolean
  totalClaimedCount: number
}

export type RequestQuestRunContext = {
  starter: RunCreature
  recruits: PartyCreature[]
  currentRegionId: string
  earnedBadges: string[]
}

export type RequestQuestUpdateResult = {
  state: RequestQuestState
  newlyCompleted: RequestQuestDefinition[]
}

function getRegionIndex(regionId: string): number {
  const idx = REGIONS.findIndex((r) => r.id === regionId)
  return idx < 0 ? 1 : idx + 1
}

export function createDefaultRequestQuestState(): RequestQuestState {
  return {
    availableRequests: [],
    activeRequests: [],
    completedRequests: [],
    claimedRequests: [],
    progress: {},
    lastRefreshDate: null,
    freeRefreshUsedToday: false,
    totalClaimedCount: 0,
  }
}

export function normalizeRequestQuestState(
  raw?: Partial<RequestQuestState> | null,
): RequestQuestState {
  if (!raw || typeof raw !== 'object') return createDefaultRequestQuestState()

  const today = getTodayDateKey()
  const lastDate = raw.lastRefreshDate ?? null
  const freeRefreshUsedToday =
    lastDate === today ? Boolean(raw.freeRefreshUsedToday) : false

  const progress: Record<string, RequestQuestProgressEntry> = {}
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
    availableRequests: Array.isArray(raw.availableRequests)
      ? [...raw.availableRequests]
      : [],
    activeRequests: Array.isArray(raw.activeRequests) ? [...raw.activeRequests] : [],
    completedRequests: Array.isArray(raw.completedRequests)
      ? [...raw.completedRequests]
      : [],
    claimedRequests: Array.isArray(raw.claimedRequests)
      ? [...raw.claimedRequests]
      : [],
    progress,
    lastRefreshDate: lastDate,
    freeRefreshUsedToday,
    totalClaimedCount: Math.max(0, raw.totalClaimedCount ?? 0),
  }
}

function questMeetsLevelGate(quest: RequestQuestDefinition, partyLevel: number): boolean {
  if (partyLevel < quest.minLevel) return false
  const highRisk = quest.id === 'req-high-risk-alpha'
  if (highRisk && partyLevel < 20) return false
  if (quest.type === 'winGymBattle' && partyLevel < 15) return false
  if (
    (quest.type === 'defeatAlpha' || quest.type === 'defeatElites') &&
    partyLevel < 10 &&
    quest.id !== 'req-alpha-warning'
  ) {
    return false
  }
  if (
    (quest.type === 'recruitCreature' ||
      quest.type === 'useAbilityType' ||
      quest.type === 'collectMaterials' ||
      quest.type === 'equipGear' ||
      quest.type === 'defeatType') &&
    partyLevel < 5
  ) {
    return false
  }
  return true
}

function isRequestQuestUnlocked(
  quest: RequestQuestDefinition,
  state: RequestQuestState,
  ctx: RequestQuestRunContext,
): boolean {
  const partyLevel = getPartyHighestLevel(ctx.starter, ctx.recruits)
  if (!questMeetsLevelGate(quest, partyLevel)) return false
  if (quest.minRegionIndex && getRegionIndex(ctx.currentRegionId) < quest.minRegionIndex) {
    return false
  }
  if (!quest.repeatable && state.claimedRequests.includes(quest.id)) return false
  if (state.activeRequests.includes(quest.id)) return false
  return true
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed >>> 0
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function rollAvailableRequestQuests(
  state: RequestQuestState,
  ctx: RequestQuestRunContext,
): RequestQuestState {
  const partyLevel = getPartyHighestLevel(ctx.starter, ctx.recruits)
  const regionIndex = getRegionIndex(ctx.currentRegionId)
  const pool = REQUEST_QUEST_DEFINITIONS.filter((q) =>
    isRequestQuestUnlocked(q, state, ctx),
  )
  const count = Math.min(pool.length, 3 + (partyLevel >= 10 ? 1 : 0) + (partyLevel >= 15 ? 1 : 0))
  const offerCount = Math.max(3, Math.min(5, count || 3))
  const seed =
    partyLevel * 997 +
    regionIndex * 131 +
    state.totalClaimedCount * 17 +
    (state.lastRefreshDate?.length ?? 0) * 7
  const shuffled = seededShuffle(pool, seed)
  const ids = shuffled.slice(0, offerCount).map((q) => q.id)
  return { ...state, availableRequests: ids }
}

export function ensureAvailableRequestQuests(
  state: RequestQuestState,
  ctx: RequestQuestRunContext,
): RequestQuestState {
  if (state.availableRequests.length > 0) return state
  return rollAvailableRequestQuests(state, ctx)
}

export function getOfferedRequestQuests(
  state: RequestQuestState,
): RequestQuestDefinition[] {
  return state.availableRequests
    .map((id) => getRequestQuestById(id))
    .filter((q): q is RequestQuestDefinition => q != null)
}

export function getActiveRequestQuests(
  state: RequestQuestState,
): RequestQuestDefinition[] {
  return state.activeRequests
    .map((id) => getRequestQuestById(id))
    .filter((q): q is RequestQuestDefinition => q != null)
}

export function getCompletedUnclaimedRequestQuests(
  state: RequestQuestState,
): RequestQuestDefinition[] {
  const ids = [...state.activeRequests, ...state.completedRequests]
  return ids
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map((id) => getRequestQuestById(id))
    .filter((q): q is RequestQuestDefinition => {
      if (!q) return false
      const p = state.progress[q.id]
      return Boolean(p?.completed && !p.claimed)
    })
}

export function hasClaimableRequestQuests(state: RequestQuestState): boolean {
  return getCompletedUnclaimedRequestQuests(state).length > 0
}

export type AcceptRequestResult =
  | { ok: true; state: RequestQuestState }
  | { ok: false; reason: 'max_active' | 'invalid' | 'unavailable' }

export function acceptRequestQuest(
  state: RequestQuestState,
  questId: string,
): AcceptRequestResult {
  const quest = getRequestQuestById(questId)
  if (!quest || !state.availableRequests.includes(questId)) {
    return { ok: false, reason: 'unavailable' }
  }
  if (state.activeRequests.includes(questId)) {
    return { ok: false, reason: 'invalid' }
  }
  if (state.activeRequests.length >= MAX_ACTIVE_REQUEST_QUESTS) {
    return { ok: false, reason: 'max_active' }
  }

  const progress: RequestQuestProgressEntry = {
    questId,
    currentAmount: 0,
    requiredAmount: quest.requiredAmount,
    completed: false,
    claimed: false,
    accepted: true,
  }

  return {
    ok: true,
    state: {
      ...state,
      activeRequests: [...state.activeRequests, questId],
      availableRequests: state.availableRequests.filter((id) => id !== questId),
      progress: { ...state.progress, [questId]: progress },
    },
  }
}

export function abandonRequestQuest(
  state: RequestQuestState,
  questId: string,
): RequestQuestState {
  if (!state.activeRequests.includes(questId)) return state
  const nextProgress = { ...state.progress }
  delete nextProgress[questId]
  return {
    ...state,
    activeRequests: state.activeRequests.filter((id) => id !== questId),
    completedRequests: state.completedRequests.filter((id) => id !== questId),
    progress: nextProgress,
  }
}

function matchesRequestQuestEvent(
  quest: RequestQuestDefinition,
  event: QuestEventType,
  payload: QuestEventPayload,
): boolean {
  switch (quest.type) {
    case 'defeatEnemies':
      return event === 'enemyDefeated' || event === 'battleWon'
    case 'defeatType': {
      if (event !== 'enemyDefeated') return false
      const target = quest.targetType ?? 'any'
      if (target === 'any') return true
      return payload.enemyType === target
    }
    case 'clearBattleNodes':
      return event === 'nodeCleared' && payload.nodeType === 'battle'
    case 'completeEvents':
      return event === 'eventCompleted'
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
    case 'collectMaterials':
      if (event !== 'itemCollected') return false
      if (!payload.itemId) return false
      return getItemDefinition(payload.itemId)?.category === 'material'
    case 'equipGear':
      return event === 'gearEquipped'
    case 'healAtRecoveryStation':
      return event === 'recoveryUsed'
    default:
      return false
  }
}

export function updateRequestQuestProgress(
  state: RequestQuestState,
  event: QuestEventType,
  payload: QuestEventPayload = {},
): RequestQuestUpdateResult {
  const newlyCompleted: RequestQuestDefinition[] = []
  let next = { ...state, progress: { ...state.progress } }

  for (const questId of state.activeRequests) {
    const quest = getRequestQuestById(questId)
    const entry = next.progress[questId]
    if (!quest || !entry || entry.completed || entry.claimed) continue
    if (!matchesRequestQuestEvent(quest, event, payload)) continue

    const increment = 1
    const currentAmount = Math.min(
      entry.requiredAmount,
      entry.currentAmount + increment,
    )
    const completed = currentAmount >= entry.requiredAmount
    next.progress[questId] = { ...entry, currentAmount, completed }
    if (completed) {
      newlyCompleted.push(quest)
      if (!next.completedRequests.includes(questId)) {
        next.completedRequests = [...next.completedRequests, questId]
      }
    }
  }

  return { state: next, newlyCompleted }
}

export type RefreshRequestResult =
  | { ok: true; state: RequestQuestState; chargedCoins: number; usedFreeRefresh: boolean }
  | { ok: false; reason: 'insufficient_coins' }

export function refreshAvailableRequests(
  state: RequestQuestState,
  ctx: RequestQuestRunContext,
  coins: number,
): RefreshRequestResult {
  const today = getTodayDateKey()
  let next = { ...state }
  let chargedCoins = 0
  let usedFreeRefresh = false

  if (next.lastRefreshDate !== today) {
    next = { ...next, lastRefreshDate: today, freeRefreshUsedToday: false }
  }

  if (!next.freeRefreshUsedToday) {
    usedFreeRefresh = true
    next = { ...next, freeRefreshUsedToday: true, lastRefreshDate: today }
  } else if (coins < REQUEST_REFRESH_COST) {
    return { ok: false, reason: 'insufficient_coins' }
  } else {
    chargedCoins = REQUEST_REFRESH_COST
    next = { ...next, lastRefreshDate: today }
  }

  next = rollAvailableRequestQuests(next, ctx)
  return { ok: true, state: next, chargedCoins, usedFreeRefresh }
}

export function getRequestRewardTier(
  ctx: RequestQuestRunContext,
  quest: RequestQuestDefinition,
): RequestQuestRewardTier {
  const partyLevel = getPartyHighestLevel(ctx.starter, ctx.recruits)
  const regionIndex = getRegionIndex(ctx.currentRegionId)
  let tier: RequestQuestRewardTier = quest.rewardTier
  if (partyLevel >= 20 || regionIndex >= 4) tier = Math.max(tier, 4) as RequestQuestRewardTier
  else if (partyLevel >= 15 || regionIndex >= 3) tier = Math.max(tier, 3) as RequestQuestRewardTier
  else if (partyLevel >= 10 || regionIndex >= 2) tier = Math.max(tier, 2) as RequestQuestRewardTier
  return tier
}

export function calculateRequestQuestReward(
  quest: RequestQuestDefinition,
  ctx: RequestQuestRunContext,
  totalClaimedCount: number,
): QuestRewardPayload {
  const tier = getRequestRewardTier(ctx, quest)
  const bonus =
    1 +
    Math.floor(totalClaimedCount / 5) * BALANCE.questRewardBonusPerFiveCompleted

  const tierCoins = [30, 70, 120, 200][tier - 1] ?? 30
  const tierXp = [15, 40, 70, 110][tier - 1] ?? 15
  const coins = Math.round(tierCoins * bonus)
  const xpToActiveParty = Math.round(tierXp * bonus)
  const xpToParty = Math.round(tierXp * 0.55 * bonus)

  const payload: QuestRewardPayload = { coins }
  const offers = rollShopGearOffers(ctx.currentRegionId)

  switch (quest.id) {
    case 'req-route-cleanup':
      payload.consumables = [{ itemId: 'small-potion', quantity: 1 }]
      break
    case 'req-field-practice':
      payload.xpToParty = xpToParty
      payload.xpToActiveParty = Math.max(xpToActiveParty, 10)
      break
    case 'req-gather-samples':
      payload.materials = [{ itemId: 'monolith-fragment', quantity: 1 }]
      break
    case 'req-team-expansion':
    case 'req-gear-check':
      if (offers[0]) payload.gear = [offers[0]]
      break
    case 'req-alpha-warning':
    case 'req-elite-contract':
    case 'req-high-risk-alpha': {
      payload.coins = Math.round(coins * 1.35)
      const gearIdx = tier >= 3 ? 1 : 0
      if (offers[gearIdx] ?? offers[0]) {
        payload.gear = [offers[gearIdx] ?? offers[0]!]
      }
      break
    }
    case 'req-recovery-routine':
      payload.coins = Math.max(8, Math.round(coins * 0.5))
      payload.materials = [{ itemId: 'stone-chip', quantity: 1 }]
      break
    case 'req-material-run':
      payload.materials = [
        { itemId: 'stone-chip', quantity: 1 },
        ...(tier >= 2 ? [{ itemId: 'ember-scale', quantity: 1 }] : []),
      ]
      break
    case 'req-flame-study':
      payload.xpToParty = xpToParty
      break
    case 'req-gym-scout':
      payload.coins = Math.round(coins * 1.5)
      if (offers[1] ?? offers[0]) payload.gear = [offers[1] ?? offers[0]!]
      break
    default:
      if (tier >= 2) {
        payload.xpToActiveParty = xpToActiveParty
      }
      break
  }

  if (!payload.xpToParty && !payload.xpToActiveParty && tier >= 3) {
    payload.xpToActiveParty = xpToActiveParty
  }

  return payload
}

export type ClaimRequestResult = {
  state: RequestQuestState
  starter: RunCreature
  recruits: PartyCreature[]
  inventory: TrainerInventory
  rewardSummary: string
}

export function claimRequestQuestReward(
  state: RequestQuestState,
  questId: string,
  ctx: RequestQuestRunContext,
  inventory: TrainerInventory,
): ClaimRequestResult | null {
  const quest = getRequestQuestById(questId)
  const entry = state.progress[questId]
  if (!quest || !entry || !entry.completed || entry.claimed) return null

  const payload = calculateRequestQuestReward(
    quest,
    ctx,
    state.totalClaimedCount,
  )
  const granted = grantQuestReward(payload, {
    starter: ctx.starter,
    recruits: ctx.recruits,
    inventory,
  })

  const nextProgress = {
    ...state.progress,
    [questId]: { ...entry, claimed: true },
  }

  return {
    state: {
      ...state,
      activeRequests: state.activeRequests.filter((id) => id !== questId),
      claimedRequests: [...state.claimedRequests, questId],
      progress: nextProgress,
      totalClaimedCount: state.totalClaimedCount + 1,
    },
    starter: granted.runState.starter,
    recruits: granted.runState.recruits,
    inventory: granted.runState.inventory,
    rewardSummary: granted.summary,
  }
}

export function formatRequestQuestProgress(entry: RequestQuestProgressEntry): string {
  return `${entry.currentAmount} / ${entry.requiredAmount}`
}
