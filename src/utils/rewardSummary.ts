import { getAbility, getAbilityDisplayName } from '../data/abilities'
import { getMasteryEntry, getRankLabel } from './abilityMastery'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import type { PostBattleQueueEvent } from './postBattleQueue'

export type MasteryRewardLine = {
  creatureName: string
  abilityName: string
  xpGained: number
  rankUp: boolean
  newRank?: number
  rankLabel?: string
}

export type PendingChoiceSummary = {
  label: string
  count: number
}

function diffCreatureMastery(
  before: RunCreature | PartyCreature,
  after: RunCreature | PartyCreature,
  creatureName: string,
): MasteryRewardLine[] {
  const lines: MasteryRewardLine[] = []
  const abilityIds = new Set([
    ...Object.keys(before.abilityMastery ?? {}),
    ...Object.keys(after.abilityMastery ?? {}),
  ])

  for (const abilityId of abilityIds) {
    const prev = getMasteryEntry(before, abilityId)
    const next = getMasteryEntry(after, abilityId)
    const rankUp = next.rank > prev.rank
    const xpGained = rankUp ? 0 : Math.max(0, next.xp - prev.xp)
    if (xpGained <= 0 && !rankUp) continue

    const ability = getAbility(abilityId)
    lines.push({
      creatureName,
      abilityName: getAbilityDisplayName(ability),
      xpGained,
      rankUp,
      newRank: rankUp ? next.rank : undefined,
      rankLabel: rankUp ? getRankLabel(next.rank) : undefined,
    })
  }

  return lines
}

export function buildMasteryRewardLines(
  starterBefore: RunCreature,
  starterAfter: RunCreature,
  recruitsBefore: PartyCreature[],
  recruitsAfter: PartyCreature[],
): MasteryRewardLine[] {
  const lines = diffCreatureMastery(
    starterBefore,
    starterAfter,
    starterAfter.name,
  )

  for (const after of recruitsAfter) {
    const before = recruitsBefore.find((r) => r.id === after.id)
    if (before) {
      lines.push(...diffCreatureMastery(before, after, after.name))
    }
  }

  return lines
}

export function summarizePostBattleQueue(
  queue: PostBattleQueueEvent[],
): PendingChoiceSummary[] {
  const counts: Record<string, number> = {}

  for (const event of queue) {
    let key: string
    switch (event.type) {
      case 'perkDraft':
        key = 'Creature perk drafts'
        break
      case 'moveLearn':
        key = 'Move learning'
        break
      case 'evolution':
        key = 'Evolutions'
        break
      case 'abilityMasteryPerk':
        key = 'Ability mastery perks'
        break
      case 'abilityTransform':
        key = 'Ability transformations'
        break
      default:
        key = 'Pending choices'
    }
    counts[key] = (counts[key] ?? 0) + 1
  }

  return Object.entries(counts).map(([label, count]) => ({ label, count }))
}
