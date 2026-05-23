import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { generateMap, getInitialNodeStates } from './mapGenerator'
import { healPartyToPercent } from './party'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type DefeatPenaltiesResult = {
  starter: RunCreature
  recruits: PartyCreature[]
  coinsLost: number
}

export type NewRouteResult = {
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  startNodeId: string
}

/** Apply coin loss and 50% HP recovery without changing the map. */
export function applyDefeatPenalties(
  starter: RunCreature,
  recruits: PartyCreature[],
): DefeatPenaltiesResult {
  const coinsLost = Math.floor(starter.coins * 0.25)
  const nextStarter: RunCreature = {
    ...starter,
    coins: starter.coins - coinsLost,
  }
  const healed = healPartyToPercent(nextStarter, recruits, 0.5)
  return {
    starter: healed.starter,
    recruits: healed.recruits,
    coinsLost,
  }
}

/** Generate a fresh map after defeat (call from Begin New Route). */
export function generateNewRoute(
  regionId: string,
  earnedBadges: string[],
): NewRouteResult {
  const { nodes, startNodeId } = generateMap(regionId, earnedBadges)
  const nodeStates = getInitialNodeStates(nodes, startNodeId, earnedBadges, regionId)
  return { mapNodes: nodes, nodeStates, startNodeId }
}
