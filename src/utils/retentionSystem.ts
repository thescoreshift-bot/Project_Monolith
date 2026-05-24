import { ACHIEVEMENT_BY_ID, ACHIEVEMENT_DEFINITIONS } from '../data/achievements'
import type { AchievementDefinition } from '../data/achievements'
import {
  ARCHIVE_QUEST_BY_ID,
  DAILY_ARCHIVE_QUEST_POOL,
  WEEKLY_ARCHIVE_QUEST_POOL,
  type ArchiveQuestTrackEvent,
} from '../data/archiveQuests'
import {
  CREATURE_ARCHIVE_ENTRIES,
  resolveArchiveEntryFromName,
  resolveArchiveEntryFromStarterId,
  resolveArchiveEntryFromTemplate,
} from '../data/creatureArchive'
import { GEAR_ITEM_LIST, type GearRarity } from '../data/gearItems'
import { ITEMS } from '../data/items'
import { BADGES_BY_ID } from '../data/badges'
import type { TrainerInventory } from './inventorySystem'
import { addItemToTrainerInventory } from './inventorySystem'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'
import { addCoins } from './progression'
import { getPartyHighestLevel } from './regionRewards'
import { rollShopGearOffers } from './gearSystem'

export type ArchiveQuestProgress = {
  questId: string
  current: number
  required: number
  completed: boolean
  claimed: boolean
}

export type AchievementProgress = {
  progress: number
  required: number
  unlocked: boolean
  claimed: boolean
}

export type CreatureArchiveProgress = {
  seen: boolean
  recruited: boolean
  evolved: boolean
  regionFirstSeen?: string
}

export type CollectionLogState = {
  gear: Record<string, boolean>
  consumables: Record<string, boolean>
  materials: Record<string, boolean>
  badges: Record<string, boolean>
  regionsCleared: Record<string, boolean>
  abilitiesTransformed: Record<string, boolean>
  titles: string[]
}

export type RetentionStats = {
  battlesWon: number
  evolutions: number
  recruits: number
  alphaDefeated: number
  badgesEarned: number
  masteryLevel5: number
  masteryLevel10: number
  dailyQuestsCompleted: number
  pvpWins: number
  itemsCollected: number
}

export type PendingRetentionRewards = {
  coins: number
  items: { itemId: string; quantity: number }[]
  gearIds: string[]
}

export type RetentionState = {
  dailyRewards: {
    lastClaimDate: string | null
    currentStreak: number
    claimedToday: boolean
  }
  dailyQuests: {
    questDate: string
    quests: ArchiveQuestProgress[]
  }
  weeklyQuests: {
    weekKey: string
    quests: ArchiveQuestProgress[]
  }
  achievements: Record<string, AchievementProgress>
  creatureArchive: Record<string, CreatureArchiveProgress>
  collectionLog: CollectionLogState
  titles: string[]
  stats: RetentionStats
  pendingRewards: PendingRetentionRewards
  archiveLastViewedAt: string | null
  newArchiveDiscoveries: number
}

export type RetentionRewardGrant = {
  coins: number
  items: { itemId: string; quantity: number }[]
  gearIds: string[]
  titleId?: string
  summary: string
}

export type GameEventType =
  | 'battleStarted'
  | 'enemySeen'
  | 'battleWon'
  | 'enemyDefeated'
  | 'nodeCleared'
  | 'eventCompleted'
  | 'creatureRecruited'
  | 'creatureEvolved'
  | 'abilityUsed'
  | 'abilityMasteryLevelReached'
  | 'abilityMasteryXp'
  | 'abilityTransformed'
  | 'badgeEarned'
  | 'alphaDefeated'
  | 'bossDefeated'
  | 'gearCollected'
  | 'itemCollected'
  | 'materialCollected'
  | 'gearEquipped'
  | 'recoveryUsed'
  | 'dailyRunCompleted'
  | 'leaderboardSubmitted'
  | 'pvpWon'
  | 'eliteOrAlphaDefeated'

export type GameEventPayload = {
  templateId?: string
  creatureName?: string
  regionId?: string
  nodeType?: string
  encounterKind?: string
  amount?: number
  masteryLevel?: number
  abilityId?: string
  gearId?: string
  itemId?: string
  badgeId?: string
  starterTypeId?: string
}

export type GameEventResult = {
  state: RetentionState
  newlyUnlockedAchievements: AchievementDefinition[]
  newArchiveEntries: string[]
}

const RETENTION_SLOT_KEY = (slot: 1 | 2) => `project-monolith-retention-slot-${slot}`

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function weekKey(): string {
  const d = new Date()
  const onejan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function msUntilMidnight(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}

function msUntilWeekEnd(): number {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day
  const end = new Date(now)
  end.setDate(now.getDate() + daysUntilSunday)
  end.setHours(23, 59, 59, 999)
  return end.getTime() - now.getTime()
}

export function formatTimeRemaining(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}

export function getDailyResetRemaining(): string {
  return formatTimeRemaining(msUntilMidnight())
}

export function getWeeklyResetRemaining(): string {
  return formatTimeRemaining(msUntilWeekEnd())
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    h = (Math.imul(1664525, h) + 1013904223) | 0
    const j = ((h >>> 0) % (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function emptyStats(): RetentionStats {
  return {
    battlesWon: 0,
    evolutions: 0,
    recruits: 0,
    alphaDefeated: 0,
    badgesEarned: 0,
    masteryLevel5: 0,
    masteryLevel10: 0,
    dailyQuestsCompleted: 0,
    pvpWins: 0,
    itemsCollected: 0,
  }
}

function defaultArchiveProgress(): Record<string, CreatureArchiveProgress> {
  const map: Record<string, CreatureArchiveProgress> = {}
  for (const e of CREATURE_ARCHIVE_ENTRIES) {
    map[e.creatureId] = { seen: false, recruited: false, evolved: false }
  }
  return map
}

function defaultAchievements(): Record<string, AchievementProgress> {
  const map: Record<string, AchievementProgress> = {}
  for (const a of ACHIEVEMENT_DEFINITIONS) {
    map[a.id] = {
      progress: 0,
      required: a.required,
      unlocked: false,
      claimed: false,
    }
  }
  return map
}

function defaultCollectionLog(): CollectionLogState {
  return {
    gear: {},
    consumables: {},
    materials: {},
    badges: {},
    regionsCleared: {},
    abilitiesTransformed: {},
    titles: [],
  }
}

export function createDefaultRetentionState(): RetentionState {
  return {
    dailyRewards: { lastClaimDate: null, currentStreak: 0, claimedToday: false },
    dailyQuests: { questDate: todayKey(), quests: [] },
    weeklyQuests: { weekKey: weekKey(), quests: [] },
    achievements: defaultAchievements(),
    creatureArchive: defaultArchiveProgress(),
    collectionLog: defaultCollectionLog(),
    titles: [],
    stats: emptyStats(),
    pendingRewards: { coins: 0, items: [], gearIds: [] },
    archiveLastViewedAt: null,
    newArchiveDiscoveries: 0,
  }
}

function pickDailyQuests(date: string): ArchiveQuestProgress[] {
  const picked = seededShuffle(DAILY_ARCHIVE_QUEST_POOL, `daily-${date}`).slice(0, 3)
  return picked.map((q) => ({
    questId: q.id,
    current: 0,
    required: q.required,
    completed: false,
    claimed: false,
  }))
}

function pickWeeklyQuests(key: string): ArchiveQuestProgress[] {
  const picked = seededShuffle(WEEKLY_ARCHIVE_QUEST_POOL, `weekly-${key}`).slice(0, 3)
  return picked.map((q) => ({
    questId: q.id,
    current: 0,
    required: q.required,
    completed: false,
    claimed: false,
  }))
}

export function normalizeRetentionState(raw?: Partial<RetentionState> | null): RetentionState {
  const base = createDefaultRetentionState()
  if (!raw || typeof raw !== 'object') {
    base.dailyQuests.quests = pickDailyQuests(todayKey())
    base.weeklyQuests.quests = pickWeeklyQuests(weekKey())
    return base
  }

  const today = todayKey()
  const wk = weekKey()

  let dailyQuests = raw.dailyQuests?.quests ?? []
  if (raw.dailyQuests?.questDate !== today || dailyQuests.length === 0) {
    dailyQuests = pickDailyQuests(today)
  }

  let weeklyQuests = raw.weeklyQuests?.quests ?? []
  if (raw.weeklyQuests?.weekKey !== wk || weeklyQuests.length === 0) {
    weeklyQuests = pickWeeklyQuests(wk)
  }

  const creatureArchive = { ...defaultArchiveProgress(), ...(raw.creatureArchive ?? {}) }
  const achievements = { ...defaultAchievements(), ...(raw.achievements ?? {}) }
  for (const a of ACHIEVEMENT_DEFINITIONS) {
    if (!achievements[a.id]) {
      achievements[a.id] = {
        progress: 0,
        required: a.required,
        unlocked: false,
        claimed: false,
      }
    }
  }

  const dailyRewards = raw.dailyRewards ?? base.dailyRewards
  const claimedToday =
    dailyRewards.lastClaimDate === today ? Boolean(dailyRewards.claimedToday) : false

  return {
    dailyRewards: {
      lastClaimDate: dailyRewards.lastClaimDate ?? null,
      currentStreak: Math.max(0, dailyRewards.currentStreak ?? 0),
      claimedToday,
    },
    dailyQuests: { questDate: today, quests: dailyQuests },
    weeklyQuests: { weekKey: wk, quests: weeklyQuests },
    achievements,
    creatureArchive,
    collectionLog: {
      ...defaultCollectionLog(),
      ...(raw.collectionLog ?? {}),
      gear: { ...base.collectionLog.gear, ...(raw.collectionLog?.gear ?? {}) },
      consumables: { ...base.collectionLog.consumables, ...(raw.collectionLog?.consumables ?? {}) },
      materials: { ...base.collectionLog.materials, ...(raw.collectionLog?.materials ?? {}) },
      badges: { ...base.collectionLog.badges, ...(raw.collectionLog?.badges ?? {}) },
      regionsCleared: { ...base.collectionLog.regionsCleared, ...(raw.collectionLog?.regionsCleared ?? {}) },
      abilitiesTransformed: {
        ...base.collectionLog.abilitiesTransformed,
        ...(raw.collectionLog?.abilitiesTransformed ?? {}),
      },
      titles: raw.collectionLog?.titles ?? raw.titles ?? [],
    },
    titles: raw.titles ?? raw.collectionLog?.titles ?? [],
    stats: { ...emptyStats(), ...(raw.stats ?? {}) },
    pendingRewards: {
      coins: raw.pendingRewards?.coins ?? 0,
      items: raw.pendingRewards?.items ?? [],
      gearIds: raw.pendingRewards?.gearIds ?? [],
    },
    archiveLastViewedAt: raw.archiveLastViewedAt ?? null,
    newArchiveDiscoveries: raw.newArchiveDiscoveries ?? 0,
  }
}

export function loadRetentionFromLocalSlot(slotId: 1 | 2): RetentionState {
  try {
    const raw = localStorage.getItem(RETENTION_SLOT_KEY(slotId))
    if (!raw) return normalizeRetentionState(null)
    return normalizeRetentionState(JSON.parse(raw) as Partial<RetentionState>)
  } catch {
    return createDefaultRetentionState()
  }
}

export function saveRetentionToLocalSlot(slotId: 1 | 2, state: RetentionState): void {
  try {
    localStorage.setItem(RETENTION_SLOT_KEY(slotId), JSON.stringify(state))
  } catch {
    // ignore
  }
}

function pickGearByRarity(rarity: GearRarity): string | undefined {
  const pool = GEAR_ITEM_LIST.filter((g) => g.rarity === rarity)
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]!.id
}

export function getDailyRewardPreview(streakDay: number): RetentionRewardGrant {
  const day = ((Math.max(1, streakDay) - 1) % 7) + 1
  switch (day) {
    case 1:
      return { coins: 50, items: [], gearIds: [], summary: '50 coins' }
    case 2:
      return { coins: 0, items: [{ itemId: 'small-potion', quantity: 2 }], gearIds: [], summary: '2× Small Potion' }
    case 3: {
      const gearId = pickGearByRarity('common')
      return { coins: 0, items: [], gearIds: gearId ? [gearId] : [], summary: gearId ? 'Random common gear' : 'Common gear (none available)' }
    }
    case 4:
      return { coins: 100, items: [], gearIds: [], summary: '100 coins' }
    case 5: {
      const gearId = pickGearByRarity(Math.random() < 0.5 ? 'uncommon' : 'rare')
      return { coins: 0, items: [], gearIds: gearId ? [gearId] : [], summary: 'Uncommon or rare gear chance' }
    }
    case 6:
      return { coins: 0, items: [{ itemId: 'monolith-fragment', quantity: 3 }], gearIds: [], summary: '3× Monolith Fragment' }
    case 7: {
      const gearId = pickGearByRarity(Math.random() < 0.35 ? 'epic' : 'rare')
      return { coins: 0, items: [], gearIds: gearId ? [gearId] : [], summary: 'Epic gear chest or rare gear' }
    }
    default:
      return { coins: 50, items: [], gearIds: [], summary: '50 coins' }
  }
}

export function claimDailyLoginReward(state: RetentionState): {
  state: RetentionState
  reward: RetentionRewardGrant
} {
  const today = todayKey()
  if (state.dailyRewards.claimedToday || state.dailyRewards.lastClaimDate === today) {
    return { state, reward: { coins: 0, items: [], gearIds: [], summary: 'Already claimed today' } }
  }

  let streak = 1
  if (state.dailyRewards.lastClaimDate) {
    const last = new Date(state.dailyRewards.lastClaimDate)
    const now = new Date(today)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000)
    if (diffDays === 1) {
      streak = state.dailyRewards.currentStreak >= 7 ? 1 : state.dailyRewards.currentStreak + 1
    } else if (diffDays === 0) {
      streak = state.dailyRewards.currentStreak || 1
    } else {
      streak = 1
    }
  }

  const reward = getDailyRewardPreview(streak)
  const next: RetentionState = {
    ...state,
    dailyRewards: {
      lastClaimDate: today,
      currentStreak: streak,
      claimedToday: true,
    },
    pendingRewards: mergePending(state.pendingRewards, reward),
  }
  return { state: next, reward }
}

function mergePending(
  pending: PendingRetentionRewards,
  reward: RetentionRewardGrant,
): PendingRetentionRewards {
  return {
    coins: pending.coins + reward.coins,
    items: [...pending.items, ...reward.items],
    gearIds: [...pending.gearIds, ...reward.gearIds],
  }
}

function scaleArchiveQuestReward(
  baseCoins: number,
  partyLevel: number,
  regionId: string,
): RetentionRewardGrant {
  const mult = 1 + Math.floor(partyLevel / 5) * 0.1
  const regionBonus = regionId.includes('3') ? 1.25 : regionId.includes('2') ? 1.1 : 1
  const coins = Math.round(baseCoins * mult * regionBonus)
  return { coins, items: [], gearIds: [], summary: `${coins} coins` }
}

export function getDailyQuestRewardPreview(
  questId: string,
  partyLevel: number,
  regionId: string,
): RetentionRewardGrant {
  const q = ARCHIVE_QUEST_BY_ID[questId]
  if (!q) return { coins: 0, items: [], gearIds: [], summary: '—' }
  if (q.weekly) {
    const coins = Math.round(200 + partyLevel * 15)
    const gearId = Math.random() < 0.4 ? pickGearByRarity('rare') : pickGearByRarity('uncommon')
    return {
      coins,
      items: [{ itemId: 'monolith-fragment', quantity: 2 }],
      gearIds: gearId ? [gearId] : [],
      summary: `${coins} coins, materials, gear chance`,
    }
  }
  const base = 30 + q.required * 8
  const grant = scaleArchiveQuestReward(base, partyLevel, regionId)
  if (Math.random() < 0.25) {
    grant.items.push({ itemId: 'small-potion', quantity: 1 })
    grant.summary += ', Small Potion'
  }
  return grant
}

export function claimArchiveQuest(
  state: RetentionState,
  questId: string,
  weekly: boolean,
  partyLevel: number,
  regionId: string,
): { state: RetentionState; reward: RetentionRewardGrant | null } {
  const list = weekly ? state.weeklyQuests.quests : state.dailyQuests.quests
  const entry = list.find((q) => q.questId === questId)
  if (!entry || !entry.completed || entry.claimed) {
    return { state, reward: null }
  }
  const reward = getDailyQuestRewardPreview(questId, partyLevel, regionId)
  const nextList = list.map((q) =>
    q.questId === questId ? { ...q, claimed: true } : q,
  )
  let nextState: RetentionState = {
    ...state,
    pendingRewards: mergePending(state.pendingRewards, reward),
    ...(weekly
      ? { weeklyQuests: { ...state.weeklyQuests, quests: nextList } }
      : { dailyQuests: { ...state.dailyQuests, quests: nextList } }),
  }
  if (!weekly) {
    nextState = {
      ...nextState,
      stats: {
        ...nextState.stats,
        dailyQuestsCompleted: nextState.stats.dailyQuestsCompleted + 1,
      },
    }
    nextState = syncAchievements(nextState).state
  }
  return { state: nextState, reward }
}

function grantAchievementReward(def: AchievementDefinition): RetentionRewardGrant {
  const r = def.reward
  if (r.type === 'coins') {
    return { coins: r.amount, items: [], gearIds: [], summary: `${r.amount} coins` }
  }
  if (r.type === 'title') {
    return { coins: 0, items: [], gearIds: [], titleId: r.titleId, summary: `Title: ${r.titleName}` }
  }
  const gearId = r.gearId ?? (r.random ? pickGearByRarity(r.rarity ?? 'uncommon') : undefined)
  return {
    coins: 0,
    items: [],
    gearIds: gearId ? [gearId] : [],
    summary: gearId ? 'Gear reward' : 'Gear reward (none rolled)',
  }
}

export function claimAchievement(
  state: RetentionState,
  achievementId: string,
): { state: RetentionState; reward: RetentionRewardGrant | null } {
  const prog = state.achievements[achievementId]
  const def = ACHIEVEMENT_BY_ID[achievementId]
  if (!prog || !def || !prog.unlocked || prog.claimed) {
    return { state, reward: null }
  }
  const reward = grantAchievementReward(def)
  let next: RetentionState = {
    ...state,
    achievements: {
      ...state.achievements,
      [achievementId]: { ...prog, claimed: true },
    },
    pendingRewards: mergePending(state.pendingRewards, reward),
  }
  if (reward.titleId && !next.titles.includes(reward.titleId)) {
    next = {
      ...next,
      titles: [...next.titles, reward.titleId],
      collectionLog: {
        ...next.collectionLog,
        titles: [...next.collectionLog.titles, reward.titleId],
      },
    }
  }
  return { state: next, reward }
}

function syncAchievements(state: RetentionState): GameEventResult {
  const newlyUnlocked: AchievementDefinition[] = []
  const achievements = { ...state.achievements }
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const prog = achievements[def.id] ?? {
      progress: 0,
      required: def.required,
      unlocked: false,
      claimed: false,
    }
    const statVal = state.stats[def.statKey] ?? 0
    const progress = Math.max(prog.progress, statVal)
    const unlocked = progress >= def.required
    if (unlocked && !prog.unlocked) newlyUnlocked.push(def)
    achievements[def.id] = {
      ...prog,
      progress,
      required: def.required,
      unlocked,
    }
  }
  const itemsCollected = countCollectionLog(state.collectionLog)
  const stats = { ...state.stats, itemsCollected }
  return {
    state: { ...state, achievements, stats },
    newlyUnlockedAchievements: newlyUnlocked,
    newArchiveEntries: [],
  }
}

function countCollectionLog(log: CollectionLogState): number {
  return (
    Object.keys(log.gear).length +
    Object.keys(log.consumables).length +
    Object.keys(log.materials).length
  )
}

function markArchiveSeen(
  state: RetentionState,
  creatureId: string,
  regionId?: string,
): { state: RetentionState; newlyDiscovered: boolean } {
  const prev = state.creatureArchive[creatureId] ?? { seen: false, recruited: false, evolved: false }
  if (prev.seen) return { state, newlyDiscovered: false }
  const next: RetentionState = {
    ...state,
    creatureArchive: {
      ...state.creatureArchive,
      [creatureId]: {
        ...prev,
        seen: true,
        regionFirstSeen: regionId ?? prev.regionFirstSeen,
      },
    },
    newArchiveDiscoveries: state.newArchiveDiscoveries + 1,
  }
  return { state: next, newlyDiscovered: true }
}

function updateQuestProgress(
  state: RetentionState,
  event: ArchiveQuestTrackEvent,
  amount: number,
  filter?: string,
): RetentionState {
  const bump = (quests: ArchiveQuestProgress[]) =>
    quests.map((q) => {
      const def = ARCHIVE_QUEST_BY_ID[q.questId]
      if (!def || def.event !== event) return q
      if (filter && def.filter && def.filter !== filter) return q
      const current = Math.min(q.required, q.current + amount)
      return {
        ...q,
        current,
        completed: current >= q.required,
      }
    })

  return {
    ...state,
    dailyQuests: {
      ...state.dailyQuests,
      quests: bump(state.dailyQuests.quests),
    },
    weeklyQuests: {
      ...state.weeklyQuests,
      quests: bump(state.weeklyQuests.quests),
    },
  }
}

export function trackGameEvent(
  state: RetentionState,
  event: GameEventType,
  payload: GameEventPayload = {},
): GameEventResult {
  let next = { ...state }
  const newArchiveEntries: string[] = []

  switch (event) {
    case 'enemySeen': {
      const entry =
        (payload.templateId && resolveArchiveEntryFromTemplate(payload.templateId)) ||
        (payload.starterTypeId && resolveArchiveEntryFromStarterId(payload.starterTypeId))
      if (entry) {
        const r = markArchiveSeen(next, entry.creatureId, payload.regionId)
        next = r.state
        if (r.newlyDiscovered) newArchiveEntries.push(entry.creatureId)
      }
      break
    }
    case 'battleWon':
      next = {
        ...next,
        stats: { ...next.stats, battlesWon: next.stats.battlesWon + 1 },
      }
      next = updateQuestProgress(next, 'battleWon', 1)
      break
    case 'nodeCleared':
      next = updateQuestProgress(next, 'nodeCleared', 1, payload.nodeType)
      if (payload.nodeType === 'event') {
        next = updateQuestProgress(next, 'eventCompleted', 1)
      }
      break
    case 'eventCompleted':
      next = updateQuestProgress(next, 'eventCompleted', 1)
      break
    case 'abilityUsed':
      next = updateQuestProgress(next, 'abilityUsed', 1)
      break
    case 'creatureRecruited': {
      next = {
        ...next,
        stats: { ...next.stats, recruits: next.stats.recruits + 1 },
      }
      next = updateQuestProgress(next, 'creatureRecruited', 1)
      if (payload.templateId) {
        const entry = resolveArchiveEntryFromTemplate(payload.templateId)
        if (entry) {
          const r = markArchiveSeen(next, entry.creatureId, payload.regionId)
          next = r.state
          next = {
            ...next,
            creatureArchive: {
              ...next.creatureArchive,
              [entry.creatureId]: {
                ...next.creatureArchive[entry.creatureId],
                recruited: true,
              },
            },
          }
        }
      }
      break
    }
    case 'creatureEvolved': {
      next = { ...next, stats: { ...next.stats, evolutions: next.stats.evolutions + 1 } }
      const entry = payload.creatureName
        ? resolveArchiveEntryFromName(payload.creatureName)
        : undefined
      if (entry) {
        const r = markArchiveSeen(next, entry.creatureId, payload.regionId)
        next = r.state
        next = {
          ...next,
          creatureArchive: {
            ...next.creatureArchive,
            [entry.creatureId]: {
              ...next.creatureArchive[entry.creatureId],
              seen: true,
              evolved: entry.familyOrder > 0,
            },
          },
        }
      }
      break
    }
    case 'abilityMasteryXp':
      next = updateQuestProgress(next, 'abilityMasteryXp', payload.amount ?? 0)
      break
    case 'abilityMasteryLevelReached':
      if ((payload.masteryLevel ?? 0) >= 5) {
        next = { ...next, stats: { ...next.stats, masteryLevel5: 1 } }
        next = updateQuestProgress(next, 'masteryLevelReached', payload.masteryLevel ?? 0)
      }
      if ((payload.masteryLevel ?? 0) >= 10) {
        next = { ...next, stats: { ...next.stats, masteryLevel10: 1 } }
      }
      break
    case 'abilityTransformed':
      if (payload.abilityId) {
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            abilitiesTransformed: {
              ...next.collectionLog.abilitiesTransformed,
              [payload.abilityId]: true,
            },
          },
        }
      }
      break
    case 'badgeEarned':
      next = {
        ...next,
        stats: { ...next.stats, badgesEarned: next.stats.badgesEarned + 1 },
      }
      next = updateQuestProgress(next, 'badgeEarned', 1)
      if (payload.badgeId) {
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            badges: { ...next.collectionLog.badges, [payload.badgeId]: true },
          },
        }
      }
      break
    case 'alphaDefeated':
      next = {
        ...next,
        stats: { ...next.stats, alphaDefeated: next.stats.alphaDefeated + 1 },
      }
      next = updateQuestProgress(next, 'alphaDefeated', 1)
      next = updateQuestProgress(next, 'eliteOrAlphaDefeated', 1)
      break
    case 'eliteOrAlphaDefeated':
      next = updateQuestProgress(next, 'eliteOrAlphaDefeated', 1)
      break
    case 'bossDefeated':
      if (payload.regionId) {
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            regionsCleared: {
              ...next.collectionLog.regionsCleared,
              [payload.regionId]: true,
            },
          },
        }
      }
      break
    case 'gearCollected':
      if (payload.gearId) {
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            gear: { ...next.collectionLog.gear, [payload.gearId]: true },
          },
        }
      }
      break
    case 'itemCollected':
      if (payload.itemId) {
        const def = ITEMS[payload.itemId]
        const bucket = def?.category === 'material' ? 'materials' : 'consumables'
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            [bucket]: { ...next.collectionLog[bucket], [payload.itemId]: true },
          },
        }
      }
      break
    case 'materialCollected':
      if (payload.itemId) {
        next = {
          ...next,
          collectionLog: {
            ...next.collectionLog,
            materials: { ...next.collectionLog.materials, [payload.itemId]: true },
          },
        }
      }
      break
    case 'gearEquipped':
      next = updateQuestProgress(next, 'gearEquipped', 1)
      break
    case 'recoveryUsed':
      next = updateQuestProgress(next, 'recoveryUsed', 1)
      break
    case 'dailyRunCompleted':
      next = updateQuestProgress(next, 'dailyRunCompleted', 1)
      break
    case 'leaderboardSubmitted':
      next = updateQuestProgress(next, 'leaderboardSubmitted', 1)
      break
    case 'pvpWon':
      next = {
        ...next,
        stats: { ...next.stats, pvpWins: next.stats.pvpWins + 1 },
      }
      next = updateQuestProgress(next, 'pvpWon', 1)
      break
    default:
      break
  }

  const synced = syncAchievements(next)
  return {
    state: synced.state,
    newlyUnlockedAchievements: synced.newlyUnlockedAchievements,
    newArchiveEntries,
  }
}

export function applyPendingRetentionRewards(
  starter: RunCreature,
  _recruits: PartyCreature[],
  inventory: TrainerInventory,
  pending: PendingRetentionRewards,
): {
  starter: RunCreature
  inventory: TrainerInventory
  cleared: PendingRetentionRewards
} {
  let nextStarter = pending.coins > 0 ? addCoins(starter, pending.coins) : starter
  let nextInv = inventory
  for (const item of pending.items) {
    nextInv = addItemToTrainerInventory(nextInv, item.itemId, item.quantity)
  }
  for (const gearId of pending.gearIds) {
    nextInv = addItemToTrainerInventory(nextInv, gearId, 1)
  }
  return {
    starter: nextStarter,
    inventory: nextInv,
    cleared: { coins: 0, items: [], gearIds: [] },
  }
}

export function hasRetentionNotifications(state: RetentionState): boolean {
  if (!state.dailyRewards.claimedToday && state.dailyRewards.lastClaimDate !== todayKey()) {
    return true
  }
  if (state.dailyQuests.quests.some((q) => q.completed && !q.claimed)) return true
  if (state.weeklyQuests.quests.some((q) => q.completed && !q.claimed)) return true
  if (
    Object.values(state.achievements).some((a) => a.unlocked && !a.claimed)
  ) {
    return true
  }
  if (state.newArchiveDiscoveries > 0) return true
  return false
}

export function markArchiveViewed(state: RetentionState): RetentionState {
  return {
    ...state,
    archiveLastViewedAt: new Date().toISOString(),
    newArchiveDiscoveries: 0,
  }
}

export function getArchiveSummary(state: RetentionState) {
  const total = CREATURE_ARCHIVE_ENTRIES.length
  let seen = 0
  let recruited = 0
  let evolved = 0
  for (const e of CREATURE_ARCHIVE_ENTRIES) {
    const p = state.creatureArchive[e.creatureId]
    if (p?.seen) seen++
    if (p?.recruited) recruited++
    if (p?.evolved) evolved++
  }
  return { total, seen, recruited, evolved }
}

export function getCollectionTotals() {
  return {
    gear: GEAR_ITEM_LIST.length,
    consumables: Object.values(ITEMS).filter((i) => i.category === 'consumable').length,
    materials: Object.values(ITEMS).filter((i) => i.category === 'material').length,
    badges: Object.keys(BADGES_BY_ID).length,
  }
}

export function getScaledQuestContext(
  starter: RunCreature | null,
  recruits: PartyCreature[],
  regionId: string,
): { partyLevel: number; regionId: string } {
  return {
    partyLevel: starter ? getPartyHighestLevel(starter, recruits) : 1,
    regionId,
  }
}

export function getNextDailyStreakDay(state: RetentionState): number {
  if (state.dailyRewards.claimedToday) {
    return state.dailyRewards.currentStreak >= 7 ? 1 : state.dailyRewards.currentStreak + 1
  }
  if (!state.dailyRewards.lastClaimDate) return 1
  const last = new Date(state.dailyRewards.lastClaimDate)
  const today = new Date(todayKey())
  const diff = Math.floor((today.getTime() - last.getTime()) / 86400000)
  if (diff === 1) {
    return state.dailyRewards.currentStreak >= 7 ? 1 : state.dailyRewards.currentStreak + 1
  }
  return 1
}

export function rollRegionGearOffer(regionId: string): string | undefined {
  const offers = rollShopGearOffers(regionId)
  return offers[0]
}
