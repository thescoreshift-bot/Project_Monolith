import { getAbility, type Ability } from '../data/abilities'
import type { Enemy } from '../data/enemies'
import type { CouncilAiStyle } from '../data/monolithCouncil'
import { getTypeEffectivenessMultiplier } from '../data/typeChart'
import type { ElementType } from '../data/starters'
import type { StarterStats } from '../data/starters'
import { abilityDealsDamage } from './combatEffects'

export type CouncilPlayerTarget = {
  key: string
  name: string
  type: ElementType
  currentHp: number
  maxHp: number
  stats: Pick<StarterStats, 'atk' | 'spAtk' | 'def' | 'spDef'>
}

function abilityScore(
  ability: Ability,
  _attackerType: ElementType,
  defenderType: ElementType,
  defenderHpRatio: number,
  style: CouncilAiStyle,
): number {
  let score = 0
  const typeMult = getTypeEffectivenessMultiplier(ability.type, defenderType)
  if (typeMult >= 1.5) score += 40
  else if (typeMult < 1) score -= 15
  else score += 10

  if (abilityDealsDamage(ability)) {
    score += ability.power * 0.4
    if (style === 'offense' || style === 'champion' || style === 'elemental') {
      score += 15
      if (defenderHpRatio < 0.35) score += 25
    }
    if (style === 'defense' && defenderHpRatio > 0.5) score += 5
  } else {
    if (style === 'utilityControl' || style === 'speedStatus' || style === 'defense') {
      score += 22
    }
    if (style === 'champion') score += 12
    if (ability.effects?.some((e) => e.type === 'statBuff')) score += 18
    if (ability.effects?.some((e) => e.type === 'statDebuff')) score += 16
    if (ability.effects?.some((e) => e.type === 'heal')) score += 14
  }

  if (style === 'speedStatus' && ability.category === 'status') score += 10
  return score
}

export function pickCouncilEnemyAbility(
  enemy: Enemy,
  aiStyle: CouncilAiStyle,
  playerTargets: CouncilPlayerTarget[],
  partnerHpRatio: number,
  enemyHpRatio: number,
): string {
  const focus =
    playerTargets.length > 0
      ? [...playerTargets].sort((a, b) => {
          const aRatio = a.maxHp > 0 ? a.currentHp / a.maxHp : 1
          const bRatio = b.maxHp > 0 ? b.currentHp / b.maxHp : 1
          if (aiStyle === 'offense' || aiStyle === 'champion') return aRatio - bRatio
          const aThreat = a.stats.atk + a.stats.spAtk
          const bThreat = b.stats.atk + b.stats.spAtk
          return bThreat - aThreat
        })[0]!
      : null

  let bestId = enemy.abilityIds[0]!
  let bestScore = -Infinity

  for (const id of enemy.abilityIds) {
    const ability = getAbility(id)
    let score = 0
    if (focus) {
      score = abilityScore(
        ability,
        enemy.type,
        focus.type,
        focus.maxHp > 0 ? focus.currentHp / focus.maxHp : 1,
        aiStyle,
      )
    }
    if (aiStyle === 'defense' && enemyHpRatio < 0.4) {
      if (!abilityDealsDamage(ability)) score += 20
      else score -= 8
    }
    if (
      (aiStyle === 'utilityControl' || aiStyle === 'defense') &&
      partnerHpRatio < 0.5 &&
      ability.effects?.some((e) => e.type === 'heal')
    ) {
      score += 30
    }
    if (score > bestScore) {
      bestScore = score
      bestId = id
    }
  }

  return bestId
}

export function pickCouncilEnemyPlayerTarget(
  aiStyle: CouncilAiStyle,
  playerTargets: CouncilPlayerTarget[],
): CouncilPlayerTarget | null {
  if (playerTargets.length === 0) return null
  return [...playerTargets].sort((a, b) => {
    const aRatio = a.maxHp > 0 ? a.currentHp / a.maxHp : 1
    const bRatio = b.maxHp > 0 ? b.currentHp / b.maxHp : 1
    if (aiStyle === 'offense' || aiStyle === 'champion') {
      return aRatio - bRatio
    }
    if (aiStyle === 'speedStatus') {
      const aThreat = a.stats.atk + a.stats.spAtk
      const bThreat = b.stats.atk + b.stats.spAtk
      return bThreat - aThreat
    }
    if (aiStyle === 'defense' || aiStyle === 'utilityControl') {
      const aThreat = a.stats.atk + a.stats.spAtk
      const bThreat = b.stats.atk + b.stats.spAtk
      return bThreat - aThreat
    }
    const aScore = aRatio * 0.5 + (a.stats.atk + a.stats.spAtk) * 0.001
    const bScore = bRatio * 0.5 + (b.stats.atk + b.stats.spAtk) * 0.001
    return aScore - bScore
  })[0]!
}

export function pickCouncilPlayerTargetIndex(
  enemies: Enemy[],
  ability: Ability,
): number {
  const living = enemies
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.currentHp > 0)
  if (living.length === 0) return 0
  if (living.length === 1) return living[0]!.i

  if (abilityDealsDamage(ability)) {
    const sorted = [...living].sort(
      (a, b) =>
        a.e.currentHp / Math.max(1, a.e.maxHp) -
        b.e.currentHp / Math.max(1, b.e.maxHp),
    )
    return sorted[0]!.i
  }
  return living[0]!.i
}

export function aiStyleLabel(style: CouncilAiStyle): string {
  switch (style) {
    case 'offense':
      return 'Offense AI'
    case 'defense':
      return 'Defense AI'
    case 'speedStatus':
      return 'Speed / Status AI'
    case 'utilityControl':
      return 'Control AI'
    case 'elemental':
      return 'Elemental AI'
    case 'champion':
      return 'Warden AI'
    default:
      return 'Council AI'
  }
}
