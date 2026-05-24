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

export type RollEnemyLevelOptions = {
  partyHighestLevel?: number
  mapLayer?: number
  isDailyRun?: boolean
}

function normalizeRollOptions(
  options?: RollEnemyLevelOptions | number,
): RollEnemyLevelOptions {
  if (typeof options === 'number') {
    return { partyHighestLevel: options }
  }
  return options ?? {}
}

function clampLevel(level: number, floor: number, ceiling: number): number {
  return Math.max(floor, Math.min(ceiling, level))
}

/** Pick enemy level for a node type within the region band. */
export function rollEnemyLevelForNode(
  regionId: string,
  nodeType: NodeType,
  options?: RollEnemyLevelOptions | number,
): number {
  const { partyHighestLevel, mapLayer = 0, isDailyRun = false } =
    normalizeRollOptions(options)
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

  const usePartyScaling =
    partyHighestLevel !== undefined &&
    (isDailyRun || partyHighestLevel <= 8)

  if (usePartyScaling) {
    const party = partyHighestLevel
    const layerOffset = isDailyRun
      ? Math.min(3, Math.floor(mapLayer / 2))
      : Math.min(2, Math.floor(mapLayer / 3))
    const softMax = Math.min(max, party + 2 + layerOffset)
    const softMin = Math.max(1, isDailyRun && mapLayer <= 1 ? 1 : party)

    if (
      nodeType === 'battle' ||
      nodeType === 'rest' ||
      nodeType === 'shop' ||
      nodeType === 'event'
    ) {
      const battleCap =
        isDailyRun && mapLayer <= 1
          ? Math.max(1, Math.min(3, party + 2))
          : softMax
      level = clampLevel(level, softMin, battleCap)
    } else if (nodeType === 'elite' || nodeType === 'alphaNest') {
      const eliteMax = Math.min(max, party + 3 + layerOffset)
      const eliteMin = Math.max(1, party)
      level = clampLevel(level, eliteMin, eliteMax)
    } else if (nodeType === 'gymTrainer') {
      level = clampLevel(
        level,
        Math.max(1, party + 1),
        Math.min(max, party + 4 + layerOffset),
      )
    } else if (nodeType === 'gymLeader') {
      level = clampLevel(
        level,
        Math.max(1, party + 2),
        Math.min(max, party + 5 + layerOffset),
      )
    } else if (nodeType === 'boss') {
      if (isDailyRun) {
        level = clampLevel(
          level,
          Math.max(1, party + 3),
          Math.min(max, party + 6 + layerOffset),
        )
      }
    }
  } else if (
    partyHighestLevel !== undefined &&
    partyHighestLevel <= 5 &&
    (nodeType === 'battle' ||
      nodeType === 'rest' ||
      nodeType === 'shop' ||
      nodeType === 'event')
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
