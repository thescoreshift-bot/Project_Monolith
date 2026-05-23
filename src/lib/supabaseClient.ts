import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

/** True when both Vite env vars are set (safe to use cloud auth/saves). */
export function isSupabaseConfigured(): boolean {
  return url.length > 0 && anonKey.length > 0
}

/**
 * Supabase browser client. `null` when env vars are missing — use offline/local saves only.
 * Never put the service role key here; only the anon/publishable key.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url, anonKey)
  : null

/** @deprecated Prefer importing `supabase` directly. */
export function getSupabaseClient(): SupabaseClient | null {
  return supabase
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file in the project root, then restart `npm run dev`.',
    )
  }
  return supabase
}
