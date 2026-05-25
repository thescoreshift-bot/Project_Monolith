import type { MapNode } from '../data/nodeMap'
import type { EncounterKind } from '../data/enemies'

export type CombatSource =
  | 'mapNode'
  | 'event'
  | 'pvp'
  | 'dailyRun'
  | 'monolithCouncil'

export type CombatEncounterType = EncounterKind | 'pvp'

export type CombatContext = {
  source: CombatSource
  encounterType: CombatEncounterType
  nodeId?: string
  nodeType?: string
  eventId?: string
  eventChoiceId?: string
  mapNode?: MapNode | null
  regionId?: string
  councilId?: string
  trialIndex?: number
  fightNumber?: number
  councilAiStyle?: string
}

export function createMapCombatContext(
  node: MapNode,
  encounterType: EncounterKind,
  source: CombatSource = 'mapNode',
): CombatContext {
  return {
    source,
    encounterType,
    nodeId: node.id,
    nodeType: node.type,
    mapNode: node,
  }
}

export function createCouncilCombatContext(params: {
  regionId: string
  councilId: string
  trialIndex: number
  fightNumber: number
  councilAiStyle: string
  nodeId?: string
  mapNode?: MapNode | null
}): CombatContext {
  return {
    source: 'monolithCouncil',
    encounterType: 'council',
    regionId: params.regionId,
    councilId: params.councilId,
    trialIndex: params.trialIndex,
    fightNumber: params.fightNumber,
    councilAiStyle: params.councilAiStyle,
    nodeId: params.nodeId,
    nodeType: 'monolithCouncil',
    mapNode: params.mapNode ?? null,
  }
}

export function createEventAlphaCombatContext(params: {
  eventId: string
  eventChoiceId: 'a' | 'b'
  nodeId?: string
  mapNode?: MapNode | null
}): CombatContext {
  return {
    source: 'event',
    encounterType: 'alphaNest',
    eventId: params.eventId,
    eventChoiceId: params.eventChoiceId,
    nodeId: params.nodeId,
    nodeType: params.mapNode?.type ?? 'event',
    mapNode: params.mapNode ?? null,
  }
}
