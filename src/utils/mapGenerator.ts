import { REGION_1_BADGES } from '../data/badges'
import { getRegion } from '../data/regions'
import type { MapNode, NodeType, NodeVisitState } from '../data/nodeMap'
import type { DailyModifier } from './dailyRun'
import { gameRandom } from './seededRandom'

function getBadgesForRegion(regionNumber: number) {
  if (regionNumber !== 1) return []
  return REGION_1_BADGES.map((b) => b.id)
}

function getContentRows(regionId: string): number {
  return getRegion(regionId).mapSettings.rows
}

const GRID_COLUMNS = 5

const TYPE_WEIGHTS: { type: NodeType; weight: number }[] = [
  { type: 'battle', weight: 26 },
  { type: 'event', weight: 18 },
  { type: 'rest', weight: 10 },
  { type: 'shop', weight: 10 },
  { type: 'relicShop', weight: 4 },
  { type: 'elite', weight: 10 },
  { type: 'alphaNest', weight: 5 },
  { type: 'gymTrainer', weight: 8 },
]

function getLabels(regionId: string): Record<NodeType, string[]> {
  const region = getRegion(regionId)
  return {
    battle: ['Wild Sector', 'Hostile Patrol', 'Rival Scout', 'Feral Drift', 'Border Clash'],
    elite: ['Veteran Hunter', 'Elite Guard', 'Champion Scout'],
    alphaNest: ['Alpha Nest', 'Primal Den'],
    event: ['Signal Anomaly', 'Strange Echo', 'Monolith Pulse'],
    shop: ['Drift Market', 'Supply Cache', 'Wandering Trader'],
    relicShop: ['Relic Vault', 'Monolith Curator', 'Ash Reliquary'],
    rest: ['Bio Camp', 'Safe Haven', 'Recovery Post'],
    gymTrainer: ['Gym Trainer', 'Ace Trainer', 'Gym Acolyte'],
    gymLeader: ['Gym Leader', 'Gym Master'],
    boss: [region.bossName, `${region.name} Apex`, 'Monolith Throne'],
  }
}

function getTypeWeights(modifier?: DailyModifier | null): { type: NodeType; weight: number }[] {
  if (!modifier?.restWeightMult) return TYPE_WEIGHTS
  return TYPE_WEIGHTS.map((t) =>
    t.type === 'rest'
      ? { ...t, weight: Math.max(1, Math.round(t.weight * modifier.restWeightMult!)) }
      : t,
  )
}

function pickWeightedType(
  exclude: NodeType[] = [],
  modifier?: DailyModifier | null,
): NodeType {
  const pool = getTypeWeights(modifier).filter((t) => !exclude.includes(t.type))
  const total = pool.reduce((s, t) => s + t.weight, 0)
  let roll = gameRandom() * total
  for (const entry of pool) {
    roll -= entry.weight
    if (roll <= 0) return entry.type
  }
  return 'battle'
}

function labelFor(type: NodeType, regionId: string): string {
  const options = getLabels(regionId)[type]
  return options[Math.floor(gameRandom() * options.length)]
}

function columnForIndex(index: number, count: number): number {
  if (count <= 1) return Math.floor(GRID_COLUMNS / 2)
  const step = (GRID_COLUMNS - 1) / (count - 1)
  return Math.round(index * step)
}

function pickConnections(
  fromCount: number,
  toIds: string[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const minLinks = 1
  const maxLinks = 3

  for (let i = 0; i < fromCount; i++) {
    const linkCount = Math.min(
      toIds.length,
      minLinks + Math.floor(Math.random() * maxLinks),
    )
    const shuffled = [...toIds].sort(() => gameRandom() - 0.5)
    result[`from-${i}`] = shuffled.slice(0, linkCount)
  }

  for (const toId of toIds) {
    if (!Object.values(result).flat().includes(toId)) {
      const randomFrom = Math.floor(Math.random() * fromCount)
      result[`from-${randomFrom}`].push(toId)
    }
  }

  return result
}

export type GeneratedMap = {
  nodes: MapNode[]
  startNodeId: string
  bossNodeId: string
}

export function generateMap(
  regionId: string,
  earnedBadges: string[],
  dailyModifier?: DailyModifier | null,
): GeneratedMap {
  const region = getRegion(regionId)
  const contentRows = getContentRows(regionId)
  const minNodes = region.mapSettings.minNodesPerRow
  const maxNodes = region.mapSettings.maxNodesPerRow

  const nodes: MapNode[] = []
  const rowIds: string[][] = []

  const startId = 'r0-0'
  nodes.push({
    id: startId,
    type: 'battle',
    label: 'Sector Entry',
    layer: 0,
    column: columnForIndex(0, 1),
    connectsTo: [],
  })
  rowIds[0] = [startId]

  const badgeQueue = getBadgesForRegion(region.regionNumber).filter(
    (id) => !earnedBadges.includes(id),
  )

  for (let layer = 1; layer <= contentRows; layer++) {
    const count =
      minNodes + Math.floor(gameRandom() * (maxNodes - minNodes + 1))
    const currentRow: string[] = []
    const badgeForRow =
      badgeQueue.length > 0 ? badgeQueue.shift() : undefined
    const leaderColumn =
      badgeForRow !== undefined
        ? Math.floor(gameRandom() * count)
        : -1

    for (let i = 0; i < count; i++) {
      const id = `r${layer}-${i}`
      let type: NodeType
      let badgeId: string | undefined

      if (i === leaderColumn && badgeForRow) {
        type = 'gymLeader'
        badgeId = badgeForRow
      } else if (badgeForRow && gameRandom() < 0.35) {
        type = 'gymTrainer'
      } else {
        type = pickWeightedType(['gymLeader', 'boss'], dailyModifier)
      }

      nodes.push({
        id,
        type,
        label: labelFor(type, regionId),
        layer,
        column: columnForIndex(i, count),
        connectsTo: [],
        badgeId,
      })
      currentRow.push(id)
    }

    const prevRow = rowIds[layer - 1]
    const linkMap = pickConnections(prevRow.length, currentRow)
    prevRow.forEach((prevId, index) => {
      const node = nodes.find((n) => n.id === prevId)!
      node.connectsTo = linkMap[`from-${index}`] ?? []
    })

    rowIds[layer] = currentRow
  }

  const bossId = 'boss'
  const topRow = rowIds[contentRows]
  nodes.push({
    id: bossId,
    type: 'boss',
    label: labelFor('boss', regionId),
    layer: contentRows + 1,
    column: columnForIndex(0, 1),
    connectsTo: [],
  })

  for (const id of topRow) {
    const node = nodes.find((n) => n.id === id)!
    if (node.connectsTo.length < 3 && gameRandom() < 0.65) {
      node.connectsTo.push(bossId)
    }
  }

  if (
    !topRow.some((id) =>
      nodes.find((n) => n.id === id)!.connectsTo.includes(bossId),
    )
  ) {
    const fallback = topRow[Math.floor(gameRandom() * topRow.length)]
    nodes.find((n) => n.id === fallback)!.connectsTo.push(bossId)
  }

  return { nodes, startNodeId: startId, bossNodeId: bossId }
}

export function getInitialNodeStates(
  nodes: MapNode[],
  startNodeId: string,
  _earnedBadges: string[],
  _regionId: string,
): Record<string, NodeVisitState> {
  const states: Record<string, NodeVisitState> = {}
  for (const node of nodes) {
    if (node.id === startNodeId) {
      states[node.id] = 'available'
    } else {
      states[node.id] = 'locked'
    }
  }
  return states
}

/** Unlock boss when a path from the top row is reachable (no 8-badge gate). */
export function unlockBossIfReady(
  nodes: MapNode[],
  states: Record<string, NodeVisitState>,
  _earnedBadges: string[],
): Record<string, NodeVisitState> {
  const next = { ...states }
  const boss = nodes.find((n) => n.type === 'boss')
  if (!boss) return next

  const parents = nodes.filter((n) => n.connectsTo.includes(boss.id))
  const pathOpen = parents.some(
    (n) => next[n.id] === 'completed' || next[n.id] === 'available',
  )

  if (pathOpen && next[boss.id] === 'locked') {
    next[boss.id] = 'available'
  }
  return next
}

export function getMapNodeFromList(
  nodes: MapNode[],
  nodeId: string,
): MapNode | undefined {
  return nodes.find((n) => n.id === nodeId)
}
