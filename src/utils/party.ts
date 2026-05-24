import { resolveRecruitTemplateId } from '../data/recruitPortraits'
import type { ElementType, StarterStats } from '../data/starters'
import type { Enemy } from '../data/enemies'
import { withDefaultCreaturePerks, type CreaturePerkFields } from './creatureProgression'
import type { TemporaryBattleBuff } from './battleBuffs'
import type { BattleBuffs } from './badgeBonuses'
import { ensureAbilityMastery, type AbilityMasteryMap } from './abilityMastery'
import { normalizeCreatureAbilities } from './creatureAbilities'
import { normalizeEquippedGearId } from './gearSystem'
import {
  applyLevelUpHealing,
  getXpToNextLevel,
  growStats,
  recalculateStats,
  type RunCreature,
} from './progression'

export type { AbilityMasteryMap } from './abilityMastery'

export type PartyCreature = {
  id: string
  name: string
  type: ElementType
  level: number
  currentXp: number
  xpToNextLevel: number
  maxHp: number
  currentHp: number
  baseStats: StarterStats
  stats: StarterStats
  abilityId: string
  abilityIds?: string[]
  forgottenAbilityIds?: string[]
  source: 'recruited'
  templateId: string
  battleBuffs: BattleBuffs
  temporaryBattleBuffs?: TemporaryBattleBuff[]
  abilityMastery: AbilityMasteryMap
  equippedGearId?: string | null
  equippedGearUpgradeLevel?: number
} & CreaturePerkFields

export type PartyXpResult = {
  creature: PartyCreature
  levelsGained: number
  leveledUp: boolean
}

export function normalizePartyCreature(
  raw: PartyCreature,
  fallbackLevel = 1,
): PartyCreature {
  const level = raw.level ?? fallbackLevel
  const baseStats = raw.baseStats ?? { ...raw.stats, hp: raw.maxHp }
  const perks = withDefaultCreaturePerks(raw)
  const selectedPerks = perks.selectedPerks
  const stats = recalculateStats(baseStats, selectedPerks)
  const maxHp = stats.hp
  const battleBuffs = raw.battleBuffs ?? { atk: 0, spAtk: 0, def: 0, spd: 0 }
  const templateId =
    resolveRecruitTemplateId({
      templateId: raw.templateId,
      id: raw.id,
      name: raw.name,
    }) ?? raw.templateId
  const baseStatsSafe = {
    hp: baseStats.hp ?? maxHp,
    atk: baseStats.atk ?? 1,
    def: baseStats.def ?? 1,
    spAtk: baseStats.spAtk ?? 1,
    spDef: baseStats.spDef ?? 1,
    spd: baseStats.spd ?? 1,
  }
  const statsSafe = {
    hp: stats.hp ?? maxHp,
    atk: stats.atk ?? baseStatsSafe.atk,
    def: stats.def ?? baseStatsSafe.def,
    spAtk: stats.spAtk ?? baseStatsSafe.spAtk,
    spDef: stats.spDef ?? baseStatsSafe.spDef,
    spd: stats.spd ?? baseStatsSafe.spd,
  }
  return ensureAbilityMastery(
    normalizeCreatureAbilities({
    ...raw,
    ...perks,
    templateId,
    level,
    baseStats: baseStatsSafe,
    stats: statsSafe,
    maxHp,
    currentHp: Math.min(maxHp, raw.currentHp ?? maxHp),
    currentXp: raw.currentXp ?? 0,
    xpToNextLevel: raw.xpToNextLevel ?? getXpToNextLevel(level),
    battleBuffs,
    temporaryBattleBuffs: raw.temporaryBattleBuffs ?? [],
    abilityMastery: raw.abilityMastery ?? {},
    equippedGearId: normalizeEquippedGearId(raw.equippedGearId),
    equippedGearUpgradeLevel:
      typeof raw.equippedGearUpgradeLevel === 'number'
        ? Math.max(0, Math.min(5, raw.equippedGearUpgradeLevel))
        : 0,
  }),
  )
}

export function addXpToPartyCreature(
  creature: PartyCreature,
  amount: number,
): PartyXpResult {
  let next = {
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

/** Raise a recruit to the party's highest level (stats + HP) when joining mid-run. */
export function partyCreatureAtLevel(
  creature: PartyCreature,
  targetLevel: number,
): PartyCreature {
  let next = normalizePartyCreature(creature)
  while (next.level < targetLevel) {
    const previousMaxHp = next.maxHp
    const newLevel = next.level + 1
    const newBase = growStats(next.baseStats)
    const newStats = recalculateStats(newBase, next.selectedPerks)
    const maxHp = newStats.hp
    next = {
      ...next,
      level: newLevel,
      xpToNextLevel: getXpToNextLevel(newLevel),
      baseStats: newBase,
      stats: newStats,
      maxHp,
      currentHp: applyLevelUpHealing(next.currentHp, previousMaxHp, maxHp),
    }
  }
  return next
}

export const MAX_RECRUITS = 2
export const MAX_PARTY_SIZE = 3
export const RECRUITMENT_CHANCE = 0.2

/** Convert a defeated enemy into a valid party recruit with full stats and abilities. */
export function convertEnemyToRecruit(enemy: Enemy): PartyCreature {
  const baseStats = {
    hp: enemy.maxHp,
    atk: enemy.stats.atk ?? 1,
    def: enemy.stats.def ?? 1,
    spAtk: enemy.stats.spAtk ?? 1,
    spDef: enemy.stats.spDef ?? 1,
    spd: enemy.stats.spd ?? 1,
  }
  const perks = withDefaultCreaturePerks({})
  const stats = recalculateStats(baseStats, perks.selectedPerks)
  const firstAbility = enemy.abilityIds[0] ?? 'tackle'
  const recruit = normalizePartyCreature(
    normalizeCreatureAbilities({
      id: `recruit-${enemy.id}-${Date.now()}`,
      name: enemy.name,
      type: enemy.type,
      level: enemy.level,
      currentXp: 0,
      xpToNextLevel: getXpToNextLevel(enemy.level),
      maxHp: stats.hp,
      currentHp: stats.hp,
      baseStats,
      stats,
      abilityId: firstAbility,
      abilityIds: [...enemy.abilityIds],
      source: 'recruited',
      templateId: enemy.id,
      battleBuffs: { atk: 0, spAtk: 0, def: 0, spd: 0 },
      temporaryBattleBuffs: [],
      abilityMastery: {},
      ...perks,
    }) as PartyCreature,
    enemy.level,
  )
  return recruit
}

export function createRecruitFromEnemy(enemy: Enemy): PartyCreature {
  return convertEnemyToRecruit(enemy)
}

export function partyCreatureFromTemplate(
  template: {
    id: string
    name: string
    type: ElementType
    level: number
    maxHp: number
    stats: StarterStats
    abilityId: string
  },
): PartyCreature {
  const baseStats = { ...template.stats, hp: template.maxHp }
  const perks = withDefaultCreaturePerks({ level: template.level })
  return normalizePartyCreature(
    {
      id: `recruit-${template.id}-${Date.now()}`,
      name: template.name,
      type: template.type,
      level: template.level,
      currentXp: 0,
      xpToNextLevel: getXpToNextLevel(template.level),
      maxHp: template.maxHp,
      currentHp: template.maxHp,
      baseStats,
      stats: baseStats,
      abilityId: template.abilityId,
      source: 'recruited',
      templateId: template.id,
      battleBuffs: { atk: 0, spAtk: 0, def: 0, spd: 0 },
      temporaryBattleBuffs: [],
      abilityMastery: {},
      ...perks,
    } as PartyCreature,
    template.level,
  )
}

export function healPartyToPercent(
  starter: RunCreature,
  recruits: PartyCreature[],
  percent: number,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const heal = (max: number) => Math.floor(max * percent)
  return {
    starter: {
      ...starter,
      currentHp: Math.max(1, heal(starter.maxHp)),
    },
    recruits: recruits.map((r) => ({
      ...r,
      currentHp: Math.max(1, heal(r.maxHp)),
    })),
  }
}

export function reviveFaintedToOne(
  starter: RunCreature,
  recruits: PartyCreature[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  return {
    starter: {
      ...starter,
      currentHp: starter.currentHp <= 0 ? 1 : starter.currentHp,
    },
    recruits: recruits.map((r) => ({
      ...r,
      currentHp: r.currentHp <= 0 ? 1 : r.currentHp,
    })),
  }
}

export function getLivingRecruits(recruits: PartyCreature[]): PartyCreature[] {
  return recruits.filter((r) => r.currentHp > 0)
}

/** Recruit chosen to fight alongside the starter (null = 1v1 combat). */
export function getActiveCombatHelper(
  recruits: PartyCreature[],
  activeHelperId: string | null,
): PartyCreature | null {
  if (!activeHelperId) return null
  return recruits.find((r) => r.id === activeHelperId) ?? null
}

export function resolveActiveHelperId(
  recruits: PartyCreature[],
  activeHelperId: string | null,
): string | null {
  if (!activeHelperId) return null
  return recruits.some((r) => r.id === activeHelperId) ? activeHelperId : null
}

/** True when every active combat fighter has fainted (uses explicit HP). */
export function isPartyDefeated(
  starterHp: number,
  helperHp: number | null,
): boolean {
  if (helperHp === null) return starterHp <= 0
  return starterHp <= 0 && helperHp <= 0
}

/** True when starter and optional combat helper are both fainted. */
export function isPartyDefeatedInCombat(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): boolean {
  const helper = getActiveCombatHelper(recruits, activeHelperId)
  return isPartyDefeated(
    starter.currentHp,
    helper ? helper.currentHp : null,
  )
}

/** @deprecated Use isPartyDefeatedInCombat */
export function isPartyWiped(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null = null,
): boolean {
  return isPartyDefeatedInCombat(starter, recruits, activeHelperId)
}
