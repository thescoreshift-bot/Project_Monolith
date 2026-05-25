import {
  buildLocalCouncilFlavorLine,
  getAllRegionCouncils,
  getCouncilForRegion,
} from '../data/monolithCouncil'
import { REGIONS } from '../data/regions'
import type { MonolithCouncilSaveState } from '../utils/monolithCouncilState'
import {
  getRegionCouncilProgress,
  isCouncilCompleted,
  isCouncilUnlocked,
} from '../utils/monolithCouncilState'

export function CouncilScoutPanel({
  currentRegionId,
  councilState,
  earnedBadges,
  completedRegionIds,
}: {
  currentRegionId: string
  councilState: MonolithCouncilSaveState
  earnedBadges: string[]
  completedRegionIds: string[]
}) {
  if (!councilState.councilScoutUnlocked) return null

  const currentProgress = getRegionCouncilProgress(
    councilState,
    currentRegionId,
    earnedBadges,
  )
  const currentCouncil = getCouncilForRegion(currentRegionId)

  const nextRegionIdx = REGIONS.findIndex((r) => r.id === currentRegionId) + 1
  const nextRegion =
    nextRegionIdx > 0 && nextRegionIdx < REGIONS.length
      ? REGIONS[nextRegionIdx]
      : null
  const nextCouncil = nextRegion ? getCouncilForRegion(nextRegion.id) : null

  const allCouncils = getAllRegionCouncils()

  return (
    <section className="council-scout-panel" aria-labelledby="council-scout-heading">
      <h2 id="council-scout-heading" className="council-scout-panel__title">
        Council Scout
      </h2>
      <p className="council-scout-panel__intro">
        Each region hosts its own Monolith Council — a final 2v2 gauntlet after earning
        all 8 badges. Official titles use the region name; locals often use a shorter
        council name.
      </p>

      <dl className="council-scout-panel__stats">
        <div>
          <dt>This region</dt>
          <dd>
            {currentProgress?.officialName ?? currentCouncil?.officialName ?? '—'}
            {currentProgress?.completed || isCouncilCompleted(councilState, currentRegionId)
              ? ' (completed)'
              : currentProgress?.unlocked ||
                  (currentCouncil &&
                    isCouncilUnlocked(councilState, currentRegionId, earnedBadges))
                ? ' (unlocked)'
                : ' (locked — need 8 badges)'}
          </dd>
          {currentCouncil && (
            <dd className="council-scout-panel__local">
              {buildLocalCouncilFlavorLine(currentCouncil.localName)}
            </dd>
          )}
        </div>
        {currentCouncil && !isCouncilCompleted(councilState, currentRegionId) && (
          <div>
            <dt>Recommended</dt>
            <dd>Lv. {currentCouncil.recommendedLevel}+</dd>
          </div>
        )}
        {nextRegion && nextCouncil && (
          <div>
            <dt>Next region</dt>
            <dd>
              {nextCouncil.officialName} — Lv. {nextCouncil.recommendedLevel}+ recommended
              {completedRegionIds.includes(currentRegionId)
                ? ' (travel unlocked)'
                : ' (complete this region&apos;s Council first)'}
            </dd>
            <dd className="council-scout-panel__local">
              {buildLocalCouncilFlavorLine(nextCouncil.localName)}
            </dd>
          </div>
        )}
      </dl>

      <section className="council-scout-panel__registry" aria-label="All region councils">
        <h3 className="council-scout-panel__registry-title">Council registry</h3>
        <ul className="council-scout-panel__registry-list">
          {allCouncils.map((council) => {
            const entry = councilState.regionCouncils[council.regionId]
            const completed =
              entry?.completed ?? isCouncilCompleted(councilState, council.regionId)
            const unlocked =
              entry?.unlocked ??
              isCouncilUnlocked(councilState, council.regionId, earnedBadges)
            const status = completed
              ? 'Cleared'
              : unlocked
                ? council.trials.length > 0
                  ? 'Available'
                  : 'Coming soon'
                : 'Locked'
            return (
              <li key={council.regionId} className="council-scout-panel__registry-item">
                <strong>{council.officialName}</strong>
                <span className="council-scout-panel__registry-local">
                  {council.localName}
                </span>
                <span className="council-scout-panel__registry-status">{status}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="council-scout-panel__note">
        Council Request quests from the Scout will appear on the request board in a future
        update. Rematch cleared Councils from the glowing Monolith Council node on the Run
        Map.
      </p>
    </section>
  )
}
