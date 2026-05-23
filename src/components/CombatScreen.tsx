import { getAbility } from '../data/abilities'
import type { Enemy } from '../data/enemies'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getActiveAbilityIds } from '../utils/creatureAbilities'
import { formatStatStageLine } from '../utils/combatEffects'
import { AbilityMasteryPanel } from './AbilityMasteryPanel'
import { HpBar } from './HpBar'

export type CombatantTarget = {
  key: string
  label: string
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
  onUseAbility: (combatantKey: string, abilityId: string) => void
}

function FighterPanel({
  fighter,
  side,
  fainted,
}: {
  fighter: RunCreature | PartyCreature | Enemy
  side: 'player' | 'enemy'
  fainted?: boolean
}) {
  return (
    <article
      className={`fighter-panel fighter-panel--${side}${fainted ? ' fighter-panel--fainted' : ''}`}
    >
      <header className="fighter-panel__header">
        <h2 className="fighter-panel__name">{fighter.name}</h2>
        <span
          className={`fighter-panel__type fighter-panel__type--${fighter.type.toLowerCase()}`}
        >
          {fighter.type}
        </span>
        <span className="fighter-panel__level">Lv. {fighter.level}</span>
      </header>
      <HpBar current={fighter.currentHp} max={fighter.maxHp} />
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
  onUseAbility,
}: CombatScreenProps) {
  const active = combatants.find((c) => c.key === activeCombatantKey)
  const enemyStageLines = formatStatStageLine(enemyStatStages)

  return (
    <main className="combat-screen combat-screen--party">
      <header className="screen-header">
        <h1 className="screen-header__title">Combat</h1>
        <p className="screen-header__subtitle">{turnHint}</p>
      </header>

      <div className="combat-arena combat-arena--party">
        <div className="combat-arena__team">
          {combatants.map((c) => (
            <FighterPanel
              key={c.key}
              fighter={c.creature}
              side="player"
              fainted={c.fainted}
            />
          ))}
        </div>
        <span className="combat-arena__vs">VS</span>
        <div>
          <FighterPanel fighter={enemy} side="enemy" />
          {enemyStageLines.length > 0 && (
            <p className="combat-stat-stages">
              Foe: {enemyStageLines.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {active && !active.fainted && (
        <div className="combat-abilities" aria-label={`${active.label} abilities`}>
          <p className="panel-label">{active.label} — choose ability</p>
          <div className="combat-abilities__grid">
            {getActiveAbilityIds(active.creature).map((abilityId) => (
              <button
                key={abilityId}
                type="button"
                className="combat-ability combat-ability--detailed"
                disabled={combatLocked}
                onClick={() => onUseAbility(active.key, abilityId)}
              >
                <AbilityMasteryPanel
                  creature={active.creature}
                  abilityId={abilityId}
                  earnedBadges={earnedBadges}
                  partyHighestLevel={partyHighestLevel}
                  previewDefender={enemy}
                  compact
                />
                <span className="combat-ability__use">
                  Use {getAbility(abilityId)?.name ?? 'Attack'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="battle-log" aria-label="Battle log">
        <h2 className="panel-label">Battle log</h2>
        <div className="battle-log__entries">
          {battleLog.map((line, i) => (
            <p key={`${i}-${line}`} className="battle-log__line">
              {line}
            </p>
          ))}
        </div>
      </section>
    </main>
  )
}
