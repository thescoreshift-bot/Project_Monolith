import { useState, type ReactNode } from 'react'
import { getPartyBadgeBonusLines } from '../utils/badgeBonuses'
import { getPartyHighestLevel } from '../utils/regionRewards'
import { AbilityMasteryPanel } from './AbilityMasteryPanel'
import { STARTER_CREATURE_ID } from '../utils/creatureProgression'
import { getDominantEvolutionCategory } from '../utils/evolutionSystem'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { HpBar } from './HpBar'

type PartyScreenProps = {
  starter: RunCreature
  recruits: PartyCreature[]
  activeHelperId: string | null
  earnedBadges: string[]
  onSetHelper: (recruitId: string) => void
  onDismissRecruit: (recruitId: string) => void
  onViewPerks: (creatureId: string) => void
  onBack: () => void
}

function StatGrid({ stats }: { stats: RunCreature['stats'] }) {
  return (
    <dl className="party-creature__stats">
      <div>
        <dt>ATK</dt>
        <dd>{stats.atk}</dd>
      </div>
      <div>
        <dt>DEF</dt>
        <dd>{stats.def}</dd>
      </div>
      <div>
        <dt>SP.ATK</dt>
        <dd>{stats.spAtk}</dd>
      </div>
      <div>
        <dt>SP.DEF</dt>
        <dd>{stats.spDef}</dd>
      </div>
      <div>
        <dt>SPD</dt>
        <dd>{stats.spd}</dd>
      </div>
    </dl>
  )
}

function EvoSummary({
  evolutionScores,
  type,
  evolutionStage,
}: {
  evolutionScores: RunCreature['evolutionScores']
  type: RunCreature['type']
  evolutionStage: number
}) {
  const dominant = getDominantEvolutionCategory(evolutionScores, type)
  return (
    <div className="party-screen__evo-summary">
      <span className="panel-label">Evolution scores</span>
      <p>
        Off {evolutionScores.offense} · Def {evolutionScores.defense} · Spd{' '}
        {evolutionScores.speed} · Util {evolutionScores.utility} · Evo{' '}
        {evolutionScores.evolution}
      </p>
      <p className="party-screen__dominant">
        Dominant path:{' '}
        <strong>
          {dominant.category.charAt(0).toUpperCase() + dominant.category.slice(1)}
        </strong>{' '}
        — {dominant.reason}
      </p>
      <p className="party-screen__stage">Evolution stage {evolutionStage} / 3</p>
    </div>
  )
}

function CreatureCard({
  creatureId,
  name,
  type,
  level,
  currentXp,
  xpToNextLevel,
  currentHp,
  maxHp,
  stats,
  creature,
  role,
  isActiveHelper,
  earnedBadges,
  selectedPerksCount,
  evolutionScores,
  evolutionStage,
  onViewPerks,
  partyHighestLevel,
  actions,
}: {
  creatureId: string
  name: string
  type: string
  level: number
  currentXp: number
  xpToNextLevel: number
  currentHp: number
  maxHp: number
  stats: RunCreature['stats']
  creature: RunCreature | PartyCreature
  role: string
  isActiveHelper: boolean
  earnedBadges: string[]
  selectedPerksCount: number
  evolutionScores: RunCreature['evolutionScores']
  evolutionStage: number
  onViewPerks: (id: string) => void
  partyHighestLevel: number
  actions?: ReactNode
}) {
  const [abilitiesOpen, setAbilitiesOpen] = useState(false)
  const xpPercent =
    xpToNextLevel > 0 ? Math.round((currentXp / xpToNextLevel) * 100) : 0
  const badgeLines = getPartyBadgeBonusLines(earnedBadges)
  const dominant = getDominantEvolutionCategory(
    evolutionScores,
    type as RunCreature['type'],
  )

  return (
    <article
      className={`party-creature${isActiveHelper ? ' party-creature--helper' : ''}`}
    >
      <header className="party-creature__header">
        <div>
          <h2 className="party-creature__name">{name}</h2>
          <p className="party-creature__role">{role}</p>
        </div>
        <span
          className={`party-creature__type party-creature__type--${type.toLowerCase()}`}
        >
          {type}
        </span>
      </header>

      {isActiveHelper && (
        <p className="party-creature__helper-tag">Active combat helper</p>
      )}

      <p className="party-creature__level">
        {type} · Lv. {level} · {selectedPerksCount} perk
        {selectedPerksCount === 1 ? '' : 's'}
      </p>
      <HpBar label="HP" current={currentHp} max={maxHp} />
      <div className="xp-bar">
        <span className="xp-bar__label">
          XP {currentXp} / {xpToNextLevel}
        </span>
        <div className="xp-bar__track">
          <div className="xp-bar__fill" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      <StatGrid stats={stats} />

      <p className="party-screen__dominant party-screen__dominant--inline">
        Path:{' '}
        <strong>
          {dominant.category.charAt(0).toUpperCase() + dominant.category.slice(1)}
        </strong>{' '}
        (stage {evolutionStage}/3)
      </p>
      <p className="party-screen__scores-inline">
        Off {evolutionScores.offense} · Def {evolutionScores.defense} · Spd{' '}
        {evolutionScores.speed} · Util {evolutionScores.utility}
      </p>

      <section className="party-creature__ability">
        <button
          type="button"
          className="btn btn--small party-creature__abilities-toggle"
          onClick={() => setAbilitiesOpen((o) => !o)}
          aria-expanded={abilitiesOpen}
        >
          {abilitiesOpen ? 'Hide Abilities' : 'View Abilities'}
        </button>
        {abilitiesOpen && (
          <AbilityMasteryPanel
            creature={creature}
            abilityId={creature.abilityId}
            earnedBadges={earnedBadges}
            partyHighestLevel={partyHighestLevel}
          />
        )}
      </section>

      {badgeLines.length > 0 && (
        <section className="party-creature__badges">
          <h3 className="panel-label">Badge bonuses (party-wide)</h3>
          <ul>
            {badgeLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        className="btn btn--small"
        onClick={() => onViewPerks(creatureId)}
      >
        View Perks
      </button>

      {actions && <div className="party-creature__actions">{actions}</div>}
    </article>
  )
}

export function PartyScreen({
  starter,
  recruits,
  activeHelperId,
  earnedBadges,
  onSetHelper,
  onDismissRecruit,
  onViewPerks,
  onBack,
}: PartyScreenProps) {
  const activeHelper = recruits.find((r) => r.id === activeHelperId) ?? null
  const slotsUsed = 1 + recruits.length
  const maxSlots = 3
  const partyHighestLevel = getPartyHighestLevel(starter, recruits)

  return (
    <main className="party-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Party</h1>
        <p className="screen-header__subtitle">
          Each creature has its own perks and evolution path.
        </p>
      </header>

      <p className="party-screen__summary">
        Party {slotsUsed} / {maxSlots} · Combat:{' '}
        {activeHelper
          ? `2v1 (${starter.name} + ${activeHelper.name})`
          : `1v1 (${starter.name} solo)`}
      </p>

      <section className="party-screen__section" aria-labelledby="starter-heading">
        <h2 id="starter-heading" className="party-screen__section-title">
          Main starter
        </h2>
        <CreatureCard
          creatureId={STARTER_CREATURE_ID}
          name={starter.name}
          type={starter.type}
          level={starter.level}
          currentXp={starter.currentXp}
          xpToNextLevel={starter.xpToNextLevel}
          currentHp={starter.currentHp}
          maxHp={starter.maxHp}
          stats={starter.stats}
          creature={starter}
          role="Always active in combat"
          isActiveHelper={false}
          earnedBadges={earnedBadges}
          selectedPerksCount={starter.selectedPerks.length}
          evolutionScores={starter.evolutionScores}
          evolutionStage={starter.evolutionStage}
          onViewPerks={onViewPerks}
          partyHighestLevel={partyHighestLevel}
        />
        <EvoSummary
          evolutionScores={starter.evolutionScores}
          type={starter.type}
          evolutionStage={starter.evolutionStage}
        />
      </section>

      <section className="party-screen__section" aria-labelledby="recruits-heading">
        <h2 id="recruits-heading" className="party-screen__section-title">
          Recruited creatures ({recruits.length} / 2)
        </h2>

        {recruits.length === 0 ? (
          <p className="party-screen__empty">
            No recruits yet. Win battles for a chance to recruit creatures.
          </p>
        ) : (
          <div className="party-screen__recruits">
            {recruits.map((recruit) => {
              const isHelper = recruit.id === activeHelperId
              return (
                <CreatureCard
                  key={recruit.id}
                  creatureId={recruit.id}
                  name={recruit.name}
                  type={recruit.type}
                  level={recruit.level}
                  currentXp={recruit.currentXp}
                  xpToNextLevel={recruit.xpToNextLevel}
                  currentHp={recruit.currentHp}
                  maxHp={recruit.maxHp}
                  stats={recruit.stats}
                  creature={recruit}
                  role={
                    isHelper ? 'Active combat helper' : 'Bench — 25% battle XP'
                  }
                  isActiveHelper={isHelper}
                  earnedBadges={earnedBadges}
                  selectedPerksCount={recruit.selectedPerks.length}
                  evolutionScores={recruit.evolutionScores}
                  evolutionStage={recruit.evolutionStage}
                  onViewPerks={onViewPerks}
                  partyHighestLevel={partyHighestLevel}
                  actions={
                    <>
                      {!isHelper && (
                        <button
                          type="button"
                          className="btn btn--primary btn--small"
                          onClick={() => onSetHelper(recruit.id)}
                        >
                          Set as Helper
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => onDismissRecruit(recruit.id)}
                      >
                        Dismiss Recruit
                      </button>
                    </>
                  }
                />
              )
            })}
          </div>
        )}
      </section>

      <footer className="party-screen__footer">
        <button type="button" className="btn btn--primary" onClick={onBack}>
          Back to Map
        </button>
      </footer>
    </main>
  )
}
