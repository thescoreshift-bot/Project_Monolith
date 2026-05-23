import { getAbility } from '../data/abilities'
import {
  NOT_VERY_EFFECTIVE_MULTIPLIER,
  SUPER_EFFECTIVE_MULTIPLIER,
} from '../data/typeChart'
import {
  estimateAbilityDamage,
  getCombatModifiersFromMastery,
  getMasteryEntry,
  getRankLabel,
  getResolvedAbilityId,
} from '../utils/abilityMastery'
import {
  abilityDealsDamage,
  formatAbilityEffectPreview,
} from '../utils/combatEffects'
import {
  getCombatEffectiveStats,
  getDamageMultiplierForAbility,
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
  const mods = getCombatModifiersFromMastery(entry)
  const partyLevel = partyHighestLevel ?? creature.level
  const effective = getCombatEffectiveStats(creature, earnedBadges, partyLevel)
  const typeMult = previewDefender
    ? getTypeEffectivenessMultiplier(ability.type, previewDefender.type)
    : 1
  const badgeMult = getDamageMultiplierForAbility(ability, earnedBadges)
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

  const detailTitle =
    title ??
    [
      ability.name,
      `${ability.type} / ${ability.category}`,
      `Rank ${entry.rank} (${getRankLabel(entry.rank)})`,
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
      <span className={`ability-card__type ability-card__type--${ability.type.toLowerCase()}`}>
        {ability.type}
      </span>
      <span className="ability-card__name">{ability.name}</span>
      <span className="ability-card__rank" title={`Mastery ${getRankLabel(entry.rank)}`}>
        R{entry.rank}
      </span>
      {showsDamage && estimated !== null && estimated > 0 ? (
        <span className="ability-card__damage">
          ~{estimated}
          {effectivenessLabel && (
            <span className="ability-card__effectiveness">{effectivenessLabel}</span>
          )}
        </span>
      ) : (
        <span className="ability-card__effect">{effectPreview}</span>
      )}
    </span>
  )
}
