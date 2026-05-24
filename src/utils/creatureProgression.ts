import { getPerk } from '../data/perks'
import { creatureHasCombatTag, getPerkCombatTag } from '../data/creaturePerks'
import type { ElementType } from '../data/starters'
import type { PartyCreature } from './party'
import { repairEvolutionProgress } from './evolutionSystem'
import {
  applyEvolutionScore,
  createEmptyEvolutionScores,
  recalculateStats,
  type EvolutionHistoryEntry,
  type EvolutionScores,
} from './progression'

export const STARTER_CREATURE_ID = 'starter'

export type PerkDraftQueueEntry = {
  creatureId: string
  reason: 'levelUp'
}

export type EvolutionQueueEntry = {
  creatureId: string
  threshold: number
}

export type CreaturePerkFields = {
  selectedPerks: string[]
  evolutionScores: EvolutionScores
  evolutionStage: number
  lastEvolutionLevel: number
  evolutionHistory: EvolutionHistoryEntry[]
}

export function elementTypeToEvolutionKey(type: ElementType): string {
  return type.toLowerCase()
}

export function withDefaultCreaturePerks<
  T extends Partial<CreaturePerkFields> & { level?: number },
>(raw: T): CreaturePerkFields {
  const base: CreaturePerkFields = {
    selectedPerks: raw.selectedPerks ?? [],
    evolutionScores: raw.evolutionScores ?? createEmptyEvolutionScores(),
    evolutionStage: raw.evolutionStage ?? 0,
    lastEvolutionLevel: raw.lastEvolutionLevel ?? 1,
    evolutionHistory: raw.evolutionHistory ?? [],
  }
  if (raw.level == null) return base
  return repairEvolutionProgress({ ...base, level: raw.level })
}

export function applyPerkToPartyCreature(
  creature: PartyCreature,
  perkId: string,
): PartyCreature {
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

export function hasCreaturePerk(
  creature: { selectedPerks: string[] },
  perkIdOrTag: string,
): boolean {
  if (creature.selectedPerks.includes(perkIdOrTag)) return true
  const legacyTag = getPerkCombatTag(perkIdOrTag)
  if (legacyTag) {
    return creatureHasCombatTag(creature.selectedPerks, legacyTag)
  }
  return creatureHasCombatTag(creature.selectedPerks, perkIdOrTag)
}

export function migrateLegacyStarterPerksToRecruits(
  recruits: PartyCreature[],
): PartyCreature[] {
  return recruits.map((r) =>
    withDefaultCreaturePerks(r as PartyCreature & Partial<CreaturePerkFields>),
  ) as PartyCreature[]
}

/** @deprecated Use pendingPerkDraftQueue */
export function legacyPerkDraftCountToQueue(
  count: number,
): PerkDraftQueueEntry[] {
  if (count <= 0) return []
  return [{ creatureId: STARTER_CREATURE_ID, reason: 'levelUp' }]
}

/** @deprecated Use pendingEvolutionQueue with creatureId */
export function legacyEvolutionThresholdsToQueue(
  thresholds: number[],
): EvolutionQueueEntry[] {
  return thresholds.map((threshold) => ({
    creatureId: STARTER_CREATURE_ID,
    threshold,
  }))
}
