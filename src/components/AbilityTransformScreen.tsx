import { getAbility, getAbilityDisplayName } from '../data/abilities'
import type { MasteryPathTag } from '../data/abilityMasteryPerks'
import type { AbilityTransformQueueEntry } from '../utils/abilityMastery'

const PATH_LABELS: Record<MasteryPathTag, string> = {
  damage: 'Power',
  status: 'Status',
  utility: 'Support',
  hybrid: 'Hybrid',
}

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
  const oldName = getAbilityDisplayName(oldAbility)
  const newName = entry.newName || getAbilityDisplayName(newAbility)
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
              : `${creatureName}'s ${oldName} is changing!`}
          </p>
        </header>

        <div className="ability-transform-screen__visual">
          <div className="ability-transform-screen__old">
            <span className="panel-label">Before</span>
            <p className="ability-upgrade-screen__ability-name">{oldName}</p>
            <p className="ability-upgrade-screen__meta">
              Power {oldAbility.power} · {oldAbility.description}
            </p>
          </div>
          <div className="ability-transform-screen__arrow" aria-hidden>
            ✦
          </div>
          <div className="ability-transform-screen__new">
            <span className="panel-label">After</span>
            <p className="ability-upgrade-screen__ability-name">{newName}</p>
            <p className="ability-upgrade-screen__meta">
              Power {newAbility.power} · {newAbility.category} · {newAbility.type}
            </p>
            <p className="ability-upgrade-screen__desc">{entry.description}</p>
            <p className="ability-transform-screen__path">
              Path: {PATH_LABELS[entry.path] ?? entry.path}
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
