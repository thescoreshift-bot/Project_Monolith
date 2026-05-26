import { getPatchNotesNewestFirst } from '../data/patchNotes'
import { APP_VERSION_LABEL } from '../utils/version'

export function PatchNotesScreen({ onBack }: { onBack: () => void }) {
  const entries = getPatchNotesNewestFirst()

  return (
    <main className="patch-notes-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Patch Notes</h1>
        <p className="screen-header__subtitle">
          {APP_VERSION_LABEL} · Current build
        </p>
      </header>

      <div className="patch-notes-screen__list">
        {entries.map((entry, index) => {
          const isLatest = index === 0
          return (
            <article
              key={`${entry.version}-${entry.date}`}
              className={`patch-notes-entry${isLatest ? ' patch-notes-entry--latest' : ''}`}
            >
              <header className="patch-notes-entry__header">
                <div className="patch-notes-entry__title-row">
                  <h2 className="patch-notes-entry__version">{entry.version}</h2>
                  {isLatest && (
                    <span className="patch-notes-entry__badge">Latest</span>
                  )}
                </div>
                <time className="patch-notes-entry__date" dateTime={entry.date}>
                  {entry.date}
                </time>
              </header>
              <h3 className="patch-notes-entry__title">{entry.title}</h3>
              <ul className="patch-notes-entry__changes">
                {entry.changes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>

      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
