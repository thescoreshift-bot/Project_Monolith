import type { CouncilTrial } from '../data/monolithCouncil'
import { COUNCIL_FULL_HEAL_COST } from '../utils/councilGauntlet'
import { aiStyleLabel } from '../utils/councilAi'
import type { RunCreature } from '../utils/progression'

export function CouncilIntermissionScreen({
  trial,
  fightNumber,
  totalFights,
  creature,
  onContinue,
  onFullHeal,
  canAffordFullHeal,
}: {
  trial: CouncilTrial
  fightNumber: number
  totalFights: number
  creature: RunCreature
  onContinue: () => void
  onFullHeal: () => void
  canAffordFullHeal: boolean
}) {
  const nextIndex = fightNumber + 1
  const hasNext = nextIndex < totalFights

  return (
    <main className="council-intermission-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Trial complete</h1>
        <p className="screen-header__subtitle">
          Fight {fightNumber} / {totalFights} — {trial.name} cleared
        </p>
      </header>

      <section className="council-intermission-panel">
        <p>
          Your party recovered <strong>20% max HP</strong> after the last trial
          (applied after rewards and perk choices).
        </p>
        <p className="council-intermission-panel__progress-note">
          XP, ability mastery, and levels earned in earlier Council fights are kept if you
          lose later — retry when ready.
        </p>
        <p className="council-intermission-panel__ai">
          Cleared with {aiStyleLabel(trial.aiStyle)} opponents.
        </p>
        {hasNext && (
          <p>
            Next: fight {nextIndex + 1} of {totalFights}.
          </p>
        )}
        <div className="council-intermission-actions">
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            {hasNext ? 'Continue to next fight' : 'Claim Council victory'}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!canAffordFullHeal || creature.coins < COUNCIL_FULL_HEAL_COST}
            onClick={onFullHeal}
          >
            Full recovery ({COUNCIL_FULL_HEAL_COST} coins)
          </button>
        </div>
        <p className="council-intermission-coins">Coins: {creature.coins}</p>
      </section>
    </main>
  )
}
