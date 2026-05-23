import { getBadge } from '../data/badges'
import type { Ability } from '../data/abilities'
import type { StarterStats } from '../data/starters'
import type { PartyCreature } from './party'
import {
  getCombinedBattleBuffs,
  type CreatureWithBattleBuffs,
} from './battleBuffs'
import {
  applyStatStageToValue,
  clampStatStage,
  type CombatStatStages,
} from './combatEffects'
import {
  recalculateStats,
  scaleBaseStatsToLevel,
  type RunCreature,
} from './progression'

export type CombatFighter = RunCreature | PartyCreature

export type BattleBuffs = { atk: number; spAtk: number }

export type CombatStatContext = {
  earnedBadges: string[]
  partyHighestLevel?: number
  statStages?: Partial<Record<'atk' | 'def' | 'spAtk' | 'spDef' | 'spd', number>>
}

function safeCombatStat(value: number | undefined, fallback = 1): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function applyStatStage(value: number, stage: number | undefined): number {
  if (!stage) return value
  return applyStatStageToValue(value, clampStatStage(stage))
}

export function buildCombatStatsForCreature(
  creature: CombatFighter,
  earnedBadges: string[],
  partyHighestLevel: number | undefined,
  statStages: CombatStatStages = {},
): Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'> {
  const full = getEffectiveStats(creature, {
    earnedBadges,
    partyHighestLevel,
    statStages,
  })
  return {
    atk: full.atk,
    def: full.def,
    spAtk: full.spAtk,
    spDef: full.spDef,
  }
}

export function buildCombatStatsForEnemy(
  enemyStats: Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'>,
  statStages: CombatStatStages = {},
): Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'> {
  return {
    atk: applyStatStageToValue(enemyStats.atk, statStages.atk ?? 0),
    def: applyStatStageToValue(enemyStats.def, statStages.def ?? 0),
    spAtk: applyStatStageToValue(enemyStats.spAtk, statStages.spAtk ?? 0),
    spDef: applyStatStageToValue(enemyStats.spDef, statStages.spDef ?? 0),
  }
}

export function applyBadgeStatsToCreature<T extends { stats: StarterStats; maxHp: number; currentHp: number }>(
  creature: T,
  earnedBadges: string[],
): T {
  let stats = { ...creature.stats }
  let maxHp = creature.maxHp

  for (const badgeId of earnedBadges) {
    const badge = getBadge(badgeId)
    if (!badge) continue
    const mod = badge.statModifiers
    if (mod.atk) stats.atk += mod.atk
    if (mod.def) stats.def += mod.def
    if (mod.spAtk) stats.spAtk += mod.spAtk
    if (mod.spDef) stats.spDef += mod.spDef
    if (mod.spd) stats.spd += mod.spd
    if (mod.maxHp) {
      maxHp += mod.maxHp
      stats.hp += mod.maxHp
    }
  }

  return {
    ...creature,
    stats,
    maxHp,
    currentHp: Math.min(maxHp, creature.currentHp),
  }
}

export function getEffectiveStatsWithBadges(
  creature: RunCreature | PartyCreature,
  earnedBadges: string[],
): StarterStats {
  const withBadges = applyBadgeStatsToCreature(
    {
      ...creature,
      stats: { ...creature.stats },
      maxHp: creature.maxHp,
      currentHp: creature.currentHp,
    },
    earnedBadges,
  )

  const buffs = getCombinedBattleBuffs(creature as CreatureWithBattleBuffs)
  return {
    ...withBadges.stats,
    atk: safeCombatStat(withBadges.stats.atk) + buffs.atk,
    spAtk: safeCombatStat(withBadges.stats.spAtk) + buffs.spAtk,
    def: safeCombatStat(withBadges.stats.def),
    spDef: safeCombatStat(withBadges.stats.spDef),
    spd: safeCombatStat(withBadges.stats.spd),
    hp: safeCombatStat(withBadges.stats.hp, withBadges.maxHp),
  }
}

/** Full combat stats: base + perks + badges + shop buffs (starter and helper use the same path). */
export function getCombatEffectiveStats(
  creature: CombatFighter,
  earnedBadges: string[],
  partyHighestLevel?: number,
): StarterStats {
  return getEffectiveStats(creature, {
    earnedBadges,
    partyHighestLevel,
  })
}

export function getEffectiveStats(
  creature: CombatFighter,
  context: CombatStatContext,
): StarterStats {
  const partyLevel = context.partyHighestLevel ?? creature.level
  const baseStats =
    partyLevel > creature.level
      ? scaleBaseStatsToLevel(creature.baseStats, creature.level, partyLevel)
      : creature.baseStats
  const statsFromPerks = recalculateStats(baseStats, creature.selectedPerks)
  const withPerks = {
    ...creature,
    stats: statsFromPerks,
    maxHp: statsFromPerks.hp,
    currentHp: creature.currentHp,
  }
  const withBadges = getEffectiveStatsWithBadges(withPerks, context.earnedBadges)
  const stages = context.statStages ?? {}

  return {
    ...withBadges,
    atk: applyStatStage(withBadges.atk, stages.atk),
    def: applyStatStage(withBadges.def, stages.def),
    spAtk: applyStatStage(withBadges.spAtk, stages.spAtk),
    spDef: applyStatStage(withBadges.spDef, stages.spDef),
    spd: applyStatStage(withBadges.spd, stages.spd),
  }
}

export function getDefenderStatsForAttack(
  defender: Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'>,
  ability: Ability,
  attackerPerks: string[],
): Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'> {
  if (
    attackerPerks.includes('piercing-instinct') &&
    ability.category === 'physical'
  ) {
    return {
      ...defender,
      def: Math.max(0, defender.def - 5),
    }
  }
  return defender
}

export function getAttackerDamageMultiplier(
  ability: Ability,
  earnedBadges: string[],
  selectedPerks: string[],
): number {
  let mult = getDamageMultiplierForAbility(ability, earnedBadges)

  for (const perkId of selectedPerks) {
    if (perkId === 'ember-blood' && ability.type === 'Fire') {
      mult += 0.1
    }
  }

  return mult
}

export function getFirstStrikeBonus(
  selectedPerks: string[],
  alreadyUsed: boolean,
): number {
  if (alreadyUsed) return 0
  if (selectedPerks.includes('first-strike')) return 8
  return 0
}

export function getDamageMultiplierForAbility(
  ability: Ability,
  earnedBadges: string[],
): number {
  const seen = new Set<string>()
  let mult = 1
  for (const badgeId of earnedBadges) {
    if (seen.has(badgeId)) continue
    seen.add(badgeId)
    const badge = getBadge(badgeId)
    if (!badge) continue
    const typeBonus = badge.damageModifiers[ability.type]
    if (typeBonus) mult += typeBonus
    if (badge.damageBonusTypes?.includes(ability.type)) {
      mult += 0.05
    }
    if (badge.allDamageBonusPercent) {
      mult += badge.allDamageBonusPercent / 100
    }
  }
  return mult
}

export function getPostVictoryHealFromBadges(earnedBadges: string[]): number {
  let total = 0
  for (const badgeId of earnedBadges) {
    const badge = getBadge(badgeId)
    if (badge?.postVictoryHeal) total += badge.postVictoryHeal
  }
  return total
}

/** Badge stats are applied dynamically in combat — do not mutate stored creatures. */
export function syncPartyWithBadges(
  starter: RunCreature,
  recruits: PartyCreature[],
  _earnedBadges: string[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  return { starter, recruits }
}

export function getPartyBadgeBonusLines(earnedBadges: string[]): string[] {
  return earnedBadges
    .map((id) => getBadge(id))
    .filter((b): b is NonNullable<typeof b> => b !== undefined)
    .map((b) => `${b.name}: ${b.specialEffectText}`)
}
