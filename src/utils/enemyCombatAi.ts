import { getAbility, type Ability } from '../data/abilities'
import type { AbilityEffect } from '../data/abilityTypes'
import type { Enemy } from '../data/enemies'
import { getTypeEffectivenessMultiplier } from '../data/typeChart'
import type { ElementType } from '../data/starters'
import { buildCombatStatsForEnemy } from './badgeBonuses'
import {
  applyEarlyGameDamageCap,
  clampAbilityPowerForEnemy,
} from './damageBalance'
import {
  abilityDealsDamage,
  type CombatStatStages,
} from './combatEffects'
import { safeCalcDamage, sanitizeDamage } from './combat'
import type { CombatStats } from './combat'

export type EnemyAiTarget = {
  key: string
  name: string
  type: ElementType
  currentHp: number
  maxHp: number
  stats: CombatStats
}

function abilityPool(enemy: Enemy): Ability[] {
  return enemy.abilityIds
    .map((id) => getAbility(id))
    .filter((a): a is Ability => Boolean(a))
}

function hasActiveSelfBuff(
  ability: Ability,
  enemyStages: CombatStatStages,
): boolean {
  const buffs = (ability.effects ?? []).filter(
    (e: AbilityEffect) =>
      e.type === 'statBuff' &&
      (e.target === 'self' || ability.target === 'self'),
  )
  if (buffs.length === 0) return false
  return buffs.some((e) => {
    if (e.type !== 'statBuff') return false
    const stage = enemyStages[e.stat] ?? 0
    return stage >= (e.stages ?? 1)
  })
}

function hasActiveDebuffOnTarget(
  ability: Ability,
  targetKey: string,
  playerStages: Record<string, CombatStatStages>,
): boolean {
  const debuffs = (ability.effects ?? []).filter(
    (e: AbilityEffect) => e.type === 'statDebuff',
  )
  if (debuffs.length === 0) return false
  const stages = playerStages[targetKey] ?? {}
  return debuffs.some((e) => {
    if (e.type !== 'statDebuff') return false
    const stage = stages[e.stat] ?? 0
    return stage <= -(e.stages ?? 1)
  })
}

function estimateDamage(
  ability: Ability,
  enemy: Enemy,
  target: EnemyAiTarget,
  enemyStages: CombatStatStages,
): number {
  if (!abilityDealsDamage(ability)) return 0
  const typeMult = getTypeEffectivenessMultiplier(ability.type, target.type)
  const attackStats = buildCombatStatsForEnemy(enemy.stats, enemyStages)
  const powerCap = clampAbilityPowerForEnemy(
    ability.power,
    enemy.level,
    enemy.kind,
  )
  const abilityForDamage =
    powerCap < ability.power ? { ...ability, power: powerCap } : ability
  let damage = safeCalcDamage(
    abilityForDamage,
    attackStats,
    target.stats,
    target.maxHp,
  )
  damage = Math.floor(damage * typeMult)
  damage = applyEarlyGameDamageCap(
    damage,
    target.maxHp,
    enemy.level,
    typeMult,
    enemy.kind,
  )
  return sanitizeDamage(damage, target.maxHp, abilityForDamage, typeMult)
}

function scoreAbility(
  ability: Ability,
  enemy: Enemy,
  focus: EnemyAiTarget,
  enemyStages: CombatStatStages,
  playerStages: Record<string, CombatStatStages>,
): number {
  const typeMult = getTypeEffectivenessMultiplier(ability.type, focus.type)
  const hpRatio = focus.maxHp > 0 ? focus.currentHp / focus.maxHp : 1

  if (abilityDealsDamage(ability)) {
    let score = estimateDamage(ability, enemy, focus, enemyStages) * 2
    if (typeMult >= 1.5) score += 28
    else if (typeMult < 1) score -= 12
    else score += 8
    if (hpRatio < 0.35) score += 22
    if (ability.power >= 40) score += 6
    return score
  }

  if (ability.category === 'status' && ability.power <= 0) {
    const onlyStatus = !(ability.effects ?? []).some(
      (e: AbilityEffect) => e.type === 'statBuff' || e.type === 'statDebuff',
    )
    if (onlyStatus) return -40
  }

  let score = 0
  if (hasActiveSelfBuff(ability, enemyStages)) {
    score -= 50
  } else if (
    (ability.effects ?? []).some(
      (e: AbilityEffect) =>
        e.type === 'statBuff' &&
        (e.target === 'self' || ability.target === 'self'),
    )
  ) {
    score += 18 + Math.floor(Math.random() * 10)
  }

  if (hasActiveDebuffOnTarget(ability, focus.key, playerStages)) {
    score -= 45
  } else if (
    (ability.effects ?? []).some((e: AbilityEffect) => e.type === 'statDebuff')
  ) {
    const threat = focus.stats.atk + focus.stats.spAtk
    if (threat >= 12) score += 16 + Math.floor(Math.random() * 8)
    else score += 6
  }

  return score
}

/** Smarter enemy move selection for normal map combat (preview + real turns). */
export function pickEnemyCombatMove(
  enemy: Enemy,
  targets: EnemyAiTarget[],
  enemyStages: CombatStatStages = {},
  playerStages: Record<string, CombatStatStages> = {},
): string {
  const pool = abilityPool(enemy)
  if (pool.length === 0) return enemy.abilityIds[0] ?? 'tackle'
  if (pool.length === 1) return pool[0]!.id

  const living = targets.filter((t) => t.currentHp > 0)
  const focus =
    living.length > 0
      ? [...living].sort((a, b) => {
          const ar = a.maxHp > 0 ? a.currentHp / a.maxHp : 1
          const br = b.maxHp > 0 ? b.currentHp / b.maxHp : 1
          return ar - br
        })[0]!
      : targets[0]

  if (!focus) return pool[0]!.id

  let bestId = pool[0]!.id
  let bestScore = -Infinity
  for (const ability of pool) {
    const score = scoreAbility(
      ability,
      enemy,
      focus,
      enemyStages,
      playerStages,
    )
    if (score > bestScore) {
      bestScore = score
      bestId = ability.id
    }
  }

  const damaging = pool.filter((a) => abilityDealsDamage(a) && a.power > 0)
  if (damaging.length > 0 && bestScore < 5) {
    return damaging[Math.floor(Math.random() * damaging.length)]!.id
  }

  return bestId
}
