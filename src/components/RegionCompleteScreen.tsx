import { getRegion } from '../data/regions'
import type { RunCreature } from '../utils/progression'
import type { PartyCreature } from '../utils/party'

export type RegionCompleteData = {
  regionId: string
  bossName: string
  coinsGained: number
  xpTotal: number
  badgesInRegion: number
  totalBadges: number
}

type RegionCompleteScreenProps = {
  data: RegionCompleteData
  creature: RunCreature
  partyRecruits: PartyCreature[]
  onChooseNextRegion: () => void
}

export function RegionCompleteScreen({
  data,
  creature,
  partyRecruits,
  onChooseNextRegion,
}: RegionCompleteScreenProps) {
  const region = getRegion(data.regionId)

  return (
    <main className="region-complete-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Region Cleared!</h1>
        <p className="screen-header__subtitle">{region.name}</p>
      </header>

      <section className="region-complete-panel">
        <div className="region-complete-panel__row">
          <span className="panel-label">Boss defeated</span>
          <p className="region-complete-panel__value">{data.bossName}</p>
        </div>
        <div className="region-complete-panel__row">
          <span className="panel-label">Badges in this region</span>
          <p className="region-complete-panel__value">
            {data.badgesInRegion} / {region.availableBadges}
          </p>
        </div>
        <div className="region-complete-panel__row">
          <span className="panel-label">Total badges owned</span>
          <p className="region-complete-panel__value">{data.totalBadges}</p>
        </div>
        <div className="region-complete-panel__row">
          <span className="panel-label">Boss coins</span>
          <p className="region-complete-panel__value">+{data.coinsGained}</p>
        </div>
        <div className="region-complete-panel__row">
          <span className="panel-label">Boss XP (team)</span>
          <p className="region-complete-panel__value">+{data.xpTotal} XP</p>
        </div>
      </section>

      <section className="region-complete-party" aria-label="Party summary">
        <h2 className="region-complete-party__title">Party</h2>
        <ul className="region-complete-party__list">
          <li>
            <strong>{creature.name}</strong> · Lv. {creature.level} · {creature.type}
          </li>
          {partyRecruits.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong> · Lv. {r.level} · {r.type}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onChooseNextRegion}
      >
        Choose Next Region
      </button>
    </main>
  )
}
