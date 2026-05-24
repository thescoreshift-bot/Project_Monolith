import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { AccountScreen, LoginScreen, RegisterScreen } from './components/AuthScreens'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { DailyRunScreen } from './components/DailyRunScreen'
import { DailyDefeatScreen } from './components/DailyDefeatScreen'
import { LeaderboardScreen } from './components/LeaderboardScreen'
import { ProfileSetupScreen } from './components/ProfileSetupScreen'
import { FeedbackModal } from './components/FeedbackModal'
import { RewardScreen } from './components/RewardScreen'
import { RunSummaryScreen } from './components/RunSummaryScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { TutorialOverlay } from './components/TutorialOverlay'
import { AbilityUpgradeScreen } from './components/AbilityUpgradeScreen'
import { AbilityTransformScreen } from './components/AbilityTransformScreen'
import { MoveLearnScreen } from './components/MoveLearnScreen'
import { CombatScreen, type CombatantTarget } from './components/CombatScreen'
import { EventScreen } from './components/EventScreen'
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
import { getAbility } from './data/abilities'
import { BADGES_IN_REGION, getBadge } from './data/badges'
import {
  DEFAULT_REGION_ID,
  getRegion,
  normalizeRegionId,
} from './data/regions'
import {
  formatDailyDisplayDate,
  getDailyModifierForSeed,
  getDailyRunRegionId,
  getDailySeed,
  type DailyModifier,
} from './utils/dailyRun'
import {
  getDailyRunDayStateForToday,
  hasDailyRunForToday,
  hasDailyRunInProgress,
  loadDailyRunDayState,
  resetCurrentDailyAttempt,
  saveDailyRunDayState,
  type DailyRunDayState,
} from './utils/dailyRunState'
import {
  calculateCheckpoint,
  calculateCurrentAttemptScore,
  formatCheckpointLabel,
  updateBestDailyScore,
  type DailyRunScoreInput,
} from './utils/dailyRunScoring'
import {
  fetchLeaderboard,
  getPlayerRank,
  submitDailyLeaderboardScore,
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
  acceptQuest,
  claimQuestReward,
  createDefaultQuestState,
  normalizeQuestState,
  updateQuestProgress,
  type QuestEventPayload,
  type QuestEventType,
  type QuestRunContext,
  type QuestState,
} from './utils/questSystem'
import {
  getPlayerPrefs,
  isTutorialCompleted,
  resetTutorialPrefs,
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
  getRewardsForEncounter,
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
import { SHOP_ITEMS, type ShopItemId } from './data/shopItems'
import { STARTERS, type Starter } from './data/starters'
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
  getPostVictoryHealFromBadges,
} from './utils/badgeBonuses'
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
  applyDamage,
  pickEnemyAbility,
  rollHits,
  safeCalcDamage,
  sanitizeDamage,
} from './utils/combat'
import {
  applyDefeatPenalties,
  generateNewRoute,
} from './utils/defeatRecovery'
import { applyEventChoice } from './utils/eventHandlers'
import {
  getMapNodeFromList,
  unlockBossIfReady,
} from './utils/mapGenerator'
import { rollBattleGearDrop, rollShopGearOffers } from './utils/gearSystem'
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
  loadFromCloudSlot,
  saveToCloudSlot,
  uploadLocalSlotToCloud,
} from './utils/cloudSaveSystem'
import {
  buildSaveSlotSummary,
  clearSaveSlot,
  getAllLocalSaveSlotSummaries,
  hasSaveInSlot,
  loadRunFromSlot,
  saveRunToSlot,
  SAVE_VERSION,
  toSavableScreen,
  type RunSaveData,
  type SaveSlotId,
  type SaveSlotSummary,
} from './utils/saveSystem'
import {
  applyPendingRetentionRewards,
  createDefaultRetentionState,
  getScaledQuestContext,
  hasRetentionNotifications,
  loadRetentionFromLocalSlot,
  normalizeRetentionState,
  saveRetentionToLocalSlot,
  trackGameEvent,
  type GameEventPayload,
  type GameEventType,
  type RetentionState,
} from './utils/retentionSystem'
import './App.css'

type PlayMode = 'offline' | 'cloud'
type RunMode = 'normal' | 'daily' | 'pvp'

type SaveStatusKind = 'idle' | 'saving' | 'cloud' | 'local' | 'failed' | 'warning'

type Screen =
  | 'title'
  | 'login'
  | 'register'
  | 'account'
  | 'characterSelect'
  | 'starterSelect'
  | 'runMap'
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
  | 'pvp'
  | 'pvpVictory'
  | 'pvpDefeat'
  | 'monolithArchive'

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
  const [pendingBossVictory, setPendingBossVictory] = useState(false)
  const [regionCompleteInfo, setRegionCompleteInfo] =
    useState<RegionCompleteData | null>(null)
  const [pendingRecruit, setPendingRecruit] = useState<PartyCreature | null>(null)
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('starter')
  const [lastCombatNode, setLastCombatNode] = useState<MapNode | null>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [activeEncounterKind, setActiveEncounterKind] =
    useState<EncounterKind>('battle')
  const [enemy, setEnemy] = useState<Enemy | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null)
  const [defeatInfo, setDefeatInfo] = useState<DefeatInfo | null>(null)
  const [combatLocked, setCombatLocked] = useState(false)
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
  const [shopGearOffers, setShopGearOffers] = useState<string[]>([])
  const [gearEquipCreatureId, setGearEquipCreatureId] = useState<string | null>(
    null,
  )
  const [restChoiceMade, setRestChoiceMade] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [mapMessage, setMapMessage] = useState<string | null>(null)
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
  const persistInFlightRef = useRef(false)
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
  const preCombatMasteryRef = useRef<{
    starter: RunCreature['abilityMastery']
    recruits: Record<string, RunCreature['abilityMastery']>
  } | null>(null)
  const partyOpenedThisRunRef = useRef(false)
  const settingsReturnScreenRef = useRef<Screen>('title')
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
  const [leaderboardTab, setLeaderboardTab] = useState<'today' | 'week' | 'all'>(
    'today',
  )
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
  const [questBoardMessage, setQuestBoardMessage] = useState<string | null>(null)
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
  const combatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstAttackUsedRef = useRef<Set<string>>(new Set())
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
    enemyStatStagesRef.current = {}
    playerStatStagesRef.current = {}
    enemyTurnLockRef.current = false
    clearCombatTimeout()
  }

  function syncTutorialFromStorage() {
    const prefs = getPlayerPrefs()
    if (prefs.tutorialCompleted) {
      setTutorialActive(false)
      setTutorialStep(null)
    }
  }

  function beginTutorialIfNeeded() {
    if (isTutorialCompleted()) {
      setTutorialActive(false)
      setTutorialStep(null)
      return
    }
    setTutorialActive(true)
    setTutorialStep('chooseStarter')
  }

  function completeTutorial() {
    persistTutorialCompleted(true)
    void setProfileTutorialCompleted(true)
    setTutorialActive(false)
    setTutorialStep(null)
  }

  function skipTutorial() {
    completeTutorial()
  }

  function dismissTutorialStep() {
    if (!tutorialStep) return
    if (tutorialStep === 'nextNode') {
      completeTutorial()
      return
    }
    const next = getNextTutorialStep(tutorialStep)
    if (!next) completeTutorial()
    else setTutorialStep(next)
  }

  function advanceTutorialTo(step: TutorialStepId) {
    if (!tutorialActive || isTutorialCompleted()) return
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

  function getFeedbackContext(): {
    screen: string
    region: string
    saveSlot: string
  } {
    const slot =
      playMode === 'cloud'
        ? `Cloud ${selectedCharSlot}`
        : playMode === 'offline'
          ? `Local ${selectedCharSlot}`
          : runModeRef.current === 'daily'
            ? 'Daily run'
            : 'None'
    return {
      screen,
      region: currentRegionId,
      saveSlot: slot,
    }
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
        defaultContact={playerProfile?.display_name}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={async (input) => {
          const result = await submitFeedback({
            ...input,
            screen: ctx.screen,
            region: ctx.region,
            saveSlot: ctx.saveSlot,
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
    setQuestState((prev) => {
      const result = updateQuestProgress(prev, event, payload, ctx)
      if (result.newlyCompleted.length > 0) {
        setQuestCompleteToasts((toasts) => [
          ...toasts,
          ...result.newlyCompleted.map((q) => ({
            id: `${q.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: q.title,
            rewardPreview: q.rewardPreview,
          })),
        ])
      }
      return result.state
    })
  }

  function getRetentionSlot(): SaveSlotId {
    return activeSlotIdRef.current ?? 1
  }

  function persistRetentionState(state: RetentionState) {
    saveRetentionToLocalSlot(getRetentionSlot(), state)
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
      trainerInventory,
      pending,
    )
    runCreatureRef.current = applied.starter
    setRunCreature(applied.starter)
    setTrainerInventory(applied.inventory)
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

  function handleRetentionStateChange(next: RetentionState) {
    const withPending = applyRetentionPendingToRun(next)
    setRetentionState(withPending)
    persistRetentionState(withPending)
    void persistRun()
  }

  function openMonolithArchive() {
    const slot = getRetentionSlot()
    const loaded = loadRetentionFromLocalSlot(slot)
    setRetentionState(loaded)
    setArchiveMessage(null)
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

  function handleAcceptQuest(questId: string) {
    setQuestState((s) => acceptQuest(s, questId))
    setQuestBoardMessage('Quest accepted.')
  }

  function handleClaimQuest(questId: string) {
    const ctx = buildQuestCtx()
    if (!ctx || !runCreature) return
    const result = claimQuestReward(questState, questId, ctx, trainerInventory)
    if (!result) {
      setQuestBoardMessage('Could not claim this quest.')
      return
    }
    setQuestState(result.state)
    setRunCreature(result.starter)
    setPartyRecruits(result.recruits)
    runCreatureRef.current = result.starter
    partyRecruitsRef.current = result.recruits
    setTrainerInventory(result.inventory)
    setQuestBoardMessage(`Rewards claimed: ${result.rewardSummary}`)
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
      retentionState,
    }
  }

  function getDailyEnemySpawnOptions(): EnemySpawnOptions | undefined {
    if (runModeRef.current !== 'daily') return undefined
    const mod = dailyModifierRef.current
    return {
      fireBias: mod.fireEnemyBias,
      hpMult: mod.enemyHpMult,
    }
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
        setDailyMenuRank(getPlayerRank(rows, authUserRef.current?.id))
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

  function openLeaderboard() {
    requireProfileOrSetup('leaderboard', () => {
      void loadLeaderboardForSeed(dailySeed).then(() => setScreen('leaderboard'))
    })
  }

  function beginDailyAttempt() {
    const seed = getDailySeed()
    const modifier = getDailyModifierForSeed(seed)
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
    scoreTrackerRef.current = createScoreTracker(1)
    resetRunMemory()
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
    let day = getDailyRunDayStateForToday(seed, modifier.id)
    day.totalAttempts += 1
    day.currentAttemptDeaths = 0
    day = resetCurrentDailyAttempt(day)
    saveDailyRunDayState(day)
    setupDailyRunSession(seed, modifier)
    scoreTrackerRef.current = createScoreTracker(1)
    resetRunMemory()
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

    const result = await submitDailyLeaderboardScore({
      dailySeed: day.dailySeed,
      scoreSnapshot,
      regionId: checkpoint.region,
      starter,
      recruits: attempt?.partyRecruits ?? partyRecruits,
      badgesEarned: checkpoint.badgesEarned,
      evolutionsCount: checkpoint.evolutionsCount,
      checkpoint,
      forceBestScore: day.bestScore,
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
    if (runModeRef.current === 'daily') {
      if (!runCreature || persistInFlightRef.current) return
      persistInFlightRef.current = true
      setSaveStatus('saving')
      saveDailyRunProgress()
      setSaveStatus('local')
      persistInFlightRef.current = false
      return
    }

    const slotId = activeSlotIdRef.current
    const data = buildSaveData()
    if (!slotId || !data || persistInFlightRef.current) return

    persistInFlightRef.current = true
    setSaveStatus('saving')
    setSaveWarning(null)

    const envelope = buildSaveEnvelope(slotId, data)
    const mode = playModeRef.current

    if (mode === 'cloud' && authUserRef.current && isSupabaseConfigured()) {
      const localOk = saveRunToSlot(slotId, data)
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
    } else if (saveRunToSlot(slotId, data)) {
      setSaveStatus('local')
      refreshLocalSlots()
    } else {
      setSaveStatus('failed')
    }

    persistInFlightRef.current = false
  }

  async function persistSaveData(data: RunSaveData) {
    const slotId = activeSlotIdRef.current
    if (!slotId || persistInFlightRef.current) return

    persistInFlightRef.current = true
    setSaveStatus('saving')
    setSaveWarning(null)

    const envelope = buildSaveEnvelope(slotId, data)
    const mode = playModeRef.current

    if (mode === 'cloud' && authUserRef.current && isSupabaseConfigured()) {
      const localOk = saveRunToSlot(slotId, data)
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
    } else if (saveRunToSlot(slotId, data)) {
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
    setMapNodes(saved.mapNodes)
    setNodeStates(saved.nodeStates)
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
    setPendingPostBattleQueue(saved.pendingPostBattleQueue ?? [])
    setActiveHelperId(
      resolveActiveHelperId(
        saved.partyRecruits,
        saved.activeHelperId ?? null,
      ),
    )
    setEarnedBadges(saved.earnedBadges)
    setCurrentRegionId(normalizeRegionId(saved.currentRegion))
    setCompletedRegionIds(saved.completedRegionIds ?? [])
    setPendingBossVictory(saved.pendingBossVictory ?? false)
    setRegionCompleteInfo(saved.regionCompleteInfo ?? null)

    setShopLog(saved.shopLog)
    setTrainerInventory(
      saved.trainerInventory ??
        migrateLegacyGearInventory(
          emptyTrainerInventory(),
          saved.gearInventory,
        ),
    )
    setQuestState(normalizeQuestState(saved.questState))
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
    const finalRetention = {
      ...loadedRetention,
      pendingRewards: appliedRetention.cleared,
    }
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
    setShopGearOffers([])
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
      const envelope = await loadFromCloudSlot(slotId)
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
    if (!applySaveToState(saved, true)) {
      window.alert('Save data is corrupted and could not be loaded.')
      return
    }
    refreshLocalSlots()
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
      setSlotActionMessage(null)
      partyOpenedThisRunRef.current = false
      beginTutorialIfNeeded()
      setScreen('starterSelect')
    })
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
    setEarnedBadges([])
    setPartyRecruits([])
    setActiveHelperId(null)
    setCompletedRegionIds([])
    setPendingBossVictory(false)
    setRegionCompleteInfo(null)
    setPendingPerkDraftQueue([])
    setPendingEvolutionQueue([])
    setPendingAbilityUpgradeQueue([])
    setPendingTransformQueue([])
    setPendingPostBattleQueue([])
    setPendingRecruit(null)
    setEnemy(null)
    setBattleLog([])
    setRewardInfo(null)
    setDefeatInfo(null)
    setActiveNodeId(null)
    setCurrentNode(null)
    setLastCombatNode(null)
    resetCombatSession()

    const regionId = isDaily ? getDailyRunRegionId() : DEFAULT_REGION_ID
    setCurrentRegionId(regionId)
    const creature = createRunCreature(pendingStarter)
    setRunCreature(creature)
    runCreatureRef.current = creature
    partyRecruitsRef.current = []
    const freshInventory = emptyTrainerInventory()
    setTrainerInventory(freshInventory)
    setQuestState(createDefaultQuestState())
    setShopGearOffers([])
    scoreTrackerRef.current = createScoreTracker(creature.level)

    const { mapNodes: nodes, nodeStates: states } = createFreshMapState(
      regionId,
      [],
      isDaily ? dailyModifierRef.current : null,
    )
    setMapNodes(nodes)
    setNodeStates(states)

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
      void persistSaveData(freshSave)
    }

    setMapMessage('New run created.')
    dispatchRetentionEvent('creatureRecruited', {
      starterTypeId: pendingStarter.id,
      regionId,
    })
    maybeAdvanceTutorial('chooseStarter', 'clickBattleNode')
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

  function startCombat(node: MapNode) {
    if (!runCreature) return
    if (getNodeState(nodeStates, node.id) !== 'available') return

    const kind = getEncounterKind(node.type)
    const partyLevel = getPartyHighestLevel(runCreature, partyRecruits)
    const spawned = getEnemyForNode(
      node,
      currentRegionId,
      getDailyEnemySpawnOptions(),
      partyLevel,
    )

    setActiveNodeId(node.id)
    setCurrentNode(node)
    setLastCombatNode(node)
    setActiveEncounterKind(kind)
    setEnemy(spawned)
    resetCombatSession()
    setPendingAbilityUpgradeQueue([])
    setCombatPhase('starter')
    preCombatMasteryRef.current = {
      starter: structuredClone(runCreature.abilityMastery),
      recruits: Object.fromEntries(
        partyRecruits.map((r) => [r.id, structuredClone(r.abilityMastery)]),
      ),
    }
    setBattleLog([`${spawned.name} appeared!`])
    setCombatLocked(false)
    dispatchRetentionEvent('enemySeen', {
      templateId: spawned.id,
      regionId: currentRegionId,
    })
    maybeAdvanceTutorial('clickBattleNode', 'useAbility')
    setScreen('combat')
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
        setShopLog([])
        setShopGearOffers(rollShopGearOffers(currentRegionId))
        setScreen('shop')
        break
      case 'rest':
        setRestChoiceMade(false)
        setScreen('rest')
        break
      case 'event':
        setCurrentEvent(pickRandomEvent())
        setScreen('event')
        break
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

  /** Who attacks next on the player's side: starter → helper → enemy. Skips fainted. */
  function getNextPlayerAttacker(
    after: 'round-start' | 'starter' | 'recruit',
    starter: RunCreature,
    recruits: PartyCreature[],
  ): 'starter' | 'recruit' | 'enemy' {
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    const starterUp = starter.currentHp > 0
    const helperUp = Boolean(helper && helper.currentHp > 0)

    if (after === 'round-start') {
      if (starterUp) return 'starter'
      if (helperUp) return 'recruit'
      return 'enemy'
    }
    if (after === 'starter') {
      if (helperUp) return 'recruit'
      return 'enemy'
    }
    return 'enemy'
  }

  function resolvePlayerTurnPhase(
    starterHp: number,
    recruits: PartyCreature[],
  ): CombatPhase {
    const helper = getActiveCombatHelper(recruits, activeHelperId)
    if (starterHp > 0) return 'starter'
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

    if (phase === 'recruit') {
      if (helperUp) {
        return {
          phase: 'recruit',
          activeKey: helper!.id,
          hint: `Choose an ability for ${helper!.name}`,
        }
      }
      return { phase: 'recruit', activeKey: null, hint: 'Passing to enemy…' }
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
        hint: `Choose an ability for ${helper!.name}`,
      }
    }

    return { phase: 'starter', activeKey: null, hint: 'Waiting…' }
  }

  function handoffAfterPlayerAttack(
    nextEnemy: Enemy,
    whoJustAttacked: 'starter' | 'recruit',
  ) {
    if (!runCreature) return

    if (nextEnemy.currentHp <= 0) {
      appendLog(`${nextEnemy.name} fainted!`)
      scheduleVictoryCallback(() => handleVictory(nextEnemy), 400)
      return
    }

    const next = getNextPlayerAttacker(
      whoJustAttacked,
      runCreature,
      partyRecruits,
    )

    if (next === 'recruit') {
      const helper = getActiveCombatHelper(partyRecruits, activeHelperId)
      if (whoJustAttacked === 'starter' && helper) {
        appendLog(`${runCreature.name} acted — ${helper.name} is up next!`)
      }
      setCombatPhase('recruit')
      setCombatLocked(false)
      return
    }

    runEnemyTurn(nextEnemy)
  }

  function skipToNextLivingAttacker(reason: string) {
    if (!runCreature || !enemy) return

    const helper = getActiveCombatHelper(partyRecruits, activeHelperId)
    const next = getNextPlayerAttacker('round-start', runCreature, partyRecruits)

    if (next === 'starter') {
      appendLog(reason)
      setCombatPhase('starter')
      setCombatLocked(false)
      return
    }
    if (next === 'recruit' && helper) {
      appendLog(reason)
      setCombatPhase('recruit')
      setCombatLocked(false)
      return
    }

    runEnemyTurn(enemy)
  }

  type AttackResolution = {
    nextEnemy: Enemy
    updatedAttacker: RunCreature | PartyCreature
    attackerKey: string
  }

  function applyAbilityToEnemy(
    abilityId: string,
    attacker: RunCreature | PartyCreature,
    attackerName: string,
    attackerKey: string,
  ): AttackResolution | null {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    if (!enemy || !starterSnapshot) return null

    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    const masteryEntry = getMasteryEntry(attacker, abilityId)
    const resolvedId = getResolvedAbilityId(masteryEntry)
    const ability = getAbility(resolvedId)
    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const effectiveStats = getEffectiveStats(attacker, {
      earnedBadges,
      partyHighestLevel: partyLevel,
    })
    const enemyStages = enemyStatStagesRef.current
    const rawDefender = getDefenderStatsForAttack(
      enemy.stats,
      ability,
      attacker.selectedPerks,
    )
    const defenderStats = buildCombatStatsForEnemy(rawDefender, enemyStages)
    const badgeMult = getAttackerDamageMultiplier(
      ability,
      earnedBadges,
      attacker.selectedPerks,
      attacker,
    )
    const typeMult = getTypeEffectivenessMultiplier(ability.type, enemy.type)
    const masteryMods = getCombatModifiersFromMastery(masteryEntry)
    const supportMods = getSupportMasteryModifiers(masteryEntry)
    const firstStrikeBonus = getFirstStrikeBonus(
      attacker.selectedPerks,
      firstAttackUsedRef.current.has(attackerKey),
    )
    firstAttackUsedRef.current.add(attackerKey)

    const enemyHpBefore = enemy.currentHp
    const hit = rollHitsWithMastery(
      ability.accuracy,
      masteryMods.bonusAccuracy + supportMods.bonusAccuracy,
    )

    if (!hit) {
      appendLog(`${attackerName} used ${ability.name} — it missed!`)
      const updatedAttacker = applyMasteryAfterAttack(
        attacker,
        attackerKey,
        abilityId,
        buildMasteryXpContext(ability.type, enemy.type, false, enemyHpBefore, 0),
      )
      return { nextEnemy: enemy, updatedAttacker, attackerKey }
    }

    let nextEnemy = { ...enemy }
    let updatedAttacker = attacker
    const dealsDamage = abilityDealsDamage(ability)

    if (!dealsDamage) {
      appendLog(`${attackerName} used ${ability.name}!`)
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
      const crit = rollCrit(masteryMods.bonusCritChance)
      const damageDebug = {
        attackerName,
        attackerId: attackerKey,
        abilityId: resolvedId,
        abilityName: ability.name,
        defenderName: enemy.name,
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
          defenderMaxHp: enemy.maxHp,
          attackerLevel: attacker.level,
          encounterKind: enemy.kind,
        },
        damageDebug,
      )
      damage = sanitizeDamage(damage, enemy.maxHp, ability, typeMult)
      if (damage > 0 && firstStrikeBonus > 0) {
        damage += firstStrikeBonus
      }

      nextEnemy = {
        ...enemy,
        currentHp: applyDamage(enemy.currentHp, damage),
      }
      setEnemy(nextEnemy)

      const notes: string[] = []
      if (crit) notes.push('critical hit')
      if (typeMult >= SUPER_EFFECTIVE_MULTIPLIER) notes.push('super effective')
      if (typeMult < 1) notes.push('not very effective')
      if (firstStrikeBonus > 0) notes.push(`+${firstStrikeBonus} First Strike`)
      const noteSuffix = notes.length > 0 ? ` (${notes.join(', ')})` : ''

      appendLog(
        `${attackerName} used ${ability.name} — ${damage} damage to ${enemy.name}!${noteSuffix}`,
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
          enemy.type,
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
      buildMasteryXpContext(ability.type, enemy.type, true, enemyHpBefore, 0),
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
      const nextRecruits = partyRecruitsRef.current.map((r) =>
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
    setScreen('defeat')
  }

  function runEnemyTurn(currentEnemy: Enemy) {
    if (enemyTurnLockRef.current) return
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits
    if (
      !starterSnapshot ||
      combatEndedRef.current ||
      screenRef.current !== 'combat'
    ) {
      return
    }

    enemyTurnLockRef.current = true

    const helper = getActiveCombatHelper(recruitsSnapshot, activeHelperId)
    let nextStarterHp = starterSnapshot.currentHp
    let nextRecruits = recruitsSnapshot
    let nextHelperHp = helper?.currentHp ?? null

    const partyLevel = getPartyHighestLevel(starterSnapshot, recruitsSnapshot)
    const targets: {
      key: string
      name: string
      maxHp: number
      combatStats: ReturnType<typeof buildCombatStatsForCreature>
    }[] = []

    if (nextStarterHp > 0) {
      targets.push({
        key: 'starter',
        name: starterSnapshot.name,
        maxHp: starterSnapshot.maxHp,
        combatStats: buildCombatStatsForCreature(
          starterSnapshot,
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

    const target = targets[Math.floor(Math.random() * targets.length)]
    const enemyAbilityId = pickEnemyAbility(currentEnemy.abilityIds)
    const enemyAbility = getAbility(enemyAbilityId)
    const enemyAttackStats = buildCombatStatsForEnemy(
      currentEnemy.stats,
      enemyStatStagesRef.current,
    )

    if (!rollHits(enemyAbility.accuracy)) {
      appendLog(`${currentEnemy.name} used ${enemyAbility.name} — it missed!`)
    } else {
      const targetCreature =
        target.key === 'starter'
          ? starterSnapshot
          : recruitsSnapshot.find((r) => r.id === target.key)
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
      damage = applyEarlyGameDamageCap(
        damage,
        target.maxHp,
        currentEnemy.level,
        typeMult,
        currentEnemy.kind,
      )
      damage = sanitizeDamage(
        damage,
        target.maxHp,
        abilityForDamage,
        typeMult,
      )
      const seNote =
        typeMult >= SUPER_EFFECTIVE_MULTIPLIER ? ' (super effective)' : ''
      if (target.key === 'starter') {
        nextStarterHp = applyDamage(nextStarterHp, damage)
      } else {
        nextRecruits = partyRecruits.map((r) =>
          r.id === target.key
            ? { ...r, currentHp: applyDamage(r.currentHp, damage) }
            : r,
        )
        const updatedHelper = nextRecruits.find((r) => r.id === target.key)
        nextHelperHp = updatedHelper?.currentHp ?? nextHelperHp
      }
      if (damage > 0) {
        appendLog(
          `${currentEnemy.name} used ${enemyAbility.name} — ${damage} damage to ${target.name}!${seNote}`,
        )
      } else {
        appendLog(`${currentEnemy.name} used ${enemyAbility.name} on ${target.name}!`)
      }
      if (nextStarterHp <= 0 && target.key === 'starter') {
        const livingHelper = helper
          ? nextRecruits.find((r) => r.id === helper.id)
          : null
        if (livingHelper && livingHelper.currentHp > 0) {
          appendLog(`${starterSnapshot.name} fainted — ${livingHelper.name} is up next!`)
        }
      }
      if (helper && nextHelperHp !== null && nextHelperHp <= 0 && target.key === helper.id) {
        if (nextStarterHp > 0) {
          appendLog(`${helper.name} fainted — ${starterSnapshot.name} is up next!`)
        }
      }
    }

    const baseStarter = runCreatureRef.current ?? starterSnapshot
    if (!baseStarter) {
      enemyTurnLockRef.current = false
      return
    }

    const mergedStarter = {
      ...baseStarter,
      currentHp: nextStarterHp,
    }
    const helperHpForCheck = helper ? nextHelperHp : null

    if (isPartyDefeated(nextStarterHp, helperHpForCheck)) {
      appendLog('Your team was defeated!')
      handleDefeat(mergedStarter, nextRecruits, currentEnemy)
      enemyTurnLockRef.current = false
      return
    }

    runCreatureRef.current = mergedStarter
    setRunCreature(mergedStarter)
    partyRecruitsRef.current = nextRecruits
    setPartyRecruits(nextRecruits)
    setCombatPhase(resolvePlayerTurnPhase(nextStarterHp, nextRecruits))
    setCombatLocked(false)
    enemyTurnLockRef.current = false
  }

  function handleBeginNewRoute() {
    if (!runCreature) return

    console.log('Generating new route')
    clearCombatTimeout()
    resetCombatSession()

    const route = generateNewRoute(currentRegionId, earnedBadges)
    setMapNodes(route.mapNodes)
    setNodeStates(route.nodeStates)
    setDefeatInfo(null)
    setEnemy(null)
    setBattleLog([])
    setCombatLocked(false)
    setCombatPhase('starter')
    setLastCombatNode(null)
    setActiveNodeId(null)
    setCurrentNode(null)
    setScreen('runMap')
  }

  function handleVictory(defeatedEnemy: Enemy) {
    const starterSnapshot = runCreatureRef.current ?? runCreature
    const recruitsSnapshot = partyRecruitsRef.current ?? partyRecruits

    if (screenRef.current !== 'combat') return

    clearCombatTimeout()
    combatEndedRef.current = true
    setCombatLocked(true)

    if (runModeRef.current === 'pvp') {
      handlePvpVictory()
      return
    }

    if (!activeNodeId || !starterSnapshot || !lastCombatNode) return

    markNodeComplete(activeNodeId)

    dispatchQuestEvent('battleWon', {
      encounterKind: activeEncounterKind,
      nodeType: lastCombatNode.type,
    })
    dispatchQuestEvent('enemyDefeated', {
      encounterKind: activeEncounterKind,
      enemyKind: defeatedEnemy.kind,
    })
    dispatchRetentionEvent('battleWon')
    dispatchRetentionEvent('enemyDefeated')
    if (activeEncounterKind === 'alphaNest') {
      dispatchRetentionEvent('alphaDefeated')
    }
    if (activeEncounterKind === 'elite') {
      dispatchRetentionEvent('eliteOrAlphaDefeated')
    }
    if (lastCombatNode.type === 'boss') {
      dispatchRetentionEvent('bossDefeated', { regionId: currentRegionId })
    }

    recordBattleVictory(scoreTrackerRef.current, activeEncounterKind)

    let rewards = getRewardsForEncounter(activeEncounterKind, currentRegionId)
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
      activeEncounterKind,
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
    const leaderBadgeId = lastCombatNode.badgeId
    if (
      lastCombatNode.type === 'gymLeader' &&
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
      maybeAdvanceTutorial('winBattle', 'choosePerk')
    } else {
      maybeAdvanceTutorial('winBattle', 'masteryProgress')
    }
    setPendingAbilityUpgradeQueue([])
    pendingAbilityUpgradeQueueRef.current = []
    setPendingTransformQueue([])
    pendingTransformQueueRef.current = []

    const isBossVictory = lastCombatNode.type === 'boss'
    if (isBossVictory) {
      setPendingBossVictory(true)
    }

    const droppedGear = rollBattleGearDrop(activeEncounterKind)
    const dropResult = applyBattleDropsToInventory(
      trainerInventory,
      activeEncounterKind,
      droppedGear,
    )
    setTrainerInventory(dropResult.inventory)
    if (dropResult.gearId) {
      dispatchRetentionEvent('gearCollected', { gearId: dropResult.gearId })
    }
    for (const itemId of dropResult.itemIds) {
      dispatchRetentionEvent('itemCollected', { itemId })
    }
    for (const itemId of dropResult.materialIds) {
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
      lastCombatNode.type === 'battle' &&
      canRecruitEnemy(defeatedEnemy, lastCombatNode.type) &&
      Math.random() < recruitChance

    if (recruitRoll) {
      setPendingRecruit(convertEnemyToRecruit(defeatedEnemy))
      setRewardInfo({
        ...rewardPayload,
        recruitmentNote: `Recruitment available — ${defeatedEnemy.name} wants to join!`,
      })
      setScreen('recruitment')
      return
    }

    setRewardInfo(rewardPayload)
    setScreen('reward')
  }

  function handlePlayerAbility(combatantKey: string, abilityId: string) {
    if (
      screenRef.current !== 'combat' ||
      combatEndedRef.current ||
      !runCreature ||
      !enemy ||
      combatLocked
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
    maybeAdvanceTutorial('useAbility', 'winBattle')

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
      setCombatLocked(true)
      runEnemyTurn(enemy)
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

  function getCreatureSelectedPerks(creatureId: string): string[] {
    if (creatureId === STARTER_CREATURE_ID && runCreature) {
      return runCreature.selectedPerks
    }
    return partyRecruits.find((r) => r.id === creatureId)?.selectedPerks ?? []
  }

  function getCreatureForDraft(creatureId: string): {
    name: string
    type: RunCreature['type']
    level: number
    currentHp: number
    maxHp: number
    evolutionStage: number
    evolutionScores: RunCreature['evolutionScores']
  } | null {
    if (creatureId === STARTER_CREATURE_ID && runCreature) {
      return runCreature
    }
    const recruit = partyRecruits.find((r) => r.id === creatureId)
    return recruit ?? null
  }

  function startPerkDraftFor(creatureId: string, perks?: string[]) {
    setDraftingCreatureId(creatureId)
    const creature = getCreatureForDraft(creatureId)
  const exclude = perks ?? getCreatureSelectedPerks(creatureId)
    const speciesKey = creature
      ? resolveCreatureSpeciesKey({
          starterTypeId:
            creatureId === STARTER_CREATURE_ID && runCreature
              ? runCreature.starterTypeId
              : undefined,
          templateId:
            creatureId !== STARTER_CREATURE_ID
              ? partyRecruits.find((r) => r.id === creatureId)?.templateId
              : undefined,
          type: creature.type,
        })
      : 'fire'
    setDraftOptions(pickPerksForCreature(speciesKey, exclude))
    advanceTutorialTo('choosePerk')
    setScreen('perkDraft')
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
      proceedAfterVictoryFlow(starter)
      return
    }

    switch (event.type) {
      case 'perkDraft': {
        const perks =
          event.creatureId === STARTER_CREATURE_ID
            ? starter.selectedPerks
            : (recruits.find((r) => r.id === event.creatureId)?.selectedPerks ??
              [])
        startPerkDraftFor(event.creatureId, perks)
        return
      }
      case 'moveLearn':
        beginMoveLearn(event.creatureId, event.abilityId)
        return
      case 'evolution':
        beginEvolutionFor(
          { creatureId: event.creatureId, threshold: event.threshold },
          starter,
          recruits,
        )
        return
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
        proceedAfterVictoryFlow(starter)
    }
  }

  function consumePostBattleQueueAndContinue(
    starter: RunCreature,
    recruits: PartyCreature[],
  ) {
    const nextQueue = shiftQueue(pendingPostBattleQueue)
    setPendingPostBattleQueue(nextQueue)
    pendingPostBattleQueueRef.current = nextQueue
    processNextPostBattleEvent(starter, recruits, nextQueue)
  }

  function advancePostBattleFlow() {
    if (!runCreature) return
    processNextPostBattleEvent(
      runCreature,
      partyRecruits,
      pendingPostBattleQueue,
    )
  }

  function getCreatureById(creatureId: string): RunCreature | PartyCreature | null {
    if (creatureId === STARTER_CREATURE_ID && runCreature) return runCreature
    return partyRecruits.find((r) => r.id === creatureId) ?? null
  }

  function handleAbilityUpgradeChosen(perkId: string) {
    if (!runCreature || pendingAbilityUpgradeQueue.length === 0) return

    const entry = pendingAbilityUpgradeQueue[0]
    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (entry.creatureId === STARTER_CREATURE_ID) {
      nextStarter = applyPerkToCreature(
        runCreature,
        entry.abilityId,
        perkId,
        entry.rank,
      )
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
        r.id === entry.creatureId
          ? applyPerkToCreature(r, entry.abilityId, perkId, entry.rank)
          : r,
      )
      setPartyRecruits(nextRecruits)
    }

    const remainingUpgrades = pendingAbilityUpgradeQueue.slice(1)
    setPendingAbilityUpgradeQueue(remainingUpgrades)
    pendingAbilityUpgradeQueueRef.current = remainingUpgrades
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnConfirm() {
    if (!runCreature || !moveLearnContext) return
    const { creatureId, abilityId } = moveLearnContext
    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (creatureId === STARTER_CREATURE_ID) {
      nextStarter = addActiveAbility(runCreature, abilityId)
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
        r.id === creatureId ? addActiveAbility(r, abilityId) : r,
      )
      setPartyRecruits(nextRecruits)
    }

    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnReplace(oldAbilityId: string) {
    if (!runCreature || !moveLearnContext) return
    const { creatureId, abilityId } = moveLearnContext
    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (creatureId === STARTER_CREATURE_ID) {
      nextStarter = forgetActiveAbility(runCreature, oldAbilityId, abilityId)
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
        r.id === creatureId
          ? forgetActiveAbility(r, oldAbilityId, abilityId)
          : r,
      )
      setPartyRecruits(nextRecruits)
    }

    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleMoveLearnSkip() {
    if (!runCreature) return
    setMoveLearnContext(null)
    consumePostBattleQueueAndContinue(runCreature, partyRecruits)
  }

  function handleTransformConfirm() {
    if (!runCreature || !activeTransformEntry) return
    const entry = activeTransformEntry
    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (entry.creatureId === STARTER_CREATURE_ID) {
      nextStarter = applyTransformationToCreature(
        runCreature,
        entry.abilityId,
        entry.newAbilityId,
        entry.rank,
      )
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
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
    }

    setActiveTransformEntry(null)
    dispatchRetentionEvent('abilityTransformed', { abilityId: entry.newAbilityId })
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleEvolutionContinue() {
    if (!runCreature || !evolutionScreenData) return

    const { threshold, creatureId } = evolutionScreenData
    const targetId = creatureId ?? STARTER_CREATURE_ID

    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (targetId === STARTER_CREATURE_ID) {
      nextStarter = evolveStarter(runCreature, threshold)
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
        r.id === targetId ? evolvePartyCreature(r, threshold) : r,
      )
      setPartyRecruits(nextRecruits)
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
  }

  function healPartyAfterBattle(creature: RunCreature) {
    const healed = clearPartyBattleBuffs(
      applyPostBattleHealing(creature),
      partyRecruits,
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

  function proceedAfterVictoryFlow(creature: RunCreature) {
    healPartyAfterBattle(creature)

    if (runModeRef.current === 'daily' && (rewardInfo?.bossVictory || pendingBossVictory)) {
      scoreTrackerRef.current.badgesEarned = earnedBadges.length
      openRunSummary(true)
      return
    }

    if (rewardInfo?.bossVictory || pendingBossVictory) {
      if (rewardInfo) {
        openRegionComplete(rewardInfo)
        return
      }
    }

    finishRunReturn(creature)
  }

  function finishRunReturn(creature: RunCreature) {
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
    healPartyAfterBattle(creature)
    maybeAdvanceTutorial('evolutionPath', 'nextNode')
    setScreen('runMap')
  }

  function handleChooseNextRegion() {
    setScreen('regionSelect')
  }

  function handleTravelToRegion(regionId: string) {
    const route = createRegionMap(regionId, earnedBadges)
    setCurrentRegionId(regionId)
    setMapNodes(route.nodes)
    setNodeStates(route.nodeStates)
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
    setMapMessage(null)
    resetCombatSession()
    setScreen('runMap')
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
    advancePostBattleFlow()
  }

  function handlePerkChosen(perkId: string) {
    if (!runCreature || !draftingCreatureId) return

    let nextStarter = runCreature
    let nextRecruits = partyRecruits

    if (draftingCreatureId === STARTER_CREATURE_ID) {
      nextStarter = applyPerk(runCreature, perkId)
      setRunCreature(nextStarter)
    } else {
      nextRecruits = partyRecruits.map((r) =>
        r.id === draftingCreatureId ? applyPerkToPartyCreature(r, perkId) : r,
      )
      setPartyRecruits(nextRecruits)
    }

    setDraftingCreatureId(null)
    maybeAdvanceTutorial('choosePerk', 'masteryProgress')
    consumePostBattleQueueAndContinue(nextStarter, nextRecruits)
  }

  function handleLeaveShop() {
    if (!activeNodeId) return
    markNodeComplete(activeNodeId)
    setShopLog([])
    setScreen('runMap')
  }

  function handleBuyConsumable(itemId: ShopItemId) {
    if (!runCreature) return

    const item = SHOP_ITEMS.find((i) => i.id === itemId)
    if (!item) return

    if (runCreature.coins < item.cost) {
      setShopLog((prev) => [
        ...prev,
        `Not enough coins for ${item.name} (need ${item.cost}).`,
      ])
      return
    }

    const next: RunCreature = {
      ...runCreature,
      coins: runCreature.coins - item.cost,
    }
    setTrainerInventory((prev) => addItemToTrainerInventory(prev, itemId, 1))
    dispatchRetentionEvent('itemCollected', { itemId })
    setShopLog((prev) => [...prev, `Bought ${item.name} x1.`])
    runCreatureRef.current = next
    setRunCreature(next)
  }

  function handleBuyGear(gearId: string) {
    if (!runCreature) return
    const gear = getGearItem(gearId)
    if (!gear) return
    if (!shopGearOffers.includes(gearId)) return

    if (runCreature.coins < gear.price) {
      setShopLog((prev) => [
        ...prev,
        `Not enough coins for ${gear.name} (need ${gear.price}).`,
      ])
      return
    }

    const next: RunCreature = {
      ...runCreature,
      coins: runCreature.coins - gear.price,
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
    const fainted = getFaintedMembers(runCreature, partyRecruits)
    setSelectedReviveTarget(fainted[0]?.ref ?? null)
    setScreen('recoveryStation')
  }

  function handleRecoveryBack() {
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

    const result = applyEventChoice(currentEvent.id, choice, {
      starter: runCreature,
      recruits: partyRecruits,
      earnedBadges,
      regionId: currentRegionId,
    })

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
    }
    if (result.message) {
      setMapMessage(result.message)
    }
    dispatchQuestEvent('eventCompleted', {})
    dispatchRetentionEvent('eventCompleted')
    markNodeComplete(activeNodeId)
    setCurrentEvent(null)
    setScreen('runMap')
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
          onLeaderboard={openLeaderboard}
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
          onLeaderboard={openLeaderboard}
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
          dailySeed={dailySeed}
          displayDate={formatDailyDisplayDate()}
          rows={leaderboardRows}
          playerRank={getPlayerRank(leaderboardRows, authUser?.id)}
          loggedIn={Boolean(authUser)}
          loading={leaderboardLoading}
          errorMessage={leaderboardError}
          activeTab={leaderboardTab}
          onTabChange={setLeaderboardTab}
          onBack={() => setScreen('dailyRun')}
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
          onLeaderboard={openLeaderboard}
          onMenu={goToTitle}
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
          onSelectSlot={setSelectedCharSlot}
          onContinue={handleCharacterContinue}
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

  if (screen === 'settings') {
    const returnScreen = settingsReturnScreenRef.current
    return (
      <div className="app">
        <SettingsScreen
          tutorialCompleted={isTutorialCompleted()}
          onResetTutorial={handleResetTutorial}
          onOpenFeedback={() => setFeedbackOpen(true)}
          onBack={() =>
            setScreen(returnScreen === 'settings' ? 'title' : returnScreen)
          }
        />
        {renderFeedbackModal()}
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

  if (screen === 'shop' && runCreature && currentNode?.type === 'shop') {
    return (
      <div className="app">
        <ShopScreen
          creature={runCreature}
          shopLog={shopLog}
          gearOffers={shopGearOffers}
          onBuyConsumable={handleBuyConsumable}
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

  if (screen === 'combat' && runCreature && enemy) {
    const combatants = buildCombatants()
    const playerTurn = getPlayerTurnView(runCreature, partyRecruits, combatPhase)

    return (
      <div className="app">
        <CombatScreen
          combatants={combatants}
          enemy={enemy}
          battleLog={battleLog}
          combatLocked={combatLocked}
          turnHint={playerTurn.hint}
          activeCombatantKey={playerTurn.activeKey}
          earnedBadges={earnedBadges}
          partyHighestLevel={getPartyHighestLevel(runCreature, partyRecruits)}
          enemyStatStages={enemyStatStagesRef.current}
          playerStatStages={playerStatStagesRef.current}
          onUseAbility={handlePlayerAbility}
        />
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
    return (
      <div className="app">
        <RegionCompleteScreen
          data={regionCompleteInfo}
          creature={runCreature}
          partyRecruits={partyRecruits}
          onChooseNextRegion={handleChooseNextRegion}
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
          questState={questState}
          questCtx={{
            starter: runCreature,
            recruits: partyRecruits,
            currentRegionId,
            earnedBadges,
          }}
          questMessage={questBoardMessage}
          logMessage={recoveryLogMessage}
          selectedReviveTarget={selectedReviveTarget}
          onSelectReviveTarget={setSelectedReviveTarget}
          onHealParty={handleRecoveryHealParty}
          onReviveSelected={handleRecoveryReviveSelected}
          onFullRecovery={handleRecoveryFullRecovery}
          onAcceptQuest={handleAcceptQuest}
          onClaimQuest={handleClaimQuest}
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

  if (screen === 'runMap' && selectedStarter && runCreature && mapNodes.length > 0) {
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
          onOpenFriendBattle={() => openFriendBattle('runMap')}
          onOpenFeedback={() => setFeedbackOpen(true)}
        />
        {selectedBadgeId && (
          <BadgeDetailModal
            badgeId={selectedBadgeId}
            onClose={() => setSelectedBadgeId(null)}
          />
        )}
        {renderTutorialOverlay()}
        {renderFeedbackModal()}
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
      />
      {renderGlobalToasts()}
      {renderFeedbackModal()}
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
}: {
  loggedIn: boolean
  cloudConfigured: boolean
  displayName?: string
  hasArchiveNotification?: boolean
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
}) {
  return (
    <main className="title-screen">
      <div className="title-screen__glow" aria-hidden="true" />

      <header className="title-screen__header">
        <h1 className="title-screen__title">PROJECT MONOLITH</h1>
        <p className="title-screen__subtitle">Creature Battler Roguelike</p>
      </header>

      <nav className="title-screen__actions" aria-label="Main menu">
        <button type="button" className="btn btn--primary" onClick={onDailyRun}>
          Daily Run
        </button>
        <button
          type="button"
          className="btn title-screen__archive-btn"
          onClick={onMonolithArchive}
        >
          Monolith Archive
          {hasArchiveNotification ? (
            <span className="title-screen__archive-badge" aria-label="Rewards available">
              {' '}
              !
            </span>
          ) : null}
        </button>
        {loggedIn ? (
          <>
            <button type="button" className="btn" onClick={onPlay}>
              Play
            </button>
            <button type="button" className="btn" onClick={onAccount}>
              Account
            </button>
            <button type="button" className="btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn"
              onClick={onLogin}
              disabled={!cloudConfigured}
              title={
                cloudConfigured
                  ? undefined
                  : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
              }
            >
              Login
            </button>
            <button type="button" className="btn" onClick={onRegister} disabled={!cloudConfigured}>
              Register
            </button>
            <button type="button" className="btn" onClick={onPlayOffline}>
              Play Offline
            </button>
          </>
        )}
        <button type="button" className="btn" onClick={onFriendBattle}>
          Friend Battle
        </button>
        <button type="button" className="btn btn--small" onClick={onFeedback}>
          Feedback
        </button>
        <button type="button" className="btn btn--small" onClick={onSettings}>
          Settings
        </button>
      </nav>

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
            {formatCategory(dominant.category)} ({creature.evolutionScores[dominant.category]})
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
  onNodeClick,
  onOpenParty,
  onOpenInventory,
  onBadgeClick,
  onBackToTitle,
  onOpenRecoveryStation,
  onOpenFriendBattle,
  onOpenFeedback,
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
  nodeClickDebug: {
    id: string
    type: string
    state: NodeVisitState
    route: NodeClickAction | 'blocked'
  } | null
  onNodeClick: (node: MapNode) => void
  saveStatus: SaveStatusKind
  saveWarning: string | null
  onOpenParty: () => void
  onOpenInventory: () => void
  onBadgeClick: (badgeId: string) => void
  onBackToTitle: () => void
  onOpenRecoveryStation: () => void
  onOpenFriendBattle: () => void
  onOpenFeedback: () => void
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
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenFriendBattle}>
            Friend Battle
          </button>
          <button type="button" className="btn btn--small" onClick={onOpenFeedback}>
            Feedback
          </button>
          <button type="button" className="btn btn--small" onClick={onBackToTitle}>
            Back to Title
          </button>
        </div>
      </header>

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
      />

      <p className="map-hint">
        Hold left-click and drag to pan the map. Click glowing nodes to enter.
      </p>

      <p className="app-version-label app-version-label--map">{APP_VERSION_LABEL}</p>
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
            <p className="perk-card__evo-impact">
              Evolution score: {getPerkEvolutionScoreLabel(perk)}
            </p>
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
