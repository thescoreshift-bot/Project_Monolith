import type { EncounterKind } from '../data/enemies'
import {
  EARLY_BATTLE_COINS_MAX,
  EARLY_BATTLE_COINS_MIN,
  EARLY_BATTLE_XP_BASE,
} from './earlyGameBalance'
import { scaleRewardByRegion } from './regionRewards'

export type CoinRewardType =
  | EncounterKind
  | 'eventSmall'
  | 'eventMedium'
  | 'eventLarge'

export type XpRewardType = EncounterKind

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function baseCoinReward(type: CoinRewardType): number {
  switch (type) {
    case 'battle':
      return randomInRange(EARLY_BATTLE_COINS_MIN, EARLY_BATTLE_COINS_MAX)
    case 'elite':
      return randomInRange(15, 25)
    case 'alphaNest':
      return randomInRange(20, 35)
    case 'gymTrainer':
      return randomInRange(25, 40)
    case 'gymLeader':
      return 50
    case 'boss':
      return 75
    case 'council':
      return randomInRange(18, 28)
    case 'eventSmall':
      return randomInRange(10, 20)
    case 'eventMedium':
      return randomInRange(25, 35)
    case 'eventLarge':
      return randomInRange(40, 50)
    default:
      return randomInRange(5, 10)
  }
}

function baseXpReward(type: XpRewardType): number {
  switch (type) {
    case 'battle':
      return EARLY_BATTLE_XP_BASE
    case 'elite':
      return 35
    case 'alphaNest':
      return 45
    case 'gymTrainer':
      return 50
    case 'gymLeader':
      return 75
    case 'boss':
      return 100
    case 'council':
      return 55
    default:
      return 20
  }
}

export function getCoinReward(type: CoinRewardType, regionId?: string): number {
  const base = baseCoinReward(type)
  if (!regionId) return base
  return scaleRewardByRegion(base, regionId)
}

export function getXpReward(type: XpRewardType, regionId?: string): number {
  const base = baseXpReward(type)
  if (!regionId) return base
  return scaleRewardByRegion(base, regionId)
}
