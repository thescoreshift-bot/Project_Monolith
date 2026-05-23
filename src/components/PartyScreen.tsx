import { useState, type ReactNode } from 'react'
import { getPerk } from '../data/perks'
import { EVOLUTION_THRESHOLDS } from '../data/evolutions'
import { getPartyBadgeBonusLines } from '../utils/badgeBonuses'
import { getPartyHighestLevel } from '../utils/regionRewards'
import { AbilityMasteryPanel } from './AbilityMasteryPanel'
import { STARTER_CREATURE_ID } from '../utils/creatureProgression'
import { getDominantEvolutionCategory } from '../utils/evolutionSystem'
import { getPerkEvolutionScoreLabel } from '../utils/progression'
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

type CreatureTab = 'overview' | 'stats' | 'perks' | 'abilities' | 'evolution' | 'badges'

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

function formatPerkModifiers(perk: ReturnType<typeof getPerk>): string[] {
  if (!perk.statModifiers) return []
  const lines: string[] = []
  const m = perk.statModifiers
  if (m.atk) lines.push(`ATK ${m.atk > 0 ? '+' : ''}${m.atk}`)
  if (m.def) lines.push(`DEF ${m.def > 0 ? '+' : ''}${m.def}`)
  if (m.spAtk) lines.push(`SP.ATK ${m.spAtk > 0 ? '+' : ''}${m.spAtk}`)
  if (m.spDef) lines.push(`SP.DEF ${m.spDef > 0 ? '+' : ''}${m.spDef}`)
  if (m.spd) lines.push(`SPD ${m.spd > 0 ? '+' : ''}${m.spd}`)
  if (m.hp) lines.push(`HP ${m.hp > 0 ? '+' : ''}${m.hp}`)
  if (m.maxHp) lines.push(`Max HP ${m.maxHp > 0 ? '+' : ''}${m.maxHp}`)
  return lines
}

function nextEvolutionLevel(creature: RunCreature | PartyCreature): number | null {
  for (const threshold of EVOLUTION_THRESHOLDS) {
    if (
      creature.level < threshold &&
      creature.lastEvolutionLevel < threshold &&
      !creature.evolutionHistory.some((h) => h.level === threshold)
    ) {
      return threshold
    }
  }
  return null
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
  const [tab, setTab] = useState<CreatureTab>('overview')
  const xpPercent =
    xpToNextLevel > 0 ? Math.round((currentXp / xpToNextLevel) * 100) : 0
  const badgeLines = getPartyBadgeBonusLines(earnedBadges)
  const dominant = getDominantEvolutionCategory(
    evolutionScores,
    type as RunCreature['type'],
  )
  const nextEvo = nextEvolutionLevel(creature)

  const tabs: { id: CreatureTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Stats' },
    { id: 'perks', label: 'Perks' },
    { id: 'abilities', label: 'Abilities' },
    { id: 'evolution', label: 'Evolution' },
    { id: 'badges', label: 'Badges' },
  ]

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

      <p className="party-creature__level">
        Lv. {level} · Stage {evolutionStage}/3 · {selectedPerksCount} perk
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

      <nav className="party-creature__tabs" aria-label={`${name} details`}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`party-creature__tab${tab === t.id ? ' party-creature__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="party-creature__tab-panel">
        {tab === 'overview' && (
          <>
            <p className="party-screen__dominant party-screen__dominant--inline">
              Path:{' '}
              <strong>
                {dominant.category.charAt(0).toUpperCase() + dominant.category.slice(1)}
              </strong>{' '}
              — {dominant.reason}
            </p>
            {nextEvo !== null && (
              <p className="party-screen__next-evo">
                Next evolution available at Lv. {nextEvo}
              </p>
            )}
          </>
        )}

        {tab === 'stats' && <StatGrid stats={stats} />}

        {tab === 'perks' && (
          <div className="party-creature__perks-tab">
            {creature.selectedPerks.length === 0 ? (
              <p className="party-screen__empty">No perks yet — level up to draft perks.</p>
            ) : (
              <ul className="party-creature__perk-list">
                {creature.selectedPerks.map((perkId) => {
                  const perk = getPerk(perkId)
                  const modLines = formatPerkModifiers(perk)
                  return (
                    <li key={perkId}>
                      <strong>{perk.name}</strong> ({perk.rarity}) — {perk.description}
                      {modLines.length > 0 && (
                        <span className="party-creature__perk-mods">
                          {' '}
                          [{modLines.join(', ')}]
                        </span>
                      )}
                      <span className="party-creature__perk-evo">
                        {' '}
                        · {getPerkEvolutionScoreLabel(perk)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            <button
              type="button"
              className="btn btn--small"
              onClick={() => onViewPerks(creatureId)}
            >
              Full perk list
            </button>
          </div>
        )}

        {tab === 'abilities' && (
          <AbilityMasteryPanel
            creature={creature}
            abilityId={creature.abilityId}
            earnedBadges={earnedBadges}
            partyHighestLevel={partyHighestLevel}
          />
        )}

        {tab === 'evolution' && (
          <div className="party-screen__evo-summary">
            <p>
              Off {evolutionScores.offense} · Def {evolutionScores.defense} · Spd{' '}
              {evolutionScores.speed} · Util {evolutionScores.utility} · Evo{' '}
              {evolutionScores.evolution}
            </p>
            <p className="party-screen__dominant">
              Dominant:{' '}
              <strong>
                {dominant.category.charAt(0).toUpperCase() + dominant.category.slice(1)}
              </strong>{' '}
              — {dominant.reason}
            </p>
            <p className="party-screen__stage">Evolution stage {evolutionStage} / 3</p>
            {nextEvo !== null ? (
              <p>Next evolution at level {nextEvo}</p>
            ) : (
              <p>All evolution milestones reached for current level band.</p>
            )}
          </div>
        )}

        {tab === 'badges' && (
          <div className="party-creature__badges">
            <p className="party-creature__badge-note">
              Badge bonuses apply in combat only — they are not added to these base stats.
            </p>
            {badgeLines.length === 0 ? (
              <p className="party-screen__empty">No badges earned in this run yet.</p>
            ) : (
              <ul>
                {badgeLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
          Each creature has its own perks, mastery, and evolution path.
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
          Main starter · Active
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
                    isHelper
                      ? 'Active combat helper'
                      : 'Bench — 25% battle XP'
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
