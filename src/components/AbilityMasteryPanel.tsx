import { useState } from 'react'
import { getAbility, getAbilityDisplayName } from '../data/abilities'
import {
  getAbilityDisplayCategory,
  getAbilityRole,
  getMasteryPerk,
} from '../data/abilityMasteryPerks'
import type { AbilityEffect } from '../data/abilityTypes'
import { getTypeEffectivenessMultiplier, formatTypeEffectivenessLabel } from '../data/typeChart'
import {
  estimateAbilityDamage,
  getCombatModifiersFromMastery,
  getMasteryEntry,
  getNextMasteryRewardLabel,
  getRankLabel,
  getResolvedAbilityId,
  MASTERY_MAX_RANK,
} from '../utils/abilityMastery'
import { abilityDealsDamage } from '../utils/combatEffects'
import {
  getCombatEffectiveStats,
  getAttackerDamageMultiplier,
} from '../utils/badgeBonuses'
import { getSupportMasteryModifiers } from '../utils/supportMasteryEffects'
import type { Enemy } from '../data/enemies'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'

type AbilityMasteryPanelProps = {
  creature: RunCreature | PartyCreature
  abilityId: string
  earnedBadges: string[]
  partyHighestLevel?: number
  previewDefender?: Pick<Enemy, 'type' | 'stats'> | null
  compact?: boolean
}

function describeEffect(
  effect: AbilityEffect,
  stageBonus: number,
): string {
  switch (effect.type) {
    case 'statDebuff': {
      const stages = effect.stages + stageBonus
      return `Lowers foe ${effect.stat.toUpperCase()} by ${stages}`
    }
    case 'statBuff': {
      const stages = effect.stages + stageBonus
      const who = effect.target === 'self' ? 'self' : 'ally'
      return `Raises ${who} ${effect.stat.toUpperCase()} by ${stages}`
    }
    case 'applyStatus':
      return `${effect.status} ${effect.chance}% chance`
    case 'heal':
      return `Heals ${Math.round(effect.percent * 100)}% max HP`
    default:
      return ''
  }
}

export function AbilityMasteryPanel({
  creature,
  abilityId,
  earnedBadges,
  partyHighestLevel,
  previewDefender,
  compact = false,
}: AbilityMasteryPanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const entry = getMasteryEntry(
    { abilityMastery: creature.abilityMastery },
    abilityId,
  )
  const resolvedId = getResolvedAbilityId(entry)
  const ability = getAbility(resolvedId)
  const baseAbility = getAbility(entry.abilityId)
  const displayName = getAbilityDisplayName(ability)
  const baseDisplayName = getAbilityDisplayName(baseAbility)
  const displayCategory = getAbilityDisplayCategory(ability)
  const abilityRole = getAbilityRole(ability)
  const mods = getCombatModifiersFromMastery(entry)
  const supportMods = getSupportMasteryModifiers(entry)
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
            defenderMaxHp:
              previewDefender && 'maxHp' in previewDefender
                ? (previewDefender as { maxHp: number }).maxHp
                : undefined,
            attackerLevel: creature.level,
            encounterKind: 'normal',
          },
        )
      : null

  const xpPercent =
    entry.rank < MASTERY_MAX_RANK && entry.xpToNextRank > 0
      ? Math.min(100, Math.round((entry.xp / entry.xpToNextRank) * 100))
      : 100

  const perkDetails = entry.selectedPerks
    .map((id) => getMasteryPerk(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  const effectLines = (ability.effects ?? [])
    .map((e) => {
      if (e.type === 'applyStatus') {
        const chance = Math.min(100, e.chance + supportMods.statusChanceBonus)
        return `${e.status} ${chance}% chance`
      }
      return describeEffect(e, supportMods.statStageBonus)
    })
    .filter(Boolean)

  const accuracyDisplay =
    ability.accuracy + mods.bonusAccuracy + supportMods.bonusAccuracy

  const transformNote =
    entry.rank5TransformationChosen && resolvedId !== entry.abilityId
      ? entry.rank10TransformationChosen
        ? 'Final transformed form'
        : 'Mastery Lv. 5 transformed form'
      : null

  return (
    <div
      className={`ability-mastery-panel${compact ? ' ability-mastery-panel--compact' : ''}`}
    >
      <h4 className="ability-mastery-panel__name">
        {displayName}
        {resolvedId !== abilityId && entry.rank >= 5 ? (
          <span className="ability-mastery-panel__transformed"> (transformed)</span>
        ) : null}
        {entry.rank >= MASTERY_MAX_RANK ? (
          <span className="ability-mastery-panel__max"> MAX</span>
        ) : null}
      </h4>
      <p className="ability-mastery-panel__meta">
        {ability.type} · {displayCategory} · Role {abilityRole} · Target {ability.target}
        {showsDamage ? ` · Power ${ability.power}` : ''} · Accuracy {accuracyDisplay}%
      </p>
      <p className="ability-mastery-panel__desc">{ability.description}</p>
      {effectLines.length > 0 && (
        <p className="ability-mastery-panel__effects">
          Estimated effect: {effectLines.join(' · ')}
        </p>
      )}
      <p className="ability-mastery-panel__rank">
        Mastery Level {entry.rank} ({getRankLabel(entry.rank)})
        {entry.rank < MASTERY_MAX_RANK ? (
          <>
            {' '}
            — {entry.xp} / {entry.xpToNextRank} XP
          </>
        ) : null}
      </p>
      {entry.rank < MASTERY_MAX_RANK && (
        <div className="xp-bar xp-bar--mastery">
          <div className="xp-bar__track">
            <div className="xp-bar__fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      )}
      {perkDetails.length > 0 && (
        <div className="ability-mastery-panel__upgrades">
          <span className="panel-label">Mastery perks</span>
          <ul>
            {perkDetails.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — {p.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      {transformNote && (
        <p className="ability-mastery-panel__transform-note">{transformNote}</p>
      )}
      {entry.rank < MASTERY_MAX_RANK && (
        <p className="ability-mastery-panel__next">
          Next reward: {getNextMasteryRewardLabel(entry.rank)}
        </p>
      )}
      {estimated !== null && estimated > 0 && (
        <p className="ability-mastery-panel__damage">
          Estimated damage: <strong>{estimated}</strong>
          {formatTypeEffectivenessLabel(typeMult) && (
            <> · {formatTypeEffectivenessLabel(typeMult)}</>
          )}
        </p>
      )}
      <button
        type="button"
        className="btn btn--small"
        onClick={() => setDetailsOpen((o) => !o)}
      >
        {detailsOpen ? 'Hide Details' : 'View Details'}
      </button>
      {detailsOpen && (
        <div className="ability-mastery-panel__details">
          <p>
            <strong>Base ability:</strong> {baseDisplayName}
          </p>
          <p>
            <strong>Current form:</strong> {displayName}
            {resolvedId !== entry.abilityId ? ` (evolved from ${baseDisplayName})` : ''}
          </p>
          <p>
            <strong>Mastery Lv. 5 evolution:</strong>{' '}
            {entry.rank5TransformationChosen
              ? 'Complete'
              : entry.rank >= 5
                ? 'Pending choice'
                : 'Unlocks at Mastery Lv. 5'}
          </p>
          <p>
            <strong>Mastery Lv. 10 evolution:</strong>{' '}
            {entry.rank10TransformationChosen
              ? 'Complete — Mastery MAX'
              : entry.rank >= MASTERY_MAX_RANK
                ? 'Pending choice'
                : 'Unlocks at Mastery Lv. 10'}
          </p>
          {perkDetails.length > 0 && (
            <>
              <span className="panel-label">Selected perk bonuses</span>
              <ul>
                {perkDetails.map((p) => (
                  <li key={p.id}>
                    {p.name}: {p.description}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
