import { BADGES_IN_REGION } from '../data/badges'
import {
  getAllRegionCouncils,
  getCouncilForRegion,
  getCouncilNodeId,
  mergeRegionCouncilProgress,
  toRegionCouncilSaveEntry,
  type RegionCouncil,
  type RegionCouncilProgress,
  type RegionCouncilSaveEntry,
} from '../data/monolithCouncil'
import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { countBadgesInRegion } from './regionTravel'
import type { CouncilGauntletProgress } from './councilGauntlet'
import {
  buildCouncilMapNodeFields,
  resolveCouncilMapPlacement,
  wireCouncilNodeIntoMap,
} from './councilMapPlacement'

export type MonolithCouncilSaveState = {
  unlockedByRegion: Record<string, boolean>
  completedByRegion: Record<string, boolean>
  /** Per-region council names and progress (hydrated on load if missing). */
  regionCouncils: Record<string, RegionCouncilSaveEntry>
  activeGauntlet: CouncilGauntletProgress | null
  councilScoutUnlocked: boolean
  emblemsOwned: string[]
  notifiedUnlockByRegion: Record<string, boolean>
}

export type { RegionCouncil, RegionCouncilProgress, RegionCouncilSaveEntry }

export function syncRegionCouncilSaveEntries(
  state: Pick<
    MonolithCouncilSaveState,
    'unlockedByRegion' | 'completedByRegion'
  >,
): Record<string, RegionCouncilSaveEntry> {
  const entries: Record<string, RegionCouncilSaveEntry> = {}
  for (const council of getAllRegionCouncils()) {
    const unlocked =
      Boolean(state.unlockedByRegion[council.regionId]) ||
      Boolean(state.completedByRegion[council.regionId])
    const completed = Boolean(state.completedByRegion[council.regionId])
    entries[council.regionId] = toRegionCouncilSaveEntry(
      council,
      unlocked,
      completed,
    )
  }
  return entries
}

export function getRegionCouncilProgress(
  state: MonolithCouncilSaveState,
  regionId: string,
  earnedBadges: string[],
): RegionCouncilProgress | null {
  const council = getCouncilForRegion(regionId)
  if (!council) return null
  const saved = state.regionCouncils[regionId]
  const unlocked = saved?.unlocked ?? isCouncilUnlocked(state, regionId, earnedBadges)
  const completed = saved?.completed ?? isCouncilCompleted(state, regionId)
  return mergeRegionCouncilProgress(council, unlocked, completed)
}

export function createDefaultCouncilState(): MonolithCouncilSaveState {
  const base = {
    unlockedByRegion: {},
    completedByRegion: {},
    activeGauntlet: null,
    councilScoutUnlocked: false,
    emblemsOwned: [],
    notifiedUnlockByRegion: {},
  }
  return {
    ...base,
    regionCouncils: syncRegionCouncilSaveEntries(base),
  }
}

export function normalizeCouncilState(
  raw: Partial<MonolithCouncilSaveState> | undefined,
): MonolithCouncilSaveState {
  const base = createDefaultCouncilState()
  if (!raw) return base
  const merged = {
    unlockedByRegion: { ...base.unlockedByRegion, ...raw.unlockedByRegion },
    completedByRegion: { ...base.completedByRegion, ...raw.completedByRegion },
    activeGauntlet: raw.activeGauntlet ?? null,
    councilScoutUnlocked: raw.councilScoutUnlocked ?? false,
    emblemsOwned: Array.isArray(raw.emblemsOwned) ? [...raw.emblemsOwned] : [],
    notifiedUnlockByRegion: {
      ...base.notifiedUnlockByRegion,
      ...raw.notifiedUnlockByRegion,
    },
  }
  const regionCouncils =
    raw.regionCouncils && typeof raw.regionCouncils === 'object'
      ? {
          ...syncRegionCouncilSaveEntries(merged),
          ...raw.regionCouncils,
        }
      : syncRegionCouncilSaveEntries(merged)
  return { ...merged, regionCouncils }
}

export function canUnlockCouncilForRegion(
  regionId: string,
  earnedBadges: string[],
): boolean {
  const council = getCouncilForRegion(regionId)
  if (!council || council.trials.length === 0) return false
  return countBadgesInRegion(regionId, earnedBadges) >= council.requiredBadges
}

export function isCouncilUnlocked(
  state: MonolithCouncilSaveState,
  regionId: string,
  earnedBadges: string[],
): boolean {
  if (state.completedByRegion[regionId]) return true
  if (state.unlockedByRegion[regionId]) return true
  return canUnlockCouncilForRegion(regionId, earnedBadges)
}

export function isCouncilCompleted(
  state: MonolithCouncilSaveState,
  regionId: string,
): boolean {
  return Boolean(state.completedByRegion[regionId])
}

export function markCouncilUnlocked(
  state: MonolithCouncilSaveState,
  regionId: string,
): MonolithCouncilSaveState {
  const next = {
    ...state,
    unlockedByRegion: { ...state.unlockedByRegion, [regionId]: true },
  }
  return { ...next, regionCouncils: syncRegionCouncilSaveEntries(next) }
}

export function syncCouncilUnlockFromBadges(
  state: MonolithCouncilSaveState,
  regionId: string,
  earnedBadges: string[],
): { state: MonolithCouncilSaveState; newlyUnlocked: boolean } {
  if (state.unlockedByRegion[regionId] || state.completedByRegion[regionId]) {
    return { state, newlyUnlocked: false }
  }
  if (!canUnlockCouncilForRegion(regionId, earnedBadges)) {
    return { state, newlyUnlocked: false }
  }
  return {
    state: markCouncilUnlocked(state, regionId),
    newlyUnlocked: true,
  }
}

export function buildCouncilUnlockNotification(council: RegionCouncil): string {
  return `${council.officialName} has opened.`
}

/** Persist unlock flags from badges and return a one-time notification when appropriate. */
export function reconcileMonolithCouncilUnlocks(
  state: MonolithCouncilSaveState,
  earnedBadges: string[],
  options?: { preferNotifyRegionId?: string },
): {
  state: MonolithCouncilSaveState
  newlyUnlockedRegionIds: string[]
  notificationMessage: string | null
  notifiedRegionId: string | null
} {
  let next = state
  const newlyUnlockedRegionIds: string[] = []

  for (const council of getAllRegionCouncils()) {
    if (council.trials.length === 0) continue
    const { state: synced, newlyUnlocked } = syncCouncilUnlockFromBadges(
      next,
      council.regionId,
      earnedBadges,
    )
    next = synced
    if (newlyUnlocked) newlyUnlockedRegionIds.push(council.regionId)
  }

  let notifyRegionId: string | null = null
  const prefer = options?.preferNotifyRegionId

  if (newlyUnlockedRegionIds.length > 0) {
    notifyRegionId =
      prefer && newlyUnlockedRegionIds.includes(prefer)
        ? prefer
        : newlyUnlockedRegionIds[0]!
  } else {
    const pending: string[] = []
    for (const council of getAllRegionCouncils()) {
      if (council.trials.length === 0) continue
      if (isCouncilCompleted(next, council.regionId)) continue
      if (!isCouncilUnlocked(next, council.regionId, earnedBadges)) continue
      if (next.notifiedUnlockByRegion[council.regionId]) continue
      pending.push(council.regionId)
    }
    if (pending.length > 0) {
      notifyRegionId = prefer && pending.includes(prefer) ? prefer : pending[0]!
    }
  }

  let notificationMessage: string | null = null
  if (notifyRegionId) {
    const council = getCouncilForRegion(notifyRegionId)
    if (council) {
      notificationMessage = buildCouncilUnlockNotification(council)
      next = {
        ...next,
        notifiedUnlockByRegion: {
          ...next.notifiedUnlockByRegion,
          [notifyRegionId]: true,
        },
        regionCouncils: syncRegionCouncilSaveEntries(next),
      }
    }
  }

  return {
    state: next,
    newlyUnlockedRegionIds,
    notificationMessage,
    notifiedRegionId: notifyRegionId,
  }
}

export function ensureCouncilMapNode(
  nodes: MapNode[],
  states: Record<string, NodeVisitState>,
  regionId: string,
  councilState: MonolithCouncilSaveState,
  earnedBadges: string[],
): { nodes: MapNode[]; states: Record<string, NodeVisitState> } {
  const council = getCouncilForRegion(regionId)
  if (!council || council.trials.length === 0) {
    const nodeId = getCouncilNodeId(regionId)
    const stripped = nodes
      .filter((n) => n.id !== nodeId)
      .map((n) => ({
        ...n,
        connectsTo: n.connectsTo.filter((id) => id !== nodeId),
      }))
    const nextStates = { ...states }
    delete nextStates[nodeId]
    return { nodes: stripped, states: nextStates }
  }

  const nodeId = getCouncilNodeId(regionId)
  const unlocked = isCouncilUnlocked(councilState, regionId, earnedBadges)
  const completed = isCouncilCompleted(councilState, regionId)
  if (!unlocked && !completed) return { nodes, states }

  const placement = resolveCouncilMapPlacement(nodes, nodeId)
  const fields = buildCouncilMapNodeFields(regionId, council, earnedBadges)
  const nextNodes = wireCouncilNodeIntoMap(nodes, nodeId, placement, fields)

  const nextStates = { ...states }
  if (completed) {
    nextStates[nodeId] = 'completed'
  } else if (unlocked) {
    nextStates[nodeId] = nextStates[nodeId] === 'completed' ? 'completed' : 'available'
  }
  return { nodes: nextNodes, states: nextStates }
}

/** Run Map HUD: direct Council access when unlocked and gauntlet is playable. */
export function canShowCouncilMapHudAccess(
  regionId: string,
  earnedBadges: string[],
  councilState: MonolithCouncilSaveState,
): boolean {
  const council = getCouncilForRegion(regionId)
  if (!council || council.trials.length === 0) return false
  if (isCouncilCompleted(councilState, regionId)) return false
  return isCouncilUnlocked(councilState, regionId, earnedBadges)
}

export function getCouncilDefinitionOrThrow(regionId: string): RegionCouncil {
  const council = getCouncilForRegion(regionId)
  if (!council || council.trials.length === 0) {
    throw new Error(`No active Monolith Council for region ${regionId}`)
  }
  return council
}

export function badgesProgressLabel(
  regionId: string,
  earnedBadges: string[],
): string {
  const count = countBadgesInRegion(regionId, earnedBadges)
  return `${count} / ${BADGES_IN_REGION}`
}
