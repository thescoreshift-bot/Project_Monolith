import type { Ability } from '../data/abilities'
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

export function abilityHasDamageComponent(ability: Ability): boolean {
  return ability.category !== 'status' && ability.power > 0
}

export function calcDamage(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
): number {
  return safeCalcDamage(ability, attacker, defender)
}

export function safeCalcDamage(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
  defenderMaxHp?: number,
): number {
  if (!abilityHasDamageComponent(ability)) return 0

  const attackStat =
    ability.category === 'physical'
      ? safeStat(attacker.atk)
      : safeStat(attacker.spAtk)
  const defenseStat =
    ability.category === 'physical'
      ? safeStat(defender.def)
      : safeStat(defender.spDef)

  const raw = ability.power + attackStat - defenseStat
  let damage = Math.max(1, raw)

  if (!Number.isFinite(damage)) damage = 1

  if (defenderMaxHp !== undefined && defenderMaxHp > 0) {
    damage = Math.min(damage, Math.max(1, Math.floor(defenderMaxHp * 0.75)))
  }

  return damage
}

export function sanitizeDamage(damage: number, defenderMaxHp: number): number {
  if (!Number.isFinite(damage) || damage < 0) return 0
  if (damage === 0) return 0
  const capped = Math.min(damage, Math.max(1, Math.floor(defenderMaxHp * 0.75)))
  return Math.max(1, capped)
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
