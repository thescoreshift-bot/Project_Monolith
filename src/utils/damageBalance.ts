import type { EnemyKind } from '../data/enemies'
import {
  L1_NORMAL_HIT_CAP_FRACTION,
  L1_SUPER_HIT_CAP_FRACTION,
  L5_NORMAL_HIT_CAP_FRACTION,
  L5_SUPER_HIT_CAP_FRACTION,
  ENEMY_POWER_CAP_L1_3,
  ENEMY_POWER_CAP_L4_5,
} from './earlyGameBalance'

export type EncounterDamageKind = EnemyKind

export function getDamageCapFraction(
  attackerLevel: number,
  effectivenessMultiplier: number,
  encounterKind: EncounterDamageKind = 'normal',
): number {
  const superEffective = effectivenessMultiplier >= 1.5
  const kind = encounterKind

  if (attackerLevel <= 3) {
    if (kind === 'boss') {
      return superEffective ? 0.48 : 0.38
    }
    if (kind === 'elite' || kind === 'alpha' || kind === 'trainer') {
      return superEffective ? 0.42 : 0.34
    }
    return superEffective ? L1_SUPER_HIT_CAP_FRACTION : L1_NORMAL_HIT_CAP_FRACTION
  }

  if (attackerLevel <= 5) {
    if (kind === 'boss') {
      return superEffective ? 0.52 : 0.42
    }
    if (kind === 'elite' || kind === 'alpha' || kind === 'trainer') {
      return superEffective ? 0.46 : 0.38
    }
    return superEffective ? L5_SUPER_HIT_CAP_FRACTION : L5_NORMAL_HIT_CAP_FRACTION
  }

  if (attackerLevel <= 10) {
    if (kind === 'boss') {
      return superEffective ? 0.62 : 0.52
    }
    if (kind === 'elite' || kind === 'alpha' || kind === 'trainer') {
      return superEffective ? 0.55 : 0.46
    }
    return superEffective ? 0.55 : 0.48
  }

  return 1
}

/** Cap single-hit damage for low-level fights so type advantage is not an instant full-HP delete. */
export function applyEarlyGameDamageCap(
  damage: number,
  defenderMaxHp: number,
  attackerLevel: number,
  effectivenessMultiplier: number,
  encounterKind: EncounterDamageKind = 'normal',
): number {
  if (damage <= 0 || defenderMaxHp <= 0) return damage
  if (attackerLevel > 10 && encounterKind === 'normal') {
    return damage
  }

  const fraction = getDamageCapFraction(
    attackerLevel,
    effectivenessMultiplier,
    encounterKind,
  )
  if (fraction >= 1) return damage

  const cap = Math.max(1, Math.floor(defenderMaxHp * fraction))
  return Math.min(damage, cap)
}

export function getEnemyAbilityPowerCap(
  enemyLevel: number,
  kind: EncounterDamageKind,
): number | undefined {
  if (kind === 'boss') {
    if (enemyLevel <= 5) return 28
    if (enemyLevel <= 10) return 40
    return undefined
  }
  if (kind === 'elite' || kind === 'alpha' || kind === 'trainer') {
    if (enemyLevel <= 3) return ENEMY_POWER_CAP_L1_3 + 2
    if (enemyLevel <= 5) return ENEMY_POWER_CAP_L4_5 + 2
    if (enemyLevel <= 10) return 26
    return undefined
  }
  if (enemyLevel <= 3) return ENEMY_POWER_CAP_L1_3
  if (enemyLevel <= 5) return ENEMY_POWER_CAP_L4_5
  if (enemyLevel <= 10) return 26
  return undefined
}

export function clampAbilityPowerForEnemy(
  basePower: number,
  enemyLevel: number,
  kind: EncounterDamageKind,
): number {
  const cap = getEnemyAbilityPowerCap(enemyLevel, kind)
  if (cap === undefined) return basePower
  return Math.min(basePower, cap)
}
