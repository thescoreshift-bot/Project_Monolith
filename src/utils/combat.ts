import type { Ability } from '../data/abilities'
import { getAbilityDisplayName } from '../data/abilities'
import { BALANCE } from '../data/balance'
import { NOT_VERY_EFFECTIVE_MULTIPLIER } from '../data/typeChart'
import type { EnemyStats } from '../data/enemies'
import type { StarterStats } from '../data/starters'

export type CombatStats = Pick<
  StarterStats,
  'atk' | 'def' | 'spAtk' | 'spDef'
>

export function rollHits(accuracy: number): boolean {
  const effective = Math.min(100, Math.max(0, accuracy))
  return Math.random() * 100 < effective
}

export type AbilityCombatModifiers = {
  flatDamage: number
  bonusDamagePercent: number
  bonusAccuracy: number
  bonusCritChance: number
  bonusStatusChance: number
}

export const EMPTY_ABILITY_MODIFIERS: AbilityCombatModifiers = {
  flatDamage: 0,
  bonusDamagePercent: 0,
  bonusAccuracy: 0,
  bonusCritChance: 0,
  bonusStatusChance: 0,
}

function safeStat(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, value) : 1
}

export function normalizeCombatStats(
  stats: Partial<CombatStats> | null | undefined,
): CombatStats {
  return {
    atk: safeStat(stats?.atk),
    def: safeStat(stats?.def),
    spAtk: safeStat(stats?.spAtk),
    spDef: safeStat(stats?.spDef),
  }
}

export function abilityHasDamageComponent(ability: Ability): boolean {
  return ability.category !== 'status' && ability.power > 0
}

/** Minimum damage for damaging moves — avoids stuck-at-1 chip damage. */
export function getMinimumDamageFloor(
  defenderMaxHp: number,
  typeMultiplier: number,
): number {
  if (defenderMaxHp <= 0) return 3
  const notVery = typeMultiplier <= NOT_VERY_EFFECTIVE_MULTIPLIER
  const pct = notVery
    ? BALANCE.damageFloorPercent.notVeryEffective
    : BALANCE.damageFloorPercent.neutral
  const fromHp = Math.floor(defenderMaxHp * pct)
  return notVery ? Math.max(2, fromHp) : Math.max(3, fromHp)
}

export type DamageCalcDebugContext = {
  attackerName?: string
  attackerId?: string
  abilityId?: string
  abilityName?: string
  defenderName?: string
  rawDamage?: number
}

export function applyDamageFloor(
  damage: number,
  ability: Ability,
  defenderMaxHp: number,
  typeMultiplier: number,
  debug?: DamageCalcDebugContext,
): number {
  if (!abilityHasDamageComponent(ability)) {
    return 0
  }

  if (!Number.isFinite(damage) || damage < 0) {
    damage = 0
  }

  const floor = getMinimumDamageFloor(defenderMaxHp, typeMultiplier)
  const before = damage

  if (damage > 0 && damage < floor) {
    damage = floor
  }

  if (before <= 1 && damage > before) {
    console.warn('Suspicious low damage (raised to floor)', {
      attackerName: debug?.attackerName,
      attackerId: debug?.attackerId,
      abilityId: debug?.abilityId ?? ability.id,
      abilityName: debug?.abilityName ?? getAbilityDisplayName(ability),
      abilityPower: ability.power,
      abilityCategory: ability.category,
      typeMultiplier,
      rawDamage: debug?.rawDamage ?? before,
      finalDamage: damage,
      minimumFloor: floor,
      defenderMaxHp,
    })
  }

  return damage
}

export function calcDamage(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
  defenderMaxHp?: number,
  typeMultiplier = 1,
  debug?: DamageCalcDebugContext,
): number {
  return safeCalcDamage(ability, attacker, defender, defenderMaxHp, typeMultiplier, debug)
}

export function safeCalcDamage(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
  defenderMaxHp?: number,
  typeMultiplier = 1,
  debug?: DamageCalcDebugContext,
): number {
  if (!abilityHasDamageComponent(ability)) {
    return 0
  }

  const atk = normalizeCombatStats(attacker)
  const def = normalizeCombatStats(defender)

  const attackStat =
    ability.category === 'physical' ? atk.atk : atk.spAtk
  const defenseStat =
    ability.category === 'physical' ? def.def : def.spDef

  const ratio = attackStat / Math.max(1, defenseStat)
  const blendedPower =
    ability.power * (0.7 + Math.min(1.4, ratio) * 0.22) +
    Math.floor((attackStat - defenseStat) * 0.35)
  let damage = Math.max(0, Math.floor(blendedPower))

  if (!Number.isFinite(damage)) {
    console.warn('Non-finite damage in safeCalcDamage', {
      abilityId: ability.id,
      attackStat,
      defenseStat,
      blendedPower,
    })
    damage = 0
  }

  if (defenderMaxHp !== undefined && defenderMaxHp > 0) {
    damage = applyDamageFloor(damage, ability, defenderMaxHp, typeMultiplier, {
      ...debug,
      rawDamage: blendedPower,
    })
  }

  return damage
}

export function sanitizeDamage(
  damage: number,
  defenderMaxHp: number,
  ability?: Ability,
  typeMultiplier = 1,
): number {
  if (!Number.isFinite(damage) || damage < 0) {
    return ability && abilityHasDamageComponent(ability) ? getMinimumDamageFloor(defenderMaxHp, typeMultiplier) : 0
  }
  if (damage === 0) {
    return 0
  }

  const maxHit = Math.max(
    1,
    Math.floor(defenderMaxHp * BALANCE.maxHitPercentOfMaxHp),
  )
  let capped = Math.min(damage, maxHit)

  if (
    ability &&
    abilityHasDamageComponent(ability) &&
    defenderMaxHp > 0 &&
    capped > defenderMaxHp * BALANCE.suspiciousHitPercent
  ) {
    console.warn('Suspicious high damage in normal combat', {
      abilityId: ability.id,
      abilityPower: ability.power,
      damage: capped,
      defenderMaxHp,
      fraction: (capped / defenderMaxHp).toFixed(2),
    })
  }

  if (ability && abilityHasDamageComponent(ability)) {
    capped = applyDamageFloor(capped, ability, defenderMaxHp, typeMultiplier)
  }

  return capped
}

export function applyDamage(currentHp: number, damage: number): number {
  const safeHp =
    typeof currentHp === 'number' && Number.isFinite(currentHp) ? currentHp : 0
  const safeDmg =
    typeof damage === 'number' && Number.isFinite(damage) ? Math.max(0, damage) : 0
  return Math.max(0, safeHp - safeDmg)
}

export function pickEnemyAbility(abilityIds: string[]): string {
  const index = Math.floor(Math.random() * abilityIds.length)
  return abilityIds[index]
}

export type FighterStats = StarterStats | EnemyStats
