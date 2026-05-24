import { useEffect, useState } from 'react'
import type { EvolutionForm } from '../data/evolutions'
import { ENEMY_TEMPLATES } from '../data/enemies'
import type { PerkCategory } from '../data/perks'
import type { ElementType } from '../data/starters'
import { getPortraitForEvolutionForm } from '../data/creaturePortraits'
import { formatEvolutionStatGains } from '../utils/evolutionSystem'
import { CreaturePortrait } from './CreaturePortrait'

export type EvolutionScreenData = {
  oldName: string
  form: EvolutionForm
  dominantCategory: PerkCategory
  dominantReason: string
  threshold: number
  creatureId?: string
}

type EvolutionPhase = 'announce' | 'silhouette' | 'reveal' | 'details'

type EvolutionScreenProps = {
  data: EvolutionScreenData
  onContinue: () => void
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const STARTER_ELEMENT_TYPE: Record<string, ElementType> = {
  fire: 'Fire',
  water: 'Water',
  grass: 'Grass',
  electric: 'Electric',
  ground: 'Ground',
}

function elementTypeForEvolutionForm(form: EvolutionForm): ElementType {
  const recruitTemplate = ENEMY_TEMPLATES[form.fromStarterType]
  if (recruitTemplate?.type) return recruitTemplate.type
  return STARTER_ELEMENT_TYPE[form.fromStarterType] ?? 'Water'
}

export function EvolutionScreen({ data, onContinue }: EvolutionScreenProps) {
  const [phase, setPhase] = useState<EvolutionPhase>('announce')
  const statLines = formatEvolutionStatGains(data.form.statModifiers)
  const portraitUrl = getPortraitForEvolutionForm(data.form)
  const elementType = elementTypeForEvolutionForm(data.form)

  useEffect(() => {
    if (phase !== 'silhouette') return
    const timer = setTimeout(() => setPhase('reveal'), 2200)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <main className={`evolution-screen evolution-screen--${phase}`}>
      <div className="evolution-screen__particles" aria-hidden="true" />

      {phase === 'announce' && (
        <section className="evolution-screen__panel">
          <p className="evolution-screen__announce">
            What? <strong>{data.oldName}</strong> is evolving!
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase('silhouette')}
          >
            Watch
          </button>
        </section>
      )}

      {phase === 'silhouette' && (
        <section className="evolution-screen__panel">
          <div className="evolution-silhouette" aria-hidden="true">
            <div className="evolution-silhouette__shape" />
            <div className="evolution-silhouette__glow" />
          </div>
          <p className="evolution-screen__hint">The form shifts within the glow…</p>
        </section>
      )}

      {phase === 'reveal' && (
        <section className="evolution-screen__panel evolution-screen__panel--reveal">
          <CreaturePortrait
            type={elementType}
            portraitUrl={portraitUrl}
            alt={data.form.name}
            size="lg"
            idle
            className="evolution-screen__portrait"
          />
          <p className="evolution-screen__reveal">
            {data.oldName} evolved into <strong>{data.form.name}</strong>!
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase('details')}
          >
            View details
          </button>
        </section>
      )}

      {phase === 'details' && (
        <section className="evolution-screen__panel evolution-screen__panel--details">
          <CreaturePortrait
            type={elementType}
            portraitUrl={portraitUrl}
            alt={data.form.name}
            size="lg"
            idle
            className="evolution-screen__portrait"
          />
          <header className="evolution-details__header">
            <h1 className="evolution-details__name">{data.form.name}</h1>
            <p className="evolution-details__stage">
              Stage {data.form.stage} · Level {data.threshold} evolution
            </p>
          </header>

          <p className="evolution-details__desc">{data.form.description}</p>
          <p className="evolution-details__theme">
            <span className="panel-label">Visual theme</span>
            {data.form.visualTheme}
          </p>

          <div className="evolution-details__branch">
            <span className="panel-label">Evolution path</span>
            <p>
              <strong>{formatCategory(data.dominantCategory)}</strong> —{' '}
              {data.dominantReason}
            </p>
          </div>

          {statLines.length > 0 && (
            <div className="evolution-details__stats">
              <span className="panel-label">Stat gains (applied once)</span>
              <ul>
                {statLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {data.form.newAbilityId && (
            <p className="evolution-details__ability">
              <span className="panel-label">New ability unlocked</span>
              Replaced active ability with an evolved technique.
            </p>
          )}

          <button type="button" className="btn btn--primary" onClick={onContinue}>
            Continue
          </button>
        </section>
      )}
    </main>
  )
}
