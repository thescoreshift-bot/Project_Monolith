import { getCouncilForRegion } from '../data/monolithCouncil'
import { BADGES_IN_REGION } from '../data/badges'
import type { MonolithCouncilSaveState } from './monolithCouncilState'
import { isCouncilCompleted, isCouncilUnlocked } from './monolithCouncilState'
import { countBadgesInRegion } from './regionTravel'

const VERDANT_REGION_ID = 'verdant-circuit'

/** Banner text for region selection when Council progress is elsewhere or unavailable. */
export function getRegionSelectCouncilBanner(
  currentRegionId: string,
  earnedBadges: string[],
  councilState?: MonolithCouncilSaveState,
): string | null {
  if (!councilState) return null

  const verdantCouncil = getCouncilForRegion(VERDANT_REGION_ID)
  if (
    verdantCouncil &&
    verdantCouncil.trials.length > 0 &&
    currentRegionId !== VERDANT_REGION_ID &&
    !isCouncilCompleted(councilState, VERDANT_REGION_ID)
  ) {
    const verdantBadges = countBadgesInRegion(VERDANT_REGION_ID, earnedBadges)
    if (
      verdantBadges >= BADGES_IN_REGION &&
      isCouncilUnlocked(councilState, VERDANT_REGION_ID, earnedBadges)
    ) {
      return `The Verdant Council is available in Verdant Circuit — travel there to challenge ${verdantCouncil.localName}.`
    }
  }

  const here = getCouncilForRegion(currentRegionId)
  if (here && here.trials.length === 0) {
    const badgesHere = countBadgesInRegion(currentRegionId, earnedBadges)
    if (badgesHere >= BADGES_IN_REGION) {
      return "This region's Monolith Council is not available yet."
    }
  }

  return null
}
