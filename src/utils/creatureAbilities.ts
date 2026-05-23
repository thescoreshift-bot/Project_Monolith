import type { RunCreature } from './progression'
import type { PartyCreature } from './party'

export const MAX_ACTIVE_ABILITIES = 4

export type CreatureWithAbilities = {
  abilityId?: string
  abilityIds?: string[]
  forgottenAbilityIds?: string[]
}

export function getActiveAbilityIds(creature: CreatureWithAbilities): string[] {
  if (creature.abilityIds && creature.abilityIds.length > 0) {
    return creature.abilityIds.slice(0, MAX_ACTIVE_ABILITIES)
  }
  if (creature.abilityId) return [creature.abilityId]
  return []
}

export function normalizeCreatureAbilities<T extends CreatureWithAbilities>(
  creature: T,
): T & { abilityIds: string[]; abilityId: string } {
  const ids = getActiveAbilityIds(creature)
  const abilityIds = ids.length > 0 ? ids : ['tackle']
  return {
    ...creature,
    abilityIds,
    abilityId: abilityIds[0],
  }
}

export function creatureHasAbility(
  creature: CreatureWithAbilities,
  abilityId: string,
): boolean {
  return getActiveAbilityIds(creature).includes(abilityId)
}

export function addActiveAbility<T extends CreatureWithAbilities>(
  creature: T,
  abilityId: string,
): T & { abilityIds: string[]; abilityId: string } {
  const normalized = normalizeCreatureAbilities(creature)
  if (normalized.abilityIds.includes(abilityId)) return normalized
  if (normalized.abilityIds.length >= MAX_ACTIVE_ABILITIES) return normalized
  const abilityIds = [...normalized.abilityIds, abilityId]
  const forgotten = (creature.forgottenAbilityIds ?? []).filter(
    (id) => id !== abilityId,
  )
  return {
    ...normalized,
    abilityIds,
    abilityId: abilityIds[0],
    forgottenAbilityIds: forgotten,
  }
}

export function replaceActiveAbility<T extends CreatureWithAbilities>(
  creature: T,
  oldAbilityId: string,
  newAbilityId: string,
): T & { abilityIds: string[]; abilityId: string } {
  const normalized = normalizeCreatureAbilities(creature)
  const abilityIds = normalized.abilityIds.map((id) =>
    id === oldAbilityId ? newAbilityId : id,
  )
  return {
    ...normalized,
    abilityIds,
    abilityId: abilityIds[0] ?? newAbilityId,
  }
}

export function forgetActiveAbility<T extends CreatureWithAbilities>(
  creature: T,
  abilityIdToForget: string,
  newAbilityId?: string,
): T & { abilityIds: string[]; abilityId: string } {
  const normalized = normalizeCreatureAbilities(creature)
  const forgotten = [
    ...(creature.forgottenAbilityIds ?? []),
    abilityIdToForget,
  ]
  let abilityIds = normalized.abilityIds.filter((id) => id !== abilityIdToForget)
  if (newAbilityId && !abilityIds.includes(newAbilityId)) {
    abilityIds = [...abilityIds, newAbilityId]
  }
  if (abilityIds.length === 0) abilityIds = [newAbilityId ?? 'tackle']
  return {
    ...normalized,
    abilityIds,
    abilityId: abilityIds[0],
    forgottenAbilityIds: forgotten,
  }
}

export type AbilityCarrier = RunCreature | PartyCreature
