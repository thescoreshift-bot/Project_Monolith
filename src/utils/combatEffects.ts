import type { AbilityDefinition, AbilityEffect, StatStageKey } from '../data/abilityTypes'
import type { CombatStats } from './combat'
import type { SupportMasteryModifiers } from './supportMasteryEffects'

export type CombatStatStages = Partial<Record<StatStageKey, number>>

export type CombatStatusFlags = {
  burn?: boolean
  poison?: boolean
  paralyze?: boolean
  bind?: boolean
}

export type CombatEffectState = {
  statStages: CombatStatStages
  status: CombatStatusFlags
}

const STAGE_MULTIPLIERS: Record<number, number> = {
  [-6]: 0.25,
  [-5]: 0.29,
  [-4]: 0.33,
  [-3]: 0.4,
  [-2]: 0.5,
  [-1]: 0.66,
  [0]: 1,
  [1]: 1.5,
  [2]: 2,
  [3]: 2.5,
  [4]: 3,
  [5]: 3.5,
  [6]: 4,
}

export function clampStatStage(stage: number): number {
  return Math.max(-6, Math.min(6, Math.round(stage)))
}

export function getStageMultiplier(stage: number): number {
  return STAGE_MULTIPLIERS[clampStatStage(stage)] ?? 1
}

export function createCombatEffectState(): CombatEffectState {
  return { statStages: {}, status: {} }
}

export function applyStatStageToValue(base: number, stage: number): number {
  const safeBase = typeof base === 'number' && Number.isFinite(base) ? base : 1
  const mult = getStageMultiplier(stage)
  return Math.max(1, Math.floor(safeBase * mult))
}

export function getEffectiveCombatStat(
  stat: keyof Pick<CombatStats, 'atk' | 'def' | 'spAtk' | 'spDef'> | 'spd',
  baseStats: CombatStats & { spd?: number },
  stages: CombatStatStages,
): number {
  const base = stat === 'spd' ? (baseStats.spd ?? 1) : baseStats[stat as keyof CombatStats]
  const stage = stages[stat] ?? 0
  return applyStatStageToValue(base, stage)
}

const STAT_LABELS: Record<StatStageKey, string> = {
  atk: 'ATK',
  def: 'DEF',
  spAtk: 'SP.ATK',
  spDef: 'SP.DEF',
  spd: 'SPD',
  accuracy: 'ACC',
  evasion: 'EVA',
}

export function formatStatStageLine(stages: CombatStatStages): string[] {
  return (Object.entries(stages) as [StatStageKey, number][])
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${STAT_LABELS[k]} ${v > 0 ? '+' : ''}${v}`)
}

function adjustStage(
  stages: CombatStatStages,
  stat: StatStageKey,
  delta: number,
): CombatStatStages {
  return {
    ...stages,
    [stat]: clampStatStage((stages[stat] ?? 0) + delta),
  }
}

export type ApplyAbilityEffectsParams = {
  ability: AbilityDefinition
  attackerName: string
  userStages: CombatStatStages
  enemyStages: CombatStatStages
  defenderStatus: CombatStatusFlags
  attackerHp: number
  attackerMaxHp: number
  mastery: SupportMasteryModifiers
}

export function applyAbilityEffects(
  params: ApplyAbilityEffectsParams,
): {
  userStages: CombatStatStages
  enemyStages: CombatStatStages
  defenderStatus: CombatStatusFlags
  attackerHp: number
  logLines: string[]
} {
  let userStages = { ...params.userStages }
  let enemyStages = { ...params.enemyStages }
  let defenderStatus = { ...params.defenderStatus }
  let attackerHp = params.attackerHp
  const logLines: string[] = []
  const stageBonus = params.mastery.statStageBonus
  const statusBonus = params.mastery.statusChanceBonus

  for (const effect of params.ability.effects ?? []) {
    const result = applySingleEffect(
      effect,
      params.ability,
      params.attackerName,
      userStages,
      enemyStages,
      defenderStatus,
      attackerHp,
      params.attackerMaxHp,
      stageBonus,
      statusBonus,
      params.mastery.healBonusPercent,
    )
    userStages = result.userStages
    enemyStages = result.enemyStages
    defenderStatus = result.defenderStatus
    attackerHp = result.attackerHp
    logLines.push(...result.logLines)
  }

  return {
    userStages,
    enemyStages,
    defenderStatus,
    attackerHp,
    logLines,
  }
}

function applySingleEffect(
  effect: AbilityEffect,
  ability: AbilityDefinition,
  attackerName: string,
  userStages: CombatStatStages,
  enemyStages: CombatStatStages,
  defenderStatus: CombatStatusFlags,
  attackerHp: number,
  attackerMaxHp: number,
  stageBonus: number,
  statusBonus: number,
  healBonusPercent: number,
): {
  userStages: CombatStatStages
  enemyStages: CombatStatStages
  defenderStatus: CombatStatusFlags
  attackerHp: number
  logLines: string[]
} {
  const logLines: string[] = []
  const perkNote = (used: boolean) =>
    used ? ' (mastery perk improved the effect!)' : ''

  switch (effect.type) {
    case 'statBuff': {
      const target = effect.target ?? 'self'
      const stages = Math.max(1, effect.stages + stageBonus)
      if (target === 'self' || ability.target === 'self') {
        const next = adjustStage(userStages, effect.stat, stages)
        logLines.push(
          `${attackerName}'s ${STAT_LABELS[effect.stat]} rose by ${stages}!${perkNote(stageBonus > 0)}`,
        )
        return {
          userStages: next,
          enemyStages,
          defenderStatus,
          attackerHp,
          logLines,
        }
      }
      const next = adjustStage(enemyStages, effect.stat, stages)
      logLines.push(
        `Foe ${STAT_LABELS[effect.stat]} rose by ${stages}!`,
      )
      return {
        userStages,
        enemyStages: next,
        defenderStatus,
        attackerHp,
        logLines,
      }
    }
    case 'statDebuff': {
      const stages = Math.max(1, effect.stages + stageBonus)
      const next = adjustStage(enemyStages, effect.stat, -stages)
      logLines.push(
        `${attackerName}'s ${ability.name} lowered foe ${STAT_LABELS[effect.stat]} by ${stages}!${perkNote(stageBonus > 0)}`,
      )
      return {
        userStages,
        enemyStages: next,
        defenderStatus,
        attackerHp,
        logLines,
      }
    }
    case 'applyStatus': {
      const chance = Math.min(100, effect.chance + statusBonus)
      if (Math.random() * 100 < chance) {
        const next = { ...defenderStatus, [effect.status]: true }
        logLines.push(
          `${ability.name} inflicted ${effect.status} on the foe!${perkNote(statusBonus > 0)}`,
        )
        return {
          userStages,
          enemyStages,
          defenderStatus: next,
          attackerHp,
          logLines,
        }
      }
      logLines.push(`${ability.name} failed to inflict ${effect.status}.`)
      return { userStages, enemyStages, defenderStatus, attackerHp, logLines }
    }
    case 'heal': {
      const mult = 1 + healBonusPercent
      const heal = Math.max(
        1,
        Math.floor(attackerMaxHp * effect.percent * mult),
      )
      const nextHp = Math.min(attackerMaxHp, attackerHp + heal)
      logLines.push(
        `${ability.name} restored ${heal} HP for ${attackerName}!${perkNote(healBonusPercent > 0)}`,
      )
      return {
        userStages,
        enemyStages,
        defenderStatus,
        attackerHp: nextHp,
        logLines,
      }
    }
    default:
      return { userStages, enemyStages, defenderStatus, attackerHp, logLines }
  }
}

export function isStatusCategory(
  category: AbilityDefinition['category'],
): boolean {
  return category === 'status'
}

export function abilityDealsDamage(ability: AbilityDefinition): boolean {
  return ability.category !== 'status' && ability.power > 0
}
