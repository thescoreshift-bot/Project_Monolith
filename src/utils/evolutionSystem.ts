import type { EvolutionForm } from '../data/evolutions'
import {
  EVOLUTION_THRESHOLDS,
  getEvolutionForStarter,
  stageForThreshold,
} from '../data/evolutions'
import type { PerkCategory } from '../data/perks'
import type { StatModifiers } from '../data/perks'
import type { ElementType } from '../data/starters'
import { elementTypeToEvolutionKey } from './creatureProgression'
import { ensureAbilityMastery } from './abilityMastery'
import { normalizeCreatureAbilities } from './creatureAbilities'
import type { PartyCreature } from './party'
import {
  recalculateStats,
  type EvolutionHistoryEntry,
  type EvolutionScores,
  type RunCreature,
} from './progression'

export type { EvolutionHistoryEntry }

export type DominantCategoryResult = {
  category: PerkCategory
  reason: string
}

const CATEGORY_ORDER: PerkCategory[] = [
  'offense',
  'defense',
  'speed',
  'utility',
  'evolution',
]

function defaultCategoryForType(type: ElementType): PerkCategory {
  switch (type) {
    case 'Fire':
      return 'offense'
    case 'Water':
      return 'utility'
    case 'Grass':
      return 'defense'
    case 'Electric':
      return 'speed'
    case 'Ground':
      return 'defense'
    default:
      return 'offense'
  }
}

export function normalizeRunCreature(
  creature: RunCreature,
  starterTypeId: string,
): RunCreature {
  const history = creature.evolutionHistory ?? []
  const stage =
    creature.evolutionStage ??
    (history.length > 0 ? Math.max(...history.map((h) => h.stage)) : 0)
  const lastEvolutionLevel =
    creature.lastEvolutionLevel ??
    (history.length > 0
      ? Math.max(...history.map((h) => h.level))
      : 1)

  return ensureAbilityMastery(
    normalizeCreatureAbilities({
    ...creature,
    starterTypeId: creature.starterTypeId ?? starterTypeId,
    evolutionStage: stage,
    lastEvolutionLevel,
    evolutionHistory: history,
    abilityMastery: creature.abilityMastery ?? {},
  }),
  )
}

export function getPendingEvolutionThresholds(creature: RunCreature): number[] {
  return EVOLUTION_THRESHOLDS.filter(
    (threshold) =>
      creature.level >= threshold &&
      creature.lastEvolutionLevel < threshold &&
      !creature.evolutionHistory.some((h) => h.level === threshold),
  )
}

export function getCrossedEvolutionThresholds(
  levelBefore: number,
  levelAfter: number,
  creature: RunCreature,
): number[] {
  return EVOLUTION_THRESHOLDS.filter(
    (threshold) =>
      levelAfter >= threshold &&
      levelBefore < threshold &&
      creature.lastEvolutionLevel < threshold &&
      !creature.evolutionHistory.some((h) => h.level === threshold),
  )
}

export function shouldEvolve(creature: RunCreature): boolean {
  return getPendingEvolutionThresholds(creature).length > 0
}

export function getDominantEvolutionCategory(
  scores: EvolutionScores,
  starterType: ElementType,
): DominantCategoryResult {
  const ranked = CATEGORY_ORDER.map((category) => ({
    category,
    value: scores[category],
  })).sort((a, b) => b.value - a.value)

  const top = ranked[0]
  const second = ranked[1]

  if (top.value === 0 && second.value === 0) {
    const fallback = defaultCategoryForType(starterType)
    return {
      category: fallback,
      reason: `No perk evolution scores yet — defaulting to ${fallback} path for your starter type.`,
    }
  }

  if (top.value > second.value) {
    return {
      category: top.category,
      reason: `${formatCategory(top.category)} score is highest (${top.value}).`,
    }
  }

  if (second.value > 0) {
    return {
      category: second.category,
      reason: `Tie at ${top.value} — ${formatCategory(second.category)} is the second-highest path (${second.value}).`,
    }
  }

  const fallback = defaultCategoryForType(starterType)
  return {
    category: fallback,
    reason: `Tie resolved by starter type — defaulting to ${fallback}.`,
  }
}

function formatCategory(category: PerkCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function applyStatModifiersToBase(
  base: RunCreature['baseStats'],
  mods: StatModifiers,
): RunCreature['baseStats'] {
  const next = { ...base }
  if (mods.atk) next.atk += mods.atk
  if (mods.def) next.def += mods.def
  if (mods.spAtk) next.spAtk += mods.spAtk
  if (mods.spDef) next.spDef += mods.spDef
  if (mods.spd) next.spd += mods.spd
  if (mods.maxHp) next.hp += mods.maxHp
  if (mods.hp) next.hp += mods.hp
  return next
}

export function formatEvolutionStatGains(mods: StatModifiers): string[] {
  const lines: string[] = []
  if (mods.maxHp) lines.push(`Max HP +${mods.maxHp}`)
  if (mods.hp) lines.push(`HP +${mods.hp}`)
  if (mods.atk) lines.push(`ATK +${mods.atk}`)
  if (mods.def) lines.push(`DEF +${mods.def}`)
  if (mods.spAtk) lines.push(`SP.ATK +${mods.spAtk}`)
  if (mods.spDef) lines.push(`SP.DEF +${mods.spDef}`)
  if (mods.spd) lines.push(`SPD +${mods.spd}`)
  return lines
}

export type EvolvableCreatureBase = {
  name: string
  type: ElementType
  evolutionTypeKey: string
  level: number
  selectedPerks: string[]
  evolutionScores: EvolutionScores
  evolutionStage: number
  lastEvolutionLevel: number
  evolutionHistory: EvolutionHistoryEntry[]
  baseStats: RunCreature['baseStats']
  stats: RunCreature['stats']
  maxHp: number
  currentHp: number
  abilityId: string
}

export function toEvolvableStarter(creature: RunCreature): EvolvableCreatureBase {
  return {
    name: creature.name,
    type: creature.type,
    evolutionTypeKey: creature.starterTypeId,
    level: creature.level,
    selectedPerks: creature.selectedPerks,
    evolutionScores: creature.evolutionScores,
    evolutionStage: creature.evolutionStage,
    lastEvolutionLevel: creature.lastEvolutionLevel,
    evolutionHistory: creature.evolutionHistory,
    baseStats: creature.baseStats,
    stats: creature.stats,
    maxHp: creature.maxHp,
    currentHp: creature.currentHp,
    abilityId: creature.abilityId,
  }
}

export function toEvolvableRecruit(creature: PartyCreature): EvolvableCreatureBase {
  return {
    name: creature.name,
    type: creature.type,
    evolutionTypeKey: elementTypeToEvolutionKey(creature.type),
    level: creature.level,
    selectedPerks: creature.selectedPerks,
    evolutionScores: creature.evolutionScores,
    evolutionStage: creature.evolutionStage,
    lastEvolutionLevel: creature.lastEvolutionLevel,
    evolutionHistory: creature.evolutionHistory,
    baseStats: creature.baseStats,
    stats: creature.stats,
    maxHp: creature.maxHp,
    currentHp: creature.currentHp,
    abilityId: creature.abilityId,
  }
}

export function getPendingEvolutionThresholdsFor(
  creature: Pick<
    EvolvableCreatureBase,
    'level' | 'lastEvolutionLevel' | 'evolutionHistory'
  >,
): number[] {
  return EVOLUTION_THRESHOLDS.filter(
    (threshold) =>
      creature.level >= threshold &&
      creature.lastEvolutionLevel < threshold &&
      !creature.evolutionHistory.some((h) => h.level === threshold),
  )
}

export function getCrossedEvolutionThresholdsFor(
  levelBefore: number,
  levelAfter: number,
  creature: Pick<
    EvolvableCreatureBase,
    'lastEvolutionLevel' | 'evolutionHistory'
  >,
): number[] {
  return EVOLUTION_THRESHOLDS.filter(
    (threshold) =>
      levelAfter >= threshold &&
      levelBefore < threshold &&
      creature.lastEvolutionLevel < threshold &&
      !creature.evolutionHistory.some((h) => h.level === threshold),
  )
}

export function buildEvolutionPreviewFor(
  creature: EvolvableCreatureBase,
  threshold: number,
): {
  form: EvolutionForm
  dominant: DominantCategoryResult
  oldName: string
} | null {
  const stage = stageForThreshold(threshold)
  const dominant = getDominantEvolutionCategory(
    creature.evolutionScores,
    creature.type,
  )
  const form = getEvolutionForStarter(
    creature.evolutionTypeKey,
    stage,
    dominant.category,
  )
  if (!form) return null
  return { form, dominant, oldName: creature.name }
}

export function applyEvolutionToBase(
  creature: EvolvableCreatureBase,
  threshold: number,
): EvolvableCreatureBase | null {
  const preview = buildEvolutionPreviewFor(creature, threshold)
  if (!preview) return null
  if (creature.evolutionHistory.some((h) => h.level === threshold)) {
    return creature
  }

  const { form, dominant, oldName } = preview
  const newBase = applyStatModifiersToBase(creature.baseStats, form.statModifiers)
  const newStats = recalculateStats(newBase, creature.selectedPerks)
  const maxHp = newStats.hp
  const hpGain = Math.max(0, maxHp - creature.maxHp)

  const entry: EvolutionHistoryEntry = {
    level: threshold,
    stage: form.stage,
    branchCategory: dominant.category,
    previousName: oldName,
    newName: form.name,
    evolutionId: form.id,
    visualTheme: form.visualTheme,
  }

  return {
    ...creature,
    name: form.name,
    abilityId: form.newAbilityId ?? creature.abilityId,
    baseStats: newBase,
    stats: newStats,
    maxHp,
    currentHp: Math.min(maxHp, creature.currentHp + hpGain),
    evolutionStage: form.stage,
    lastEvolutionLevel: threshold,
    evolutionHistory: [...creature.evolutionHistory, entry],
  }
}

export function buildEvolutionPreview(
  creature: RunCreature,
  threshold: number,
): {
  form: EvolutionForm
  dominant: DominantCategoryResult
  oldName: string
} | null {
  return buildEvolutionPreviewFor(toEvolvableStarter(creature), threshold)
}

export function buildEvolutionPreviewForRecruit(
  creature: PartyCreature,
  threshold: number,
) {
  return buildEvolutionPreviewFor(toEvolvableRecruit(creature), threshold)
}

export function evolveStarter(
  creature: RunCreature,
  threshold: number,
): RunCreature {
  const evolved = applyEvolutionToBase(toEvolvableStarter(creature), threshold)
  if (!evolved) return creature
  return ensureAbilityMastery({ ...creature, ...evolved })
}

export function evolvePartyCreature(
  creature: PartyCreature,
  threshold: number,
): PartyCreature {
  const evolved = applyEvolutionToBase(toEvolvableRecruit(creature), threshold)
  if (!evolved) return creature
  return ensureAbilityMastery({ ...creature, ...evolved })
}
