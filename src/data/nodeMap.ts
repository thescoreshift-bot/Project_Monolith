export type NodeType =
  | 'battle'
  | 'elite'
  | 'alphaNest'
  | 'event'
  | 'shop'
  | 'rest'
  | 'gymTrainer'
  | 'gymLeader'
  | 'boss'

export type MapNode = {
  id: string
  type: NodeType
  label: string
  layer: number
  column: number
  connectsTo: string[]
  badgeId?: string
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  battle: 'Battle',
  elite: 'Elite',
  alphaNest: 'Alpha Nest',
  event: 'Event',
  shop: 'Shop',
  rest: 'Rest',
  gymTrainer: 'Gym Trainer',
  gymLeader: 'Gym Leader',
  boss: 'Boss',
}

export type NodeVisitState = 'locked' | 'available' | 'completed'

/** Every NodeType must have a handler in getNodeClickAction */
export const ALL_NODE_TYPES: readonly NodeType[] = [
  'battle',
  'elite',
  'alphaNest',
  'event',
  'shop',
  'rest',
  'gymTrainer',
  'gymLeader',
  'boss',
] as const

export type NodeClickAction = 'combat' | 'shop' | 'rest' | 'event'

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
    case 'rest':
      return 'rest'
    case 'event':
      return 'event'
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
    rest: 'rest',
    gymTrainer: 'gym-trainer',
    gymLeader: 'gym-leader',
    boss: 'boss',
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
    rest: '/assets/map-nodes/rest.png',
    gymTrainer: '/assets/map-nodes/gym-trainer.png',
    gymLeader: '/assets/map-nodes/gym-leader.png',
    boss: '/assets/map-nodes/boss.png',
  }
  return icons[type]
}

export function isDramaticNodeType(type: NodeType): boolean {
  return type === 'boss' || type === 'gymLeader'
}

export function isNodeReachable(
  _nodes: MapNode[],
  states: Record<string, NodeVisitState>,
  nodeId: string,
): boolean {
  return getNodeState(states, nodeId) === 'available'
}
