import type { PartyCreature } from './party'
import { getActiveCombatHelper } from './party'
import type { RunCreature } from './progression'
import type { BattleBuffs } from './badgeBonuses'

export type BattleBuffStat = 'atk' | 'spAtk' | 'def' | 'spd'

export type TemporaryBattleBuff = {
  id: string
  stat: BattleBuffStat
  amount: number
  target: 'activeParty' | 'allParty'
  duration: 'nextBattle'
}

export type CreatureWithBattleBuffs = {
  battleBuffs?: BattleBuffs
  temporaryBattleBuffs?: TemporaryBattleBuff[]
}

export function defaultBattleBuffs(): BattleBuffs {
  return { atk: 0, spAtk: 0, def: 0, spd: 0 }
}

export function addTemporaryBattleBuff<T extends CreatureWithBattleBuffs>(
  creature: T,
  buff: TemporaryBattleBuff,
): T {
  const list = creature.temporaryBattleBuffs ?? []
  const withoutDuplicate = list.filter((b) => b.id !== buff.id)
  return {
    ...creature,
    battleBuffs: creature.battleBuffs ?? defaultBattleBuffs(),
    temporaryBattleBuffs: [...withoutDuplicate, buff],
  }
}

export function getTemporaryBuffTotals(
  creature: CreatureWithBattleBuffs,
): BattleBuffs {
  const totals = defaultBattleBuffs()
  for (const buff of creature.temporaryBattleBuffs ?? []) {
    if (buff.duration !== 'nextBattle') continue
    if (buff.stat === 'atk') totals.atk += buff.amount
    else if (buff.stat === 'spAtk') totals.spAtk += buff.amount
    else if (buff.stat === 'def') totals.def += buff.amount
    else if (buff.stat === 'spd') totals.spd += buff.amount
  }
  return totals
}

export function getCombinedBattleBuffs(
  creature: CreatureWithBattleBuffs,
): BattleBuffs {
  const stored = creature.battleBuffs ?? defaultBattleBuffs()
  const temp = getTemporaryBuffTotals(creature)
  return {
    atk: stored.atk + temp.atk,
    spAtk: stored.spAtk + temp.spAtk,
    def: stored.def + temp.def,
    spd: stored.spd + temp.spd,
  }
}

export function clearCreatureBattleBuffs<T extends CreatureWithBattleBuffs>(
  creature: T,
): T {
  return {
    ...creature,
    battleBuffs: defaultBattleBuffs(),
    temporaryBattleBuffs: [],
  }
}

export function clearPartyBattleBuffs(
  starter: RunCreature,
  recruits: PartyCreature[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  return {
    starter: clearCreatureBattleBuffs(starter),
    recruits: recruits.map((r) => clearCreatureBattleBuffs(r)),
  }
}

export function applyBattleTonicToActiveParty(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const buff: TemporaryBattleBuff = {
    id: 'battle-tonic',
    stat: 'atk',
    amount: 5,
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

export function applyGuardDustToActiveParty(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const buff: TemporaryBattleBuff = {
    id: 'guard-dust',
    stat: 'def',
    amount: 5,
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

export function applySpeedMintToActiveParty(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const buff: TemporaryBattleBuff = {
    id: 'speed-mint',
    stat: 'spd',
    amount: 5,
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

export function applyFocusCharmToActiveParty(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const buff: TemporaryBattleBuff = {
    id: 'focus-charm',
    stat: 'spAtk',
    amount: 5,
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

export function healAllPartyBy(
  starter: RunCreature,
  recruits: PartyCreature[],
  amount: number,
): { starter: RunCreature; recruits: PartyCreature[] } {
  return {
    starter: {
      ...starter,
      currentHp: Math.min(starter.maxHp, starter.currentHp + amount),
    },
    recruits: recruits.map((r) => ({
      ...r,
      currentHp: Math.min(r.maxHp, r.currentHp + amount),
    })),
  }
}
