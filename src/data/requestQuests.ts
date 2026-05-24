import type { ElementType } from './starters'

export type RequestQuestType =
  | 'defeatEnemies'
  | 'defeatType'
  | 'clearBattleNodes'
  | 'completeEvents'
  | 'defeatAlpha'
  | 'defeatElites'
  | 'winGymBattle'
  | 'recruitCreature'
  | 'useAbility'
  | 'useAbilityType'
  | 'collectMaterials'
  | 'equipGear'
  | 'healAtRecoveryStation'

export type RequestQuestRewardTier = 1 | 2 | 3 | 4

export type RequestQuestDefinition = {
  id: string
  title: string
  description: string
  type: RequestQuestType
  requiredAmount: number
  /** Target filter: enemy kind, node type, ability type, etc. */
  targetType?: string
  minLevel: number
  minRegionIndex?: number
  rewardTier: RequestQuestRewardTier
  repeatable: boolean
  rewardPreview: string
  abilityType?: ElementType
}

export const REQUEST_QUEST_DEFINITIONS: RequestQuestDefinition[] = [
  {
    id: 'req-route-cleanup',
    title: 'Route Cleanup',
    description: 'Defeat 3 wild creatures on the route.',
    type: 'defeatEnemies',
    targetType: 'any',
    requiredAmount: 3,
    minLevel: 1,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Coins + Small Potion',
  },
  {
    id: 'req-field-practice',
    title: 'Field Practice',
    description: 'Use 10 abilities in combat.',
    type: 'useAbility',
    targetType: 'any',
    requiredAmount: 10,
    minLevel: 1,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'XP to party + coins',
  },
  {
    id: 'req-gather-samples',
    title: 'Gather Samples',
    description: 'Complete 2 event nodes.',
    type: 'completeEvents',
    requiredAmount: 2,
    minLevel: 1,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Monolith Fragment + coins',
  },
  {
    id: 'req-team-expansion',
    title: 'Team Expansion',
    description: 'Recruit 1 creature to your party.',
    type: 'recruitCreature',
    requiredAmount: 1,
    minLevel: 1,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Random common gear',
  },
  {
    id: 'req-alpha-warning',
    title: 'Alpha Warning',
    description: 'Defeat 1 Alpha creature.',
    type: 'defeatAlpha',
    requiredAmount: 1,
    minLevel: 1,
    rewardTier: 2,
    repeatable: true,
    rewardPreview: 'High coins + uncommon gear chance',
  },
  {
    id: 'req-recovery-routine',
    title: 'Recovery Routine',
    description: 'Heal your party once at the Recovery Station.',
    type: 'healAtRecoveryStation',
    requiredAmount: 1,
    minLevel: 1,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Coin refund + material',
  },
  {
    id: 'req-scout-patrol',
    title: 'Scout Patrol',
    description: 'Clear 2 battle nodes.',
    type: 'clearBattleNodes',
    targetType: 'battle',
    requiredAmount: 2,
    minLevel: 3,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Coins + XP',
  },
  {
    id: 'req-element-hunter',
    title: 'Element Hunter',
    description: 'Defeat 3 creatures of a specific type.',
    type: 'defeatType',
    targetType: 'any',
    requiredAmount: 3,
    minLevel: 5,
    rewardTier: 2,
    repeatable: true,
    rewardPreview: 'Coins + materials',
  },
  {
    id: 'req-gear-check',
    title: 'Gear Check',
    description: 'Equip a piece of gear on any party member.',
    type: 'equipGear',
    requiredAmount: 1,
    minLevel: 5,
    rewardTier: 1,
    repeatable: true,
    rewardPreview: 'Coins + gear chance',
  },
  {
    id: 'req-material-run',
    title: 'Material Run',
    description: 'Collect 2 crafting materials from the route.',
    type: 'collectMaterials',
    requiredAmount: 2,
    minLevel: 5,
    rewardTier: 2,
    repeatable: true,
    rewardPreview: 'Materials + coins',
  },
  {
    id: 'req-flame-study',
    title: 'Flame Study',
    description: 'Use 8 Fire-type abilities in combat.',
    type: 'useAbilityType',
    targetType: 'Fire',
    abilityType: 'Fire',
    requiredAmount: 8,
    minLevel: 5,
    rewardTier: 2,
    repeatable: true,
    rewardPreview: 'XP + coins',
  },
  {
    id: 'req-elite-contract',
    title: 'Elite Contract',
    description: 'Defeat 2 elite encounters.',
    type: 'defeatElites',
    requiredAmount: 2,
    minLevel: 10,
    rewardTier: 3,
    repeatable: true,
    rewardPreview: 'Rare gear chance + coins',
  },
  {
    id: 'req-gym-scout',
    title: 'Gym Scout',
    description: 'Win a gym trainer or leader battle.',
    type: 'winGymBattle',
    requiredAmount: 1,
    minLevel: 15,
    rewardTier: 3,
    repeatable: true,
    rewardPreview: 'High coins + rare gear',
  },
  {
    id: 'req-high-risk-alpha',
    title: 'High-Risk Alpha',
    description: 'Defeat 2 Alpha creatures.',
    type: 'defeatAlpha',
    requiredAmount: 2,
    minLevel: 20,
    rewardTier: 4,
    repeatable: true,
    rewardPreview: 'Epic gear chance + large coin payout',
  },
]

export function getRequestQuestById(id: string): RequestQuestDefinition | undefined {
  return REQUEST_QUEST_DEFINITIONS.find((q) => q.id === id)
}
