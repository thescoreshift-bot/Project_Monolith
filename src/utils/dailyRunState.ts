import type { MapNode, NodeVisitState } from '../data/nodeMap'
import type { DailyModifierId } from './dailyRun'
import type { RunScoreTracker } from './runScore'
import type { RunCreature } from './progression'
import type { PartyCreature } from './party'

const STORAGE_KEY = 'project-monolith-daily-run'

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
}

export function saveDailyRunState(state: DailyRunPersistedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function loadDailyRunState(): DailyRunPersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DailyRunPersistedState
  } catch {
    return null
  }
}

export function clearDailyRunState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasDailyRunInProgress(): boolean {
  return loadDailyRunState() !== null
}
