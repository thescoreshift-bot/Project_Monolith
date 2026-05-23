import type { GameEvent } from '../data/events'
import type { EventChoiceId } from '../data/events'

type EventScreenProps = {
  event: GameEvent
  onChoose: (choice: EventChoiceId) => void
}

export function EventScreen({ event, onChoose }: EventScreenProps) {
  return (
    <main className="event-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">{event.title}</h1>
        <p className="screen-header__subtitle">{event.description}</p>
      </header>

      <div className="event-choices">
        <button
          type="button"
          className="btn event-choice"
          onClick={() => onChoose('a')}
        >
          <span className="event-choice__label">{event.choiceA.label}</span>
          <span className="event-choice__summary">{event.choiceA.summary}</span>
        </button>
        <button
          type="button"
          className="btn event-choice"
          onClick={() => onChoose('b')}
        >
          <span className="event-choice__label">{event.choiceB.label}</span>
          <span className="event-choice__summary">{event.choiceB.summary}</span>
        </button>
      </div>
    </main>
  )
}
