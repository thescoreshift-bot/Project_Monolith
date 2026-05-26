import { getAbility, getAbilityDisplayName } from '../data/abilities'
import type { AbilityDefinition } from '../data/abilityTypes'
import { getAbilityDisplayCategory } from '../data/abilityMasteryPerks'
import type { ElementType } from '../data/starters'
import {
  NOT_VERY_EFFECTIVE_MULTIPLIER,
  SUPER_EFFECTIVE_MULTIPLIER,
  getTypeEffectivenessMultiplier,
} from '../data/typeChart'
import type { Enemy } from '../data/enemies'
import { buildCombatStatsForEnemy } from './badgeBonuses'
import {
  applyEarlyGameDamageCap,
  clampAbilityPowerForEnemy,
} from './damageBalance'
import {
  abilityDealsDamage,
  formatAbilityEffectPreview,
  type CombatStatStages,
} from './combatEffects'
import { safeCalcDamage, sanitizeDamage } from './combat'
import { pickEnemyCombatMove, type EnemyAiTarget } from './enemyCombatAi'
import type { CombatStats } from './combat'

export type EnemyIntentTarget = {
  type: ElementType
  stats: CombatStats
  maxHp: number
  name?: string
}

export type EnemyIntentPreview = {
  headline: string
  detail: string
  typeLine: string
  /** True when the foe may pick among several moves (random AI). */
  isHint: boolean
  uncertaintyNote?: string
  effectivenessLabel?: string
}

const STRONG_HIT_POWER = 42

function enemyAbilityPool(enemy: Enemy): AbilityDefinition[] {
  return enemy.abilityIds
    .map((id) => getAbility(id))
    .filter((a): a is AbilityDefinition => Boolean(a))
}

function hasStatDebuff(ability: AbilityDefinition): boolean {
  return (ability.effects ?? []).some((e) => e.type === 'statDebuff')
}

function hasSelfBuff(ability: AbilityDefinition): boolean {
  return (ability.effects ?? []).some(
    (e) =>
      e.type === 'statBuff' &&
      (e.target === 'self' || ability.target === 'self'),
  )
}

function estimateEnemyDamage(
  ability: AbilityDefinition,
  enemy: Enemy,
  target: EnemyIntentTarget,
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

function effectivenessLabel(
  ability: AbilityDefinition,
  targetType: ElementType,
): string | undefined {
  const mult = getTypeEffectivenessMultiplier(ability.type, targetType)
  if (mult >= SUPER_EFFECTIVE_MULTIPLIER) return 'Super effective'
  if (mult <= NOT_VERY_EFFECTIVE_MULTIPLIER) return 'Not very effective'
  return undefined
}

function buildAbilityLines(
  ability: AbilityDefinition,
  enemy: Enemy,
  target: EnemyIntentTarget,
  enemyStages: CombatStatStages,
): Pick<EnemyIntentPreview, 'headline' | 'detail' | 'typeLine' | 'effectivenessLabel'> {
  const name = getAbilityDisplayName(ability)
  const category = getAbilityDisplayCategory(ability)
  const typeLine = `${ability.type} · ${category}`
  const eff = effectivenessLabel(ability, target.type)

  if (abilityDealsDamage(ability)) {
    const est = estimateEnemyDamage(ability, enemy, target, enemyStages)
    const dmgText =
      est > 0 ? `Est. ${est} damage` : 'May deal damage'
    const effSuffix = eff ? ` · ${eff}` : ''
    return {
      headline: name,
      detail: `${dmgText}${effSuffix}`,
      typeLine,
      effectivenessLabel: eff,
    }
  }

  return {
    headline: name,
    detail: `Effect: ${formatAbilityEffectPreview(ability)}`,
    typeLine,
    effectivenessLabel: eff,
  }
}

function pickHint(pool: AbilityDefinition[]): string {
  const damaging = pool.filter(abilityDealsDamage)
  const debuffs = pool.filter(hasStatDebuff)
  const buffs = pool.filter(hasSelfBuff)
  const nonDamage = pool.filter((a) => !abilityDealsDamage(a))

  if (damaging.length === 0 && debuffs.length > 0 && nonDamage.length === debuffs.length) {
    return 'May debuff your party'
  }

  if (damaging.length === 0 && buffs.length > 0) {
    return 'Bolstering itself'
  }

  const maxPower = damaging.reduce((m, a) => Math.max(m, a.power), 0)
  if (maxPower >= STRONG_HIT_POWER) {
    return 'Charging a strong hit'
  }

  if (damaging.length > 0) {
    const types = new Set(damaging.map((a) => a.type))
    if (types.size === 1) {
      const [type] = types
      return `Likely to use a ${type.toLowerCase()} move`
    }
  }

  if (debuffs.length > 0 && damaging.length > 0) {
    return 'May attack or debuff'
  }

  return 'Preparing an attack'
}

function pickFeaturedDamageAbility(
  pool: AbilityDefinition[],
  enemy: Enemy,
  target: EnemyIntentTarget,
  enemyStages: CombatStatStages,
): AbilityDefinition | null {
  const damaging = pool.filter(abilityDealsDamage)
  if (damaging.length === 0) return null

  let best: AbilityDefinition | null = null
  let bestDmg = -1
  for (const ability of damaging) {
    const est = estimateEnemyDamage(ability, enemy, target, enemyStages)
    if (est > bestDmg) {
      bestDmg = est
      best = ability
    }
  }
  return best
}

/** UI preview of likely enemy action (uses same AI as combat when target is known). */
export function buildEnemyIntentPreview(
  enemy: Enemy,
  target: EnemyIntentTarget | null,
  enemyStages: CombatStatStages = {},
  options?: { enemyTurnInProgress?: boolean },
): EnemyIntentPreview | null {
  if (enemy.currentHp <= 0) return null

  const pool = enemyAbilityPool(enemy)
  if (pool.length === 0) return null

  if (options?.enemyTurnInProgress) {
    return {
      headline: 'Striking now',
      detail: 'Enemy turn in progress',
      typeLine: '',
      isHint: true,
    }
  }

  if (!target) {
    return {
      headline: pickHint(pool),
      detail: 'Targeting your party',
      typeLine: '',
      isHint: true,
    }
  }

  const vsNote = target.name ? `vs ${target.name}` : undefined

  if (pool.length === 1) {
    const lines = buildAbilityLines(pool[0], enemy, target, enemyStages)
    return {
      ...lines,
      isHint: false,
      uncertaintyNote: vsNote,
    }
  }

  const aiTarget: EnemyAiTarget = {
    key: 'intent-preview',
    name: target.name ?? 'You',
    type: target.type,
    currentHp: target.maxHp,
    maxHp: target.maxHp,
    stats: target.stats,
  }
  const pickedId = pickEnemyCombatMove(enemy, [aiTarget], enemyStages, {})
  const hint = pickHint(pool)
  const featured =
    pool.find((a) => a.id === pickedId) ??
    pickFeaturedDamageAbility(pool, enemy, target, enemyStages) ??
    pool.find(hasStatDebuff) ??
    pool[0]

  const featuredLines = buildAbilityLines(featured, enemy, target, enemyStages)
  const isDamageHint = abilityDealsDamage(featured)

  return {
    headline: hint,
    detail: isDamageHint
      ? `${featuredLines.headline} · ~${estimateEnemyDamage(featured, enemy, target, enemyStages) || '?'} dmg`
      : `${featuredLines.headline} · ${featuredLines.detail.replace(/^Effect: /, '')}`,
    typeLine: featuredLines.typeLine,
    isHint: true,
    uncertaintyNote: `Move varies · ${vsNote ?? 'targets your party'}`,
    effectivenessLabel: featuredLines.effectivenessLabel,
  }
}
