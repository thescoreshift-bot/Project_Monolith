import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { getNodeState } from '../data/nodeMap'
import { getRegion } from '../data/regions'
import { getCompletedUnclaimedQuests, getActiveQuests } from './questSystem'
import type { QuestState } from './questSystem'
import { getCompletedUnclaimedRequestQuests } from './requestQuestSystem'
import type { RequestQuestState } from './requestQuestSystem'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { getPartyHighestLevel } from './regionRewards'
import type { PendingChoiceSummary } from './rewardSummary'
import { BADGES_IN_REGION } from '../data/badges'
import { countBadgesInRegion } from './regionTravel'
import type { MonolithCouncilSaveState } from './monolithCouncilState'
import { isCouncilCompleted, isCouncilUnlocked } from './monolithCouncilState'
import { getCouncilForRegion } from '../data/monolithCouncil'

export type CurrentObjectiveInput = {
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  runCreature: RunCreature
  partyRecruits: PartyCreature[]
  currentRegionId: string
  questState: QuestState
  requestQuestState?: RequestQuestState
  pendingBossVictory: boolean
  pendingPostBattleCount: number
  hasArchiveNotification: boolean
  runMode: 'normal' | 'daily' | 'pvp'
  earnedBadges?: string[]
  monolithCouncilState?: MonolithCouncilSaveState
}

export type CurrentObjective = {
  title: string
  detail?: string
}

function countAvailableNodes(
  mapNodes: MapNode[],
  nodeStates: Record<string, NodeVisitState>,
): number {
  return mapNodes.filter((n) => getNodeState(nodeStates, n.id) === 'available').length
}

function partyNeedsHeal(starter: RunCreature, recruits: PartyCreature[]): boolean {
  if (starter.currentHp < starter.maxHp * 0.45) return true
  return recruits.some((r) => r.currentHp < r.maxHp * 0.45)
}

export function computeCurrentObjective(input: CurrentObjectiveInput): CurrentObjective {
  const {
    mapNodes,
    nodeStates,
    runCreature,
    partyRecruits,
    currentRegionId,
    questState,
    requestQuestState,
    pendingBossVictory,
    pendingPostBattleCount,
    hasArchiveNotification,
    runMode,
    earnedBadges,
    monolithCouncilState,
  } = input

  if (runMode === 'daily') {
    return {
      title: 'Complete today’s daily route.',
      detail: 'One life per attempt — your best score is saved.',
    }
  }

  const requestClaimable = requestQuestState
    ? getCompletedUnclaimedRequestQuests(requestQuestState)
    : []
  if (requestClaimable.length > 0) {
    return {
      title: 'Claim your completed request from Quest Broker Mira.',
      detail: `Recovery Station → Active Requests — ${requestClaimable[0].title}.`,
    }
  }

  const claimable = getCompletedUnclaimedQuests(questState)
  if (claimable.length > 0) {
    return {
      title: 'Claim your completed quest from Quest Broker Mira.',
      detail: `Recovery Station — ${claimable[0].title} ready to claim.`,
    }
  }

  if (pendingPostBattleCount > 0) {
    return {
      title: 'Resolve pending rewards and choices.',
      detail: 'Perks, mastery, or evolution may be waiting after your last battle.',
    }
  }

  if (pendingBossVictory) {
    return {
      title: 'Boss defeated! Choose your next region.',
      detail: 'Use Leave Area to travel when you are ready.',
    }
  }

  const region = getRegion(currentRegionId)
  const partyHighest = getPartyHighestLevel(runCreature, partyRecruits)
  if (region && partyHighest < region.recommendedLevel) {
    return {
      title: 'You are underleveled for this region.',
      detail: 'Consider Leave Area, Recovery Station, or easier nodes.',
    }
  }

  if (partyNeedsHeal(runCreature, partyRecruits)) {
    return {
      title: 'Visit Recovery Station to heal.',
      detail: 'Restore HP before tough battles or the boss.',
    }
  }

  if (hasArchiveNotification) {
    return {
      title: 'Monolith Archive has rewards to claim.',
      detail: 'Open from the main menu when you are safe on the map.',
    }
  }

  const badgeIds = earnedBadges ?? []
  const councilState = monolithCouncilState

  const VERDANT_REGION_ID = 'verdant-circuit'
  const verdantCouncil = getCouncilForRegion(VERDANT_REGION_ID)
  if (
    verdantCouncil &&
    verdantCouncil.trials.length > 0 &&
    councilState &&
    currentRegionId !== VERDANT_REGION_ID &&
    !isCouncilCompleted(councilState, VERDANT_REGION_ID)
  ) {
    const verdantBadges = countBadgesInRegion(VERDANT_REGION_ID, badgeIds)
    if (
      verdantBadges >= BADGES_IN_REGION &&
      isCouncilUnlocked(councilState, VERDANT_REGION_ID, badgeIds)
    ) {
      return {
        title: 'The Verdant Council is available in Verdant Circuit.',
        detail: `Travel to Verdant Circuit — ${verdantCouncil.officialName} is on the map there.`,
      }
    }
  }

  const council = getCouncilForRegion(currentRegionId)
  if (council && council.trials.length === 0) {
    const badgesHere = countBadgesInRegion(currentRegionId, badgeIds)
    if (badgesHere >= BADGES_IN_REGION) {
      return {
        title: "This region's Monolith Council is not available yet.",
        detail: 'The Council gauntlet for this region is coming soon.',
      }
    }
  }

  if (
    council &&
    council.trials.length > 0 &&
    councilState &&
    !isCouncilCompleted(councilState, currentRegionId)
  ) {
    const badges = countBadgesInRegion(currentRegionId, badgeIds)
    if (badges >= BADGES_IN_REGION && isCouncilUnlocked(councilState, currentRegionId, badgeIds)) {
      return {
        title: 'Challenge The Monolith Council at the end of the route.',
        detail: `Use Challenge Monolith Council on the map HUD, or travel to the glowing node at the top — ${council.localName}.`,
      }
    }
  }

  const activeQuests = getActiveQuests(questState)
  if (activeQuests.length > 0) {
    const q = activeQuests[0]
    const entry = questState.progress[q.id]
    if (entry && !entry.completed) {
      return {
        title: 'Work toward your active quest.',
        detail: `${q.title}: ${entry.currentAmount}/${entry.requiredAmount} — ${q.description}`,
      }
    }
  }

  const available = countAvailableNodes(mapNodes, nodeStates)
  if (available === 0) {
    return {
      title: 'Clear the route or travel to another region.',
      detail: 'No available nodes — finish in-progress paths or leave the area.',
    }
  }

  return {
    title: 'Choose your next node.',
    detail:
      available === 1
        ? 'One node is available on the map.'
        : `${available} nodes are available — battles earn XP and coins.`,
  }
}

export function formatRewardNextStep(choices: PendingChoiceSummary[]): string | null {
  if (choices.length === 0) return null
  const label = choices[0].label.toLowerCase()
  if (label.includes('perk')) return 'Next: Choose a perk'
  if (label.includes('mastery') || label.includes('upgrade')) {
    return 'Next: Ability mastery upgrade'
  }
  if (label.includes('evolution')) return 'Next: Evolution'
  if (label.includes('move') || label.includes('learn')) return 'Next: Learn a move'
  if (label.includes('transform')) return 'Next: Ability transformation'
  return `Next: ${choices[0].label}`
}
