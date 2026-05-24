export type AchievementCategory =
  | 'Combat'
  | 'Collection'
  | 'Progression'
  | 'Mastery'
  | 'Social'
  | 'Daily'
  | 'Bosses'

export type AchievementReward =
  | { type: 'coins'; amount: number }
  | { type: 'items'; items: { itemId: string; quantity: number }[] }
  | { type: 'gear'; gearId?: string; rarity?: 'uncommon' | 'rare' | 'epic'; random?: boolean }
  | { type: 'title'; titleId: string; titleName: string }

export type AchievementDefinition = {
  id: string
  title: string
  description: string
  category: AchievementCategory
  required: number
  statKey: keyof AchievementStatKeys
  reward: AchievementReward
  hidden?: boolean
}

export type AchievementStatKeys = {
  battlesWon: number
  evolutions: number
  recruits: number
  alphaDefeated: number
  badgesEarned: number
  masteryLevel5: number
  masteryLevel10: number
  dailyQuestsCompleted: number
  pvpWins: number
  itemsCollected: number
  forgeItemsCrafted: number
  forgeGearUpgrades: number
  forgeAlphaCrafts: number
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Win 1 battle.',
    category: 'Combat',
    required: 1,
    statKey: 'battlesWon',
    reward: { type: 'coins', amount: 25 },
  },
  {
    id: 'first-evolution',
    title: 'First Evolution',
    description: 'Evolve any creature.',
    category: 'Progression',
    required: 1,
    statKey: 'evolutions',
    reward: { type: 'coins', amount: 100 },
  },
  {
    id: 'team-builder',
    title: 'Team Builder',
    description: 'Recruit 3 creatures.',
    category: 'Collection',
    required: 3,
    statKey: 'recruits',
    reward: { type: 'gear', random: true, rarity: 'uncommon' },
  },
  {
    id: 'alpha-breaker',
    title: 'Alpha Breaker',
    description: 'Defeat 5 Alpha Nests.',
    category: 'Bosses',
    required: 5,
    statKey: 'alphaDefeated',
    reward: { type: 'coins', amount: 150 },
  },
  {
    id: 'first-craft',
    title: 'First Craft',
    description: 'Craft any item at the Monolith Forge.',
    category: 'Progression',
    required: 1,
    statKey: 'forgeItemsCrafted',
    reward: { type: 'coins', amount: 25 },
  },
  {
    id: 'apprentice-forger',
    title: 'Apprentice Forger',
    description: 'Upgrade gear 3 times at the Monolith Forge.',
    category: 'Progression',
    required: 3,
    statKey: 'forgeGearUpgrades',
    reward: {
      type: 'items',
      items: [{ itemId: 'monolith-fragment', quantity: 2 }],
    },
  },
  {
    id: 'alpha-artisan',
    title: 'Alpha Artisan',
    description: 'Craft gear using an Alpha Claw.',
    category: 'Progression',
    required: 1,
    statKey: 'forgeAlphaCrafts',
    reward: { type: 'title', titleId: 'alpha-artisan', titleName: 'Alpha Artisan' },
  },
  {
    id: 'badge-hunter',
    title: 'Badge Hunter',
    description: 'Earn 8 badges.',
    category: 'Progression',
    required: 8,
    statKey: 'badgesEarned',
    reward: { type: 'title', titleId: 'badge-hunter', titleName: 'Badge Hunter' },
  },
  {
    id: 'master-student',
    title: 'Master Student',
    description: 'Reach Mastery Lv. 5 on any ability.',
    category: 'Mastery',
    required: 1,
    statKey: 'masteryLevel5',
    reward: { type: 'coins', amount: 100 },
  },
  {
    id: 'true-mastery',
    title: 'True Mastery',
    description: 'Reach Mastery Lv. 10 on any ability.',
    category: 'Mastery',
    required: 1,
    statKey: 'masteryLevel10',
    reward: { type: 'title', titleId: 'masterbound', titleName: 'Masterbound' },
  },
  {
    id: 'daily-grinder',
    title: 'Daily Grinder',
    description: 'Complete 7 daily archive quests.',
    category: 'Daily',
    required: 7,
    statKey: 'dailyQuestsCompleted',
    reward: { type: 'gear', random: true, rarity: 'rare' },
  },
  {
    id: 'friend-duelist',
    title: 'Friend Duelist',
    description: 'Win 3 friend-code battles.',
    category: 'Social',
    required: 3,
    statKey: 'pvpWins',
    reward: { type: 'title', titleId: 'duelist', titleName: 'Duelist' },
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Discover 25 gear/items in the Collection Log.',
    category: 'Collection',
    required: 25,
    statKey: 'itemsCollected',
    reward: { type: 'coins', amount: 200 },
  },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENT_DEFINITIONS.map((a) => [a.id, a]),
) as Record<string, AchievementDefinition>
