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
  /** Optional override; otherwise loaded from player profile. */
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

  const newScore = params.scoreSnapshot.total
  const existing = await fetchPlayerLeaderboardEntry(params.dailySeed)
  if (existing && existing.score >= newScore) {
    return { ok: true, keptPrevious: true }
  }

  const payload = {
    user_id: userData.user.id,
    display_name: displayName,
    daily_seed: params.dailySeed,
    score: newScore,
    region: params.regionId,
    starter_name: params.starter.name,
    final_team: buildFinalTeamJson(params.starter, params.recruits),
    badges_earned: params.badgesEarned,
    highest_level: getPartyHighestLevel(params.starter, params.recruits),
    evolutions_count: params.evolutionsCount,
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
