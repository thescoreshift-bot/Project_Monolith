import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export type PlayerProfile = {
  id: string
  user_id: string
  display_name: string
  tutorial_completed?: boolean
  created_at: string
  updated_at: string
}

const TABLE = 'player_profiles'

export const PROFILE_TABLE_MISSING_MESSAGE =
  'Online profile table is not set up yet. Please run the Supabase setup SQL in SUPABASE_SETUP.md (player_profiles section).'

export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function validateDisplayName(name: string): string | null {
  const trimmed = normalizeDisplayName(name)
  if (!trimmed) {
    return 'Trainer name cannot be empty.'
  }
  if (trimmed.length < 3 || trimmed.length > 16) {
    return 'Trainer name must be 3–16 characters.'
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(trimmed)) {
    return 'Use only letters, numbers, spaces, underscores, and hyphens.'
  }
  return null
}

export function isTableMissingError(error: {
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

function mapProfileError(error: { code?: string; message?: string }): string {
  if (isTableMissingError(error)) {
    return PROFILE_TABLE_MISSING_MESSAGE
  }
  if (error.code === '23505') {
    return 'That trainer name is already taken. Try another.'
  }
  return error.message ?? 'Something went wrong. Please try again.'
}

export type GetPlayerProfileResult = {
  profile: PlayerProfile | null
  error?: string
  tableMissing?: boolean
}

export async function getPlayerProfile(): Promise<GetPlayerProfileResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { profile: null }
  }

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData.user) {
    return { profile: null }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (error) {
    const tableMissing = isTableMissingError(error)
    return {
      profile: null,
      error: mapProfileError(error),
      tableMissing,
    }
  }

  return { profile: data ? (data as PlayerProfile) : null }
}

export type ProfileActionResult =
  | { ok: true; profile: PlayerProfile }
  | {
      ok: false
      error: string
      tableMissing?: boolean
      duplicateName?: boolean
    }

export async function createPlayerProfile(
  displayName: string,
): Promise<ProfileActionResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const validation = validateDisplayName(displayName)
  if (validation) {
    return { ok: false, error: validation }
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'You must be logged in to create a trainer name.' }
  }

  const trimmed = normalizeDisplayName(displayName)

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userData.user.id,
      display_name: trimmed,
    })
    .select()
    .single()

  if (error) {
    const tableMissing = isTableMissingError(error)
    const duplicateName = error.code === '23505'
    return {
      ok: false,
      error: mapProfileError(error),
      tableMissing,
      duplicateName,
    }
  }

  return { ok: true, profile: data as PlayerProfile }
}

export async function updatePlayerDisplayName(
  displayName: string,
): Promise<ProfileActionResult> {
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const validation = validateDisplayName(displayName)
  if (validation) {
    return { ok: false, error: validation }
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { ok: false, error: 'You must be logged in to change your trainer name.' }
  }

  const trimmed = normalizeDisplayName(displayName)

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      display_name: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userData.user.id)
    .select()
    .single()

  if (error) {
    const tableMissing = isTableMissingError(error)
    const duplicateName = error.code === '23505'
    return {
      ok: false,
      error: mapProfileError(error),
      tableMissing,
      duplicateName,
    }
  }

  return { ok: true, profile: data as PlayerProfile }
}

export async function ensurePlayerProfile(): Promise<
  | { ok: true; profile: PlayerProfile }
  | { ok: false; error: string; tableMissing?: boolean; needsSetup?: boolean }
> {
  const result = await getPlayerProfile()
  if (result.tableMissing) {
    return {
      ok: false,
      error: result.error ?? PROFILE_TABLE_MISSING_MESSAGE,
      tableMissing: true,
    }
  }
  if (result.error && !result.profile) {
    return { ok: false, error: result.error }
  }
  if (!result.profile) {
    return {
      ok: false,
      error: 'Create a trainer name to use online features.',
      needsSetup: true,
    }
  }
  return { ok: true, profile: result.profile }
}

export async function setProfileTutorialCompleted(
  completed: boolean,
): Promise<void> {
  if (!supabase) return
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return

  const { error } = await supabase
    .from(TABLE)
    .update({
      tutorial_completed: completed,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userData.user.id)

  if (isTableMissingError(error)) return
}
