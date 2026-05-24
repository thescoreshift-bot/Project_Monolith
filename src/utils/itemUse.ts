import { getItemDefinition } from '../data/items'
import type { PartyCreature } from './party'
import { getActiveCombatHelper } from './party'
import type { RunCreature } from './progression'
import {
  addTemporaryBattleBuff,
  type TemporaryBattleBuff,
} from './battleBuffs'
import {
  findInventoryItem,
  removeInventoryItemByInstanceId,
  type TrainerInventory,
} from './inventorySystem'
import { STARTER_CREATURE_ID } from './creatureProgression'

export type ItemUseTarget = 'party' | typeof STARTER_CREATURE_ID | string

export type ItemUseResult = {
  ok: boolean
  message: string
  starter?: RunCreature
  recruits?: PartyCreature[]
  inventory?: TrainerInventory
}

function creatureHasBuff(
  creature: { temporaryBattleBuffs?: TemporaryBattleBuff[] },
  buffId: string,
): boolean {
  return (creature.temporaryBattleBuffs ?? []).some((b) => b.id === buffId)
}

export function canUseInventoryItem(
  instanceId: string,
  inventory: TrainerInventory,
  starter: RunCreature,
  recruits: PartyCreature[],
  targetCreatureId?: string,
): { ok: boolean; reason?: string } {
  const entry = findInventoryItem(inventory, instanceId)
  if (!entry) return { ok: false, reason: 'Item not found.' }
  const def = getItemDefinition(entry.itemId)
  if (!def?.useEffect) return { ok: false, reason: 'This item cannot be used.' }

  const effect = def.useEffect
  if (effect.type === 'healParty') {
    if (partyAllFull(starter, recruits)) {
      return { ok: false, reason: 'Party is already at full HP.' }
    }
    return { ok: true }
  }
  if (effect.type === 'healCreature') {
    const target = resolveTarget(starter, recruits, targetCreatureId)
    if (!target) return { ok: false, reason: 'Choose a creature to heal.' }
    if (target.currentHp <= 0) {
      return { ok: false, reason: 'Cannot heal a fainted creature. Use Revival Herb.' }
    }
    if (target.currentHp >= target.maxHp) {
      return { ok: false, reason: `${target.name} is already at full HP.` }
    }
    return { ok: true }
  }
  if (effect.type === 'revive') {
    const target = resolveTarget(starter, recruits, targetCreatureId)
    if (!target) return { ok: false, reason: 'Choose a fainted creature.' }
    if (target.currentHp > 0) {
      return { ok: false, reason: `${target.name} is not fainted.` }
    }
    return { ok: true }
  }
  if (effect.type === 'battleBuff') {
    if (
      creatureHasBuff(starter, effect.buffId) ||
      recruits.some((r) => creatureHasBuff(r, effect.buffId))
    ) {
      return {
        ok: false,
        reason: 'That battle buff is already active for your party.',
      }
    }
    return { ok: true }
  }
  return { ok: false, reason: 'Unknown item effect.' }
}

function partyAllFull(starter: RunCreature, recruits: PartyCreature[]): boolean {
  if (starter.currentHp < starter.maxHp) return false
  return recruits.every((r) => r.currentHp >= r.maxHp)
}

function resolveTarget(
  starter: RunCreature,
  recruits: PartyCreature[],
  targetCreatureId?: string,
): (RunCreature | PartyCreature) | null {
  if (!targetCreatureId || targetCreatureId === 'party') return null
  if (targetCreatureId === STARTER_CREATURE_ID) return starter
  return recruits.find((r) => r.id === targetCreatureId) ?? null
}

function applyBattleBuffToActiveParty(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
  effect: Extract<
    import('../data/items').ItemUseEffect,
    { type: 'battleBuff' }
  >,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const buff: TemporaryBattleBuff = {
    id: effect.buffId,
    stat: effect.stat,
    amount: effect.amount,
    target: 'activeParty',
    duration: 'nextBattle',
  }
  let nextStarter = addTemporaryBattleBuff(starter, buff)
  const helper = getActiveCombatHelper(recruits, activeHelperId)
  const nextRecruits = helper
    ? recruits.map((r) =>
        r.id === helper.id ? addTemporaryBattleBuff(r, buff) : r,
      )
    : recruits
  return { starter: nextStarter, recruits: nextRecruits }
}

export function useInventoryItem(params: {
  instanceId: string
  inventory: TrainerInventory
  starter: RunCreature
  recruits: PartyCreature[]
  activeHelperId: string | null
  targetCreatureId?: string
}): ItemUseResult {
  const check = canUseInventoryItem(
    params.instanceId,
    params.inventory,
    params.starter,
    params.recruits,
    params.targetCreatureId,
  )
  if (!check.ok) {
    return { ok: false, message: check.reason ?? 'Cannot use item.' }
  }

  const entry = findInventoryItem(params.inventory, params.instanceId)!
  const def = getItemDefinition(entry.itemId)!
  const effect = def.useEffect!

  let starter = params.starter
  let recruits = params.recruits
  let message = ''

  if (effect.type === 'healParty') {
    starter = {
      ...starter,
      currentHp: Math.min(starter.maxHp, starter.currentHp + effect.amount),
    }
    recruits = recruits.map((r) => ({
      ...r,
      currentHp: Math.min(r.maxHp, r.currentHp + effect.amount),
    }))
    message = `Used ${def.name}. Party healed ${effect.amount} HP.`
  } else if (effect.type === 'healCreature') {
    const target = resolveTarget(starter, recruits, params.targetCreatureId)
    if (!target) {
      return { ok: false, message: 'Choose a creature to heal.' }
    }
    const before = target.currentHp
    const healed = Math.min(target.maxHp, before + effect.amount)
    if (params.targetCreatureId === STARTER_CREATURE_ID) {
      starter = { ...starter, currentHp: healed }
    } else {
      recruits = recruits.map((r) =>
        r.id === params.targetCreatureId ? { ...r, currentHp: healed } : r,
      )
    }
    message = `Used ${def.name}. ${target.name} healed ${healed - before} HP (${before} → ${healed}).`
  } else if (effect.type === 'revive') {
    const target = resolveTarget(starter, recruits, params.targetCreatureId)
    if (!target) {
      return { ok: false, message: 'Choose a fainted creature.' }
    }
    const revivedHp = Math.max(1, Math.floor(target.maxHp * effect.hpPercent))
    if (params.targetCreatureId === STARTER_CREATURE_ID) {
      starter = { ...starter, currentHp: revivedHp }
    } else {
      recruits = recruits.map((r) =>
        r.id === params.targetCreatureId ? { ...r, currentHp: revivedHp } : r,
      )
    }
    message = `Used ${def.name}. ${target.name} revived to ${revivedHp} HP.`
  } else if (effect.type === 'battleBuff') {
    const buffed = applyBattleBuffToActiveParty(
      starter,
      recruits,
      params.activeHelperId,
      effect,
    )
    starter = buffed.starter
    recruits = buffed.recruits
    message = `Used ${def.name}. Active party will gain +${effect.amount} ${effect.stat.toUpperCase()} next combat.`
  }

  const inventory = removeInventoryItemByInstanceId(
    params.inventory,
    params.instanceId,
    1,
  )

  return {
    ok: true,
    message,
    starter,
    recruits,
    inventory,
  }
}

export function itemRequiresTarget(instanceId: string, inventory: TrainerInventory): boolean {
  const entry = findInventoryItem(inventory, instanceId)
  if (!entry) return false
  const def = getItemDefinition(entry.itemId)
  if (!def?.useEffect) return false
  return (
    def.useEffect.type === 'healCreature' || def.useEffect.type === 'revive'
  )
}
