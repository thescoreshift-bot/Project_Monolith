import { applyDamage } from './combat'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type CombatDamageTargetKey = 'starter' | string

export type ApplyCombatDamageResult = {
  starter: RunCreature
  recruits: PartyCreature[]
  hpBefore: number
  hpAfter: number
  appliedDamage: number
  targetName: string
}

/** Apply damage to starter or helper in combat; clamps HP to [0, maxHp]. */
export function applyDamageToCombatCreature(
  targetKey: CombatDamageTargetKey,
  damage: number,
  starter: RunCreature,
  recruits: PartyCreature[],
): ApplyCombatDamageResult {
  const raw = Math.max(0, Math.floor(Number.isFinite(damage) ? damage : 0))

  if (targetKey === 'starter') {
    const hpBefore =
      typeof starter.currentHp === 'number' && Number.isFinite(starter.currentHp)
        ? starter.currentHp
        : 0
    const hpAfter = applyDamage(hpBefore, raw)
    const appliedDamage = Math.max(0, hpBefore - hpAfter)
    return {
      starter: { ...starter, currentHp: hpAfter },
      recruits,
      hpBefore,
      hpAfter,
      appliedDamage,
      targetName: starter.name,
    }
  }

  const recruit = recruits.find((r) => r.id === targetKey)
  if (!recruit) {
    return {
      starter,
      recruits,
      hpBefore: 0,
      hpAfter: 0,
      appliedDamage: 0,
      targetName: targetKey,
    }
  }

  const hpBefore =
    typeof recruit.currentHp === 'number' && Number.isFinite(recruit.currentHp)
      ? recruit.currentHp
      : 0
  const hpAfter = applyDamage(hpBefore, raw)
  const appliedDamage = Math.max(0, hpBefore - hpAfter)
  const nextRecruits = recruits.map((r) =>
    r.id === targetKey ? { ...r, currentHp: hpAfter } : r,
  )

  return {
    starter,
    recruits: nextRecruits,
    hpBefore,
    hpAfter,
    appliedDamage,
    targetName: recruit.name,
  }
}

export type EnemyDamageDebugPayload = {
  enemyName: string
  abilityName: string
  targetName: string
  targetId: string
  hpBefore: number
  damage: number
  hpAfter: number
  combatPhase: string
}

export function logEnemyDamageApplied(payload: EnemyDamageDebugPayload): void {
  console.log('Enemy damage applied', payload)
  if (payload.damage > 0 && payload.hpBefore === payload.hpAfter) {
    console.warn('Damage was logged but HP did not change', payload)
  }
}
