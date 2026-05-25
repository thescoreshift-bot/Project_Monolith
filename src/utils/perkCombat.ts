import type { Ability } from '../data/abilities'
import type { EnemyKind } from '../data/enemies'
import { getPerkCombatTag } from '../data/creaturePerks'
import {
  LEGACY_PERK_COMBAT_OVERLAY,
  mergeCombatEffects,
  PERK_ID_TO_TAG,
  TAG_COMBAT_EFFECTS,
  type PerkCombatEffects,
} from '../data/perkCombatConfig'
import type { ElementType } from '../data/starters'

export type { PerkCombatEffects }

export function aggregatePerkCombatEffects(
  selectedPerks: string[],
): PerkCombatEffects {
  let merged: PerkCombatEffects = {}
  for (const perkId of selectedPerks) {
    const tag =
      PERK_ID_TO_TAG[perkId] ?? getPerkCombatTag(perkId) ?? undefined
    if (tag && TAG_COMBAT_EFFECTS[tag]) {
      merged = mergeCombatEffects(merged, TAG_COMBAT_EFFECTS[tag])
    }
    const legacy = LEGACY_PERK_COMBAT_OVERLAY[perkId]
    if (legacy) {
      merged = mergeCombatEffects(merged, legacy)
    }
  }
  return merged
}

export function getTypeDamageMultFromPerks(
  abilityType: ElementType,
  effects: PerkCombatEffects,
): number {
  const map: Partial<Record<ElementType, keyof PerkCombatEffects>> = {
    Fire: 'fireDamageMult',
    Water: 'waterDamageMult',
    Grass: 'grassDamageMult',
    Electric: 'electricDamageMult',
    Ground: 'groundDamageMult',
  }
  const key = map[abilityType]
  if (!key) return 0
  const v = effects[key]
  return typeof v === 'number' ? v : 0
}

export function getPerkDamageMultiplier(
  ability: Ability,
  attackerType: ElementType,
  effects: PerkCombatEffects,
  context: {
    defenderHpRatio: number
    typeMultiplier: number
    encounterKind: EnemyKind
    isPhysical: boolean
    consecutiveDamageHits: number
    rhythmHitIndex: number
  },
): number {
  let mult = 1 + (effects.damageDealtMult ?? 0)

  if (context.defenderHpRatio > 0.5 && effects.damageVsHighHpMult) {
    mult += effects.damageVsHighHpMult
  }
  if (context.defenderHpRatio < 0.35 && effects.damageVsLowHpMult) {
    mult += effects.damageVsLowHpMult
  }
  if (context.isPhysical && effects.physicalDamageMult) {
    mult += effects.physicalDamageMult
  }
  if (!context.isPhysical && effects.specialDamageMult) {
    mult += effects.specialDamageMult
  }
  if (ability.type === attackerType && effects.sameTypeDamageMult) {
    mult += effects.sameTypeDamageMult
  }
  if (context.typeMultiplier >= 1.5 && effects.superEffectiveDamageMult) {
    mult += effects.superEffectiveDamageMult
  }
  const eliteKinds: EnemyKind[] = ['elite', 'alpha', 'boss', 'trainer']
  if (eliteKinds.includes(context.encounterKind) && effects.damageVsEliteMult) {
    mult += effects.damageVsEliteMult
  }
  mult += getTypeDamageMultFromPerks(ability.type, effects)
  if (context.consecutiveDamageHits >= 1 && effects.damageDealtMult) {
    /* combo_pressure already in damageDealtMult */
  }
  if (
    effects.damageDealtMult &&
    context.rhythmHitIndex > 0 &&
    context.rhythmHitIndex % 3 === 0
  ) {
    mult += 0.06
  }
  return mult
}

export function getPerkCritChanceBonus(selectedPerks: string[]): number {
  return aggregatePerkCombatEffects(selectedPerks).critChanceBonus ?? 0
}

export function getPerkDodgeChance(selectedPerks: string[]): number {
  return aggregatePerkCombatEffects(selectedPerks).dodgeChance ?? 0
}

export function rollPerkDodge(selectedPerks: string[]): boolean {
  const chance = getPerkDodgeChance(selectedPerks)
  if (chance <= 0) return false
  return Math.random() < chance
}

export function applyPerkDamageTakenReduction(
  damage: number,
  selectedPerks: string[],
  context: {
    hpRatio: number
    typeMultiplier: number
    encounterKind: EnemyKind
  },
): number {
  if (damage <= 0) return damage
  const effects = aggregatePerkCombatEffects(selectedPerks)
  let mult = 1
  if (effects.damageTakenReduction) {
    mult -= effects.damageTakenReduction
  }
  if (context.hpRatio > 0.5 && effects.damageTakenHighHpReduction) {
    mult -= effects.damageTakenHighHpReduction
  }
  if (context.typeMultiplier >= 1.5 && effects.superEffectiveTakenReduction) {
    mult -= effects.superEffectiveTakenReduction
  }
  const eliteKinds: EnemyKind[] = ['elite', 'alpha', 'boss']
  if (eliteKinds.includes(context.encounterKind) && effects.bossDamageTakenReduction) {
    mult -= effects.bossDamageTakenReduction
  }
  mult = Math.max(0.5, mult)
  return Math.max(1, Math.floor(damage * mult))
}

export function getPerkIgnoreDef(
  ability: Ability,
  selectedPerks: string[],
): { defFlat: number; defPercent: number } {
  const effects = aggregatePerkCombatEffects(selectedPerks)
  let defFlat = 0
  let defPercent = 0
  if (ability.category === 'physical') {
    defFlat += effects.ignoreDefFlat ?? 0
    defPercent += effects.ignoreDefPercent ?? 0
  } else {
    defPercent += effects.ignoreDefPercent ?? 0
  }
  return { defFlat, defPercent }
}

export function getPerkFirstStrikeBonus(
  selectedPerks: string[],
  alreadyUsed: boolean,
): { flat: number; mult: number } {
  if (alreadyUsed) return { flat: 0, mult: 0 }
  const effects = aggregatePerkCombatEffects(selectedPerks)
  return {
    flat: effects.firstStrikeBonus ?? 0,
    mult: effects.firstStrikeDamageMult ?? 0,
  }
}
