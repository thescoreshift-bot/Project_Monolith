import type { EncounterKind } from '../data/enemies'
import {
  STARTER_CREATURE_ID,
  type EvolutionQueueEntry,
  type PerkDraftQueueEntry,
} from './creatureProgression'
import { getActiveCombatHelper } from './party'
import type { PartyCreature } from './party'
import { addXpToPartyCreature } from './party'
import {
  getCrossedEvolutionThresholdsFor,
} from './evolutionSystem'
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
  if (starterLevelsGained > 0) {
    queue.push({ creatureId: STARTER_CREATURE_ID, reason: 'levelUp' })
  }
  for (const r of recruitGains) {
    if (r.levelsGained > 0) {
      queue.push({ creatureId: r.id, reason: 'levelUp' })
    }
  }
  return queue
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
): BattleXpResult {
  const baseXp = getXpReward(encounterKind, regionId)
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

  for (const threshold of getCrossedEvolutionThresholdsFor(
    starterLevelBefore,
    nextStarter.level,
    nextStarter,
  )) {
    evolutionQueue.push({ creatureId: STARTER_CREATURE_ID, threshold })
  }

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

    for (const threshold of getCrossedEvolutionThresholdsFor(
      levelBefore,
      result.creature.level,
      result.creature,
    )) {
      evolutionQueue.push({ creatureId: recruit.id, threshold })
    }

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
