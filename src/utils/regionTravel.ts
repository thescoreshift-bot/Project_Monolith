import { getBadge } from '../data/badges'
import { getRegion, REGIONS, type Region } from '../data/regions'
import {
  generateMap,
  getInitialNodeStates,
  type GeneratedMap,
} from './mapGenerator'

export type RegionMapState = GeneratedMap & {
  nodeStates: Record<string, import('../data/nodeMap').NodeVisitState>
}

export function countBadgesInRegion(
  regionId: string,
  earnedBadgeIds: string[],
): number {
  return earnedBadgeIds.filter((id) => getBadge(id)?.regionId === regionId).length
}

export function createRegionMap(
  regionId: string,
  earnedBadges: string[],
): RegionMapState {
  const generated = generateMap(regionId, earnedBadges)
  const nodeStates = getInitialNodeStates(
    generated.nodes,
    generated.startNodeId,
    earnedBadges,
    regionId,
  )
  return {
    ...generated,
    nodeStates,
  }
}

export function getRegionDisplayName(regionId: string): string {
  return getRegion(regionId).name
}

export function getAllTravelRegions(): Region[] {
  return [...REGIONS]
}
