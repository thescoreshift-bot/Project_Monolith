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
}

const TABLE = 'daily_leaderboards'

export const LEADERBOARD_TABLE_MISSING_MESSAGE =
  'Leaderboard table is not set up yet. Please run the Supabase setup SQL in SUPABASE_SETUP.md (daily_leaderboards section).'

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
): Promise<LeaderboardRow | null> {
  if (!supabase) return null
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('daily_seed', dailySeed)
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as LeaderboardRow
}

export type SubmitLeaderboardResult = {
  ok: boolean
  error?: string
  keptPrevious?: boolean
  needsProfile?: boolean
  tableMissing?: boolean
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
  /** Submit this score even if lower (must still beat existing on score or checkpoint). */
  forceBestScore?: number
  displayName?: string
}): Promise<SubmitLeaderboardResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured.' }
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'Login required to submit to leaderboard.' }
  }

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
  const existing = await fetchPlayerLeaderboardEntry(params.dailySeed)
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

  const payload = {
    user_id: userData.user.id,
    display_name: displayName,
    daily_seed: params.dailySeed,
    score: Math.max(newScore, existing?.score ?? 0),
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
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from(TABLE).upsert(payload, {
    onConflict: 'user_id,daily_seed',
  })

  if (error) {
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

export function getPlayerRank(
  rows: LeaderboardRow[],
  userId: string | undefined,
): number | null {
  if (!userId) return null
  const index = rows.findIndex((r) => r.user_id === userId)
  return index >= 0 ? index + 1 : null
}

export { PROFILE_TABLE_MISSING_MESSAGE }
