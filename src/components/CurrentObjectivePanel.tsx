import type { CurrentObjective } from '../utils/currentObjective'

export function CurrentObjectivePanel({ objective }: { objective: CurrentObjective }) {
  return (
    <section className="current-objective" aria-label="Current objective">
      <h2 className="current-objective__label">Current objective</h2>
      <p className="current-objective__title">{objective.title}</p>
      {objective.detail && (
        <p className="current-objective__detail">{objective.detail}</p>
      )}
    </section>
  )
}
