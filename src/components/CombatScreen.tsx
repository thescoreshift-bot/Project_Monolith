import type { Enemy } from '../data/enemies'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getActiveAbilityIds } from '../utils/creatureAbilities'
import { getMasteryEntry, getRankLabel } from '../utils/abilityMastery'
import { formatStatStageLine, type CombatStatStages } from '../utils/combatEffects'
import { AbilityCombatCard } from './AbilityCombatCard'
import { HpBar } from './HpBar'

export type CombatantTarget = {
  key: string
  label: string
  roleLabel: string
  creature: RunCreature | PartyCreature
  abilityIds: string[]
  fainted: boolean
}

type CombatScreenProps = {
  combatants: CombatantTarget[]
  enemy: Enemy
  battleLog: string[]
  combatLocked: boolean
  turnHint: string
  activeCombatantKey: string | null
  earnedBadges: string[]
  partyHighestLevel: number
  enemyStatStages?: Partial<Record<string, number>>
  playerStatStages?: Record<string, CombatStatStages>
  onUseAbility: (combatantKey: string, abilityId: string) => void
}

function FighterPanel({
  fighter,
  side,
  roleLabel,
  fainted,
  active,
  statStages,
  primaryAbilityId,
}: {
  fighter: RunCreature | PartyCreature | Enemy
  side: 'player' | 'enemy'
  roleLabel: string
  fainted?: boolean
  active?: boolean
  statStages?: CombatStatStages
  primaryAbilityId?: string
}) {
  const stageLines = statStages ? formatStatStageLine(statStages) : []
  const mastery =
    primaryAbilityId && 'abilityMastery' in fighter
      ? getMasteryEntry(fighter, primaryAbilityId)
      : null

  return (
    <article
      className={`fighter-panel fighter-panel--${side}${fainted ? ' fighter-panel--fainted' : ''}${active ? ' fighter-panel--active' : ''}`}
    >
      <header className="fighter-panel__header">
        <div className="fighter-panel__title-row">
          <h2 className="fighter-panel__name">{fighter.name}</h2>
          <span className="fighter-panel__role">{roleLabel}</span>
        </div>
        <div className="fighter-panel__meta">
          <span
            className={`fighter-panel__type fighter-panel__type--${fighter.type.toLowerCase()}`}
          >
            {fighter.type}
          </span>
          <span className="fighter-panel__level">Lv. {fighter.level}</span>
          {mastery && (
            <span className="fighter-panel__mastery" title="Primary ability mastery">
              Mastery R{mastery.rank} ({getRankLabel(mastery.rank)})
            </span>
          )}
        </div>
      </header>
      <HpBar current={fighter.currentHp} max={fighter.maxHp} />
      {stageLines.length > 0 && (
        <p className="fighter-panel__stages">{stageLines.join(' · ')}</p>
      )}
    </article>
  )
}

export function CombatScreen({
  combatants,
  enemy,
  battleLog,
  combatLocked,
  turnHint,
  activeCombatantKey,
  earnedBadges,
  partyHighestLevel,
  enemyStatStages = {},
  playerStatStages = {},
  onUseAbility,
}: CombatScreenProps) {
  const enemyStages = enemyStatStages as CombatStatStages
  const enemyStageLines = formatStatStageLine(enemyStages)

  return (
    <main className="combat-screen combat-screen--party">
      <header className="screen-header">
        <h1 className="screen-header__title">Combat</h1>
        <p className="screen-header__subtitle">{turnHint}</p>
      </header>

      <div className="combat-arena combat-arena--party">
        <div className="combat-arena__team combat-arena__team--players">
          {combatants.map((c) => (
            <div
              key={c.key}
              className={`combat-player-slot${c.key === activeCombatantKey ? ' combat-player-slot--active' : ''}${c.fainted ? ' combat-player-slot--fainted' : ''}`}
            >
              <FighterPanel
                fighter={c.creature}
                side="player"
                roleLabel={c.roleLabel}
                fainted={c.fainted}
                active={c.key === activeCombatantKey}
                statStages={playerStatStages[c.key]}
                primaryAbilityId={c.abilityIds[0]}
              />
              {!c.fainted && (
                <div
                  className="ability-grid"
                  aria-label={`${c.label} abilities`}
                >
                  {getActiveAbilityIds(c.creature).map((abilityId) => {
                    const isActiveTurn =
                      !combatLocked && c.key === activeCombatantKey
                    return (
                      <button
                        key={abilityId}
                        type="button"
                        className={`ability-card ability-card--${c.creature.type.toLowerCase()}${isActiveTurn ? '' : ' ability-card--inactive'}`}
                        disabled={!isActiveTurn}
                        onClick={() => onUseAbility(c.key, abilityId)}
                      >
                        <AbilityCombatCard
                          creature={c.creature}
                          abilityId={abilityId}
                          earnedBadges={earnedBadges}
                          partyHighestLevel={partyHighestLevel}
                          previewDefender={enemy}
                          disabled={!isActiveTurn}
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="combat-arena__vs">VS</span>
        <div className="combat-arena__enemy">
          <FighterPanel
            fighter={enemy}
            side="enemy"
            roleLabel="Enemy"
            statStages={enemyStages}
          />
          {enemyStageLines.length > 0 && (
            <p className="combat-stat-stages combat-stat-stages--foe">
              Foe buffs/debuffs: {enemyStageLines.join(' · ')}
            </p>
          )}
        </div>
      </div>

      <section className="battle-log" aria-label="Battle log">
        <h2 className="panel-label">Battle log</h2>
        <div className="battle-log__entries">
          {battleLog.length === 0 ? (
            <p className="battle-log__line battle-log__line--muted">Waiting for action…</p>
          ) : (
            battleLog.map((line, i) => (
              <p
                key={`${i}-${line}`}
                className={`battle-log__line${
                  line.includes('super effective') ? ' battle-log__line--super' : ''
                }${line.includes('mastery') || line.includes('Rank') ? ' battle-log__line--mastery' : ''}`}
              >
                {line}
              </p>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
