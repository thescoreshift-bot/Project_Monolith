import type { TemporaryBattleBuff } from './battleBuffs'
import type { EvolutionBranchCategory, Perk, PerkCategory } from '../data/perks'
import { getPerk, PERKS } from '../data/perks'
import { getPerkCombatTag } from '../data/creaturePerks'
import type { Starter, StarterStats } from '../data/starters'
import {
  ensureAbilityMastery,
  type AbilityMasteryMap,
} from './abilityMastery'
import { creatureHasCombatTag } from '../data/creaturePerks'
import { normalizeCreatureAbilities } from './creatureAbilities'
import { aggregatePerkCombatEffects } from './perkCombat'

export type EvolutionScores = {
  offense: number
  defense: number
  speed: number
  utility: number
  evolution: number
}

export type BattleBuffs = {
  atk: number
  spAtk: number
  def: number
  spd: number
}

export type EvolutionHistoryEntry = {
  level: number
  stage: number
  branchCategory: EvolutionBranchCategory
  previousName: string
  newName: string
  evolutionId: string
  visualTheme: string
}

export type RunCreature = {
  name: string
  type: import('../data/starters').ElementType
  starterTypeId: string
  abilityId: string
  abilityIds?: string[]
  forgottenAbilityIds?: string[]
  baseStats: StarterStats
  stats: StarterStats
  maxHp: number
  currentHp: number
  level: number
  currentXp: number
  xpToNextLevel: number
  coins: number
  battleBuffs: BattleBuffs
  temporaryBattleBuffs?: TemporaryBattleBuff[]
  selectedPerks: string[]
  evolutionScores: EvolutionScores
  evolutionStage: number
  lastEvolutionLevel: number
  evolutionHistory: EvolutionHistoryEntry[]
  abilityMastery: AbilityMasteryMap
  /** Id of held gear item, if any. */
  equippedGearId?: string | null
  equippedGearUpgradeLevel?: number
}

export type { AbilityMasteryMap, AbilityMasteryEntry } from './abilityMastery'

export const STARTING_COINS = 30

const BASE_XP_TO_LEVEL = 30
const XP_PER_LEVEL_INCREMENT = 15

const EVOLUTION_SCORE_BY_RARITY: Record<
  import('../data/perks').PerkRarity,
  number
> = {
  common: 1,
  uncommon: 1,
  rare: 2,
  epic: 2,
  legendary: 3,
}

function evolutionPathForCategory(
  category: Perk['category'],
): keyof EvolutionScores {
  switch (category) {
    case 'offense':
      return 'offense'
    case 'defense':
      return 'defense'
    case 'speed':
      return 'speed'
    case 'evolution':
      return 'evolution'
    default:
      return 'utility'
  }
}

export function getXpToNextLevel(level: number): number {
  return BASE_XP_TO_LEVEL + (level - 1) * XP_PER_LEVEL_INCREMENT
}

export function createRunCreature(starter: Starter): RunCreature {
  const baseStats = { ...starter.stats }

  return ensureAbilityMastery(
    normalizeCreatureAbilities({
    name: starter.name,
    type: starter.type,
    starterTypeId: starter.id,
    abilityId: starter.abilityId,
    abilityIds: [starter.abilityId],
    baseStats,
    stats: { ...baseStats },
    maxHp: baseStats.hp,
    currentHp: baseStats.hp,
    level: 1,
    currentXp: 0,
    xpToNextLevel: getXpToNextLevel(1),
    coins: STARTING_COINS,
    battleBuffs: { atk: 0, spAtk: 0, def: 0, spd: 0 },
    temporaryBattleBuffs: [],
    selectedPerks: [],
    evolutionScores: createEmptyEvolutionScores(),
    evolutionStage: 0,
    lastEvolutionLevel: 1,
    evolutionHistory: [],
    abilityMastery: {},
    equippedGearId: null,
    equippedGearUpgradeLevel: 0,
  }),
  )
}

export function getEffectiveStats(creature: RunCreature): StarterStats {
  return {
    ...creature.stats,
    atk: creature.stats.atk + creature.battleBuffs.atk,
    spAtk: creature.stats.spAtk + creature.battleBuffs.spAtk,
  }
}

export function clearBattleBuffs(creature: RunCreature): RunCreature {
  return {
    ...creature,
    battleBuffs: { atk: 0, spAtk: 0, def: 0, spd: 0 },
  }
}

export function addCoins(creature: RunCreature, amount: number): RunCreature {
  return { ...creature, coins: creature.coins + amount }
}

export function createEmptyEvolutionScores(): EvolutionScores {
  return {
    offense: 0,
    defense: 0,
    speed: 0,
    utility: 0,
    evolution: 0,
  }
}

export function recalculateStats(
  baseStats: StarterStats,
  perkIds: string[],
): StarterStats {
  const stats = { ...baseStats }

  for (const perkId of perkIds) {
    const perk = PERKS[perkId]
    if (!perk?.statModifiers) continue

    const { statModifiers } = perk
    if (statModifiers.atk) stats.atk += statModifiers.atk
    if (statModifiers.def) stats.def += statModifiers.def
    if (statModifiers.spAtk) stats.spAtk += statModifiers.spAtk
    if (statModifiers.spDef) stats.spDef += statModifiers.spDef
    if (statModifiers.spd) stats.spd += statModifiers.spd
    if (statModifiers.hp) stats.hp += statModifiers.hp
    if (statModifiers.maxHp) stats.hp += statModifiers.maxHp
  }

  const effects = aggregatePerkCombatEffects(perkIds)
  if (effects.maxHpPercent) {
    stats.hp = Math.round(stats.hp * (1 + effects.maxHpPercent))
  }
  if (effects.defPercent) {
    stats.def = Math.round(stats.def * (1 + effects.defPercent))
  }
  if (effects.spDefPercent) {
    stats.spDef = Math.round(stats.spDef * (1 + effects.spDefPercent))
  }
  if (effects.spdPercent) {
    stats.spd = Math.round(stats.spd * (1 + effects.spdPercent))
  }

  return stats
}

export function getEvolutionScoreGain(perk: Perk): number {
  const tag = getPerkCombatTag(perk.id)
  if (tag === 'primal_mutation' || perk.id === 'primal-mutation') return 5
  if (tag === 'adaptive_core' || perk.id === 'adaptive-core') return 1
  if (tag === 'strange_catalyst' || perk.id === 'strange-catalyst') return 3
  if (perk.category === 'evolution') {
    return EVOLUTION_SCORE_BY_RARITY[perk.rarity] + 1
  }
  return EVOLUTION_SCORE_BY_RARITY[perk.rarity]
}

export function getPerkEvolutionScoreLabel(perk: Perk): string | null {
  if (getPerkCombatTag(perk.id) === 'adaptive_core' || perk.id === 'adaptive-core') {
    return 'Also all evolution paths +1'
  }
  if (perk.secondaryEvolutionPath) {
    const path =
      perk.secondaryEvolutionPath.charAt(0).toUpperCase() +
      perk.secondaryEvolutionPath.slice(1)
    return `Also ${path} path +1`
  }
  if (perk.category === 'evolution') {
    const gain = getEvolutionScoreGain(perk)
    return `Evolution +${gain}`
  }
  return null
}

export function applyEvolutionScore(
  scores: EvolutionScores,
  perk: Perk,
): EvolutionScores {
  const next = { ...scores }
  const gain = getEvolutionScoreGain(perk)

  if (getPerkCombatTag(perk.id) === 'adaptive_core' || perk.id === 'adaptive-core') {
    next.offense += 1
    next.defense += 1
    next.speed += 1
    next.utility += 1
    next.evolution += 1
    return next
  }

  const mainPath = evolutionPathForCategory(perk.category)
  next[mainPath] += gain
  if (perk.secondaryEvolutionPath) {
    next[perk.secondaryEvolutionPath] += 1
  }
  return next
}

export function applyPerk(creature: RunCreature, perkId: string): RunCreature {
  const perk = getPerk(perkId)
  const selectedPerks = [...creature.selectedPerks, perkId]
  const stats = recalculateStats(creature.baseStats, selectedPerks)
  const maxHp = stats.hp
  const hpGain = Math.max(0, maxHp - creature.maxHp)

  return {
    ...creature,
    selectedPerks,
    evolutionScores: applyEvolutionScore(creature.evolutionScores, perk),
    stats,
    maxHp,
    currentHp: Math.min(maxHp, creature.currentHp + hpGain),
  }
}

export type XpResult = {
  creature: RunCreature
  levelsGained: number
  leveledUp: boolean
}

export function growStats(stats: StarterStats): StarterStats {
  return {
    hp: stats.hp + 5,
    atk: stats.atk + 2,
    def: stats.def + 2,
    spAtk: stats.spAtk + 2,
    spDef: stats.spDef + 2,
    spd: stats.spd + 1,
  }
}

/** Grow base stats as if the creature gained levels (used for party catch-up). */
export function scaleBaseStatsToLevel(
  baseStats: StarterStats,
  fromLevel: number,
  toLevel: number,
): StarterStats {
  let stats = { ...baseStats }
  for (let level = fromLevel; level < toLevel; level++) {
    stats = growStats(stats)
  }
  return stats
}

/** Extra HP restored on each level (on top of max HP growth from stats/perks). */
const LEVEL_UP_BONUS_HEAL_RATIO = 0.12
const LEVEL_UP_BONUS_HEAL_MIN = 6

export function getLevelUpBonusHeal(newMaxHp: number): number {
  return Math.max(
    LEVEL_UP_BONUS_HEAL_MIN,
    Math.floor(newMaxHp * LEVEL_UP_BONUS_HEAL_RATIO),
  )
}

export function applyLevelUpHealing(
  currentHp: number,
  previousMaxHp: number,
  newMaxHp: number,
): number {
  const maxHpGain = Math.max(0, newMaxHp - previousMaxHp)
  const bonusHeal = getLevelUpBonusHeal(newMaxHp)
  return Math.min(newMaxHp, currentHp + maxHpGain + bonusHeal)
}

export function addXp(creature: RunCreature, amount: number): XpResult {
  let next: RunCreature = {
    ...creature,
    currentXp: creature.currentXp + amount,
  }
  let levelsGained = 0

  while (next.currentXp >= next.xpToNextLevel) {
    const overflow = next.currentXp - next.xpToNextLevel
    const previousMaxHp = next.maxHp
    const newLevel = next.level + 1
    const newBase = growStats(next.baseStats)
    const newStats = recalculateStats(newBase, next.selectedPerks)
    const maxHp = newStats.hp
    next = {
      ...next,
      level: newLevel,
      currentXp: overflow,
      xpToNextLevel: getXpToNextLevel(newLevel),
      baseStats: newBase,
      stats: newStats,
      maxHp,
      currentHp: applyLevelUpHealing(next.currentHp, previousMaxHp, maxHp),
    }
    levelsGained++
  }

  return {
    creature: next,
    levelsGained,
    leveledUp: levelsGained > 0,
  }
}

export function hasPerk(creature: RunCreature, perkId: string): boolean {
  return creature.selectedPerks.includes(perkId)
}

export function applyPostBattleHealing(creature: RunCreature): RunCreature {
  if (!creatureHasCombatTag(creature.selectedPerks, 'second_wind')) return creature
  return {
    ...creature,
    currentHp: Math.min(creature.maxHp, creature.currentHp + 8),
  }
}

export function applyRestNodeHealing(creature: RunCreature): RunCreature {
  if (!creatureHasCombatTag(creature.selectedPerks, 'field_recovery')) return creature
  return {
    ...creature,
    currentHp: Math.min(creature.maxHp, creature.currentHp + 20),
  }
}

export type HighestEvolution = {
  category: PerkCategory
  value: number
}

export function getHighestEvolutionScore(
  scores: EvolutionScores,
): HighestEvolution {
  const entries = Object.entries(scores) as [PerkCategory, number][]
  const [category, value] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  )
  return { category, value }
}

export type DefeatPenalty = {
  coinsLost: number
  xpLost: number
  hpAfterRecovery: number
}

export function calculateDefeatPenalty(creature: RunCreature): DefeatPenalty {
  return {
    coinsLost: Math.floor(creature.coins * 0.25),
    xpLost: Math.min(10, creature.currentXp),
    hpAfterRecovery: Math.floor(creature.maxHp * 0.5),
  }
}

export function applyDefeatPenalty(creature: RunCreature): {
  creature: RunCreature
  penalty: DefeatPenalty
} {
  const penalty = calculateDefeatPenalty(creature)

  return {
    penalty,
    creature: clearBattleBuffs({
      ...creature,
      coins: creature.coins - penalty.coinsLost,
      currentXp: creature.currentXp - penalty.xpLost,
      currentHp: penalty.hpAfterRecovery,
    }),
  }
}
