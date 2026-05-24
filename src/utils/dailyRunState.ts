import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { getDailyRunRegionId, getTodayDateKey, type DailyModifier } from './dailyRun'
import type { DailyModifierId } from './dailyRun'
import type {
  AbilityMasteryPerkQueueEntry,
  AbilityTransformQueueEntry,
} from './abilityMastery'
import type {
  EvolutionQueueEntry,
  PerkDraftQueueEntry,
} from './creatureProgression'
import type { PostBattleQueueEvent } from './postBattleQueue'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { getRegionEnemyLevelRange, type EnemyLevelRange } from './regionRewards'
import { createFreshMapState } from './runState'
import { createScoreTracker, type RunScoreTracker } from './runScore'
import {
  type DailyAttemptRunState,
  type DailyCheckpoint,
  type DailyRunDayState,
  type DailyRunSummary,
  resetCurrentDailyAttempt,
} from './dailyRunScoring'

const STORAGE_KEY = 'project-monolith-daily-run'

/** @deprecated legacy single-blob format */
export type DailyRunPersistedState = {
  dailySeed: string
  modifierId: DailyModifierId
  starterId: string
  runCreature: RunCreature
  partyRecruits: PartyCreature[]
  activeHelperId: string | null
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  earnedBadges: string[]
  currentRegion: string
  scoreTracker: RunScoreTracker
  runCompleted: boolean
  leaderboardSubmitted: boolean
  gearInventory?: string[]
  trainerInventory?: import('./inventorySystem').TrainerInventory
}

function isLegacyState(raw: unknown): raw is DailyRunPersistedState {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'runCreature' in raw &&
    !('currentAttemptRunState' in raw)
  )
}

function migrateLegacyToDayState(
  legacy: DailyRunPersistedState,
): DailyRunDayState {
  const attempt: DailyAttemptRunState = {
    starterId: legacy.starterId,
    runCreature: legacy.runCreature,
    partyRecruits: legacy.partyRecruits,
    activeHelperId: legacy.activeHelperId,
    mapNodes: legacy.mapNodes,
    nodeStates: legacy.nodeStates,
    earnedBadges: legacy.earnedBadges,
    currentRegion: legacy.currentRegion,
    scoreTracker: legacy.scoreTracker,
    trainerInventory: legacy.trainerInventory,
  }

  return {
    dailySeed: legacy.dailySeed,
    dailyDate: legacy.dailySeed.replace(/^daily-/, ''),
    modifierId: legacy.modifierId,
    currentAttemptScore: 0,
    bestScore: 0,
    currentCheckpoint: null,
    bestCheckpoint: null,
    currentAttemptDeaths: 0,
    totalAttempts: 1,
    bestRunSummary: null,
    leaderboardSubmitted: legacy.leaderboardSubmitted,
    currentAttemptRunState: attempt,
  }
}

export type FreshDailyRunSnapshot = {
  dailySeed: string
  regionId: string
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  earnedBadges: string[]
  completedRegionIds: string[]
  partyRecruits: PartyCreature[]
  activeHelperId: string | null
  enemyLevelRange: EnemyLevelRange
  scoreTracker: RunScoreTracker
  pendingPerkDraftQueue: PerkDraftQueueEntry[]
  pendingEvolutionQueue: EvolutionQueueEntry[]
  pendingAbilityUpgradeQueue: AbilityMasteryPerkQueueEntry[]
  pendingTransformQueue: AbilityTransformQueueEntry[]
  pendingPostBattleQueue: PostBattleQueueEvent[]
}

/** Full in-memory reset for a new daily attempt (no normal-save region/party leakage). */
export function createFreshDailyRunState(
  dailySeed: string,
  dailyModifier: DailyModifier | null = null,
  options?: { generateMap?: boolean },
): FreshDailyRunSnapshot {
  const regionId = getDailyRunRegionId()
  const generateMap = options?.generateMap ?? false
  const map = generateMap
    ? createFreshMapState(regionId, [], dailyModifier)
    : { mapNodes: [] as MapNode[], nodeStates: {} as Record<string, NodeVisitState> }

  return {
    dailySeed,
    regionId,
    mapNodes: map.mapNodes,
    nodeStates: map.nodeStates,
    earnedBadges: [],
    completedRegionIds: [],
    partyRecruits: [],
    activeHelperId: null,
    enemyLevelRange: getRegionEnemyLevelRange(regionId),
    scoreTracker: createScoreTracker(1),
    pendingPerkDraftQueue: [],
    pendingEvolutionQueue: [],
    pendingAbilityUpgradeQueue: [],
    pendingTransformQueue: [],
    pendingPostBattleQueue: [],
  }
}

export function createEmptyDailyRunDayState(
  dailySeed: string,
  modifierId: DailyModifierId,
): DailyRunDayState {
  return {
    dailySeed,
    dailyDate: getTodayDateKey(),
    modifierId,
    currentAttemptScore: 0,
    bestScore: 0,
    currentCheckpoint: null,
    bestCheckpoint: null,
    currentAttemptDeaths: 0,
    totalAttempts: 0,
    bestRunSummary: null,
    leaderboardSubmitted: false,
    currentAttemptRunState: null,
  }
}

export function loadDailyRunDayState(): DailyRunDayState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (isLegacyState(parsed)) {
      return migrateLegacyToDayState(parsed)
    }
    return parsed as DailyRunDayState
  } catch {
    return null
  }
}

export function saveDailyRunDayState(state: DailyRunDayState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Clears all daily data for today (including best scores). */
export function clearDailyRunDayState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** @deprecated use clearDailyRunDayState — only clears when explicitly resetting daily data */
export function clearDailyRunState(): void {
  clearDailyRunDayState()
}

export function loadDailyRunState(): DailyRunPersistedState | null {
  const day = loadDailyRunDayState()
  if (!day?.currentAttemptRunState) return null
  const a = day.currentAttemptRunState
  return {
    dailySeed: day.dailySeed,
    modifierId: day.modifierId,
    starterId: a.starterId,
    runCreature: a.runCreature,
    partyRecruits: a.partyRecruits,
    activeHelperId: a.activeHelperId,
    mapNodes: a.mapNodes,
    nodeStates: a.nodeStates,
    earnedBadges: a.earnedBadges,
    currentRegion: a.currentRegion,
    scoreTracker: a.scoreTracker,
    runCompleted: false,
    leaderboardSubmitted: day.leaderboardSubmitted,
    trainerInventory: a.trainerInventory,
  }
}

export function saveDailyRunState(state: DailyRunPersistedState): boolean {
  const existing = loadDailyRunDayState()
  const day: DailyRunDayState = existing ?? createEmptyDailyRunDayState(
    state.dailySeed,
    state.modifierId,
  )
  day.currentAttemptRunState = {
    starterId: state.starterId,
    runCreature: state.runCreature,
    partyRecruits: state.partyRecruits,
    activeHelperId: state.activeHelperId,
    mapNodes: state.mapNodes,
    nodeStates: state.nodeStates,
    earnedBadges: state.earnedBadges,
    currentRegion: state.currentRegion,
    scoreTracker: state.scoreTracker,
    trainerInventory: state.trainerInventory,
  }
  day.leaderboardSubmitted = state.leaderboardSubmitted
  return saveDailyRunDayState(day)
}

export function hasDailyRunInProgress(): boolean {
  const day = loadDailyRunDayState()
  return (
    day !== null &&
    day.currentAttemptRunState !== null &&
    day.dailySeed === `daily-${getTodayDateKey()}`
  )
}

export function hasDailyRunForToday(): boolean {
  const day = loadDailyRunDayState()
  return day !== null && day.dailySeed === `daily-${getTodayDateKey()}`
}

export function getDailyRunDayStateForToday(
  dailySeed: string,
  modifierId: DailyModifierId,
): DailyRunDayState {
  const existing = loadDailyRunDayState()
  if (existing && existing.dailySeed === dailySeed) {
    return existing
  }
  return createEmptyDailyRunDayState(dailySeed, modifierId)
}

export {
  resetCurrentDailyAttempt,
  type DailyAttemptRunState,
  type DailyCheckpoint,
  type DailyRunDayState,
  type DailyRunSummary,
}
