import { getGearItem } from '../data/gearItems'
import { getItemDefinition } from '../data/items'
import type {
  EvolutionQueueEntry,
  PerkDraftQueueEntry,
} from './creatureProgression'
import type { TrainerInventory } from './inventorySystem'
import { addItemToTrainerInventory } from './inventorySystem'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { addCoins } from './progression'
import {
  applyFlatXpProgression,
  type CreatureLevelUpLine,
} from './battleRewards'

export type RewardProgressionResult = {
  levelUpLines: CreatureLevelUpLine[]
  perkDraftQueue: PerkDraftQueueEntry[]
  evolutionQueue: EvolutionQueueEntry[]
  starterLevelBefore: number
  recruitLevelsBefore: Record<string, number>
}
export type QuestRewardPayload = {
  coins?: number
  xpToParty?: number
  xpToActiveParty?: number
  consumables?: { itemId: string; quantity: number }[]
  gear?: string[]
  materials?: { itemId: string; quantity: number }[]
  keyItems?: { itemId: string; quantity: number }[]
}

export type RunRewardState = {
  starter: RunCreature
  recruits: PartyCreature[]
  inventory: TrainerInventory
}

function formatItemLine(itemId: string, quantity: number): string {
  const def = getItemDefinition(itemId)
  const name = def?.name ?? itemId
  return quantity > 1 ? `${name} x${quantity}` : name
}

export function formatQuestRewardSummary(reward: QuestRewardPayload): string {
  const parts: string[] = []
  if (reward.coins && reward.coins > 0) {
    parts.push(`${reward.coins} coins`)
  }
  if (reward.xpToActiveParty && reward.xpToActiveParty > 0) {
    parts.push(`${reward.xpToActiveParty} XP`)
  }
  if (reward.xpToParty && reward.xpToParty > 0) {
    parts.push(`${reward.xpToParty} party XP`)
  }
  for (const item of reward.consumables ?? []) {
    parts.push(formatItemLine(item.itemId, item.quantity))
  }
  for (const item of reward.materials ?? []) {
    parts.push(formatItemLine(item.itemId, item.quantity))
  }
  for (const item of reward.keyItems ?? []) {
    parts.push(formatItemLine(item.itemId, item.quantity))
  }
  for (const gearId of reward.gear ?? []) {
    const gear = getGearItem(gearId)
    parts.push(gear?.name ?? gearId)
  }
  return parts.length > 0 ? parts.join(', ') : 'No rewards'
}

export type RetentionRewardLike = {
  coins: number
  items: { itemId: string; quantity: number }[]
  gearIds: string[]
}

export function retentionRewardToPayload(
  grant: RetentionRewardLike,
): QuestRewardPayload {
  const consumables: { itemId: string; quantity: number }[] = []
  const materials: { itemId: string; quantity: number }[] = []
  const keyItems: { itemId: string; quantity: number }[] = []

  for (const item of grant.items) {
    const category = getItemDefinition(item.itemId)?.category
    if (category === 'material') {
      materials.push(item)
    } else if (category === 'keyItem') {
      keyItems.push(item)
    } else {
      consumables.push(item)
    }
  }

  return {
    coins: grant.coins > 0 ? grant.coins : undefined,
    consumables: consumables.length > 0 ? consumables : undefined,
    materials: materials.length > 0 ? materials : undefined,
    keyItems: keyItems.length > 0 ? keyItems : undefined,
    gear: grant.gearIds.length > 0 ? grant.gearIds : undefined,
  }
}

export type GrantQuestRewardResult = {
  runState: RunRewardState
  summary: string
  progression: RewardProgressionResult | null
}

/** Apply a quest/archive reward directly to run coins, XP, and trainer inventory. */
export function grantQuestReward(
  questReward: QuestRewardPayload,
  runState: RunRewardState,
): GrantQuestRewardResult {
  let starter = runState.starter
  let recruits = runState.recruits
  let inventory = runState.inventory
  let progression: RewardProgressionResult | null = null

  if (questReward.coins && questReward.coins > 0) {
    starter = addCoins(starter, questReward.coins)
  }

  const starterXp = questReward.xpToActiveParty ?? 0
  const recruitXp = questReward.xpToParty ?? 0
  if (starterXp > 0 || recruitXp > 0) {
    const xpResult = applyFlatXpProgression(starter, recruits, starterXp, recruitXp)
    starter = xpResult.starter
    recruits = xpResult.recruits
    progression = {
      levelUpLines: xpResult.levelUpLines,
      perkDraftQueue: xpResult.perkDraftQueue,
      evolutionQueue: xpResult.evolutionQueue,
      starterLevelBefore: xpResult.starterLevelBefore,
      recruitLevelsBefore: xpResult.recruitLevelsBefore,
    }
  }

  const itemGroups = [
    questReward.consumables,
    questReward.materials,
    questReward.keyItems,
  ]
  for (const group of itemGroups) {
    for (const item of group ?? []) {
      inventory = addItemToTrainerInventory(
        inventory,
        item.itemId,
        item.quantity,
      )
    }
  }
  for (const gearId of questReward.gear ?? []) {
    inventory = addItemToTrainerInventory(inventory, gearId, 1)
  }

  return {
    runState: { starter, recruits, inventory },
    summary: formatQuestRewardSummary(questReward),
    progression,
  }
}

export function hasRetentionGrantValue(grant: RetentionRewardLike): boolean {
  return (
    grant.coins > 0 || grant.items.length > 0 || grant.gearIds.length > 0
  )
}
