import { PATCH_NOTES } from '../data/patchNotes'
import { APP_VERSION_LABEL } from '../utils/version'

export function PatchNotesScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="patch-notes-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Patch Notes</h1>
        <p className="screen-header__subtitle">{APP_VERSION_LABEL}</p>
      </header>

      <div className="patch-notes-screen__list">
        {PATCH_NOTES.map((entry) => (
          <article key={entry.version} className="patch-notes-entry">
            <header className="patch-notes-entry__header">
              <h2 className="patch-notes-entry__version">v{entry.version}</h2>
              <time className="patch-notes-entry__date" dateTime={entry.date}>
                {entry.date}
              </time>
            </header>
            <ul className="patch-notes-entry__changes">
              {entry.changes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
