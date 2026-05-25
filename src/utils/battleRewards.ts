import type { EncounterKind } from '../data/enemies'
import {
  STARTER_CREATURE_ID,
  type EvolutionQueueEntry,
  type PerkDraftQueueEntry,
} from './creatureProgression'
import { getActiveCombatHelper } from './party'
import type { PartyCreature } from './party'
import { addXpToPartyCreature } from './party'
import { collectEvolutionThresholdsAfterXp } from './evolutionSystem'
import { addXp, type RunCreature } from './progression'
import { getXpReward } from './rewards'

export type CreatureXpGainLine = {
  name: string
  xpGained: number
  note?: string
}

export type CreatureLevelUpLine = {
  name: string
  newLevel: number
}

export type BattleXpResult = {
  starter: RunCreature
  recruits: PartyCreature[]
  xpLines: CreatureXpGainLine[]
  levelUpLines: CreatureLevelUpLine[]
  perkDraftQueue: PerkDraftQueueEntry[]
  evolutionQueue: EvolutionQueueEntry[]
}

function buildPerkDraftQueue(
  starterLevelsGained: number,
  recruitGains: { id: string; levelsGained: number }[],
): PerkDraftQueueEntry[] {
  const queue: PerkDraftQueueEntry[] = []
  for (let i = 0; i < starterLevelsGained; i++) {
    queue.push({ creatureId: STARTER_CREATURE_ID, reason: 'levelUp' })
  }
  for (const r of recruitGains) {
    for (let i = 0; i < r.levelsGained; i++) {
      queue.push({ creatureId: r.id, reason: 'levelUp' })
    }
  }
  return queue
}

function appendEvolutionThresholds(
  queue: EvolutionQueueEntry[],
  creatureId: string,
  levelBefore: number,
  creatureAfter: RunCreature | PartyCreature,
): void {
  const existing = new Set(
    queue
      .filter((e) => e.creatureId === creatureId)
      .map((e) => e.threshold),
  )
  for (const threshold of collectEvolutionThresholdsAfterXp(
    levelBefore,
    creatureAfter.level,
    creatureAfter,
  )) {
    if (!existing.has(threshold)) {
      existing.add(threshold)
      queue.push({ creatureId, threshold })
    }
  }
}

export type DistributeBattleXpOptions = {
  /** Multiply region-scaled base XP (Council gauntlet scaling). */
  xpMultiplier?: number
  /** Replace base XP entirely (after region scale if encounter kind used). */
  xpOverride?: number
}

export function distributeBattleXp(
  encounterKind: EncounterKind,
  regionId: string,
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
  preReviveHp: { starterHp: number; helperHp: number | null },
  starterLevelBefore: number,
  recruitLevelsBefore: Record<string, number>,
  options?: DistributeBattleXpOptions,
): BattleXpResult {
  const rawBase =
    options?.xpOverride ?? getXpReward(encounterKind, regionId)
  const baseXp = Math.max(
    1,
    Math.floor(rawBase * (options?.xpMultiplier ?? 1)),
  )
  const helper = getActiveCombatHelper(recruits, activeHelperId)
  const xpLines: CreatureXpGainLine[] = []
  const levelUpLines: CreatureLevelUpLine[] = []
  const evolutionQueue: EvolutionQueueEntry[] = []
  const recruitGains: { id: string; levelsGained: number }[] = []

  const starterMult = preReviveHp.starterHp <= 0 ? 0.5 : 1
  const starterXp = Math.floor(baseXp * starterMult)
  const starterResult = addXp(starter, starterXp)
  let nextStarter = starterResult.creature
  xpLines.push({
    name: nextStarter.name,
    xpGained: starterXp,
    note: starterMult < 1 ? 'fainted' : undefined,
  })
  if (starterResult.leveledUp) {
    levelUpLines.push({ name: nextStarter.name, newLevel: nextStarter.level })
  }

  appendEvolutionThresholds(
    evolutionQueue,
    STARTER_CREATURE_ID,
    starterLevelBefore,
    nextStarter,
  )

  const nextRecruits = recruits.map((recruit) => {
    const isHelper = helper?.id === recruit.id
    let mult: number
    let note: string | undefined

    if (isHelper) {
      const helperHp = preReviveHp.helperHp ?? recruit.currentHp
      mult = helperHp <= 0 ? 0.5 : 1
      if (mult < 1) note = 'fainted'
    } else {
      mult = 0.25
      note = 'bench bonus'
    }

    const levelBefore = recruitLevelsBefore[recruit.id] ?? recruit.level
    const xp = Math.floor(baseXp * mult)
    const result = addXpToPartyCreature(recruit, xp)
    xpLines.push({ name: recruit.name, xpGained: xp, note })
    if (result.leveledUp) {
      levelUpLines.push({ name: recruit.name, newLevel: result.creature.level })
    }
    recruitGains.push({ id: recruit.id, levelsGained: result.levelsGained })

    appendEvolutionThresholds(
      evolutionQueue,
      recruit.id,
      levelBefore,
      result.creature,
    )

    return result.creature
  })

  const perkDraftQueue = buildPerkDraftQueue(
    starterResult.levelsGained,
    recruitGains,
  )

  return {
    starter: nextStarter,
    recruits: nextRecruits,
    xpLines,
    levelUpLines,
    perkDraftQueue,
    evolutionQueue,
  }
}
