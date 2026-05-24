import type { NodeType } from '../data/nodeMap'
import { getRegion } from '../data/regions'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type EnemyLevelRange = { min: number; max: number }

export function getRegionRewardMultiplier(regionId: string): number {
  return getRegion(regionId).rewardMultiplier
}

export function getRegionEnemyLevelRange(regionId: string): EnemyLevelRange {
  const region = getRegion(regionId)
  return { min: region.enemyLevelMin, max: region.enemyLevelMax }
}

export function scaleRewardByRegion(baseReward: number, regionId: string): number {
  return Math.round(baseReward * getRegionRewardMultiplier(regionId))
}

export function getPartyHighestLevel(
  starter: RunCreature,
  recruits: PartyCreature[],
): number {
  return Math.max(starter.level, ...recruits.map((r) => r.level), 1)
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** Pick enemy level for a node type within the region band. */
export function rollEnemyLevelForNode(
  regionId: string,
  nodeType: NodeType,
  partyHighestLevel?: number,
): number {
  const { min, max } = getRegionEnemyLevelRange(regionId)
  const span = max - min

  let level: number

  if (nodeType === 'boss' || nodeType === 'gymLeader') {
    level = max
  } else if (nodeType === 'gymTrainer') {
    level = randomInRange(Math.max(min, max - 2), max)
  } else if (nodeType === 'elite' || nodeType === 'alphaNest') {
    const highMin = min + Math.floor(span * 0.55)
    level = randomInRange(highMin, max)
  } else {
    level = randomInRange(min, max)
  }

  // Early-run cap: fresh starters should not face end-of-region levels.
  if (
    partyHighestLevel !== undefined &&
    partyHighestLevel <= 5 &&
    (nodeType === 'battle' || nodeType === 'rest' || nodeType === 'shop' || nodeType === 'event')
  ) {
    const earlyCap = Math.max(1, Math.min(3, partyHighestLevel + 2))
    level = Math.min(level, earlyCap)
  }

  return level
}

export function formatRewardMultiplier(regionId: string): string {
  const mult = getRegionRewardMultiplier(regionId)
  if (mult === 1) return 'x1.0'
  return `x${mult.toFixed(2).replace(/\.?0+$/, '')}`
}
