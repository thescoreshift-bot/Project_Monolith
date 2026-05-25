import type { CouncilTrial } from '../data/monolithCouncil'
import { spawnEnemy, type Enemy } from '../data/enemies'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type CouncilGauntletProgress = {
  regionId: string
  councilId: string
  trialIndex: number
  fightsWon: number
}

export function spawnCouncilTrialEnemies(trial: CouncilTrial): Enemy[] {
  return trial.trainers.map((slot, index) => {
    const base = spawnEnemy(slot.creatureTemplateId, slot.level, {
      encounterKind: 'council',
    })
    return {
      ...base,
      id: `${trial.id}-foe-${index}`,
      kind: 'trainer' as const,
      abilityIds: slot.abilityIds ?? base.abilityIds,
      companionTemplateId: slot.creatureTemplateId,
      name: slot.trainerName,
    }
  })
}

export function applyCouncilFreeRecovery(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
  percent = 0.2,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const healMember = <T extends { currentHp: number; maxHp: number }>(c: T): T => {
    if (c.currentHp <= 0) return c
    const gain = Math.max(1, Math.floor(c.maxHp * percent))
    return {
      ...c,
      currentHp: Math.min(c.maxHp, c.currentHp + gain),
    }
  }
  return {
    starter: healMember(starter),
    recruits: recruits.map((r) =>
      r.id === activeHelperId || activeHelperId == null
        ? healMember(r)
        : healMember(r),
    ),
  }
}

export function applyCouncilFullRecovery(
  starter: RunCreature,
  recruits: PartyCreature[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  return {
    starter: { ...starter, currentHp: starter.maxHp },
    recruits: recruits.map((r) => ({ ...r, currentHp: r.maxHp })),
  }
}

export function allCouncilEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.every((e) => e.currentHp <= 0)
}

export function getLivingCouncilEnemies(enemies: Enemy[]): Enemy[] {
  return enemies.filter((e) => e.currentHp > 0)
}

export function getDefaultLivingCouncilTargetIndex(enemies: Enemy[]): number {
  const index = enemies.findIndex((e) => e.currentHp > 0)
  return index >= 0 ? index : 0
}

/** @deprecated Use areAllCouncilEnemiesDefeated — kept for clarity in combat routing */
export function areAllCouncilEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.length > 0 && allCouncilEnemiesDefeated(enemies)
}

export function logCouncilEnemyDefeatCheck(
  label: string,
  enemies: Enemy[],
  extras?: {
    selectedTargetIndex?: number
    combatPhase?: string
    combatLocked?: boolean
    combatEnded?: boolean
  },
): void {
  if (!import.meta.env.DEV) return
  const living = getLivingCouncilEnemies(enemies)
  console.log('Council enemy defeated check', {
    label,
    enemies: enemies.map((e) => ({
      id: e.id,
      name: e.name,
      hp: e.currentHp,
      fainted: e.currentHp <= 0,
    })),
    livingEnemiesCount: living.length,
    selectedTargetIndex: extras?.selectedTargetIndex,
    combatPhase: extras?.combatPhase,
    combatResult: extras?.combatEnded ? 'ended' : undefined,
    combatLocked: extras?.combatLocked,
  })
  if (living.length === 1) {
    console.log('Council battle continues: one enemy remains.')
  }
  if (living.length === 0 && enemies.length > 0) {
    console.log('Council battle victory: all enemies defeated.')
  }
}

export const COUNCIL_FULL_HEAL_COST = 50
