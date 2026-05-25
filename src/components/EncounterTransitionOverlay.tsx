import { useEffect, useRef, useState } from 'react'
import { CreaturePortrait } from './CreaturePortrait'
import {
  getEncounterPhaseSchedule,
  type EncounterTransitionPhase,
  type EncounterTransitionView,
} from '../utils/encounterTransition'

type EncounterTransitionOverlayProps = {
  view: EncounterTransitionView
  onComplete: () => void
}

function portraitSizeForView(
  view: EncounterTransitionView,
): 'encounter' | 'combat-lg' | 'combat' {
  if (view.intensity === 'boss' || view.displayType === 'council') {
    return 'encounter'
  }
  if (
    view.displayType === 'alpha' ||
    view.displayType === 'eventAlpha' ||
    view.displayType === 'gymLeader'
  ) {
    return 'combat-lg'
  }
  return 'combat-lg'
}

export function EncounterTransitionOverlay({
  view,
  onComplete,
}: EncounterTransitionOverlayProps) {
  const [phase, setPhase] = useState<EncounterTransitionPhase>('start')
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const portraitSize = portraitSizeForView(view)
  const isGymChallenge =
    view.displayType === 'gymTrainer' ||
    view.displayType === 'gymLeader' ||
    view.displayType === 'council'

  const finish = () => {
    if (completedRef.current) return
    completedRef.current = true
    onCompleteRef.current()
  }

  useEffect(() => {
    completedRef.current = false
    setPhase('start')
    const schedule = getEncounterPhaseSchedule(view.displayType)
    const timers = schedule.map(({ phase: nextPhase, atMs }) =>
      window.setTimeout(() => {
        setPhase(nextPhase)
        if (nextPhase === 'enterCombat') {
          window.setTimeout(() => finish(), 60)
        }
      }, atMs),
    )
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [view.displayType, view.enemyName])

  return (
    <div
      className={`encounter-overlay encounter-overlay--${view.intensity} encounter-overlay--${view.displayType} encounter-overlay--phase-${phase}`}
      role="presentation"
      onPointerDown={() => finish()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') finish()
      }}
    >
      <div className="encounter-overlay__vignette" aria-hidden="true" />
      <div className="encounter-overlay__rune-grid" aria-hidden="true" />
      <div className="encounter-overlay__rune-sweep" aria-hidden="true" />
      <div className="encounter-overlay__glitch-blocks" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="encounter-overlay__glitch-cell" />
        ))}
      </div>
      {view.showFlash && (
        <div className="encounter-overlay__flash" aria-hidden="true" />
      )}
      {view.displayType === 'boss' || view.displayType === 'council' ? (
        <div className="encounter-overlay__corruption" aria-hidden="true" />
      ) : null}

      <div className="encounter-overlay__content">
        <p className="encounter-overlay__type-label">{view.typeLabel}</p>
        <h2 className="encounter-overlay__message">{view.message}</h2>

        <div
          className={`encounter-overlay__enemy${view.hidePortraitDetail ? ' encounter-overlay__enemy--silhouette-only' : ''}${view.useTrainerPortrait ? ' encounter-overlay__enemy--trainer' : ''}${isGymChallenge ? ' encounter-overlay__enemy--challenge' : ''}`}
        >
          <div className="encounter-overlay__enemy-frame">
            <CreaturePortrait
              type={view.enemyType}
              portraitUrl={view.portraitUrl}
              alt={view.enemyName}
              size={portraitSize}
              idle={phase === 'reveal' || phase === 'dissolve'}
              className={`encounter-overlay__portrait${view.useTrainerPortrait ? ' creature-portrait--trainer-body' : ''}`}
            />
            <div className="encounter-overlay__enemy-scan" aria-hidden="true" />
          </div>
          <p className="encounter-overlay__enemy-name">{view.enemyName}</p>
          {view.sendsOutCreatureName ? (
            <div className="encounter-overlay__duo-hint">
              <p className="encounter-overlay__sends-out">
                sends out <strong>{view.sendsOutCreatureName}</strong>
              </p>
              {view.displayType === 'council' ? (
                <p className="encounter-overlay__duo-note">2v2 Council battle</p>
              ) : null}
            </div>
          ) : null}
          <p className="encounter-overlay__enemy-type">{view.enemyType}</p>
        </div>

        <p className="encounter-overlay__entering" role="status">
          Entering combat…
        </p>
        <p className="encounter-overlay__hint">Tap or click to skip</p>
      </div>

      <div className="encounter-overlay__dissolve" aria-hidden="true" />
    </div>
  )
}
