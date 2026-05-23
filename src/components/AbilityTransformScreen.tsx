import { getAbility } from '../data/abilities'
import type { AbilityTransformQueueEntry } from '../utils/abilityMastery'

type AbilityTransformScreenProps = {
  creatureName: string
  entry: AbilityTransformQueueEntry
  onConfirm: () => void
}

export function AbilityTransformScreen({
  creatureName,
  entry,
  onConfirm,
}: AbilityTransformScreenProps) {
  const oldAbility = getAbility(entry.previousAbilityId)
  const newAbility = getAbility(entry.newAbilityId)
  const isFinal = entry.rank === 10

  return (
    <main className="ability-transform-screen ability-upgrade-screen--modal">
      <div className="ability-upgrade-screen__dialog" role="dialog" aria-modal="true">
        <header className="screen-header">
          <h1 className="screen-header__title">
            {isFinal ? 'Final Form!' : 'Ability Evolution'}
          </h1>
          <p className="screen-header__subtitle">
            {isFinal
              ? `${creatureName}'s ability has reached its final form!`
              : `${creatureName}'s ${oldAbility.name} is changing!`}
          </p>
        </header>

        <div className="ability-transform-screen__visual">
          <div className="ability-transform-screen__old">
            <span className="panel-label">Before</span>
            <p className="ability-upgrade-screen__ability-name">{oldAbility.name}</p>
            <p className="ability-upgrade-screen__meta">
              Power {oldAbility.power} · {oldAbility.description}
            </p>
          </div>
          <div className="ability-transform-screen__arrow" aria-hidden>
            ✦
          </div>
          <div className="ability-transform-screen__new">
            <span className="panel-label">After</span>
            <p className="ability-upgrade-screen__ability-name">{newAbility.name}</p>
            <p className="ability-upgrade-screen__meta">
              Power {newAbility.power} · {newAbility.category} · {newAbility.type}
            </p>
            <p className="ability-upgrade-screen__desc">{entry.description}</p>
            <p className="ability-transform-screen__path">
              Path: {entry.path}
            </p>
          </div>
        </div>

        <button type="button" className="btn btn--primary" onClick={onConfirm}>
          Continue
        </button>
      </div>
    </main>
  )
}
