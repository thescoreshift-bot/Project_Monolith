import { APP_VERSION_LABEL } from '../utils/version'
import type { CombatDebugSnapshot } from '../utils/combatDebug'

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
  combatDebug = null,
  onClose,
}: {
  info: TesterInfo
  combatDebug?: CombatDebugSnapshot | null
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
        {combatDebug && (
          <>
            <div>
              <dt>Combat turn</dt>
              <dd>{combatDebug.turnNumber}</dd>
            </div>
            <div>
              <dt>Combat phase</dt>
              <dd>{combatDebug.combatPhase}</dd>
            </div>
            <div>
              <dt>Active actor</dt>
              <dd>{combatDebug.activeActor}</dd>
            </div>
            <div>
              <dt>Player HP</dt>
              <dd>
                {combatDebug.playerHp} / {combatDebug.playerMaxHp}
              </dd>
            </div>
            {combatDebug.helperHp !== null && (
              <div>
                <dt>Helper HP</dt>
                <dd>
                  {combatDebug.helperHp} / {combatDebug.helperMaxHp}
                </dd>
              </div>
            )}
            <div>
              <dt>Enemy HP</dt>
              <dd>
                {combatDebug.enemyHp} / {combatDebug.enemyMaxHp}
              </dd>
            </div>
            {combatDebug.lastDamageApplied !== null && (
              <div>
                <dt>Last damage</dt>
                <dd>
                  {combatDebug.lastDamageApplied} → {combatDebug.lastDamageTarget}
                </dd>
              </div>
            )}
          </>
        )}
      </dl>
    </aside>
  )
}
