import type { Region } from '../data/regions'
import { formatRewardMultiplier } from '../utils/regionRewards'

type RegionSelectScreenProps = {
  regions: Region[]
  partyHighestLevel: number
  hintMessage?: string | null
  councilStatusBanner?: string | null
  onTravel: (regionId: string) => void
}

export function RegionSelectScreen({
  regions,
  partyHighestLevel,
  hintMessage,
  councilStatusBanner,
  onTravel,
}: RegionSelectScreenProps) {
  return (
    <main className="region-select-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Region Selection</h1>
        <p className="screen-header__subtitle">
          Where do you want to travel next?
        </p>
        <p className="region-select-screen__party-level">
          Party highest level: <strong>{partyHighestLevel}</strong>
        </p>
        {hintMessage && (
          <p className="region-select-screen__hint" role="status">
            {hintMessage}
          </p>
        )}
        {councilStatusBanner && (
          <p className="region-select-screen__council-banner" role="status">
            {councilStatusBanner}
          </p>
        )}
      </header>

      <div className="region-select-grid">
        {regions.map((region) => {
          const underleveled = partyHighestLevel < region.recommendedLevel
          const rewardLabel = formatRewardMultiplier(region.id)
          return (
            <article key={region.id} className="region-card">
              <h2 className="region-card__name">{region.name}</h2>
              <p className="region-card__theme">Theme: {region.theme}</p>
              <p className="region-card__desc">{region.description}</p>
              <dl className="region-card__meta region-card__meta--wide">
                <div>
                  <dt>Recommended</dt>
                  <dd>Lv. {region.recommendedLevel}+</dd>
                </div>
                <div>
                  <dt>Enemy levels</dt>
                  <dd>
                    {region.enemyLevelMin}–{region.enemyLevelMax}
                  </dd>
                </div>
                <div>
                  <dt>Rewards</dt>
                  <dd>{rewardLabel} XP / Coins</dd>
                </div>
                <div>
                  <dt>Difficulty</dt>
                  <dd>{region.difficulty}</dd>
                </div>
                <div>
                  <dt>Badges</dt>
                  <dd>{region.availableBadges}</dd>
                </div>
              </dl>
              {underleveled && (
                <p className="region-card__warning" role="status">
                  Warning: Your party may be underleveled.
                </p>
              )}
              <button
                type="button"
                className="btn btn--primary btn--small"
                onClick={() => onTravel(region.id)}
              >
                Travel Here
              </button>
            </article>
          )
        })}
      </div>
    </main>
  )
}
