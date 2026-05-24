import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { getRegion, REGIONS } from '../data/regions'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { getPartyHighestLevel } from './regionRewards'
import { buildRunScore, type RunScoreTracker } from './runScore'

export type DailyCheckpoint = {
  region: string
  regionNumber: number
  badgesEarned: number
  nodesCleared: number
  bossesDefeated: number
  highestLevel: number
  evolutionsCount: number
}

export type DailyRunScoreInput = {
  starter: RunCreature
  recruits: PartyCreature[]
  earnedBadges: string[]
  currentRegionId: string
  nodeStates: Record<string, NodeVisitState>
  scoreTracker: RunScoreTracker
  completed: boolean
}

export function calculateCheckpoint(input: DailyRunScoreInput): DailyCheckpoint {
  const regionNumber =
    REGIONS.findIndex((r) => r.id === input.currentRegionId) + 1
  const nodesCleared = Object.values(input.nodeStates).filter(
    (s) => s === 'completed',
  ).length

  return {
    region: input.currentRegionId,
    regionNumber: Math.max(1, regionNumber),
    badgesEarned: input.earnedBadges.length,
    nodesCleared,
    bossesDefeated: input.scoreTracker.bossesDefeated,
    highestLevel: getPartyHighestLevel(input.starter, input.recruits),
    evolutionsCount: input.scoreTracker.evolutionsReached,
  }
}

export function calculateCurrentAttemptScore(input: DailyRunScoreInput): number {
  return buildRunScore(
    input.scoreTracker,
    input.starter,
    input.recruits,
    input.completed,
  ).total
}

export function compareCheckpoints(
  a: DailyCheckpoint,
  b: DailyCheckpoint,
): number {
  if (a.regionNumber !== b.regionNumber) {
    return a.regionNumber - b.regionNumber
  }
  if (a.badgesEarned !== b.badgesEarned) {
    return a.badgesEarned - b.badgesEarned
  }
  if (a.nodesCleared !== b.nodesCleared) {
    return a.nodesCleared - b.nodesCleared
  }
  if (a.bossesDefeated !== b.bossesDefeated) {
    return a.bossesDefeated - b.bossesDefeated
  }
  if (a.highestLevel !== b.highestLevel) {
    return a.highestLevel - b.highestLevel
  }
  return a.evolutionsCount - b.evolutionsCount
}

export function isCheckpointBetter(
  current: DailyCheckpoint,
  best: DailyCheckpoint | null,
): boolean {
  if (!best) return true
  return compareCheckpoints(current, best) > 0
}

export function formatCheckpointLabel(
  checkpoint: DailyCheckpoint | null | undefined,
): string {
  if (!checkpoint) return 'None'
  const regionName = getRegion(checkpoint.region).name
  return `Region ${checkpoint.regionNumber} (${regionName}) · ${checkpoint.badgesEarned} Badges · ${checkpoint.nodesCleared} Nodes Cleared`
}

export type DailyRunSummary = {
  score: number
  checkpoint: DailyCheckpoint
  completed: boolean
}

export type DailyRunDayState = {
  dailySeed: string
  dailyDate: string
  modifierId: import('./dailyRun').DailyModifierId
  currentAttemptScore: number
  bestScore: number
  currentCheckpoint: DailyCheckpoint | null
  bestCheckpoint: DailyCheckpoint | null
  currentAttemptDeaths: number
  totalAttempts: number
  bestRunSummary: DailyRunSummary | null
  leaderboardSubmitted: boolean
  currentAttemptRunState: DailyAttemptRunState | null
}

export type DailyAttemptRunState = {
  starterId: string
  runCreature: RunCreature
  partyRecruits: PartyCreature[]
  activeHelperId: string | null
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  earnedBadges: string[]
  currentRegion: string
  scoreTracker: RunScoreTracker
  trainerInventory?: import('./inventorySystem').TrainerInventory
}

export function updateBestDailyScore(
  dayState: DailyRunDayState,
  input: DailyRunScoreInput,
): { dayState: DailyRunDayState; newBest: boolean } {
  const score = calculateCurrentAttemptScore(input)
  const checkpoint = calculateCheckpoint(input)
  let newBest = false
  let bestScore = dayState.bestScore
  let bestCheckpoint = dayState.bestCheckpoint
  let bestRunSummary = dayState.bestRunSummary

  if (score > bestScore) {
    newBest = true
    bestScore = score
    bestCheckpoint = checkpoint
    bestRunSummary = { score, checkpoint, completed: input.completed }
  } else if (isCheckpointBetter(checkpoint, bestCheckpoint)) {
    newBest = true
    bestCheckpoint = checkpoint
    bestRunSummary = {
      score: bestScore,
      checkpoint,
      completed: input.completed,
    }
  }

  return {
    dayState: {
      ...dayState,
      currentAttemptScore: score,
      currentCheckpoint: checkpoint,
      bestScore,
      bestCheckpoint,
      bestRunSummary,
    },
    newBest,
  }
}

export function resetCurrentDailyAttempt(
  dayState: DailyRunDayState,
): DailyRunDayState {
  return {
    ...dayState,
    currentAttemptScore: 0,
    currentCheckpoint: null,
    currentAttemptDeaths: 0,
    currentAttemptRunState: null,
  }
}
