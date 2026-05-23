import type {
  AbilityMasteryPerkQueueEntry,
  AbilityTransformQueueEntry,
} from './abilityMastery'
import { getMovesLearnedBetweenLevels } from '../data/learnsets'
import type { ElementType } from '../data/starters'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { STARTER_CREATURE_ID } from './creatureProgression'
import { creatureHasAbility } from './creatureAbilities'

export type PostBattleQueueEvent =
  | { type: 'perkDraft'; creatureId: string }
  | { type: 'moveLearn'; creatureId: string; abilityId: string }
  | { type: 'evolution'; creatureId: string; threshold: number }
  | { type: 'abilityMasteryPerk'; creatureId: string; abilityId: string; rank: number }
  | {
      type: 'abilityTransform'
      creatureId: string
      abilityId: string
      previousAbilityId: string
      rank: 5 | 10
      path: import('../data/abilityMasteryPerks').MasteryPathTag
      newAbilityId: string
      newName: string
      description: string
    }

export function buildMoveLearnEvents(
  creatureId: string,
  starterTypeId: string | undefined,
  elementType: ElementType,
  levelBefore: number,
  levelAfter: number,
  creature: { abilityIds?: string[]; abilityId?: string },
): PostBattleQueueEvent[] {
  const moves = getMovesLearnedBetweenLevels(
    starterTypeId,
    elementType,
    levelBefore,
    levelAfter,
  )
  return moves
    .filter((abilityId) => !creatureHasAbility(creature, abilityId))
    .map((abilityId) => ({ type: 'moveLearn' as const, creatureId, abilityId }))
}

export function collectMasteryEventsFromCreature(
  creatureId: string,
  pendingPerk: AbilityMasteryPerkQueueEntry[],
  pendingTransform: AbilityTransformQueueEntry[],
): PostBattleQueueEvent[] {
  const events: PostBattleQueueEvent[] = []
  for (const entry of pendingPerk) {
    if (entry.creatureId === creatureId) {
      events.push({
        type: 'abilityMasteryPerk',
        creatureId,
        abilityId: entry.abilityId,
        rank: entry.rank,
      })
    }
  }
  for (const entry of pendingTransform) {
    if (entry.creatureId === creatureId) {
      events.push({
        type: 'abilityTransform',
        creatureId: entry.creatureId,
        abilityId: entry.abilityId,
        previousAbilityId: entry.previousAbilityId,
        rank: entry.rank,
        path: entry.path,
        newAbilityId: entry.newAbilityId,
        newName: entry.newName,
        description: entry.description,
      })
    }
  }
  return events
}

export function buildPostBattleQueue(params: {
  perkDraftQueue: { creatureId: string }[]
  evolutionQueue: { creatureId: string; threshold: number }[]
  starter: RunCreature
  recruits: PartyCreature[]
  levelBeforeStarter: number
  recruitLevelsBefore: Record<string, number>
  masteryPerkQueue: AbilityMasteryPerkQueueEntry[]
  masteryTransformQueue: AbilityTransformQueueEntry[]
}): PostBattleQueueEvent[] {
  const queue: PostBattleQueueEvent[] = []

  for (const entry of params.masteryPerkQueue) {
    if (entry.creatureId) {
      queue.push({
        type: 'abilityMasteryPerk',
        creatureId: entry.creatureId,
        abilityId: entry.abilityId,
        rank: entry.rank,
      })
    }
  }

  for (const entry of params.masteryTransformQueue) {
    if (entry.creatureId) {
      queue.push({
        type: 'abilityTransform',
        creatureId: entry.creatureId,
        abilityId: entry.abilityId,
        previousAbilityId: entry.previousAbilityId,
        rank: entry.rank,
        path: entry.path,
        newAbilityId: entry.newAbilityId,
        newName: entry.newName,
        description: entry.description,
      })
    }
  }

  for (const p of params.perkDraftQueue) {
    queue.push({ type: 'perkDraft', creatureId: p.creatureId })
  }

  const starterMoves = buildMoveLearnEvents(
    STARTER_CREATURE_ID,
    params.starter.starterTypeId,
    params.starter.type,
    params.levelBeforeStarter,
    params.starter.level,
    params.starter,
  )
  queue.push(...starterMoves)

  for (const recruit of params.recruits) {
    const before = params.recruitLevelsBefore[recruit.id] ?? recruit.level
    queue.push(
      ...buildMoveLearnEvents(
        recruit.id,
        undefined,
        recruit.type,
        before,
        recruit.level,
        recruit,
      ),
    )
  }

  for (const e of params.evolutionQueue) {
    queue.push({
      type: 'evolution',
      creatureId: e.creatureId,
      threshold: e.threshold,
    })
  }

  return queue
}

export function peekQueueEvent(
  queue: PostBattleQueueEvent[],
): PostBattleQueueEvent | undefined {
  return queue[0]
}

export function shiftQueue(
  queue: PostBattleQueueEvent[],
): PostBattleQueueEvent[] {
  return queue.slice(1)
}
