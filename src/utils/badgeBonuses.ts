import { getBadge } from '../data/badges'
import type { Ability } from '../data/abilities'
import { creatureHasCombatTag } from '../data/creaturePerks'
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
  applyGearStatModifiers,
  getEquippedGear,
  getEquippedGearUpgradeLevel,
  getGearDamageMultiplier,
  type CreatureWithGear,
} from './gearSystem'
import { recalculateStats, type RunCreature } from './progression'
import {
  aggregatePerkCombatEffects,
  getPerkDamageMultiplier,
  getTypeDamageMultFromPerks,
} from './perkCombat'
import type { EnemyKind } from '../data/enemies'

export type CombatFighter = RunCreature | PartyCreature

export type BattleBuffs = { atk: number; spAtk: number; def: number; spd: number }

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
    def: safeCombatStat(withBadges.stats.def) + buffs.def,
    spDef: safeCombatStat(withBadges.stats.spDef),
    spd: safeCombatStat(withBadges.stats.spd) + buffs.spd,
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
  const baseStats = {
    ...creature.baseStats,
    hp: creature.baseStats.hp ?? creature.maxHp,
    atk: creature.baseStats.atk ?? creature.stats?.atk ?? 1,
    def: creature.baseStats.def ?? creature.stats?.def ?? 1,
    spAtk: creature.baseStats.spAtk ?? creature.stats?.spAtk ?? 1,
    spDef: creature.baseStats.spDef ?? creature.stats?.spDef ?? 1,
    spd: creature.baseStats.spd ?? creature.stats?.spd ?? 1,
  }
  const statsFromPerks = recalculateStats(baseStats, creature.selectedPerks)
  const withPerks = {
    ...creature,
    stats: statsFromPerks,
    maxHp: statsFromPerks.hp,
    currentHp: creature.currentHp,
  }
  const withBadges = getEffectiveStatsWithBadges(withPerks, context.earnedBadges)
  const gearCreature = creature as CreatureWithGear
  const gear = getEquippedGear(gearCreature)
  const gearLevel = getEquippedGearUpgradeLevel(gearCreature)
  const withGear = applyGearStatModifiers(withBadges, gear, gearLevel)
  const stages = context.statStages ?? {}

  return {
    ...withGear,
    atk: applyStatStage(withGear.atk, stages.atk),
    def: applyStatStage(withGear.def, stages.def),
    spAtk: applyStatStage(withGear.spAtk, stages.spAtk),
    spDef: applyStatStage(withGear.spDef, stages.spDef),
    spd: applyStatStage(withGear.spd, stages.spd),
  }
}

export function getDefenderStatsForAttack(
  defender: Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'>,
  ability: Ability,
  attackerPerks: string[],
): Pick<StarterStats, 'atk' | 'def' | 'spAtk' | 'spDef'> {
  const effects = aggregatePerkCombatEffects(attackerPerks)
  let def = defender.def
  let spDef = defender.spDef
  if (ability.category === 'physical') {
    if (effects.ignoreDefFlat) {
      def = Math.max(0, def - effects.ignoreDefFlat)
    }
    if (effects.ignoreDefPercent) {
      def = Math.max(0, Math.floor(def * (1 - effects.ignoreDefPercent)))
    }
  }
  if (effects.ignoreDefPercent) {
    spDef = Math.max(0, Math.floor(spDef * (1 - effects.ignoreDefPercent)))
  }
  if (def !== defender.def || spDef !== defender.spDef) {
    return { ...defender, def, spDef }
  }
  return defender
}

export function getAttackerDamageMultiplier(
  ability: Ability,
  earnedBadges: string[],
  selectedPerks: string[],
  attacker?: CombatFighter | null,
  context?: {
    defenderHpRatio?: number
    typeMultiplier?: number
    encounterKind?: EnemyKind
    consecutiveDamageHits?: number
    rhythmHitIndex?: number
  },
): number {
  let mult = getDamageMultiplierForAbility(ability, earnedBadges)

  const TYPE_DAMAGE_TAGS: Record<string, string> = {
    Fire: 'fire_damage_bonus',
    Water: 'water_damage_bonus',
    Grass: 'grass_damage_bonus',
    Electric: 'electric_damage_bonus',
    Ground: 'ground_damage_bonus',
  }
  const typeTag = TYPE_DAMAGE_TAGS[ability.type]
  if (typeTag && creatureHasCombatTag(selectedPerks, typeTag)) {
    mult += 0.1
  }

  const effects = aggregatePerkCombatEffects(selectedPerks)
  mult += getTypeDamageMultFromPerks(ability.type, effects)

  if (context && attacker) {
    const perkMult = getPerkDamageMultiplier(
      ability,
      attacker.type,
      effects,
      {
        defenderHpRatio: context.defenderHpRatio ?? 1,
        typeMultiplier: context.typeMultiplier ?? 1,
        encounterKind: context.encounterKind ?? 'normal',
        isPhysical: ability.category === 'physical',
        consecutiveDamageHits: context.consecutiveDamageHits ?? 0,
        rhythmHitIndex: context.rhythmHitIndex ?? 0,
      },
    )
    mult *= perkMult
  } else if (effects.damageDealtMult) {
    mult *= 1 + effects.damageDealtMult
  }

  if (attacker) {
    const atkGear = attacker as CreatureWithGear
    const gearMult = getGearDamageMultiplier(
      getEquippedGear(atkGear),
      ability,
      getEquippedGearUpgradeLevel(atkGear),
    )
    mult *= gearMult
  }

  return mult
}

export function getFirstStrikeBonus(
  selectedPerks: string[],
  alreadyUsed: boolean,
): number {
  if (alreadyUsed) return 0
  const effects = aggregatePerkCombatEffects(selectedPerks)
  return effects.firstStrikeBonus ?? 0
}

export function getFirstStrikeDamageMult(
  selectedPerks: string[],
  alreadyUsed: boolean,
): number {
  if (alreadyUsed) return 0
  const effects = aggregatePerkCombatEffects(selectedPerks)
  return effects.firstStrikeDamageMult ?? 0
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
