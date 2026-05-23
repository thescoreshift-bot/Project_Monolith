import { getAbility, type Ability } from '../data/abilities'
import {
  getMasteryPerk,
  getAbilityTransformationPath,
  pickAbilityMasteryPerkDraft,
  type AbilityMasteryPerk,
  type MasteryPathTag,
} from '../data/abilityMasteryPerks'
import {
  getRank5Transformation,
  getRank10Transformation,
} from '../data/abilityTransformations'
import { isSuperEffective } from '../data/typeChart'
import type { ElementType } from '../data/starters'
import type { CombatStats } from './combat'
import {
  safeCalcDamage,
  sanitizeDamage,
  type AbilityCombatModifiers,
} from './combat'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import {
  getActiveAbilityIds,
  normalizeCreatureAbilities,
  replaceActiveAbility,
} from './creatureAbilities'

export type AbilityMasteryEntry = {
  abilityId: string
  xp: number
  rank: number
  xpToNextRank: number
  selectedPerks: string[]
  /** @deprecated migrated to selectedPerks */
  selectedUpgrades?: string[]
  transformedAbilityId?: string
  rank5TransformationChosen?: boolean
  rank10TransformationChosen?: boolean
}

export type AbilityMasteryMap = Record<string, AbilityMasteryEntry>

export type AbilityMasteryPerkQueueEntry = {
  creatureId: string
  abilityId: string
  rank: number
  draftPerkIds: string[]
}

export type AbilityTransformQueueEntry = {
  creatureId: string
  abilityId: string
  previousAbilityId: string
  rank: 5 | 10
  path: MasteryPathTag
  newAbilityId: string
  newName: string
  description: string
}

/** @deprecated use AbilityMasteryPerkQueueEntry */
export type AbilityUpgradeQueueEntry = AbilityMasteryPerkQueueEntry

export const MASTERY_MAX_RANK = 10
export const MASTERY_XP_ON_USE = 5
export const MASTERY_XP_SUPER_EFFECTIVE_BONUS = 2
export const MASTERY_XP_DEFEATING_BONUS = 5
export const MASTERY_XP_ON_MISS = 2

const XP_TO_NEXT_BY_RANK: Record<number, number> = {
  0: 20,
  1: 35,
  2: 50,
  3: 70,
  4: 95,
  5: 125,
  6: 160,
  7: 200,
  8: 245,
  9: 245,
}

export const RANK_LABELS: Record<number, string> = {
  0: 'Untrained',
  1: 'Novice',
  2: 'Adept',
  3: 'Expert',
  4: 'Veteran',
  5: 'Elite',
  6: 'Champion',
  7: 'Heroic',
  8: 'Legendary',
  9: 'Mythic',
  10: 'MAX',
}

export const MASTERY_PERK_CHOICE_RANKS = [2, 3, 4, 6, 7, 8, 9] as const

export type CombatFighterWithMastery = RunCreature | PartyCreature

export function getAbilityXpToNextRank(rank: number): number {
  if (rank >= MASTERY_MAX_RANK) return 0
  return XP_TO_NEXT_BY_RANK[rank] ?? 245
}

export function getRankLabel(rank: number): string {
  if (rank >= MASTERY_MAX_RANK) return 'MAX'
  return RANK_LABELS[rank] ?? `Rank ${rank}`
}

export function createDefaultMasteryEntry(abilityId: string): AbilityMasteryEntry {
  return {
    abilityId,
    xp: 0,
    rank: 0,
    xpToNextRank: getAbilityXpToNextRank(0),
    selectedPerks: [],
  }
}

export function migrateMasteryEntry(raw: AbilityMasteryEntry): AbilityMasteryEntry {
  const selectedPerks =
    raw.selectedPerks ?? raw.selectedUpgrades ?? []
  return {
    ...createDefaultMasteryEntry(raw.abilityId),
    ...raw,
    selectedPerks,
    xpToNextRank:
      raw.rank >= MASTERY_MAX_RANK
        ? 0
        : raw.xpToNextRank > 0
          ? raw.xpToNextRank
          : getAbilityXpToNextRank(raw.rank),
  }
}

export function getCreatureAbilityIds(
  creature: { abilityId?: string; abilityIds?: string[] },
): string[] {
  return getActiveAbilityIds(creature)
}

export function ensureAbilityMastery<T extends {
  abilityId?: string
  abilityIds?: string[]
  abilityMastery?: AbilityMasteryMap
}>(creature: T): T & { abilityMastery: AbilityMasteryMap } {
  const normalized = normalizeCreatureAbilities(creature)
  const mastery: AbilityMasteryMap = {}
  for (const [key, val] of Object.entries(creature.abilityMastery ?? {})) {
    mastery[key] = migrateMasteryEntry(val as AbilityMasteryEntry)
  }
  for (const abilityId of getCreatureAbilityIds(normalized)) {
    const baseKey = findMasteryKeyForActive(mastery, abilityId) ?? abilityId
    if (!mastery[baseKey]) {
      mastery[baseKey] = createDefaultMasteryEntry(baseKey)
    }
  }
  return { ...normalized, abilityMastery: mastery } as T & {
    abilityMastery: AbilityMasteryMap
  }
}

export function findMasteryKeyForActive(
  mastery: AbilityMasteryMap,
  activeAbilityId: string,
): string | undefined {
  for (const [key, entry] of Object.entries(mastery)) {
    if (key === activeAbilityId || entry.abilityId === activeAbilityId) {
      return key
    }
    if (entry.transformedAbilityId === activeAbilityId) return key
  }
  return undefined
}

export function getMasteryEntry(
  creature: { abilityMastery: AbilityMasteryMap },
  activeOrBaseAbilityId: string,
): AbilityMasteryEntry {
  const key =
    findMasteryKeyForActive(creature.abilityMastery, activeOrBaseAbilityId) ??
    activeOrBaseAbilityId
  const raw = creature.abilityMastery[key]
  return raw ? migrateMasteryEntry(raw) : createDefaultMasteryEntry(key)
}

export function getResolvedAbilityId(entry: AbilityMasteryEntry): string {
  return entry.transformedAbilityId ?? entry.abilityId
}

export function rankRequiresMasteryPerkChoice(rank: number): boolean {
  return (MASTERY_PERK_CHOICE_RANKS as readonly number[]).includes(rank)
}

export function rankRequiresUpgradeChoice(rank: number): boolean {
  return rankRequiresMasteryPerkChoice(rank)
}

export function buildAbilityMasteryPerkQueueEntry(
  creatureId: string,
  abilityId: string,
  rank: number,
  selectedPerkIds: string[],
): AbilityMasteryPerkQueueEntry {
  const draft = pickAbilityMasteryPerkDraft(abilityId, rank, selectedPerkIds, 3)
  return {
    creatureId,
    abilityId,
    rank,
    draftPerkIds: draft.map((p) => p.id),
  }
}

export function buildAbilityUpgradeQueueEntry(
  creatureId: string,
  abilityId: string,
  rank: number,
  selectedPerkIds: string[],
): AbilityMasteryPerkQueueEntry {
  return buildAbilityMasteryPerkQueueEntry(
    creatureId,
    abilityId,
    rank,
    selectedPerkIds,
  )
}

export function buildAbilityTransformQueueEntry(
  creatureId: string,
  baseAbilityId: string,
  entry: AbilityMasteryEntry,
  rank: 5 | 10,
): AbilityTransformQueueEntry | null {
  const path = getAbilityTransformationPath(entry.selectedPerks)
  const currentId = rank === 10 ? getResolvedAbilityId(entry) : baseAbilityId
  const transform =
    rank === 5
      ? getRank5Transformation(baseAbilityId, path)
      : getRank10Transformation(currentId, path)
  if (!transform) return null
  return {
    creatureId,
    abilityId: baseAbilityId,
    previousAbilityId: currentId,
    rank,
    path,
    newAbilityId: transform.newAbilityId,
    newName: transform.newName,
    description: transform.description,
  }
}

export type MasteryXpGainContext = {
  hit: boolean
  superEffective: boolean
  defeatingBlow: boolean
}

export function computeMasteryXpGain(ctx: MasteryXpGainContext): number {
  if (!ctx.hit) return MASTERY_XP_ON_MISS
  let total = MASTERY_XP_ON_USE
  if (ctx.superEffective) total += MASTERY_XP_SUPER_EFFECTIVE_BONUS
  if (ctx.defeatingBlow) total += MASTERY_XP_DEFEATING_BONUS
  return total
}

export type GrantMasteryXpResult = {
  entry: AbilityMasteryEntry
  xpGained: number
  rankUpMessages: string[]
  perkQueueEntries: AbilityMasteryPerkQueueEntry[]
  transformQueueEntries: AbilityTransformQueueEntry[]
}

export function grantMasteryXp(
  entry: AbilityMasteryEntry,
  xpGain: number,
  abilityName: string,
): GrantMasteryXpResult {
  if (entry.rank >= MASTERY_MAX_RANK) {
    return {
      entry,
      xpGained: 0,
      rankUpMessages: [],
      perkQueueEntries: [],
      transformQueueEntries: [],
    }
  }

  let next = migrateMasteryEntry({ ...entry, xp: entry.xp + xpGain })
  const rankUpMessages: string[] = []
  const perkQueueEntries: AbilityMasteryPerkQueueEntry[] = []
  const transformQueueEntries: AbilityTransformQueueEntry[] = []

  while (
    next.xpToNextRank > 0 &&
    next.xp >= next.xpToNextRank &&
    next.rank < MASTERY_MAX_RANK
  ) {
    const overflow = next.xp - next.xpToNextRank
    const newRank = next.rank + 1
    next = {
      ...next,
      rank: newRank,
      xp: overflow,
      xpToNextRank:
        newRank >= MASTERY_MAX_RANK ? 0 : getAbilityXpToNextRank(newRank),
    }
    rankUpMessages.push(`${abilityName} reached Rank ${newRank}!`)

    if (rankRequiresMasteryPerkChoice(newRank)) {
      perkQueueEntries.push({
        creatureId: '',
        abilityId: next.abilityId,
        rank: newRank,
        draftPerkIds: [],
      })
    }

    if (newRank === 5 && !next.rank5TransformationChosen) {
      const t = buildAbilityTransformQueueEntry('', next.abilityId, next, 5)
      if (t) transformQueueEntries.push(t)
    }
    if (newRank === MASTERY_MAX_RANK && !next.rank10TransformationChosen) {
      const t = buildAbilityTransformQueueEntry('', next.abilityId, next, 10)
      if (t) transformQueueEntries.push(t)
    }
  }

  return {
    entry: next,
    xpGained: xpGain,
    rankUpMessages,
    perkQueueEntries,
    transformQueueEntries,
  }
}

export function applyMasteryXpToCreature<T extends CombatFighterWithMastery>(
  creature: T,
  creatureId: string,
  activeAbilityId: string,
  ctx: MasteryXpGainContext,
): {
  creature: T
  xpGained: number
  logLines: string[]
  perkQueueEntries: AbilityMasteryPerkQueueEntry[]
  transformQueueEntries: AbilityTransformQueueEntry[]
} {
  const ability = getAbility(activeAbilityId)
  const ensured = ensureAbilityMastery(creature)
  const masteryKey =
    findMasteryKeyForActive(ensured.abilityMastery, activeAbilityId) ??
    activeAbilityId
  const current = getMasteryEntry(ensured, masteryKey)
  const xpGain = computeMasteryXpGain(ctx)
  const result = grantMasteryXp(current, xpGain, ability.name)

  const mastery = {
    ...ensured.abilityMastery,
    [masteryKey]: result.entry,
  }

  const logLines = [
    `${creature.name}'s ${ability.name} gained +${result.xpGained} mastery XP.`,
    ...result.rankUpMessages,
  ]

  const perkQueueEntries = result.perkQueueEntries.map((e) =>
    buildAbilityMasteryPerkQueueEntry(
      creatureId,
      e.abilityId,
      e.rank,
      result.entry.selectedPerks,
    ),
  )

  const transformQueueEntries = result.transformQueueEntries.map((e) => ({
    ...e,
    creatureId,
  }))

  return {
    creature: { ...ensured, abilityMastery: mastery } as T,
    xpGained: result.xpGained,
    logLines,
    perkQueueEntries,
    transformQueueEntries,
  }
}

export function getSelectedMasteryPerks(
  entry: AbilityMasteryEntry,
): AbilityMasteryPerk[] {
  return entry.selectedPerks
    .map((id) => getMasteryPerk(id))
    .filter((p): p is AbilityMasteryPerk => p !== undefined)
}

export function getCombatModifiersFromMastery(
  entry: AbilityMasteryEntry,
): AbilityCombatModifiers {
  const mods: AbilityCombatModifiers = {
    flatDamage: 0,
    bonusDamagePercent: 0,
    bonusAccuracy: 0,
    bonusCritChance: 0,
    bonusStatusChance: 0,
  }

  for (const perk of getSelectedMasteryPerks(entry)) {
    const e = perk.effects
    if (e.bonusDamagePercent) {
      mods.bonusDamagePercent +=
        e.bonusDamagePercent < 1
          ? e.bonusDamagePercent * 100
          : e.bonusDamagePercent
    }
    if (e.bonusAccuracy) mods.bonusAccuracy += e.bonusAccuracy
    if (e.bonusCritChance) mods.bonusCritChance += e.bonusCritChance
    if (e.bonusStatusChance) mods.bonusStatusChance += e.bonusStatusChance
    if (e.flatDamage) mods.flatDamage += e.flatDamage
    if (e.burnChance) mods.bonusStatusChance += Math.round(e.burnChance * 100)
    if (e.poisonChance) mods.bonusStatusChance += Math.round(e.poisonChance * 100)
    if (e.paralyzeChance) mods.bonusStatusChance += Math.round(e.paralyzeChance * 100)
    if (e.bindChance) mods.bonusStatusChance += Math.round(e.bindChance * 100)
  }

  return mods
}

export function rollCrit(critChancePercent: number): boolean {
  if (critChancePercent <= 0) return false
  return Math.random() * 100 < critChancePercent
}

export function rollHitsWithMastery(
  baseAccuracy: number,
  bonusAccuracy: number,
): boolean {
  const effective = Math.min(100, baseAccuracy + bonusAccuracy)
  return Math.random() * 100 < effective
}

export function calcDamageWithMastery(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
  modifiers: AbilityCombatModifiers,
  typeMultiplier: number,
  badgeMultiplier: number,
  crit: boolean,
): number {
  if (ability.category === 'status' || ability.power <= 0) return 0
  const raw = safeCalcDamage(ability, attacker, defender)
  let damage = raw + modifiers.flatDamage
  const percentMult = 1 + modifiers.bonusDamagePercent / 100
  damage = Math.floor(damage * percentMult * badgeMultiplier * typeMultiplier)
  if (crit) {
    damage = Math.floor(damage * 1.5)
  }
  return sanitizeDamage(damage, 9999)
}

export function estimateAbilityDamage(
  ability: Ability,
  attacker: CombatStats,
  defender: CombatStats,
  modifiers: AbilityCombatModifiers,
  typeMultiplier: number,
  badgeMultiplier: number,
): number {
  return calcDamageWithMastery(
    ability,
    attacker,
    defender,
    modifiers,
    typeMultiplier,
    badgeMultiplier,
    false,
  )
}

export function applyPerkToCreature<T extends CombatFighterWithMastery>(
  creature: T,
  baseAbilityId: string,
  perkId: string,
): T {
  const ensured = ensureAbilityMastery(creature)
  const entry = getMasteryEntry(ensured, baseAbilityId)
  const key = findMasteryKeyForActive(ensured.abilityMastery, baseAbilityId) ?? baseAbilityId
  if (entry.selectedPerks.includes(perkId)) return ensured as T
  return {
    ...ensured,
    abilityMastery: {
      ...ensured.abilityMastery,
      [key]: {
        ...entry,
        selectedPerks: [...entry.selectedPerks, perkId],
      },
    },
  } as T
}

export function applyUpgradeToCreature<T extends CombatFighterWithMastery>(
  creature: T,
  abilityId: string,
  upgradeId: string,
): T {
  return applyPerkToCreature(creature, abilityId, upgradeId)
}

export function applyTransformationToCreature<T extends CombatFighterWithMastery>(
  creature: T,
  baseAbilityId: string,
  newAbilityId: string,
  rank: 5 | 10,
): T {
  const ensured = ensureAbilityMastery(creature)
  const key =
    findMasteryKeyForActive(ensured.abilityMastery, baseAbilityId) ?? baseAbilityId
  const entry = getMasteryEntry(ensured, key)
  const activeIds = getActiveAbilityIds(ensured)
  const oldResolved = getResolvedAbilityId(entry)
  const slotId = activeIds.find(
    (id) => id === baseAbilityId || id === oldResolved,
  ) ?? baseAbilityId

  let updated = replaceActiveAbility(ensured, slotId, newAbilityId)
  const masteryEntry: AbilityMasteryEntry = {
    ...entry,
    transformedAbilityId: newAbilityId,
    ...(rank === 5
      ? { rank5TransformationChosen: true }
      : { rank10TransformationChosen: true }),
  }

  return {
    ...updated,
    abilityMastery: {
      ...updated.abilityMastery,
      [key]: masteryEntry,
    },
  } as T
}

export function getPerkEffectSummary(perk: AbilityMasteryPerk): string {
  return perk.description
}

export function getUpgradeEffectSummary(perk: AbilityMasteryPerk): string {
  return getPerkEffectSummary(perk)
}

export function buildMasteryXpContext(
  abilityType: ElementType,
  defenderType: ElementType,
  hit: boolean,
  enemyHpBefore: number,
  damage: number,
): MasteryXpGainContext {
  return {
    hit,
    superEffective: hit && isSuperEffective(abilityType, defenderType),
    defeatingBlow: hit && damage >= enemyHpBefore && enemyHpBefore > 0,
  }
}

export function getDraftPerksForQueueEntry(
  entry: AbilityMasteryPerkQueueEntry,
): AbilityMasteryPerk[] {
  const perks = entry.draftPerkIds
    .map((id) => getMasteryPerk(id))
    .filter((p): p is AbilityMasteryPerk => p !== undefined)
  if (perks.length > 0) return perks
  return pickAbilityMasteryPerkDraft(
    entry.abilityId,
    entry.rank,
    [],
    3,
  )
}
