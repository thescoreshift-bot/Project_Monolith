import { DEFAULT_REGION_ID } from '../data/regions'
import { createSeededRng } from './seededRandom'

export type DailyModifierId =
  | 'wildSurge'
  | 'emberDay'
  | 'richRoute'
  | 'harshPath'
  | 'recruitRush'

export type DailyModifier = {
  id: DailyModifierId
  name: string
  description: string
  /** Enemy max HP multiplier */
  enemyHpMult?: number
  /** Coin reward multiplier */
  coinRewardMult?: number
  /** Rest node weight multiplier in map gen */
  restWeightMult?: number
  /** Extra recruitment chance (0–1 additive) */
  recruitChanceBonus?: number
  /** Prefer fire enemies in normal pool */
  fireEnemyBias?: boolean
}

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: 'wildSurge',
    name: 'Wild Surge',
    description: 'Wild enemies have +10% HP.',
    enemyHpMult: 1.1,
  },
  {
    id: 'emberDay',
    name: 'Ember Day',
    description: 'Fire-type wild enemies appear more often.',
    fireEnemyBias: true,
  },
  {
    id: 'richRoute',
    name: 'Rich Route',
    description: 'Coin rewards are +20%.',
    coinRewardMult: 1.2,
  },
  {
    id: 'harshPath',
    name: 'Harsh Path',
    description: 'Rest nodes appear less often on the map.',
    restWeightMult: 0.5,
  },
  {
    id: 'recruitRush',
    name: 'Recruit Rush',
    description: 'Recruitment chance +10%.',
    recruitChanceBonus: 0.1,
  },
]

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDailySeed(date = new Date()): string {
  return `daily-${getTodayDateKey(date)}`
}

export function getDailyModifierForSeed(seed: string): DailyModifier {
  const rng = createSeededRng(`${seed}-modifier`)
  const index = Math.floor(rng() * DAILY_MODIFIERS.length)
  return DAILY_MODIFIERS[index]!
}

export function getDailyRunRegionId(): string {
  return DEFAULT_REGION_ID
}

export function formatDailyDisplayDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
