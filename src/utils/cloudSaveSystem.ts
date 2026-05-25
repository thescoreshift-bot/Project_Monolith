import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { resolveSaveDisplayName } from './saveSlotMeta'
import {
  SAVE_VERSION,
  buildSaveSlotSummary,
  loadEnvelopeFromSlot,
  parseAndNormalizeSaveData,
  type MonolithSaveEnvelope,
  type RunSaveData,
  type SaveSlotId,
  type SaveSlotSummary,
} from './saveSystem'

export type { MonolithSaveEnvelope, SaveSlotId, SaveSlotSummary }

const TABLE = 'game_saves'

function isSaveEnvelope(
  value: MonolithSaveEnvelope | RunSaveData,
): value is MonolithSaveEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'slotId' in value &&
    'saveVersion' in value
  )
}

type GameSaveRow = {
  id: string
  user_id: string
  slot_id: number
  save_name: string | null
  save_data: unknown
  created_at: string
  updated_at: string
}

export function buildSaveEnvelope(
  slotId: SaveSlotId,
  saveData: RunSaveData,
  options?: {
    saveName?: string
    trainerName?: string
    createdAt?: string
    lastPlayed?: string
  },
): MonolithSaveEnvelope {
  const local = loadEnvelopeFromSlot(slotId)
  const saveName = resolveSaveDisplayName(
    slotId,
    options?.saveName ?? local?.saveName,
    options?.trainerName ?? local?.trainerName,
  )
  const trainerName =
    options?.trainerName?.trim() ||
    options?.saveName?.trim() ||
    local?.trainerName?.trim() ||
    local?.saveName?.trim() ||
    saveName
  return {
    saveVersion: SAVE_VERSION,
    slotId,
    lastPlayed: options?.lastPlayed ?? new Date().toISOString(),
    saveName,
    trainerName,
    createdAt: options?.createdAt ?? local?.createdAt ?? new Date().toISOString(),
    data: saveData,
  }
}

function rowToSummary(row: GameSaveRow): SaveSlotSummary {
  const normalized = parseEnvelope(row.save_data)
  if (!normalized) {
    return buildSaveSlotSummary(row.slot_id as SaveSlotId, null)
  }
  return buildSaveSlotSummary(row.slot_id as SaveSlotId, normalized.data, {
    lastPlayed: normalized.lastPlayed,
    saveName: normalized.saveName ?? row.save_name ?? undefined,
    trainerName: normalized.trainerName ?? normalized.saveName,
    createdAt: normalized.createdAt,
  })
}

function parseEnvelope(raw: unknown): MonolithSaveEnvelope | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.data !== undefined) {
    const slotId = (obj.slotId === 1 || obj.slotId === 2 ? obj.slotId : 1) as SaveSlotId
    const data = parseAndNormalizeSaveData(obj.data)
    if (!data) return null
    const saveName = resolveSaveDisplayName(
      slotId,
      typeof obj.saveName === 'string' ? obj.saveName : undefined,
      typeof obj.trainerName === 'string' ? obj.trainerName : undefined,
    )
    const trainerName =
      (typeof obj.trainerName === 'string' ? obj.trainerName : undefined)?.trim() ||
      saveName
    return {
      saveVersion: typeof obj.saveVersion === 'number' ? obj.saveVersion : SAVE_VERSION,
      slotId,
      lastPlayed:
        typeof obj.lastPlayed === 'string' ? obj.lastPlayed : new Date().toISOString(),
      saveName,
      trainerName,
      createdAt:
        typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
      data,
    }
  }
  const legacy = parseAndNormalizeSaveData(raw)
  if (!legacy) return null
  return buildSaveEnvelope(1, legacy)
}

function isRlsPolicyError(message: string): boolean {
  return message.toLowerCase().includes('row-level security')
}

function formatCloudSaveError(message: string): string {
  if (isRlsPolicyError(message)) {
    return (
      'Cloud save was blocked by database security (RLS). Sign out, sign in again, then retry. ' +
      'If it still fails, run the game_saves RLS SQL in SUPABASE_SETUP.md in your Supabase SQL Editor.'
    )
  }
  return message
}

/** Requires a live JWT session (not just a cached user) so RLS sees auth.uid(). */
async function requireAuthenticatedUserId(): Promise<
  { userId: string } | { error: string }
> {
  if (!supabase) return { error: 'Supabase not configured' }

  let session = (await supabase.auth.getSession()).data.session
  if (!session?.user) {
    const refreshed = await supabase.auth.refreshSession()
    session = refreshed.data.session
  }
  if (!session?.user) {
    return { error: 'Not logged in. Sign in again before using cloud saves.' }
  }
  if (!session.access_token) {
    return { error: 'Session expired. Sign out and sign in again.' }
  }
  return { userId: session.user.id }
}

export async function getCloudSaveSlot(
  slotId: SaveSlotId,
): Promise<MonolithSaveEnvelope | null> {
  const result = await getCloudSaveSlotResult(slotId)
  return result.envelope
}

export async function getCloudSaveSlotResult(
  slotId: SaveSlotId,
): Promise<{ envelope: MonolithSaveEnvelope | null; error?: string }> {
  if (!supabase) return { envelope: null, error: 'Supabase not configured' }

  const auth = await requireAuthenticatedUserId()
  if ('error' in auth) return { envelope: null, error: auth.error }

  const { data, error } = await supabase
    .from(TABLE)
    .select('save_data')
    .eq('user_id', auth.userId)
    .eq('slot_id', slotId)
    .maybeSingle()

  if (error) {
    return {
      envelope: null,
      error: formatCloudSaveError(error.message),
    }
  }
  if (!data) return { envelope: null }
  const envelope = parseEnvelope(data.save_data)
  if (!envelope) return { envelope: null, error: 'Cloud save data is corrupted.' }
  return { envelope }
}

export async function getAllCloudSaveSlots(): Promise<{
  1: SaveSlotSummary
  2: SaveSlotSummary
}> {
  const empty1 = buildSaveSlotSummary(1, null)
  const empty2 = buildSaveSlotSummary(2, null)
  if (!supabase) return { 1: empty1, 2: empty2 }

  const auth = await requireAuthenticatedUserId()
  if ('error' in auth) return { 1: empty1, 2: empty2 }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', auth.userId)

  if (error || !data) return { 1: empty1, 2: empty2 }

  const result = { 1: empty1, 2: empty2 }
  for (const row of data as GameSaveRow[]) {
    if (row.slot_id === 1 || row.slot_id === 2) {
      result[row.slot_id as 1 | 2] = rowToSummary(row)
    }
  }
  return result
}

export async function saveToCloudSlot(
  slotId: SaveSlotId,
  runState: MonolithSaveEnvelope | RunSaveData,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase not configured' }
  }

  const auth = await requireAuthenticatedUserId()
  if ('error' in auth) return { ok: false, error: auth.error }

  if (slotId !== 1 && slotId !== 2) {
    return { ok: false, error: 'Invalid slot. Only slots 1 and 2 are allowed.' }
  }

  const envelope: MonolithSaveEnvelope = isSaveEnvelope(runState)
    ? { ...runState, slotId, lastPlayed: new Date().toISOString() }
    : buildSaveEnvelope(slotId, runState)

  const payload: MonolithSaveEnvelope = {
    ...envelope,
    slotId,
    lastPlayed: new Date().toISOString(),
  }

  const row = {
    user_id: auth.userId,
    slot_id: slotId,
    save_name: payload.trainerName ?? payload.saveName ?? null,
    save_data: payload,
  }

  const { data: existing, error: readError } = await supabase
    .from(TABLE)
    .select('id')
    .eq('user_id', auth.userId)
    .eq('slot_id', slotId)
    .maybeSingle()

  if (readError) {
    return { ok: false, error: formatCloudSaveError(readError.message) }
  }

  const { error } = existing
    ? await supabase
        .from(TABLE)
        .update({
          save_name: row.save_name,
          save_data: row.save_data,
        })
        .eq('user_id', auth.userId)
        .eq('slot_id', slotId)
    : await supabase.from(TABLE).insert(row)

  if (error) return { ok: false, error: formatCloudSaveError(error.message) }
  return { ok: true }
}

export async function loadFromCloudSlot(
  slotId: SaveSlotId,
): Promise<MonolithSaveEnvelope | null> {
  return getCloudSaveSlot(slotId)
}

export async function deleteCloudSlot(slotId: SaveSlotId): Promise<boolean> {
  if (!supabase) return false
  const auth = await requireAuthenticatedUserId()
  if ('error' in auth) return false

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', auth.userId)
    .eq('slot_id', slotId)

  return !error
}

export async function uploadLocalSlotToCloud(
  localSlotId: SaveSlotId,
  cloudSlotId: SaveSlotId,
): Promise<{ ok: boolean; error?: string }> {
  if (localSlotId !== cloudSlotId && localSlotId !== 1 && localSlotId !== 2) {
    return { ok: false, error: 'Invalid local slot.' }
  }
  if (cloudSlotId !== 1 && cloudSlotId !== 2) {
    return { ok: false, error: 'Invalid cloud slot.' }
  }
  const envelope = loadEnvelopeFromSlot(localSlotId)
  if (!envelope) return { ok: false, error: 'Local slot is empty.' }
  return saveToCloudSlot(cloudSlotId, { ...envelope, slotId: cloudSlotId })
}
