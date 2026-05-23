import { HpBar } from './HpBar'
import type { RunCreature } from '../utils/progression'

type RestScreenProps = {
  creature: RunCreature
  choiceMade: boolean
  onRest: () => void
  onTrain: () => void
  onContinue: () => void
}

export function RestScreen({
  creature,
  choiceMade,
  onRest,
  onTrain,
  onContinue,
}: RestScreenProps) {
  return (
    <main className="rest-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Bio Camp</h1>
        <p className="screen-header__subtitle">
          Rest and recover, or train for experience. Choose one action.
        </p>
      </header>

      <section className="rest-screen__status">
        <HpBar label="HP" current={creature.currentHp} max={creature.maxHp} />
      </section>

      {!choiceMade ? (
        <div className="rest-choices">
          <button type="button" className="btn rest-choice" onClick={onRest}>
            <span className="rest-choice__title">Rest</span>
            <span className="rest-choice__desc">Heal 40% of max HP</span>
          </button>
          <button type="button" className="btn rest-choice" onClick={onTrain}>
            <span className="rest-choice__title">Train</span>
            <span className="rest-choice__desc">Gain 10 XP</span>
          </button>
        </div>
      ) : (
        <p className="rest-screen__done">Camp activity complete.</p>
      )}

      {choiceMade && (
        <button type="button" className="btn btn--primary" onClick={onContinue}>
          Continue
        </button>
      )}
    </main>
  )
}
