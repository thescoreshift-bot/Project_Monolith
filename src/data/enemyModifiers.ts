import type { EnemyKind } from './enemies'
import { gameRandom } from '../utils/seededRandom'

export type EnemyCombatModifier = {
  id: string
  name: string
  description: string
  physicalDamageTakenMult?: number
  specialDamageTakenMult?: number
  damageDealtMult?: number
  healPerTurnPercent?: number
  startingShieldPercent?: number
  spdBonusPercent?: number
  defPenaltyPercent?: number
}

export const ENEMY_MODIFIER_POOL: EnemyCombatModifier[] = [
  {
    id: 'hardened',
    name: 'Hardened',
    description: 'Takes 10% less physical damage.',
    physicalDamageTakenMult: 0.9,
  },
  {
    id: 'wardbound',
    name: 'Wardbound',
    description: 'Takes 10% less special damage.',
    specialDamageTakenMult: 0.9,
  },
  {
    id: 'regenerating',
    name: 'Regenerating',
    description: 'Heals 4% max HP per turn.',
    healPerTurnPercent: 0.04,
  },
  {
    id: 'frenzied',
    name: 'Frenzied',
    description: '+12% damage and SPD; −8% DEF.',
    damageDealtMult: 1.12,
    spdBonusPercent: 0.12,
    defPenaltyPercent: 0.08,
  },
  {
    id: 'shielded',
    name: 'Shielded',
    description: 'Starts with a 15% max HP shield.',
    startingShieldPercent: 0.15,
  },
  {
    id: 'corrupted',
    name: 'Corrupted',
    description: '+10% damage dealt.',
    damageDealtMult: 1.1,
  },
  {
    id: 'alpha-blooded',
    name: 'Alpha-Blooded',
    description: 'Increased durability and power.',
    physicalDamageTakenMult: 0.95,
    specialDamageTakenMult: 0.95,
    damageDealtMult: 1.08,
  },
]

export function rollEnemyCombatModifier(
  level: number,
  kind: EnemyKind,
): EnemyCombatModifier | undefined {
  if (level < 10) return undefined
  let chance = 0.35
  if (kind === 'elite' || kind === 'alpha') chance = 0.65
  if (kind === 'boss' || kind === 'trainer') chance = 0.55
  if (gameRandom() > chance) return undefined

  const pool = [...ENEMY_MODIFIER_POOL]
  if (kind === 'boss' || kind === 'alpha') {
    const alpha = pool.find((m) => m.id === 'alpha-blooded')
    if (alpha && gameRandom() < 0.35) return { ...alpha }
  }
  const idx = Math.floor(gameRandom() * pool.length)
  return { ...pool[idx]! }
}

export function getEnemyDamageTakenMultiplier(
  modifier: EnemyCombatModifier | undefined,
  abilityCategory: 'physical' | 'special' | string,
): number {
  if (!modifier) return 1
  let mult = 1
  if (
    abilityCategory === 'physical' &&
    modifier.physicalDamageTakenMult
  ) {
    mult *= modifier.physicalDamageTakenMult
  }
  if (
    abilityCategory !== 'physical' &&
    modifier.specialDamageTakenMult
  ) {
    mult *= modifier.specialDamageTakenMult
  }
  return mult
}

export function getEnemyDamageDealtMultiplier(
  modifier: EnemyCombatModifier | undefined,
): number {
  return modifier?.damageDealtMult ?? 1
}
