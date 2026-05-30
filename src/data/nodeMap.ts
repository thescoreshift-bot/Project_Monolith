import { publicAsset } from '../utils/publicAsset'

export type NodeType =
  | 'battle'
  | 'elite'
  | 'alphaNest'
  | 'event'
  | 'shop'
  | 'relicShop'
  | 'rest'
  | 'gymTrainer'
  | 'gymLeader'
  | 'boss'
  | 'monolithCouncil'

export type MapNode = {
  id: string
  type: NodeType
  label: string
  layer: number
  column: number
  connectsTo: string[]
  badgeId?: string
  /** Optional map UI subtitle (e.g. Council node). */
  mapSubtitle?: string
  /** Multi-line tooltip for map node title attribute. */
  mapTooltip?: string
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  battle: 'Battle',
  elite: 'Elite',
  alphaNest: 'Alpha Nest',
  event: 'Event',
  shop: 'Shop',
  relicShop: 'Relic Vault',
  rest: 'Rest',
  gymTrainer: 'Gym Trainer',
  gymLeader: 'Gym Leader',
  boss: 'Boss',
  monolithCouncil: 'Monolith Council',
}

export type NodeVisitState = 'locked' | 'available' | 'completed'

/** Every NodeType must have a handler in getNodeClickAction */
export const ALL_NODE_TYPES: readonly NodeType[] = [
  'battle',
  'elite',
  'alphaNest',
  'event',
  'shop',
  'relicShop',
  'rest',
  'gymTrainer',
  'gymLeader',
  'boss',
  'monolithCouncil',
] as const

export type NodeClickAction =
  | 'combat'
  | 'shop'
  | 'relicShop'
  | 'rest'
  | 'event'
  | 'monolithCouncil'

export function getNodeClickAction(nodeType: NodeType): NodeClickAction {
  switch (nodeType) {
    case 'battle':
    case 'elite':
    case 'alphaNest':
    case 'gymTrainer':
    case 'gymLeader':
    case 'boss':
      return 'combat'
    case 'shop':
      return 'shop'
    case 'relicShop':
      return 'relicShop'
    case 'rest':
      return 'rest'
    case 'event':
      return 'event'
    case 'monolithCouncil':
      return 'monolithCouncil'
    default: {
      const unhandled: never = nodeType
      throw new Error(`Unhandled node type in click router: ${unhandled}`)
    }
  }
}

export function getNodeState(
  states: Record<string, NodeVisitState>,
  nodeId: string,
): NodeVisitState {
  return states[nodeId] ?? 'locked'
}

export function nodeTypeToCssClass(type: NodeType): string {
  const classes: Record<NodeType, string> = {
    battle: 'battle',
    elite: 'elite',
    alphaNest: 'alpha-nest',
    event: 'event',
    shop: 'shop',
    relicShop: 'relic-shop',
    rest: 'rest',
    gymTrainer: 'gym-trainer',
    gymLeader: 'gym-leader',
  boss: 'boss',
  monolithCouncil: 'monolith-council',
}
  return classes[type]
}

export function nodeTypeToIconPath(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    battle: '/assets/map-nodes/battle.png',
    elite: '/assets/map-nodes/elite.png',
    alphaNest: '/assets/map-nodes/alpha-nest.png',
    event: '/assets/map-nodes/event.png',
    shop: '/assets/map-nodes/shop.png',
    relicShop: '/assets/map-nodes/shop.png',
    rest: '/assets/map-nodes/rest.png',
    gymTrainer: '/assets/map-nodes/gym-trainer.png',
    gymLeader: '/assets/map-nodes/gym-leader.png',
  boss: '/assets/map-nodes/boss.png',
  monolithCouncil: '/assets/map-nodes/boss.png',
}
  return publicAsset(icons[type])
}

export function isDramaticNodeType(type: NodeType): boolean {
  return type === 'boss' || type === 'gymLeader' || type === 'monolithCouncil'
}

/** Visual scale tier for map node icons (UI only). */
export type MapNodeSizeTier = 'normal' | 'important' | 'dramatic'

export function getMapNodeSizeTier(type: NodeType): MapNodeSizeTier {
  if (type === 'monolithCouncil') return 'dramatic'
  if (isDramaticNodeType(type)) return 'dramatic'
  if (
    type === 'elite' ||
    type === 'alphaNest' ||
    type === 'gymTrainer' ||
    type === 'relicShop'
  ) {
    return 'important'
  }
  return 'normal'
}

export function isDangerousMapNodeType(type: NodeType): boolean {
  return type === 'elite' || type === 'alphaNest'
}

export function getMapNodeDifficultyHint(type: NodeType): string | null {
  switch (type) {
    case 'elite':
      return 'Elite'
    case 'alphaNest':
      return 'Alpha'
    case 'gymTrainer':
      return 'Gym'
    case 'gymLeader':
      return 'Leader'
    case 'boss':
      return 'Boss'
    case 'monolithCouncil':
      return '8/8 · Council'
    default:
      return null
  }
}

export function isNodeReachable(
  _nodes: MapNode[],
  states: Record<string, NodeVisitState>,
  nodeId: string,
): boolean {
  return getNodeState(states, nodeId) === 'available'
}
