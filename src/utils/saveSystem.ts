import type { MapNode, NodeVisitState } from '../data/nodeMap'
import { getRegion, normalizeRegionId } from '../data/regions'
import { STARTERS } from '../data/starters'
import {
  legacyEvolutionThresholdsToQueue,
  legacyPerkDraftCountToQueue,
  type EvolutionQueueEntry,
  type PerkDraftQueueEntry,
} from './creatureProgression'
import type { AbilityMasteryPerkQueueEntry } from './abilityMastery'

/** @deprecated alias */
export type AbilityUpgradeQueueEntry = AbilityMasteryPerkQueueEntry
import { ensureAbilityMastery } from './abilityMastery'
import { normalizeRunCreature } from './evolutionSystem'
import {
  migrateLegacyGearInventory,
  normalizeTrainerInventory,
  type TrainerInventory,
} from './inventorySystem'
import { normalizePartyCreature, type PartyCreature } from './party'
import type { RunCreature } from './progression'
import {
  normalizeQuestState,
  type QuestState,
} from './questSystem'

const LEGACY_SAVE_KEY = 'project-monolith-run'
export const SAVE_VERSION = 7

export type SaveSlotId = 1 | 2

export const SAVE_SLOT_IDS: SaveSlotId[] = [1, 2]

const LOCAL_SLOT_KEYS: Record<SaveSlotId, string> = {
  1: 'project-monolith-run-slot-1',
  2: 'project-monolith-run-slot-2',
}

export type MonolithSaveEnvelope = {
  saveVersion: number
  slotId: SaveSlotId
  lastPlayed: string
  saveName?: string
  data: RunSaveData
}

export type SaveSlotSummary = {
  slotId: SaveSlotId
  isEmpty: boolean
  saveName?: string
  creatureName?: string
  level?: number
  regionId?: string
  regionName?: string
  badgeCount?: number
  partySize?: number
  coins?: number
  lastPlayed?: string
}

function getLocalSlotKey(slotId: SaveSlotId): string {
  return LOCAL_SLOT_KEYS[slotId]
}

function migrateLegacySaveIfNeeded(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_SAVE_KEY)
    if (!legacy) return
    if (!localStorage.getItem(LOCAL_SLOT_KEYS[1])) {
      localStorage.setItem(LOCAL_SLOT_KEYS[1], legacy)
    }
    localStorage.removeItem(LEGACY_SAVE_KEY)
  } catch {
    // ignore
  }
}

export type SavableScreen =
  | 'runMap'
  | 'party'
  | 'evolution'
  | 'shop'
  | 'rest'
  | 'event'
  | 'reward'
  | 'perkDraft'
  | 'defeat'
  | 'recruitment'
  | 'regionComplete'
  | 'regionSelect'
  | 'abilityUpgrade'
  | 'moveLearn'
  | 'abilityTransform'
  | 'inventory'

export type SavedXpLine = {
  name: string
  xpGained: number
  note?: string
}

export type SavedLevelUpLine = {
  name: string
  newLevel: number
}

export type SavedRewardInfo = {
  coinsGained: number
  xpLines: SavedXpLine[]
  levelUpLines: SavedLevelUpLine[]
  loot: string
  enemyName: string
  starterLeveledUp?: boolean
  hasPerkDrafts?: boolean
  badgeEarned?: string
  bossVictory?: boolean
  gearFound?: string
  itemsFound?: string[]
  materialsFound?: string[]
}

export type SavedRegionCompleteInfo = {
  regionId: string
  bossName: string
  coinsGained: number
  xpTotal: number
  badgesInRegion: number
  totalBadges: number
}

export type SavedDefeatInfo = {
  enemyName: string
  coinsLost: number
}

export type RunSaveData = {
  version: number
  starterId: string
  runCreature: RunCreature
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  partyRecruits: PartyCreature[]
  activeHelperId: string | null
  earnedBadges: string[]
  /** Region id string (e.g. verdant-circuit). Legacy saves may store number 1. */
  currentRegion: string
  completedRegionIds: string[]
  pendingBossVictory: boolean
  regionCompleteInfo: SavedRegionCompleteInfo | null
  screen: SavableScreen
  activeNodeId: string | null
  /** @deprecated Legacy count — migrated to pendingPerkDraftQueue */
  pendingPerkDrafts?: number
  pendingPerkDraftQueue: PerkDraftQueueEntry[]
  shopLog: string[]
  restChoiceMade: boolean
  currentEventId: string | null
  rewardInfo: SavedRewardInfo | null
  defeatInfo: SavedDefeatInfo | null
  draftPerkIds: string[]
  pendingRecruit: PartyCreature | null
  pendingEvolutionQueue: EvolutionQueueEntry[]
  pendingAbilityUpgradeQueue: AbilityUpgradeQueueEntry[]
  pendingTransformQueue?: import('./abilityMastery').AbilityTransformQueueEntry[]
  pendingPostBattleQueue?: import('./postBattleQueue').PostBattleQueueEvent[]
  draftingCreatureId: string | null
  /** @deprecated migrated to trainerInventory.gear */
  gearInventory?: string[]
  trainerInventory?: TrainerInventory
  questState?: QuestState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNodeVisitState(value: unknown): value is NodeVisitState {
  return value === 'locked' || value === 'available' || value === 'completed'
}

function validateStats(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    isNumber(value.hp) &&
    isNumber(value.atk) &&
    isNumber(value.def) &&
    isNumber(value.spAtk) &&
    isNumber(value.spDef) &&
    isNumber(value.spd)
  )
}

function validateRunCreature(value: unknown): value is RunCreature {
  if (!isRecord(value)) return false
  return (
    isString(value.name) &&
    isString(value.type) &&
    isString(value.abilityId) &&
    validateStats(value.baseStats) &&
    validateStats(value.stats) &&
    isNumber(value.maxHp) &&
    isNumber(value.currentHp) &&
    isNumber(value.level) &&
    isNumber(value.currentXp) &&
    isNumber(value.xpToNextLevel) &&
    isNumber(value.coins) &&
    isRecord(value.battleBuffs) &&
    isNumber(value.battleBuffs.atk) &&
    isNumber(value.battleBuffs.spAtk) &&
    Array.isArray(value.selectedPerks) &&
    value.selectedPerks.every(isString) &&
    isRecord(value.evolutionScores) &&
    (value.evolutionStage === undefined || isNumber(value.evolutionStage)) &&
    (value.lastEvolutionLevel === undefined || isNumber(value.lastEvolutionLevel)) &&
    (value.evolutionHistory === undefined || Array.isArray(value.evolutionHistory)) &&
    (value.starterTypeId === undefined || isString(value.starterTypeId)) &&
    (value.abilityMastery === undefined || isRecord(value.abilityMastery))
  )
}

function validatePartyCreature(value: unknown): value is PartyCreature {
  if (!isRecord(value)) return false
  const stats = value.stats ?? value.baseStats
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.type) &&
    isNumber(value.level) &&
    isNumber(value.maxHp) &&
    isNumber(value.currentHp) &&
    validateStats(stats) &&
    isString(value.abilityId) &&
    value.source === 'recruited' &&
    isString(value.templateId) &&
    (value.currentXp === undefined || isNumber(value.currentXp)) &&
    (value.xpToNextLevel === undefined || isNumber(value.xpToNextLevel)) &&
    (value.selectedPerks === undefined ||
      (Array.isArray(value.selectedPerks) && value.selectedPerks.every(isString))) &&
    (value.evolutionScores === undefined || isRecord(value.evolutionScores)) &&
    (value.battleBuffs === undefined ||
      (isRecord(value.battleBuffs) &&
        isNumber(value.battleBuffs.atk) &&
        isNumber(value.battleBuffs.spAtk))) &&
    (value.abilityMastery === undefined || isRecord(value.abilityMastery))
  )
}

function validateMapNode(value: unknown): value is MapNode {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.type) &&
    isString(value.label) &&
    isNumber(value.layer) &&
    isNumber(value.column) &&
    Array.isArray(value.connectsTo) &&
    value.connectsTo.every(isString)
  )
}

function validateNodeStates(
  value: unknown,
  nodeIds: Set<string>,
): value is Record<string, NodeVisitState> {
  if (!isRecord(value)) return false
  for (const [id, state] of Object.entries(value)) {
    if (!nodeIds.has(id) || !isNodeVisitState(state)) return false
  }
  return true
}

const SAVABLE_SCREENS: SavableScreen[] = [
  'runMap',
  'party',
  'evolution',
  'shop',
  'rest',
  'event',
  'reward',
  'perkDraft',
  'defeat',
  'recruitment',
  'regionComplete',
  'regionSelect',
  'abilityUpgrade',
  'moveLearn',
  'abilityTransform',
  'inventory',
]

function isSavableScreen(value: unknown): value is SavableScreen {
  return isString(value) && SAVABLE_SCREENS.includes(value as SavableScreen)
}

function validateRunSaveData(value: unknown): value is RunSaveData {
  if (!isRecord(value)) return false
  if (
    value.version !== SAVE_VERSION &&
    value.version !== 1 &&
    value.version !== 2 &&
    value.version !== 3 &&
    value.version !== 4 &&
    value.version !== 5
  ) {
    return false
  }
  if (!STARTERS.some((s) => s.id === value.starterId)) return false
  if (!validateRunCreature(value.runCreature)) return false

  const mapNodes = value.mapNodes
  if (!Array.isArray(mapNodes) || !mapNodes.every(validateMapNode)) {
    return false
  }

  const nodeIds = new Set(mapNodes.map((n) => n.id))
  if (!validateNodeStates(value.nodeStates, nodeIds)) return false

  if (!Array.isArray(value.partyRecruits)) return false
  if (!value.partyRecruits.every(validatePartyCreature)) return false

  if (
    value.activeHelperId !== undefined &&
    value.activeHelperId !== null &&
    !isString(value.activeHelperId)
  ) {
    return false
  }

  if (!Array.isArray(value.earnedBadges) || !value.earnedBadges.every(isString)) {
    return false
  }

  if (
    !isString(value.currentRegion) &&
    !isNumber(value.currentRegion)
  ) {
    return false
  }
  if (
    value.completedRegionIds !== undefined &&
    (!Array.isArray(value.completedRegionIds) ||
      !value.completedRegionIds.every(isString))
  ) {
    return false
  }
  if (
    value.pendingBossVictory !== undefined &&
    typeof value.pendingBossVictory !== 'boolean'
  ) {
    return false
  }
  if (value.regionCompleteInfo !== undefined && value.regionCompleteInfo !== null) {
    if (!isRecord(value.regionCompleteInfo)) return false
    const rc = value.regionCompleteInfo
    if (
      !isString(rc.regionId) ||
      !isString(rc.bossName) ||
      !isNumber(rc.coinsGained) ||
      !isNumber(rc.xpTotal) ||
      !isNumber(rc.badgesInRegion) ||
      !isNumber(rc.totalBadges)
    ) {
      return false
    }
  }
  if (!isSavableScreen(value.screen)) return false
  if (value.activeNodeId !== null && !isString(value.activeNodeId)) return false
  if (
    value.pendingPerkDrafts !== undefined &&
    !isNumber(value.pendingPerkDrafts)
  ) {
    return false
  }
  if (value.pendingPerkDraftQueue !== undefined) {
    if (
      !Array.isArray(value.pendingPerkDraftQueue) ||
      !value.pendingPerkDraftQueue.every(
        (e) =>
          isRecord(e) &&
          isString(e.creatureId) &&
          e.reason === 'levelUp',
      )
    ) {
      return false
    }
  }
  if (!Array.isArray(value.shopLog) || !value.shopLog.every(isString)) return false
  if (typeof value.restChoiceMade !== 'boolean') return false
  if (value.currentEventId !== null && !isString(value.currentEventId)) return false
  if (!Array.isArray(value.draftPerkIds) || !value.draftPerkIds.every(isString)) {
    return false
  }

  if (value.pendingRecruit !== null && !validatePartyCreature(value.pendingRecruit)) {
    return false
  }

  if (value.pendingEvolutionQueue !== undefined) {
    if (!Array.isArray(value.pendingEvolutionQueue)) return false
    const valid = value.pendingEvolutionQueue.every((e) => {
      if (isNumber(e)) return true
      return (
        isRecord(e) &&
        isString(e.creatureId) &&
        isNumber(e.threshold)
      )
    })
    if (!valid) return false
  }
  if (value.pendingAbilityUpgradeQueue !== undefined) {
    if (!Array.isArray(value.pendingAbilityUpgradeQueue)) return false
    const validUpgrades = value.pendingAbilityUpgradeQueue.every(
      (e) =>
        isRecord(e) &&
        isString(e.creatureId) &&
        isString(e.abilityId) &&
        isNumber(e.rank) &&
        (e.draftPerkIds === undefined ||
          (Array.isArray(e.draftPerkIds) && e.draftPerkIds.every(isString))),
    )
    if (!validUpgrades) return false
  }
  if (
    value.draftingCreatureId !== undefined &&
    value.draftingCreatureId !== null &&
    !isString(value.draftingCreatureId)
  ) {
    return false
  }

  if (value.defeatInfo !== undefined && value.defeatInfo !== null) {
    if (!isRecord(value.defeatInfo)) return false
    if (!isString(value.defeatInfo.enemyName)) return false
    if (!isNumber(value.defeatInfo.coinsLost)) return false
  }

  return true
}

export function toSavableScreen(screen: string): SavableScreen {
  if (screen === 'combat' || screen === 'title' || screen === 'starterSelect') {
    return 'runMap'
  }
  if (isSavableScreen(screen)) {
    return screen
  }
  return 'runMap'
}

export function normalizeLoadedSaveData(
  parsed: RunSaveData & {
    currentRegion?: string | number
    pendingEvolutionQueue?: EvolutionQueueEntry[] | number[]
  },
): RunSaveData {
  const helperId =
    parsed.activeHelperId === undefined ? null : parsed.activeHelperId

  let perkQueue: PerkDraftQueueEntry[] = []
  if (Array.isArray(parsed.pendingPerkDraftQueue)) {
    perkQueue = parsed.pendingPerkDraftQueue
  } else if (typeof parsed.pendingPerkDrafts === 'number') {
    perkQueue = legacyPerkDraftCountToQueue(parsed.pendingPerkDrafts)
  }

  let evoQueue: EvolutionQueueEntry[] = []
  if (Array.isArray(parsed.pendingEvolutionQueue)) {
    if (
      parsed.pendingEvolutionQueue.length > 0 &&
      typeof parsed.pendingEvolutionQueue[0] === 'number'
    ) {
      evoQueue = legacyEvolutionThresholdsToQueue(
        parsed.pendingEvolutionQueue as number[],
      )
    } else {
      evoQueue = parsed.pendingEvolutionQueue as EvolutionQueueEntry[]
    }
  }

  const normalizedStarter = ensureAbilityMastery(
    normalizeRunCreature(parsed.runCreature, parsed.starterId),
  )

  return {
    ...parsed,
    runCreature: normalizedStarter,
    currentRegion: normalizeRegionId(parsed.currentRegion),
    completedRegionIds: Array.isArray(parsed.completedRegionIds)
      ? parsed.completedRegionIds
      : [],
    pendingBossVictory: parsed.pendingBossVictory ?? false,
    regionCompleteInfo: parsed.regionCompleteInfo ?? null,
    activeHelperId: helperId,
    defeatInfo: parsed.defeatInfo ?? null,
    partyRecruits: parsed.partyRecruits.map((r) => normalizePartyCreature(r)),
    pendingPerkDraftQueue: perkQueue,
    pendingEvolutionQueue: evoQueue,
    pendingAbilityUpgradeQueue: (parsed.pendingAbilityUpgradeQueue ?? []).map(
      (e) => ({
        ...e,
        draftPerkIds: e.draftPerkIds ?? [],
      }),
    ),
    pendingTransformQueue: parsed.pendingTransformQueue ?? [],
    pendingPostBattleQueue: parsed.pendingPostBattleQueue ?? [],
    draftingCreatureId: parsed.draftingCreatureId ?? null,
    trainerInventory: migrateLegacyGearInventory(
      normalizeTrainerInventory(parsed.trainerInventory),
      parsed.gearInventory,
    ),
    questState: normalizeQuestState(parsed.questState),
    version: SAVE_VERSION,
  }
}

export function parseAndNormalizeSaveData(raw: unknown): RunSaveData | null {
  if (!validateRunSaveData(raw)) return null
  if ((raw as RunSaveData).version === 1) return null
  return normalizeLoadedSaveData(raw as RunSaveData)
}

function parseLocalSlotRaw(raw: string): MonolithSaveEnvelope | null {
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (obj.data !== undefined) {
    const slotId = (obj.slotId === 1 || obj.slotId === 2 ? obj.slotId : 1) as SaveSlotId
    const data = parseAndNormalizeSaveData(obj.data)
    if (!data) return null
    return {
      saveVersion: typeof obj.saveVersion === 'number' ? obj.saveVersion : SAVE_VERSION,
      slotId,
      lastPlayed:
        typeof obj.lastPlayed === 'string' ? obj.lastPlayed : new Date().toISOString(),
      saveName: typeof obj.saveName === 'string' ? obj.saveName : data.runCreature.name,
      data,
    }
  }
  const legacy = parseAndNormalizeSaveData(parsed)
  if (!legacy) return null
  return {
    saveVersion: SAVE_VERSION,
    slotId: 1,
    lastPlayed: new Date().toISOString(),
    saveName: legacy.runCreature.name,
    data: legacy,
  }
}

export function buildSaveSlotSummary(
  slotId: SaveSlotId,
  data: RunSaveData | null,
  lastPlayed?: string,
): SaveSlotSummary {
  if (!data) {
    return { slotId, isEmpty: true }
  }
  const regionId = normalizeRegionId(data.currentRegion)
  const region = getRegion(regionId)
  return {
    slotId,
    isEmpty: false,
    saveName: data.runCreature.name,
    creatureName: data.runCreature.name,
    level: data.runCreature.level,
    regionId,
    regionName: region?.name ?? regionId,
    badgeCount: data.earnedBadges.length,
    partySize: 1 + data.partyRecruits.length,
    coins: data.runCreature.coins,
    lastPlayed,
  }
}

export function saveRunToSlot(slotId: SaveSlotId, data: RunSaveData): boolean {
  try {
    migrateLegacySaveIfNeeded()
    const envelope: MonolithSaveEnvelope = {
      saveVersion: SAVE_VERSION,
      slotId,
      lastPlayed: new Date().toISOString(),
      saveName: data.runCreature.name,
      data: { ...data, version: SAVE_VERSION },
    }
    localStorage.setItem(getLocalSlotKey(slotId), JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function loadRunFromSlot(slotId: SaveSlotId): RunSaveData | null {
  try {
    migrateLegacySaveIfNeeded()
    const raw = localStorage.getItem(getLocalSlotKey(slotId))
    if (!raw) return null
    const envelope = parseLocalSlotRaw(raw)
    return envelope?.data ?? null
  } catch {
    return null
  }
}

export function loadEnvelopeFromSlot(slotId: SaveSlotId): MonolithSaveEnvelope | null {
  try {
    migrateLegacySaveIfNeeded()
    const raw = localStorage.getItem(getLocalSlotKey(slotId))
    if (!raw) return null
    return parseLocalSlotRaw(raw)
  } catch {
    return null
  }
}

export function getLocalSaveSlotSummary(slotId: SaveSlotId): SaveSlotSummary {
  const envelope = loadEnvelopeFromSlot(slotId)
  if (!envelope) return buildSaveSlotSummary(slotId, null)
  return buildSaveSlotSummary(slotId, envelope.data, envelope.lastPlayed)
}

export function getAllLocalSaveSlotSummaries(): { 1: SaveSlotSummary; 2: SaveSlotSummary } {
  return {
    1: getLocalSaveSlotSummary(1),
    2: getLocalSaveSlotSummary(2),
  }
}

export function clearSaveSlot(slotId: SaveSlotId): void {
  try {
    localStorage.removeItem(getLocalSlotKey(slotId))
  } catch {
    // ignore
  }
}

export function hasSaveInSlot(slotId: SaveSlotId): boolean {
  return loadRunFromSlot(slotId) !== null
}

/** @deprecated Use saveRunToSlot with active slot */
export function saveRun(data: RunSaveData): boolean {
  return saveRunToSlot(1, data)
}

/** @deprecated Use loadRunFromSlot */
export function loadRun(): RunSaveData | null {
  migrateLegacySaveIfNeeded()
  return loadRunFromSlot(1) ?? loadRunFromSlot(2)
}

export function clearSave(): void {
  clearSaveSlot(1)
  clearSaveSlot(2)
  try {
    localStorage.removeItem(LEGACY_SAVE_KEY)
  } catch {
    // ignore
  }
}

export function hasSave(): boolean {
  return hasSaveInSlot(1) || hasSaveInSlot(2)
}
