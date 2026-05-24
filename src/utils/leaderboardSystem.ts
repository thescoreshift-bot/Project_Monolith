import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import {
  ensurePlayerProfile,
  normalizeDisplayName,
  PROFILE_TABLE_MISSING_MESSAGE,
} from './profileSystem'
import type { RunScoreSnapshot } from './runScore'
import type { RunCreature } from './progression'
import type { PartyCreature } from './party'
import { buildFinalTeamJson } from './runScore'
import { getPartyHighestLevel } from './regionRewards'
import type { DailyCheckpoint } from './dailyRunScoring'
import { formatCheckpointLabel, compareCheckpoints } from './dailyRunScoring'

import { getDailySeed } from './dailyRun'
import {
  loadEnvelopeFromSlot,
  type SaveSlotId,
} from './saveSystem'
import { resolveSaveDisplayName } from './saveSlotMeta'

export function getDailyLeaderboardSeed(date = new Date()): string {
  return getDailySeed(date)
}

export function getCampaignLeaderboardSeed(slotId: SaveSlotId): string {
  return `campaign-slot-${slotId}`
}

export function isCampaignLeaderboardSeed(seed: string): boolean {
  return seed.startsWith('campaign-slot-')
}

export function formatLeaderboardSeedLabel(seed: string): string {
  if (isCampaignLeaderboardSeed(seed)) {
    const slot = seed.replace('campaign-slot-', '')
    return `Campaign · Save Slot ${slot}`
  }
  if (seed.startsWith('daily-')) {
    return `Daily · ${seed.replace('daily-', '')}`
  }
  return seed
}

export type LeaderboardCheckpointMeta = {
  nodesCleared: number
  bossesDefeated: number
  checkpointLabel: string
}

export function buildLeaderboardTeamPayload(
  starter: RunCreature,
  recruits: PartyCreature[],
  checkpoint?: DailyCheckpoint | null,
): { name: string; type: string; level: number }[] {
  const team = buildFinalTeamJson(starter, recruits)
  if (!checkpoint) return team
  const meta: LeaderboardCheckpointMeta = {
    nodesCleared: checkpoint.nodesCleared,
    bossesDefeated: checkpoint.bossesDefeated,
    checkpointLabel: formatCheckpointLabel(checkpoint),
  }
  return [
    ...team,
    {
      name: '__meta__',
      type: JSON.stringify(meta),
      level: checkpoint.highestLevel,
    },
  ]
}

export function parseLeaderboardCheckpointMeta(
  finalTeam: LeaderboardRow['final_team'],
): LeaderboardCheckpointMeta | null {
  if (!finalTeam) return null
  const meta = finalTeam.find((m) => m.name === '__meta__')
  if (!meta) return null
  try {
    return JSON.parse(meta.type) as LeaderboardCheckpointMeta
  } catch {
    return null
  }
}

export type LeaderboardRow = {
  id: string
  user_id: string
  display_name: string
  daily_seed: string
  score: number
  region: string | null
  starter_name: string | null
  final_team: { name: string; type: string; level: number }[] | null
  badges_earned: number
  highest_level: number
  evolutions_count: number
  completed: boolean
  created_at: string
  updated_at: string
  slot_id?: number | null
  save_name?: string | null
  trainer_name?: string | null
  run_id?: string | null
  nodes_cleared?: number | null
  bosses_defeated?: number | null
}

export type LeaderboardSubmitSlot = {
  slotId: SaveSlotId
  saveName: string
  trainerName: string
}

export function resolveLeaderboardSubmitSlot(
  slotId: SaveSlotId,
): LeaderboardSubmitSlot {
  const envelope = loadEnvelopeFromSlot(slotId)
  const saveName = resolveSaveDisplayName(
    slotId,
    envelope?.saveName,
    envelope?.trainerName,
  )
  const trainerName =
    envelope?.trainerName?.trim() || envelope?.saveName?.trim() || saveName
  return { slotId, saveName, trainerName }
}

export function buildLeaderboardRunId(
  userId: string,
  seed: string,
  slotId: SaveSlotId,
): string {
  return `${userId}-${seed}-${slotId}`
}

export function formatLeaderboardSaveName(row: LeaderboardRow): string {
  const name = row.save_name?.trim() || row.trainer_name?.trim()
  return name || 'Unnamed Save'
}

const TABLE = 'daily_leaderboards'

export const LEADERBOARD_TABLE_MISSING_MESSAGE =
  'Leaderboard table is not set up yet. Please run the Supabase setup SQL in SUPABASE_SETUP.md (daily_leaderboards section).'

const NO_ACTIVE_SLOT_MESSAGE =
  'No active save slot selected. Load or create a save first.'

function isTableMissingError(error: {
  code?: string
  message?: string
} | null | undefined): boolean {
  if (!error) return false
  const msg = (error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST205' ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  )
}

function isMissingColumnError(error: {
  code?: string
  message?: string
} | null | undefined): boolean {
  if (!error) return false
  const msg = (error.message ?? '').toLowerCase()
  return (
    msg.includes('slot_id') ||
    msg.includes('save_name') ||
    msg.includes('column') ||
    error.code === 'PGRST204'
  )
}

export type LeaderboardFetchResult = {
  rows: LeaderboardRow[]
  error?: string
  tableMissing?: boolean
}

export async function fetchLeaderboard(
  dailySeed: string,
  limit = 50,
): Promise<LeaderboardFetchResult> {
  if (!supabase) {
    return { rows: [] }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('daily_seed', dailySeed)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) {
    if (isTableMissingError(error)) {
      return {
        rows: [],
        error: LEADERBOARD_TABLE_MISSING_MESSAGE,
        tableMissing: true,
      }
    }
    return { rows: [], error: error.message }
  }

  return { rows: (data ?? []) as LeaderboardRow[] }
}

export async function fetchPlayerLeaderboardEntry(
  dailySeed: string,
  slotId?: SaveSlotId | null,
): Promise<LeaderboardRow | null> {
  if (!supabase) return null
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('daily_seed', dailySeed)
    .eq('user_id', userData.user.id)

  if (slotId != null) {
    query = query.eq('slot_id', slotId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    if (slotId != null && isMissingColumnError(error)) {
      const { data: legacy } = await supabase
        .from(TABLE)
        .select('*')
        .eq('daily_seed', dailySeed)
        .eq('user_id', userData.user.id)
        .maybeSingle()
      return (legacy as LeaderboardRow) ?? null
    }
    return null
  }
  if (!data) return null
  return data as LeaderboardRow
}

export type SubmitLeaderboardResult = {
  ok: boolean
  error?: string
  keptPrevious?: boolean
  needsProfile?: boolean
  tableMissing?: boolean
}

export async function submitLeaderboardScore(params: {
  seed: string
  scoreSnapshot: RunScoreSnapshot
  regionId: string
  starter: RunCreature
  recruits: PartyCreature[]
  badgesEarned: number
  evolutionsCount: number
  checkpoint?: DailyCheckpoint | null
  forceBestScore?: number
  displayName?: string
  slotId?: SaveSlotId | null
  saveName?: string
  trainerName?: string
}): Promise<SubmitLeaderboardResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured.' }
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'Login required to submit to leaderboard.' }
  }

  if (params.slotId == null) {
    return { ok: false, error: NO_ACTIVE_SLOT_MESSAGE }
  }

  const slotCtx =
    params.saveName && params.trainerName
      ? {
          slotId: params.slotId,
          saveName: params.saveName,
          trainerName: params.trainerName,
        }
      : resolveLeaderboardSubmitSlot(params.slotId)

  let displayName = params.displayName?.trim()
  if (!displayName) {
    const profileResult = await ensurePlayerProfile()
    if (!profileResult.ok) {
      return {
        ok: false,
        error: profileResult.error,
        needsProfile: profileResult.needsSetup,
        tableMissing: profileResult.tableMissing,
      }
    }
    displayName = profileResult.profile.display_name
  }

  displayName = normalizeDisplayName(displayName)
  if (!displayName || displayName.length < 3) {
    return {
      ok: false,
      error: 'Create a trainer name before submitting scores.',
      needsProfile: true,
    }
  }

  const newScore = params.forceBestScore ?? params.scoreSnapshot.total
  const existing = await fetchPlayerLeaderboardEntry(params.seed, slotCtx.slotId)
  if (existing) {
    const existingMeta = parseLeaderboardCheckpointMeta(existing.final_team)
    const existingCheckpoint: DailyCheckpoint | null = existingMeta
      ? {
          region: existing.region ?? params.regionId,
          regionNumber: 1,
          badgesEarned: existing.badges_earned,
          nodesCleared: existingMeta.nodesCleared,
          bossesDefeated: existingMeta.bossesDefeated,
          highestLevel: existing.highest_level,
          evolutionsCount: existing.evolutions_count,
        }
      : null
    const newCheckpoint = params.checkpoint ?? null
    const scoreWorse = newScore < existing.score
    const checkpointWorse =
      newCheckpoint && existingCheckpoint
        ? compareCheckpoints(newCheckpoint, existingCheckpoint) <= 0
        : scoreWorse
    if (scoreWorse && checkpointWorse) {
      return { ok: true, keptPrevious: true }
    }
    if (newScore <= existing.score && newCheckpoint && existingCheckpoint) {
      if (compareCheckpoints(newCheckpoint, existingCheckpoint) <= 0) {
        return { ok: true, keptPrevious: true }
      }
    } else if (newScore < existing.score) {
      return { ok: true, keptPrevious: true }
    }
  }

  const checkpointMeta = params.checkpoint
    ? {
        nodes_cleared: params.checkpoint.nodesCleared,
        bosses_defeated: params.checkpoint.bossesDefeated,
      }
    : {
        nodes_cleared: existing?.nodes_cleared ?? 0,
        bosses_defeated: existing?.bosses_defeated ?? 0,
      }

  const finalScore = Math.max(newScore, existing?.score ?? 0)
  const runId = buildLeaderboardRunId(userData.user.id, params.seed, slotCtx.slotId)

  console.log('Submitting leaderboard', {
    userId: userData.user.id,
    displayName,
    slotId: slotCtx.slotId,
    saveName: slotCtx.saveName,
    trainerName: slotCtx.trainerName,
    dailySeed: params.seed,
    score: newScore,
    bestScore: finalScore,
  })

  const payload = {
    user_id: userData.user.id,
    display_name: displayName,
    daily_seed: params.seed,
    slot_id: slotCtx.slotId,
    save_name: slotCtx.saveName,
    trainer_name: slotCtx.trainerName,
    run_id: runId,
    score: finalScore,
    region: params.checkpoint?.region ?? params.regionId,
    starter_name: params.starter.name,
    final_team: buildLeaderboardTeamPayload(
      params.starter,
      params.recruits,
      params.checkpoint,
    ),
    badges_earned: params.checkpoint?.badgesEarned ?? params.badgesEarned,
    highest_level:
      params.checkpoint?.highestLevel ??
      getPartyHighestLevel(params.starter, params.recruits),
    evolutions_count:
      params.checkpoint?.evolutionsCount ?? params.evolutionsCount,
    completed: params.scoreSnapshot.completed,
    nodes_cleared: checkpointMeta.nodes_cleared,
    bosses_defeated: checkpointMeta.bosses_defeated,
    updated_at: new Date().toISOString(),
  }

  let { error } = await supabase.from(TABLE).upsert(payload, {
    onConflict: 'user_id,daily_seed,slot_id',
  })

  if (error && isMissingColumnError(error)) {
    const legacyPayload = {
      user_id: payload.user_id,
      display_name: payload.display_name,
      daily_seed: payload.daily_seed,
      score: payload.score,
      region: payload.region,
      starter_name: payload.starter_name,
      final_team: payload.final_team,
      badges_earned: payload.badges_earned,
      highest_level: payload.highest_level,
      evolutions_count: payload.evolutions_count,
      completed: payload.completed,
      updated_at: payload.updated_at,
    }
    ;({ error } = await supabase.from(TABLE).upsert(legacyPayload, {
      onConflict: 'user_id,daily_seed',
    }))
  }

  if (error) {
    console.error('Leaderboard submit failed', error)
    if (isTableMissingError(error)) {
      return {
        ok: false,
        error: LEADERBOARD_TABLE_MISSING_MESSAGE,
        tableMissing: true,
      }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true, keptPrevious: false }
}

export async function submitDailyLeaderboardScore(params: {
  dailySeed: string
  scoreSnapshot: RunScoreSnapshot
  regionId: string
  starter: RunCreature
  recruits: PartyCreature[]
  badgesEarned: number
  evolutionsCount: number
  checkpoint?: DailyCheckpoint | null
  forceBestScore?: number
  displayName?: string
  slotId: SaveSlotId
  saveName?: string
  trainerName?: string
}): Promise<SubmitLeaderboardResult> {
  return submitLeaderboardScore({
    seed: params.dailySeed,
    scoreSnapshot: params.scoreSnapshot,
    regionId: params.regionId,
    starter: params.starter,
    recruits: params.recruits,
    badgesEarned: params.badgesEarned,
    evolutionsCount: params.evolutionsCount,
    checkpoint: params.checkpoint,
    forceBestScore: params.forceBestScore,
    displayName: params.displayName,
    slotId: params.slotId,
    saveName: params.saveName,
    trainerName: params.trainerName,
  })
}

export function getPlayerRank(
  rows: LeaderboardRow[],
  userId: string | undefined,
  slotId?: SaveSlotId | null,
): number | null {
  if (!userId) return null
  const index = rows.findIndex(
    (r) =>
      r.user_id === userId &&
      (slotId == null || r.slot_id == null || r.slot_id === slotId),
  )
  return index >= 0 ? index + 1 : null
}

export { PROFILE_TABLE_MISSING_MESSAGE, NO_ACTIVE_SLOT_MESSAGE }
