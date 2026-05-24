import type { ElementType } from '../data/starters'
import type { Enemy } from '../data/enemies'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { ensurePlayerProfile } from './profileSystem'
import { getActiveAbilityIds } from './creatureAbilities'
import { getPartyHighestLevel } from './regionRewards'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type PvpTeamCreatureSnapshot = {
  id: string
  name: string
  type: ElementType
  level: number
  maxHp: number
  stats: {
    atk: number
    def: number
    spAtk: number
    spDef: number
    spd: number
  }
  abilityIds: string[]
  equippedGearId?: string | null
  selectedPerks?: string[]
}

export type PvpTeamSnapshot = {
  starter: PvpTeamCreatureSnapshot
  recruits: PvpTeamCreatureSnapshot[]
  activeHelperId: string | null
}

export type PvpChallenge = {
  id: string
  code: string
  creator_user_id: string
  creator_display_name: string
  team_snapshot: PvpTeamSnapshot
  team_power: number
  region: string | null
  highest_level: number
  badges_count: number
  wins: number
  losses: number
  created_at: string
  updated_at: string
  expires_at: string | null
}

const TABLE = 'pvp_challenges'

export const PVP_TABLE_MISSING_MESSAGE =
  'PvP challenge table is not set up yet. Run the pvp_challenges SQL in SUPABASE_SETUP.md.'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCodeSuffix(length = 4): string {
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return out
}

export function generateFriendCode(): string {
  return `MONO-${randomCodeSuffix(4)}`
}

export function normalizeFriendCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

function snapshotFromCreature(
  creature: RunCreature | PartyCreature,
  id: string,
): PvpTeamCreatureSnapshot {
  return {
    id,
    name: creature.name,
    type: creature.type,
    level: creature.level,
    maxHp: creature.maxHp,
    stats: {
      atk: creature.stats.atk,
      def: creature.stats.def,
      spAtk: creature.stats.spAtk,
      spDef: creature.stats.spDef,
      spd: creature.stats.spd,
    },
    abilityIds: getActiveAbilityIds(creature),
    equippedGearId: creature.equippedGearId ?? null,
    selectedPerks: 'selectedPerks' in creature ? creature.selectedPerks : [],
  }
}

export function buildTeamSnapshotFromRun(
  starter: RunCreature,
  recruits: PartyCreature[],
  activeHelperId: string | null,
): PvpTeamSnapshot {
  return {
    starter: snapshotFromCreature(starter, 'starter'),
    recruits: recruits.map((r) => snapshotFromCreature(r, r.id)),
    activeHelperId,
  }
}

export function calculateTeamPower(snapshot: PvpTeamSnapshot): number {
  const all = [snapshot.starter, ...snapshot.recruits]
  return all.reduce((sum, c) => {
    const statTotal =
      c.stats.atk + c.stats.def + c.stats.spAtk + c.stats.spDef + c.stats.spd
    return sum + c.level * 8 + statTotal + c.maxHp
  }, 0)
}

export function buildGauntletEnemies(snapshot: PvpTeamSnapshot): Enemy[] {
  const fighters = [snapshot.starter, ...snapshot.recruits].slice(0, 3)
  return fighters.map((creature, index) => enemyFromPvpSnapshot(creature, index))
}

export function enemyFromPvpSnapshot(
  creature: PvpTeamCreatureSnapshot,
  index: number,
): Enemy {
  return {
    id: `pvp-${creature.id}-${index}`,
    name: creature.name,
    type: creature.type,
    kind: 'trainer',
    level: creature.level,
    maxHp: creature.maxHp,
    currentHp: creature.maxHp,
    stats: { ...creature.stats },
    abilityIds:
      creature.abilityIds.length > 0 ? creature.abilityIds : ['tackle'],
    recruitable: false,
  }
}

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

export type PvpChallengeResult = {
  ok: boolean
  challenge?: PvpChallenge
  error?: string
  tableMissing?: boolean
}

function mapChallengeRow(row: Record<string, unknown>): PvpChallenge {
  return {
    id: String(row.id),
    code: String(row.code),
    creator_user_id: String(row.creator_user_id),
    creator_display_name: String(row.creator_display_name),
    team_snapshot: row.team_snapshot as PvpTeamSnapshot,
    team_power: Number(row.team_power ?? 0),
    region: row.region != null ? String(row.region) : null,
    highest_level: Number(row.highest_level ?? 1),
    badges_count: Number(row.badges_count ?? 0),
    wins: Number(row.wins ?? 0),
    losses: Number(row.losses ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    expires_at: row.expires_at != null ? String(row.expires_at) : null,
  }
}

export async function fetchMyActivePvpChallenge(): Promise<PvpChallengeResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured.' }
  }
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'Login required for friend codes.' }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('creator_user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isTableMissingError(error)) {
      return { ok: false, error: PVP_TABLE_MISSING_MESSAGE, tableMissing: true }
    }
    return { ok: false, error: error.message }
  }
  if (!data) return { ok: true }
  return { ok: true, challenge: mapChallengeRow(data as Record<string, unknown>) }
}

export async function fetchPvpChallengeByCode(
  rawCode: string,
): Promise<PvpChallengeResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured.' }
  }
  const code = normalizeFriendCodeInput(rawCode)
  if (!code) return { ok: false, error: 'Enter a friend code.' }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    if (isTableMissingError(error)) {
      return { ok: false, error: PVP_TABLE_MISSING_MESSAGE, tableMissing: true }
    }
    return { ok: false, error: error.message }
  }
  if (!data) return { ok: false, error: 'Friend code not found.' }
  return { ok: true, challenge: mapChallengeRow(data as Record<string, unknown>) }
}

export async function createPvpChallenge(params: {
  starter: RunCreature
  recruits: PartyCreature[]
  activeHelperId: string | null
  regionId: string
  badgesCount: number
}): Promise<PvpChallengeResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured.' }
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'Login required to generate a friend code.' }
  }

  const profileResult = await ensurePlayerProfile()
  if (!profileResult.ok) {
    return { ok: false, error: profileResult.error }
  }

  const teamSnapshot = buildTeamSnapshotFromRun(
    params.starter,
    params.recruits,
    params.activeHelperId,
  )
  const teamPower = calculateTeamPower(teamSnapshot)
  const highestLevel = getPartyHighestLevel(params.starter, params.recruits)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  let lastError: string | undefined
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateFriendCode()
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        code,
        creator_user_id: userData.user.id,
        creator_display_name: profileResult.profile.display_name,
        team_snapshot: teamSnapshot,
        team_power: teamPower,
        region: params.regionId,
        highest_level: highestLevel,
        badges_count: params.badgesCount,
        expires_at: expiresAt,
      })
      .select('*')
      .single()

    if (!error && data) {
      return {
        ok: true,
        challenge: mapChallengeRow(data as Record<string, unknown>),
      }
    }
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      if (isTableMissingError(error)) {
        return { ok: false, error: PVP_TABLE_MISSING_MESSAGE, tableMissing: true }
      }
      lastError = error.message
      break
    }
    lastError = error?.message
  }

  return { ok: false, error: lastError ?? 'Could not create friend code.' }
}

export function summarizePvpTeam(snapshot: PvpTeamSnapshot): string {
  const names = [snapshot.starter, ...snapshot.recruits]
    .slice(0, 3)
    .map((c) => `${c.name} (Lv.${c.level})`)
  return names.join(' · ')
}
