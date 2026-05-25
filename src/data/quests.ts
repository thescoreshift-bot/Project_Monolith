export type QuestType =
  | 'defeatEnemies'
  | 'clearBattleNodes'
  | 'defeatElites'
  | 'defeatAlpha'
  | 'winGymBattle'
  | 'collectCoins'
  | 'recruitCreature'
  | 'useAbility'
  | 'useAbilityType'
  | 'healAtRecoveryStation'
  | 'completeEvents'
  | 'equipGear'
  | 'winCouncilFight'
  | 'completeCouncil'

export type QuestCategory =
  | 'tutorial'
  | 'daily'
  | 'region'
  | 'progression'
  | 'repeatable'

export type QuestRewardTier = 1 | 2 | 3 | 4

export type QuestDefinition = {
  id: string
  title: string
  description: string
  type: QuestType
  target: string
  requiredAmount: number
  rewardTier: QuestRewardTier
  minLevel: number
  minRegionIndex?: number
  repeatable: boolean
  category: QuestCategory
  rewardPreview: string
  /** Optional ability type for useAbilityType */
  abilityType?: string
}

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Clear 1 battle node on the route map.',
    type: 'clearBattleNodes',
    target: 'battle',
    requiredAmount: 1,
    rewardTier: 1,
    minLevel: 1,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: '20 coins, 20 XP',
  },
  {
    id: 'field-trainee',
    title: 'Field Trainee',
    description: 'Defeat 3 wild creatures in battle.',
    type: 'defeatEnemies',
    target: 'any',
    requiredAmount: 3,
    rewardTier: 1,
    minLevel: 1,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: '2× Small Potion, 30 coins',
  },
  {
    id: 'build-a-team',
    title: 'Build a Team',
    description: 'Recruit 1 creature to your party.',
    type: 'recruitCreature',
    target: 'any',
    requiredAmount: 1,
    rewardTier: 1,
    minLevel: 1,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: '40 coins, common gear',
  },
  {
    id: 'learn-the-flow',
    title: 'Learn the Flow',
    description: 'Use 5 abilities in combat.',
    type: 'useAbility',
    target: 'any',
    requiredAmount: 5,
    rewardTier: 1,
    minLevel: 1,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: '25 XP to party',
  },
  {
    id: 'safe-recovery',
    title: 'Safe Recovery',
    description: 'Heal your party once at the Recovery Station.',
    type: 'healAtRecoveryStation',
    target: 'any',
    requiredAmount: 1,
    rewardTier: 1,
    minLevel: 1,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: '20 coins, Monolith Fragment',
  },
  {
    id: 'first-badge-path',
    title: 'First Badge Path',
    description: 'Defeat a gym trainer or gym leader.',
    type: 'winGymBattle',
    target: 'gym',
    requiredAmount: 1,
    rewardTier: 2,
    minLevel: 3,
    repeatable: false,
    category: 'progression',
    rewardPreview: '75 coins, rare gear chance',
  },
  {
    id: 'elite-hunter',
    title: 'Elite Hunter',
    description: 'Defeat 2 elite encounters.',
    type: 'defeatElites',
    target: 'elite',
    requiredAmount: 2,
    rewardTier: 2,
    minLevel: 5,
    repeatable: true,
    category: 'region',
    rewardPreview: 'Coins, XP, materials',
  },
  {
    id: 'alpha-scout',
    title: 'Alpha Scout',
    description: 'Defeat 1 alpha nest creature.',
    type: 'defeatAlpha',
    target: 'alpha',
    requiredAmount: 1,
    rewardTier: 2,
    minLevel: 10,
    repeatable: true,
    category: 'region',
    rewardPreview: 'Coins, uncommon gear',
  },
  {
    id: 'coin-collector',
    title: 'Coin Collector',
    description: 'Earn 100 coins from battles and events.',
    type: 'collectCoins',
    target: 'coins',
    requiredAmount: 100,
    rewardTier: 2,
    minLevel: 5,
    repeatable: true,
    category: 'repeatable',
    rewardPreview: 'Bonus coins',
  },
  {
    id: 'event-runner',
    title: 'Event Runner',
    description: 'Complete 2 route events.',
    type: 'completeEvents',
    target: 'event',
    requiredAmount: 2,
    rewardTier: 2,
    minLevel: 5,
    repeatable: true,
    category: 'region',
    rewardPreview: 'Coins, consumables',
  },
  {
    id: 'gear-up',
    title: 'Gear Up',
    description: 'Equip gear on a party creature.',
    type: 'equipGear',
    target: 'gear',
    requiredAmount: 1,
    rewardTier: 1,
    minLevel: 3,
    repeatable: false,
    category: 'tutorial',
    rewardPreview: 'Materials, coins',
  },
  {
    id: 'ember-patrol',
    title: 'Ember Coast Patrol',
    description: 'Defeat 5 enemies while in Ember Coast.',
    type: 'defeatEnemies',
    target: 'ember-coast',
    requiredAmount: 5,
    rewardTier: 3,
    minLevel: 10,
    minRegionIndex: 2,
    repeatable: true,
    category: 'region',
    rewardPreview: 'High coins, rare gear',
  },
  {
    id: 'storm-challenge',
    title: 'Storm Plateau Challenge',
    description: 'Win 3 gym battles.',
    type: 'winGymBattle',
    target: 'gym',
    requiredAmount: 3,
    rewardTier: 3,
    minLevel: 15,
    minRegionIndex: 3,
    repeatable: true,
    category: 'region',
    rewardPreview: 'Epic rewards',
  },
  {
    id: 'master-of-elements',
    title: 'Element Practice',
    description: 'Use 10 Fire-type abilities in combat.',
    type: 'useAbilityType',
    target: 'Fire',
    requiredAmount: 10,
    rewardTier: 2,
    minLevel: 8,
    repeatable: true,
    category: 'repeatable',
    rewardPreview: 'XP, coins',
    abilityType: 'Fire',
  },
  {
    id: 'council-trial',
    title: 'Council Trial',
    description: 'Win 1 Monolith Council fight.',
    type: 'winCouncilFight',
    target: 'any',
    requiredAmount: 1,
    rewardTier: 2,
    minLevel: 10,
    minRegionIndex: 1,
    repeatable: true,
    category: 'progression',
    rewardPreview: 'Coins, XP',
  },
  {
    id: 'council-gauntlet',
    title: 'Council Gauntlet',
    description: 'Complete a full Monolith Council challenge.',
    type: 'completeCouncil',
    target: 'any',
    requiredAmount: 1,
    rewardTier: 3,
    minLevel: 12,
    minRegionIndex: 1,
    repeatable: false,
    category: 'progression',
    rewardPreview: 'Rare rewards',
  },
]

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUEST_DEFINITIONS.find((q) => q.id === id)
}
