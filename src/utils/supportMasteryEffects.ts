import type { AbilityMasteryEntry } from './abilityMastery'
import { getSelectedMasteryPerks } from './abilityMastery'

export type SupportMasteryModifiers = {
  statStageBonus: number
  bonusAccuracy: number
  statusChanceBonus: number
  healBonusPercent: number
}

export function getSupportMasteryModifiers(
  entry: AbilityMasteryEntry,
): SupportMasteryModifiers {
  const mods: SupportMasteryModifiers = {
    statStageBonus: 0,
    bonusAccuracy: 0,
    statusChanceBonus: 0,
    healBonusPercent: 0,
  }

  for (const perk of getSelectedMasteryPerks(entry)) {
    const e = perk.effects
    if (e.statStageBonus) mods.statStageBonus += e.statStageBonus
    if (e.bonusAccuracy) mods.bonusAccuracy += e.bonusAccuracy
    if (e.bonusStatusChance) mods.statusChanceBonus += e.bonusStatusChance
    if (e.statusChanceBonus) mods.statusChanceBonus += e.statusChanceBonus
    if (e.healBonusPercent) mods.healBonusPercent += e.healBonusPercent
  }

  return mods
}
