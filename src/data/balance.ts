import type { EnemyKind } from './enemies'
import type { EncounterKind } from './enemies'

export const BALANCE = {
  typeMultipliers: {
    superEffective: 1.5,
    notVeryEffective: 0.75,
    normal: 1,
  },
  earlyDamageCaps: {
    normalEnemy: 0.35,
    superEffectiveEnemy: 0.45,
    playerVsNormalMax: 0.3,
    playerVsEliteMax: 0.38,
  },
  hpRanges: {
    starterLevel1: { min: 50, max: 65 },
    normalEnemyLevel1: { min: 38, max: 50 },
    tankyEnemyLevel1: { min: 50, max: 60 },
    eliteEnemyLevel1: { min: 65, max: 80 },
  },
  encounterHpMultipliers: {
    battle: 1,
    elite: 1.25,
    alphaNest: 1.35,
    gymTrainer: 1.4,
    gymLeader: 1.6,
    boss: 2,
    council: 1.35,
  } satisfies Record<EncounterKind, number>,
  enemyKindHpMultipliers: {
    normal: 1,
    elite: 1.2,
    alpha: 1.3,
    trainer: 1.15,
    boss: 1.5,
  } satisfies Record<EnemyKind, number>,
  damageFloorPercent: {
    neutral: 0.1,
    notVeryEffective: 0.07,
  },
  maxHitPercentOfMaxHp: 0.75,
  suspiciousHitPercent: 0.6,
  targetFightLengths: {
    normal: '4-7 turns',
    elite: '6-10 turns',
    gym: '8-12 turns',
    boss: '10-15 turns',
  },
  levelHpGrowthPerLevel: 5,
  questRewardBonusPerFiveCompleted: 0.04,
} as const

export function encounterKindToHpMultiplier(kind: EncounterKind): number {
  return BALANCE.encounterHpMultipliers[kind] ?? 1
}

export function enemyKindToHpMultiplier(kind: EnemyKind): number {
  return BALANCE.enemyKindHpMultipliers[kind] ?? 1
}
