import type { MapNode } from '../data/nodeMap'
import { getCouncilForRegion, getCouncilNodeId } from '../data/monolithCouncil'
import { BADGES_IN_REGION } from '../data/badges'
import type { RegionCouncil } from '../data/monolithCouncil'
import { badgesProgressLabel } from './monolithCouncilState'

export type CouncilMapPlacement = {
  layer: number
  column: number
  anchorNodeIds: string[]
}

/** Resolve where the Council node sits and which nodes connect into it. */
export function resolveCouncilMapPlacement(
  nodes: MapNode[],
  councilNodeId: string,
): CouncilMapPlacement {
  const routeNodes = nodes.filter((n) => n.id !== councilNodeId)
  if (routeNodes.length === 0) {
    return { layer: 1, column: 2, anchorNodeIds: [] }
  }

  const highestLayer = Math.max(...routeNodes.map((n) => n.layer), 0)
  const boss = routeNodes.find((n) => n.type === 'boss')
  const councilLayer = highestLayer + 1
  const column = boss?.column ?? 2

  const anchorIds: string[] = []
  const pushAnchor = (id: string) => {
    if (!anchorIds.includes(id)) anchorIds.push(id)
  }

  if (boss) pushAnchor(boss.id)

  for (const node of routeNodes) {
    if (node.type === 'gymLeader') pushAnchor(node.id)
  }

  const topLayer = boss?.layer ?? highestLayer
  for (const node of routeNodes) {
    if (node.layer >= topLayer - 1 && node.layer <= topLayer) {
      pushAnchor(node.id)
    }
  }

  if (anchorIds.length === 0) {
    const start = routeNodes.find((n) => n.layer === 0)
    if (start) pushAnchor(start.id)
  }

  return { layer: councilLayer, column, anchorNodeIds: anchorIds }
}

export function buildCouncilMapNodeFields(
  regionId: string,
  council: RegionCouncil,
  earnedBadges: string[],
): Pick<MapNode, 'label' | 'mapSubtitle' | 'mapTooltip'> {
  const badges = badgesProgressLabel(regionId, earnedBadges)
  return {
    label: 'Monolith Council',
    mapSubtitle: 'Final Region Challenge',
    mapTooltip: [
      council.officialName,
      `Known locally as ${council.localName}`,
      '2v2 gauntlet — helper required',
      `Badges: ${badges} (${BADGES_IN_REGION} required)`,
    ].join('\n'),
  }
}

/** Strip council links from all nodes and attach anchors → council. */
export function wireCouncilNodeIntoMap(
  nodes: MapNode[],
  councilNodeId: string,
  placement: CouncilMapPlacement,
  councilFields: Pick<MapNode, 'label' | 'mapSubtitle' | 'mapTooltip'>,
): MapNode[] {
  const withoutCouncilLinks = nodes.map((n) => ({
    ...n,
    connectsTo: n.connectsTo.filter((id) => id !== councilNodeId),
  }))

  const existing = withoutCouncilLinks.find((n) => n.id === councilNodeId)
  const councilNode: MapNode = existing
    ? {
        ...existing,
        type: 'monolithCouncil',
        layer: placement.layer,
        column: placement.column,
        connectsTo: [],
        ...councilFields,
      }
    : {
        id: councilNodeId,
        type: 'monolithCouncil',
        layer: placement.layer,
        column: placement.column,
        connectsTo: [],
        ...councilFields,
      }

  const anchorSet = new Set(placement.anchorNodeIds)
  const merged = withoutCouncilLinks
    .filter((n) => n.id !== councilNodeId)
    .map((n) => {
      if (!anchorSet.has(n.id)) return n
      if (n.connectsTo.includes(councilNodeId)) return n
      return { ...n, connectsTo: [...n.connectsTo, councilNodeId] }
    })

  return [...merged, councilNode]
}

export function getCouncilNodeIdForRegion(regionId: string): string {
  return getCouncilNodeId(regionId)
}

export function getCouncilForMapTooltip(regionId: string): RegionCouncil | undefined {
  const council = getCouncilForRegion(regionId)
  if (!council || council.trials.length === 0) return undefined
  return council
}
