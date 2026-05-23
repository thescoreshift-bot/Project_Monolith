import { APP_VERSION_LABEL } from '../utils/version'

type SettingsScreenProps = {
  tutorialCompleted: boolean
  onResetTutorial: () => void
  onOpenFeedback: () => void
  onBack: () => void
}

export function SettingsScreen({
  tutorialCompleted,
  onResetTutorial,
  onOpenFeedback,
  onBack,
}: SettingsScreenProps) {
  return (
    <main className="settings-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Settings</h1>
        <p className="screen-header__subtitle">{APP_VERSION_LABEL}</p>
      </header>

      <section className="settings-screen__section">
        <h2 className="panel-label">Tutorial</h2>
        <p className="settings-screen__hint">
          {tutorialCompleted
            ? 'Tutorial tips are hidden. Reset to see them again on your next run.'
            : 'Tutorial tips are active for new runs.'}
        </p>
        <button type="button" className="btn btn--small" onClick={onResetTutorial}>
          Reset tutorial
        </button>
      </section>

      <section className="settings-screen__section">
        <h2 className="panel-label">Testing</h2>
        <button type="button" className="btn btn--small" onClick={onOpenFeedback}>
          Send feedback / report bug
        </button>
      </section>

      <footer className="settings-screen__footer">
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
      </footer>
    </main>
  )
}
