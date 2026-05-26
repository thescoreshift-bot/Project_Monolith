import { getAbility } from '../data/abilities'
import type { Enemy, EnemyKind } from '../data/enemies'
import { spawnEnemy } from '../data/enemies'
import { buildCombatStatsForEnemy } from './badgeBonuses'
import type { CombatStats } from './combat'
import {
  applyEarlyGameDamageCap,
  clampAbilityPowerForEnemy,
} from './damageBalance'
import { safeCalcDamage, sanitizeDamage } from './combat'
import { getTypeEffectivenessMultiplier } from '../data/typeChart'
import type { ElementType } from '../data/starters'

export type CombatDebugSnapshot = {
  turnNumber: number
  combatPhase: string
  activeActor: string
  playerHp: number
  playerMaxHp: number
  helperHp: number | null
  helperMaxHp: number | null
  enemyHp: number
  enemyMaxHp: number
  lastDamageApplied: number | null
  lastDamageTarget: string | null
  selectedTarget: string | null
}

export type CombatBalanceSimInput = {
  playerLevel: number
  enemyLevel: number
  enemyTemplateId?: string
  enemyType?: EnemyKind
  hasHelper?: boolean
}

export type CombatBalanceSimResult = {
  playerDamagePerHit: number
  enemyDamagePerHit: number
  estimatedPlayerTurnsToKill: number
  estimatedEnemyTurnsToKill: number
  estimatedRoundTurns: number
  note: string
}

function estimateEnemyHit(
  enemy: Enemy,
  defenderMaxHp: number,
  defenderStats: CombatStats,
  defenderType: ElementType,
): number {
  const abilityId = enemy.abilityIds.find((id) => {
    const a = getAbility(id)
    return a && a.power > 0 && a.category !== 'status'
  }) ?? enemy.abilityIds[0]
  const ability = getAbility(abilityId)
  const typeMult = getTypeEffectivenessMultiplier(ability.type, defenderType)
  const powerCap = clampAbilityPowerForEnemy(
    ability.power,
    enemy.level,
    enemy.kind,
  )
  const abilityForDamage =
    powerCap < ability.power ? { ...ability, power: powerCap } : ability
  const atk = buildCombatStatsForEnemy(enemy.stats, {})
  let damage = safeCalcDamage(
    abilityForDamage,
    atk,
    defenderStats,
    defenderMaxHp,
  )
  damage = Math.floor(damage * typeMult)
  damage = applyEarlyGameDamageCap(
    damage,
    defenderMaxHp,
    enemy.level,
    typeMult,
    enemy.kind,
  )
  return sanitizeDamage(damage, defenderMaxHp, abilityForDamage, typeMult)
}

/** Console helper for tuning early fights (dev / tester). */
export function simulateCombatBalance(
  input: CombatBalanceSimInput,
): CombatBalanceSimResult {
  const templateId = input.enemyTemplateId ?? 'bristlebug'
  const enemy = spawnEnemy(templateId, input.enemyLevel, {
    encounterKind: 'battle',
  })
  const playerMaxHp = 55 + Math.max(0, input.playerLevel - 1) * 5
  const playerStats = {
    atk: 8 + input.playerLevel,
    def: 7 + input.playerLevel,
    spAtk: 8 + input.playerLevel,
    spDef: 7 + input.playerLevel,
  }
  const playerAbility = getAbility('spark-ember')
  const playerTypeMult = getTypeEffectivenessMultiplier(
    playerAbility.type,
    enemy.type,
  )
  let playerHit = safeCalcDamage(
    playerAbility,
    playerStats,
    buildCombatStatsForEnemy(enemy.stats, {}),
    enemy.maxHp,
  )
  playerHit = Math.floor(playerHit * playerTypeMult)
  playerHit = applyEarlyGameDamageCap(
    playerHit,
    enemy.maxHp,
    input.playerLevel,
    playerTypeMult,
    'normal',
  )
  playerHit = sanitizeDamage(playerHit, enemy.maxHp, playerAbility, playerTypeMult)

  const enemyHit = estimateEnemyHit(
    enemy,
    playerMaxHp,
    playerStats,
    'Fire',
  )

  const turnsToKillEnemy = Math.max(1, Math.ceil(enemy.maxHp / Math.max(1, playerHit)))
  const turnsToKillPlayer = Math.max(1, Math.ceil(playerMaxHp / Math.max(1, enemyHit)))
  const helperFactor = input.hasHelper ? 0.72 : 1
  const roundTurns = Math.ceil(
    (turnsToKillEnemy + turnsToKillPlayer * helperFactor) *
      (input.hasHelper ? 0.85 : 1),
  )

  const result: CombatBalanceSimResult = {
    playerDamagePerHit: playerHit,
    enemyDamagePerHit: enemyHit,
    estimatedPlayerTurnsToKill: turnsToKillEnemy,
    estimatedEnemyTurnsToKill: turnsToKillPlayer,
    estimatedRoundTurns: roundTurns,
    note: `Template ${templateId} L${input.enemyLevel} vs player L${input.playerLevel}`,
  }

  console.table(result)
  return result
}
