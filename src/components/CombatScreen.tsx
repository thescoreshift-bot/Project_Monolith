import { useEffect, useMemo, useRef, useState } from 'react'
import type { Enemy } from '../data/enemies'
import { getEnemyCombatDisplay } from '../data/enemies'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getActiveAbilityIds } from '../utils/creatureAbilities'
import {
  getMasteryEntry,
  getMasteryLevelShort,
  getRankLabel,
} from '../utils/abilityMastery'
import { formatStatStageLine, type CombatStatStages } from '../utils/combatEffects'
import {
  classifyBattleLogLine,
  parseBattleLogFeedback,
  type CombatFeedbackEvent,
} from '../utils/combatFeedback'
import { getEquippedGear } from '../utils/gearSystem'
import { getPortraitForCreature } from '../data/creaturePortraits'
import { AbilityCombatCard } from './AbilityCombatCard'
import { CreaturePortrait } from './CreaturePortrait'
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
  combatEnded?: boolean
  fleeDisabled?: boolean
  onUseAbility: (combatantKey: string, abilityId: string) => void
  onFlee?: () => void
}

type PreviewSelection = {
  combatantKey: string
  abilityId: string
} | null

function FighterPanel({
  fighter,
  side,
  roleLabel,
  displayName,
  displayType,
  portraitUrl: portraitOverride,
  fainted,
  active,
  targeted,
  hitFlash,
  healGlow,
  statStages,
  primaryAbilityId,
  feedbackPopups,
}: {
  fighter: RunCreature | PartyCreature | Enemy
  side: 'player' | 'enemy'
  roleLabel: string
  displayName?: string
  displayType?: import('../data/starters').ElementType
  portraitUrl?: string | null
  fainted?: boolean
  active?: boolean
  targeted?: boolean
  hitFlash?: boolean
  healGlow?: boolean
  statStages?: CombatStatStages
  primaryAbilityId?: string
  feedbackPopups?: CombatFeedbackEvent[]
}) {
  const stageLines = statStages ? formatStatStageLine(statStages) : []
  const mastery =
    primaryAbilityId && 'abilityMastery' in fighter
      ? getMasteryEntry(fighter, primaryAbilityId)
      : null
  const gear =
    'equippedGearId' in fighter ? getEquippedGear(fighter) : null
  const portraitUrl =
    portraitOverride !== undefined
      ? portraitOverride
      : getPortraitForCreature(fighter)
  const name = displayName ?? fighter.name
  const type = displayType ?? fighter.type

  return (
    <article
      className={`fighter-panel fighter-panel--${side}${fainted ? ' fighter-panel--fainted' : ''}${active ? ' fighter-panel--active' : ''}${targeted ? ' fighter-panel--targeted' : ''}${hitFlash ? ' fighter-panel--hit' : ''}${healGlow ? ' fighter-panel--heal' : ''}`}
    >
      <CreaturePortrait
        type={type}
        portraitUrl={portraitUrl}
        alt={name}
        size="combat"
        idle={!fainted}
        className="fighter-panel__portrait"
      />
      <div className="fighter-panel__feedback" aria-hidden="true">
        {feedbackPopups?.map((popup) => (
          <span
            key={popup.id}
            className={`combat-feedback combat-feedback--${popup.kind}`}
          >
            {popup.text}
          </span>
        ))}
      </div>
      <header className="fighter-panel__header">
        <div className="fighter-panel__title-row">
          <h2 className="fighter-panel__name">{name}</h2>
          <span className="fighter-panel__role">{roleLabel}</span>
        </div>
        <div className="fighter-panel__meta">
          <span
            className={`fighter-panel__type fighter-panel__type--${type.toLowerCase()}`}
          >
            {type}
          </span>
          <span className="fighter-panel__level">Lv. {fighter.level}</span>
          {mastery && (
            <span className="fighter-panel__mastery" title="Primary ability mastery">
              {getMasteryLevelShort(mastery.rank)} ({getRankLabel(mastery.rank)})
            </span>
          )}
          {gear && (
            <span
              className={`fighter-panel__gear fighter-panel__gear--${gear.rarity}`}
              title={gear.description}
            >
              {gear.name}
            </span>
          )}
        </div>
      </header>
      <HpBar current={fighter.currentHp} max={fighter.maxHp} />
      {stageLines.length > 0 && (
        <div className="fighter-panel__stages" aria-label="Active stat changes">
          {stageLines.map((line) => (
            <span key={line} className="fighter-panel__stage-chip">
              {line}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

function BattleLogPanel({ battleLog }: { battleLog: string[] }) {
  const entriesRef = useRef<HTMLDivElement>(null)
  const displayLines = useMemo(() => [...battleLog].reverse(), [battleLog])

  useEffect(() => {
    const el = entriesRef.current
    if (el) {
      el.scrollTop = 0
    }
  }, [battleLog.length])

  return (
    <section className="battle-log battle-log--combat" aria-label="Battle log">
      <div className="battle-log__header">
        <h2 className="panel-label">Battle log</h2>
        <span className="battle-log__hint">Newest first</span>
      </div>
      <div ref={entriesRef} className="battle-log__entries">
        {displayLines.length === 0 ? (
          <p className="battle-log__line battle-log__line--muted">Waiting for action…</p>
        ) : (
          displayLines.map((line, i) => {
            const tone = classifyBattleLogLine(line)
            return (
              <p
                key={`${battleLog.length - i}-${line}`}
                className={`battle-log__line battle-log__line--${tone}${i === 0 ? ' battle-log__line--latest' : ''}`}
              >
                {line}
              </p>
            )
          })
        )}
      </div>
    </section>
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
  combatEnded = false,
  fleeDisabled = false,
  onUseAbility,
  onFlee,
}: CombatScreenProps) {
  const enemyStages = enemyStatStages as CombatStatStages
  const enemyStageLines = formatStatStageLine(enemyStages)
  const [preview, setPreview] = useState<PreviewSelection>(null)
  const [popups, setPopups] = useState<CombatFeedbackEvent[]>([])
  const [flashEnemy, setFlashEnemy] = useState(false)
  const [flashPlayerKeys, setFlashPlayerKeys] = useState<string[]>([])
  const [healPlayerKeys, setHealPlayerKeys] = useState<string[]>([])
  const processedLogCount = useRef(0)

  const enemyDisplay = useMemo(() => getEnemyCombatDisplay(enemy), [enemy])
  const playerNameMap = useMemo(
    () => new Map(combatants.map((c) => [c.key, c.creature.name])),
    [combatants],
  )

  useEffect(() => {
    if (battleLog.length <= processedLogCount.current) {
      if (battleLog.length === 0) {
        processedLogCount.current = 0
      }
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
      }, 1400)
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

  const previewCombatant = preview
    ? combatants.find((c) => c.key === preview.combatantKey)
    : null

  const enemyPopups = popups.filter((p) => p.side === 'enemy')
  const enemyFainted = enemy.currentHp <= 0
  const actionsDisabled = combatLocked || combatEnded || enemyFainted
  const playerTurnActive =
    !actionsDisabled && activeCombatantKey !== null

  return (
    <main className="combat-screen combat-screen--battle">
      <div className="combat-screen__bg" aria-hidden="true" />
      <div className="combat-screen__overlay" aria-hidden="true" />

      <header className="combat-screen__header">
        <div className="combat-screen__header-row">
          <h1 className="combat-screen__title">Battle</h1>
          {onFlee && (
            <button
              type="button"
              className="btn btn--small btn--ghost combat-screen__flee"
              disabled={fleeDisabled || actionsDisabled}
              onClick={onFlee}
            >
              Flee
            </button>
          )}
        </div>
        <p className="combat-screen__hint">
          {enemyFainted ? 'Victory!' : turnHint}
        </p>
      </header>

      <div className="combat-battlefield">
        <section className="combat-battlefield__enemy" aria-label="Enemy">
          <FighterPanel
            fighter={enemy}
            side="enemy"
            roleLabel={enemyDisplay.trainerLabel}
            displayName={enemyDisplay.creatureName}
            displayType={enemyDisplay.displayType}
            portraitUrl={enemyDisplay.portraitUrl}
            statStages={enemyStages}
            targeted={playerTurnActive}
            hitFlash={flashEnemy}
            feedbackPopups={enemyPopups}
          />
          {enemyStageLines.length > 0 && (
            <div className="combat-enemy-stages" aria-label="Enemy stat changes">
              {enemyStageLines.map((line) => (
                <span
                  key={line}
                  className="fighter-panel__stage-chip fighter-panel__stage-chip--foe"
                >
                  {line}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="combat-battlefield__players" aria-label="Your team">
          {combatants.map((c) => {
            const slotPopups = popups.filter(
              (p) => p.side === 'player' && p.combatantKey === c.key,
            )
            return (
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
                  hitFlash={flashPlayerKeys.includes(c.key)}
                  healGlow={healPlayerKeys.includes(c.key)}
                  statStages={playerStatStages[c.key]}
                  primaryAbilityId={c.abilityIds[0]}
                  feedbackPopups={slotPopups}
                />
                {!c.fainted && (
                  <div
                    className="ability-grid"
                    aria-label={`${c.label} abilities`}
                  >
                    {getActiveAbilityIds(c.creature).map((abilityId) => {
                      const isActiveTurn =
                        !actionsDisabled && c.key === activeCombatantKey
                      const isPreviewed =
                        preview?.combatantKey === c.key &&
                        preview.abilityId === abilityId
                      return (
                        <button
                          key={abilityId}
                          type="button"
                          className={`ability-card ability-card--${c.creature.type.toLowerCase()}${isActiveTurn ? '' : ' ability-card--inactive'}${isPreviewed ? ' ability-card--previewed' : ''}`}
                          disabled={!isActiveTurn}
                          onMouseEnter={() =>
                            setPreview({ combatantKey: c.key, abilityId })
                          }
                          onFocus={() =>
                            setPreview({ combatantKey: c.key, abilityId })
                          }
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
        </section>
      </div>

      {previewCombatant && preview && (
        <section
          className="combat-ability-detail"
          aria-label="Ability details"
        >
          <span className="panel-label">Ability preview</span>
          <AbilityCombatCard
            creature={previewCombatant.creature}
            abilityId={preview.abilityId}
            earnedBadges={earnedBadges}
            partyHighestLevel={partyHighestLevel}
            previewDefender={enemy}
            title=""
          />
        </section>
      )}

      <BattleLogPanel battleLog={battleLog} />
    </main>
  )
}
