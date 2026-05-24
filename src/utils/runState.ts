import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { DEFAULT_REGION_ID } from '../data/regions'
import type { AbilityTransformQueueEntry } from './abilityMastery'
import type { DailyModifier } from './dailyRun'
import {
  emptyTrainerInventory,
  type TrainerInventory,
} from './inventorySystem'
import {
  generateMap,
  getInitialNodeStates,
} from './mapGenerator'
import type { PostBattleQueueEvent } from './postBattleQueue'
import { getRegionEnemyLevelRange } from './regionRewards'
import {
  SAVE_VERSION,
  type RunSaveData,
} from './saveSystem'
import type {
  EvolutionQueueEntry,
  PerkDraftQueueEntry,
} from './creatureProgression'
import type { RunCreature } from './progression'
import {
  createDefaultQuestState,
} from './questSystem'

export type FreshMapState = {
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  startNodeId: string
}

/** Generate a brand-new map for a region (never reuse prior node/enemy references). */
export function createFreshMapState(
  regionId: string = DEFAULT_REGION_ID,
  earnedBadges: string[] = [],
  dailyModifier?: DailyModifier | null,
): FreshMapState {
  const { nodes, startNodeId } = generateMap(
    regionId,
    earnedBadges,
    dailyModifier,
  )
  const nodeStates = getInitialNodeStates(
    nodes,
    startNodeId,
    earnedBadges,
    regionId,
  )
  return {
    mapNodes: [...nodes],
    nodeStates: { ...nodeStates },
    startNodeId,
  }
}

export type FreshRunDefaults = {
  regionId: string
  earnedBadges: string[]
  completedRegionIds: string[]
  coins: number
}

export function getFreshRunDefaults(
  mode: 'normal' | 'daily',
  dailyRegionId?: string,
): FreshRunDefaults {
  const regionId =
    mode === 'daily' && dailyRegionId ? dailyRegionId : DEFAULT_REGION_ID
  return {
    regionId,
    earnedBadges: [],
    completedRegionIds: [],
    coins: 0,
  }
}

/** Snapshot for persisting a brand-new run (no stale references from prior saves). */
export function createFreshSaveData(params: {
  starterId: string
  runCreature: RunCreature
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  regionId: string
  trainerInventory?: TrainerInventory
}): RunSaveData {
  const inv = params.trainerInventory ?? emptyTrainerInventory()
  return {
    version: SAVE_VERSION,
    starterId: params.starterId,
    runCreature: params.runCreature,
    mapNodes: [...params.mapNodes],
    nodeStates: { ...params.nodeStates },
    partyRecruits: [],
    activeHelperId: null,
    earnedBadges: [],
    currentRegion: params.regionId,
    completedRegionIds: [],
    pendingBossVictory: false,
    regionCompleteInfo: null,
    screen: 'runMap',
    activeNodeId: null,
    pendingPerkDraftQueue: [] as PerkDraftQueueEntry[],
    draftingCreatureId: null,
    shopLog: [],
    restChoiceMade: false,
    currentEventId: null,
    rewardInfo: null,
    defeatInfo: null,
    draftPerkIds: [],
    pendingRecruit: null,
    pendingEvolutionQueue: [] as EvolutionQueueEntry[],
    pendingAbilityUpgradeQueue: [],
    pendingTransformQueue: [] as AbilityTransformQueueEntry[],
    pendingPostBattleQueue: [] as PostBattleQueueEvent[],
    trainerInventory: {
      consumables: [...inv.consumables],
      gear: [...inv.gear],
      materials: [...inv.materials],
      keyItems: [...inv.keyItems],
    },
    questState: createDefaultQuestState(),
  }
}

export function logNewGameCreated(params: {
  slotId: number | null
  currentRegion: string
  starterLevel: number
  mapNodeCount: number
  mode: 'normal' | 'daily'
}): void {
  const enemyLevelRange = getRegionEnemyLevelRange(params.currentRegion)
  console.log('New game created', {
    slotId: params.slotId,
    currentRegion: params.currentRegion,
    enemyLevelRange,
    starterLevel: params.starterLevel,
    mapId: `${params.currentRegion}-${params.mapNodeCount}-nodes`,
    mode: params.mode,
  })
}
