import type { EncounterKind } from '../data/enemies'
import type { CouncilTrial } from '../data/monolithCouncil'
import { getXpReward } from './rewards'

/** Elite-scale multipliers for Council fights 1–5 (fight 6 / Warden uses boss XP). */
const COUNCIL_ELITE_XP_MULTIPLIERS = [0.75, 0.8, 0.85, 0.9, 1] as const

export function isCouncilWardenTrial(trial: CouncilTrial, fightNumber: number, totalFights: number): boolean {
  return trial.aiStyle === 'champion' || fightNumber >= totalFights
}

export function getCouncilFightEncounterKind(
  trial: CouncilTrial,
  fightNumber: number,
  totalFights: number,
): EncounterKind {
  return isCouncilWardenTrial(trial, fightNumber, totalFights) ? 'boss' : 'elite'
}

export function getCouncilFightXpMultiplier(
  trial: CouncilTrial,
  fightNumber: number,
  totalFights: number,
): number {
  if (isCouncilWardenTrial(trial, fightNumber, totalFights)) return 1
  const index = Math.max(0, Math.min(fightNumber - 1, COUNCIL_ELITE_XP_MULTIPLIERS.length - 1))
  return COUNCIL_ELITE_XP_MULTIPLIERS[index]!
}

export function getCouncilFightScaledXp(
  trial: CouncilTrial,
  fightNumber: number,
  totalFights: number,
  regionId: string,
): number {
  const kind = getCouncilFightEncounterKind(trial, fightNumber, totalFights)
  const mult = getCouncilFightXpMultiplier(trial, fightNumber, totalFights)
  return Math.max(1, Math.floor(getXpReward(kind, regionId) * mult))
}

export function getCouncilFightCoinReward(regionId: string): number {
  return Math.floor(getXpReward('council', regionId) * 0.4)
}
