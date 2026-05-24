import { clearPartyBattleBuffs } from './battleBuffs'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export const REVIVE_FAINTED_COST = 25

export function getPartyCreatureCount(recruits: PartyCreature[]): number {
  return 1 + recruits.length
}

export function healEntirePartyCost(recruits: PartyCreature[]): number {
  return 15 + 5 * getPartyCreatureCount(recruits)
}

export function fullRecoveryCost(recruits: PartyCreature[]): number {
  return 40 + 10 * getPartyCreatureCount(recruits)
}

export type PartyMemberRef =
  | { kind: 'starter' }
  | { kind: 'recruit'; id: string }

export type PartyMemberStatus = {
  ref: PartyMemberRef
  name: string
  level: number
  currentHp: number
  maxHp: number
  fainted: boolean
  roleLabel: string
}

export function listPartyMembers(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): PartyMemberStatus[] {
  const members: PartyMemberStatus[] = [
    {
      ref: { kind: 'starter' },
      name: starter.name,
      level: starter.level,
      currentHp: starter.currentHp,
      maxHp: starter.maxHp,
      fainted: starter.currentHp <= 0,
      roleLabel: 'Active starter',
    },
  ]
  for (const recruit of recruits) {
    members.push({
      ref: { kind: 'recruit', id: recruit.id },
      name: recruit.name,
      level: recruit.level,
      currentHp: recruit.currentHp,
      maxHp: recruit.maxHp,
      fainted: recruit.currentHp <= 0,
      roleLabel:
        recruit.id === activeHelperId ? 'Active helper' : 'Bench recruit',
    })
  }
  return members
}

export function isPartyFullyHealthy(
  starter: RunCreature,
  recruits: PartyCreature[],
): boolean {
  if (starter.currentHp <= 0) return false
  if (starter.currentHp < starter.maxHp) return false
  return recruits.every((r) => r.currentHp > 0 && r.currentHp >= r.maxHp)
}

export function hasHealableNonFainted(
  starter: RunCreature,
  recruits: PartyCreature[],
): boolean {
  if (starter.currentHp > 0 && starter.currentHp < starter.maxHp) return true
  return recruits.some((r) => r.currentHp > 0 && r.currentHp < r.maxHp)
}

export function getFaintedMembers(
  starter: RunCreature,
  recruits: PartyCreature[],
): PartyMemberStatus[] {
  return listPartyMembers(starter, recruits, null).filter((m) => m.fainted)
}

export function healNonFaintedParty(
  starter: RunCreature,
  recruits: PartyCreature[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  return {
    starter: {
      ...starter,
      currentHp:
        starter.currentHp <= 0
          ? starter.currentHp
          : Math.min(starter.maxHp, starter.maxHp),
    },
    recruits: recruits.map((r) => ({
      ...r,
      currentHp:
        r.currentHp <= 0 ? r.currentHp : Math.min(r.maxHp, r.maxHp),
    })),
  }
}

export function revivePartyMember(
  starter: RunCreature,
  recruits: PartyCreature[],
  target: PartyMemberRef,
): { starter: RunCreature; recruits: PartyCreature[] } {
  const reviveHp = (max: number) => Math.max(1, Math.floor(max * 0.5))
  if (target.kind === 'starter') {
    return {
      starter: {
        ...starter,
        currentHp: reviveHp(starter.maxHp),
      },
      recruits,
    }
  }
  return {
    starter,
    recruits: recruits.map((r) =>
      r.id === target.id
        ? { ...r, currentHp: reviveHp(r.maxHp) }
        : r,
    ),
  }
}

export function fullPartyRecovery(
  starter: RunCreature,
  recruits: PartyCreature[],
): { starter: RunCreature; recruits: PartyCreature[] } {
  const healed = {
    starter: { ...starter, currentHp: starter.maxHp },
    recruits: recruits.map((r) => ({ ...r, currentHp: r.maxHp })),
  }
  return clearPartyBattleBuffs(healed.starter, healed.recruits)
}

export function spendCoins(creature: RunCreature, amount: number): RunCreature {
  return {
    ...creature,
    coins: Math.max(0, creature.coins - amount),
  }
}
