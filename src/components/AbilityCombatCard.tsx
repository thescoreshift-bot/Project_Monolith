import { getAbility } from '../data/abilities'
import {
  NOT_VERY_EFFECTIVE_MULTIPLIER,
  SUPER_EFFECTIVE_MULTIPLIER,
} from '../data/typeChart'
import { getAbilityDisplayCategory } from '../data/abilityMasteryPerks'
import {
  estimateAbilityDamage,
  getCombatModifiersFromMastery,
  getMasteryEntry,
  getMasteryLevelShort,
  getRankLabel,
  getResolvedAbilityId,
  MASTERY_MAX_RANK,
} from '../utils/abilityMastery'
import {
  abilityDealsDamage,
  formatAbilityEffectPreview,
} from '../utils/combatEffects'
import {
  getAttackerDamageMultiplier,
  getCombatEffectiveStats,
} from '../utils/badgeBonuses'
import { getTypeEffectivenessMultiplier } from '../data/typeChart'
import type { Enemy } from '../data/enemies'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'

type AbilityCombatCardProps = {
  creature: RunCreature | PartyCreature
  abilityId: string
  earnedBadges: string[]
  partyHighestLevel?: number
  previewDefender?: Pick<Enemy, 'type' | 'stats' | 'maxHp' | 'level' | 'kind'> | null
  disabled?: boolean
  title?: string
}

export function AbilityCombatCard({
  creature,
  abilityId,
  earnedBadges,
  partyHighestLevel,
  previewDefender,
  disabled,
  title,
}: AbilityCombatCardProps) {
  const entry = getMasteryEntry({ abilityMastery: creature.abilityMastery }, abilityId)
  const resolvedId = getResolvedAbilityId(entry)
  const ability = getAbility(resolvedId)
  const displayCategory = getAbilityDisplayCategory(ability)
  const mods = getCombatModifiersFromMastery(entry)
  const partyLevel = partyHighestLevel ?? creature.level
  const effective = getCombatEffectiveStats(creature, earnedBadges, partyLevel)
  const typeMult = previewDefender
    ? getTypeEffectivenessMultiplier(ability.type, previewDefender.type)
    : 1
  const badgeMult = getAttackerDamageMultiplier(
    ability,
    earnedBadges,
    creature.selectedPerks,
    creature,
  )
  const showsDamage = abilityDealsDamage(ability)
  const effectPreview = formatAbilityEffectPreview(ability)
  const estimated =
    showsDamage && previewDefender
      ? estimateAbilityDamage(
          ability,
          effective,
          previewDefender.stats,
          mods,
          typeMult,
          badgeMult,
          {
            defenderMaxHp: previewDefender.maxHp,
            attackerLevel: creature.level,
            encounterKind: previewDefender.kind ?? 'normal',
          },
        )
      : null

  let effectivenessLabel = ''
  if (previewDefender && showsDamage) {
    if (typeMult >= SUPER_EFFECTIVE_MULTIPLIER) {
      effectivenessLabel = 'Super effective'
    } else if (typeMult <= NOT_VERY_EFFECTIVE_MULTIPLIER) {
      effectivenessLabel = 'Not very effective'
    }
  }

  const rankLabel =
    entry.rank >= MASTERY_MAX_RANK
      ? 'Mastery Lv. 10 — MAX'
      : `${getMasteryLevelShort(entry.rank)} — ${entry.xp}/${entry.xpToNextRank} XP`

  const detailTitle =
    title ??
    [
      ability.name,
      `${ability.type} · ${displayCategory}`,
      rankLabel,
      `Mastery: ${getRankLabel(entry.rank)}`,
      showsDamage ? `Power ${ability.power}` : effectPreview,
      `Accuracy ${ability.accuracy + mods.bonusAccuracy}%`,
      ability.description,
      estimated !== null && estimated > 0
        ? `Est. damage: ${estimated}${effectivenessLabel ? ` — ${effectivenessLabel}` : ''}`
        : `Effect: ${effectPreview}`,
    ]
      .filter(Boolean)
      .join('\n')

  return (
    <span
      className={`ability-card__inner${disabled ? ' ability-card__inner--disabled' : ''}`}
      title={detailTitle}
    >
      <span className="ability-card__header-row">
        <span className="ability-card__name">{ability.name}</span>
        <span className="ability-card__rank" title={`${getRankLabel(entry.rank)}`}>
          {getMasteryLevelShort(entry.rank)}
          {entry.rank >= MASTERY_MAX_RANK ? ' MAX' : ''}
        </span>
      </span>
      <span className="ability-card__meta">
        {ability.type} · {displayCategory}
      </span>
      {entry.rank < MASTERY_MAX_RANK && (
        <span className="ability-card__xp">
          {entry.xp}/{entry.xpToNextRank} XP
        </span>
      )}
      {showsDamage && estimated !== null && estimated > 0 ? (
        <span className="ability-card__damage">
          Est. Dmg: {estimated}
          {typeMult !== 1 && (
            <span className="ability-card__mult"> x{typeMult.toFixed(1)}</span>
          )}
          {effectivenessLabel && (
            <span className="ability-card__effectiveness"> · {effectivenessLabel}</span>
          )}
        </span>
      ) : (
        <span className="ability-card__effect">Effect: {effectPreview}</span>
      )}
    </span>
  )
}
