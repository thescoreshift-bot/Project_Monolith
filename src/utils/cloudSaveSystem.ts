import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  SAVE_VERSION,
  buildSaveSlotSummary,
  loadRunFromSlot,
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
  saveName?: string,
): MonolithSaveEnvelope {
  return {
    saveVersion: SAVE_VERSION,
    slotId,
    lastPlayed: new Date().toISOString(),
    saveName: saveName ?? saveData.runCreature.name,
    data: saveData,
  }
}

function rowToSummary(row: GameSaveRow): SaveSlotSummary {
  const normalized = parseEnvelope(row.save_data)
  if (!normalized) {
    return buildSaveSlotSummary(row.slot_id as SaveSlotId, null)
  }
  return buildSaveSlotSummary(row.slot_id as SaveSlotId, normalized.data, normalized.lastPlayed)
}

function parseEnvelope(raw: unknown): MonolithSaveEnvelope | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
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
  const legacy = parseAndNormalizeSaveData(raw)
  if (!legacy) return null
  return buildSaveEnvelope(1, legacy)
}

async function requireLoggedInUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user.id
}

export async function getCloudSaveSlot(
  slotId: SaveSlotId,
): Promise<MonolithSaveEnvelope | null> {
  if (!supabase) return null
  const userId = await requireLoggedInUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from(TABLE)
    .select('save_data')
    .eq('user_id', userId)
    .eq('slot_id', slotId)
    .maybeSingle()

  if (error || !data) return null
  return parseEnvelope(data.save_data)
}

export async function getAllCloudSaveSlots(): Promise<{
  1: SaveSlotSummary
  2: SaveSlotSummary
}> {
  const empty1 = buildSaveSlotSummary(1, null)
  const empty2 = buildSaveSlotSummary(2, null)
  if (!supabase) return { 1: empty1, 2: empty2 }

  const userId = await requireLoggedInUserId()
  if (!userId) return { 1: empty1, 2: empty2 }

  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId)

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

  const userId = await requireLoggedInUserId()
  if (!userId) return { ok: false, error: 'Not logged in' }

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

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      slot_id: slotId,
      save_name: payload.saveName ?? null,
      save_data: payload,
    },
    { onConflict: 'user_id,slot_id' },
  )

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function loadFromCloudSlot(
  slotId: SaveSlotId,
): Promise<MonolithSaveEnvelope | null> {
  return getCloudSaveSlot(slotId)
}

export async function deleteCloudSlot(slotId: SaveSlotId): Promise<boolean> {
  if (!supabase) return false
  const userId = await requireLoggedInUserId()
  if (!userId) return false

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
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
  const data = loadRunFromSlot(localSlotId)
  if (!data) return { ok: false, error: 'Local slot is empty.' }
  const envelope = buildSaveEnvelope(cloudSlotId, data)
  return saveToCloudSlot(cloudSlotId, envelope)
}
