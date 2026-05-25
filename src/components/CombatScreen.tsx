import { useEffect, useMemo, useRef, useState } from 'react'
import type { EncounterKind, Enemy } from '../data/enemies'
import { getEnemyCombatDisplay } from '../data/enemies'
import {
  getResistedTypesAgainst,
  getSuperEffectiveTypesAgainst,
} from '../data/typeChart'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getActiveAbilityIds } from '../utils/creatureAbilities'
import {
  getMasteryEntry,
  getRankLabel,
  MASTERY_MAX_RANK,
} from '../utils/abilityMastery'
import { formatStatStageLine, type CombatStatStages } from '../utils/combatEffects'
import {
  classifyBattleLogLine,
  parseBattleLogFeedback,
  type CombatFeedbackEvent,
} from '../utils/combatFeedback'
import { getEquippedGear } from '../utils/gearSystem'
import { buildCombatStatsForCreature } from '../utils/badgeBonuses'
import {
  buildEnemyIntentPreview,
  type EnemyIntentPreview,
} from '../utils/enemyIntentPreview'
import { getPortraitForCreature } from '../data/creaturePortraits'
import { AbilityCombatCard } from './AbilityCombatCard'
import { CreaturePortrait } from './CreaturePortrait'
import { HpBar } from './HpBar'
import { CombatAbilityVfxLayer } from './CombatAbilityVfxLayer'

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
  /** Second foe in Monolith Council 2v2 */
  secondaryEnemy?: Enemy | null
  councilBattleLabel?: string | null
  /** Council 2v2: true only when every foe is down */
  allEnemiesDefeated?: boolean
  /** Index of the living foe the player is targeting (Council 2v2) */
  councilTargetIndex?: number
  battleLog: string[]
  combatLocked: boolean
  turnHint: string
  activeCombatantKey: string | null
  earnedBadges: string[]
  partyHighestLevel: number
  enemyStatStages?: Partial<Record<string, number>>
  playerStatStages?: Record<string, CombatStatStages>
  combatEnded?: boolean
  fleeDisabled?: boolean
  locationLabel?: string
  encounterKind?: EncounterKind
  enemyAbilityVfxId?: string | null
  enemyAbilityVfxKey?: number
  onEnemyAbilityVfxComplete?: () => void
  onUseAbility: (combatantKey: string, abilityId: string) => void
  onFlee?: () => void
}

type PreviewSelection = {
  combatantKey: string
  abilityId: string
} | null

const LOG_COLLAPSED_COUNT = 4

function encounterDifficultyLabel(
  kind: Enemy['kind'],
  isGymBattle: boolean,
): string {
  if (isGymBattle && kind === 'boss') return 'Gym Leader'
  if (kind === 'trainer') return 'Gym Trainer'
  if (kind === 'boss') return 'Boss'
  if (kind === 'elite') return 'Elite'
  if (kind === 'alpha') return 'Alpha'
  return 'Normal'
}

function buildActionBanner(
  enemyFainted: boolean,
  combatEnded: boolean,
  combatLocked: boolean,
  activeCombatantKey: string | null,
  combatants: CombatantTarget[],
  turnHint: string,
): { title: string; subtitle: string } {
  if (enemyFainted || combatEnded) {
    return { title: 'Victory!', subtitle: 'The foe has been defeated' }
  }
  if (combatLocked && !activeCombatantKey) {
    return {
      title: 'Enemy is preparing an attack',
      subtitle: 'Hold — enemy turn in progress',
    }
  }
  const active = combatants.find((c) => c.key === activeCombatantKey)
  if (active && !active.fainted) {
    return {
      title: `${active.creature.name}'s turn`,
      subtitle: 'Choose an ability',
    }
  }
  return { title: 'Battle', subtitle: turnHint }
}

function EnemyIntentBlock({ intent }: { intent: EnemyIntentPreview }) {
  return (
    <div
      className={`enemy-intent${intent.isHint ? ' enemy-intent--hint' : ' enemy-intent--exact'}`}
      aria-label="Enemy intent"
    >
      <p className="enemy-intent__label">Enemy intent</p>
      <p className="enemy-intent__headline">{intent.headline}</p>
      {intent.detail ? (
        <p className="enemy-intent__detail">{intent.detail}</p>
      ) : null}
      {intent.typeLine ? (
        <p className="enemy-intent__type">{intent.typeLine}</p>
      ) : null}
      {intent.uncertaintyNote ? (
        <p className="enemy-intent__note">{intent.uncertaintyNote}</p>
      ) : null}
    </div>
  )
}

function EnemyBattleCard({
  enemy,
  enemyDisplay,
  isGymBattle,
  encounterKind,
  statStages,
  intent,
  targeted,
  hitFlash,
  fainted = false,
}: {
  enemy: Enemy
  enemyDisplay: ReturnType<typeof getEnemyCombatDisplay>
  isGymBattle: boolean
  encounterKind?: EncounterKind
  statStages: CombatStatStages
  intent: EnemyIntentPreview | null
  targeted: boolean
  hitFlash: boolean
  fainted?: boolean
}) {
  const stageLines = formatStatStageLine(statStages)
  const displayType = enemyDisplay.creatureType
  const weakTo = getSuperEffectiveTypesAgainst(displayType)
  const resists = getResistedTypesAgainst(displayType)
  const difficulty = encounterDifficultyLabel(
    enemy.kind,
    isGymBattle || encounterKind === 'gymLeader' || encounterKind === 'gymTrainer',
  )

  return (
    <article
      className={`enemy-battle-card${targeted ? ' enemy-battle-card--targeted' : ''}${hitFlash ? ' enemy-battle-card--hit' : ''}${fainted ? ' enemy-battle-card--fainted' : ''}`}
    >
      <header className="enemy-battle-card__header">
        <span className="enemy-battle-card__tag enemy-battle-card__tag--foe">
          {fainted ? 'Fainted' : 'Enemy'}
        </span>
        <span className="enemy-battle-card__tag enemy-battle-card__tag--tier">
          {difficulty}
        </span>
      </header>
      <div className="enemy-battle-card__portrait-wrap">
        <CreaturePortrait
          type={displayType}
          portraitUrl={enemyDisplay.creaturePortraitUrl}
          alt={enemyDisplay.creatureName}
          size="combat-lg"
          idle={enemy.currentHp > 0}
          className="enemy-battle-card__portrait"
        />
      </div>
      <div className="enemy-battle-card__body">
        <h2 className="enemy-battle-card__name">
          {isGymBattle ? enemyDisplay.trainerName : enemyDisplay.creatureName}
        </h2>
        {isGymBattle && (
          <p className="enemy-battle-card__trainer-line">
            sends out <strong>{enemyDisplay.creatureName}</strong>
          </p>
        )}
        <p className="enemy-battle-card__meta">
          <span
            className={`enemy-battle-card__type enemy-battle-card__type--${displayType.toLowerCase()}`}
          >
            {displayType}
          </span>
          <span className="enemy-battle-card__level">Lv. {enemy.level}</span>
        </p>
        <div className="enemy-battle-card__hp">
          <HpBar current={enemy.currentHp} max={enemy.maxHp} />
        </div>
        <p className="enemy-battle-card__hp-text">
          {enemy.currentHp} / {enemy.maxHp} HP
          {enemy.shieldHp != null && enemy.shieldHp > 0
            ? ` · Shield ${enemy.shieldHp}`
            : ''}
        </p>
        {enemy.combatModifier ? (
          <p
            className="enemy-battle-card__modifier"
            title={enemy.combatModifier.description}
          >
            <span className="enemy-battle-card__modifier-label">Modifier</span>{' '}
            {enemy.combatModifier.name} — {enemy.combatModifier.description}
          </p>
        ) : null}
        {intent ? <EnemyIntentBlock intent={intent} /> : null}
        {(weakTo.length > 0 || resists.length > 0) && (
          <div className="enemy-battle-card__matchup">
            {weakTo.length > 0 && (
              <span className="enemy-battle-card__hint enemy-battle-card__hint--weak">
                Weak to {weakTo.join(', ')}
              </span>
            )}
            {resists.length > 0 && (
              <span className="enemy-battle-card__hint enemy-battle-card__hint--resist">
                Resists {resists.join(', ')}
              </span>
            )}
          </div>
        )}
        {stageLines.length > 0 && (
          <div className="enemy-battle-card__stages">
            {stageLines.map((line) => (
              <span key={line} className="fighter-panel__stage-chip fighter-panel__stage-chip--foe">
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

function PlayerBattleCard({
  combatant,
  active,
  hitFlash,
  healGlow,
  statStages,
}: {
  combatant: CombatantTarget
  active: boolean
  hitFlash: boolean
  healGlow: boolean
  statStages: CombatStatStages
}) {
  const { creature } = combatant
  const stageLines = formatStatStageLine(statStages)
  const mastery = getMasteryEntry(creature, combatant.abilityIds[0] ?? '')
  const gear = getEquippedGear(creature)
  const portraitUrl = getPortraitForCreature(creature)

  return (
    <article
      className={`player-battle-card player-battle-card--${creature.type.toLowerCase()}${active ? ' player-battle-card--active' : ''}${combatant.fainted ? ' player-battle-card--fainted' : ''}${hitFlash ? ' player-battle-card--hit' : ''}${healGlow ? ' player-battle-card--heal' : ''}`}
    >
      <CreaturePortrait
        type={creature.type}
        portraitUrl={portraitUrl}
        alt={creature.name}
        size="combat-party"
        idle={!combatant.fainted}
        className="player-battle-card__portrait"
      />
      <div className="player-battle-card__body">
        <div className="player-battle-card__title-row">
          <h3 className="player-battle-card__name">{creature.name}</h3>
          <span className="player-battle-card__role">{combatant.roleLabel}</span>
        </div>
        <p className="player-battle-card__meta">
          <span
            className={`player-battle-card__type player-battle-card__type--${creature.type.toLowerCase()}`}
          >
            {creature.type}
          </span>
          <span className="player-battle-card__level">Lv. {creature.level}</span>
        </p>
        {mastery && (
          <p className="player-battle-card__mastery">
            {getRankLabel(mastery.rank)}
            {mastery.rank < MASTERY_MAX_RANK && (
              <span className="player-battle-card__mastery-xp">
                {' '}
                ({mastery.xp}/{mastery.xpToNextRank})
              </span>
            )}
          </p>
        )}
        {gear && (
          <span
            className={`player-battle-card__gear player-battle-card__gear--${gear.rarity}`}
            title={gear.description}
          >
            {gear.name}
          </span>
        )}
        <HpBar current={creature.currentHp} max={creature.maxHp} />
        <p className="player-battle-card__hp-text">
          {creature.currentHp} / {creature.maxHp} HP
        </p>
        {stageLines.length > 0 && (
          <div className="player-battle-card__stages">
            {stageLines.map((line) => (
              <span key={line} className="fighter-panel__stage-chip">
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

function AbilityCommandPanel({
  combatants,
  enemy,
  activeCombatantKey,
  actionsDisabled,
  earnedBadges,
  partyHighestLevel,
  preview,
  onPreview,
  onUseAbility,
}: {
  combatants: CombatantTarget[]
  enemy: Enemy
  activeCombatantKey: string | null
  actionsDisabled: boolean
  earnedBadges: string[]
  partyHighestLevel: number
  preview: PreviewSelection | null
  onPreview: (sel: PreviewSelection | null) => void
  onUseAbility: (combatantKey: string, abilityId: string) => void
}) {
  return (
    <section className="combat-command-panel" aria-label="Ability commands">
      <header className="combat-command-panel__header">
        <h2 className="combat-command-panel__title">Choose an ability</h2>
        <span className="combat-command-panel__hint">Select a move for the active fighter</span>
      </header>
      <div className="combat-command-panel__sections">
        {combatants.map((c) => {
          const isActiveTurn = !actionsDisabled && c.key === activeCombatantKey
          const isStarter = c.key === 'starter'
          return (
            <div
              key={c.key}
              className={`combat-command-section combat-command-section--${c.creature.type.toLowerCase()}${isActiveTurn ? ' combat-command-section--active' : ''}${c.fainted ? ' combat-command-section--fainted' : ''}`}
            >
              <div className="combat-command-section__heading">
                <h3 className="combat-command-section__title">
                  {c.creature.name} Abilities
                </h3>
                {isActiveTurn ? (
                  <span className="combat-command-section__active-pill">Active</span>
                ) : (
                  <span className="combat-command-section__role">
                    {isStarter ? 'Starter' : 'Helper'}
                  </span>
                )}
              </div>
              {c.fainted ? (
                <p className="combat-command-section__fainted">Cannot fight</p>
              ) : (
                <div
                  className="combat-command-grid"
                  aria-label={`${c.label} abilities`}
                >
                  {getActiveAbilityIds(c.creature).map((abilityId) => {
                    const isPreviewed =
                      preview?.combatantKey === c.key &&
                      preview.abilityId === abilityId
                    return (
                      <button
                        key={abilityId}
                        type="button"
                        className={`ability-card ability-card--${c.creature.type.toLowerCase()}${isActiveTurn ? '' : ' ability-card--inactive'}${isPreviewed ? ' ability-card--previewed ability-card--selected' : ''}`}
                        disabled={!isActiveTurn}
                        onMouseEnter={() =>
                          onPreview({ combatantKey: c.key, abilityId })
                        }
                        onFocus={() =>
                          onPreview({ combatantKey: c.key, abilityId })
                        }
                        onMouseLeave={() => onPreview(null)}
                        onBlur={() => onPreview(null)}
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
          )
        })}
      </div>
    </section>
  )
}

function BattleLogPanel({
  battleLog,
  expanded,
  onToggleExpand,
}: {
  battleLog: string[]
  expanded: boolean
  onToggleExpand: () => void
}) {
  const entriesRef = useRef<HTMLDivElement>(null)
  const displayLines = useMemo(() => [...battleLog].reverse(), [battleLog])
  const visibleLines = expanded
    ? displayLines
    : displayLines.slice(0, LOG_COLLAPSED_COUNT)

  useEffect(() => {
    const el = entriesRef.current
    if (el) el.scrollTop = 0
  }, [battleLog.length, expanded])

  return (
    <section
      className={`battle-log battle-log--combat${expanded ? ' battle-log--expanded' : ' battle-log--compact'}`}
      aria-label="Battle log"
    >
      <div className="battle-log__header">
        <h2 className="panel-label">Battle log</h2>
        <button
          type="button"
          className="btn btn--small btn--ghost battle-log__expand"
          onClick={onToggleExpand}
        >
          {expanded ? 'Collapse' : 'Expand log'}
        </button>
      </div>
      <div ref={entriesRef} className="battle-log__entries">
        {visibleLines.length === 0 ? (
          <p className="battle-log__line battle-log__line--muted">Waiting for action…</p>
        ) : (
          visibleLines.map((line, i) => {
            const tone = classifyBattleLogLine(line)
            return (
              <p
                key={`${battleLog.length - i}-${line}`}
                className={`battle-log__line battle-log__line--${tone}${i === 0 ? ' battle-log__line--latest' : ''}`}
              >
                <span className="battle-log__bullet" aria-hidden>
                  ◆
                </span>
                {line}
              </p>
            )
          })
        )}
      </div>
      {!expanded && displayLines.length > LOG_COLLAPSED_COUNT && (
        <p className="battle-log__more">
          +{displayLines.length - LOG_COLLAPSED_COUNT} older entries — expand to view
        </p>
      )}
      <span className="battle-log__hint">Newest first</span>
    </section>
  )
}

function CombatFieldPopups({ popups }: { popups: CombatFeedbackEvent[] }) {
  if (popups.length === 0) return null
  return (
    <div className="combat-field-popups" aria-live="polite" aria-atomic="false">
      {popups.map((popup, index) => (
        <span
          key={popup.id}
          className={`combat-field-popup combat-field-popup--${popup.kind}`}
          style={{ ['--popup-i' as string]: index }}
        >
          {popup.text}
        </span>
      ))}
    </div>
  )
}

export function CombatScreen({
  combatants,
  enemy,
  secondaryEnemy = null,
  councilBattleLabel = null,
  allEnemiesDefeated = false,
  councilTargetIndex = 0,
  battleLog,
  combatLocked,
  turnHint,
  activeCombatantKey,
  earnedBadges,
  partyHighestLevel,
  enemyStatStages = {},
  playerStatStages = {},
  combatEnded = false,
  fleeDisabled = false,
  locationLabel,
  encounterKind,
  enemyAbilityVfxId = null,
  enemyAbilityVfxKey = 0,
  onEnemyAbilityVfxComplete,
  onUseAbility,
  onFlee,
}: CombatScreenProps) {
  const enemyStages = enemyStatStages as CombatStatStages
  const [preview, setPreview] = useState<PreviewSelection>(null)
  const [logExpanded, setLogExpanded] = useState(false)
  const [popups, setPopups] = useState<CombatFeedbackEvent[]>([])
  const [flashEnemy, setFlashEnemy] = useState(false)
  const [flashPlayerKeys, setFlashPlayerKeys] = useState<string[]>([])
  const [healPlayerKeys, setHealPlayerKeys] = useState<string[]>([])
  const processedLogCount = useRef(0)

  const enemyDisplay = useMemo(() => getEnemyCombatDisplay(enemy), [enemy])
  const isGymBattle = Boolean(enemyDisplay.trainerName)
  const playerNameMap = useMemo(
    () => new Map(combatants.map((c) => [c.key, c.creature.name])),
    [combatants],
  )

  useEffect(() => {
    if (battleLog.length <= processedLogCount.current) {
      if (battleLog.length === 0) processedLogCount.current = 0
      return
    }

    const newLines = battleLog.slice(processedLogCount.current)
    processedLogCount.current = battleLog.length

    const incoming: CombatFeedbackEvent[] = []
    let enemyFlash = false
    const playerFlash: string[] = []
    const playerHeal: string[] = []

    for (const line of newLines) {
      const parsed = parseBattleLogFeedback(line, {
        enemyName: enemyDisplay.creatureName,
        playerNames: playerNameMap,
      })
      incoming.push(...parsed.events)
      if (parsed.flash.enemy) enemyFlash = true
      playerFlash.push(...parsed.flash.playerKeys)
      for (const event of parsed.events) {
        if (event.kind === 'heal' && event.combatantKey) {
          playerHeal.push(event.combatantKey)
        }
      }
    }

    if (incoming.length > 0) {
      setPopups((prev) => [...prev, ...incoming])
      window.setTimeout(() => {
        setPopups((prev) =>
          prev.filter((p) => !incoming.some((n) => n.id === p.id)),
        )
      }, 1500)
    }

    if (enemyFlash) {
      setFlashEnemy(true)
      window.setTimeout(() => setFlashEnemy(false), 450)
    }
    if (playerFlash.length > 0) {
      setFlashPlayerKeys(playerFlash)
      window.setTimeout(() => setFlashPlayerKeys([]), 450)
    }
    if (playerHeal.length > 0) {
      setHealPlayerKeys(playerHeal)
      window.setTimeout(() => setHealPlayerKeys([]), 700)
    }
  }, [battleLog, enemyDisplay.creatureName, playerNameMap])

  const secondaryDisplay = useMemo(
    () => (secondaryEnemy ? getEnemyCombatDisplay(secondaryEnemy) : null),
    [secondaryEnemy],
  )
  const isCouncil2v2 = Boolean(councilBattleLabel && secondaryEnemy)
  const enemyFainted = isCouncil2v2
    ? Boolean(allEnemiesDefeated)
    : enemy.currentHp <= 0 &&
      (!secondaryEnemy || secondaryEnemy.currentHp <= 0)
  const actionsDisabled = combatLocked || combatEnded || enemyFainted
  const primaryFainted = enemy.currentHp <= 0
  const secondaryFainted = Boolean(secondaryEnemy && secondaryEnemy.currentHp <= 0)
  const playerTurnActive = !actionsDisabled && activeCombatantKey !== null
  const enemyTurnInProgress =
    combatLocked && !activeCombatantKey && !combatEnded && !enemyFainted

  const intentTarget = useMemo(() => {
    const active = combatants.find(
      (c) => c.key === activeCombatantKey && !c.fainted,
    )
    const fallback = combatants.find((c) => !c.fainted)
    const c = active ?? fallback
    if (!c) return null
    return {
      type: c.creature.type,
      stats: buildCombatStatsForCreature(
        c.creature,
        earnedBadges,
        partyHighestLevel,
        (playerStatStages[c.key] ?? {}) as CombatStatStages,
      ),
      maxHp: c.creature.maxHp,
      name: c.creature.name,
    }
  }, [
    combatants,
    activeCombatantKey,
    earnedBadges,
    partyHighestLevel,
    playerStatStages,
  ])

  const enemyIntent = useMemo(
    () =>
      buildEnemyIntentPreview(enemy, intentTarget, enemyStages, {
        enemyTurnInProgress,
      }),
    [
      enemy,
      intentTarget,
      enemyStages,
      enemyTurnInProgress,
    ],
  )

  const banner = buildActionBanner(
    enemyFainted,
    combatEnded,
    combatLocked,
    activeCombatantKey,
    combatants,
    turnHint,
  )

  return (
    <main className="combat-screen combat-screen--battle">
      <div className="combat-screen__bg" aria-hidden="true" />
      <div className="combat-screen__overlay" aria-hidden="true" />

      <header className="combat-screen__topbar">
        <div className="combat-screen__topbar-side">
          <p className="combat-screen__eyebrow">Battle</p>
          {locationLabel ? (
            <p className="combat-screen__location">{locationLabel}</p>
          ) : null}
        </div>

        <div
          className={`combat-action-banner${enemyFainted ? ' combat-action-banner--victory' : ''}${combatLocked && !activeCombatantKey ? ' combat-action-banner--enemy' : ''}`}
          role="status"
        >
          <p className="combat-action-banner__title">{banner.title}</p>
          <p className="combat-action-banner__subtitle">{banner.subtitle}</p>
        </div>

        {onFlee ? (
          <button
            type="button"
            className="btn btn--small btn--ghost combat-screen__flee"
            disabled={fleeDisabled || actionsDisabled}
            onClick={onFlee}
            aria-label="Flee from battle"
          >
            Flee
          </button>
        ) : (
          <span className="combat-screen__topbar-side" aria-hidden />
        )}
      </header>

      <div className="combat-screen__arena-row">
        <div className="combat-screen__enemy-slot combat-screen__enemy-slot--council">
          {councilBattleLabel ? (
            <p className="combat-screen__council-label">{councilBattleLabel}</p>
          ) : null}
          <div className="combat-screen__enemy-duo">
            <CombatAbilityVfxLayer
              vfxId={enemyAbilityVfxId}
              playKey={enemyAbilityVfxKey}
              onComplete={onEnemyAbilityVfxComplete}
            />
            <EnemyBattleCard
              enemy={enemy}
              enemyDisplay={enemyDisplay}
              isGymBattle={isGymBattle}
              encounterKind={encounterKind}
              statStages={enemyStages}
              intent={enemyIntent}
              targeted={
                playerTurnActive &&
                !primaryFainted &&
                (isCouncil2v2 ? councilTargetIndex === 0 : true)
              }
              hitFlash={flashEnemy}
              fainted={primaryFainted}
            />
            {secondaryEnemy && secondaryDisplay ? (
              <EnemyBattleCard
                enemy={secondaryEnemy}
                enemyDisplay={secondaryDisplay}
                isGymBattle
                encounterKind={encounterKind}
                statStages={{}}
                intent={null}
                targeted={
                  playerTurnActive &&
                  !secondaryFainted &&
                  (isCouncil2v2 ? councilTargetIndex === 1 : true)
                }
                hitFlash={flashEnemy}
                fainted={secondaryFainted}
              />
            ) : null}
          </div>
        </div>

        <div className="combat-screen__center-arena" aria-hidden={popups.length === 0}>
          <div className="combat-screen__arena-glyph" aria-hidden="true" />
          <span className="combat-screen__vs">VS</span>
          <CombatFieldPopups popups={popups} />
        </div>

        <div className="combat-screen__team-col" aria-label="Your team">
          {combatants.map((c) => (
            <PlayerBattleCard
              key={c.key}
              combatant={c}
              active={c.key === activeCombatantKey}
              hitFlash={flashPlayerKeys.includes(c.key)}
              healGlow={healPlayerKeys.includes(c.key)}
              statStages={(playerStatStages[c.key] ?? {}) as CombatStatStages}
            />
          ))}
        </div>
      </div>

      <footer className="combat-screen__footer">
        <BattleLogPanel
          battleLog={battleLog}
          expanded={logExpanded}
          onToggleExpand={() => setLogExpanded((v) => !v)}
        />
        <AbilityCommandPanel
          combatants={combatants}
          enemy={enemy}
          activeCombatantKey={activeCombatantKey}
          actionsDisabled={actionsDisabled}
          earnedBadges={earnedBadges}
          partyHighestLevel={partyHighestLevel}
          preview={preview}
          onPreview={setPreview}
          onUseAbility={onUseAbility}
        />
      </footer>
    </main>
  )
}
