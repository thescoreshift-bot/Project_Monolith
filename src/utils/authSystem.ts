import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export type AuthResult = { ok: true; user: User } | { ok: false; error: string }

export function isAuthAvailable(): boolean {
  return isSupabaseConfigured() && supabase !== null
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Cloud login is not configured. Add Supabase keys to .env and restart the dev server.',
    }
  }
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { ok: false, error: error.message }
  if (!data.user) {
    return {
      ok: false,
      error:
        'Account created. If email confirmation is enabled, check your inbox before logging in.',
    }
  }
  return { ok: true, user: data.user }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Cloud login is not configured. Add Supabase keys to .env and restart the dev server.',
    }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }
  if (!data.user) return { ok: false, error: 'Login failed.' }
  return { ok: true, user: data.user }
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session ?? null
}

export function listenToAuthChanges(
  callback: (user: User | null, session: Session | null) => void,
): () => void {
  if (!supabase) {
    callback(null, null)
    return () => {}
  }
  const { data } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user ?? null, session)
    },
  )
  return () => {
    data.subscription.unsubscribe()
  }
}

/** @deprecated Use listenToAuthChanges */
export const onAuthStateChanged = listenToAuthChanges
