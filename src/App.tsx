import { useCallback, useEffect, useRef, useState } from 'react'
import {
  bgmTrackForScreen,
  isMusicEnabledSetting,
  playAbilitySfx,
  playBgm,
  startEncounterBattleMusic,
  stopEncounterBattleMusic,
  playSfx,
  setMusicEnabled,
  stopBgm,
  unlockAudio,
} from './utils/audioSystem'
import {
  isFastEncounterEnabled,
  setFastEncounterEnabled,
} from './utils/encounterSettings'
import {
  buildEncounterTransitionView,
  type EncounterTransitionView,
  type PendingCombatStart,
} from './utils/encounterTransition'
import { resolveAbilitySfxKey } from './data/abilitySounds'
import { resolveAbilityVfxId } from './data/abilityVfx'
import type { User } from '@supabase/supabase-js'
import { AccountScreen, LoginScreen, RegisterScreen } from './components/AuthScreens'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { TrainerNameScreen } from './components/TrainerNameScreen'
import { DailyRunScreen } from './components/DailyRunScreen'
import { MainMenuButton } from './components/MainMenuButton'
import { MainMenuHeader } from './components/MainMenuHeader'
import { MAIN_MENU_ICONS, MAIN_MENU_TEXT } from './data/mainMenuIcons'
import { DailyDefeatScreen } from './components/DailyDefeatScreen'
import { LeaderboardScreen } from './components/LeaderboardScreen'
import { ProfileSetupScreen } from './components/ProfileSetupScreen'
import { FeedbackModal } from './components/FeedbackModal'
import { RewardScreen } from './components/RewardScreen'
import { RunSummaryScreen } from './components/RunSummaryScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { TutorialOverlay } from './components/TutorialOverlay'
import { CurrentObjectivePanel } from './components/CurrentObjectivePanel'
import { PatchNotesScreen } from './components/PatchNotesScreen'
import { TesterInfoPanel } from './components/TesterInfoPanel'
import { AbilityUpgradeScreen } from './components/AbilityUpgradeScreen'
import { AbilityTransformScreen } from './components/AbilityTransformScreen'
import { MoveLearnScreen } from './components/MoveLearnScreen'
import { CreaturePortrait } from './components/CreaturePortrait'
import { CombatScreen, type CombatantTarget } from './components/CombatScreen'
import { getPortraitForStarter } from './data/creaturePortraits'
import { EventScreen } from './components/EventScreen'
import { EncounterTransitionOverlay } from './components/EncounterTransitionOverlay'
import { HpBar } from './components/HpBar'
import { BadgeDetailModal } from './components/BadgeDetailModal'
import {
  EvolutionScreen,
  type EvolutionScreenData,
} from './components/EvolutionScreen'
import { CreaturePerksModal } from './components/CreaturePerksModal'
import { MapBoard } from './components/MapBoard'
import { GearEquipModal } from './components/GearEquipModal'
import { InventoryScreen } from './components/InventoryScreen'
import { PartyScreen } from './components/PartyScreen'
import {
  RegionCompleteScreen,
  type RegionCompleteData,
} from './components/RegionCompleteScreen'
import { RegionSelectScreen } from './components/RegionSelectScreen'
import { RecruitmentScreen } from './components/RecruitmentScreen'
import { RestScreen } from './components/RestScreen'
import { RecoveryStationScreen } from './components/RecoveryStationScreen'
import { QuestCompleteToastStack } from './components/QuestCompleteToast'
import { AchievementUnlockToastStack } from './components/AchievementUnlockToast'
import { MonolithArchiveScreen } from './components/MonolithArchiveScreen'
import { FriendBattleScreen } from './components/FriendBattleScreen'
import { PvpResultScreen } from './components/PvpResultScreen'
import { ShopScreen } from './components/ShopScreen'
import { getAbility, getAbilityDisplayName } from './data/abilities'
import { BADGES_IN_REGION, getBadge } from './data/badges'
import {
  DEFAULT_REGION_ID,
  getRegion,
  normalizeRegionId,
  REGIONS,
} from './data/regions'
import {
  formatDailyDisplayDate,
  getDailyModifierForSeed,
  getDailyRunRegionId,
  getDailySeed,
  getTodayDateKey,
  type DailyModifier,
} from './utils/dailyRun'
import {
  createFreshDailyRunState,
  getDailyRunDayStateForToday,
  hasDailyRunForToday,
  hasDailyRunInProgress,
  loadDailyRunDayState,
  resetCurrentDailyAttempt,
  saveDailyRunDayState,
  type DailyRunDayState,
  type FreshDailyRunSnapshot,
} from './utils/dailyRunState'
import {
  calculateCheckpoint,
  calculateCurrentAttemptScore,
  calculateProgressScore,
  formatCheckpointLabel,
  updateBestDailyScore,
  type DailyRunScoreInput,
} from './utils/dailyRunScoring'
import {
  fetchLeaderboard,
  getCampaignLeaderboardSeed,
  getPlayerRank,
  resolveLeaderboardSubmitSlot,
  submitLeaderboardScore,
  type LeaderboardRow,
} from './utils/leaderboardSystem'
import {
  createPlayerProfile,
  getPlayerProfile,
  setProfileTutorialCompleted,
  updatePlayerDisplayName,
  type PlayerProfile,
} from './utils/profileSystem'
import {
  buildMasteryRewardLines,
  summarizePostBattleQueue,
  type MasteryRewardLine,
  type PendingChoiceSummary,
} from './utils/rewardSummary'
import { submitFeedback } from './utils/feedbackSystem'
import {
  createPvpChallenge,
  fetchMyActivePvpChallenge,
  fetchPvpChallengeByCode,
  buildGauntletEnemies,
  type PvpChallenge,
} from './utils/pvpSystem'
import {
  fullPartyRecovery,
  fullRecoveryCost,
  getFaintedMembers,
  hasHealableNonFainted,
  healEntirePartyCost,
  healNonFaintedParty,
  isPartyFullyHealthy,
  listPartyMembers,
  revivePartyMember,
  REVIVE_FAINTED_COST,
  spendCoins,
  type PartyMemberRef,
} from './utils/recoveryStation'
import {
  createDefaultQuestState,
  normalizeQuestState,
  getActiveQuests,
  getCompletedUnclaimedQuests,
  trackQuestProgressEvent,
  type QuestEventPayload,
  type QuestEventType,
  type QuestRunContext,
  type QuestState,
} from './utils/questSystem'
import {
  acceptRequestQuest,
  abandonRequestQuest,
  claimRequestQuestReward,
  createDefaultRequestQuestState,
  ensureAvailableRequestQuests,
  hasClaimableRequestQuests,
  normalizeRequestQuestState,
  refreshAvailableRequests,
  updateRequestQuestProgress,
  type RequestQuestRunContext,
  type RequestQuestState,
} from './utils/requestQuestSystem'
import {
  craftRecipe,
  upgradeEquippedGear,
  upgradeGearInstance,
} from './utils/forgeSystem'
import { computeCurrentObjective } from './utils/currentObjective'
import {
  createEventAlphaCombatContext,
  createMapCombatContext,
  type CombatContext,
} from './utils/combatContext'
import {
  getPlayerPrefs,
  isTesterPanelEnabled,
  isTutorialCompleted,
  resetTutorialPrefs,
  setLastSaveSlotId,
  setTesterPanelEnabled,
  setTutorialCompleted as persistTutorialCompleted,
} from './utils/playerPrefs'
import {
  getNextTutorialStep,
  TUTORIAL_STEP_ORDER,
  type TutorialStepId,
} from './utils/tutorial'
import { APP_VERSION_LABEL } from './utils/version'
import {
  buildRunScore,
  createScoreTracker,
  recordBattleVictory,
  recordLevelsGained,
  type RunScoreSnapshot,
  type RunScoreTracker,
} from './utils/runScore'
import { createSeededRng, setGameRngOverride } from './utils/seededRandom'
import {
  canRecruitEnemy,
  getEnemyForNode,
  getEncounterKind,
  getEnemyArchiveDiscovery,
  getEnemyFoeName,
  getRewardsForEncounter,
  spawnEnemy,
  type EncounterKind,
  type Enemy,
  type EnemySpawnOptions,
} from './data/enemies'
import {
  GAME_EVENTS,
  type EventChoiceId,
  type GameEvent,
  pickRandomEvent,
} from './data/events'
import {
  getNodeClickAction,
  getNodeState,
  type MapNode,
  type NodeClickAction,
  type NodeVisitState,
} from './data/nodeMap'
import { getPerk, pickPerksForCreature, resolveCreatureSpeciesKey, type Perk } from './data/perks'
import { getGearItem } from './data/gearItems'
import { STARTERS, type ElementType, type Starter } from './data/starters'
import {
  applyMasteryXpToCreature,
  applyPerkToCreature,
  applyTransformationToCreature,
  buildAbilityMasteryPerkQueueEntry,
  buildMasteryXpContext,
  calcDamageWithMastery,
  getCombatModifiersFromMastery,
  getMasteryEntry,
  getResolvedAbilityId,
  isMasteryPerkRankClaimed,
  rollCrit,
  rollHitsWithMastery,
  type AbilityMasteryPerkQueueEntry,
  type AbilityTransformQueueEntry,
} from './utils/abilityMastery'
import {
  addActiveAbility,
  forgetActiveAbility,
  getActiveAbilityIds,
} from './utils/creatureAbilities'
import {
  applyAbilityEffects,
  abilityDealsDamage,
  formatStatStageLine,
  type CombatStatStages,
} from './utils/combatEffects'
import { getSupportMasteryModifiers } from './utils/supportMasteryEffects'
import {
  buildPostBattleQueue,
  shiftQueue,
  type PostBattleQueueEvent,
} from './utils/postBattleQueue'
import {
  buildCombatStatsForCreature,
  buildCombatStatsForEnemy,
  getAttackerDamageMultiplier,
  getDefenderStatsForAttack,
  getEffectiveStats,
  getFirstStrikeBonus,
  getFirstStrikeDamageMult,
  getPostVictoryHealFromBadges,
} from './utils/badgeBonuses'
import {
  getEnemyDamageDealtMultiplier,
  getEnemyDamageTakenMultiplier,
} from './data/enemyModifiers'
import {
  applyPerkDamageTakenReduction,
  getPerkCritChanceBonus,
  rollPerkDodge,
} from './utils/perkCombat'
import { inferCreatureRole, getPerkStackLabel } from './data/perks'
import { pickCouncilEnemyPlayerTarget } from './utils/councilAi'
import { getCouncilForRegion, getCouncilNodeId } from './data/monolithCouncil'
import { MonolithCouncilScreen } from './components/MonolithCouncilScreen'
import { CouncilIntermissionScreen } from './components/CouncilIntermissionScreen'
import {
  allCouncilEnemiesDefeated,
  getDefaultLivingCouncilTargetIndex,
  getLivingCouncilEnemies,
  logCouncilEnemyDefeatCheck,
  applyCouncilFreeRecovery,
  applyCouncilFullRecovery,
  COUNCIL_FULL_HEAL_COST,
} from './utils/councilGauntlet'
import {
  advanceGauntletProgress,
  applyCouncilMapState,
  buildCouncilCombatSession,
  buildCouncilPlayerTargets,
  councilBattleLabel,
  completeCouncilForRegion,
  createContextForCouncilFight,
  getCouncilDefinitionOrThrow,
  grantCouncilCompletionRewards,
  isGauntletComplete,
  pickCouncilEnemyMove,
  pickPlayerTargetIndex,
  startGauntletProgress,
  type CouncilCombatSession,
} from './utils/councilRunFlow'
import {
  createDefaultCouncilState,
  normalizeCouncilState,
  reconcileMonolithCouncilUnlocks,
  canShowCouncilMapHudAccess,
} from './utils/monolithCouncilState'
import { getRegionSelectCouncilBanner } from './utils/councilTravelHint'
import { clearPartyBattleBuffs } from './utils/battleBuffs'
import {
  getTypeEffectivenessMultiplier,
  SUPER_EFFECTIVE_MULTIPLIER,
} from './data/typeChart'
import {
  applyEarlyGameDamageCap,
  clampAbilityPowerForEnemy,
} from './utils/damageBalance'
import { distributeBattleXp } from './utils/battleRewards'
import {
  getCouncilFightCoinReward,
  getCouncilFightEncounterKind,
  getCouncilFightScaledXp,
} from './utils/councilFightRewards'
import {
  applyDamage,
  rollHits,
  safeCalcDamage,
  sanitizeDamage,
} from './utils/combat'
import {
  applyDamageToCombatCreature,
  logEnemyDamageApplied,
} from './utils/combatDamageApply'
import {
  pickEnemyCombatMove,
  type EnemyAiTarget,
} from './utils/enemyCombatAi'
import {
  simulateCombatBalance,
  type CombatDebugSnapshot,
} from './utils/combatDebug'
import {
  applyDefeatPenalties,
  generateNewRoute,
} from './utils/defeatRecovery'
import { applyEventChoice, formatEventRewardMessage } from './utils/eventHandlers'
import {
  getMapNodeFromList,
  unlockBossIfReady,
} from './utils/mapGenerator'
import { rollBattleGearDrop } from './utils/gearSystem'
import { getItemDefinition } from './data/items'
import {
  generateShopInventory,
  resolveShopType,
  type PersistedShopInventory,
} from './utils/shopGeneration'
import {
  getGearPurchasePrice,
  getItemPurchasePrice,
  shopTypeToPurchaseSource,
} from './utils/itemPurchasePrice'
import {
  addGearIdToTrainerInventory,
  addItemToTrainerInventory,
  applyBattleDropsToInventory,
  emptyTrainerInventory,
  equipGearFromTrainerInventory,
  migrateLegacyGearInventory,
  removeInventoryItemByInstanceId,
  unequipGearToTrainerInventory,
  type TrainerInventory,
} from './utils/inventorySystem'
import { useInventoryItem } from './utils/itemUse'
import {
  convertEnemyToRecruit,
  getActiveCombatHelper,
  isPartyDefeated,
  resolveActiveHelperId,
  MAX_RECRUITS,
  RECRUITMENT_CHANCE,
  reviveFaintedToOne,
  partyCreatureAtLevel,
  type PartyCreature,
} from './utils/party'
import {
  addCoins,
  addXp,
  applyPerk,
  applyPostBattleHealing,
  createRunCreature,
  getPerkEvolutionScoreLabel,
  type RunCreature,
} from './utils/progression'
import {
  STARTER_CREATURE_ID,
  applyPerkToPartyCreature,
  hasCreaturePerk,
  type EvolutionQueueEntry,
  type PerkDraftQueueEntry,
} from './utils/creatureProgression'
import {
  buildEvolutionPreview,
  buildEvolutionPreviewForRecruit,
  evolvePartyCreature,
  evolveStarter,
  getDominantEvolutionCategory,
  normalizeRunCreature,
} from './utils/evolutionSystem'
import {
  formatRewardMultiplier,
  getPartyHighestLevel,
  getRegionEnemyLevelRange,
  rollEnemyLevelForNode,
} from './utils/regionRewards'
import {
  createFreshMapState,
  createFreshSaveData,
  logNewGameCreated,
} from './utils/runState'
import {
  countBadgesInRegion,
  createRegionMap,
  getAllTravelRegions,
  getRegionDisplayName,
} from './utils/regionTravel'
import { isSupabaseConfigured } from './lib/supabaseClient'
import {
  isAuthAvailable,
  onAuthStateChanged,
  signIn,
  signOut,
  signUp,
} from './utils/authSystem'
import {
  buildSaveEnvelope,
  deleteCloudSlot,
  getAllCloudSaveSlots,
  getCloudSaveSlotResult,
  saveToCloudSlot,
  uploadLocalSlotToCloud,
} from './utils/cloudSaveSystem'
import {
  buildSaveSlotSummary,
  clearSaveSlot,
  getAllLocalSaveSlotSummaries,
  getSaveSlotMeta,
  hasSaveInSlot,
  isSaveSlotTutorialCompleted,
  loadEnvelopeFromSlot,
  loadRunFromSlot,
  saveRunToSlot,
  setSaveSlotTutorialCompleted,
  SAVE_VERSION,
  toSavableScreen,
  updateEnvelopeTrainerName,
  type RunSaveData,
  type SaveSlotId,
  type SaveSlotMeta,
  type SaveSlotSummary,
} from './utils/saveSystem'
import {
  applyPendingRetentionRewards,
  createDefaultRetentionState,
  ensureStarterArchiveRegistered,
  getScaledQuestContext,
  hasRetentionNotifications,
  loadRetentionFromLocalSlot,
  mergePendingRetentionRewards,
  normalizeRetentionState,
  saveRetentionToLocalSlot,
  trackGameEvent,
  type GameEventPayload,
  type GameEventType,
  type RetentionRewardGrant,
  type RetentionState,
} from './utils/retentionSystem'
import {
  grantQuestReward,
  hasRetentionGrantValue,
  retentionRewardToPayload,
  type RewardProgressionResult,
} from './utils/rewardGrants'
import './App.css'
import './styles/mobile-responsive.css'

type PlayMode = 'offline' | 'cloud'
type RunMode = 'normal' | 'daily' | 'pvp'

type SaveStatusKind = 'idle' | 'saving' | 'cloud' | 'local' | 'failed' | 'warning'

type Screen =
  | 'title'
  | 'login'
  | 'register'
  | 'account'
  | 'characterSelect'
  | 'nameTrainer'
  | 'starterSelect'
  | 'runMap'
  | 'encounterTransition'
  | 'combat'
  | 'reward'
  | 'perkDraft'
  | 'shop'
  | 'rest'
  | 'event'
  | 'defeat'
  | 'recruitment'
  | 'party'
  | 'evolution'
  | 'regionComplete'
  | 'regionSelect'
  | 'abilityUpgrade'
  | 'moveLearn'
  | 'abilityTransform'
  | 'profileSetup'
  | 'dailyRun'
  | 'dailyDefeat'
  | 'leaderboard'
  | 'runSummary'
  | 'settings'
  | 'inventory'
  | 'recoveryStation'
  | 'monolithCouncil'
  | 'councilIntermission'
  | 'pvp'
  | 'pvpVictory'
  | 'pvpDefeat'
  | 'monolithArchive'
  | 'patchNotes'

type CombatPhase = 'starter' | 'recruit' | 'enemy'

type CreatureXpGainLine = {
  name: string
  xpGained: number
  note?: string
}

type CreatureLevelUpLine = {
  name: string
  newLevel: number
}

type CouncilGauntletRewardStep = {
  fightNumber: number
  totalFights: number
  trialName: string
  nextTrialName?: string
  gauntletComplete: boolean
}

type RewardInfo = {
  coinsGained: number
  xpLines: CreatureXpGainLine[]
  levelUpLines: CreatureLevelUpLine[]
  masteryLines: MasteryRewardLine[]
  pendingChoices: PendingChoiceSummary[]
  loot: string
  enemyName: string
  hasPerkDrafts: boolean
  badgeEarned?: string
  bossVictory?: boolean
  recruitmentNote?: string
  gearFound?: string
  itemsFound?: string[]
  materialsFound?: string[]
  questProgressLines?: string[]
  questCompletedTitles?: string[]
  councilGauntletStep?: CouncilGauntletRewardStep
}

type DefeatInfo = {
  enemyName: string
  coinsLost: number
}

function completeNodeOnMap(
  nodeId: string,
  mapNodes: MapNode[],
  states: Record<string, NodeVisitState>,
  earnedBadges: string[],
): Record<string, NodeVisitState> {
  const node = getMapNodeFromList(mapNodes, nodeId)
  if (!node) return states

  const next = { ...states, [nodeId]: 'completed' as const }
  for (const childId of node.connectsTo) {
    if (next[childId] === 'locked') {
      next[childId] = 'available'
    }
  }
  return unlockBossIfReady(mapNodes, next, earnedBadges)
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [selectedStarter, setSelectedStarter] = useState<Starter | null>(null)
  const [pendingStarterId, setPendingStarterId] = useState<string | null>(null)
  const [mapNodes, setMapNodes] = useState<MapNode[]>([])
  const [nodeStates, setNodeStates] = useState<Record<string, NodeVisitState>>({})
  const [runCreature, setRunCreature] = useState<RunCreature | null>(null)
  const [partyRecruits, setPartyRecruits] = useState<PartyCreature[]>([])
  const [activeHelperId, setActiveHelperId] = useState<string | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [currentRegionId, setCurrentRegionId] = useState(DEFAULT_REGION_ID)
  const [completedRegionIds, setCompletedRegionIds] = useState<string[]>([])
  const [monolithCouncilState, setMonolithCouncilState] = useState(
    createDefaultCouncilState(),
  )
  const [secondaryEnemy, setSecondaryEnemy] = useState<Enemy | null>(null)
  const councilEnemiesRef = useRef<Enemy[]>([])
  const councilSessionRef = useRef<CouncilCombatSession | null>(null)
  const councilPostRewardRef = useRef<{
    gauntletComplete: boolean
  } | null>(null)
  /** Skips post-battle healing when perk/evolution flow came from quest rewards, not combat. */
  const progressionFlowSourceRef = useRef<'battle' | 'standalone'>('battle')
  const councilTargetIndexRef = useRef(0)
  const [pendingBossVictory, setPendingBossVictory] = useState(false)
  const [regionCompleteInfo, setRegionCompleteInfo] =
    useState<RegionCompleteData | null>(null)
  const [pendingRecruit, setPendingRecruit] = useState<PartyCreature | null>(null)
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('starter')
  const [lastCombatNode, setLastCombatNode] = useState<MapNode | null>(null)
  const [fleeConfirmOpen, setFleeConfirmOpen] = useState(false)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [activeEncounterKind, setActiveEncounterKind] =
    useState<EncounterKind>('battle')
  const [enemy, setEnemy] = useState<Enemy | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [enemyAbilityVfx, setEnemyAbilityVfx] = useState<{
    vfxId: string
    playKey: number
  } | null>(null)
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null)
  const [defeatInfo, setDefeatInfo] = useState<DefeatInfo | null>(null)
  const [combatLocked, setCombatLocked] = useState(false)
  const [combatDebugSnapshot, setCombatDebugSnapshot] =
    useState<CombatDebugSnapshot | null>(null)
  const combatTurnNumberRef = useRef(0)
  const lastCombatDamageRef = useRef<{
    amount: number
    target: string
  } | null>(null)
  const [pendingPerkDraftQueue, setPendingPerkDraftQueue] = useState<
    PerkDraftQueueEntry[]
  >([])
  const [draftingCreatureId, setDraftingCreatureId] = useState<string | null>(
    null,
  )
  const [draftOptions, setDraftOptions] = useState<Perk[]>([])
  const [shopLog, setShopLog] = useState<string[]>([])
  const [trainerInventory, setTrainerInventory] = useState<TrainerInventory>(
    emptyTrainerInventory(),
  )
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null)
  const [shopInventoriesByNodeId, setShopInventoriesByNodeId] = useState<
    Record<string, PersistedShopInventory>
  >({})
  const [shopRareOfferHistory, setShopRareOfferHistory] = useState<string[]>([])
  const [activeShopInventory, setActiveShopInventory] =
    useState<PersistedShopInventory | null>(null)
  const [gearEquipCreatureId, setGearEquipCreatureId] = useState<string | null>(
    null,
  )
  const [restChoiceMade, setRestChoiceMade] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [mapMessage, setMapMessage] = useState<string | null>(null)
  const [councilMapFocusNodeId, setCouncilMapFocusNodeId] = useState<string | null>(
    null,
  )
  const [nodeClickDebug, setNodeClickDebug] = useState<{
    id: string
    type: string
    state: NodeVisitState
    route: NodeClickAction | 'blocked'
  } | null>(null)
  const [currentNode, setCurrentNode] = useState<MapNode | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(() => !isAuthAvailable())
  const [authBusy, setAuthBusy] = useState(false)
  const [playMode, setPlayMode] = useState<PlayMode | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<SaveSlotId | null>(null)
  const [selectedCharSlot, setSelectedCharSlot] = useState<SaveSlotId | null>(null)
  const [localSlots, setLocalSlots] = useState(() => getAllLocalSaveSlotSummaries())
  const [cloudSlots, setCloudSlots] = useState<{
    1: SaveSlotSummary
    2: SaveSlotSummary
  }>(() => ({
    1: buildSaveSlotSummary(1, null),
    2: buildSaveSlotSummary(2, null),
  }))
  const [saveStatus, setSaveStatus] = useState<SaveStatusKind>('idle')
  const [saveWarning, setSaveWarning] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [slotActionMessage, setSlotActionMessage] = useState<string | null>(null)
  const authUserRef = useRef<User | null>(null)
  const playModeRef = useRef<PlayMode | null>(null)
  const activeSlotIdRef = useRef<SaveSlotId | null>(null)
  const dailyRunSlotRef = useRef<SaveSlotId | null>(null)
  const pendingTrainerNameRef = useRef<string | null>(null)
  const [trainerNameFlow, setTrainerNameFlow] = useState<'newGame' | 'rename' | null>(
    null,
  )
  const [trainerNameBusy, setTrainerNameBusy] = useState(false)
  const persistInFlightRef = useRef(false)
  const persistQueuedRef = useRef(false)
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null)
  const [pendingEvolutionQueue, setPendingEvolutionQueue] = useState<
    EvolutionQueueEntry[]
  >([])
  const [perksModalCreatureId, setPerksModalCreatureId] = useState<string | null>(
    null,
  )
  const [evolutionScreenData, setEvolutionScreenData] =
    useState<EvolutionScreenData | null>(null)
  const [pendingAbilityUpgradeQueue, setPendingAbilityUpgradeQueue] = useState<
    AbilityMasteryPerkQueueEntry[]
  >([])
  const [pendingTransformQueue, setPendingTransformQueue] = useState<
    AbilityTransformQueueEntry[]
  >([])
  const [pendingPostBattleQueue, setPendingPostBattleQueue] = useState<
    PostBattleQueueEvent[]
  >([])
  const [moveLearnContext, setMoveLearnContext] = useState<{
    creatureId: string
    abilityId: string
  } | null>(null)
  const [activeTransformEntry, setActiveTransformEntry] =
    useState<AbilityTransformQueueEntry | null>(null)
  const [runMode, setRunMode] = useState<RunMode>('normal')
  const [dailySeed, setDailySeed] = useState(() => getDailySeed())
  const [dailyModifier, setDailyModifier] = useState<DailyModifier>(() =>
    getDailyModifierForSeed(getDailySeed()),
  )
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null)
  const [tutorialActive, setTutorialActive] = useState(false)
  const [tutorialStep, setTutorialStep] = useState<TutorialStepId | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [showTesterPanel, setShowTesterPanel] = useState(() =>
    isTesterPanelEnabled(),
  )
  const [recentQuestCompletions, setRecentQuestCompletions] = useState<string[]>(
    [],
  )
  const preCombatMasteryRef = useRef<{
    starter: RunCreature['abilityMastery']
    recruits: Record<string, RunCreature['abilityMastery']>
  } | null>(null)
  const partyOpenedThisRunRef = useRef(false)
  const settingsReturnScreenRef = useRef<Screen>('title')
  const patchNotesReturnScreenRef = useRef<Screen>('title')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileSetupError, setProfileSetupError] = useState<string | null>(null)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [accountUsernameError, setAccountUsernameError] = useState<string | null>(null)
  const profileReturnRef = useRef<{
    screen: Screen
    playMode?: PlayMode
    callback?: () => void
  }>({ screen: 'title' })
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardTab, setLeaderboardTab] = useState<'daily' | 'campaign'>('daily')
  const [leaderboardSeed, setLeaderboardSeed] = useState(getDailySeed())
  const [runSummaryScore, setRunSummaryScore] = useState<RunScoreSnapshot | null>(
    null,
  )
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [dailyMenuSubmitMessage, setDailyMenuSubmitMessage] = useState<string | null>(null)
  const [dailyDefeatNewBest, setDailyDefeatNewBest] = useState(false)
  const [dailyDefeatAttemptScore, setDailyDefeatAttemptScore] = useState(0)
  const [dailyDefeatBestScore, setDailyDefeatBestScore] = useState(0)
  const [dailyDefeatBestCheckpoint, setDailyDefeatBestCheckpoint] = useState('None')
  const [dailyMenuRank, setDailyMenuRank] = useState<number | null>(null)
  const [recoveryLogMessage, setRecoveryLogMessage] = useState<string | null>(null)
  const [selectedReviveTarget, setSelectedReviveTarget] =
    useState<PartyMemberRef | null>(null)
  const [pvpLookupCode, setPvpLookupCode] = useState('')
  const [pvpLookupChallenge, setPvpLookupChallenge] = useState<PvpChallenge | null>(
    null,
  )
  const [myPvpChallenge, setMyPvpChallenge] = useState<PvpChallenge | null>(null)
  const [pvpMessage, setPvpMessage] = useState<string | null>(null)
  const [pvpBusy, setPvpBusy] = useState(false)
  const [pvpResultMessage, setPvpResultMessage] = useState<string | null>(null)
  const [pvpResultDetail, setPvpResultDetail] = useState('')
  const [pvpResultCoins, setPvpResultCoins] = useState(0)
  const [pvpOpponentName, setPvpOpponentName] = useState('Friend')
  const [questState, setQuestState] = useState<QuestState>(createDefaultQuestState)
  const [requestQuestState, setRequestQuestState] = useState<RequestQuestState>(
    createDefaultRequestQuestState,
  )
  const [requestBoardMessage, setRequestBoardMessage] = useState<string | null>(null)
  const [forgeMessage, setForgeMessage] = useState<string | null>(null)
  const [musicEnabled, setMusicEnabledState] = useState(isMusicEnabledSetting)
  const [fastEncounter, setFastEncounterState] = useState(isFastEncounterEnabled)
  const [encounterTransitionView, setEncounterTransitionView] =
    useState<EncounterTransitionView | null>(null)
  const pendingCombatRef = useRef<PendingCombatStart | null>(null)
  const [questCompleteToasts, setQuestCompleteToasts] = useState<
    { id: string; title: string; rewardPreview: string }[]
  >([])
  const [retentionState, setRetentionState] = useState<RetentionState>(
    createDefaultRetentionState,
  )
  const [achievementUnlockToasts, setAchievementUnlockToasts] = useState<
    { id: string; title: string }[]
  >([])
  const [archiveMessage, setArchiveMessage] = useState<string | null>(null)

  const screenRef = useRef<Screen>('title')
  const inventoryReturnScreenRef = useRef<'runMap' | 'party' | 'shop'>('runMap')
  const runModeRef = useRef<RunMode>('normal')
  const dailySeedRef = useRef(getDailySeed())
  const dailyModifierRef = useRef<DailyModifier>(
    getDailyModifierForSeed(getDailySeed()),
  )
  const scoreTrackerRef = useRef<RunScoreTracker>(createScoreTracker())
  const combatEndedRef = useRef(false)
  const combatContextRef = useRef<CombatContext | null>(null)
  const combatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstAttackUsedRef = useRef<Set<string>>(new Set())
  const playerDamageHitsRef = useRef(0)
  const runCreatureRef = useRef<RunCreature | null>(null)
  const partyRecruitsRef = useRef<PartyCreature[]>([])
  const pendingAbilityUpgradeQueueRef = useRef<AbilityMasteryPerkQueueEntry[]>([])
  const pendingTransformQueueRef = useRef<AbilityTransformQueueEntry[]>([])
  const pendingPostBattleQueueRef = useRef<PostBattleQueueEvent[]>([])
  const enemyStatStagesRef = useRef<CombatStatStages>({})
  const playerStatStagesRef = useRef<Record<string, CombatStatStages>>({})
  const enemyTurnLockRef = useRef(false)
  const pvpReturnScreenRef = useRef<'title' | 'runMap'>('title')
  const pvpGauntletRef = useRef<Enemy[]>([])
  const pvpGauntletIndexRef = useRef(0)
  const prePvpPartyRef = useRef<{
    starter: RunCreature
    recruits: PartyCreature[]
    activeHelperId: string | null
  } | null>(null)
  const pvpOpponentNameRef = useRef('Friend')
  const retentionStateRef = useRef<RetentionState>(createDefaultRetentionState())
  const trainerInventoryRef = useRef<TrainerInventory>(emptyTrainerInventory())
  const leaderboardReturnScreenRef = useRef<Screen>('dailyRun')

  useEffect(() => {
    runCreatureRef.current = runCreature
  }, [runCreature])

  useEffect(() => {
    partyRecruitsRef.current = partyRecruits
  }, [partyRecruits])

  useEffect(() => {
    pendingAbilityUpgradeQueueRef.current = pendingAbilityUpgradeQueue
  }, [pendingAbilityUpgradeQueue])

  useEffect(() => {
    pendingTransformQueueRef.current = pendingTransformQueue
  }, [pendingTransformQueue])

  useEffect(() => {
    pendingPostBattleQueueRef.current = pendingPostBattleQueue
  }, [pendingPostBattleQueue])

  const pendingStarter = STARTERS.find((s) => s.id === pendingStarterId) ?? null

  useEffect(() => {
    screenRef.current = screen
  }, [screen])

  useEffect(() => {
    if (screen !== 'combat') return
    if (combatContextRef.current?.source === 'monolithCouncil') {
      if (
        councilEnemiesRef.current.length > 0 &&
        allCouncilEnemiesDefeated(councilEnemiesRef.current) &&
        !combatEndedRef.current
      ) {
        const timer = window.setTimeout(() => {
          if (
            screenRef.current === 'combat' &&
            !combatEndedRef.current &&
            allCouncilEnemiesDefeated(councilEnemiesRef.current)
          ) {
            combatEndedRef.current = true
            setCombatLocked(true)
            stopEncounterBattleMusic()
            handleCouncilGauntletVictory()
          }
        }, 450)
        return () => window.clearTimeout(timer)
      }
      return
    }
    if (!enemy) return
    if (enemy.currentHp <= 0 && !combatEndedRef.current) {
      const timer = window.setTimeout(() => {
        if (
          screenRef.current === 'combat' &&
          !combatEndedRef.current &&
          enemy.currentHp <= 0
        ) {
          handleVictory(enemy)
        }
      }, 450)
      return () => window.clearTimeout(timer)
    }
  }, [screen, enemy, secondaryEnemy])

  useEffect(() => {
    authUserRef.current = authUser
  }, [authUser])

  useEffect(() => {
    playModeRef.current = playMode
  }, [playMode])

  useEffect(() => {
    activeSlotIdRef.current = activeSlotId
  }, [activeSlotId])

  useEffect(() => {
    retentionStateRef.current = retentionState
  }, [retentionState])

  useEffect(() => {
    trainerInventoryRef.current = trainerInventory
  }, [trainerInventory])

  const refreshLocalSlots = useCallback(() => {
    setLocalSlots(getAllLocalSaveSlotSummaries())
  }, [])

  const refreshCloudSlots = useCallback(async () => {
    if (!authUserRef.current) {
      setCloudSlots({
        1: buildSaveSlotSummary(1, null),
        2: buildSaveSlotSummary(2, null),
      })
      return
    }
    const slots = await getAllCloudSaveSlots()
    setCloudSlots(slots)
  }, [])

  useEffect(() => {
    syncTutorialFromStorage()
    setRetentionState(loadRetentionFromLocalSlot(1))
  }, [])

  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    if (!musicEnabled) {
      stopBgm()
      return
    }
    const track = bgmTrackForScreen(screen)
    if (track) playBgm(track)
    else stopBgm()
  }, [screen, musicEnabled])

  useEffect(() => {
    return () => stopBgm()
  }, [])

  useEffect(() => {
    if (!isAuthAvailable()) {
      setAuthReady(true)
      return
    }
    const unsubscribe = onAuthStateChanged((user) => {
      setAuthUser(user)
      authUserRef.current = user
      if (user) {
        void getAllCloudSaveSlots().then(setCloudSlots)
        void getPlayerProfile().then((result) => {
          setPlayerProfile(result.profile)
          if (result.profile?.tutorial_completed) {
            persistTutorialCompleted(true)
          }
        })
      } else {
        setCloudSlots({
          1: buildSaveSlotSummary(1, null),
          2: buildSaveSlotSummary(2, null),
        })
        setPlayerProfile(null)
      }
      setAuthReady(true)
    })
    return unsubscribe
  }, [])

  function clearCombatTimeout() {
    if (combatTimeoutRef.current !== null) {
      clearTimeout(combatTimeoutRef.current)
      combatTimeoutRef.current = null
    }
  }

  function resetCombatSession() {
    combatEndedRef.current = false
    firstAttackUsedRef.current = new Set()
    playerDamageHitsRef.current = 0
    enemyStatStagesRef.current = {}
    playerStatStagesRef.current = {}
    enemyTurnLockRef.current = false
    combatTurnNumberRef.current = 0
    lastCombatDamageRef.current = null
    setCombatDebugSnapshot(null)
    setEnemyAbilityVfx(null)
    clearCombatTimeout()
  }

  function updateCombatDebugSnapshot(
    phase: CombatPhase,
    starter: RunCreature,
    recruits: PartyCreature[],
    enemyState: Enemy | null,
    activeActor: string,
  ) {
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    setCombatDebugSnapshot({
      turnNumber: combatTurnNumberRef.current,
      combatPhase: phase,
      activeActor,
      playerHp: starter.currentHp,
      playerMaxHp: starter.maxHp,
      helperHp: helper?.currentHp ?? null,
      helperMaxHp: helper?.maxHp ?? null,
      enemyHp: enemyState?.currentHp ?? 0,
      enemyMaxHp: enemyState?.maxHp ?? 0,
      lastDamageApplied: lastCombatDamageRef.current?.amount ?? null,
      lastDamageTarget: lastCombatDamageRef.current?.target ?? null,
      selectedTarget: activeActor,
    })
  }

  /** After enemy acts: helper turn if alive, otherwise starter. */
  function phaseAfterEnemyTurn(
    starter: RunCreature,
    recruits: PartyCreature[],
  ): CombatPhase {
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    if (helper) {
      const live = recruits.find((r) => r.id === helper.id)
      if (live && live.currentHp > 0) return 'recruit'
    }
    if (starter.currentHp > 0) return 'starter'
    return 'starter'
  }

  function beginEnemyTurn(nextEnemy: Enemy) {
    setCombatPhase('enemy')
    setCombatLocked(true)
    updateCombatDebugSnapshot(
      'enemy',
      runCreatureRef.current ?? runCreature!,
      partyRecruitsRef.current ?? partyRecruits,
      nextEnemy,
      'enemy',
    )
    const isCouncilFight =
      combatContextRef.current?.source === 'monolithCouncil'
    if (isCouncilFight) {
      runCouncilEnemyTurnAfterPlayerHandoff()
      return
    }
    runEnemyTurn(nextEnemy)
  }

  function setCombatContextBoth(ctx: CombatContext | null) {
    combatContextRef.current = ctx
  }

  function cleanupCombatState() {
    stopEncounterBattleMusic()
    clearCombatTimeout()
    enemyTurnLockRef.current = false
    setEnemy(null)
    setSecondaryEnemy(null)
    councilEnemiesRef.current = []
    councilSessionRef.current = null
    setLastCombatNode(null)
    setCombatContextBoth(null)
    setCombatLocked(true)
    setBattleLog([])
    setCombatPhase('starter')
  }

  function syncCouncilToMap(
    nodes: MapNode[],
    states: Record<string, import('./data/nodeMap').NodeVisitState>,
    councilState: import('./utils/monolithCouncilState').MonolithCouncilSaveState = monolithCouncilState,
  ) {
    const applied = applyCouncilMapState(
      nodes,
      states,
      currentRegionId,
      councilState,
      earnedBadges,
    )
    setMapNodes(applied.nodes)
    setNodeStates(applied.states)
    return applied
  }

  function refreshCouncilUnlock(regionId: string = currentRegionId) {
    const { state, newlyUnlockedRegionIds, notificationMessage } =
      reconcileMonolithCouncilUnlocks(monolithCouncilState, earnedBadges, {
        preferNotifyRegionId: regionId,
      })
    const stateChanged = state !== monolithCouncilState
    if (stateChanged) {
      setMonolithCouncilState(state)
    }
    if (newlyUnlockedRegionIds.includes(regionId)) {
      dispatchRetentionEvent('monolithCouncilUnlocked', { regionId })
    }
    if (notificationMessage) {
      setMapMessage(
        `${notificationMessage} Use Challenge Monolith Council on the map HUD or scroll to the node at the top of the route.`,
      )
      setCouncilMapFocusNodeId(getCouncilNodeId(regionId))
    }
    if (stateChanged || newlyUnlockedRegionIds.length > 0) {
      syncCouncilToMap(mapNodes, nodeStates, state)
      if (newlyUnlockedRegionIds.includes(regionId)) {
        setCouncilMapFocusNodeId(getCouncilNodeId(regionId))
      }
    }
  }

  function handleOpenMonolithCouncil() {
    const council = getCouncilForRegion(currentRegionId)
    if (!council || council.trials.length === 0) {
      setMapMessage("This region's Monolith Council is not available yet.")
      return
    }
    if (
      !canShowCouncilMapHudAccess(
        currentRegionId,
        earnedBadges,
        monolithCouncilState,
      )
    ) {
      return
    }
    setMapMessage(null)
    setScreen('monolithCouncil')
  }

  function syncCouncilEnemiesUi(enemies: Enemy[]) {
    councilEnemiesRef.current = enemies
    setEnemy(enemies[0] ?? null)
    setSecondaryEnemy(enemies[1] ?? null)
    const livingIdx = getDefaultLivingCouncilTargetIndex(enemies)
    councilTargetIndexRef.current = livingIdx
  }

  function runCouncilEnemyTurnAfterPlayerHandoff() {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    if (!starterSnapshot || screenRef.current !== 'combat') return
    if (allCouncilEnemiesDefeated(councilEnemiesRef.current)) return
    const living = getLivingCouncilEnemies(councilEnemiesRef.current)
    if (living.length === 0) return
    logCouncilEnemyDefeatCheck('enemy-turn-after-handoff', councilEnemiesRef.current, {
      selectedTargetIndex: councilTargetIndexRef.current,
      combatPhase,
      combatLocked,
      combatEnded: combatEndedRef.current,
    })
    runMonolithCouncilEnemyTurns(starterSnapshot, recruitsSnapshot)
  }

  function beginCouncilTrialFight(trialIndex: number) {
    const council = getCouncilDefinitionOrThrow(currentRegionId)
    const session = buildCouncilCombatSession(council, trialIndex)
    councilSessionRef.current = session
    syncCouncilEnemiesUi(session.enemies)
    const ctx = createContextForCouncilFight(
      currentRegionId,
      council,
      session,
      currentNode,
    )
    setCombatContextBoth(ctx)
    setActiveEncounterKind('council')
    resetCombatSession()
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    if (starterSnapshot) {
      preCombatMasteryRef.current = {
        starter: structuredClone(starterSnapshot.abilityMastery),
        recruits: Object.fromEntries(
          recruitsSnapshot.map((r) => [r.id, structuredClone(r.abilityMastery)]),
        ),
      }
    }
    setBattleLog([
      `${councilBattleLabel(council, session)} — ${council.trials[trialIndex]?.name ?? 'Trial'} begins!`,
    ])
    setCombatLocked(false)
    setScreen('combat')
  }

  function handleCouncilGauntletVictory() {
    const council = getCouncilDefinitionOrThrow(currentRegionId)
    const progress =
      monolithCouncilState.activeGauntlet ??
      startGauntletProgress(currentRegionId, council.councilId)
    const trial = council.trials[progress.trialIndex]
    if (!trial) return

    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    if (!starterSnapshot) return

    stopEncounterBattleMusic()
    clearCombatTimeout()
    combatEndedRef.current = true
    setCombatLocked(true)

    const fightNumber = progress.trialIndex + 1
    const totalFights = council.trials.length
    const encounterKind = getCouncilFightEncounterKind(trial, fightNumber, totalFights)
    const scaledXp = getCouncilFightScaledXp(
      trial,
      fightNumber,
      totalFights,
      currentRegionId,
    )
    const defeatedLabel = trial.trainers.map((t) => t.trainerName).join(' & ')

    dispatchRetentionEvent('councilFightWon', { regionId: currentRegionId })
    dispatchRetentionEvent('councilTrialCompleted', { regionId: currentRegionId })
    dispatchQuestEvent('councilFightWon', { regionId: currentRegionId })
    dispatchQuestEvent('battleWon', { encounterKind, nodeType: 'monolithCouncil' })
    dispatchQuestEvent('enemyDefeated', {
      encounterKind,
      enemyKind: 'trainer',
      enemyType: 'Normal',
    })
    dispatchRetentionEvent('battleWon')
    dispatchRetentionEvent('enemyDefeated')
    if (trial.id === 'verdant-warden') {
      dispatchRetentionEvent('monolithWardenDefeated', { regionId: currentRegionId })
    }
    if (encounterKind === 'elite') {
      dispatchRetentionEvent('eliteOrAlphaDefeated')
    }

    recordBattleVictory(scoreTrackerRef.current, encounterKind)

    const levelBefore = starterSnapshot.level
    const recruitLevelsBefore = Object.fromEntries(
      recruitsSnapshot.map((r) => [r.id, r.level]),
    )
    const helper = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    const preReviveHp = {
      starterHp: starterSnapshot.currentHp,
      helperHp: helper?.currentHp ?? null,
    }

    const xpResult = distributeBattleXp(
      encounterKind,
      currentRegionId,
      starterSnapshot,
      recruitsSnapshot,
      activeHelperId,
      preReviveHp,
      levelBefore,
      recruitLevelsBefore,
      { xpOverride: scaledXp },
    )

    recordLevelsGained(scoreTrackerRef.current, xpResult.levelUpLines.length)

    const coinsGained = getCouncilFightCoinReward(currentRegionId)
    let nextStarter = addCoins(xpResult.starter, coinsGained)
    let nextRecruits = xpResult.recruits
    if (coinsGained > 0) {
      dispatchQuestEvent('coinsCollected', { amount: coinsGained })
    }

    const revived = reviveFaintedToOne(nextStarter, nextRecruits)
    nextStarter = revived.starter
    nextRecruits = revived.recruits

    const masteryStarter = {
      ...nextStarter,
      abilityMastery: starterSnapshot.abilityMastery,
    }
    const masteryRecruits = nextRecruits.map((r) => {
      const prev = recruitsSnapshot.find((p) => p.id === r.id)
      return prev ? { ...r, abilityMastery: prev.abilityMastery } : r
    })

    runCreatureRef.current = masteryStarter
    partyRecruitsRef.current = masteryRecruits
    setRunCreature(masteryStarter)
    setPartyRecruits(masteryRecruits)
    setPendingPerkDraftQueue(xpResult.perkDraftQueue)
    setPendingEvolutionQueue(xpResult.evolutionQueue)

    const postQueue = buildPostBattleQueue({
      perkDraftQueue: xpResult.perkDraftQueue,
      evolutionQueue: xpResult.evolutionQueue,
      starter: masteryStarter,
      recruits: masteryRecruits,
      levelBeforeStarter: levelBefore,
      recruitLevelsBefore,
      masteryPerkQueue: pendingAbilityUpgradeQueueRef.current,
      masteryTransformQueue: pendingTransformQueueRef.current,
    })
    setPendingPostBattleQueue(postQueue)
    pendingPostBattleQueueRef.current = postQueue

    const preMastery = preCombatMasteryRef.current
    const masteryLines =
      preMastery != null
        ? buildMasteryRewardLines(
            {
              ...starterSnapshot,
              abilityMastery: preMastery.starter,
            },
            starterSnapshot,
            recruitsSnapshot.map((r) => ({
              ...r,
              abilityMastery: preMastery.recruits[r.id] ?? r.abilityMastery,
            })),
            recruitsSnapshot,
          )
        : []

    for (const line of masteryLines) {
      if (line.xpGained > 0) {
        dispatchRetentionEvent('abilityMasteryXp', { amount: line.xpGained })
      }
      if (line.rankUp && line.newRank != null) {
        dispatchRetentionEvent('abilityMasteryLevelReached', {
          masteryLevel: line.newRank,
        })
      }
    }

    const pendingChoices = summarizePostBattleQueue(postQueue)
    setPendingAbilityUpgradeQueue([])
    pendingAbilityUpgradeQueueRef.current = []
    setPendingTransformQueue([])
    pendingTransformQueueRef.current = []

    const nextProgress = advanceGauntletProgress(progress)
    const gauntletComplete = isGauntletComplete(council, nextProgress)
    setMonolithCouncilState((s) => ({ ...s, activeGauntlet: nextProgress }))
    councilPostRewardRef.current = { gauntletComplete }

    const nextTrial = council.trials[nextProgress.trialIndex]
    const questLines = buildQuestRewardLines()

    cleanupCombatState()
    combatEndedRef.current = false

    setRewardInfo({
      coinsGained,
      xpLines: xpResult.xpLines,
      levelUpLines: xpResult.levelUpLines,
      masteryLines,
      pendingChoices,
      loot: coinsGained > 0 ? 'Council trial coins' : 'None',
      enemyName: `${trial.name} (${defeatedLabel})`,
      hasPerkDrafts: xpResult.perkDraftQueue.length > 0,
      questProgressLines: questLines.progress,
      questCompletedTitles: questLines.completed,
      councilGauntletStep: {
        fightNumber,
        totalFights,
        trialName: trial.name,
        nextTrialName: nextTrial?.name,
        gauntletComplete,
      },
    })

    if (xpResult.perkDraftQueue.length > 0) {
      advanceTutorialTo('claimRewards')
      maybeAdvanceTutorial('winBattle', 'choosePerk')
    } else {
      advanceTutorialTo('claimRewards')
      maybeAdvanceTutorial('winBattle', 'masteryProgress')
    }

    setScreen('reward')
    void persistRun()
  }

  function finishCouncilGauntlet(council: ReturnType<typeof getCouncilDefinitionOrThrow>) {
    const seed = `${currentRegionId}|council|${Date.now()}`
    let nextStarter = runCreatureRef.current ?? runCreature
    if (!nextStarter) return
    const granted = grantCouncilCompletionRewards(
      nextStarter,
      council,
      trainerInventoryRef.current,
      seed,
    )
    nextStarter = granted.starter
    trainerInventoryRef.current = granted.inventory
    setTrainerInventory(granted.inventory)
    runCreatureRef.current = nextStarter
    setRunCreature(nextStarter)

    let nextCouncil = completeCouncilForRegion(monolithCouncilState, currentRegionId)
    if (!nextCouncil.emblemsOwned.includes(council.rewards.emblemItemId)) {
      nextCouncil = {
        ...nextCouncil,
        emblemsOwned: [...nextCouncil.emblemsOwned, council.rewards.emblemItemId],
      }
    }
    setMonolithCouncilState(nextCouncil)
    dispatchRetentionEvent('councilCompleted', { regionId: currentRegionId })
    dispatchRetentionEvent('regionCompleted', { regionId: currentRegionId })
    dispatchQuestEvent('councilCompleted', { regionId: currentRegionId })

    setCompletedRegionIds((prev) =>
      prev.includes(currentRegionId) ? prev : [...prev, currentRegionId],
    )
    setMapMessage(
      `${council.officialName} complete! ${granted.lines.join(' · ')}`,
    )

    const applied = applyCouncilMapState(
      mapNodes,
      nodeStates,
      currentRegionId,
      nextCouncil,
      earnedBadges,
    )
    setMapNodes(applied.nodes)
    setNodeStates(applied.states)
    markNodeComplete(getCouncilNodeId(currentRegionId))

    setScreen('runMap')
    void persistRun()
  }

  function abandonCouncilGauntlet() {
    setMonolithCouncilState((s) => ({ ...s, activeGauntlet: null }))
    cleanupCombatState()
    setScreen('runMap')
    setMapMessage('You abandoned the Monolith Council challenge.')
    void persistRun()
  }

  function handleCouncilCombatDefeat() {
    abandonCouncilGauntlet()
    setScreen('recoveryStation')
    setMapMessage('Council gauntlet ended — visit Recovery Station to recover.')
  }

  function persistQuestProgress(nextState: QuestState) {
    const slotId = activeSlotIdRef.current
    if (!slotId || runModeRef.current !== 'normal') return
    const saved = loadRunFromSlot(slotId)
    if (!saved) return
    saveRunToSlot(slotId, { ...saved, questState: nextState })
    refreshLocalSlots()
    if (authUserRef.current && isSupabaseConfigured()) {
      void saveToCloudSlot(
        slotId,
        buildSaveEnvelope(slotId, { ...saved, questState: nextState }),
      )
    }
  }

  function persistRequestQuestProgress(nextState: RequestQuestState) {
    const slotId = activeSlotIdRef.current
    if (!slotId || runModeRef.current !== 'normal') return
    const saved = loadRunFromSlot(slotId)
    if (!saved) return
    saveRunToSlot(slotId, { ...saved, requestQuestState: nextState })
    refreshLocalSlots()
    if (authUserRef.current && isSupabaseConfigured()) {
      void saveToCloudSlot(
        slotId,
        buildSaveEnvelope(slotId, { ...saved, requestQuestState: nextState }),
      )
    }
  }

  function isTutorialCompletedForRun(): boolean {
    const slotId = activeSlotIdRef.current
    if (slotId && isSaveSlotTutorialCompleted(slotId)) return true
    return isTutorialCompleted()
  }

  function syncTutorialFromStorage() {
    if (isTutorialCompletedForRun()) {
      setTutorialActive(false)
      setTutorialStep(null)
    }
  }

  function beginTutorialIfNeeded() {
    if (isTutorialCompletedForRun()) {
      setTutorialActive(false)
      setTutorialStep(null)
      return
    }
    setTutorialActive(true)
    setTutorialStep('chooseStarter')
  }

  function completeTutorial() {
    persistTutorialCompleted(true)
    const slotId = activeSlotIdRef.current
    if (slotId) {
      setSaveSlotTutorialCompleted(slotId, true)
    }
    void setProfileTutorialCompleted(true)
    setTutorialActive(false)
    setTutorialStep(null)
  }

  function skipTutorial() {
    completeTutorial()
  }

  function dismissTutorialStep() {
    if (!tutorialStep) return
    if (tutorialStep === 'monolithArchive') {
      completeTutorial()
      return
    }
    const next = getNextTutorialStep(tutorialStep)
    if (!next) completeTutorial()
    else setTutorialStep(next)
  }

  function advanceTutorialTo(step: TutorialStepId) {
    if (!tutorialActive || isTutorialCompletedForRun()) return
    setTutorialStep(step)
  }

  function maybeAdvanceTutorial(
    expected: TutorialStepId,
    next: TutorialStepId,
  ) {
    if (tutorialActive && tutorialStep === expected) {
      setTutorialStep(next)
    }
  }

  function getFeedbackContext() {
    const slotId = activeSlotIdRef.current ?? selectedCharSlot
    const slot =
      slotId != null
        ? playMode === 'cloud'
          ? `Cloud ${slotId}`
          : `Local ${slotId}`
        : runModeRef.current === 'daily'
          ? 'Daily run'
          : 'None'
    const saveMode =
      playMode === 'cloud'
        ? 'cloud'
        : playMode === 'offline'
          ? 'local'
          : runModeRef.current === 'daily'
            ? 'daily (no slot)'
            : 'none'
    return {
      screen,
      region: currentRegionId,
      saveSlot: slot,
      saveMode,
      runMode: runModeRef.current,
      partyHighestLevel: runCreature
        ? getPartyHighestLevel(runCreature, partyRecruits)
        : 1,
      mapSeed:
        runModeRef.current === 'daily'
          ? (dailySeedRef.current ?? dailySeed)
          : undefined,
      loggedInUsername: playerProfile?.display_name ?? authUser?.email,
    }
  }

  function buildQuestRewardLines(): {
    progress: string[]
    completed: string[]
  } {
    const progress = getActiveQuests(questState)
      .filter((q) => {
        const entry = questState.progress[q.id]
        return entry && !entry.completed
      })
      .map((q) => {
        const entry = questState.progress[q.id]!
        return `${q.title}: ${entry.currentAmount}/${entry.requiredAmount}`
      })
    const completed = [
      ...recentQuestCompletions,
      ...getCompletedUnclaimedQuests(questState).map((q) => q.title),
    ].filter((t, i, arr) => arr.indexOf(t) === i)
    return { progress, completed }
  }

  function renderTesterPanel() {
    if (!showTesterPanel) return null
    const ctx = getFeedbackContext()
    return (
      <TesterInfoPanel
        info={{
          screen: ctx.screen,
          saveSlot: ctx.saveSlot,
          saveMode: ctx.saveMode,
          region: ctx.region,
          partyHighestLevel: ctx.partyHighestLevel,
          mapSeed: ctx.mapSeed,
          runMode: ctx.runMode,
          loggedIn: Boolean(authUser),
          displayName: playerProfile?.display_name,
        }}
        combatDebug={
          screen === 'combat' ? combatDebugSnapshot : null
        }
        onClose={() => {
          setShowTesterPanel(false)
          setTesterPanelEnabled(false)
        }}
      />
    )
  }

  function renderTutorialOverlay() {
    if (!tutorialActive || !tutorialStep) return null
    return (
      <TutorialOverlay
        step={tutorialStep}
        stepIndex={TUTORIAL_STEP_ORDER.indexOf(tutorialStep)}
        totalSteps={TUTORIAL_STEP_ORDER.length}
        onSkip={skipTutorial}
        onDismiss={dismissTutorialStep}
      />
    )
  }

  function renderFeedbackModal() {
    if (!feedbackOpen) return null
    const ctx = getFeedbackContext()
    return (
      <FeedbackModal
        screen={ctx.screen}
        region={ctx.region}
        saveSlot={ctx.saveSlot}
        saveMode={ctx.saveMode}
        runMode={ctx.runMode}
        partyHighestLevel={ctx.partyHighestLevel}
        mapSeed={ctx.mapSeed}
        loggedInUsername={ctx.loggedInUsername}
        defaultContact={playerProfile?.display_name}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={async (input) => {
          const result = await submitFeedback({
            ...input,
            screen: ctx.screen,
            region: ctx.region,
            saveSlot: ctx.saveSlot,
            saveMode: ctx.saveMode,
            runMode: ctx.runMode,
            partyHighestLevel: ctx.partyHighestLevel,
            mapSeed: ctx.mapSeed,
            loggedInUsername: ctx.loggedInUsername,
          })
          return {
            copyText: result.copyText,
            savedToCloud: result.savedToCloud,
            error: result.error,
          }
        }}
      />
    )
  }

  function appendAbilityUpgradeQueue(entries: AbilityMasteryPerkQueueEntry[]) {
    if (entries.length === 0) return
    setPendingAbilityUpgradeQueue((prev) => {
      const next = [...prev]
      for (const entry of entries) {
        const duplicate = next.some(
          (e) =>
            e.creatureId === entry.creatureId &&
            e.abilityId === entry.abilityId &&
            e.rank === entry.rank,
        )
        if (!duplicate) next.push(entry)
      }
      pendingAbilityUpgradeQueueRef.current = next
      return next
    })
  }

  function appendTransformQueue(entries: AbilityTransformQueueEntry[]) {
    if (entries.length === 0) return
    setPendingTransformQueue((prev) => {
      const next = [...prev, ...entries]
      pendingTransformQueueRef.current = next
      return next
    })
  }

  function applyMasteryAfterAttack(
    attacker: RunCreature | PartyCreature,
    attackerKey: string,
    abilityId: string,
    ctx: { hit: boolean; superEffective: boolean; defeatingBlow: boolean },
  ): RunCreature | PartyCreature {
    const creatureId =
      attackerKey === 'starter' ? STARTER_CREATURE_ID : attackerKey
    const result = applyMasteryXpToCreature(
      attacker,
      creatureId,
      abilityId,
      ctx,
    )
    for (const line of result.logLines) {
      appendLog(line)
    }
    appendAbilityUpgradeQueue(result.perkQueueEntries)
    appendTransformQueue(result.transformQueueEntries)
    return result.creature
  }

  function scheduleVictoryCallback(fn: () => void, delayMs: number) {
    clearCombatTimeout()
    combatTimeoutRef.current = setTimeout(() => {
      combatTimeoutRef.current = null
      if (screenRef.current !== 'combat' || combatEndedRef.current) return
      fn()
    }, delayMs)
  }

  function buildQuestCtx(): QuestRunContext | null {
    if (!runCreature) return null
    return {
      starter: runCreature,
      recruits: partyRecruits,
      currentRegionId,
      earnedBadges,
    }
  }

  function dismissQuestToast(id: string) {
    setQuestCompleteToasts((prev) => prev.filter((t) => t.id !== id))
  }

  function renderQuestToasts() {
    return (
      <QuestCompleteToastStack
        toasts={questCompleteToasts}
        onDismiss={dismissQuestToast}
      />
    )
  }

  function dispatchQuestEvent(
    event: QuestEventType,
    payload: QuestEventPayload = {},
  ) {
    if (!runCreature || runModeRef.current === 'pvp' || runModeRef.current === 'daily') {
      return
    }
    const ctx = buildQuestCtx()
    if (!ctx) return
    console.log('Quest event tracked', event, payload)
    setQuestState((prev) => {
      const result = trackQuestProgressEvent(prev, event, payload, ctx)
      if (result.newlyCompleted.length > 0) {
        const titles = result.newlyCompleted.map((q) => q.title)
        for (const q of result.newlyCompleted) {
          console.log('Quest completed', q.title)
        }
        setRecentQuestCompletions((prev) => [
          ...titles,
          ...prev,
        ].filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 5))
        setQuestCompleteToasts((toasts) => [
          ...toasts,
          ...result.newlyCompleted.map((q) => ({
            id: `quest-${q.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: q.title,
            rewardPreview: q.rewardPreview,
            variant: 'quest' as const,
          })),
        ])
      }
      persistQuestProgress(result.state)
      return result.state
    })
    dispatchRequestQuestEvent(event, payload)
  }

  function dispatchRequestQuestEvent(
    event: QuestEventType,
    payload: QuestEventPayload = {},
  ) {
    if (!runCreature || runModeRef.current === 'pvp' || runModeRef.current === 'daily') {
      return
    }
    setRequestQuestState((prev) => {
      const result = updateRequestQuestProgress(prev, event, payload)
      if (result.newlyCompleted.length > 0) {
        setQuestCompleteToasts((toasts) => [
          ...toasts,
          ...result.newlyCompleted.map((q) => ({
            id: `request-${q.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: q.title,
            rewardPreview: q.rewardPreview,
            variant: 'request' as const,
          })),
        ])
      }
      persistRequestQuestProgress(result.state)
      return result.state
    })
  }

  function getRetentionSlot(): SaveSlotId {
    return activeSlotIdRef.current ?? 1
  }

  function resolveDailyLeaderboardSlot(): SaveSlotId {
    return (
      dailyRunSlotRef.current ??
      activeSlotIdRef.current ??
      getPlayerPrefs().lastSaveSlotId ??
      1
    )
  }

  function patchSaveRetentionState(slotId: SaveSlotId, state: RetentionState) {
    const saved = loadRunFromSlot(slotId)
    if (!saved) return
    saveRunToSlot(slotId, { ...saved, retentionState: state })
  }

  function persistRetentionState(state: RetentionState) {
    const slot = getRetentionSlot()
    saveRetentionToLocalSlot(slot, state)
    patchSaveRetentionState(slot, state)
  }

  function persistSaveToSlot(slotId: SaveSlotId, data: RunSaveData) {
    saveRunToSlot(slotId, data)
    refreshLocalSlots()
    if (authUserRef.current && isSupabaseConfigured()) {
      void saveToCloudSlot(slotId, buildSaveEnvelope(slotId, data))
    }
  }

  function grantRetentionRewardToSave(
    slotId: SaveSlotId,
    grant: RetentionRewardGrant,
    retentionState: RetentionState,
  ): boolean {
    const saved = loadRunFromSlot(slotId)
    if (!saved?.runCreature) return false
    const starter = normalizeRunCreature(saved.runCreature, saved.starterId)
    const payload = retentionRewardToPayload(grant)
    const applied = grantQuestReward(payload, {
      starter,
      recruits: saved.partyRecruits,
      inventory:
        saved.trainerInventory ??
        migrateLegacyGearInventory(emptyTrainerInventory(), saved.gearInventory),
    })
    persistSaveToSlot(slotId, {
      ...saved,
      runCreature: applied.runState.starter,
      partyRecruits: applied.runState.recruits,
      trainerInventory: applied.runState.inventory,
      retentionState,
    })
    return true
  }

  function applyRetentionRewardGrant(
    retentionState: RetentionState,
    grant: RetentionRewardGrant,
  ): RetentionState {
    if (!hasRetentionGrantValue(grant)) return retentionState

    const payload = retentionRewardToPayload(grant)

    if (runCreatureRef.current) {
      const applied = grantQuestReward(payload, {
        starter: runCreatureRef.current,
        recruits: partyRecruitsRef.current,
        inventory: trainerInventoryRef.current,
      })
      runCreatureRef.current = applied.runState.starter
      setRunCreature(applied.runState.starter)
      setPartyRecruits(applied.runState.recruits)
      partyRecruitsRef.current = applied.runState.recruits
      setTrainerInventory(applied.runState.inventory)
      trainerInventoryRef.current = applied.runState.inventory
      if (
        applied.progression &&
        beginStandaloneProgressionFlow(
          applied.runState.starter,
          applied.runState.recruits,
          applied.progression,
        )
      ) {
        return retentionState
      }
      return retentionState
    }

    const slot = getRetentionSlot()
    if (grantRetentionRewardToSave(slot, grant, retentionState)) {
      return retentionState
    }

    return {
      ...retentionState,
      pendingRewards: mergePendingRetentionRewards(
        retentionState.pendingRewards,
        grant,
      ),
    }
  }

  function applyRetentionPendingToRun(state: RetentionState): RetentionState {
    const pending = state.pendingRewards
    if (
      !runCreatureRef.current ||
      (pending.coins <= 0 && pending.items.length === 0 && pending.gearIds.length === 0)
    ) {
      return state
    }
    const applied = applyPendingRetentionRewards(
      runCreatureRef.current,
      partyRecruitsRef.current,
      trainerInventoryRef.current,
      pending,
    )
    runCreatureRef.current = applied.starter
    setRunCreature(applied.starter)
    setTrainerInventory(applied.inventory)
    trainerInventoryRef.current = applied.inventory
    return { ...state, pendingRewards: applied.cleared }
  }

  function dispatchRetentionEvent(
    event: GameEventType,
    payload: GameEventPayload = {},
  ) {
    setRetentionState((prev) => {
      const result = trackGameEvent(prev, event, payload)
      if (result.newlyUnlockedAchievements.length > 0) {
        setAchievementUnlockToasts((toasts) => [
          ...toasts,
          ...result.newlyUnlockedAchievements.map((a) => ({
            id: `${a.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: a.title,
          })),
        ])
      }
      const withPending = applyRetentionPendingToRun(result.state)
      persistRetentionState(withPending)
      return withPending
    })
  }

  function handleRetentionStateChange(
    next: RetentionState,
    claimedReward?: RetentionRewardGrant | null,
  ) {
    let merged = next
    if (claimedReward && hasRetentionGrantValue(claimedReward)) {
      merged = applyRetentionRewardGrant(next, claimedReward)
    } else {
      merged = applyRetentionPendingToRun(next)
    }
    setRetentionState(merged)
    persistRetentionState(merged)
    void persistRun()
  }

  function openMonolithArchive() {
    const slot = getRetentionSlot()
    const loaded = loadRetentionFromLocalSlot(slot)
    setRetentionState(loaded)
    setArchiveMessage(null)
    if (tutorialActive && tutorialStep === 'recoveryStation') {
      advanceTutorialTo('monolithArchive')
    }
    setScreen('monolithArchive')
  }

  function dismissAchievementToast(id: string) {
    setAchievementUnlockToasts((prev) => prev.filter((t) => t.id !== id))
  }

  function renderAchievementToasts() {
    return (
      <AchievementUnlockToastStack
        toasts={achievementUnlockToasts}
        onDismiss={dismissAchievementToast}
      />
    )
  }

  function renderGlobalToasts() {
    return (
      <>
        {renderQuestToasts()}
        {renderAchievementToasts()}
      </>
    )
  }

  function buildRequestQuestCtx(): RequestQuestRunContext | null {
    if (!runCreature) return null
    return {
      starter: runCreature,
      recruits: partyRecruits,
      currentRegionId,
      earnedBadges,
    }
  }

  function handleAcceptRequest(questId: string) {
    setRequestQuestState((s) => {
      const result = acceptRequestQuest(s, questId)
      if (!result.ok) {
        if (result.reason === 'max_active') {
          setRequestBoardMessage('You can only carry 3 requests at a time.')
        } else {
          setRequestBoardMessage('Could not accept this request.')
        }
        return s
      }
      persistRequestQuestProgress(result.state)
      setRequestBoardMessage('Request accepted.')
      return result.state
    })
  }

  function handleAbandonRequest(questId: string) {
    setRequestQuestState((s) => {
      const next = abandonRequestQuest(s, questId)
      persistRequestQuestProgress(next)
      setRequestBoardMessage('Request abandoned.')
      return next
    })
  }

  function handleRefreshRequests() {
    const ctx = buildRequestQuestCtx()
    if (!ctx || !runCreature) return
    const today = getTodayDateKey()
    let working = requestQuestState
    if (working.lastRefreshDate !== today) {
      working = { ...working, lastRefreshDate: today, freeRefreshUsedToday: false }
    }
    const result = refreshAvailableRequests(working, ctx, runCreature.coins)
    if (!result.ok) {
      setRequestBoardMessage('Not enough coins to refresh (10 coins).')
      return
    }
    let nextStarter = runCreature
    if (result.chargedCoins > 0) {
      nextStarter = spendCoins(runCreature, result.chargedCoins)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    }
    setRequestQuestState(result.state)
    persistRequestQuestProgress(result.state)
    setRequestBoardMessage(
      result.usedFreeRefresh
        ? 'Requests refreshed (free daily refresh).'
        : `Requests refreshed for ${result.chargedCoins} coins.`,
    )
    void persistRun()
  }

  function beginStandaloneProgressionFlow(
    starter: RunCreature,
    recruits: PartyCreature[],
    progression: RewardProgressionResult,
  ): boolean {
    const postQueue = buildPostBattleQueue({
      perkDraftQueue: progression.perkDraftQueue,
      evolutionQueue: progression.evolutionQueue,
      starter,
      recruits,
      levelBeforeStarter: progression.starterLevelBefore,
      recruitLevelsBefore: progression.recruitLevelsBefore,
      masteryPerkQueue: [],
      masteryTransformQueue: [],
    })
    if (postQueue.length === 0) return false

    setPendingPerkDraftQueue(progression.perkDraftQueue)
    setPendingEvolutionQueue(progression.evolutionQueue)
    setPendingPostBattleQueue(postQueue)
    pendingPostBattleQueueRef.current = postQueue
    progressionFlowSourceRef.current = 'standalone'
    processNextPostBattleEvent(starter, recruits, postQueue)
    return true
  }

  function handleClaimRequest(questId: string) {
    const ctx = buildRequestQuestCtx()
    if (!ctx || !runCreature) return
    const result = claimRequestQuestReward(
      requestQuestState,
      questId,
      ctx,
      trainerInventory,
    )
    if (!result) {
      setRequestBoardMessage('Could not claim this request.')
      return
    }
    setRequestQuestState(result.state)
    persistRequestQuestProgress(result.state)
    setRunCreature(result.starter)
    setPartyRecruits(result.recruits)
    runCreatureRef.current = result.starter
    partyRecruitsRef.current = result.recruits
    setTrainerInventory(result.inventory)
    const levelUpNote =
      result.progression && result.progression.levelUpLines.length > 0
        ? ` ${result.progression.levelUpLines.map((l: CreatureLevelUpLine) => `${l.name} reached Lv.${l.newLevel}!`).join(' ')}`
        : ''
    setRequestBoardMessage(`Rewards claimed: ${result.rewardSummary}.${levelUpNote}`)
    if (
      result.progression &&
      beginStandaloneProgressionFlow(
        result.starter,
        result.recruits,
        result.progression,
      )
    ) {
      void persistRun()
      return
    }
    void persistRun()
  }

  function emitForgeRetentionEvents(flags: {
    craftedConsumable?: boolean
    craftedGear?: boolean
    exchanged?: boolean
    usedAlphaClaw?: boolean
    upgraded?: boolean
  }) {
    if (flags.craftedConsumable) {
      dispatchRetentionEvent('itemCrafted', {})
    }
    if (flags.craftedGear) {
      dispatchRetentionEvent('gearCrafted', {
        usedAlphaClaw: flags.usedAlphaClaw,
      })
    }
    if (flags.exchanged) {
      dispatchRetentionEvent('materialExchanged', {})
    }
    if (flags.upgraded) {
      dispatchRetentionEvent('gearUpgraded', {})
    }
  }

  function handleForgeCraft(recipeId: string) {
    if (!runCreature) return
    const result = craftRecipe(
      recipeId,
      runCreature,
      trainerInventory,
      getPartyHighestLevel(runCreature, partyRecruits),
      currentRegionId,
    )
    if (!result.ok) {
      setForgeMessage(result.reason)
      return
    }
    setRunCreature(result.starter)
    runCreatureRef.current = result.starter
    setTrainerInventory(result.inventory)
    trainerInventoryRef.current = result.inventory
    setForgeMessage(result.message)
    emitForgeRetentionEvents({
      craftedConsumable: result.craftedConsumable,
      craftedGear: result.craftedGear,
      exchanged: result.exchanged,
      usedAlphaClaw: result.usedAlphaClaw,
    })
    void persistRun()
  }

  function handleForgeUpgradeInventory(instanceId: string) {
    if (!runCreature) return
    const result = upgradeGearInstance(
      instanceId,
      runCreature,
      partyRecruits,
      trainerInventory,
    )
    if (!result.ok) {
      setForgeMessage(result.reason)
      return
    }
    setRunCreature(result.starter)
    runCreatureRef.current = result.starter
    setPartyRecruits(result.recruits)
    partyRecruitsRef.current = result.recruits
    setTrainerInventory(result.inventory)
    trainerInventoryRef.current = result.inventory
    setForgeMessage(result.message)
    emitForgeRetentionEvents({ upgraded: true })
    void persistRun()
  }

  function handleForgeUpgradeEquipped(creatureKey: string) {
    if (!runCreature) return
    const result = upgradeEquippedGear(
      creatureKey,
      runCreature,
      partyRecruits,
      trainerInventory,
    )
    if (!result.ok) {
      setForgeMessage(result.reason)
      return
    }
    setRunCreature(result.starter)
    runCreatureRef.current = result.starter
    setPartyRecruits(result.recruits)
    partyRecruitsRef.current = result.recruits
    setTrainerInventory(result.inventory)
    trainerInventoryRef.current = result.inventory
    setForgeMessage(result.message)
    emitForgeRetentionEvents({ upgraded: true })
    void persistRun()
  }

  function buildSaveData(): RunSaveData | null {
    if (!selectedStarter || !runCreature) return null

    return {
      version: SAVE_VERSION,
      starterId: selectedStarter.id,
      runCreature,
      mapNodes,
      nodeStates,
      partyRecruits,
      activeHelperId,
      earnedBadges,
      currentRegion: currentRegionId,
      completedRegionIds,
      pendingBossVictory,
      regionCompleteInfo,
      screen: toSavableScreen(screen),
      activeNodeId,
      pendingPerkDraftQueue,
      draftingCreatureId,
      shopLog,
      shopInventoriesByNodeId,
      shopRareOfferHistory,
      restChoiceMade,
      currentEventId: currentEvent?.id ?? null,
      rewardInfo,
      defeatInfo,
      draftPerkIds: draftOptions.map((p) => p.id),
      pendingRecruit,
      pendingEvolutionQueue,
      pendingAbilityUpgradeQueue,
      pendingTransformQueue,
      pendingPostBattleQueue,
      trainerInventory,
      questState,
      requestQuestState,
      retentionState,
      monolithCouncilState,
    }
  }

  function getDailyEnemySpawnOptions(): EnemySpawnOptions | undefined {
    if (runModeRef.current !== 'daily') return undefined
    const mod = dailyModifierRef.current
    return {
      fireBias: mod.fireEnemyBias,
      hpMult: mod.enemyHpMult,
      dailySeed: dailySeedRef.current ?? undefined,
    }
  }

  function applyFreshDailyRunSnapshot(snapshot: FreshDailyRunSnapshot) {
    setCurrentRegionId(snapshot.regionId)
    setCompletedRegionIds(snapshot.completedRegionIds)
    setEarnedBadges(snapshot.earnedBadges)
    setMapNodes(snapshot.mapNodes)
    setNodeStates(snapshot.nodeStates)
    setPartyRecruits(snapshot.partyRecruits)
    partyRecruitsRef.current = snapshot.partyRecruits
    setActiveHelperId(snapshot.activeHelperId)
    setPendingPerkDraftQueue(snapshot.pendingPerkDraftQueue)
    setPendingEvolutionQueue(snapshot.pendingEvolutionQueue)
    setPendingAbilityUpgradeQueue(snapshot.pendingAbilityUpgradeQueue)
    pendingAbilityUpgradeQueueRef.current = snapshot.pendingAbilityUpgradeQueue
    setPendingTransformQueue(snapshot.pendingTransformQueue)
    pendingTransformQueueRef.current = snapshot.pendingTransformQueue
    setPendingPostBattleQueue(snapshot.pendingPostBattleQueue)
    pendingPostBattleQueueRef.current = snapshot.pendingPostBattleQueue
    setEnemy(null)
    setActiveNodeId(null)
    setCurrentNode(null)
    setLastCombatNode(null)
    setPendingBossVictory(false)
    setRegionCompleteInfo(null)
    setPendingRecruit(null)
    scoreTrackerRef.current = snapshot.scoreTracker
    console.log('Daily Run fresh state', {
      dailySeed: snapshot.dailySeed,
      currentRegion: snapshot.regionId,
      enemyLevelRange: snapshot.enemyLevelRange,
      mapNodeCount: snapshot.mapNodes.length,
    })
  }

  function buildDailyScoreInput(completed = false): DailyRunScoreInput | null {
    if (!runCreature || !selectedStarter) return null
    return {
      starter: runCreature,
      recruits: partyRecruits,
      earnedBadges,
      currentRegionId,
      nodeStates,
      scoreTracker: scoreTrackerRef.current,
      completed,
    }
  }

  function syncDailyDayStateFromGame(completed = false): DailyRunDayState | null {
    if (!dailySeedRef.current || !selectedStarter || !runCreature) return null
    const input = buildDailyScoreInput(completed)
    if (!input) return null

    const day = getDailyRunDayStateForToday(
      dailySeedRef.current,
      dailyModifierRef.current.id,
    )
    day.currentAttemptRunState = {
      starterId: selectedStarter.id,
      runCreature,
      partyRecruits,
      activeHelperId,
      mapNodes,
      nodeStates,
      earnedBadges,
      currentRegion: currentRegionId,
      scoreTracker: scoreTrackerRef.current,
      trainerInventory,
    }
    day.currentAttemptScore = calculateCurrentAttemptScore(input)
    day.currentCheckpoint = calculateCheckpoint(input)
    day.leaderboardSubmitted =
      scoreTrackerRef.current.submittedToLeaderboard || day.leaderboardSubmitted
    saveDailyRunDayState(day)
    return day
  }

  function saveDailyRunProgress() {
    if (
      runModeRef.current !== 'daily' ||
      !dailySeedRef.current ||
      !selectedStarter ||
      !runCreature
    ) {
      return
    }
    syncDailyDayStateFromGame(false)
  }

  function refreshDailyMenu() {
    const seed = getDailySeed()
    setDailySeed(seed)
    dailySeedRef.current = seed
    const mod = getDailyModifierForSeed(seed)
    setDailyModifier(mod)
    dailyModifierRef.current = mod
    if (authUserRef.current) {
      void loadLeaderboardForSeed(seed).then((rows) => {
        setDailyMenuRank(
          getPlayerRank(rows, authUserRef.current?.id, resolveDailyLeaderboardSlot()),
        )
      })
    } else {
      setDailyMenuRank(null)
    }
  }

  function goToProfileSetup(
    returnScreen: Screen,
    options?: { callback?: () => void; playMode?: PlayMode },
  ) {
    profileReturnRef.current = {
      screen: returnScreen,
      callback: options?.callback,
      playMode: options?.playMode,
    }
    setProfileSetupError(null)
    setScreen('profileSetup')
  }

  function finishProfileSetup(profile: PlayerProfile) {
    setPlayerProfile(profile)
    setProfileSetupError(null)
    const { screen: returnScreen, callback, playMode } = profileReturnRef.current
    if (callback) {
      callback()
      return
    }
    if (returnScreen === 'characterSelect' && playMode) {
      setPlayMode(playMode)
      playModeRef.current = playMode
      setSelectedCharSlot(null)
      refreshLocalSlots()
      if (playMode === 'cloud') {
        void refreshCloudSlots()
      }
      setScreen('characterSelect')
      return
    }
    setScreen(returnScreen)
  }

  function requireProfileOrSetup(
    returnScreen: Screen,
    onReady: () => void,
    options?: { playMode?: PlayMode },
  ): void {
    if (!authUserRef.current) {
      onReady()
      return
    }
    if (playerProfile) {
      onReady()
      return
    }
    goToProfileSetup(returnScreen, {
      callback: onReady,
      playMode: options?.playMode,
    })
  }

  function openDailyRunMenu() {
    refreshDailyMenu()
    if (!authUserRef.current) {
      setScreen('dailyRun')
      return
    }
    requireProfileOrSetup('dailyRun', () => setScreen('dailyRun'))
  }

  function setupDailyRunSession(seed: string, modifier: DailyModifier) {
    setDailySeed(seed)
    dailySeedRef.current = seed
    setDailyModifier(modifier)
    dailyModifierRef.current = modifier
    setRunMode('daily')
    runModeRef.current = 'daily'
    setGameRngOverride(createSeededRng(seed))
    setPlayMode(null)
    setActiveSlotId(null)
    activeSlotIdRef.current = null
    setCurrentRegionId(getDailyRunRegionId())
  }

  function teardownDailyRunSession() {
    setRunMode('normal')
    runModeRef.current = 'normal'
    setGameRngOverride(null)
  }

  function openRunSummary(completed: boolean) {
    const starter = runCreatureRef.current ?? runCreature
    if (!starter || !dailySeedRef.current) return
    const recruits = partyRecruitsRef.current ?? partyRecruits
    if (runModeRef.current === 'daily') {
      syncDailyDayStateFromGame(completed)
      const input = buildDailyScoreInput(completed)
      if (input) {
        let day = getDailyRunDayStateForToday(
          dailySeedRef.current,
          dailyModifierRef.current.id,
        )
        const result = updateBestDailyScore(day, input)
        saveDailyRunDayState(result.dayState)
      }
    }
    const snapshot = buildRunScore(
      scoreTrackerRef.current,
      starter,
      recruits,
      completed,
    )
    setRunSummaryScore(snapshot)
    setSubmitMessage(null)
    if (completed) {
      dispatchRetentionEvent('dailyRunCompleted')
    }
    setScreen('runSummary')
    if (runModeRef.current === 'daily') {
      void tryAutoSubmitDailyLeaderboard({ completed, silent: false })
    }
  }

  async function loadLeaderboardForSeed(seed: string): Promise<LeaderboardRow[]> {
    setLeaderboardLoading(true)
    setLeaderboardError(null)
    const result = await fetchLeaderboard(seed, 50)
    setLeaderboardRows(result.rows)
    if (result.error) {
      setLeaderboardError(result.error)
    }
    setLeaderboardLoading(false)
    return result.rows
  }

  function openLeaderboard(from: Screen = screenRef.current, mode: 'daily' | 'campaign' = 'daily') {
    leaderboardReturnScreenRef.current = from
    setLeaderboardTab(mode)
    const seed =
      mode === 'campaign'
        ? getCampaignLeaderboardSeed(activeSlotIdRef.current ?? 1)
        : getDailySeed()
    setLeaderboardSeed(seed)
    requireProfileOrSetup('leaderboard', () => {
      void loadLeaderboardForSeed(seed).then(() => setScreen('leaderboard'))
    })
  }

  function handleLeaderboardTabChange(tab: 'daily' | 'campaign') {
    setLeaderboardTab(tab)
    const seed =
      tab === 'campaign'
        ? getCampaignLeaderboardSeed(activeSlotIdRef.current ?? 1)
        : getDailySeed()
    setLeaderboardSeed(seed)
    void loadLeaderboardForSeed(seed)
  }

  async function tryAutoSubmitDailyLeaderboard(options?: {
    completed?: boolean
    silent?: boolean
  }) {
    if (!authUser || !playerProfile) return
    const day = loadDailyRunDayState()
    if (!day || day.bestScore <= 0) return

    const summary = day.bestRunSummary
    const checkpoint = summary?.checkpoint ?? day.bestCheckpoint
    const attempt = day.currentAttemptRunState
    const starter = attempt?.runCreature ?? runCreature
    if (!starter || !checkpoint) return

    const slotId = resolveDailyLeaderboardSlot()
    const slotMeta = resolveLeaderboardSubmitSlot(slotId)

    const result = await submitLeaderboardScore({
      seed: day.dailySeed,
      scoreSnapshot: {
        total: day.bestScore,
        breakdown: [{ label: 'Best daily score', points: day.bestScore }],
        completed: summary?.completed ?? options?.completed ?? false,
      },
      regionId: checkpoint.region,
      starter,
      recruits: attempt?.partyRecruits ?? partyRecruits,
      badgesEarned: checkpoint.badgesEarned,
      evolutionsCount: checkpoint.evolutionsCount,
      checkpoint,
      forceBestScore: day.bestScore,
      slotId: slotMeta.slotId,
      saveName: slotMeta.saveName,
      trainerName: slotMeta.trainerName,
    })

    if (result.ok) {
      day.leaderboardSubmitted = true
      saveDailyRunDayState(day)
      scoreTrackerRef.current.submittedToLeaderboard = true
      dispatchRetentionEvent('leaderboardSubmitted')
      if (!options?.silent) {
        setSubmitMessage(
          result.keptPrevious
            ? 'Your previous higher score was kept on the leaderboard.'
            : 'Score submitted to daily leaderboard!',
        )
      }
    } else if (!options?.silent && result.error) {
      setSubmitMessage(result.error)
    }
  }

  async function tryAutoSubmitCampaignLeaderboard(completed = false, silent = true) {
    if (!authUser || !playerProfile) return
    const slotId = activeSlotIdRef.current
    if (!slotId || runModeRef.current !== 'normal') return
    const input = buildDailyScoreInput(completed)
    if (!input) return
    const checkpoint = calculateCheckpoint(input)
    if (checkpoint.nodesCleared === 0 && checkpoint.badgesEarned === 0) return

    const progressScore = calculateProgressScore(checkpoint)
    const slotMeta = resolveLeaderboardSubmitSlot(slotId)
    const result = await submitLeaderboardScore({
      seed: getCampaignLeaderboardSeed(slotId),
      scoreSnapshot: {
        total: progressScore,
        breakdown: [{ label: 'Campaign progression', points: progressScore }],
        completed,
      },
      regionId: checkpoint.region,
      starter: input.starter,
      recruits: input.recruits,
      badgesEarned: checkpoint.badgesEarned,
      evolutionsCount: checkpoint.evolutionsCount,
      checkpoint,
      slotId: slotMeta.slotId,
      saveName: slotMeta.saveName,
      trainerName: slotMeta.trainerName,
    })

    if (result.ok && !result.keptPrevious) {
      dispatchRetentionEvent('leaderboardSubmitted')
      if (!silent) {
        setMapMessage('Campaign progress submitted to leaderboard.')
      }
    }
  }

  function beginDailyAttempt() {
    const seed = getDailySeed()
    const modifier = getDailyModifierForSeed(seed)
    const slot =
      activeSlotIdRef.current ?? getPlayerPrefs().lastSaveSlotId ?? 1
    dailyRunSlotRef.current = slot
    setLastSaveSlotId(slot)
    if (authUserRef.current && !playerProfile) {
      goToProfileSetup('dailyRun', { callback: () => beginDailyAttempt() })
      return
    }
    let day = getDailyRunDayStateForToday(seed, modifier.id)
    day.totalAttempts += 1
    day.currentAttemptDeaths = 0
    day = resetCurrentDailyAttempt(day)
    saveDailyRunDayState(day)
    setupDailyRunSession(seed, modifier)
    resetRunMemory()
    applyFreshDailyRunSnapshot(createFreshDailyRunState(seed, modifier))
    partyOpenedThisRunRef.current = false
    beginTutorialIfNeeded()
    setScreen('starterSelect')
  }

  function restartDailyAttempt() {
    const ok = window.confirm(
      'Restart this daily attempt? Your current attempt progress will reset, but your best score will be kept.',
    )
    if (!ok) return
    const seed = getDailySeed()
    const modifier = getDailyModifierForSeed(seed)
    const slot =
      dailyRunSlotRef.current ??
      activeSlotIdRef.current ??
      getPlayerPrefs().lastSaveSlotId ??
      1
    dailyRunSlotRef.current = slot
    let day = getDailyRunDayStateForToday(seed, modifier.id)
    day.totalAttempts += 1
    day.currentAttemptDeaths = 0
    day = resetCurrentDailyAttempt(day)
    saveDailyRunDayState(day)
    setupDailyRunSession(seed, modifier)
    resetRunMemory()
    applyFreshDailyRunSnapshot(createFreshDailyRunState(seed, modifier))
    partyOpenedThisRunRef.current = false
    setScreen('starterSelect')
  }

  function continueDailyRunSaved() {
    const day = loadDailyRunDayState()
    const saved = day?.currentAttemptRunState
    if (!day || !saved || day.dailySeed !== getDailySeed()) {
      window.alert('No daily run in progress for today.')
      return
    }
    const modifier =
      day.modifierId === dailyModifierRef.current.id
        ? dailyModifierRef.current
        : getDailyModifierForSeed(day.dailySeed)
    setupDailyRunSession(day.dailySeed, modifier)
    scoreTrackerRef.current = saved.scoreTracker
    const starter = STARTERS.find((s) => s.id === saved.starterId)
    if (!starter) return
    setSelectedStarter(starter)
    setRunCreature(saved.runCreature)
    setPartyRecruits(saved.partyRecruits)
    setActiveHelperId(saved.activeHelperId)
    setMapNodes(saved.mapNodes)
    setNodeStates(saved.nodeStates)
    setEarnedBadges(saved.earnedBadges)
    setCurrentRegionId(saved.currentRegion)
    setTrainerInventory(
      saved.trainerInventory ??
        migrateLegacyGearInventory(emptyTrainerInventory(), undefined),
    )
    setScreen('runMap')
  }

  function handleDailyDefeatAfterDeath() {
    const input = buildDailyScoreInput(false)
    const seed = getDailySeed()
    const modifier = getDailyModifierForSeed(seed)
    let day = getDailyRunDayStateForToday(seed, modifier.id)
    let newBest = false
    let attemptScoreAtDeath = 0

    if (input) {
      attemptScoreAtDeath = calculateCurrentAttemptScore(input)
      const result = updateBestDailyScore(day, input)
      day = result.dayState
      newBest = result.newBest
    }

    day.currentAttemptDeaths += 1
    day = resetCurrentDailyAttempt(day)
    saveDailyRunDayState(day)

    setDailyDefeatNewBest(newBest)
    setDailyDefeatAttemptScore(attemptScoreAtDeath)
    setDailyDefeatBestScore(day.bestScore)
    setDailyDefeatBestCheckpoint(formatCheckpointLabel(day.bestCheckpoint))
    resetRunMemory()
    setRunMode('normal')
    runModeRef.current = 'normal'
    setGameRngOverride(null)
    setScreen('dailyDefeat')
    void tryAutoSubmitDailyLeaderboard({ silent: true })
  }

  async function handleSubmitBestDailyScore(fromMenu = false) {
    const day = loadDailyRunDayState()
    if (!day || day.bestScore <= 0) {
      if (fromMenu) setDailyMenuSubmitMessage('No best score to submit yet.')
      return
    }
    if (!authUser) {
      if (fromMenu) setDailyMenuSubmitMessage('Login required to submit.')
      return
    }
    if (!playerProfile) {
      goToProfileSetup('dailyRun', {
        callback: () => void handleSubmitBestDailyScore(fromMenu),
      })
      return
    }

    const summary = day.bestRunSummary
    const checkpoint = summary?.checkpoint ?? day.bestCheckpoint
    const attempt = day.currentAttemptRunState
    const starter = attempt?.runCreature ?? runCreature
    if (!starter || !checkpoint) return

    if (fromMenu) setDailyMenuSubmitMessage(null)
    else setSubmitMessage(null)
    setSubmitBusy(true)

    const scoreSnapshot: RunScoreSnapshot = {
      total: day.bestScore,
      breakdown: [{ label: 'Best daily score', points: day.bestScore }],
      completed: summary?.completed ?? false,
    }

    const slotId = resolveDailyLeaderboardSlot()
    const slotMeta = resolveLeaderboardSubmitSlot(slotId)

    const result = await submitLeaderboardScore({
      seed: day.dailySeed,
      scoreSnapshot,
      regionId: checkpoint.region,
      starter,
      recruits: attempt?.partyRecruits ?? partyRecruits,
      badgesEarned: checkpoint.badgesEarned,
      evolutionsCount: checkpoint.evolutionsCount,
      checkpoint,
      forceBestScore: day.bestScore,
      slotId: slotMeta.slotId,
      saveName: slotMeta.saveName,
      trainerName: slotMeta.trainerName,
    })

    setSubmitBusy(false)

    if (!result.ok) {
      const msg = result.error ?? 'Submit failed.'
      if (fromMenu) setDailyMenuSubmitMessage(msg)
      else setSubmitMessage(msg)
      return
    }

    day.leaderboardSubmitted = true
    saveDailyRunDayState(day)
    scoreTrackerRef.current.submittedToLeaderboard = true
    dispatchRetentionEvent('leaderboardSubmitted')

    const successMsg = result.keptPrevious
      ? 'Your previous higher score was kept on the leaderboard.'
      : 'Best score submitted to leaderboard!'

    if (fromMenu) setDailyMenuSubmitMessage(successMsg)
    else setSubmitMessage(successMsg)
  }

  async function persistRun() {
    if (persistInFlightRef.current) {
      persistQueuedRef.current = true
      return
    }

    if (runModeRef.current === 'daily') {
      if (!runCreature) return
      persistInFlightRef.current = true
      setSaveStatus('saving')
      saveDailyRunProgress()
      setSaveStatus('local')
      persistInFlightRef.current = false
      if (persistQueuedRef.current) {
        persistQueuedRef.current = false
        void persistRun()
      }
      return
    }

    const slotId = activeSlotIdRef.current
    const data = buildSaveData()
    if (!slotId || !data) {
      if (persistQueuedRef.current) {
        persistQueuedRef.current = false
        void persistRun()
      }
      return
    }

    persistInFlightRef.current = true
    setSaveStatus('saving')
    setSaveWarning(null)

    const existing = loadEnvelopeFromSlot(slotId)
    const meta = getSaveSlotMeta(slotId)
    const envelope = buildSaveEnvelope(slotId, data, {
      saveName: existing?.saveName ?? meta.saveName,
      trainerName: existing?.trainerName ?? meta.trainerName,
      createdAt: existing?.createdAt ?? meta.createdAt,
    })
    const mode = playModeRef.current

    try {
      if (mode === 'cloud' && authUserRef.current && isSupabaseConfigured()) {
        const localOk = saveRunToSlot(slotId, data, {
          saveName: envelope.saveName,
          trainerName: envelope.trainerName,
          createdAt: envelope.createdAt,
        })
        const cloudResult = await saveToCloudSlot(slotId, envelope)
        if (cloudResult.ok) {
          setSaveStatus('cloud')
          await refreshCloudSlots()
        } else if (localOk) {
          setSaveStatus('warning')
          setSaveWarning('Cloud save failed. Local backup saved.')
          refreshLocalSlots()
        } else {
          setSaveStatus('failed')
        }
      } else if (
        saveRunToSlot(slotId, data, {
          saveName: envelope.saveName,
          trainerName: envelope.trainerName,
          createdAt: envelope.createdAt,
        })
      ) {
        setSaveStatus('local')
        refreshLocalSlots()
      } else {
        setSaveStatus('failed')
      }
    } finally {
      persistInFlightRef.current = false
      if (persistQueuedRef.current) {
        persistQueuedRef.current = false
        void persistRun()
      }
    }
  }

  async function persistSaveData(data: RunSaveData, nameMeta?: Partial<SaveSlotMeta>) {
    const slotId = activeSlotIdRef.current
    if (!slotId || persistInFlightRef.current) return

    persistInFlightRef.current = true
    setSaveStatus('saving')
    setSaveWarning(null)

    const existing = loadEnvelopeFromSlot(slotId)
    const fallback = getSaveSlotMeta(slotId)
    const meta: SaveSlotMeta = {
      saveName: nameMeta?.saveName ?? existing?.saveName ?? fallback.saveName,
      trainerName:
        nameMeta?.trainerName ?? existing?.trainerName ?? fallback.trainerName,
      createdAt:
        nameMeta?.createdAt ?? existing?.createdAt ?? fallback.createdAt,
    }
    const envelope = buildSaveEnvelope(slotId, data, meta)
    const mode = playModeRef.current

    if (mode === 'cloud' && authUserRef.current && isSupabaseConfigured()) {
      const localOk = saveRunToSlot(slotId, data, meta)
      const cloudResult = await saveToCloudSlot(slotId, envelope)
      if (cloudResult.ok) {
        setSaveStatus('cloud')
        await refreshCloudSlots()
      } else if (localOk) {
        setSaveStatus('warning')
        setSaveWarning('Cloud save failed. Local backup saved.')
        refreshLocalSlots()
      } else {
        setSaveStatus('failed')
      }
    } else if (saveRunToSlot(slotId, data, meta)) {
      setSaveStatus('local')
      refreshLocalSlots()
    } else {
      setSaveStatus('failed')
    }

    persistInFlightRef.current = false
  }

  function haltActiveSlotAutosave() {
    activeSlotIdRef.current = null
    setActiveSlotId(null)
  }

  function applySaveToState(saved: RunSaveData, forceRunMap: boolean): boolean {
    const starter = STARTERS.find((s) => s.id === saved.starterId)
    if (!starter) {
      const slot = activeSlotIdRef.current
      if (slot) clearSaveSlot(slot)
      return false
    }

    setSelectedStarter(starter)
    const loadedCouncilState = normalizeCouncilState(saved.monolithCouncilState)
    const loadedRegionId = normalizeRegionId(saved.currentRegion)
    const councilReconciled = reconcileMonolithCouncilUnlocks(
      loadedCouncilState,
      saved.earnedBadges,
      { preferNotifyRegionId: loadedRegionId },
    )
    const councilMapApplied = applyCouncilMapState(
      saved.mapNodes,
      saved.nodeStates,
      loadedRegionId,
      councilReconciled.state,
      saved.earnedBadges,
    )
    setMapNodes(councilMapApplied.nodes)
    setNodeStates(councilMapApplied.states)
    const normalizedCreature = normalizeRunCreature(
      saved.runCreature,
      saved.starterId,
    )
    setRunCreature(normalizedCreature)
    setPartyRecruits(saved.partyRecruits)
    setPendingPerkDraftQueue(saved.pendingPerkDraftQueue ?? [])
    setDraftingCreatureId(saved.draftingCreatureId ?? null)
    setPendingEvolutionQueue(saved.pendingEvolutionQueue ?? [])
    setPendingAbilityUpgradeQueue(saved.pendingAbilityUpgradeQueue ?? [])
    setPendingTransformQueue(saved.pendingTransformQueue ?? [])
    const restoredPostBattleQueue = saved.pendingPostBattleQueue ?? []
    setPendingPostBattleQueue(restoredPostBattleQueue)
    pendingPostBattleQueueRef.current = restoredPostBattleQueue
    setActiveHelperId(
      resolveActiveHelperId(
        saved.partyRecruits,
        saved.activeHelperId ?? null,
      ),
    )
    setEarnedBadges(saved.earnedBadges)
    setCurrentRegionId(loadedRegionId)
    setCompletedRegionIds(saved.completedRegionIds ?? [])
    setMonolithCouncilState(councilReconciled.state)
    if (councilReconciled.notificationMessage) {
      setMapMessage(
        `${councilReconciled.notificationMessage} Use Challenge Monolith Council on the map HUD or scroll to the node at the top of the route.`,
      )
      setCouncilMapFocusNodeId(getCouncilNodeId(loadedRegionId))
    }
    setPendingBossVictory(saved.pendingBossVictory ?? false)
    setRegionCompleteInfo(saved.regionCompleteInfo ?? null)

    setShopLog(saved.shopLog)
    const loadedShopStock = (saved.shopInventoriesByNodeId ?? {}) as Record<
      string,
      PersistedShopInventory
    >
    setShopInventoriesByNodeId(loadedShopStock)
    setShopRareOfferHistory(saved.shopRareOfferHistory ?? [])
    if (saved.activeNodeId && loadedShopStock[saved.activeNodeId]) {
      setActiveShopInventory(loadedShopStock[saved.activeNodeId])
    } else {
      setActiveShopInventory(null)
    }
    setTrainerInventory(
      saved.trainerInventory ??
        migrateLegacyGearInventory(
          emptyTrainerInventory(),
          saved.gearInventory,
        ),
    )
    setQuestState(normalizeQuestState(saved.questState))
    setRequestQuestState(normalizeRequestQuestState(saved.requestQuestState))
    const loadedRetention = normalizeRetentionState(
      saved.retentionState ??
        loadRetentionFromLocalSlot(activeSlotIdRef.current ?? 1),
    )
    const pendingBefore = loadedRetention.pendingRewards
    const appliedRetention = applyPendingRetentionRewards(
      normalizedCreature,
      saved.partyRecruits,
      saved.trainerInventory ??
        migrateLegacyGearInventory(emptyTrainerInventory(), saved.gearInventory),
      pendingBefore,
    )
    const finalRetention = ensureStarterArchiveRegistered(
      {
        ...loadedRetention,
        pendingRewards: appliedRetention.cleared,
      },
      saved.starterId,
      normalizeRegionId(saved.currentRegion),
    )
    if (
      pendingBefore.coins > 0 ||
      pendingBefore.items.length > 0 ||
      pendingBefore.gearIds.length > 0
    ) {
      setRunCreature(appliedRetention.starter)
      runCreatureRef.current = appliedRetention.starter
      setTrainerInventory(appliedRetention.inventory)
    }
    setRetentionState(finalRetention)
    persistRetentionState(finalRetention)
    setRestChoiceMade(saved.restChoiceMade)
    setEnemy(null)
    setBattleLog([])
    setCombatLocked(false)
    setMapMessage(null)
    setNodeClickDebug(null)
    setPendingRecruit(saved.pendingRecruit)

    if (forceRunMap) {
      setActiveNodeId(null)
      setCurrentNode(null)
      setPendingPerkDraftQueue([])
      setDraftingCreatureId(null)
      setRewardInfo(null)
      setDefeatInfo(null)
      setDraftOptions([])
      setCurrentEvent(null)
      resetCombatSession()
      setScreen('runMap')
    } else if (saved.screen === 'defeat' && saved.defeatInfo) {
      setActiveNodeId(null)
      setCurrentNode(null)
      setPendingPerkDraftQueue([])
      setDraftingCreatureId(null)
      setRewardInfo(null)
      setDefeatInfo(saved.defeatInfo)
      setDraftOptions([])
      setCurrentEvent(null)
      resetCombatSession()
      setScreen('defeat')
    } else if (saved.screen === 'defeat') {
      setDefeatInfo(null)
      resetCombatSession()
      setScreen('runMap')
    } else {
      setActiveNodeId(saved.activeNodeId)
      setCurrentNode(
        saved.activeNodeId
          ? (getMapNodeFromList(saved.mapNodes, saved.activeNodeId) ?? null)
          : null,
      )
      setPendingPerkDraftQueue(saved.pendingPerkDraftQueue ?? [])
      setDraftingCreatureId(saved.draftingCreatureId ?? null)
      setRewardInfo(
        saved.rewardInfo
          ? {
              ...saved.rewardInfo,
              hasPerkDrafts:
                saved.rewardInfo.hasPerkDrafts ??
                saved.rewardInfo.starterLeveledUp ??
                false,
              masteryLines:
                (saved.rewardInfo as RewardInfo).masteryLines ?? [],
              pendingChoices:
                (saved.rewardInfo as RewardInfo).pendingChoices ?? [],
            }
          : null,
      )
      setDefeatInfo(saved.defeatInfo ?? null)
      setDraftOptions(
        saved.draftPerkIds
          .map((id) => {
            try {
              return getPerk(id)
            } catch {
              return null
            }
          })
          .filter((p): p is Perk => p !== null),
      )
      setCurrentEvent(
        saved.currentEventId
          ? (GAME_EVENTS.find((e) => e.id === saved.currentEventId) ?? null)
          : null,
      )
      let nextScreen: Screen = saved.screen
      const bossNode = saved.mapNodes.find((n) => n.type === 'boss')
      const bossCleared =
        bossNode && saved.nodeStates[bossNode.id] === 'completed'

      if (saved.regionCompleteInfo) {
        nextScreen = 'regionComplete'
      } else if (
        saved.pendingBossVictory ||
        (bossCleared && saved.rewardInfo?.bossVictory)
      ) {
        if (saved.rewardInfo?.bossVictory) {
          nextScreen = 'reward'
        } else if (bossCleared) {
          nextScreen = 'regionSelect'
        }
      }

      if (bossCleared && saved.activeNodeId === bossNode?.id) {
        setActiveNodeId(null)
        setCurrentNode(null)
      }

      setScreen(nextScreen)
    }

    return true
  }

  useEffect(() => {
    if (!selectedStarter || !runCreature || activeSlotId === null) return
    if (
      screen === 'title' ||
      screen === 'login' ||
      screen === 'register' ||
      screen === 'account' ||
      screen === 'characterSelect' ||
      screen === 'starterSelect' ||
      screen === 'combat' ||
      screen === 'dailyRun' ||
      screen === 'leaderboard' ||
      screen === 'runSummary' ||
      screen === 'profileSetup' ||
      screen === 'monolithArchive'
    ) {
      return
    }

    if (runMode === 'daily') {
      void persistRun()
      return
    }

    void persistRun()
  }, [
    activeSlotId,
    screen,
    selectedStarter,
    runCreature,
    mapNodes,
    nodeStates,
    partyRecruits,
    activeHelperId,
    earnedBadges,
    currentRegionId,
    completedRegionIds,
    pendingBossVictory,
    regionCompleteInfo,
    activeNodeId,
    pendingPerkDraftQueue,
    draftingCreatureId,
    shopLog,
    shopInventoriesByNodeId,
    shopRareOfferHistory,
    activeShopInventory,
    restChoiceMade,
    currentEvent,
    rewardInfo,
    defeatInfo,
    draftOptions,
    pendingRecruit,
    pendingEvolutionQueue,
    trainerInventory,
    retentionState,
  ])

  function resetRun() {
    setSelectedStarter(null)
    setPendingStarterId(null)
    setMapNodes([])
    setNodeStates({})
    setRunCreature(null)
    setPartyRecruits([])
    setActiveHelperId(null)
    setEarnedBadges([])
    setCurrentRegionId(DEFAULT_REGION_ID)
    setCompletedRegionIds([])
    setPendingBossVictory(false)
    setRegionCompleteInfo(null)
    setActiveNodeId(null)
    setActiveEncounterKind('battle')
    setEnemy(null)
    setBattleLog([])
    setRewardInfo(null)
    setDefeatInfo(null)
    setCombatLocked(false)
    setPendingPerkDraftQueue([])
    setDraftingCreatureId(null)
    setDraftOptions([])
    setShopLog([])
    setTrainerInventory(emptyTrainerInventory())
    setShopInventoriesByNodeId({})
    setShopRareOfferHistory([])
    setActiveShopInventory(null)
    setGearEquipCreatureId(null)
    setRestChoiceMade(false)
    setCurrentEvent(null)
    setMapMessage(null)
    setNodeClickDebug(null)
    setCurrentNode(null)
    setPendingRecruit(null)
    setCombatPhase('starter')
    setLastCombatNode(null)
    setPendingEvolutionQueue([])
    setEvolutionScreenData(null)
    setPendingAbilityUpgradeQueue([])
    setPendingTransformQueue([])
    setPendingPostBattleQueue([])
    setMoveLearnContext(null)
    setActiveTransformEntry(null)
    setInventoryMessage(null)
    resetCombatSession()
  }

  /** Clear all run state in React and refs (prevents stale region/enemy data after delete/new game). */
  function resetRunMemory() {
    resetRun()
    runCreatureRef.current = null
    partyRecruitsRef.current = []
    pendingAbilityUpgradeQueueRef.current = []
    pendingTransformQueueRef.current = []
    pendingPostBattleQueueRef.current = []
    scoreTrackerRef.current = createScoreTracker()
    preCombatMasteryRef.current = null
    partyOpenedThisRunRef.current = false
  }

  function goToTitle() {
    const slot = activeSlotIdRef.current
    if (slot) {
      saveRetentionToLocalSlot(slot, retentionStateRef.current)
    }
    resetRunMemory()
    setActiveSlotId(null)
    activeSlotIdRef.current = null
    setSelectedCharSlot(null)
    setPlayMode(null)
    setSaveStatus('idle')
    setSaveWarning(null)
    setRunSummaryScore(null)
    teardownDailyRunSession()
    refreshLocalSlots()
    refreshDailyMenu()
    setScreen('title')
  }

  async function handleProfileSetupSubmit(displayName: string) {
    setProfileBusy(true)
    setProfileSetupError(null)
    const result = await createPlayerProfile(displayName)
    setProfileBusy(false)
    if (!result.ok) {
      setProfileSetupError(result.error)
      return
    }
    finishProfileSetup(result.profile)
  }

  async function handleAccountChangeUsername(newName: string) {
    setAccountUsernameError(null)
    setProfileBusy(true)
    const result = await updatePlayerDisplayName(newName)
    setProfileBusy(false)
    if (!result.ok) {
      setAccountUsernameError(result.error)
      throw new Error(result.error)
    }
    setPlayerProfile(result.profile)
  }

  async function handleSubmitDailyScore() {
    await handleSubmitBestDailyScore(false)
  }

  function openCharacterSelect(mode: PlayMode) {
    if (mode === 'cloud' && authUserRef.current && !playerProfile) {
      goToProfileSetup('characterSelect', { playMode: 'cloud' })
      return
    }
    haltActiveSlotAutosave()
    resetRunMemory()
    teardownDailyRunSession()
    setSlotActionMessage(null)
    setPlayMode(mode)
    playModeRef.current = mode
    setSelectedCharSlot(null)
    refreshLocalSlots()
    if (mode === 'cloud') {
      void refreshCloudSlots()
    }
    setScreen('characterSelect')
  }

  async function loadSlotAndContinue(slotId: SaveSlotId, mode: PlayMode) {
    teardownDailyRunSession()
    setRunMode('normal')
    runModeRef.current = 'normal'
    let saved: RunSaveData | null = null
    if (mode === 'cloud') {
      const cloudLoad = await getCloudSaveSlotResult(slotId)
      if (cloudLoad.error) {
        window.alert(cloudLoad.error)
        return
      }
      const envelope = cloudLoad.envelope
      if (!envelope) {
        window.alert('Could not load cloud save. The slot may be empty or corrupted.')
        return
      }
      saved = envelope.data
      saveRunToSlot(slotId, saved)
    } else {
      saved = loadRunFromSlot(slotId)
    }
    if (!saved) {
      window.alert('Save data is missing or corrupted.')
      return
    }
    resetRunMemory()
    setActiveSlotId(slotId)
    activeSlotIdRef.current = slotId
    dailyRunSlotRef.current = slotId
    setLastSaveSlotId(slotId)
    if (!applySaveToState(saved, true)) {
      window.alert('Save data is corrupted and could not be loaded.')
      return
    }
    refreshLocalSlots()
    if (isSaveSlotTutorialCompleted(slotId)) {
      persistTutorialCompleted(true)
      setTutorialActive(false)
      setTutorialStep(null)
    } else {
      beginTutorialIfNeeded()
    }
  }

  async function clearSlotData(slotId: SaveSlotId, mode: PlayMode) {
    if (mode === 'cloud' && authUser) {
      await deleteCloudSlot(slotId)
      await refreshCloudSlots()
    }
    clearSaveSlot(slotId)
    refreshLocalSlots()
  }

  function handleCharacterContinue() {
    if (!selectedCharSlot || !playMode) return
    const summary =
      playMode === 'cloud' ? cloudSlots[selectedCharSlot] : localSlots[selectedCharSlot]
    if (summary.isEmpty) return
    void loadSlotAndContinue(selectedCharSlot, playMode)
  }

  function handleCharacterNewGame() {
    if (!selectedCharSlot || !playMode) return
    const summary =
      playMode === 'cloud' ? cloudSlots[selectedCharSlot] : localSlots[selectedCharSlot]
    if (!summary.isEmpty) {
      const ok = window.confirm(
        `Overwrite ${playMode === 'cloud' ? 'Cloud' : 'Local'} Slot ${selectedCharSlot}? This cannot be undone.`,
      )
      if (!ok) return
    }
    const slotId = selectedCharSlot
    haltActiveSlotAutosave()
    void clearSlotData(slotId, playMode).then(() => {
      teardownDailyRunSession()
      resetRunMemory()
      setActiveSlotId(slotId)
      activeSlotIdRef.current = slotId
      dailyRunSlotRef.current = slotId
      setLastSaveSlotId(slotId)
      pendingTrainerNameRef.current = null
      setSlotActionMessage(null)
      partyOpenedThisRunRef.current = false
      setTrainerNameFlow('newGame')
      setScreen('nameTrainer')
    })
  }

  function handleCharacterRename() {
    if (!selectedCharSlot || !playMode) return
    const summary =
      playMode === 'cloud' ? cloudSlots[selectedCharSlot] : localSlots[selectedCharSlot]
    if (summary.isEmpty) return
    setActiveSlotId(selectedCharSlot)
    activeSlotIdRef.current = selectedCharSlot
    setTrainerNameFlow('rename')
    setScreen('nameTrainer')
  }

  async function handleTrainerNameConfirm(name: string) {
    const slotId = selectedCharSlot ?? activeSlotIdRef.current
    if (!slotId || !trainerNameFlow) return

    if (trainerNameFlow === 'rename') {
      setTrainerNameBusy(true)
      const ok = updateEnvelopeTrainerName(slotId, name)
      if (!ok) {
        setTrainerNameBusy(false)
        window.alert('Could not rename save.')
        return
      }
      if (playModeRef.current === 'cloud' && authUserRef.current) {
        const envelope = loadEnvelopeFromSlot(slotId)
        if (envelope) {
          const cloudResult = await saveToCloudSlot(slotId, envelope)
          if (!cloudResult.ok) {
            setTrainerNameBusy(false)
            setSlotActionMessage(cloudResult.error ?? 'Cloud rename sync failed.')
            setTrainerNameFlow(null)
            setScreen('characterSelect')
            refreshLocalSlots()
            return
          }
          await refreshCloudSlots()
        }
      }
      refreshLocalSlots()
      setTrainerNameBusy(false)
      setTrainerNameFlow(null)
      setSlotActionMessage('Save renamed.')
      setScreen('characterSelect')
      return
    }

    pendingTrainerNameRef.current = name
    setTrainerNameFlow(null)
    beginTutorialIfNeeded()
    setScreen('starterSelect')
  }

  function handleTrainerNameCancel() {
    const flow = trainerNameFlow
    setTrainerNameFlow(null)
    pendingTrainerNameRef.current = null
    if (flow === 'newGame') {
      haltActiveSlotAutosave()
    }
    setScreen('characterSelect')
  }

  function handleCharacterDelete() {
    if (!selectedCharSlot || !playMode) return
    const summary =
      playMode === 'cloud' ? cloudSlots[selectedCharSlot] : localSlots[selectedCharSlot]
    if (summary.isEmpty) return
    const ok = window.confirm(`Delete save in Slot ${selectedCharSlot}?`)
    if (!ok) return
    const slotId = selectedCharSlot
    const wasActive = activeSlotIdRef.current === slotId
    if (wasActive) haltActiveSlotAutosave()
    void clearSlotData(slotId, playMode).then(() => {
      if (wasActive || runCreatureRef.current) {
        resetRunMemory()
        teardownDailyRunSession()
      }
      setSelectedCharSlot(null)
      refreshLocalSlots()
      if (playMode === 'cloud') void refreshCloudSlots()
      setSlotActionMessage('Save deleted.')
    })
  }

  async function handleUploadLocal(localSlot: SaveSlotId, cloudSlot: SaveSlotId) {
    if (!hasSaveInSlot(localSlot)) {
      setUploadMessage('Local slot is empty.')
      return
    }
    if (!cloudSlots[cloudSlot].isEmpty) {
      const ok = window.confirm(
        `Cloud Slot ${cloudSlot} already has a save. Overwrite with Local Slot ${localSlot}?`,
      )
      if (!ok) return
    }
    setUploadBusy(true)
    setUploadMessage(null)
    const result = await uploadLocalSlotToCloud(localSlot, cloudSlot)
    setUploadBusy(false)
    if (result.ok) {
      setUploadMessage(`Uploaded Local Slot ${localSlot} to Cloud Slot ${cloudSlot}.`)
      await refreshCloudSlots()
    } else {
      setUploadMessage(result.error ?? 'Upload failed.')
    }
  }

  async function handleLogin(email: string, password: string) {
    setAuthBusy(true)
    const result = await signIn(email, password)
    setAuthBusy(false)
    if (!result.ok) throw new Error(result.error)
    setAuthUser(result.user)
    authUserRef.current = result.user
    await refreshCloudSlots()
    openCharacterSelect('cloud')
  }

  async function handleRegister(email: string, password: string) {
    setAuthBusy(true)
    const result = await signUp(email, password)
    setAuthBusy(false)
    if (!result.ok) throw new Error(result.error)
    setAuthUser(result.user)
    authUserRef.current = result.user
    await refreshCloudSlots()
    openCharacterSelect('cloud')
  }

  async function handleLogout() {
    setAuthBusy(true)
    await signOut()
    setAuthUser(null)
    authUserRef.current = null
    setAuthBusy(false)
    goToTitle()
  }

  function confirmStarter() {
    if (!pendingStarter) return
    const isDaily = runModeRef.current === 'daily'
    if (!isDaily) {
      teardownDailyRunSession()
      setRunMode('normal')
      runModeRef.current = 'normal'
    }

    setSelectedStarter(pendingStarter)
    setPendingRecruit(null)
    setEnemy(null)
    setBattleLog([])
    setRewardInfo(null)
    setDefeatInfo(null)
    resetCombatSession()

    const regionId = isDaily ? getDailyRunRegionId() : DEFAULT_REGION_ID
    const creature = createRunCreature(pendingStarter)
    setRunCreature(creature)
    runCreatureRef.current = creature
    const freshInventory = emptyTrainerInventory()
    setTrainerInventory(freshInventory)
    setQuestState(createDefaultQuestState())
    setRequestQuestState(createDefaultRequestQuestState())
    setShopInventoriesByNodeId({})
    setShopRareOfferHistory([])
    setActiveShopInventory(null)

    let nodes: MapNode[]
    let states: Record<string, NodeVisitState>
    if (isDaily && dailySeedRef.current) {
      const fresh = createFreshDailyRunState(
        dailySeedRef.current,
        dailyModifierRef.current,
        { generateMap: true },
      )
      applyFreshDailyRunSnapshot(fresh)
      nodes = fresh.mapNodes
      states = fresh.nodeStates
      scoreTrackerRef.current = createScoreTracker(creature.level)
    } else {
      setEarnedBadges([])
      setPartyRecruits([])
      partyRecruitsRef.current = []
      setActiveHelperId(null)
      setCompletedRegionIds([])
      setPendingBossVictory(false)
      setRegionCompleteInfo(null)
      setPendingPerkDraftQueue([])
      setPendingEvolutionQueue([])
      setPendingAbilityUpgradeQueue([])
      pendingAbilityUpgradeQueueRef.current = []
      setPendingTransformQueue([])
      pendingTransformQueueRef.current = []
      setPendingPostBattleQueue([])
      pendingPostBattleQueueRef.current = []
      setActiveNodeId(null)
      setCurrentNode(null)
      setLastCombatNode(null)
      setCurrentRegionId(regionId)
      scoreTrackerRef.current = createScoreTracker(creature.level)
      const map = createFreshMapState(regionId, [], null)
      nodes = map.mapNodes
      states = map.nodeStates
      setMapNodes(nodes)
      setNodeStates(states)
    }

    logNewGameCreated({
      slotId: activeSlotIdRef.current,
      currentRegion: regionId,
      starterLevel: creature.level,
      mapNodeCount: nodes.length,
      mode: isDaily ? 'daily' : 'normal',
    })

    if (isDaily) {
      saveDailyRunProgress()
    } else if (activeSlotIdRef.current) {
      const freshSave = {
        ...createFreshSaveData({
          starterId: pendingStarter.id,
          runCreature: creature,
          mapNodes: nodes,
          nodeStates: states,
          regionId,
          trainerInventory: freshInventory,
        }),
        retentionState: retentionStateRef.current,
      }
      const trainerName = pendingTrainerNameRef.current
      void persistSaveData(
        freshSave,
        trainerName
          ? {
              saveName: trainerName,
              trainerName,
              createdAt: new Date().toISOString(),
            }
          : undefined,
      )
      pendingTrainerNameRef.current = null
    }

    setMapMessage('New run created.')
    dispatchRetentionEvent('creatureRecruited', {
      starterTypeId: pendingStarter.id,
      regionId,
    })
    maybeAdvanceTutorial('chooseStarter', 'openMap')
    advanceTutorialTo('openMap')
    setScreen('runMap')
  }

  function markNodeComplete(nodeId: string) {
    const node = getMapNodeFromList(mapNodes, nodeId)
    setNodeStates((s) =>
      completeNodeOnMap(nodeId, mapNodes, s, earnedBadges),
    )
    setActiveNodeId(null)
    setCurrentNode(null)
    if (node) {
      dispatchQuestEvent('nodeCleared', { nodeType: node.type })
      dispatchRetentionEvent('nodeCleared', { nodeType: node.type })
    }
  }

  function prepareMapCombat(node: MapNode): PendingCombatStart | null {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!starterSnapshot) return null
    if (getNodeState(nodeStates, node.id) !== 'available') return null

    const kind = getEncounterKind(node.type)
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const spawned = getEnemyForNode(
      node,
      currentRegionId,
      getDailyEnemySpawnOptions(),
      partyLevel,
    )
    const ctx = createMapCombatContext(
      node,
      kind,
      runModeRef.current === 'daily' ? 'dailyRun' : 'mapNode',
    )
    const discovery = getEnemyArchiveDiscovery(spawned)
    return {
      mode: 'map',
      node,
      spawned,
      ctx,
      encounterKind: kind,
      battleLogLine: `${spawned.name} sent out ${discovery.creatureName}!`,
      discoveryTemplateId: discovery.templateId,
      discoveryCreatureName: discovery.creatureName,
    }
  }

  function prepareEventAlphaCombat(ctx: CombatContext): PendingCombatStart | null {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!starterSnapshot) return null

    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const alphas = ['alpha-bristlebug', 'alpha-ashling', 'alpha-pebblemaw']
    const id = alphas[Math.floor(Math.random() * alphas.length)] ?? 'alpha-ashling'
    const mapLayer = ctx.mapNode?.layer ?? 0
    const alphaLevel = rollEnemyLevelForNode(currentRegionId, 'alphaNest', {
      partyHighestLevel: partyLevel,
      mapLayer,
      isDailyRun: runModeRef.current === 'daily',
    })
    const spawned = spawnEnemy(id, alphaLevel, { encounterKind: 'alphaNest' })
    if (runModeRef.current === 'daily' && dailySeedRef.current) {
      console.log('Daily Run Enemy Scaling', {
        dailySeed: dailySeedRef.current,
        playerHighestLevel: partyLevel,
        currentRegion: currentRegionId,
        enemyLevelRange: getRegionEnemyLevelRange(currentRegionId),
        generatedEnemyLevel: alphaLevel,
        nodeType: 'alphaNest',
        mapLayer,
      })
    }
    const discovery = getEnemyArchiveDiscovery(spawned)
    return {
      mode: 'eventAlpha',
      ctx,
      spawned,
      battleLogLine: `Bonus alpha — ${spawned.name} sent out ${discovery.creatureName}!`,
      discoveryTemplateId: discovery.templateId,
      discoveryCreatureName: discovery.creatureName,
    }
  }

  function queueEncounterTransition(pending: PendingCombatStart) {
    const encounterKind =
      pending.mode === 'map' ? pending.encounterKind : 'alphaNest'
    const ctx = pending.mode === 'map' ? pending.ctx : pending.ctx
    const view = buildEncounterTransitionView(
      encounterKind,
      pending.spawned,
      ctx,
    )
    pendingCombatRef.current = pending
    setEncounterTransitionView(view)
    startEncounterBattleMusic(view.audioProfile)
    setScreen('encounterTransition')
  }

  function applyPendingCombatStart() {
    const pending = pendingCombatRef.current
    if (!pending) return
    pendingCombatRef.current = null
    setEncounterTransitionView(null)

    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!starterSnapshot) return
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits

    if (pending.mode === 'map') {
      setActiveNodeId(pending.node.id)
      setCurrentNode(pending.node)
      setLastCombatNode(pending.node)
      setCombatContextBoth(pending.ctx)
      setActiveEncounterKind(pending.encounterKind)
      setEnemy(pending.spawned)
      resetCombatSession()
      setPendingAbilityUpgradeQueue([])
      setCombatPhase('starter')
      preCombatMasteryRef.current = {
        starter: structuredClone(starterSnapshot.abilityMastery),
        recruits: Object.fromEntries(
          recruitsSnapshot.map((r) => [r.id, structuredClone(r.abilityMastery)]),
        ),
      }
      setBattleLog([pending.battleLogLine])
      setCombatLocked(false)
      combatTurnNumberRef.current = 1
      updateCombatDebugSnapshot(
        'starter',
        starterSnapshot,
        recruitsSnapshot,
        pending.spawned,
        starterSnapshot.name,
      )
      dispatchRetentionEvent('enemySeen', {
        templateId: pending.discoveryTemplateId,
        creatureName: pending.discoveryCreatureName,
        regionId: currentRegionId,
      })
      maybeAdvanceTutorial('clickBattleNode', 'useAbility')
    } else {
      console.log('Combat victory context', pending.ctx)
      setCombatContextBoth(pending.ctx)
      setLastCombatNode(pending.ctx.mapNode ?? null)
      setActiveEncounterKind('alphaNest')
      setEnemy(pending.spawned)
      resetCombatSession()
      setPendingAbilityUpgradeQueue([])
      setCombatPhase('starter')
      preCombatMasteryRef.current = {
        starter: structuredClone(starterSnapshot.abilityMastery),
        recruits: Object.fromEntries(
          recruitsSnapshot.map((r) => [r.id, structuredClone(r.abilityMastery)]),
        ),
      }
      setBattleLog([pending.battleLogLine])
      setCombatLocked(false)
      combatTurnNumberRef.current = 1
      updateCombatDebugSnapshot(
        'starter',
        starterSnapshot,
        recruitsSnapshot,
        pending.spawned,
        starterSnapshot.name,
      )
      dispatchRetentionEvent('enemySeen', {
        templateId: pending.discoveryTemplateId,
        creatureName: pending.discoveryCreatureName,
        regionId: currentRegionId,
      })
    }

    setScreen('combat')
  }

  function startCombat(node: MapNode) {
    const pending = prepareMapCombat(node)
    if (!pending) return
    queueEncounterTransition(pending)
  }

  function startBonusAlphaCombat(ctx: CombatContext) {
    const pending = prepareEventAlphaCombat(ctx)
    if (!pending) return
    queueEncounterTransition(pending)
  }

  function handleMapNodeClick(node: MapNode) {
    if (!runCreature) return

    const state = getNodeState(nodeStates, node.id)
    const action =
      state === 'available' ? getNodeClickAction(node.type) : ('blocked' as const)

    console.log(
      `[node click] id=${node.id} type=${node.type} state=${state} route=${action}`,
    )

    setNodeClickDebug({
      id: node.id,
      type: node.type,
      state,
      route: action,
    })

    if (state === 'completed') {
      setMapMessage(`${node.label} is already completed.`)
      return
    }

    if (state === 'locked') {
      setMapMessage(`${node.label} is locked.`)
      return
    }

    if (state !== 'available') {
      setMapMessage(`Cannot enter ${node.label} (state: ${state}).`)
      return
    }

    setMapMessage(null)
    setActiveNodeId(node.id)
    setCurrentNode(node)

    switch (action) {
      case 'combat':
        startCombat(node)
        break
      case 'shop':
      case 'relicShop':
        openShopForNode(node)
        break
      case 'rest':
        setRestChoiceMade(false)
        setScreen('rest')
        break
      case 'event':
        setCurrentEvent(pickRandomEvent())
        setScreen('event')
        break
      case 'monolithCouncil': {
        const councilAtNode = getCouncilForRegion(currentRegionId)
        if (!councilAtNode || councilAtNode.trials.length === 0) {
          setMapMessage("This region's Monolith Council is not available yet.")
          break
        }
        setScreen('monolithCouncil')
        break
      }
    }
  }

  function appendLog(...lines: string[]) {
    setBattleLog((prev) => [...prev, ...lines])
  }

  function buildCombatants(): CombatantTarget[] {
    if (!runCreature) return []
    const list: CombatantTarget[] = [
      {
        key: 'starter',
        label: 'Starter',
        roleLabel: 'Active starter',
        creature: runCreature,
        abilityIds: getActiveAbilityIds(runCreature),
        fainted: runCreature.currentHp <= 0,
      },
    ]
    const helper = getActiveCombatHelper(partyRecruits, activeHelperId)
    if (helper) {
      list.push({
        key: helper.id,
        label: 'Recruit',
        roleLabel: 'Active helper',
        creature: helper,
        abilityIds: getActiveAbilityIds(helper),
        fainted: helper.currentHp <= 0,
      })
    }
    return list
  }

  /** Who acts first when a round begins (starter fainted → helper, else starter). */
  function getInitialPlayerCombatPhase(
    starter: RunCreature,
    recruits: PartyCreature[],
  ): CombatPhase {
    if (starter.currentHp > 0) return 'starter'
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    if (helper && helper.currentHp > 0) return 'recruit'
    return 'starter'
  }

  type PlayerTurnView = {
    phase: CombatPhase
    activeKey: string | null
    hint: string
  }

  function getPlayerTurnView(
    starter: RunCreature,
    recruits: PartyCreature[],
    phase: CombatPhase,
  ): PlayerTurnView {
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    const starterUp = starter.currentHp > 0
    const helperUp = Boolean(helper && helper.currentHp > 0)

    if (phase === 'enemy') {
      return {
        phase: 'enemy',
        activeKey: null,
        hint: 'Enemy is acting…',
      }
    }

    if (phase === 'recruit') {
      if (helperUp) {
        return {
          phase: 'recruit',
          activeKey: helper!.id,
          hint: `${helper!.name}'s turn — choose an ability`,
        }
      }
      return { phase: 'recruit', activeKey: null, hint: 'Passing turn…' }
    }

    if (starterUp) {
      return {
        phase: 'starter',
        activeKey: 'starter',
        hint: `Choose an ability for ${starter.name}`,
      }
    }

    if (helperUp) {
      return {
        phase: 'recruit',
        activeKey: helper!.id,
        hint: `${helper!.name}'s turn — choose an ability`,
      }
    }

    return { phase: 'starter', activeKey: null, hint: 'Waiting…' }
  }

  function handoffAfterPlayerAttack(
    nextEnemy: Enemy,
    whoJustAttacked: 'starter' | 'recruit',
  ) {
    if (!runCreature) return

    const isCouncilFight =
      combatContextRef.current?.source === 'monolithCouncil'

    if (nextEnemy.currentHp <= 0) {
      appendLog(`${getEnemyFoeName(nextEnemy)} fainted!`)
      if (isCouncilFight) {
        logCouncilEnemyDefeatCheck('player-attack-faint', councilEnemiesRef.current, {
          selectedTargetIndex: councilTargetIndexRef.current,
          combatPhase,
          combatLocked,
          combatEnded: combatEndedRef.current,
        })
        if (allCouncilEnemiesDefeated(councilEnemiesRef.current)) {
          return
        }
        councilTargetIndexRef.current = getDefaultLivingCouncilTargetIndex(
          councilEnemiesRef.current,
        )
      } else {
        scheduleVictoryCallback(() => handleVictory(nextEnemy), 400)
        return
      }
    }

    if (whoJustAttacked === 'recruit') {
      combatTurnNumberRef.current += 1
      const helper = getActiveCombatHelper(partyRecruits, activeHelperId)
      const starterUp = runCreature.currentHp > 0
      if (starterUp) {
        setCombatPhase('starter')
        setCombatLocked(false)
        updateCombatDebugSnapshot(
          'starter',
          runCreatureRef.current ?? runCreature,
          partyRecruitsRef.current ?? partyRecruits,
          nextEnemy,
          runCreature.name,
        )
        return
      }
      if (helper && helper.currentHp > 0) {
        setCombatPhase('recruit')
        setCombatLocked(false)
        return
      }
    }

    beginEnemyTurn(nextEnemy)
  }

  function skipToNextLivingAttacker(reason: string) {
    if (!runCreature || !enemy) return

    appendLog(reason)
    const phase = getInitialPlayerCombatPhase(runCreature, partyRecruits)
    if (phase === 'starter' || phase === 'recruit') {
      setCombatPhase(phase)
      setCombatLocked(false)
      return
    }

    beginEnemyTurn(enemy)
  }

  type AttackResolution = {
    nextEnemy: Enemy
    updatedAttacker: RunCreature | PartyCreature
    attackerKey: string
  }

  function triggerEnemyAbilityVfx(abilityId: string, resolvedAbilityId: string) {
    const vfxId = resolveAbilityVfxId(abilityId, resolvedAbilityId)
    if (!vfxId) return
    setEnemyAbilityVfx({ vfxId, playKey: Date.now() })
  }

  function applyAbilityToEnemy(
    abilityId: string,
    attacker: RunCreature | PartyCreature,
    attackerName: string,
    attackerKey: string,
  ): AttackResolution | null {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!enemy || !starterSnapshot) return null

    let defenderEnemy = enemy
    if (combatContextRef.current?.source === 'monolithCouncil') {
      const idx = pickPlayerTargetIndex(councilEnemiesRef.current, abilityId)
      councilTargetIndexRef.current = idx
      defenderEnemy = councilEnemiesRef.current[idx] ?? enemy
    }

    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    const masteryEntry = getMasteryEntry(attacker, abilityId)
    const resolvedId = getResolvedAbilityId(masteryEntry)
    const ability = getAbility(resolvedId)
    const abilityDisplayName = getAbilityDisplayName(ability)
    playAbilitySfx(resolveAbilitySfxKey(ability, masteryEntry))
    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const effectiveStats = getEffectiveStats(attacker, {
      earnedBadges,
      partyHighestLevel: partyLevel,
    })
    const enemyStages = enemyStatStagesRef.current
    const rawDefender = getDefenderStatsForAttack(
      defenderEnemy.stats,
      ability,
      attacker.selectedPerks,
    )
    const defenderStats = buildCombatStatsForEnemy(rawDefender, enemyStages)
    const typeMult = getTypeEffectivenessMultiplier(
      ability.type,
      defenderEnemy.type,
    )
    const defenderHpRatio =
      defenderEnemy.maxHp > 0 ? defenderEnemy.currentHp / defenderEnemy.maxHp : 1
    const badgeMult = getAttackerDamageMultiplier(
      ability,
      earnedBadges,
      attacker.selectedPerks,
      attacker,
      {
        defenderHpRatio,
        typeMultiplier: typeMult,
        encounterKind: defenderEnemy.kind,
        consecutiveDamageHits: playerDamageHitsRef.current,
        rhythmHitIndex: playerDamageHitsRef.current + 1,
      },
    )
    const masteryMods = getCombatModifiersFromMastery(masteryEntry)
    const supportMods = getSupportMasteryModifiers(masteryEntry)
    const firstStrikeUsed = firstAttackUsedRef.current.has(attackerKey)
    const firstStrikeBonus = getFirstStrikeBonus(
      attacker.selectedPerks,
      firstStrikeUsed,
    )
    const firstStrikeMult = getFirstStrikeDamageMult(
      attacker.selectedPerks,
      firstStrikeUsed,
    )
    firstAttackUsedRef.current.add(attackerKey)

    const enemyHpBefore = defenderEnemy.currentHp
    const hit = rollHitsWithMastery(
      ability.accuracy,
      masteryMods.bonusAccuracy + supportMods.bonusAccuracy,
    )

    if (!hit) {
      appendLog(`${attackerName} used ${abilityDisplayName} — it missed!`)
      const updatedAttacker = applyMasteryAfterAttack(
        attacker,
        attackerKey,
        abilityId,
        buildMasteryXpContext(
          ability.type,
          defenderEnemy.type,
          false,
          enemyHpBefore,
          0,
        ),
      )
      return { nextEnemy: defenderEnemy, updatedAttacker, attackerKey }
    }

    let nextEnemy = { ...enemy }
    let updatedAttacker = attacker
    const dealsDamage = abilityDealsDamage(ability)

    if (!dealsDamage) {
      appendLog(`${attackerName} used ${abilityDisplayName}!`)
      const userStages = playerStatStagesRef.current[attackerKey] ?? {}
      const effectResult = applyAbilityEffects({
        ability,
        attackerName,
        userStages,
        enemyStages,
        defenderStatus: {},
        attackerHp: attacker.currentHp,
        attackerMaxHp: attacker.maxHp,
        mastery: supportMods,
      })
      playerStatStagesRef.current[attackerKey] = effectResult.userStages
      enemyStatStagesRef.current = effectResult.enemyStages
      for (const line of effectResult.logLines) {
        appendLog(line)
      }
      const foeStageLine = formatStatStageLine(enemyStatStagesRef.current)
      if (foeStageLine.length > 0) {
        appendLog(`Foe stages: ${foeStageLine.join(' · ')}`)
      }
      const userStageLine = formatStatStageLine(
        playerStatStagesRef.current[attackerKey] ?? {},
      )
      if (userStageLine.length > 0) {
        appendLog(`${attackerName}: ${userStageLine.join(' · ')}`)
      }
      if (
        effectResult.attackerHp !== attacker.currentHp &&
        effectResult.attackerHp > 0
      ) {
        updatedAttacker = {
          ...attacker,
          currentHp: effectResult.attackerHp,
        }
      }
    } else {
      const crit = rollCrit(
        masteryMods.bonusCritChance +
          getPerkCritChanceBonus(attacker.selectedPerks) * 100,
      )
      const damageDebug = {
        attackerName,
        attackerId: attackerKey,
        abilityId: resolvedId,
        abilityName: abilityDisplayName,
        defenderName: getEnemyFoeName(defenderEnemy),
      }
      let damage = calcDamageWithMastery(
        ability,
        effectiveStats,
        defenderStats,
        masteryMods,
        typeMult,
        badgeMult,
        crit,
        {
          defenderMaxHp: defenderEnemy.maxHp,
          attackerLevel: attacker.level,
          encounterKind: defenderEnemy.kind,
        },
        damageDebug,
      )
      damage = sanitizeDamage(damage, defenderEnemy.maxHp, ability, typeMult)
      damage = Math.floor(
        damage *
          getEnemyDamageTakenMultiplier(
            defenderEnemy.combatModifier,
            ability.category,
          ),
      )
      if (damage > 0 && firstStrikeBonus > 0) {
        damage += firstStrikeBonus
      }
      if (damage > 0 && firstStrikeMult > 0) {
        damage = Math.floor(damage * (1 + firstStrikeMult))
      }

      let shieldHp = defenderEnemy.shieldHp ?? 0
      let hpDamage = damage
      if (shieldHp > 0 && damage > 0) {
        const absorbed = Math.min(shieldHp, damage)
        shieldHp -= absorbed
        hpDamage = damage - absorbed
      }
      playerDamageHitsRef.current += 1

      nextEnemy = {
        ...defenderEnemy,
        currentHp: applyDamage(defenderEnemy.currentHp, hpDamage),
        shieldHp: shieldHp > 0 ? shieldHp : undefined,
      }
      if (combatContextRef.current?.source === 'monolithCouncil') {
        const updated = [...councilEnemiesRef.current]
        updated[councilTargetIndexRef.current] = nextEnemy
        syncCouncilEnemiesUi(updated)
      } else {
        setEnemy(nextEnemy)
      }
      triggerEnemyAbilityVfx(abilityId, resolvedId)

      const notes: string[] = []
      if (crit) notes.push('critical hit')
      if (typeMult >= SUPER_EFFECTIVE_MULTIPLIER) notes.push('super effective')
      if (typeMult < 1) notes.push('not very effective')
      if (firstStrikeBonus > 0) notes.push(`+${firstStrikeBonus} First Strike`)
      const noteSuffix = notes.length > 0 ? ` (${notes.join(', ')})` : ''

      appendLog(
        `${attackerName} used ${abilityDisplayName} — ${damage} damage to ${getEnemyFoeName(defenderEnemy)}!${noteSuffix}`,
      )

      if (ability.effects?.length) {
        const supportMods = getSupportMasteryModifiers(masteryEntry)
        const effectResult = applyAbilityEffects({
          ability,
          attackerName,
          userStages: playerStatStagesRef.current[attackerKey] ?? {},
          enemyStages: enemyStatStagesRef.current,
          defenderStatus: {},
          attackerHp: attacker.currentHp,
          attackerMaxHp: attacker.maxHp,
          mastery: supportMods,
        })
        playerStatStagesRef.current[attackerKey] = effectResult.userStages
        enemyStatStagesRef.current = effectResult.enemyStages
        for (const line of effectResult.logLines) {
          appendLog(line)
        }
      }

      updatedAttacker = applyMasteryAfterAttack(
        attacker,
        attackerKey,
        abilityId,
        buildMasteryXpContext(
          ability.type,
          defenderEnemy.type,
          true,
          enemyHpBefore,
          damage,
        ),
      )
      return { nextEnemy, updatedAttacker, attackerKey }
    }

    updatedAttacker = applyMasteryAfterAttack(
      attacker,
      attackerKey,
      abilityId,
      buildMasteryXpContext(
        ability.type,
        defenderEnemy.type,
        true,
        enemyHpBefore,
        0,
      ),
    )

    return { nextEnemy, updatedAttacker, attackerKey }
  }

  function commitAttackerState(
    attackerKey: string,
    updated: RunCreature | PartyCreature,
  ) {
    if (attackerKey === 'starter') {
      const next = updated as RunCreature
      runCreatureRef.current = next
      setRunCreature(next)
    } else {
      const base = partyRecruitsRef.current ?? partyRecruits
      const nextRecruits = base.map((r) =>
        r.id === attackerKey ? (updated as PartyCreature) : r,
      )
      partyRecruitsRef.current = nextRecruits
      setPartyRecruits(nextRecruits)
    }
  }

  function handleDefeat(
    starterSnapshot: RunCreature,
    recruitsSnapshot: PartyCreature[],
    defeatedBy: Enemy,
  ) {
    if (combatEndedRef.current) return

    if (combatContextRef.current?.source === 'monolithCouncil') {
      handleCouncilCombatDefeat()
      return
    }

    stopEncounterBattleMusic()
    combatEndedRef.current = true
    clearCombatTimeout()
    setCombatLocked(true)
    console.log('Defeat detected')

    if (runModeRef.current === 'pvp') {
      finishPvpDefeat()
      return
    }

    const penalized = applyDefeatPenalties(starterSnapshot, recruitsSnapshot)
    const cleared = clearPartyBattleBuffs(
      penalized.starter,
      penalized.recruits,
    )

    setRunCreature(cleared.starter)
    setPartyRecruits(cleared.recruits)
    runCreatureRef.current = cleared.starter
    partyRecruitsRef.current = cleared.recruits
    setDefeatInfo({
      enemyName: defeatedBy.name,
      coinsLost: penalized.coinsLost,
    })
    setEnemy(null)
    setBattleLog([])
    setCombatPhase('starter')

    if (runModeRef.current === 'daily') {
      scoreTrackerRef.current.defeats += 1
      runCreatureRef.current = cleared.starter
      partyRecruitsRef.current = cleared.recruits
      handleDailyDefeatAfterDeath()
      return
    }

    console.log('Switching to defeat screen')
    void tryAutoSubmitCampaignLeaderboard(false, true)
    setScreen('defeat')
  }

  function runMonolithCouncilEnemyTurns(
    starterSnapshot: RunCreature,
    recruitsSnapshot: PartyCreature[],
  ) {
    const session = councilSessionRef.current
    if (!session || combatEndedRef.current) return

    enemyTurnLockRef.current = true
    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    let nextStarterHp = starterSnapshot.currentHp
    let nextRecruits = recruitsSnapshot
    const helper = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    let nextHelperHp = helper?.currentHp ?? null
    let councilEnemies = [...councilEnemiesRef.current]

    const applyCouncilEnemyAttack = (
      attackerState: Enemy,
      attackerIndex: number,
    ) => {
      if (attackerState.currentHp <= 0) return

      const livingTargets = buildCouncilPlayerTargets(
        { ...starterSnapshot, currentHp: nextStarterHp },
        nextRecruits,
        activeHelperId,
        earnedBadges,
        partyLevel,
        playerStatStagesRef.current,
      ).filter((t) => t.currentHp > 0)

      if (livingTargets.length === 0) return

      const partner = councilEnemies.find(
        (e, i) => i !== attackerIndex && e.currentHp > 0,
      )
      const enemyAbilityId = pickCouncilEnemyMove(
        attackerState,
        session.aiStyle,
        livingTargets,
        partner,
      )
      const enemyAbility = getAbility(enemyAbilityId)
      const enemyAbilityName = getAbilityDisplayName(enemyAbility)
      const focus = pickCouncilEnemyPlayerTarget(session.aiStyle, livingTargets)
      if (!focus) return

      const enemySfxRank = Math.min(
        10,
        Math.max(0, Math.floor((attackerState.level ?? 1) / 2)),
      )
      playAbilitySfx(
        resolveAbilitySfxKey(enemyAbility, null, { fallbackRank: enemySfxRank }),
      )
      const enemyAttackStats = buildCombatStatsForEnemy(
        attackerState.stats,
        enemyStatStagesRef.current,
      )
      const targetCreature =
        focus.key === 'starter'
          ? starterSnapshot
          : recruitsSnapshot.find((r) => r.id === focus.key)
      const targetPerks = targetCreature?.selectedPerks ?? []

      if (rollPerkDodge(targetPerks)) {
        appendLog(
          `${focus.name} dodged ${getEnemyFoeName(attackerState)}'s ${enemyAbilityName}!`,
        )
        return
      }
      if (!rollHits(enemyAbility.accuracy)) {
        appendLog(
          `${getEnemyFoeName(attackerState)} used ${enemyAbilityName} — it missed!`,
        )
        return
      }

      const typeMult = getTypeEffectivenessMultiplier(
        enemyAbility.type,
        focus.type,
      )
      const powerCap = clampAbilityPowerForEnemy(
        enemyAbility.power,
        attackerState.level,
        attackerState.kind,
      )
      const abilityForDamage =
        powerCap < enemyAbility.power
          ? { ...enemyAbility, power: powerCap }
          : enemyAbility
      let damage = safeCalcDamage(
        abilityForDamage,
        enemyAttackStats,
        focus.stats,
        focus.maxHp,
      )
      damage = Math.floor(damage * typeMult)
      damage = Math.floor(
        damage * getEnemyDamageDealtMultiplier(attackerState.combatModifier),
      )
      const targetHp = focus.currentHp
      damage = applyPerkDamageTakenReduction(damage, targetPerks, {
        hpRatio: focus.maxHp > 0 ? targetHp / focus.maxHp : 1,
        typeMultiplier: typeMult,
        encounterKind: attackerState.kind,
      })
      damage = applyEarlyGameDamageCap(
        damage,
        focus.maxHp,
        attackerState.level,
        typeMult,
        attackerState.kind,
      )
      damage = sanitizeDamage(damage, focus.maxHp, abilityForDamage, typeMult)
      const seNote =
        typeMult >= SUPER_EFFECTIVE_MULTIPLIER ? ' (super effective)' : ''

      const hpBeforeApply =
        focus.key === 'starter'
          ? nextStarterHp
          : nextRecruits.find((r) => r.id === focus.key)?.currentHp ?? 0
      const workingCouncilStarter = { ...starterSnapshot, currentHp: nextStarterHp }
      const applied = applyDamageToCombatCreature(
        focus.key,
        damage,
        workingCouncilStarter,
        nextRecruits,
      )
      nextStarterHp = applied.starter.currentHp
      nextRecruits = applied.recruits
      const loggedDamage = applied.appliedDamage
      lastCombatDamageRef.current = {
        amount: loggedDamage,
        target: applied.targetName,
      }
      logEnemyDamageApplied({
        enemyName: getEnemyFoeName(attackerState),
        abilityName: enemyAbilityName,
        targetName: applied.targetName,
        targetId: focus.key,
        hpBefore: hpBeforeApply,
        damage: loggedDamage,
        hpAfter: applied.hpAfter,
        combatPhase: 'enemy',
      })
      if (loggedDamage > 0) {
        appendLog(
          `${getEnemyFoeName(attackerState)} used ${enemyAbilityName} — ${loggedDamage} damage to ${focus.name}!${seNote}`,
        )
      } else {
        appendLog(
          `${getEnemyFoeName(attackerState)} used ${enemyAbilityName} on ${focus.name}!`,
        )
      }
      if (helper) {
        const updatedHelper = nextRecruits.find((r) => r.id === helper.id)
        nextHelperHp = updatedHelper?.currentHp ?? nextHelperHp
      }
    }

    for (let i = 0; i < councilEnemies.length; i++) {
      let foe = councilEnemies[i]!
      if (foe.currentHp <= 0) continue

      if (
        foe.combatModifier?.healPerTurnPercent &&
        foe.currentHp < foe.maxHp
      ) {
        const heal = Math.max(
          1,
          Math.floor(foe.maxHp * foe.combatModifier.healPerTurnPercent),
        )
        foe = {
          ...foe,
          currentHp: Math.min(foe.maxHp, foe.currentHp + heal),
        }
        councilEnemies[i] = foe
        appendLog(
          `${getEnemyFoeName(foe)} regenerates ${heal} HP (${foe.combatModifier?.name ?? 'Regenerating'}).`,
        )
      }

      applyCouncilEnemyAttack(foe, i)
      councilEnemies[i] = councilEnemiesRef.current[i] ?? foe

      if (isPartyDefeated(nextStarterHp, helper ? nextHelperHp : null)) {
        break
      }
    }

    syncCouncilEnemiesUi(councilEnemies)

    logCouncilEnemyDefeatCheck('after-enemy-turns', councilEnemies, {
      selectedTargetIndex: councilTargetIndexRef.current,
      combatPhase,
      combatLocked,
      combatEnded: combatEndedRef.current,
    })

    const mergedStarter = { ...starterSnapshot, currentHp: nextStarterHp }
    if (isPartyDefeated(nextStarterHp, helper ? nextHelperHp : null)) {
      appendLog('Your team was defeated!')
      handleDefeat(mergedStarter, nextRecruits, councilEnemies[0]!)
      enemyTurnLockRef.current = false
      return
    }

    runCreatureRef.current = mergedStarter
    setRunCreature(mergedStarter)
    partyRecruitsRef.current = nextRecruits
    setPartyRecruits(nextRecruits)
    const nextPhase = phaseAfterEnemyTurn(mergedStarter, nextRecruits)
    setCombatPhase(nextPhase)
    setCombatLocked(false)
    enemyTurnLockRef.current = false
    const activeActor =
      nextPhase === 'recruit'
        ? getActiveCombatHelper(nextRecruits, activeHelperId)?.name ?? 'helper'
        : mergedStarter.name
    updateCombatDebugSnapshot(
      nextPhase,
      mergedStarter,
      nextRecruits,
      councilEnemies[0] ?? null,
      activeActor,
    )
  }

  function runEnemyTurn(currentEnemy: Enemy) {
    if (enemyTurnLockRef.current) return
    if (combatEndedRef.current) return
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    if (!starterSnapshot || screenRef.current !== 'combat') {
      return
    }

    if (combatContextRef.current?.source === 'monolithCouncil') {
      if (allCouncilEnemiesDefeated(councilEnemiesRef.current)) return
      runMonolithCouncilEnemyTurns(starterSnapshot, recruitsSnapshot)
      return
    }

    if (currentEnemy.currentHp <= 0) {
      enemyTurnLockRef.current = false
      const phase = phaseAfterEnemyTurn(starterSnapshot, recruitsSnapshot)
      setCombatPhase(phase)
      setCombatLocked(false)
      return
    }

    enemyTurnLockRef.current = true

    const helper = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    let workingStarter = { ...starterSnapshot }
    let nextRecruits = recruitsSnapshot
    let nextHelperHp = helper?.currentHp ?? null

    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const targets: {
      key: string
      name: string
      maxHp: number
      type: RunCreature['type']
      combatStats: ReturnType<typeof buildCombatStatsForCreature>
    }[] = []

    if (workingStarter.currentHp > 0) {
      targets.push({
        key: 'starter',
        name: workingStarter.name,
        maxHp: workingStarter.maxHp,
        type: workingStarter.type,
        combatStats: buildCombatStatsForCreature(
          workingStarter,
          earnedBadges,
          partyLevel,
          playerStatStagesRef.current['starter'] ?? {},
        ),
      })
    }
    if (helper && nextHelperHp !== null && nextHelperHp > 0) {
      targets.push({
        key: helper.id,
        name: helper.name,
        maxHp: helper.maxHp,
        type: helper.type,
        combatStats: buildCombatStatsForCreature(
          helper,
          earnedBadges,
          partyLevel,
          playerStatStagesRef.current[helper.id] ?? {},
        ),
      })
    }

    if (targets.length === 0) {
      enemyTurnLockRef.current = false
      appendLog('Your team was defeated!')
      handleDefeat(starterSnapshot, recruitsSnapshot, currentEnemy)
      return
    }

    let currentEnemyState = currentEnemy
    if (
      currentEnemyState.combatModifier?.healPerTurnPercent &&
      currentEnemyState.currentHp > 0 &&
      currentEnemyState.currentHp < currentEnemyState.maxHp
    ) {
      const heal = Math.max(
        1,
        Math.floor(
          currentEnemyState.maxHp *
            currentEnemyState.combatModifier.healPerTurnPercent,
        ),
      )
      currentEnemyState = {
        ...currentEnemyState,
        currentHp: Math.min(
          currentEnemyState.maxHp,
          currentEnemyState.currentHp + heal,
        ),
      }
      setEnemy(currentEnemyState)
      appendLog(
        `${getEnemyFoeName(currentEnemyState)} regenerates ${heal} HP (${currentEnemyState.combatModifier?.name ?? 'Regenerating'}).`,
      )
    }

    const aiTargets: EnemyAiTarget[] = targets.map((t) => ({
      key: t.key,
      name: t.name,
      type: t.type,
      currentHp:
        t.key === 'starter'
          ? workingStarter.currentHp
          : nextRecruits.find((r) => r.id === t.key)?.currentHp ?? 0,
      maxHp: t.maxHp,
      stats: t.combatStats,
    }))
    const focus =
      aiTargets.length > 0
        ? aiTargets[Math.floor(Math.random() * aiTargets.length)]
        : null
    const target = focus
      ? targets.find((t) => t.key === focus.key) ?? targets[0]!
      : targets[0]!
    const enemyAbilityId = pickEnemyCombatMove(
      currentEnemyState,
      aiTargets,
      enemyStatStagesRef.current,
      playerStatStagesRef.current,
    )
    const enemyAbility = getAbility(enemyAbilityId)
    const enemyAbilityName = getAbilityDisplayName(enemyAbility)
    const enemySfxRank = Math.min(
      10,
      Math.max(0, Math.floor((currentEnemy.level ?? 1) / 2)),
    )
    playAbilitySfx(
      resolveAbilitySfxKey(enemyAbility, null, { fallbackRank: enemySfxRank }),
    )
    const enemyAttackStats = buildCombatStatsForEnemy(
      currentEnemyState.stats,
      enemyStatStagesRef.current,
    )

    const targetCreature =
      target.key === 'starter'
        ? starterSnapshot
        : recruitsSnapshot.find((r) => r.id === target.key)
    const targetPerks = targetCreature?.selectedPerks ?? []

    if (rollPerkDodge(targetPerks)) {
      appendLog(
        `${target.name} dodged ${getEnemyFoeName(currentEnemyState)}'s ${enemyAbilityName}!`,
      )
    } else if (!rollHits(enemyAbility.accuracy)) {
      appendLog(`${getEnemyFoeName(currentEnemyState)} used ${enemyAbilityName} — it missed!`)
    } else {
      const targetType = targetCreature?.type ?? starterSnapshot.type
      const typeMult = getTypeEffectivenessMultiplier(
        enemyAbility.type,
        targetType,
      )
      const powerCap = clampAbilityPowerForEnemy(
        enemyAbility.power,
        currentEnemy.level,
        currentEnemy.kind,
      )
      const abilityForDamage =
        powerCap < enemyAbility.power
          ? { ...enemyAbility, power: powerCap }
          : enemyAbility
      let damage = safeCalcDamage(
        abilityForDamage,
        enemyAttackStats,
        target.combatStats,
        target.maxHp,
      )
      damage = Math.floor(damage * typeMult)
      damage = Math.floor(
        damage * getEnemyDamageDealtMultiplier(currentEnemyState.combatModifier),
      )
      const targetHp =
        target.key === 'starter'
          ? workingStarter.currentHp
          : nextRecruits.find((r) => r.id === target.key)?.currentHp ?? 0
      damage = applyPerkDamageTakenReduction(damage, targetPerks, {
        hpRatio: target.maxHp > 0 ? targetHp / target.maxHp : 1,
        typeMultiplier: typeMult,
        encounterKind: currentEnemyState.kind,
      })
      damage = applyEarlyGameDamageCap(
        damage,
        target.maxHp,
        currentEnemyState.level,
        typeMult,
        currentEnemyState.kind,
      )
      damage = sanitizeDamage(
        damage,
        target.maxHp,
        abilityForDamage,
        typeMult,
      )
      const seNote =
        typeMult >= SUPER_EFFECTIVE_MULTIPLIER ? ' (super effective)' : ''
      const hpBeforeApply =
        target.key === 'starter'
          ? workingStarter.currentHp
          : nextRecruits.find((r) => r.id === target.key)?.currentHp ?? 0
      const applied = applyDamageToCombatCreature(
        target.key,
        damage,
        workingStarter,
        nextRecruits,
      )
      workingStarter = applied.starter
      nextRecruits = applied.recruits
      const loggedDamage = applied.appliedDamage
      lastCombatDamageRef.current = {
        amount: loggedDamage,
        target: applied.targetName,
      }
      logEnemyDamageApplied({
        enemyName: getEnemyFoeName(currentEnemyState),
        abilityName: enemyAbilityName,
        targetName: applied.targetName,
        targetId: target.key,
        hpBefore: hpBeforeApply,
        damage: loggedDamage,
        hpAfter: applied.hpAfter,
        combatPhase: 'enemy',
      })
      if (loggedDamage > 0) {
        appendLog(
          `${getEnemyFoeName(currentEnemyState)} used ${enemyAbilityName} — ${loggedDamage} damage to ${target.name}!${seNote}`,
        )
      } else {
        appendLog(
          `${getEnemyFoeName(currentEnemyState)} used ${enemyAbilityName} on ${target.name}!`,
        )
      }
      if (helper) {
        const updatedHelper = nextRecruits.find((r) => r.id === helper.id)
        nextHelperHp = updatedHelper?.currentHp ?? nextHelperHp
      }
      if (workingStarter.currentHp <= 0 && target.key === 'starter') {
        const livingHelper = helper
          ? nextRecruits.find((r) => r.id === helper.id)
          : null
        if (livingHelper && livingHelper.currentHp > 0) {
          appendLog(`${starterSnapshot.name} fainted — ${livingHelper.name} is up next!`)
        }
      }
      if (helper && nextHelperHp !== null && nextHelperHp <= 0 && target.key === helper.id) {
        if (workingStarter.currentHp > 0) {
          appendLog(`${helper.name} fainted — ${starterSnapshot.name} is up next!`)
        }
      }
    }

    const helperHpForCheck = helper ? nextHelperHp : null

    if (isPartyDefeated(workingStarter.currentHp, helperHpForCheck)) {
      appendLog('Your team was defeated!')
      handleDefeat(workingStarter, nextRecruits, currentEnemy)
      enemyTurnLockRef.current = false
      return
    }

    runCreatureRef.current = workingStarter
    setRunCreature(workingStarter)
    partyRecruitsRef.current = nextRecruits
    setPartyRecruits(nextRecruits)
    const nextPhase = phaseAfterEnemyTurn(workingStarter, nextRecruits)
    setCombatPhase(nextPhase)
    setCombatLocked(false)
    enemyTurnLockRef.current = false
    const activeActor =
      nextPhase === 'recruit'
        ? getActiveCombatHelper(nextRecruits, activeHelperId)?.name ?? 'helper'
        : workingStarter.name
    updateCombatDebugSnapshot(
      nextPhase,
      workingStarter,
      nextRecruits,
      currentEnemyState,
      activeActor,
    )
  }

  function handleBeginNewRoute() {
    if (!runCreature) return

    console.log('Generating new route')
    clearCombatTimeout()
    resetCombatSession()

    const route = generateNewRoute(currentRegionId, earnedBadges)
    const councilReconciled = reconcileMonolithCouncilUnlocks(
      monolithCouncilState,
      earnedBadges,
      { preferNotifyRegionId: currentRegionId },
    )
    if (councilReconciled.state !== monolithCouncilState) {
      setMonolithCouncilState(councilReconciled.state)
    }
    const councilApplied = applyCouncilMapState(
      route.mapNodes,
      route.nodeStates,
      currentRegionId,
      councilReconciled.state,
      earnedBadges,
    )
    setMapNodes(councilApplied.nodes)
    setNodeStates(councilApplied.states)
    setDefeatInfo(null)
    setEnemy(null)
    setBattleLog([])
    setCombatLocked(false)
    setCombatPhase('starter')
    setLastCombatNode(null)
    setActiveNodeId(null)
    setCurrentNode(null)
    setShopInventoriesByNodeId({})
    setShopRareOfferHistory([])
    setActiveShopInventory(null)
    setShopLog([])
    setScreen('runMap')
  }

  function handleVictory(defeatedEnemy: Enemy) {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits

    if (screenRef.current !== 'combat') return

    stopEncounterBattleMusic()
    clearCombatTimeout()
    combatEndedRef.current = true
    setCombatLocked(true)

    if (runModeRef.current === 'pvp') {
      handlePvpVictory()
      return
    }

    const ctx = combatContextRef.current
    console.log('Combat victory context', ctx)

    const victoryNode = ctx?.mapNode ?? lastCombatNode
    const nodeIdToComplete = ctx?.nodeId ?? activeNodeId
    const encounterKind = (ctx?.encounterType ?? activeEncounterKind) as typeof activeEncounterKind

    if (!starterSnapshot) return
    if (!ctx && (!activeNodeId || !lastCombatNode)) return
    if ((ctx?.source === 'mapNode' || ctx?.source === 'dailyRun') && !victoryNode) {
      return
    }

    if (nodeIdToComplete) {
      const nodeState = getNodeState(nodeStates, nodeIdToComplete)
      if (nodeState === 'available') {
        markNodeComplete(nodeIdToComplete)
      }
    }

    if (ctx?.source === 'event') {
      console.log('Alpha event victory resolved')
      dispatchQuestEvent('eventCompleted', {})
      dispatchRetentionEvent('eventCompleted')
    }

    const battleNode = victoryNode

    dispatchQuestEvent('battleWon', {
      encounterKind,
      nodeType: battleNode?.type,
    })
    dispatchQuestEvent('enemyDefeated', {
      encounterKind,
      enemyKind: defeatedEnemy.kind,
      enemyType: defeatedEnemy.type,
    })
    if (encounterKind === 'alphaNest' || defeatedEnemy.kind === 'alpha') {
      dispatchQuestEvent('alphaDefeated', {
        encounterKind,
        enemyKind: defeatedEnemy.kind,
      })
    }
    if (encounterKind === 'elite' || defeatedEnemy.kind === 'elite') {
      dispatchQuestEvent('eliteDefeated', {
        encounterKind,
        enemyKind: defeatedEnemy.kind,
      })
    }
    if (encounterKind === 'gymTrainer') {
      dispatchQuestEvent('gymTrainerDefeated', { encounterKind })
    }
    if (encounterKind === 'gymLeader') {
      dispatchQuestEvent('gymLeaderDefeated', { encounterKind })
    }
    if (battleNode?.type === 'boss') {
      dispatchQuestEvent('bossDefeated', { encounterKind })
    }

    dispatchRetentionEvent('battleWon')
    dispatchRetentionEvent('enemyDefeated')
    if (encounterKind === 'alphaNest') {
      dispatchRetentionEvent('alphaDefeated')
    }
    if (encounterKind === 'elite') {
      dispatchRetentionEvent('eliteOrAlphaDefeated')
    }
    if (battleNode?.type === 'boss') {
      dispatchRetentionEvent('bossDefeated', { regionId: currentRegionId })
    }

    recordBattleVictory(scoreTrackerRef.current, encounterKind)

    let rewards = getRewardsForEncounter(encounterKind, currentRegionId)
    if (dailyModifierRef.current?.coinRewardMult) {
      rewards = {
        ...rewards,
        coins: Math.round(rewards.coins * dailyModifierRef.current.coinRewardMult),
      }
    }
    const levelBefore = starterSnapshot.level
    const recruitLevelsBefore = Object.fromEntries(
      recruitsSnapshot.map((r) => [r.id, r.level]),
    )
    const helper = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    const preReviveHp = {
      starterHp: starterSnapshot.currentHp,
      helperHp: helper?.currentHp ?? null,
    }

    const xpResult = distributeBattleXp(
      encounterKind,
      currentRegionId,
      starterSnapshot,
      recruitsSnapshot,
      activeHelperId,
      preReviveHp,
      levelBefore,
      recruitLevelsBefore,
    )

    recordLevelsGained(
      scoreTrackerRef.current,
      xpResult.levelUpLines.length,
    )

    let nextStarter = addCoins(xpResult.starter, rewards.coins)
    let nextRecruits = xpResult.recruits
    if (rewards.coins > 0) {
      dispatchQuestEvent('coinsCollected', { amount: rewards.coins })
    }

    const revived = reviveFaintedToOne(nextStarter, nextRecruits)
    nextStarter = revived.starter
    nextRecruits = revived.recruits

    const badgeHeal = getPostVictoryHealFromBadges(earnedBadges)
    if (badgeHeal > 0) {
      nextStarter = {
        ...nextStarter,
        currentHp: Math.min(nextStarter.maxHp, nextStarter.currentHp + badgeHeal),
      }
      nextRecruits = nextRecruits.map((r) => ({
        ...r,
        currentHp: Math.min(r.maxHp, r.currentHp + badgeHeal),
      }))
    }

    let badgeEarned: string | undefined
    const leaderBadgeId = battleNode?.badgeId
    if (
      battleNode?.type === 'gymLeader' &&
      leaderBadgeId &&
      !earnedBadges.includes(leaderBadgeId)
    ) {
      badgeEarned = leaderBadgeId
      const badge = getBadge(leaderBadgeId)
      const newBadges = [...earnedBadges, leaderBadgeId]
      setEarnedBadges(newBadges)
      setNodeStates((s) => unlockBossIfReady(mapNodes, s, newBadges))
      appendLog(`Earned the ${badge?.name ?? 'badge'}!`)
      scoreTrackerRef.current.badgesEarned += 1
      dispatchRetentionEvent('badgeEarned', { badgeId: leaderBadgeId })
      refreshCouncilUnlock(currentRegionId)
    }

    const masteryStarter = {
      ...nextStarter,
      abilityMastery: starterSnapshot.abilityMastery,
    }
    const masteryRecruits = nextRecruits.map((r) => {
      const prev = recruitsSnapshot.find((p) => p.id === r.id)
      return prev ? { ...r, abilityMastery: prev.abilityMastery } : r
    })

    runCreatureRef.current = masteryStarter
    partyRecruitsRef.current = masteryRecruits
    setRunCreature(masteryStarter)
    setPartyRecruits(masteryRecruits)
    setPendingPerkDraftQueue(xpResult.perkDraftQueue)
    setPendingEvolutionQueue(xpResult.evolutionQueue)

    const postQueue = buildPostBattleQueue({
      perkDraftQueue: xpResult.perkDraftQueue,
      evolutionQueue: xpResult.evolutionQueue,
      starter: masteryStarter,
      recruits: masteryRecruits,
      levelBeforeStarter: levelBefore,
      recruitLevelsBefore,
      masteryPerkQueue: pendingAbilityUpgradeQueueRef.current,
      masteryTransformQueue: pendingTransformQueueRef.current,
    })
    setPendingPostBattleQueue(postQueue)
    pendingPostBattleQueueRef.current = postQueue

    const preMastery = preCombatMasteryRef.current
    const masteryLines =
      preMastery != null
        ? buildMasteryRewardLines(
            {
              ...starterSnapshot,
              abilityMastery: preMastery.starter,
            },
            starterSnapshot,
            recruitsSnapshot.map((r) => ({
              ...r,
              abilityMastery: preMastery.recruits[r.id] ?? r.abilityMastery,
            })),
            recruitsSnapshot,
          )
        : []

    const pendingChoices = summarizePostBattleQueue(postQueue)

    for (const line of masteryLines) {
      if (line.xpGained > 0) {
        dispatchRetentionEvent('abilityMasteryXp', { amount: line.xpGained })
      }
      if (line.rankUp && line.newRank != null) {
        dispatchRetentionEvent('abilityMasteryLevelReached', {
          masteryLevel: line.newRank,
        })
      }
    }

    if (xpResult.perkDraftQueue.length > 0) {
      advanceTutorialTo('claimRewards')
      maybeAdvanceTutorial('winBattle', 'choosePerk')
    } else {
      advanceTutorialTo('claimRewards')
      maybeAdvanceTutorial('winBattle', 'masteryProgress')
    }
    setPendingAbilityUpgradeQueue([])
    pendingAbilityUpgradeQueueRef.current = []
    setPendingTransformQueue([])
    pendingTransformQueueRef.current = []

    const isBossVictory = battleNode?.type === 'boss'
    if (isBossVictory) {
      setPendingBossVictory(true)
    }

    const droppedGear = rollBattleGearDrop(encounterKind)
    const dropResult = applyBattleDropsToInventory(
      trainerInventory,
      encounterKind,
      droppedGear,
    )
    setTrainerInventory(dropResult.inventory)
    if (dropResult.gearId) {
      dispatchRetentionEvent('gearCollected', { gearId: dropResult.gearId })
    }
    for (const itemId of dropResult.itemIds) {
      dispatchQuestEvent('itemCollected', { itemId })
      dispatchRetentionEvent('itemCollected', { itemId })
    }
    for (const itemId of dropResult.materialIds) {
      dispatchQuestEvent('itemCollected', { itemId })
      dispatchRetentionEvent('materialCollected', { itemId })
    }

    const rewardPayload: RewardInfo = {
      coinsGained: rewards.coins,
      xpLines: xpResult.xpLines,
      levelUpLines: xpResult.levelUpLines,
      masteryLines,
      pendingChoices,
      loot: rewards.coins > 0 ? 'Coin reward from battle' : 'None',
      enemyName: defeatedEnemy.name,
      hasPerkDrafts: xpResult.perkDraftQueue.length > 0,
      badgeEarned,
      bossVictory: isBossVictory ? true : undefined,
      gearFound: dropResult.gearFound,
      itemsFound: dropResult.itemsFound.length > 0 ? dropResult.itemsFound : undefined,
      materialsFound:
        dropResult.materialsFound.length > 0 ? dropResult.materialsFound : undefined,
    }

    const recruitChance =
      RECRUITMENT_CHANCE + (dailyModifierRef.current?.recruitChanceBonus ?? 0)
    const recruitRoll =
      battleNode?.type === 'battle' &&
      canRecruitEnemy(defeatedEnemy, battleNode.type) &&
      Math.random() < recruitChance

    setEnemy(null)
    setCombatContextBoth(null)
    setLastCombatNode(null)

    if (recruitRoll) {
      setPendingRecruit(convertEnemyToRecruit(defeatedEnemy))
      setRewardInfo({
        ...rewardPayload,
        recruitmentNote: `Recruitment available — ${defeatedEnemy.name} wants to join!`,
      })
      setScreen('recruitment')
      void persistRun()
      return
    }

    const questLines = buildQuestRewardLines()
    setRewardInfo({
      ...rewardPayload,
      questProgressLines: questLines.progress,
      questCompletedTitles: questLines.completed,
    })
    advanceTutorialTo('claimRewards')
    setScreen('reward')
    void persistRun()
  }

  function handleFleeClick() {
    if (combatEndedRef.current || screenRef.current !== 'combat') return
    if (combatContextRef.current?.source === 'monolithCouncil') {
      const ok = window.confirm(
        'Fleeing will abandon the Council challenge. Continue?',
      )
      if (!ok) return
      abandonCouncilGauntlet()
      return
    }
    setFleeConfirmOpen(true)
  }

  function handleFleeCancel() {
    setFleeConfirmOpen(false)
  }

  function handleFleeConfirmed() {
    setFleeConfirmOpen(false)
    handleCombatFlee()
  }

  function handleCombatFlee() {
    if (screenRef.current !== 'combat' || combatEndedRef.current) return

    const ctx = combatContextRef.current
    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!starterSnapshot) return

    stopEncounterBattleMusic()
    clearCombatTimeout()
    combatEndedRef.current = true
    setCombatLocked(true)

    if (runModeRef.current === 'pvp') {
      finishPvpDefeat()
      cleanupCombatState()
      resetCombatSession()
      return
    }

    if (runModeRef.current === 'daily') {
      const ok = window.confirm(
        'Fleeing abandons this daily attempt. Your best score is kept. Continue?',
      )
      if (!ok) {
        combatEndedRef.current = false
        setCombatLocked(false)
        return
      }
      handleDailyDefeatAfterDeath()
      cleanupCombatState()
      resetCombatSession()
      return
    }

    let nextStarter = starterSnapshot
    if (nextStarter.coins >= 5) {
      nextStarter = addCoins(nextStarter, -5)
      setMapMessage('You fled — lost 5 coins.')
    } else {
      const hpLoss = Math.max(1, Math.floor(nextStarter.currentHp * 0.1))
      nextStarter = {
        ...nextStarter,
        currentHp: Math.max(1, nextStarter.currentHp - hpLoss),
      }
      setMapMessage('You fled — party took minor damage.')
    }

    const cleared = clearPartyBattleBuffs(
      nextStarter,
      partyRecruitsRef.current ?? partyRecruits,
    )
    runCreatureRef.current = cleared.starter
    partyRecruitsRef.current = cleared.recruits
    setRunCreature(cleared.starter)
    setPartyRecruits(cleared.recruits)

    if (
      ctx?.encounterType === 'alphaNest' ||
      ctx?.encounterType === 'elite'
    ) {
      setMapMessage('You escaped the dangerous encounter.')
    }

    cleanupCombatState()
    resetCombatSession()
    setScreen('runMap')
    void persistRun()
  }

  function handlePlayerAbility(combatantKey: string, abilityId: string) {
    if (
      screenRef.current !== 'combat' ||
      combatEndedRef.current ||
      !runCreature ||
      !enemy ||
      combatLocked ||
      combatPhase === 'enemy'
    ) {
      return
    }

    const helper = getActiveCombatHelper(partyRecruits, activeHelperId)
    const turn = getPlayerTurnView(runCreature, partyRecruits, combatPhase)

    if (combatantKey === 'starter' && runCreature.currentHp <= 0) {
      skipToNextLivingAttacker(`${runCreature.name} cannot fight — passing turn.`)
      return
    }

    if (helper && combatantKey === helper.id && helper.currentHp <= 0) {
      skipToNextLivingAttacker(`${helper.name} cannot fight — enemy turn.`)
      return
    }

    if (turn.activeKey !== combatantKey) {
      return
    }

    setCombatLocked(true)
    maybeAdvanceTutorial('useAbility', 'combatBasics')
    maybeAdvanceTutorial('combatBasics', 'winBattle')

    const questAbility = getAbility(abilityId)
    if (questAbility) {
      dispatchQuestEvent('abilityUsed', { abilityType: questAbility.type })
      dispatchRetentionEvent('abilityUsed')
    }

    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits

    if (combatantKey === 'starter' && starterSnapshot.currentHp > 0) {
      const result = applyAbilityToEnemy(
        abilityId,
        starterSnapshot,
        starterSnapshot.name,
        'starter',
      )
      if (result) {
        commitAttackerState(result.attackerKey, result.updatedAttacker)
        handoffAfterPlayerAttack(result.nextEnemy, 'starter')
      }
      return
    }

    const recruit = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    if (recruit && recruit.currentHp > 0 && combatantKey === recruit.id) {
      const result = applyAbilityToEnemy(
        abilityId,
        recruit,
        recruit.name,
        recruit.id,
      )
      if (result) {
        commitAttackerState(result.attackerKey, result.updatedAttacker)
        handoffAfterPlayerAttack(result.nextEnemy, 'recruit')
      }
      return
    }

    if (combatPhase === 'recruit' && (!recruit || recruit.currentHp <= 0)) {
      handoffAfterPlayerAttack(enemy, 'recruit')
      return
    }

    setCombatLocked(false)
  }

  useEffect(() => {
    if (screen !== 'combat' || !runCreature || !enemy || combatLocked) return
    if (combatEndedRef.current || enemyTurnLockRef.current) return

    const view = getPlayerTurnView(runCreature, partyRecruits, combatPhase)
    if (view.activeKey === null && combatPhase === 'recruit') {
      beginEnemyTurn(enemy)
    }
  }, [
    screen,
    combatPhase,
    runCreature,
    partyRecruits,
    enemy,
    combatLocked,
    activeHelperId,
  ])

  useEffect(() => {
    if (screen !== 'combat' || combatPhase !== 'enemy' || !combatLocked) return
    if (enemyTurnLockRef.current) return
    const timer = window.setTimeout(() => {
      if (screenRef.current !== 'combat' || enemyTurnLockRef.current) return
      const starterSnapshot = runCreatureRef.current ?? runCreature
      const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
      if (!starterSnapshot) return
      const phase = phaseAfterEnemyTurn(starterSnapshot, recruitsSnapshot)
      setCombatPhase(phase)
      setCombatLocked(false)
      console.warn('Combat phase recovery: unstuck from enemy phase')
    }, 4500)
    return () => window.clearTimeout(timer)
  }, [screen, combatPhase, combatLocked])

  useEffect(() => {
    if (!showTesterPanel) return
    ;(window as Window & { simulateCombatBalance?: typeof simulateCombatBalance }).simulateCombatBalance =
      simulateCombatBalance
    return () => {
      delete (window as Window & { simulateCombatBalance?: typeof simulateCombatBalance })
        .simulateCombatBalance
    }
  }, [showTesterPanel])

  function getLatestRecruits(): PartyCreature[] {
    return partyRecruitsRef.current
  }

  function getLatestStarter(): RunCreature | null {
    return runCreatureRef.current ?? runCreature
  }

  function getCreatureSelectedPerks(creatureId: string): string[] {
    if (creatureId === STARTER_CREATURE_ID) {
      return getLatestStarter()?.selectedPerks ?? []
    }
    return getLatestRecruits().find((r) => r.id === creatureId)?.selectedPerks ?? []
  }

  function getCreatureForDraft(
    creatureId: string,
  ): RunCreature | PartyCreature | null {
    if (creatureId === STARTER_CREATURE_ID) {
      return getLatestStarter()
    }
    return getLatestRecruits().find((r) => r.id === creatureId) ?? null
  }

  function startPerkDraftFor(creatureId: string, perks?: string[]): boolean {
    const creature = getCreatureForDraft(creatureId)
    const exclude = perks ?? getCreatureSelectedPerks(creatureId)
    const speciesKey = creature
      ? resolveCreatureSpeciesKey({
          starterTypeId:
            creatureId === STARTER_CREATURE_ID
              ? getLatestStarter()?.starterTypeId
              : undefined,
          templateId:
            creatureId !== STARTER_CREATURE_ID
              ? getLatestRecruits().find((r) => r.id === creatureId)?.templateId
              : undefined,
          type: creature.type,
        })
      : 'fire'
    const options = pickPerksForCreature(speciesKey, exclude, 3, {
      level: creature?.level ?? 1,
      type: creature?.type,
      stats: creature?.stats ?? creature?.baseStats,
      abilityIds: creature?.abilityIds ?? [creature?.abilityId ?? 'tackle'],
      role: creature
        ? inferCreatureRole(
            creature.stats ?? creature.baseStats,
            creature.abilityIds ?? [creature.abilityId],
          )
        : undefined,
    })
    if (options.length === 0) {
      return false
    }
    setDraftingCreatureId(creatureId)
    setDraftOptions(options)
    advanceTutorialTo('choosePerk')
    setScreen('perkDraft')
    return true
  }

  function beginEvolutionFor(
    entry: EvolutionQueueEntry,
    starter: RunCreature,
    recruits: PartyCreature[],
  ): boolean {
    const { creatureId, threshold } = entry

    const preview =
      creatureId === STARTER_CREATURE_ID
        ? buildEvolutionPreview(starter, threshold)
        : (() => {
            const recruit = recruits.find((r) => r.id === creatureId)
            return recruit
              ? buildEvolutionPreviewForRecruit(recruit, threshold)
              : null
          })()

    if (!preview) return false

    setEvolutionScreenData({
      oldName: preview.oldName,
      form: preview.form,
      dominantCategory: preview.dominant.category,
      dominantReason: preview.dominant.reason,
      threshold,
      creatureId,
    })
    setScreen('evolution')
    return true
  }

  function beginAbilityUpgradeFor(entry: AbilityMasteryPerkQueueEntry) {
    setPendingAbilityUpgradeQueue([entry])
    pendingAbilityUpgradeQueueRef.current = [entry]
    setScreen('abilityUpgrade')
  }

  function beginMoveLearn(creatureId: string, abilityId: string) {
    setMoveLearnContext({ creatureId, abilityId })
    setScreen('moveLearn')
  }

  function beginAbilityTransform(entry: AbilityTransformQueueEntry) {
    setActiveTransformEntry(entry)
    setScreen('abilityTransform')
  }

  function processNextPostBattleEvent(
    starter: RunCreature,
    recruits: PartyCreature[],
    queue: PostBattleQueueEvent[],
  ) {
    const event = queue[0]
    if (!event) {
      proceedAfterVictoryFlow(starter, recruits)
      return
    }

    switch (event.type) {
      case 'perkDraft': {
        const perks =
          event.creatureId === STARTER_CREATURE_ID
            ? starter.selectedPerks
            : (recruits.find((r) => r.id === event.creatureId)?.selectedPerks ??
              [])
        if (!startPerkDraftFor(event.creatureId, perks)) {
          consumePostBattleQueueAndContinue(starter, recruits)
        }
        return
      }
      case 'moveLearn':
        beginMoveLearn(event.creatureId, event.abilityId)
        return
      case 'evolution': {
        const started = beginEvolutionFor(
          { creatureId: event.creatureId, threshold: event.threshold },
          starter,
          recruits,
        )
        if (!started) {
          consumePostBattleQueueAndContinue(starter, recruits)
        }
        return
      }
      case 'abilityMasteryPerk': {
        const masteryCreature =
          event.creatureId === STARTER_CREATURE_ID
            ? starter
            : (recruits.find((r) => r.id === event.creatureId) ?? null)
        if (!masteryCreature) {
          consumePostBattleQueueAndContinue(starter, recruits)
          return
        }
        const masteryEntry = getMasteryEntry(masteryCreature, event.abilityId)
        if (isMasteryPerkRankClaimed(masteryEntry, event.rank)) {
          consumePostBattleQueueAndContinue(starter, recruits)
          return
        }
        const draftEntry = buildAbilityMasteryPerkQueueEntry(
          event.creatureId,
          event.abilityId,
          event.rank,
          masteryEntry.selectedPerks,
        )
        beginAbilityUpgradeFor(draftEntry)
        return
      }
      case 'abilityTransform':
        beginAbilityTransform({
          creatureId: event.creatureId,
          abilityId: event.abilityId,
          previousAbilityId: event.previousAbilityId,
          rank: event.rank,
          path: event.path,
          newAbilityId: event.newAbilityId,
          newName: event.newName,
          description: event.description,
        })
        return
      default:
        proceedAfterVictoryFlow(starter, recruits)
    }
  }

  function consumePostBattleQueueAndContinue(
    starter: RunCreature,
    recruits: PartyCreature[],
  ) {
    const nextQueue = shiftQueue(pendingPostBattleQueueRef.current)
    setPendingPostBattleQueue(nextQueue)
    pendingPostBattleQueueRef.current = nextQueue
    processNextPostBattleEvent(starter, recruits, nextQueue)
  }

  function advancePostBattleFlow() {
    if (!runCreature) return
    processNextPostBattleEvent(
      runCreatureRef.current ?? runCreature,
      partyRecruitsRef.current,
      pendingPostBattleQueueRef.current,
    )
  }

  function getCreatureById(creatureId: string): RunCreature | PartyCreature | null {
    if (creatureId === STARTER_CREATURE_ID) return getLatestStarter()
    return getLatestRecruits().find((r) => r.id === creatureId) ?? null
  }

  function handleAbilityUpgradeChosen(perkId: string) {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot || pendingAbilityUpgradeQueue.length === 0) return

    const entry = pendingAbilityUpgradeQueue[0]
    let nextStarter = starterSnapshot
    let nextRecruits = getLatestRecruits()

    if (entry.creatureId === STARTER_CREATURE_ID) {
      nextStarter = applyPerkToCreature(
        starterSnapshot,
        entry.abilityId,
        perkId,
        entry.rank,
      )
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === entry.creatureId
          ? applyPerkToCreature(r, entry.abilityId, perkId, entry.rank)
          : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    const remainingUpgrades = pendingAbilityUpgradeQueue.slice(1)
    setPendingAbilityUpgradeQueue(remainingUpgrades)
    pendingAbilityUpgradeQueueRef.current = remainingUpgrades
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnConfirm() {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot || !moveLearnContext) return
    const { creatureId, abilityId } = moveLearnContext
    let nextStarter = starterSnapshot
    let nextRecruits = getLatestRecruits()

    if (creatureId === STARTER_CREATURE_ID) {
      nextStarter = addActiveAbility(starterSnapshot, abilityId)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === creatureId ? addActiveAbility(r, abilityId) : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnReplace(oldAbilityId: string) {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot || !moveLearnContext) return
    const { creatureId, abilityId } = moveLearnContext
    let nextStarter = starterSnapshot
    let nextRecruits = getLatestRecruits()

    if (creatureId === STARTER_CREATURE_ID) {
      nextStarter = forgetActiveAbility(starterSnapshot, oldAbilityId, abilityId)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === creatureId
          ? forgetActiveAbility(r, oldAbilityId, abilityId)
          : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnSkip() {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot) return
    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(starterSnapshot, getLatestRecruits())
  }

  function handleTransformConfirm() {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot || !activeTransformEntry) return
    const entry = activeTransformEntry
    let nextStarter = starterSnapshot
    let nextRecruits = getLatestRecruits()

    if (entry.creatureId === STARTER_CREATURE_ID) {
      nextStarter = applyTransformationToCreature(
        starterSnapshot,
        entry.abilityId,
        entry.newAbilityId,
        entry.rank,
      )
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === entry.creatureId
          ? applyTransformationToCreature(
              r,
              entry.abilityId,
              entry.newAbilityId,
              entry.rank,
            )
          : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    setActiveTransformEntry(null)
    dispatchRetentionEvent('abilityTransformed', { abilityId: entry.newAbilityId })
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleEvolutionContinue() {
    const starterSnapshot = getLatestStarter()
    if (!starterSnapshot || !evolutionScreenData) return

    const { threshold, creatureId } = evolutionScreenData
    const targetId = creatureId ?? STARTER_CREATURE_ID

    let nextStarter = starterSnapshot
    let nextRecruits = getLatestRecruits()

    if (targetId === STARTER_CREATURE_ID) {
      nextStarter = evolveStarter(starterSnapshot, threshold)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === targetId ? evolvePartyCreature(r, threshold) : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    const evolvedName =
      targetId === STARTER_CREATURE_ID
        ? nextStarter.name
        : nextRecruits.find((r) => r.id === targetId)?.name
    if (evolvedName) {
      dispatchRetentionEvent('creatureEvolved', {
        creatureName: evolvedName,
        regionId: currentRegionId,
      })
    }

    scoreTrackerRef.current.evolutionsReached += 1
    setEvolutionScreenData(null)
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function buildRegionCompleteSnapshot(
    reward: RewardInfo,
    regionId: string,
  ): RegionCompleteData {
    const xpTotal = reward.xpLines.reduce((sum, line) => sum + line.xpGained, 0)
    return {
      regionId,
      bossName: reward.enemyName,
      coinsGained: reward.coinsGained,
      xpTotal,
      badgesInRegion: countBadgesInRegion(regionId, earnedBadges),
      totalBadges: earnedBadges.length,
    }
  }

  function openRegionComplete(reward: RewardInfo) {
    const snapshot = buildRegionCompleteSnapshot(reward, currentRegionId)
    setRegionCompleteInfo(snapshot)
    setCompletedRegionIds((prev) =>
      prev.includes(currentRegionId) ? prev : [...prev, currentRegionId],
    )
    setPendingBossVictory(false)
    setRewardInfo(null)
    resetCombatSession()
    setEnemy(null)
    setBattleLog([])
    setCombatLocked(false)
    setPendingPerkDraftQueue([])
    setPendingEvolutionQueue([])
    setPendingAbilityUpgradeQueue([])
    setPendingTransformQueue([])
    setPendingPostBattleQueue([])
    setDraftingCreatureId(null)
    setDraftOptions([])
    setPendingRecruit(null)
    setLastCombatNode(null)
    setCombatPhase('starter')
    setActiveNodeId(null)
    setCurrentNode(null)
    setScreen('regionComplete')
    if (runModeRef.current === 'daily') {
      syncDailyDayStateFromGame(false)
      void tryAutoSubmitDailyLeaderboard({ silent: true })
    } else {
      void tryAutoSubmitCampaignLeaderboard(false, true)
    }
  }

  function healPartyAfterBattle(
    creature: RunCreature,
    recruits: PartyCreature[] = partyRecruitsRef.current,
  ) {
    const healed = clearPartyBattleBuffs(
      applyPostBattleHealing(creature),
      recruits,
    )
    let healedStarter = healed.starter
    const healedRecruits = healed.recruits.map((r) => {
      let next = r
      if (hasCreaturePerk(next, 'second-wind')) {
        next = {
          ...next,
          currentHp: Math.min(next.maxHp, next.currentHp + 8),
        }
      }
      return next
    })
    setRunCreature(healedStarter)
    setPartyRecruits(healedRecruits)
    partyRecruitsRef.current = healedRecruits
    runCreatureRef.current = healedStarter
  }

  function proceedAfterVictoryFlow(
    creature: RunCreature,
    recruits: PartyCreature[] = partyRecruitsRef.current,
  ) {
    if (progressionFlowSourceRef.current === 'standalone') {
      progressionFlowSourceRef.current = 'battle'
      finishRunReturn()
      return
    }

    const councilAfterReward = councilPostRewardRef.current
    if (councilAfterReward) {
      councilPostRewardRef.current = null
      setRewardInfo(null)
      const council = getCouncilDefinitionOrThrow(currentRegionId)
      let nextStarter = runCreatureRef.current ?? creature
      let nextRecruits = partyRecruitsRef.current ?? recruits
      const healed = applyCouncilFreeRecovery(
        nextStarter,
        nextRecruits,
        activeHelperId,
      )
      runCreatureRef.current = healed.starter
      partyRecruitsRef.current = healed.recruits
      setRunCreature(healed.starter)
      setPartyRecruits(healed.recruits)
      resetCombatSession()
      setEnemy(null)
      setBattleLog([])
      setCombatLocked(false)
      setPendingPerkDraftQueue([])
      setPendingEvolutionQueue([])
      setPendingAbilityUpgradeQueue([])
      setDraftingCreatureId(null)
      setDraftOptions([])
      setPendingRecruit(null)
      setLastCombatNode(null)
      setCombatPhase('starter')
      setPendingPostBattleQueue([])
      pendingPostBattleQueueRef.current = []

      if (councilAfterReward.gauntletComplete) {
        finishCouncilGauntlet(council)
        return
      }
      setScreen('councilIntermission')
      void persistRun()
      return
    }

    healPartyAfterBattle(creature, recruits)

    if (rewardInfo?.bossVictory || pendingBossVictory) {
      if (runModeRef.current === 'daily') {
        scoreTrackerRef.current.badgesEarned = earnedBadges.length
        syncDailyDayStateFromGame(false)
        const input = buildDailyScoreInput(false)
        if (input && dailySeedRef.current) {
          let day = getDailyRunDayStateForToday(
            dailySeedRef.current,
            dailyModifierRef.current.id,
          )
          const result = updateBestDailyScore(day, input)
          saveDailyRunDayState(result.dayState)
        }
      }

      if (rewardInfo) {
        openRegionComplete(rewardInfo)
        return
      }
    }

    finishRunReturn()
  }

  function finishRunReturn() {
    resetCombatSession()
    setEnemy(null)
    setBattleLog([])
    setRewardInfo(null)
    setCombatLocked(false)
    setPendingPerkDraftQueue([])
    setPendingEvolutionQueue([])
    setPendingAbilityUpgradeQueue([])
    setDraftingCreatureId(null)
    setDraftOptions([])
    setPendingRecruit(null)
    setLastCombatNode(null)
    setCombatPhase('starter')
    maybeAdvanceTutorial('evolutionPath', 'nextNode')
    setScreen('runMap')
  }

  function handleChooseNextRegion() {
    if (runModeRef.current === 'daily') {
      syncDailyDayStateFromGame(false)
      void tryAutoSubmitDailyLeaderboard({ silent: true })
      const allCleared = REGIONS.every((r) => completedRegionIds.includes(r.id))
      if (allCleared) {
        openRunSummary(true)
        return
      }
    } else {
      void tryAutoSubmitCampaignLeaderboard(false, true)
    }
    setScreen('regionSelect')
  }

  function clearActiveRouteState() {
    setRegionCompleteInfo(null)
    setPendingBossVictory(false)
    setRewardInfo(null)
    setDefeatInfo(null)
    setEnemy(null)
    setBattleLog([])
    setCombatLocked(false)
    setLastCombatNode(null)
    setActiveNodeId(null)
    setCurrentNode(null)
    setActiveEncounterKind('battle')
    setMapMessage(null)
    setNodeClickDebug(null)
    setCurrentEvent(null)
    setRestChoiceMade(false)
    setPendingRecruit(null)
    resetCombatSession()
  }

  function handleLeaveArea() {
    if (runModeRef.current === 'daily') {
      window.alert(
        'Daily Runs cannot leave the route. You can restart the daily attempt instead.',
      )
      return
    }
    const ok = window.confirm(
      'Leave this area? Your current map route will reset, but your character, party, items, badges, and progress will be kept.',
    )
    if (!ok) return

    setMapNodes([])
    setNodeStates({})
    clearActiveRouteState()
    setMapMessage('Choose a region to continue your run.')
    setScreen('regionSelect')
    void persistRun()
  }

  function handleTravelToRegion(regionId: string) {
    const route = createRegionMap(regionId, earnedBadges)
    const councilReconciled = reconcileMonolithCouncilUnlocks(
      monolithCouncilState,
      earnedBadges,
      { preferNotifyRegionId: regionId },
    )
    if (councilReconciled.state !== monolithCouncilState) {
      setMonolithCouncilState(councilReconciled.state)
    }
    const councilApplied = applyCouncilMapState(
      route.nodes,
      route.nodeStates,
      regionId,
      councilReconciled.state,
      earnedBadges,
    )
    setCurrentRegionId(regionId)
    setMapNodes(councilApplied.nodes)
    setNodeStates(councilApplied.states)
    clearActiveRouteState()
    if (runModeRef.current === 'daily') {
      syncDailyDayStateFromGame(false)
    } else {
      void tryAutoSubmitCampaignLeaderboard(false, true)
    }
    setScreen('runMap')
    void persistRun()
  }

  function handleAcceptRecruit() {
    if (!runCreature || !pendingRecruit) return

    const syncedRecruit = partyCreatureAtLevel(
      pendingRecruit,
      getPartyHighestLevel(runCreature, partyRecruits),
    )
    let nextRecruits = [...partyRecruits, syncedRecruit]
    if (nextRecruits.length > MAX_RECRUITS) {
      nextRecruits = nextRecruits.slice(-MAX_RECRUITS)
    }
    setPartyRecruits(nextRecruits)
    partyRecruitsRef.current = nextRecruits
    scoreTrackerRef.current.recruitsAdded += 1
    const templateId = pendingRecruit.templateId
    setPendingRecruit(null)
    dispatchQuestEvent('creatureRecruited', {})
    dispatchRetentionEvent('creatureRecruited', {
      templateId,
      regionId: currentRegionId,
    })
    setScreen('reward')
  }

  function handleReplaceRecruit(replaceId: string) {
    if (!runCreature || !pendingRecruit) return

    const syncedRecruit = partyCreatureAtLevel(
      pendingRecruit,
      getPartyHighestLevel(
        runCreature,
        partyRecruits.filter((r) => r.id !== replaceId),
      ),
    )
    const nextRecruits = partyRecruits.map((r) =>
      r.id === replaceId ? syncedRecruit : r,
    )
    setPartyRecruits(nextRecruits)
    partyRecruitsRef.current = nextRecruits
    scoreTrackerRef.current.recruitsAdded += 1
    const templateId = pendingRecruit.templateId
    dispatchQuestEvent('creatureRecruited', {})
    dispatchRetentionEvent('creatureRecruited', {
      templateId,
      regionId: currentRegionId,
    })
    if (activeHelperId === replaceId) {
      setActiveHelperId(pendingRecruit.id)
    }
    setPendingRecruit(null)
    setScreen('reward')
  }

  function handleOpenParty() {
    if (!partyOpenedThisRunRef.current) {
      partyOpenedThisRunRef.current = true
      maybeAdvanceTutorial('masteryProgress', 'evolutionPath')
    }
    setScreen('party')
  }

  function handleResetTutorial() {
    resetTutorialPrefs()
    void setProfileTutorialCompleted(false)
    for (const slotId of [1, 2] as SaveSlotId[]) {
      const envelope = loadEnvelopeFromSlot(slotId)
      if (envelope) {
        setSaveSlotTutorialCompleted(slotId, false)
      }
    }
    setTutorialActive(false)
    setTutorialStep(null)
    window.alert('Tutorial reset. Tips will show on your next new run.')
  }

  function handlePartyBack() {
    setScreen('runMap')
  }

  function handleSetPartyHelper(recruitId: string) {
    if (!runCreature || !partyRecruits.some((r) => r.id === recruitId)) return
    const targetLevel = getPartyHighestLevel(runCreature, partyRecruits)
    const synced = partyRecruits.map((r) =>
      r.id === recruitId ? partyCreatureAtLevel(r, targetLevel) : r,
    )
    setPartyRecruits(synced)
    partyRecruitsRef.current = synced
    setActiveHelperId(recruitId)
  }

  function handleDismissRecruit(recruitId: string) {
    const dismissed = partyRecruits.find((r) => r.id === recruitId)
    if (dismissed?.equippedGearId) {
      setTrainerInventory((prev) =>
        addGearIdToTrainerInventory(prev, dismissed.equippedGearId!),
      )
    }
    const nextRecruits = partyRecruits.filter((r) => r.id !== recruitId)
    setPartyRecruits(nextRecruits)
    partyRecruitsRef.current = nextRecruits
    if (activeHelperId === recruitId) {
      setActiveHelperId(null)
    }
  }

  function handleDeclineRecruit() {
    setPendingRecruit(null)
    if (!runCreature) return
    if (rewardInfo) {
      setScreen('reward')
      return
    }
    advancePostBattleFlow()
  }

  function handleRewardContinue() {
    if (!runCreature || !rewardInfo) return
    maybeAdvanceTutorial('claimRewards', 'choosePerk')
    advancePostBattleFlow()
  }

  function handlePerkChosen(perkId: string) {
    if (!runCreature || !draftingCreatureId) return

    let nextStarter = runCreature
    let nextRecruits = partyRecruitsRef.current

    if (draftingCreatureId === STARTER_CREATURE_ID) {
      nextStarter = applyPerk(runCreature, perkId)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    } else {
      nextRecruits = nextRecruits.map((r) =>
        r.id === draftingCreatureId ? applyPerkToPartyCreature(r, perkId) : r,
      )
      setPartyRecruits(nextRecruits)
      partyRecruitsRef.current = nextRecruits
    }

    setDraftingCreatureId(null)
    maybeAdvanceTutorial('choosePerk', 'masteryProgress')
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function getRunShopSeed(): string {
    if (runModeRef.current === 'daily' && dailySeedRef.current) {
      return dailySeedRef.current
    }
    const nodeKey = mapNodes.map((n) => n.id).join('|')
    return `${currentRegionId}:${nodeKey}:${activeSlotId ?? 0}`
  }

  function buildPartyElementTypes(): ElementType[] {
    if (!runCreature) return ['Fire']
    const types = new Set<ElementType>()
    types.add(runCreature.type)
    for (const r of partyRecruits) types.add(r.type)
    return [...types]
  }

  function appendShopRareHistory(gearIds: string[]) {
    const rareIds = gearIds.filter((id) => {
      const g = getGearItem(id)
      return g && ['epic', 'mythic', 'legendary'].includes(g.rarity)
    })
    if (rareIds.length === 0) return
    setShopRareOfferHistory((prev) => [...prev, ...rareIds].slice(-24))
  }

  function openShopForNode(node: MapNode) {
    if (!runCreature) return
    setShopLog([])
    const shopType = resolveShopType(node.type, node.label)
    let stock = shopInventoriesByNodeId[node.id]
    if (!stock) {
      stock = generateShopInventory({
        shopType,
        region: currentRegionId,
        playerLevel: getPartyHighestLevel(runCreature, partyRecruits),
        partyTypes: buildPartyElementTypes(),
        seed: getRunShopSeed(),
        nodeId: node.id,
        nodeLabel: node.label,
        previousShopHistory: shopRareOfferHistory,
      })
      setShopInventoriesByNodeId((prev) => ({ ...prev, [node.id]: stock }))
      appendShopRareHistory(stock.gearIds)
    }
    setActiveShopInventory(stock)
    setScreen('shop')
  }

  function handleLeaveShop() {
    if (!activeNodeId) return
    markNodeComplete(activeNodeId)
    setShopLog([])
    setActiveShopInventory(null)
    setScreen('runMap')
  }

  function handleBuyShopItem(itemId: string) {
    if (!runCreature || !activeShopInventory) return
    if (!activeShopInventory.itemIds.includes(itemId)) return

    const def = getItemDefinition(itemId)
    if (!def) return
    const source = shopTypeToPurchaseSource(activeShopInventory.shopType)
    const cost = getItemPurchasePrice(def, source)
    if (cost == null) {
      setShopLog((prev) => [...prev, `Cannot buy ${def.name} — price unavailable.`])
      return
    }

    if (runCreature.coins < cost) {
      setShopLog((prev) => [
        ...prev,
        `Not enough coins for ${def.name} (need ${cost}).`,
      ])
      return
    }

    const next: RunCreature = {
      ...runCreature,
      coins: runCreature.coins - cost,
    }
    setTrainerInventory((prev) => addItemToTrainerInventory(prev, itemId, 1))
    dispatchRetentionEvent('itemCollected', { itemId })
    setShopLog((prev) => [...prev, `Bought ${def.name} x1.`])
    runCreatureRef.current = next
    setRunCreature(next)
  }

  function handleBuyGear(gearId: string) {
    if (!runCreature || !activeShopInventory) return
    const gear = getGearItem(gearId)
    if (!gear) return
    if (!activeShopInventory.gearIds.includes(gearId)) return

    const source = shopTypeToPurchaseSource(activeShopInventory.shopType)
    const cost = getGearPurchasePrice(gear, source)
    if (cost == null) {
      setShopLog((prev) => [...prev, `Cannot buy ${gear.name} — not sold here.`])
      return
    }

    if (runCreature.coins < cost) {
      setShopLog((prev) => [
        ...prev,
        `Not enough coins for ${gear.name} (need ${cost}).`,
      ])
      return
    }

    const next: RunCreature = {
      ...runCreature,
      coins: runCreature.coins - cost,
    }
    setTrainerInventory((prev) => addGearIdToTrainerInventory(prev, gearId))
    dispatchRetentionEvent('gearCollected', { gearId })
    setShopLog((prev) => [...prev, `Bought ${gear.name} x1.`])
    runCreatureRef.current = next
    setRunCreature(next)
  }

  function handleEquipGear(creatureId: string, gearInstanceId: string) {
    if (!runCreature) return

    if (creatureId === STARTER_CREATURE_ID) {
      const result = equipGearFromTrainerInventory(
        runCreature,
        trainerInventory,
        gearInstanceId,
      )
      if (!result) return
      setRunCreature(result.creature)
      runCreatureRef.current = result.creature
      setTrainerInventory(result.inventory)
      setGearEquipCreatureId(null)
      setInventoryMessage(`Equipped gear on ${runCreature.name}.`)
      dispatchQuestEvent('gearEquipped', {})
      dispatchRetentionEvent('gearEquipped')
      return
    }

    const recruit = partyRecruits.find((r) => r.id === creatureId)
    if (!recruit) return
    const result = equipGearFromTrainerInventory(
      recruit,
      trainerInventory,
      gearInstanceId,
    )
    if (!result) return
    const nextRecruits = partyRecruits.map((r) =>
      r.id === creatureId ? result.creature : r,
    )
    setPartyRecruits(nextRecruits)
    partyRecruitsRef.current = nextRecruits
    setTrainerInventory(result.inventory)
    setGearEquipCreatureId(null)
    setInventoryMessage(`Equipped gear on ${recruit.name}.`)
    dispatchQuestEvent('gearEquipped', {})
    dispatchRetentionEvent('gearEquipped')
  }

  function handleUnequipGear(creatureId: string) {
    if (!runCreature) return

    if (creatureId === STARTER_CREATURE_ID) {
      const result = unequipGearToTrainerInventory(runCreature, trainerInventory)
      if (result.creature.equippedGearId === runCreature.equippedGearId) return
      setRunCreature(result.creature)
      runCreatureRef.current = result.creature
      setTrainerInventory(result.inventory)
      return
    }

    const recruit = partyRecruits.find((r) => r.id === creatureId)
    if (!recruit) return
    const result = unequipGearToTrainerInventory(recruit, trainerInventory)
    if (result.creature.equippedGearId === recruit.equippedGearId) return
    const nextRecruits = partyRecruits.map((r) =>
      r.id === creatureId ? result.creature : r,
    )
    setPartyRecruits(nextRecruits)
    partyRecruitsRef.current = nextRecruits
    setTrainerInventory(result.inventory)
  }

  function openInventory(from: 'runMap' | 'party' | 'shop') {
    inventoryReturnScreenRef.current = from
    setScreen('inventory')
  }

  function handleInventoryBack() {
    setScreen(inventoryReturnScreenRef.current)
  }

  function handleUseInventoryItem(instanceId: string, targetCreatureId?: string) {
    if (!runCreature) return
    const result = useInventoryItem({
      instanceId,
      inventory: trainerInventory,
      starter: runCreature,
      recruits: partyRecruits,
      activeHelperId,
      targetCreatureId,
    })
    if (!result.ok) {
      setInventoryMessage(result.message)
      return
    }
    if (result.starter) {
      setRunCreature(result.starter)
      runCreatureRef.current = result.starter
    }
    if (result.recruits) {
      setPartyRecruits(result.recruits)
      partyRecruitsRef.current = result.recruits
    }
    if (result.inventory) {
      setTrainerInventory(result.inventory)
    }
    setInventoryMessage(result.message)
  }

  function handleDropInventoryItem(instanceId: string) {
    setTrainerInventory((prev) =>
      removeInventoryItemByInstanceId(prev, instanceId, 1),
    )
    setInventoryMessage('Item dropped.')
  }

  function handleRestChoice(type: 'rest' | 'train') {
    if (!runCreature || restChoiceMade) return

    if (type === 'rest') {
      const healAmount = (max: number, current: number) =>
        Math.min(max, current + Math.floor(max * 0.4))
      setRunCreature({
        ...runCreature,
        currentHp: healAmount(runCreature.maxHp, runCreature.currentHp),
      })
      setPartyRecruits((prev) =>
        prev.map((r) => ({
          ...r,
          currentHp: healAmount(r.maxHp, r.currentHp),
        })),
      )
    } else {
      setRunCreature(addXp(runCreature, 10).creature)
    }

    setRestChoiceMade(true)
  }

  function handleRestContinue() {
    if (!activeNodeId) return
    markNodeComplete(activeNodeId)
    setRestChoiceMade(false)
    setScreen('runMap')
  }

  async function refreshMyPvpChallenge() {
    const result = await fetchMyActivePvpChallenge()
    if (result.ok && result.challenge) {
      setMyPvpChallenge(result.challenge)
    } else {
      setMyPvpChallenge(null)
    }
  }

  function openFriendBattle(from: 'title' | 'runMap' = 'title') {
    pvpReturnScreenRef.current = from
    setPvpMessage(null)
    setPvpResultMessage(null)
    setPvpLookupChallenge(null)
    void refreshMyPvpChallenge()
    setScreen('pvp')
  }

  function openRecoveryStation() {
    if (!runCreature) return
    setRecoveryLogMessage(null)
    setRequestBoardMessage(null)
    setForgeMessage(null)
    const fainted = getFaintedMembers(runCreature, partyRecruits)
    setSelectedReviveTarget(fainted[0]?.ref ?? null)
    const ctx = buildRequestQuestCtx()
    if (ctx) {
      setRequestQuestState((prev) => {
        const next = ensureAvailableRequestQuests(prev, ctx)
        if (next.availableRequests.length !== prev.availableRequests.length) {
          persistRequestQuestProgress(next)
        }
        return next
      })
    }
    advanceTutorialTo('recoveryStation')
    setScreen('recoveryStation')
  }

  function handleRecoveryBack() {
    maybeAdvanceTutorial('recoveryStation', 'monolithArchive')
    setScreen('runMap')
  }

  function handleRecoveryHealParty() {
    if (!runCreature) return
    if (isPartyFullyHealthy(runCreature, partyRecruits)) {
      setRecoveryLogMessage('Your party is already healthy.')
      return
    }
    if (!hasHealableNonFainted(runCreature, partyRecruits)) {
      setRecoveryLogMessage('No living creatures need healing. Try revive or full recovery.')
      return
    }
    const cost = healEntirePartyCost(partyRecruits)
    if (runCreature.coins < cost) {
      setRecoveryLogMessage('Not enough coins.')
      return
    }
    const healed = healNonFaintedParty(runCreature, partyRecruits)
    const nextStarter = spendCoins(healed.starter, cost)
    setRunCreature(nextStarter)
    setPartyRecruits(healed.recruits)
    runCreatureRef.current = nextStarter
    partyRecruitsRef.current = healed.recruits
    setRecoveryLogMessage(`Your party was healed for ${cost} coins.`)
    dispatchQuestEvent('recoveryUsed', {})
    dispatchRetentionEvent('recoveryUsed')
    dispatchRetentionEvent('recoveryUsed')
    void persistRun()
  }

  function handleRecoveryReviveSelected() {
    if (!runCreature || !selectedReviveTarget) return
    const fainted = getFaintedMembers(runCreature, partyRecruits)
    const targetStillFainted = fainted.some(
      (m) =>
        (m.ref.kind === 'starter' && selectedReviveTarget.kind === 'starter') ||
        (m.ref.kind === 'recruit' &&
          selectedReviveTarget.kind === 'recruit' &&
          m.ref.id === selectedReviveTarget.id),
    )
    if (!targetStillFainted) {
      setRecoveryLogMessage('Select a fainted creature to revive.')
      return
    }
    if (runCreature.coins < REVIVE_FAINTED_COST) {
      setRecoveryLogMessage('Not enough coins.')
      return
    }
    const revived = revivePartyMember(
      runCreature,
      partyRecruits,
      selectedReviveTarget,
    )
    const nextStarter = spendCoins(revived.starter, REVIVE_FAINTED_COST)
    const revivedName =
      selectedReviveTarget.kind === 'starter'
        ? nextStarter.name
        : revived.recruits.find((r) => r.id === selectedReviveTarget.id)?.name ??
          'Creature'
    setRunCreature(nextStarter)
    setPartyRecruits(revived.recruits)
    runCreatureRef.current = nextStarter
    partyRecruitsRef.current = revived.recruits
    setRecoveryLogMessage(`${revivedName} was revived for ${REVIVE_FAINTED_COST} coins.`)
    dispatchQuestEvent('recoveryUsed', {})
    dispatchRetentionEvent('recoveryUsed')
    void persistRun()
  }

  function handleRecoveryFullRecovery() {
    if (!runCreature) return
    if (isPartyFullyHealthy(runCreature, partyRecruits)) {
      setRecoveryLogMessage('Your party is already healthy.')
      return
    }
    const cost = fullRecoveryCost(partyRecruits)
    if (runCreature.coins < cost) {
      setRecoveryLogMessage('Not enough coins.')
      return
    }
    const recovered = fullPartyRecovery(runCreature, partyRecruits)
    const nextStarter = spendCoins(recovered.starter, cost)
    setRunCreature(nextStarter)
    setPartyRecruits(recovered.recruits)
    runCreatureRef.current = nextStarter
    partyRecruitsRef.current = recovered.recruits
    setRecoveryLogMessage(`Full recovery complete for ${cost} coins.`)
    dispatchQuestEvent('recoveryUsed', {})
    dispatchRetentionEvent('recoveryUsed')
    void persistRun()
  }

  async function handleGenerateFriendCode() {
    if (!runCreature) {
      setPvpMessage('Continue a run to generate a friend code.')
      return
    }
    setPvpBusy(true)
    setPvpMessage(null)
    const result = await createPvpChallenge({
      starter: runCreature,
      recruits: partyRecruits,
      activeHelperId,
      regionId: currentRegionId,
      badgesCount: earnedBadges.length,
    })
    setPvpBusy(false)
    if (!result.ok || !result.challenge) {
      setPvpMessage(result.error ?? 'Could not generate friend code.')
      return
    }
    setMyPvpChallenge(result.challenge)
    setPvpMessage(`Friend code ${result.challenge.code} created. Share it with a friend!`)
  }

  async function handleFindFriendChallenge() {
    setPvpBusy(true)
    setPvpMessage(null)
    setPvpLookupChallenge(null)
    const result = await fetchPvpChallengeByCode(pvpLookupCode)
    setPvpBusy(false)
    if (!result.ok || !result.challenge) {
      setPvpMessage(result.error ?? 'Friend code not found.')
      return
    }
    setPvpLookupChallenge(result.challenge)
    setPvpMessage(null)
  }

  function startPvpChallenge(challenge: PvpChallenge) {
    if (!runCreature) return
    prePvpPartyRef.current = {
      starter: structuredClone(runCreature),
      recruits: structuredClone(partyRecruits),
      activeHelperId,
    }
    pvpOpponentNameRef.current = challenge.creator_display_name
    setPvpOpponentName(challenge.creator_display_name)
    pvpGauntletRef.current = buildGauntletEnemies(challenge.team_snapshot)
    pvpGauntletIndexRef.current = 0

    setRunMode('pvp')
    runModeRef.current = 'pvp'
    setActiveNodeId(null)
    setCurrentNode(null)
    setLastCombatNode(null)
    setActiveEncounterKind('gymTrainer')
    setCombatContextBoth({
      source: 'pvp',
      encounterType: 'pvp',
    })
    const firstEnemy = pvpGauntletRef.current[0]
    if (!firstEnemy) return
    setEnemy(firstEnemy)
    resetCombatSession()
    setPendingAbilityUpgradeQueue([])
    setCombatPhase('starter')
    preCombatMasteryRef.current = {
      starter: structuredClone(runCreature.abilityMastery),
      recruits: Object.fromEntries(
        partyRecruits.map((r) => [r.id, structuredClone(r.abilityMastery)]),
      ),
    }
    setBattleLog([
      `Friend Battle vs ${challenge.creator_display_name}!`,
      `${firstEnemy.name} enters the battle!`,
    ])
    setCombatLocked(false)
    setScreen('combat')
  }

  function handlePvpVictory() {
    const nextIndex = pvpGauntletIndexRef.current + 1
    if (nextIndex < pvpGauntletRef.current.length) {
      pvpGauntletIndexRef.current = nextIndex
      const nextEnemy = pvpGauntletRef.current[nextIndex]
      combatEndedRef.current = false
      setCombatLocked(false)
      setEnemy(nextEnemy)
      setCombatPhase('starter')
      setBattleLog([`${nextEnemy.name} enters the battle!`])
      return
    }

    let nextStarter = runCreatureRef.current ?? runCreature
    if (nextStarter) {
      nextStarter = addCoins(nextStarter, 20)
      setRunCreature(nextStarter)
      runCreatureRef.current = nextStarter
    }

    setRunMode('normal')
    runModeRef.current = 'normal'
    pvpGauntletRef.current = []
    prePvpPartyRef.current = null
    setEnemy(null)
    setBattleLog([])
    setPvpResultDetail('You cleared the friend team gauntlet.')
    setPvpResultCoins(20)
    setPvpResultMessage('Friend Battle victory!')
    setScreen('pvpVictory')
    dispatchRetentionEvent('pvpWon')
    void persistRun()
  }

  function finishPvpDefeat() {
    const pre = prePvpPartyRef.current
    if (pre) {
      setRunCreature(pre.starter)
      setPartyRecruits(pre.recruits)
      setActiveHelperId(pre.activeHelperId)
      runCreatureRef.current = pre.starter
      partyRecruitsRef.current = pre.recruits
    }
    setRunMode('normal')
    runModeRef.current = 'normal'
    pvpGauntletRef.current = []
    prePvpPartyRef.current = null
    setEnemy(null)
    setBattleLog([])
    setPvpResultDetail('Your party was restored to pre-battle condition.')
    setPvpResultCoins(0)
    setPvpResultMessage(null)
    setScreen('pvpDefeat')
  }

  function handlePvpContinue() {
    setPvpResultMessage(null)
    if (pvpReturnScreenRef.current === 'runMap' && runCreature) {
      setScreen('runMap')
      return
    }
    openFriendBattle(pvpReturnScreenRef.current)
  }

  function handleCopyFriendCode(code: string) {
    void navigator.clipboard.writeText(code)
  }

  function handleEventChoice(choice: EventChoiceId) {
    if (!runCreature || !currentEvent || !activeNodeId) return

    stopBgm()
    playSfx('game_reward')

    const recruitCountBefore = partyRecruits.length
    const result = applyEventChoice(currentEvent.id, choice, {
      starter: runCreature,
      recruits: partyRecruits,
      earnedBadges,
      regionId: currentRegionId,
    })

    runCreatureRef.current = result.starter
    partyRecruitsRef.current = result.recruits
    setRunCreature(result.starter)
    setPartyRecruits(result.recruits)
    setEarnedBadges(result.earnedBadges)

    if (result.inventoryAdds?.length) {
      setTrainerInventory((prev) => {
        let next = prev
        for (const add of result.inventoryAdds!) {
          next = addItemToTrainerInventory(next, add.itemId, add.quantity ?? 1)
        }
        return next
      })
      for (const add of result.inventoryAdds) {
        dispatchRetentionEvent('itemCollected', { itemId: add.itemId })
      }
    }

    if (result.gearAdds?.length) {
      setTrainerInventory((prev) => {
        let next = prev
        for (const gearId of result.gearAdds!) {
          next = addGearIdToTrainerInventory(next, gearId)
        }
        return next
      })
      for (const gearId of result.gearAdds) {
        dispatchRetentionEvent('gearCollected', { gearId })
      }
    }

    if (result.titleGrant) {
      setRetentionState((prev) => {
        if (prev.titles.includes(result.titleGrant!)) return prev
        return {
          ...prev,
          titles: [...prev.titles, result.titleGrant!],
          collectionLog: {
            ...prev.collectionLog,
            titles: [...prev.collectionLog.titles, result.titleGrant!],
          },
        }
      })
    }

    if (result.recruits.length > recruitCountBefore) {
      const newest = result.recruits[result.recruits.length - 1]
      if (newest) {
        dispatchQuestEvent('creatureRecruited', {})
        dispatchRetentionEvent('creatureRecruited', {
          templateId: newest.templateId,
          regionId: currentRegionId,
        })
      }
    }

    setMapMessage(result.message ?? formatEventRewardMessage(result.rewardLines))

    if (result.pendingAlphaCombat) {
      const eventNodeId = activeNodeId
      const eventNode = currentNode
      const alphaCtx = createEventAlphaCombatContext({
        eventId: currentEvent.id,
        eventChoiceId: choice,
        nodeId: eventNodeId ?? undefined,
        mapNode: eventNode,
      })
      setCurrentEvent(null)
      startBonusAlphaCombat(alphaCtx)
      void persistRun()
      return
    }

    dispatchQuestEvent('eventCompleted', {})
    dispatchRetentionEvent('eventCompleted')
    markNodeComplete(activeNodeId)
    setCurrentEvent(null)
    setScreen('runMap')
    void persistRun()
  }

  if (!authReady) {
    return (
      <div className="app">
        <main className="title-screen">
          <p className="title-screen__subtitle">Loading…</p>
        </main>
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <div className="app">
        <LoginScreen
          loading={authBusy}
          onBack={() => setScreen('title')}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (screen === 'register') {
    return (
      <div className="app">
        <RegisterScreen
          loading={authBusy}
          onBack={() => setScreen('title')}
          onRegister={handleRegister}
        />
      </div>
    )
  }

  if (screen === 'account' && authUser) {
    const cloudInUse =
      Number(!cloudSlots[1].isEmpty) + Number(!cloudSlots[2].isEmpty)
    return (
      <div className="app">
        <AccountScreen
          email={authUser.email ?? 'Signed in'}
          displayName={playerProfile?.display_name}
          cloudConfigured={isSupabaseConfigured()}
          cloudSlotCount={cloudInUse}
          loggingOut={authBusy}
          usernameBusy={profileBusy}
          usernameError={accountUsernameError}
          onChangeUsername={handleAccountChangeUsername}
          onBack={() => setScreen('title')}
          onLogout={() => void handleLogout()}
        />
      </div>
    )
  }

  if (screen === 'profileSetup') {
    const returnScreen = profileReturnRef.current.screen
    return (
      <div className="app">
        <ProfileSetupScreen
          loading={profileBusy}
          setupError={profileSetupError}
          onBack={() =>
            setScreen(
              returnScreen === 'profileSetup' ? 'title' : returnScreen,
            )
          }
          onSubmit={handleProfileSetupSubmit}
        />
      </div>
    )
  }

  if (screen === 'dailyRun') {
    const region = getRegion(getDailyRunRegionId())
    const day = getDailyRunDayStateForToday(dailySeed, dailyModifier.id)
    const hasActiveAttempt = hasDailyRunInProgress()
    return (
      <div className="app">
        <DailyRunScreen
          dailySeed={dailySeed}
          displayDate={formatDailyDisplayDate()}
          regionName={region.name}
          modifier={dailyModifier}
          loggedIn={Boolean(authUser)}
          hasProfile={Boolean(playerProfile)}
          hasActiveAttempt={hasActiveAttempt}
          hasDayRecord={hasDailyRunForToday()}
          currentAttemptScore={day.currentAttemptScore}
          bestScore={day.bestScore}
          currentCheckpointLabel={formatCheckpointLabel(day.currentCheckpoint)}
          bestCheckpointLabel={formatCheckpointLabel(day.bestCheckpoint)}
          totalAttempts={day.totalAttempts}
          deathsThisAttempt={day.currentAttemptDeaths}
          playerRank={dailyMenuRank}
          onStartAttempt={beginDailyAttempt}
          onContinueAttempt={continueDailyRunSaved}
          onRestartAttempt={restartDailyAttempt}
          onSubmitBest={() => void handleSubmitBestDailyScore(true)}
          onLeaderboard={() => openLeaderboard('dailyRun', 'daily')}
          onBack={goToTitle}
          submitBusy={submitBusy}
          submitMessage={dailyMenuSubmitMessage}
        />
      </div>
    )
  }

  if (screen === 'dailyDefeat') {
    return (
      <div className="app">
        <DailyDefeatScreen
          attemptScore={dailyDefeatAttemptScore}
          bestScore={dailyDefeatBestScore}
          bestCheckpointLabel={dailyDefeatBestCheckpoint}
          newBestSaved={dailyDefeatNewBest}
          onRestart={beginDailyAttempt}
          onLeaderboard={() => openLeaderboard('dailyRun', 'daily')}
          onMenu={() => {
            refreshDailyMenu()
            setScreen('dailyRun')
          }}
        />
      </div>
    )
  }

  if (screen === 'leaderboard') {
    return (
      <div className="app">
        <LeaderboardScreen
          seed={leaderboardSeed}
          displayDate={formatDailyDisplayDate()}
          rows={leaderboardRows}
          playerRank={getPlayerRank(
            leaderboardRows,
            authUser?.id,
            leaderboardTab === 'campaign'
              ? (activeSlotId ?? 1)
              : resolveDailyLeaderboardSlot(),
          )}
          loggedIn={Boolean(authUser)}
          loading={leaderboardLoading}
          errorMessage={leaderboardError}
          activeTab={leaderboardTab}
          onTabChange={handleLeaderboardTabChange}
          onBack={() => setScreen(leaderboardReturnScreenRef.current)}
        />
      </div>
    )
  }

  if (screen === 'runSummary' && runSummaryScore && runCreature) {
    return (
      <div className="app">
        <RunSummaryScreen
          dailySeed={dailySeed}
          score={runSummaryScore}
          starter={runCreature}
          recruits={partyRecruits}
          badgesEarned={earnedBadges.length}
          evolutionsCount={scoreTrackerRef.current.evolutionsReached}
          loggedIn={Boolean(authUser)}
          hasProfile={Boolean(playerProfile)}
          submitBusy={submitBusy}
          submitMessage={submitMessage}
          onSubmit={() => void handleSubmitDailyScore()}
          onLeaderboard={() => openLeaderboard('dailyRun', 'daily')}
          onMenu={goToTitle}
        />
      </div>
    )
  }

  if (screen === 'nameTrainer' && trainerNameFlow && (selectedCharSlot || activeSlotId)) {
    const nameSlotId = (selectedCharSlot ?? activeSlotId) as SaveSlotId
    const existingEnvelope = loadEnvelopeFromSlot(nameSlotId)
    return (
      <div className="app">
        <TrainerNameScreen
          slotId={nameSlotId}
          mode={trainerNameFlow === 'rename' ? 'rename' : 'newGame'}
          initialName={
            existingEnvelope?.saveName ?? existingEnvelope?.trainerName ?? ''
          }
          busy={trainerNameBusy}
          onConfirm={(name) => void handleTrainerNameConfirm(name)}
          onCancel={handleTrainerNameCancel}
        />
      </div>
    )
  }

  if (screen === 'characterSelect' && playMode) {
    const slots = playMode === 'cloud' ? cloudSlots : localSlots
    const hasLocalForUpload =
      !localSlots[1].isEmpty || !localSlots[2].isEmpty
    return (
      <div className="app">
        <CharacterSelectScreen
          mode={playMode}
          slots={slots}
          selectedSlotId={selectedCharSlot}
          onSelectSlot={(id) => setSelectedCharSlot(id)}
          onContinue={handleCharacterContinue}
          onRename={handleCharacterRename}
          onNewGame={handleCharacterNewGame}
          onDelete={handleCharacterDelete}
          onBack={goToTitle}
          showUploadLocal={playMode === 'cloud' && Boolean(authUser) && hasLocalForUpload}
          localSlotsForUpload={localSlots}
          onUploadLocal={(localSlot, cloudSlot) => void handleUploadLocal(localSlot, cloudSlot)}
          uploadBusy={uploadBusy}
          uploadMessage={uploadMessage}
          statusMessage={slotActionMessage}
        />
      </div>
    )
  }

  if (screen === 'encounterTransition' && encounterTransitionView) {
    return (
      <div className="app encounter-transition-screen">
        <EncounterTransitionOverlay
          view={encounterTransitionView}
          onComplete={applyPendingCombatStart}
        />
      </div>
    )
  }

  if (screen === 'settings') {
    const returnScreen = settingsReturnScreenRef.current
    return (
      <div className="app">
        <SettingsScreen
          tutorialCompleted={isTutorialCompletedForRun()}
          showTesterPanel={showTesterPanel}
          musicEnabled={musicEnabled}
          fastEncounter={fastEncounter}
          onResetTutorial={handleResetTutorial}
          onToggleTesterPanel={(enabled) => {
            setShowTesterPanel(enabled)
            setTesterPanelEnabled(enabled)
          }}
          onToggleMusic={(enabled) => {
            setMusicEnabled(enabled)
            setMusicEnabledState(enabled)
            if (!enabled) stopBgm()
            else {
              const track = bgmTrackForScreen(screen)
              if (track) playBgm(track)
            }
          }}
          onToggleFastEncounter={(enabled) => {
            setFastEncounterEnabled(enabled)
            setFastEncounterState(enabled)
          }}
          onOpenFeedback={() => setFeedbackOpen(true)}
          onBack={() =>
            setScreen(returnScreen === 'settings' ? 'title' : returnScreen)
          }
        />
        {renderFeedbackModal()}
        {renderTesterPanel()}
      </div>
    )
  }

  if (screen === 'starterSelect') {
    return (
      <div className="app">
        <StarterSelectScreen
          pendingStarterId={pendingStarterId}
          onSelect={setPendingStarterId}
          onConfirm={confirmStarter}
          onBack={() => {
            resetRunMemory()
            if (runModeRef.current === 'daily') setScreen('dailyRun')
            else if (playMode) setScreen('characterSelect')
            else goToTitle()
          }}
        />
        {renderTutorialOverlay()}
      </div>
    )
  }

  if (
    screen === 'shop' &&
    runCreature &&
    (currentNode?.type === 'shop' || currentNode?.type === 'relicShop')
  ) {
    return (
      <div className="app">
        <ShopScreen
          creature={runCreature}
          recruits={partyRecruits}
          inventory={trainerInventory}
          shopInventory={
            activeShopInventory ??
            shopInventoriesByNodeId[activeNodeId ?? ''] ?? {
              gearIds: [],
              itemIds: [],
              shopType: 'normal',
            }
          }
          shopLog={shopLog}
          onBuyItem={handleBuyShopItem}
          onBuyGear={handleBuyGear}
          onOpenInventory={() => openInventory('shop')}
          onLeave={handleLeaveShop}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'rest' && runCreature && currentNode?.type === 'rest') {
    return (
      <div className="app">
        <RestScreen
          creature={runCreature}
          choiceMade={restChoiceMade}
          onRest={() => handleRestChoice('rest')}
          onTrain={() => handleRestChoice('train')}
          onContinue={handleRestContinue}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'event' && runCreature && currentEvent && currentNode?.type === 'event') {
    return (
      <div className="app">
        <EventScreen event={currentEvent} onChoose={handleEventChoice} />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'monolithCouncil' && runCreature) {
    const council = getCouncilForRegion(currentRegionId)
    if (!council || council.trials.length === 0) {
      return (
        <div className="app">
          <main className="monolith-council-screen">
            <header className="screen-header">
              <h1 className="screen-header__title">Monolith Council</h1>
            </header>
            <p className="monolith-council-warning" role="status">
              This region&apos;s Monolith Council is not available yet.
            </p>
            <footer className="monolith-council-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setScreen('runMap')}
              >
                Back to Map
              </button>
            </footer>
          </main>
          {renderGlobalToasts()}
        </div>
      )
    }
    return (
      <div className="app">
        <MonolithCouncilScreen
          council={council}
          earnedBadges={earnedBadges}
          creature={runCreature}
          recruits={partyRecruits}
          activeHelperId={activeHelperId}
          gauntletProgress={monolithCouncilState.activeGauntlet}
          onStart={() => {
            const progress =
              monolithCouncilState.activeGauntlet ??
              startGauntletProgress(currentRegionId, council.councilId)
            setMonolithCouncilState((s) => ({ ...s, activeGauntlet: progress }))
            beginCouncilTrialFight(progress.trialIndex)
          }}
          onBack={() => setScreen('runMap')}
          onOpenParty={() => setScreen('party')}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'councilIntermission' && runCreature) {
    const council = getCouncilDefinitionOrThrow(currentRegionId)
    const progress = monolithCouncilState.activeGauntlet
    const trialIndex = Math.max(0, (progress?.fightsWon ?? 1) - 1)
    const trial = council.trials[trialIndex] ?? council.trials[0]!
    return (
      <div className="app">
        <CouncilIntermissionScreen
          trial={trial}
          fightNumber={progress?.fightsWon ?? 1}
          totalFights={council.trials.length}
          creature={runCreature}
          onContinue={() => {
            if (!progress) {
              setScreen('runMap')
              return
            }
            if (isGauntletComplete(council, progress)) {
              finishCouncilGauntlet(council)
              return
            }
            beginCouncilTrialFight(progress.trialIndex)
          }}
          onFullHeal={() => {
            if (runCreature.coins < COUNCIL_FULL_HEAL_COST) return
            const paid = addCoins(runCreature, -COUNCIL_FULL_HEAL_COST)
            const healed = applyCouncilFullRecovery(paid, partyRecruits)
            runCreatureRef.current = healed.starter
            partyRecruitsRef.current = healed.recruits
            setRunCreature(healed.starter)
            setPartyRecruits(healed.recruits)
            void persistRun()
          }}
          canAffordFullHeal={runCreature.coins >= COUNCIL_FULL_HEAL_COST}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'combat' && runCreature && enemy) {
    const combatants = buildCombatants()
    const playerTurn = getPlayerTurnView(runCreature, partyRecruits, combatPhase)
    const isCouncilFight = combatContextRef.current?.source === 'monolithCouncil'
    const councilAllDown =
      isCouncilFight && allCouncilEnemiesDefeated(councilEnemiesRef.current)
    const combatEnded =
      combatEndedRef.current ||
      councilAllDown ||
      (!isCouncilFight && enemy.currentHp <= 0)
    const council = isCouncilFight ? getCouncilForRegion(currentRegionId) : null
    const session = councilSessionRef.current

    return (
      <div className="app">
        <CombatScreen
          combatants={combatants}
          enemy={enemy}
          secondaryEnemy={secondaryEnemy}
          councilBattleLabel={
            council && session ? councilBattleLabel(council, session) : null
          }
          allEnemiesDefeated={isCouncilFight ? councilAllDown : false}
          councilTargetIndex={
            isCouncilFight
              ? getDefaultLivingCouncilTargetIndex(councilEnemiesRef.current)
              : undefined
          }
          battleLog={battleLog}
          combatLocked={combatLocked}
          combatPhase={combatPhase}
          combatEnded={combatEnded}
          turnHint={playerTurn.hint}
          activeCombatantKey={playerTurn.activeKey}
          earnedBadges={earnedBadges}
          partyHighestLevel={getPartyHighestLevel(runCreature, partyRecruits)}
          enemyStatStages={enemyStatStagesRef.current}
          playerStatStages={playerStatStagesRef.current}
          fleeDisabled={runModeRef.current === 'pvp'}
          locationLabel={`${getRegionDisplayName(currentRegionId)}${
            lastCombatNode ? ` — ${lastCombatNode.label}` : ''
          }`}
          encounterKind={activeEncounterKind}
          enemyAbilityVfxId={enemyAbilityVfx?.vfxId ?? null}
          enemyAbilityVfxKey={enemyAbilityVfx?.playKey ?? 0}
          onEnemyAbilityVfxComplete={() => setEnemyAbilityVfx(null)}
          onUseAbility={handlePlayerAbility}
          onFlee={handleFleeClick}
        />
        {fleeConfirmOpen && (
          <div className="combat-flee-modal" role="dialog" aria-modal="true">
            <div className="combat-flee-modal__dialog">
              <p>
                Flee from battle? You will receive no rewards and this node will not be
                completed.
              </p>
              <div className="combat-flee-modal__actions">
                <button type="button" className="btn" onClick={handleFleeCancel}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleFleeConfirmed}
                >
                  Flee
                </button>
              </div>
            </div>
          </div>
        )}
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'recruitment' && pendingRecruit && runCreature) {
    return (
      <div className="app">
        <RecruitmentScreen
          recruit={pendingRecruit}
          partyFull={partyRecruits.length >= MAX_RECRUITS}
          starter={runCreature}
          recruits={partyRecruits}
          onAccept={handleAcceptRecruit}
          onDecline={handleDeclineRecruit}
          onReplace={handleReplaceRecruit}
        />
      </div>
    )
  }

  if (screen === 'defeat' && defeatInfo && runCreature) {
    return (
      <div className="app">
        <DefeatScreen
          defeat={defeatInfo}
          onBeginNewRoute={handleBeginNewRoute}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'reward' && rewardInfo && runCreature) {
    return (
      <div className="app">
        <RewardScreen reward={rewardInfo} onContinue={handleRewardContinue} />
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'perkDraft' && runCreature && draftOptions.length > 0) {
    const draftCreature = draftingCreatureId
      ? getCreatureForDraft(draftingCreatureId)
      : runCreature
    if (!draftCreature) return null
    const dominant = getDominantEvolutionCategory(
      draftCreature.evolutionScores,
      draftCreature.type,
    )
    return (
      <div className="app">
        <PerkDraftScreen
          creatureName={draftCreature.name}
          creatureType={draftCreature.type}
          level={draftCreature.level}
          currentHp={draftCreature.currentHp}
          maxHp={draftCreature.maxHp}
          evolutionStage={draftCreature.evolutionStage}
          dominantCategory={dominant.category}
          dominantReason={dominant.reason}
          evolutionScores={draftCreature.evolutionScores}
          selectedPerkIds={draftCreature.selectedPerks}
          perks={draftOptions}
          onChoose={handlePerkChosen}
        />
        {renderTutorialOverlay()}
      </div>
    )
  }

  if (screen === 'moveLearn' && runCreature && moveLearnContext) {
    const creature = getCreatureById(moveLearnContext.creatureId)
    if (creature) {
      return (
        <div className="app app--modal-overlay">
          <MoveLearnScreen
            creature={creature}
            newAbilityId={moveLearnContext.abilityId}
            earnedBadges={earnedBadges}
            partyHighestLevel={getPartyHighestLevel(runCreature, partyRecruits)}
            onLearn={handleMoveLearnConfirm}
            onSkip={handleMoveLearnSkip}
            onReplace={handleMoveLearnReplace}
          />
        </div>
      )
    }
  }

  if (screen === 'abilityTransform' && runCreature && activeTransformEntry) {
    const creatureName =
      activeTransformEntry.creatureId === STARTER_CREATURE_ID
        ? runCreature.name
        : (partyRecruits.find((r) => r.id === activeTransformEntry.creatureId)
            ?.name ?? 'Creature')
    return (
      <div className="app app--modal-overlay">
        <AbilityTransformScreen
          creatureName={creatureName}
          entry={activeTransformEntry}
          onConfirm={handleTransformConfirm}
        />
      </div>
    )
  }

  if (
    screen === 'abilityUpgrade' &&
    runCreature &&
    pendingAbilityUpgradeQueue.length > 0
  ) {
    const entry = pendingAbilityUpgradeQueue[0]
    const creatureName =
      entry.creatureId === STARTER_CREATURE_ID
        ? runCreature.name
        : (partyRecruits.find((r) => r.id === entry.creatureId)?.name ?? 'Creature')

    return (
      <div className="app app--modal-overlay">
        <AbilityUpgradeScreen
          creatureName={creatureName}
          entry={entry}
          onChoose={handleAbilityUpgradeChosen}
        />
      </div>
    )
  }

  if (screen === 'evolution' && evolutionScreenData) {
    return (
      <div className="app">
        <EvolutionScreen
          data={evolutionScreenData}
          onContinue={handleEvolutionContinue}
        />
      </div>
    )
  }

  if (screen === 'inventory' && runCreature) {
    return (
      <div className="app">
        <InventoryScreen
          inventory={trainerInventory}
          starter={runCreature}
          recruits={partyRecruits}
          onUseItem={handleUseInventoryItem}
          onEquipGear={handleEquipGear}
          onDropItem={handleDropInventoryItem}
          onBack={handleInventoryBack}
        />
        {inventoryMessage && (
          <p className="inventory-toast" role="status">
            {inventoryMessage}
          </p>
        )}
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
      </div>
    )
  }

  if (screen === 'party' && runCreature) {
    return (
      <div className="app">
        <PartyScreen
          starter={runCreature}
          recruits={partyRecruits}
          activeHelperId={activeHelperId}
          earnedBadges={earnedBadges}
          onSetHelper={handleSetPartyHelper}
          onDismissRecruit={handleDismissRecruit}
          onViewPerks={setPerksModalCreatureId}
          onEquipGear={setGearEquipCreatureId}
          onUnequipGear={handleUnequipGear}
          onOpenInventory={() => openInventory('party')}
          onBack={handlePartyBack}
        />
        {gearEquipCreatureId && (
          <GearEquipModal
            creatureName={
              gearEquipCreatureId === STARTER_CREATURE_ID
                ? runCreature.name
                : (partyRecruits.find((r) => r.id === gearEquipCreatureId)
                    ?.name ?? 'Creature')
            }
            gearEntries={trainerInventory.gear}
            onEquip={(instanceId) =>
              handleEquipGear(gearEquipCreatureId, instanceId)
            }
            onClose={() => setGearEquipCreatureId(null)}
          />
        )}
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
        {renderGlobalToasts()}
        {perksModalCreatureId && (
          <CreaturePerksModal
            creatureName={
              perksModalCreatureId === STARTER_CREATURE_ID
                ? runCreature.name
                : (partyRecruits.find((r) => r.id === perksModalCreatureId)
                    ?.name ?? 'Creature')
            }
            selectedPerks={getCreatureSelectedPerks(perksModalCreatureId)}
            onClose={() => setPerksModalCreatureId(null)}
          />
        )}
      </div>
    )
  }

  if (screen === 'regionComplete' && regionCompleteInfo && runCreature) {
    const allRegionsCleared = REGIONS.every((r) => completedRegionIds.includes(r.id))
    const regionCompleteNextLabel =
      runMode === 'daily' && allRegionsCleared
        ? 'Finish Daily Run'
        : 'Choose Next Region'
    return (
      <div className="app">
        <RegionCompleteScreen
          data={regionCompleteInfo}
          creature={runCreature}
          partyRecruits={partyRecruits}
          onChooseNextRegion={handleChooseNextRegion}
          nextActionLabel={regionCompleteNextLabel}
        />
      </div>
    )
  }

  if (screen === 'regionSelect' && runCreature) {
    return (
      <div className="app">
        <RegionSelectScreen
          regions={getAllTravelRegions()}
          partyHighestLevel={getPartyHighestLevel(runCreature, partyRecruits)}
          hintMessage={mapMessage}
          councilStatusBanner={getRegionSelectCouncilBanner(
            currentRegionId,
            earnedBadges,
            monolithCouncilState,
          )}
          onTravel={handleTravelToRegion}
        />
      </div>
    )
  }

  if (screen === 'recoveryStation' && runCreature) {
    return (
      <div className="app">
        <RecoveryStationScreen
          creature={runCreature}
          recruits={partyRecruits}
          partyMembers={listPartyMembers(runCreature, partyRecruits, activeHelperId)}
          requestQuestState={requestQuestState}
          requestQuestCtx={{
            starter: runCreature,
            recruits: partyRecruits,
            currentRegionId,
            earnedBadges,
          }}
          requestMessage={requestBoardMessage}
          canRefreshFree={
            requestQuestState.lastRefreshDate !== getTodayDateKey() ||
            !requestQuestState.freeRefreshUsedToday
          }
          logMessage={recoveryLogMessage}
          selectedReviveTarget={selectedReviveTarget}
          onSelectReviveTarget={setSelectedReviveTarget}
          onHealParty={handleRecoveryHealParty}
          onReviveSelected={handleRecoveryReviveSelected}
          onFullRecovery={handleRecoveryFullRecovery}
          onAcceptRequest={handleAcceptRequest}
          onRefreshRequests={handleRefreshRequests}
          onClaimRequest={handleClaimRequest}
          onAbandonRequest={handleAbandonRequest}
          trainerInventory={trainerInventory}
          forgeMessage={forgeMessage}
          onForgeCraft={handleForgeCraft}
          onForgeUpgradeInventory={handleForgeUpgradeInventory}
          onForgeUpgradeEquipped={handleForgeUpgradeEquipped}
          councilScoutUnlocked={monolithCouncilState.councilScoutUnlocked}
          monolithCouncilState={monolithCouncilState}
          currentRegionId={currentRegionId}
          earnedBadges={earnedBadges}
          completedRegionIds={completedRegionIds}
          onBack={handleRecoveryBack}
        />
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'pvp') {
    const hasActiveRun = Boolean(runCreature) && runMode === 'normal'
    return (
      <div className="app">
        <FriendBattleScreen
          loggedIn={Boolean(authUser)}
          hasActiveRun={hasActiveRun}
          myChallenge={myPvpChallenge}
          lookupChallenge={pvpLookupChallenge}
          lookupCode={pvpLookupCode}
          onLookupCodeChange={setPvpLookupCode}
          onGenerateCode={() => void handleGenerateFriendCode()}
          onFindChallenge={() => void handleFindFriendChallenge()}
          onChallengeTeam={() => {
            if (pvpLookupChallenge) startPvpChallenge(pvpLookupChallenge)
          }}
          onCopyCode={handleCopyFriendCode}
          busy={pvpBusy}
          message={pvpMessage}
          resultMessage={pvpResultMessage}
          onBack={() => {
            if (pvpReturnScreenRef.current === 'runMap' && runCreature) {
              setScreen('runMap')
            } else {
              setScreen('title')
            }
          }}
        />
      </div>
    )
  }

  if (screen === 'monolithArchive') {
    const questCtx = runCreature
      ? getScaledQuestContext(runCreature, partyRecruits, currentRegionId)
      : { partyLevel: 1, regionId: DEFAULT_REGION_ID }
    return (
      <div className="app">
        <MonolithArchiveScreen
          state={retentionState}
          partyLevel={questCtx.partyLevel}
          regionId={questCtx.regionId}
          onBack={() =>
            setScreen(runCreature && selectedStarter ? 'runMap' : 'title')
          }
          onStateChange={handleRetentionStateChange}
          onApplyRewardMessage={(msg) => {
            setArchiveMessage(msg)
            if (runCreature) setMapMessage(msg)
          }}
        />
        {archiveMessage && (
          <p className="archive-flash" style={{ textAlign: 'center' }}>
            {archiveMessage}
          </p>
        )}
        {renderGlobalToasts()}
      </div>
    )
  }

  if (screen === 'pvpVictory') {
    return (
      <div className="app">
        <PvpResultScreen
          victory
          opponentName={pvpOpponentName}
          coinsEarned={pvpResultCoins}
          detail={pvpResultDetail}
          onContinue={handlePvpContinue}
        />
      </div>
    )
  }

  if (screen === 'pvpDefeat') {
    return (
      <div className="app">
        <PvpResultScreen
          victory={false}
          opponentName={pvpOpponentName}
          coinsEarned={0}
          detail={pvpResultDetail}
          onContinue={handlePvpContinue}
        />
      </div>
    )
  }

  if (screen === 'patchNotes') {
    return (
      <div className="app">
        <PatchNotesScreen
          onBack={() => setScreen(patchNotesReturnScreenRef.current)}
        />
      </div>
    )
  }

  if (screen === 'runMap' && selectedStarter && runCreature && mapNodes.length > 0) {
    const recoveryRequestReady = hasClaimableRequestQuests(requestQuestState)
    const showCouncilHudAccess = canShowCouncilMapHudAccess(
      currentRegionId,
      earnedBadges,
      monolithCouncilState,
    )
    const currentObjective = computeCurrentObjective({
      mapNodes,
      nodeStates,
      runCreature,
      partyRecruits,
      currentRegionId,
      questState,
      requestQuestState,
      pendingBossVictory,
      pendingPostBattleCount: pendingPostBattleQueue.length,
      hasArchiveNotification: hasRetentionNotifications(retentionState),
      runMode,
      earnedBadges,
      monolithCouncilState,
    })
    return (
      <div className="app">
        <RunMapScreen
          creature={runCreature}
          mapNodes={mapNodes}
          nodeStates={nodeStates}
          earnedBadges={earnedBadges}
          partySize={1 + partyRecruits.length}
          activeHelperId={activeHelperId}
          partyRecruits={partyRecruits}
          currentRegionId={currentRegionId}
          mapMessage={mapMessage}
          nodeClickDebug={nodeClickDebug}
          saveStatus={saveStatus}
          saveWarning={saveWarning}
          onNodeClick={handleMapNodeClick}
          onOpenParty={handleOpenParty}
          onOpenInventory={() => openInventory('runMap')}
          onBadgeClick={setSelectedBadgeId}
          onBackToTitle={goToTitle}
          onOpenRecoveryStation={openRecoveryStation}
          recoveryRequestReady={recoveryRequestReady}
          onLeaveArea={handleLeaveArea}
          onOpenFriendBattle={() => openFriendBattle('runMap')}
          onOpenFeedback={() => setFeedbackOpen(true)}
          onOpenLeaderboard={() =>
            openLeaderboard('runMap', runMode === 'daily' ? 'daily' : 'campaign')
          }
          showCouncilHudAccess={showCouncilHudAccess}
          onOpenMonolithCouncil={handleOpenMonolithCouncil}
          councilMapFocusNodeId={councilMapFocusNodeId}
          currentObjective={currentObjective}
          showTesterPanel={showTesterPanel}
          onToggleTesterPanel={() => {
            const next = !showTesterPanel
            setShowTesterPanel(next)
            setTesterPanelEnabled(next)
          }}
        />
        {selectedBadgeId && (
          <BadgeDetailModal
            badgeId={selectedBadgeId}
            onClose={() => setSelectedBadgeId(null)}
          />
        )}
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
        {renderTesterPanel()}
        {renderGlobalToasts()}
      </div>
    )
  }

  return (
    <div className="app">
      <TitleScreen
        loggedIn={Boolean(authUser)}
        cloudConfigured={isSupabaseConfigured()}
        displayName={playerProfile?.display_name}
        hasArchiveNotification={hasRetentionNotifications(retentionState)}
        dailyRunBadge={
          hasDailyRunInProgress()
            ? 'continue'
            : !hasDailyRunForToday()
              ? 'daily'
              : undefined
        }
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
        onPlay={() => openCharacterSelect('cloud')}
        onDailyRun={openDailyRunMenu}
        onFriendBattle={() => openFriendBattle('title')}
        onMonolithArchive={openMonolithArchive}
        onAccount={() => setScreen('account')}
        onLogout={() => void handleLogout()}
        onPlayOffline={() => openCharacterSelect('offline')}
        onSettings={() => {
          settingsReturnScreenRef.current = 'title'
          setScreen('settings')
        }}
        onFeedback={() => setFeedbackOpen(true)}
        onLeaderboard={() => openLeaderboard('title', 'daily')}
        onPatchNotes={() => {
          patchNotesReturnScreenRef.current = 'title'
          setScreen('patchNotes')
        }}
      />
      {renderGlobalToasts()}
      {renderFeedbackModal()}
      {renderTesterPanel()}
    </div>
  )
}

function saveStatusLabel(status: SaveStatusKind, warning: string | null): string {
  switch (status) {
    case 'saving':
      return 'Saving…'
    case 'cloud':
      return 'Cloud Saved'
    case 'local':
      return 'Local Saved'
    case 'failed':
      return 'Save Failed'
    case 'warning':
      return warning ?? 'Cloud save failed. Local backup saved.'
    default:
      return ''
  }
}

function TitleScreen({
  loggedIn,
  cloudConfigured,
  displayName,
  hasArchiveNotification,
  dailyRunBadge,
  onLogin,
  onRegister,
  onPlay,
  onDailyRun,
  onFriendBattle,
  onMonolithArchive,
  onAccount,
  onLogout,
  onPlayOffline,
  onSettings,
  onFeedback,
  onLeaderboard,
  onPatchNotes,
}: {
  loggedIn: boolean
  cloudConfigured: boolean
  displayName?: string
  hasArchiveNotification?: boolean
  dailyRunBadge?: 'daily' | 'continue'
  onLogin: () => void
  onRegister: () => void
  onPlay: () => void
  onDailyRun: () => void
  onFriendBattle: () => void
  onMonolithArchive: () => void
  onAccount: () => void
  onLogout: () => void
  onPlayOffline: () => void
  onSettings: () => void
  onFeedback: () => void
  onLeaderboard: () => void
  onPatchNotes: () => void
}) {
  return (
    <main className="main-menu-screen title-screen">
      <div className="main-menu-screen__bg" aria-hidden="true" />
      <div className="main-menu-screen__overlay" aria-hidden="true" />

      <div className="main-menu-layout">
        <MainMenuHeader />

        <div className="main-menu-panel">
          <nav className="main-menu-nav main-menu-nav--art" aria-label="Main menu">
            <div className="main-menu-zone main-menu-zone--hero" aria-label="Play">
              <MainMenuButton
                label="Daily Run"
                iconSrc={MAIN_MENU_ICONS.dailyRun}
                labelSrc={MAIN_MENU_TEXT.dailyRun}
                labelStyle="daily-run"
                onClick={onDailyRun}
                variant="primary"
                badge={dailyRunBadge}
              />
              {loggedIn ? (
                <MainMenuButton
                  label="Play"
                  iconSrc={MAIN_MENU_ICONS.play}
                  labelSrc={MAIN_MENU_TEXT.play}
                  labelStyle="play"
                  onClick={onPlay}
                  variant="primary-secondary"
                />
              ) : (
                <MainMenuButton
                  label="Play Offline"
                  iconSrc={MAIN_MENU_ICONS.offline}
                  labelSrc={MAIN_MENU_TEXT.offline}
                  labelStyle="offline"
                  onClick={onPlayOffline}
                  variant="primary-secondary"
                />
              )}
            </div>

            <div className="main-menu-zone main-menu-zone--duo" aria-label="Progression">
              <MainMenuButton
                label="Monolith Archive"
                iconSrc={MAIN_MENU_ICONS.monolithArchive}
                labelSrc={MAIN_MENU_TEXT.monolithArchive}
                labelStyle="archive"
                onClick={onMonolithArchive}
                badge={hasArchiveNotification ? 'notification' : undefined}
              />
              <MainMenuButton
                label="Leaderboard"
                iconSrc={MAIN_MENU_ICONS.leaderboard}
                labelSrc={MAIN_MENU_TEXT.leaderboard}
                labelStyle="leaderboard"
                onClick={onLeaderboard}
              />
            </div>

            <div className="main-menu-zone main-menu-zone--solo" aria-label="Social">
              <MainMenuButton
                label="Friendly Battle"
                iconSrc={MAIN_MENU_ICONS.friendlyBattle}
                labelSrc={MAIN_MENU_TEXT.friendlyBattle}
                labelStyle="friendly-battle"
                onClick={onFriendBattle}
              />
            </div>

            {!loggedIn ? (
              <div className="main-menu-zone main-menu-zone--duo" aria-label="Account">
                <MainMenuButton
                  label="Login"
                  iconSrc={MAIN_MENU_ICONS.login}
                  labelSrc={MAIN_MENU_TEXT.login}
                  labelStyle="login"
                  onClick={onLogin}
                  disabled={!cloudConfigured}
                  title={
                    cloudConfigured
                      ? undefined
                      : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
                  }
                />
                <MainMenuButton
                  label="Register"
                  iconSrc={MAIN_MENU_ICONS.register}
                  labelSrc={MAIN_MENU_TEXT.register}
                  labelStyle="register"
                  onClick={onRegister}
                  disabled={!cloudConfigured}
                />
              </div>
            ) : (
              <div className="main-menu-zone main-menu-zone--duo" aria-label="Session">
                <MainMenuButton
                  label="Account"
                  iconSrc={MAIN_MENU_ICONS.account}
                  labelSrc={MAIN_MENU_TEXT.account}
                  labelStyle="account"
                  onClick={onAccount}
                />
                <MainMenuButton
                  label="Logout"
                  iconSrc={MAIN_MENU_ICONS.logout}
                  labelSrc={MAIN_MENU_TEXT.logout}
                  labelStyle="logout"
                  onClick={onLogout}
                />
              </div>
            )}

            <div className="main-menu-zone main-menu-zone--utility" aria-label="Utility">
              <MainMenuButton
                label="Feedback"
                iconSrc={MAIN_MENU_ICONS.feedback}
                labelSrc={MAIN_MENU_TEXT.feedback}
                labelStyle="feedback"
                onClick={onFeedback}
                variant="utility"
              />
              <MainMenuButton
                label="Patch Notes"
                iconSrc={MAIN_MENU_ICONS.patchNotes}
                labelSrc={MAIN_MENU_TEXT.patchNotes}
                labelStyle="patch-notes"
                onClick={onPatchNotes}
                variant="utility"
              />
              <MainMenuButton
                label="Settings"
                iconSrc={MAIN_MENU_ICONS.settings}
                labelSrc={MAIN_MENU_TEXT.settings}
                labelStyle="settings"
                onClick={onSettings}
                variant="utility"
              />
            </div>
          </nav>
        </div>
      </div>

      {displayName && (
        <p className="title-screen__profile-name">
          Playing as <strong>{displayName}</strong>
        </p>
      )}

      <p className="app-version-label">{APP_VERSION_LABEL}</p>

      {!loggedIn && (
        <p className="title-screen__offline-note">
          Offline saves stay on this browser only.
        </p>
      )}

      <section className="title-screen__features" aria-labelledby="features-heading">
        <h2 id="features-heading" className="panel-label">
          How it works
        </h2>
        <p className="title-screen__features-text">
          Choose a starter. Battle through a branching node map. Draft perks. Evolve
          dynamically based on your choices.
        </p>
      </section>
    </main>
  )
}

function StarterSelectScreen({
  pendingStarterId,
  onSelect,
  onConfirm,
  onBack,
}: {
  pendingStarterId: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onBack: () => void
}) {
  return (
    <main className="starter-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Choose Your Starter</h1>
        <p className="screen-header__subtitle">
          Pick a creature to begin your run through the Monolith.
        </p>
      </header>

      <div className="starter-grid">
        {STARTERS.map((starter) => (
          <StarterCard
            key={starter.id}
            starter={starter}
            selected={pendingStarterId === starter.id}
            onSelect={() => onSelect(starter.id)}
          />
        ))}
      </div>

      <footer className="starter-screen__footer">
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!pendingStarterId}
          onClick={onConfirm}
        >
          Choose Starter
        </button>
      </footer>
    </main>
  )
}

function StarterCard({
  starter,
  selected,
  onSelect,
}: {
  starter: Starter
  selected: boolean
  onSelect: () => void
}) {
  const { stats } = starter

  return (
    <article
      className={`starter-card starter-card--${starter.type.toLowerCase()}${selected ? ' starter-card--selected' : ''}`}
    >
      <CreaturePortrait
        type={starter.type}
        portraitUrl={getPortraitForStarter(starter)}
        silhouetteUrl={starter.silhouetteUrl}
        alt={starter.name}
        size="md"
        idle
        className="starter-card__portrait"
      />
      <header className="starter-card__header">
        <h2 className="starter-card__name">{starter.name}</h2>
        <span className="starter-card__type">{starter.type}</span>
      </header>
      <p className="starter-card__playstyle">{starter.playstyle}</p>
      <p className="starter-card__desc">{starter.description}</p>

      <dl className="starter-card__stats">
        <div>
          <dt>HP</dt>
          <dd>{stats.hp}</dd>
        </div>
        <div>
          <dt>ATK</dt>
          <dd>{stats.atk}</dd>
        </div>
        <div>
          <dt>DEF</dt>
          <dd>{stats.def}</dd>
        </div>
        <div>
          <dt>SP.ATK</dt>
          <dd>{stats.spAtk}</dd>
        </div>
        <div>
          <dt>SP.DEF</dt>
          <dd>{stats.spDef}</dd>
        </div>
        <div>
          <dt>SPD</dt>
          <dd>{stats.spd}</dd>
        </div>
      </dl>

      <p className="starter-card__ability">
        <span className="panel-label">Starting ability</span>
        {starter.ability}
      </p>

      <button
        type="button"
        className="btn btn--small"
        onClick={onSelect}
        aria-pressed={selected}
      >
        {selected ? 'Selected' : 'Select'}
      </button>
    </article>
  )
}

function PlayerPanel({
  creature,
  currentRegionId,
  earnedBadges,
  partySize,
  onBadgeClick,
}: {
  creature: RunCreature
  currentRegionId: string
  earnedBadges: string[]
  partySize: number
  onBadgeClick: (badgeId: string) => void
}) {
  const regionName = getRegion(currentRegionId).name
  const dominant = getDominantEvolutionCategory(
    creature.evolutionScores,
    creature.type,
  )
  const xpPercent =
    creature.xpToNextLevel > 0
      ? Math.round((creature.currentXp / creature.xpToNextLevel) * 100)
      : 0

  return (
    <div className="player-panel">
      <div className="player-panel__main">
        <h1 className="player-panel__name">{creature.name}</h1>
        <span
          className={`player-panel__type player-panel__type--${creature.type.toLowerCase()}`}
        >
          {creature.type}
        </span>
        <span className="player-panel__level">Lv. {creature.level}</span>
      </div>

      <p className="player-panel__region">
        {regionName} · Badges {earnedBadges.length} / {BADGES_IN_REGION}
      </p>

      <div className="xp-bar">
        <span className="xp-bar__label">
          XP {creature.currentXp} / {creature.xpToNextLevel}
        </span>
        <div className="xp-bar__track">
          <div className="xp-bar__fill" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      <HpBar label="HP" current={creature.currentHp} max={creature.maxHp} />

      <dl className="player-panel__meta">
        <div>
          <dt>Coins</dt>
          <dd>{creature.coins}</dd>
        </div>
        <div>
          <dt>Party</dt>
          <dd>{partySize} / 3</dd>
        </div>
        <div>
          <dt>Perks</dt>
          <dd>{creature.selectedPerks.length}</dd>
        </div>
        <div>
          <dt>Evolution path</dt>
          <dd>
            {formatCategory(dominant.category)} (
            {creature.evolutionScores[dominant.category]})
          </dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{creature.evolutionStage} / 3</dd>
        </div>
      </dl>

      <dl className="player-panel__evo-scores">
        <div>
          <dt>Off</dt>
          <dd>{creature.evolutionScores.offense}</dd>
        </div>
        <div>
          <dt>Def</dt>
          <dd>{creature.evolutionScores.defense}</dd>
        </div>
        <div>
          <dt>Spd</dt>
          <dd>{creature.evolutionScores.speed}</dd>
        </div>
        <div>
          <dt>Util</dt>
          <dd>{creature.evolutionScores.utility}</dd>
        </div>
        <div>
          <dt>Evo</dt>
          <dd>{creature.evolutionScores.evolution}</dd>
        </div>
      </dl>
      <p className="player-panel__dominant">
        Dominant path: <strong>{formatCategory(dominant.category)}</strong>
      </p>

      {earnedBadges.length > 0 && (
        <ul className="player-panel__badges" aria-label="Earned badges">
          {earnedBadges.map((id) => {
            const badge = getBadge(id)
            if (!badge) return null
            return (
              <li key={id}>
                <button
                  type="button"
                  className="player-panel__badge"
                  title={`View ${badge.name} details`}
                  onClick={() => onBadgeClick(id)}
                >
                  {badge.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RunMapScreen({
  creature,
  mapNodes,
  nodeStates,
  earnedBadges,
  partySize,
  activeHelperId,
  partyRecruits,
  currentRegionId,
  mapMessage,
  nodeClickDebug,
  saveStatus,
  saveWarning,
  currentObjective,
  showTesterPanel,
  onToggleTesterPanel,
  onNodeClick,
  onOpenParty,
  onOpenInventory,
  onBadgeClick,
  onBackToTitle,
  onOpenRecoveryStation,
  recoveryRequestReady,
  onLeaveArea,
  onOpenFriendBattle,
  onOpenFeedback,
  onOpenLeaderboard,
  showCouncilHudAccess,
  onOpenMonolithCouncil,
  councilMapFocusNodeId,
}: {
  creature: RunCreature
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  earnedBadges: string[]
  partySize: number
  activeHelperId: string | null
  partyRecruits: PartyCreature[]
  currentRegionId: string
  mapMessage: string | null
  showCouncilHudAccess?: boolean
  onOpenMonolithCouncil?: () => void
  councilMapFocusNodeId?: string | null
  nodeClickDebug: {
    id: string
    type: string
    state: NodeVisitState
    route: NodeClickAction | 'blocked'
  } | null
  onNodeClick: (node: MapNode) => void
  saveStatus: SaveStatusKind
  saveWarning: string | null
  currentObjective: { title: string; detail?: string }
  showTesterPanel: boolean
  onToggleTesterPanel: () => void
  onOpenParty: () => void
  onOpenInventory: () => void
  onBadgeClick: (badgeId: string) => void
  onBackToTitle: () => void
  onOpenRecoveryStation: () => void
  recoveryRequestReady: boolean
  onLeaveArea: () => void
  onOpenFriendBattle: () => void
  onOpenFeedback: () => void
  onOpenLeaderboard: () => void
}) {
  const statusText = saveStatusLabel(saveStatus, saveWarning)
  const helperName =
    partyRecruits.find((r) => r.id === activeHelperId)?.name ?? null
  const region = getRegion(currentRegionId)
  const levelRange = getRegionEnemyLevelRange(currentRegionId)
  const partyHighest = getPartyHighestLevel(creature, partyRecruits)
  const badgesInRegion = countBadgesInRegion(currentRegionId, earnedBadges)

  return (
    <main className="map-screen">
      <header className="map-screen__top">
        <PlayerPanel
          creature={creature}
          currentRegionId={currentRegionId}
          earnedBadges={earnedBadges}
          partySize={partySize}
          onBadgeClick={onBadgeClick}
        />
        <div className="map-screen__actions">
          {statusText && (
            <span className="save-status" role="status">
              {statusText}
            </span>
          )}
          <button type="button" className="btn btn--small" onClick={onOpenParty}>
            Party
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenInventory}>
            Inventory
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenRecoveryStation}>
            Recovery Station
            {recoveryRequestReady && (
              <span className="map-screen__notify-badge" aria-label="Request reward ready">
                !
              </span>
            )}
          </button>
          <button type="button" className="btn btn--small" onClick={onLeaveArea}>
            Leave Area
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenFriendBattle}>
            Friend Battle
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenLeaderboard}>
            Leaderboard
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenFeedback}>
            Feedback
          </button>
          <button type="button" className="btn btn--small" onClick={onBackToTitle}>
            Back to Title
          </button>
        </div>
      </header>

      <CurrentObjectivePanel objective={currentObjective} />

      {showCouncilHudAccess && onOpenMonolithCouncil && (
        <div className="map-screen__council-access" role="region" aria-label="Monolith Council">
          <button
            type="button"
            className="btn btn--primary map-screen__council-btn"
            onClick={onOpenMonolithCouncil}
          >
            Challenge Monolith Council
          </button>
          <p className="map-screen__council-access-hint">
            Final challenge at the top of your route · 2v2 gauntlet (active helper required)
          </p>
        </div>
      )}

      <section className="map-region-info" aria-label="Current region">
        <p>
          <span className="panel-label">Current Region</span>{' '}
          <strong>{region.name}</strong>
        </p>
        <p>
          Recommended Lv. {region.recommendedLevel}+ · Enemy levels{' '}
          {levelRange.min}–{levelRange.max} · Rewards{' '}
          {formatRewardMultiplier(currentRegionId)}
        </p>
        <p>
          Badges in region {badgesInRegion} / {region.availableBadges} · Party
          highest level {partyHighest}
        </p>
      </section>

      {helperName && (
        <p className="map-screen__helper" role="status">
          Combat helper: <strong>{helperName}</strong>
        </p>
      )}

      {nodeClickDebug && (
        <p className="node-debug" role="status">
          Clicked: <strong>{nodeClickDebug.id}</strong> · type:{' '}
          <strong>{nodeClickDebug.type}</strong> · state: {nodeClickDebug.state} ·
          route: <strong>{nodeClickDebug.route}</strong>
        </p>
      )}

      {mapMessage && (
        <p className="map-message" role="status">
          {mapMessage}
        </p>
      )}

      <MapBoard
        mapNodes={mapNodes}
        nodeStates={nodeStates}
        onNodeClick={onNodeClick}
        focusNodeId={councilMapFocusNodeId}
      />

      <p className="map-hint">
        Hold left-click and drag to pan the map. Click glowing nodes to enter.
      </p>

      <footer className="map-screen__footer">
        <p className="app-version-label app-version-label--map">{APP_VERSION_LABEL}</p>
        <button
          type="button"
          className="btn btn--small btn--ghost map-screen__tester-toggle"
          onClick={onToggleTesterPanel}
        >
          {showTesterPanel ? 'Hide tester info' : 'Tester info'}
        </button>
      </footer>
    </main>
  )
}

function DefeatScreen({
  defeat,
  onBeginNewRoute,
}: {
  defeat: DefeatInfo
  onBeginNewRoute: () => void
}) {
  const { coinsLost, enemyName } = defeat

  return (
    <main className="defeat-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Defeated</h1>
        <p className="screen-header__subtitle">
          {enemyName} won this fight.
        </p>
      </header>

      <section className="defeat-panel">
        <div className="defeat-panel__row">
          <span className="panel-label">Coins lost</span>
          <p className="defeat-panel__value">−{coinsLost} (25%)</p>
        </div>
        <p className="defeat-panel__note">
          Your team recovers to 50% HP. Party members and badges are kept. The
          current route is abandoned and a new map is generated.
        </p>
      </section>

      <p className="defeat-screen__flavor">
        Your team was defeated and forced to retreat. A new route through the
        region has opened.
      </p>

      <button type="button" className="btn btn--primary" onClick={onBeginNewRoute}>
        Begin New Route
      </button>
    </main>
  )
}

function formatPerkStatModifiers(perk: Perk): string {
  if (!perk.statModifiers) return 'No direct stat modifiers'
  const m = perk.statModifiers
  const parts: string[] = []
  if (m.atk) parts.push(`ATK ${m.atk > 0 ? '+' : ''}${m.atk}`)
  if (m.def) parts.push(`DEF ${m.def > 0 ? '+' : ''}${m.def}`)
  if (m.spAtk) parts.push(`SP.ATK ${m.spAtk > 0 ? '+' : ''}${m.spAtk}`)
  if (m.spDef) parts.push(`SP.DEF ${m.spDef > 0 ? '+' : ''}${m.spDef}`)
  if (m.spd) parts.push(`SPD ${m.spd > 0 ? '+' : ''}${m.spd}`)
  if (m.hp) parts.push(`HP ${m.hp > 0 ? '+' : ''}${m.hp}`)
  if (m.maxHp) parts.push(`Max HP ${m.maxHp > 0 ? '+' : ''}${m.maxHp}`)
  return parts.length > 0 ? parts.join(', ') : 'No direct stat modifiers'
}

function PerkDraftScreen({
  creatureName,
  creatureType,
  level,
  currentHp,
  maxHp,
  evolutionStage,
  dominantCategory,
  dominantReason,
  evolutionScores,
  selectedPerkIds,
  perks,
  onChoose,
}: {
  creatureName: string
  creatureType: string
  level: number
  currentHp: number
  maxHp: number
  evolutionStage: number
  dominantCategory: string
  dominantReason: string
  evolutionScores: RunCreature['evolutionScores']
  selectedPerkIds: string[]
  perks: Perk[]
  onChoose: (perkId: string) => void
}) {
  return (
    <main className="perk-draft-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Level Up!</h1>
        <p className="screen-header__subtitle">
          {creatureName} leveled up! Choose a perk for {creatureName}.
        </p>
      </header>

      <section className="perk-draft-creature">
        <p>
          <strong>{creatureName}</strong> · {creatureType} · Lv. {level}
        </p>
        <p>
          HP {currentHp} / {maxHp} · Evolution stage {evolutionStage} / 3
        </p>
        <p>
          Dominant path:{' '}
          <strong>
            {dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1)}
          </strong>{' '}
          — {dominantReason}
        </p>
        <p className="perk-draft-creature__scores">
          Scores — Off {evolutionScores.offense} · Def {evolutionScores.defense}{' '}
          · Spd {evolutionScores.speed} · Util {evolutionScores.utility} · Evo{' '}
          {evolutionScores.evolution}
        </p>
      </section>

      <div className="perk-draft-grid">
        {perks.map((perk) => (
          <article
            key={perk.id}
            className={`perk-card perk-card--${perk.rarity} perk-card--${perk.category}`}
          >
            <header className="perk-card__header">
              <h2 className="perk-card__name">{perk.name}</h2>
              <span className={`perk-card__rarity perk-card__rarity--${perk.rarity}`}>
                {perk.rarity}
              </span>
            </header>
            <span className="perk-card__category">{formatCategory(perk.category)}</span>
            <p className="perk-card__stats">{formatPerkStatModifiers(perk)}</p>
            <p className="perk-card__desc">{perk.description}</p>
            {perk.effect && (
              <p className="perk-card__effect">{perk.effect}</p>
            )}
            {getPerkEvolutionScoreLabel(perk) ? (
              <p className="perk-card__evo-impact">
                {getPerkEvolutionScoreLabel(perk)}
              </p>
            ) : null}
            {getPerkStackLabel(perk, selectedPerkIds) ? (
              <p className="perk-card__stacks">
                {getPerkStackLabel(perk, selectedPerkIds)}
              </p>
            ) : null}
            <p className="perk-card__affects">Affects: this creature only</p>
            <button
              type="button"
              className="btn btn--small btn--primary"
              onClick={() => onChoose(perk.id)}
            >
              Choose
            </button>
          </article>
        ))}
      </div>
    </main>
  )
}

export default App
