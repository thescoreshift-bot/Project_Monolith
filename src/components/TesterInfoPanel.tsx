import { APP_VERSION_LABEL } from '../utils/version'

export type TesterInfo = {
  screen: string
  saveSlot: string
  saveMode: string
  region: string
  partyHighestLevel: number
  mapSeed?: string
  runMode: string
  loggedIn: boolean
  displayName?: string
}

export function TesterInfoPanel({
  info,
  onClose,
}: {
  info: TesterInfo
  onClose: () => void
}) {
  return (
    <aside className="tester-info-panel" aria-label="Tester debug info">
      <header className="tester-info-panel__header">
        <h2 className="tester-info-panel__title">Tester info</h2>
        <button type="button" className="btn btn--small" onClick={onClose}>
          Hide
        </button>
      </header>
      <dl className="tester-info-panel__list">
        <div>
          <dt>Version</dt>
          <dd>{APP_VERSION_LABEL}</dd>
        </div>
        <div>
          <dt>Screen</dt>
          <dd>{info.screen}</dd>
        </div>
        <div>
          <dt>Save slot</dt>
          <dd>{info.saveSlot}</dd>
        </div>
        <div>
          <dt>Save mode</dt>
          <dd>{info.saveMode}</dd>
        </div>
        <div>
          <dt>Run mode</dt>
          <dd>{info.runMode}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{info.region}</dd>
        </div>
        <div>
          <dt>Party highest level</dt>
          <dd>{info.partyHighestLevel}</dd>
        </div>
        {info.mapSeed && (
          <div>
            <dt>Map / daily seed</dt>
            <dd className="tester-info-panel__mono">{info.mapSeed}</dd>
          </div>
        )}
        <div>
          <dt>Account</dt>
          <dd>{info.loggedIn ? info.displayName ?? 'Logged in' : 'Offline'}</dd>
        </div>
      </dl>
    </aside>
  )
}
