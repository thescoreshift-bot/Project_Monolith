import { getAbility } from '../data/abilities'
import type { MapNode } from '../data/nodeMap'
import {
  getCouncilForRegion,
  getCouncilNodeId,
  type CouncilAiStyle,
  type RegionCouncil,
} from '../data/monolithCouncil'
import type { Enemy } from '../data/enemies'
import { REGIONS } from '../data/regions'
import { getTitleDefinition } from '../data/titles'
import { createCouncilCombatContext } from './combatContext'
import {
  aiStyleLabel,
  pickCouncilEnemyAbility,
  pickCouncilPlayerTargetIndex,
  type CouncilPlayerTarget,
} from './councilAi'
import {
  allCouncilEnemiesDefeated,
  applyCouncilFreeRecovery,
  applyCouncilFullRecovery,
  COUNCIL_FULL_HEAL_COST,
  spawnCouncilTrialEnemies,
  type CouncilGauntletProgress,
} from './councilGauntlet'
import {
  addGearIdToTrainerInventory,
  addItemToTrainerInventory,
  type TrainerInventory,
} from './inventorySystem'
import type { MonolithCouncilSaveState } from './monolithCouncilState'
import {
  ensureCouncilMapNode,
  getCouncilDefinitionOrThrow,
  isCouncilCompleted,
  isCouncilUnlocked,
  markCouncilUnlocked,
  syncCouncilUnlockFromBadges,
  syncRegionCouncilSaveEntries,
} from './monolithCouncilState'
import { countBadgesInRegion } from './regionTravel'
import type { PartyCreature } from './party'
import { addCoins, type RunCreature } from './progression'
import { rollEventGearDrop, rollShopGearOffers } from './gearSystem'
import { buildCombatStatsForCreature } from './badgeBonuses'

export type CouncilCombatSession = {
  enemies: Enemy[]
  aiStyle: CouncilAiStyle
  trialIndex: number
  fightNumber: number
}

export function applyCouncilMapState(
  nodes: MapNode[],
  states: Record<string, import('../data/nodeMap').NodeVisitState>,
  regionId: string,
  councilState: MonolithCouncilSaveState,
  earnedBadges: string[],
): {
  nodes: MapNode[]
  states: Record<string, import('../data/nodeMap').NodeVisitState>
} {
  const nodeId = getCouncilNodeId(regionId)
  const hadNode = nodes.some((n) => n.id === nodeId)
  const council = getCouncilForRegion(regionId)
  const badgeCount = countBadgesInRegion(regionId, earnedBadges)
  const councilUnlocked = isCouncilUnlocked(councilState, regionId, earnedBadges)
  const hasTrials = (council?.trials.length ?? 0) > 0
  const result = ensureCouncilMapNode(nodes, states, regionId, councilState, earnedBadges)
  const nodeInjected = !hadNode && result.nodes.some((n) => n.id === nodeId)

  if (import.meta.env.DEV) {
    console.log('Council map state applied', {
      currentRegionId: regionId,
      badgeCount,
      councilUnlocked,
      nodeInjected,
      hasTrials,
    })
  }

  return result
}

export function tryUnlockCouncilForRegion(
  councilState: MonolithCouncilSaveState,
  regionId: string,
  earnedBadges: string[],
): { state: MonolithCouncilSaveState; newlyUnlocked: boolean } {
  return syncCouncilUnlockFromBadges(councilState, regionId, earnedBadges)
}

export function buildCouncilCombatSession(
  council: RegionCouncil,
  trialIndex: number,
): CouncilCombatSession {
  const trial = council.trials[trialIndex]!
  return {
    enemies: spawnCouncilTrialEnemies(trial),
    aiStyle: trial.aiStyle,
    trialIndex,
    fightNumber: trialIndex + 1,
  }
}

export function createContextForCouncilFight(
  regionId: string,
  council: RegionCouncil,
  session: CouncilCombatSession,
  mapNode?: MapNode | null,
): ReturnType<typeof createCouncilCombatContext> {
  return createCouncilCombatContext({
    regionId,
    councilId: council.councilId,
    trialIndex: session.trialIndex,
    fightNumber: session.fightNumber,
    councilAiStyle: session.aiStyle,
    nodeId: getCouncilNodeId(regionId),
    mapNode: mapNode ?? {
      id: getCouncilNodeId(regionId),
      type: 'monolithCouncil',
      label: 'Monolith Council',
      layer: 0,
      column: 2,
      connectsTo: [],
    },
  })
}

export function pickPlayerTargetIndex(
  enemies: Enemy[],
  abilityId: string,
): number {
  const ability = getAbility(abilityId)
  return pickCouncilPlayerTargetIndex(enemies, ability)
}

export function buildCouncilPlayerTargets(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
  earnedBadges: string[],
  partyLevel: number,
  playerStatStages: Record<string, import('./combatEffects').CombatStatStages>,
): CouncilPlayerTarget[] {
  const targets: CouncilPlayerTarget[] = []
  if (starter.currentHp > 0) {
    const stats = buildCombatStatsForCreature(
      starter,
      earnedBadges,
      partyLevel,
      playerStatStages['starter'] ?? {},
    )
    targets.push({
      key: 'starter',
      name: starter.name,
      type: starter.type,
      currentHp: starter.currentHp,
      maxHp: starter.maxHp,
      stats,
    })
  }
  const helper = recruits.find((r) => r.id === activeHelperId)
  if (helper && helper.currentHp > 0) {
    const stats = buildCombatStatsForCreature(
      helper,
      earnedBadges,
      partyLevel,
      playerStatStages[helper.id] ?? {},
    )
    targets.push({
      key: helper.id,
      name: helper.name,
      type: helper.type,
      currentHp: helper.currentHp,
      maxHp: helper.maxHp,
      stats,
    })
  }
  return targets
}

export function pickCouncilEnemyMove(
  enemy: Enemy,
  aiStyle: CouncilAiStyle,
  playerTargets: CouncilPlayerTarget[],
  partner: Enemy | undefined,
): string {
  const partnerRatio =
    partner && partner.maxHp > 0 ? partner.currentHp / partner.maxHp : 1
  const selfRatio = enemy.maxHp > 0 ? enemy.currentHp / enemy.maxHp : 1
  return pickCouncilEnemyAbility(
    enemy,
    aiStyle,
    playerTargets,
    partnerRatio,
    selfRatio,
  )
}

export function councilBattleLabel(
  council: RegionCouncil,
  session: CouncilCombatSession,
): string {
  const trial = council.trials[session.trialIndex]
  return `Council ${session.fightNumber}/${council.trials.length} — ${trial?.name ?? 'Trial'} (${aiStyleLabel(session.aiStyle)})`
}

export function grantCouncilCompletionRewards(
  starter: RunCreature,
  council: RegionCouncil,
  inventory: TrainerInventory,
  seed: string,
): {
  starter: RunCreature
  inventory: TrainerInventory
  lines: string[]
} {
  const rewards = council.rewards
  let nextStarter = addCoins(starter, rewards.coins)
  let nextInv = addItemToTrainerInventory(
    inventory,
    'monolith-fragment',
    rewards.monolithFragments,
  )
  nextInv = addItemToTrainerInventory(nextInv, rewards.emblemItemId, 1)

  const lines = [
    `+${rewards.coins} coins`,
    `Monolith Fragment ×${rewards.monolithFragments}`,
    `${council.localName} Emblem obtained`,
    `Title earned: ${rewards.titleName}`,
  ]

  const gearOffers = rollShopGearOffers(council.regionId, {
    seed: `${seed}|council-rare`,
    playerLevel: nextStarter.level,
  })
  for (let i = 0; i < rewards.rareGearRollCount && i < gearOffers.length; i++) {
    const gearId = gearOffers[i]!
    nextInv = addGearIdToTrainerInventory(nextInv, gearId)
    lines.push(`Rare gear: ${gearId}`)
  }
  if (rewards.rareGearRollCount > gearOffers.length) {
    const fallback = rollEventGearDrop('rare')
    if (fallback) {
      nextInv = addGearIdToTrainerInventory(nextInv, fallback.id)
      lines.push(`Rare gear: ${fallback.id}`)
    }
  }

  const titleDef = getTitleDefinition(rewards.titleId)
  if (titleDef) {
    lines.push(`Title perk: ${titleDef.name}`)
  }

  return { starter: nextStarter, inventory: nextInv, lines }
}

export function startGauntletProgress(
  regionId: string,
  councilId: string,
): CouncilGauntletProgress {
  return { regionId, councilId, trialIndex: 0, fightsWon: 0 }
}

export function advanceGauntletProgress(
  progress: CouncilGauntletProgress,
): CouncilGauntletProgress {
  return {
    ...progress,
    trialIndex: progress.trialIndex + 1,
    fightsWon: progress.fightsWon + 1,
  }
}

export function isGauntletComplete(
  council: RegionCouncil,
  progress: CouncilGauntletProgress,
): boolean {
  return progress.trialIndex >= council.trials.length
}

export function completeCouncilForRegion(
  state: MonolithCouncilSaveState,
  regionId: string,
): MonolithCouncilSaveState {
  const next = {
    ...state,
    completedByRegion: { ...state.completedByRegion, [regionId]: true },
    activeGauntlet: null,
    councilScoutUnlocked: true,
    unlockedByRegion: { ...state.unlockedByRegion, [regionId]: true },
  }
  return { ...next, regionCouncils: syncRegionCouncilSaveEntries(next) }
}

export function getNextRegionAfterCouncil(
  regionId: string,
): string | undefined {
  const council = getCouncilForRegion(regionId)
  if (council?.rewards.unlocksNextRegionId) {
    return council.rewards.unlocksNextRegionId
  }
  const idx = REGIONS.findIndex((r) => r.id === regionId)
  if (idx >= 0 && idx < REGIONS.length - 1) {
    return REGIONS[idx + 1]!.id
  }
  return undefined
}

export {
  allCouncilEnemiesDefeated,
  applyCouncilFreeRecovery,
  applyCouncilFullRecovery,
  COUNCIL_FULL_HEAL_COST,
  getCouncilDefinitionOrThrow,
  isCouncilCompleted,
  markCouncilUnlocked,
}
