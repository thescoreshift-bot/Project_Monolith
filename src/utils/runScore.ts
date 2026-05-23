import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type ScoreBreakdownLine = {
  label: string
  points: number
}

export type RunScoreSnapshot = {
  total: number
  breakdown: ScoreBreakdownLine[]
  completed: boolean
}

export type RunScoreTracker = {
  battlesWon: number
  elitesWon: number
  alphasWon: number
  gymLeadersDefeated: number
  bossesDefeated: number
  badgesEarned: number
  levelsGained: number
  evolutionsReached: number
  recruitsAdded: number
  defeats: number
  faintedAtEnd: number
  startingLevel: number
  submittedToLeaderboard: boolean
}

export function createScoreTracker(starterLevel = 1): RunScoreTracker {
  return {
    battlesWon: 0,
    elitesWon: 0,
    alphasWon: 0,
    gymLeadersDefeated: 0,
    bossesDefeated: 0,
    badgesEarned: 0,
    levelsGained: 0,
    evolutionsReached: 0,
    recruitsAdded: 0,
    defeats: 0,
    faintedAtEnd: 0,
    startingLevel: starterLevel,
    submittedToLeaderboard: false,
  }
}

export function recordBattleVictory(
  tracker: RunScoreTracker,
  kind: 'battle' | 'elite' | 'alphaNest' | 'gymTrainer' | 'gymLeader' | 'boss',
): void {
  switch (kind) {
    case 'battle':
      tracker.battlesWon += 1
      break
    case 'elite':
      tracker.elitesWon += 1
      break
    case 'alphaNest':
      tracker.alphasWon += 1
      break
    case 'gymTrainer':
      tracker.battlesWon += 1
      break
    case 'gymLeader':
      tracker.gymLeadersDefeated += 1
      break
    case 'boss':
      tracker.bossesDefeated += 1
      break
  }
}

export function recordLevelsGained(tracker: RunScoreTracker, count: number): void {
  if (count > 0) tracker.levelsGained += count
}

export function buildRunScore(
  tracker: RunScoreTracker,
  starter: RunCreature,
  recruits: PartyCreature[],
  completed: boolean,
): RunScoreSnapshot {
  const breakdown: ScoreBreakdownLine[] = []

  if (tracker.battlesWon > 0) {
    breakdown.push({
      label: `Battles won (×${tracker.battlesWon})`,
      points: tracker.battlesWon * 100,
    })
  }
  const eliteAlpha = tracker.elitesWon + tracker.alphasWon
  if (eliteAlpha > 0) {
    breakdown.push({
      label: `Elite / Alpha (×${eliteAlpha})`,
      points: eliteAlpha * 250,
    })
  }
  if (tracker.gymLeadersDefeated > 0) {
    breakdown.push({
      label: `Gym leaders (×${tracker.gymLeadersDefeated})`,
      points: tracker.gymLeadersDefeated * 500,
    })
  }
  if (tracker.bossesDefeated > 0) {
    breakdown.push({
      label: `Boss defeated (×${tracker.bossesDefeated})`,
      points: tracker.bossesDefeated * 1000,
    })
  }
  if (tracker.badgesEarned > 0) {
    breakdown.push({
      label: `Badges (×${tracker.badgesEarned})`,
      points: tracker.badgesEarned * 200,
    })
  }
  if (tracker.levelsGained > 0) {
    breakdown.push({
      label: `Levels gained (×${tracker.levelsGained})`,
      points: tracker.levelsGained * 50,
    })
  }
  if (tracker.evolutionsReached > 0) {
    breakdown.push({
      label: `Evolutions (×${tracker.evolutionsReached})`,
      points: tracker.evolutionsReached * 100,
    })
  }
  if (tracker.recruitsAdded > 0) {
    breakdown.push({
      label: `Recruits (×${tracker.recruitsAdded})`,
      points: tracker.recruitsAdded * 150,
    })
  }
  if (tracker.defeats > 0) {
    breakdown.push({
      label: `Defeats (×${tracker.defeats})`,
      points: tracker.defeats * -100,
    })
  }

  let hpBonus = 0
  if (completed) {
    const party = [starter, ...recruits]
    hpBonus = party.reduce((sum, c) => sum + Math.max(0, c.currentHp), 0)
    if (hpBonus > 0) {
      breakdown.push({ label: 'Remaining HP bonus', points: hpBonus })
    }
    const coinBonus = starter.coins
    if (coinBonus > 0) {
      breakdown.push({ label: 'Coins carried', points: coinBonus })
    }
  }

  const fainted =
    (starter.currentHp <= 0 ? 1 : 0) +
    recruits.filter((r) => r.currentHp <= 0).length
  tracker.faintedAtEnd = fainted
  if (fainted > 0) {
    breakdown.push({
      label: `Fainted at end (×${fainted})`,
      points: fainted * -50,
    })
  }

  const total = breakdown.reduce((s, line) => s + line.points, 0)
  return {
    total: Math.max(0, total),
    breakdown,
    completed,
  }
}

export function buildFinalTeamJson(
  starter: RunCreature,
  recruits: PartyCreature[],
): { name: string; type: string; level: number }[] {
  return [
    { name: starter.name, type: starter.type, level: starter.level },
    ...recruits.map((r) => ({
      name: r.name,
      type: r.type,
      level: r.level,
    })),
  ]
}
