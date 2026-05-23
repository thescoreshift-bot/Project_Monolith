import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { APP_VERSION, APP_VERSION_LABEL } from './version'

export type FeedbackKind = 'bug' | 'feedback'

export type FeedbackPayload = {
  kind: FeedbackKind
  whatHappened: string
  expectedBehavior: string
  contact?: string
  screen: string
  region: string
  saveSlot: string
  appVersion: string
  createdAt: string
}

const LOCAL_FEEDBACK_KEY = 'project-monolith-feedback-log'

export function buildFeedbackReportText(payload: FeedbackPayload): string {
  return [
    '--- Project MONOLITH Tester Report ---',
    APP_VERSION_LABEL,
    `Type: ${payload.kind}`,
    `Screen: ${payload.screen}`,
    `Region: ${payload.region}`,
    `Save slot: ${payload.saveSlot}`,
    `When: ${payload.createdAt}`,
    '',
    'What happened:',
    payload.whatHappened,
    '',
    'What should have happened:',
    payload.expectedBehavior || '(not provided)',
    '',
    payload.contact ? `Contact: ${payload.contact}` : '',
    '---',
  ]
    .filter(Boolean)
    .join('\n')
}

function appendLocalFeedback(payload: FeedbackPayload): void {
  try {
    const existing = localStorage.getItem(LOCAL_FEEDBACK_KEY)
    const list: FeedbackPayload[] = existing ? JSON.parse(existing) : []
    list.push(payload)
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list.slice(-20)))
  } catch {
    // ignore
  }
}

export async function submitFeedback(
  input: Omit<FeedbackPayload, 'appVersion' | 'createdAt'>,
): Promise<{
  ok: boolean
  copyText: string
  error?: string
  savedToCloud?: boolean
}> {
  const payload: FeedbackPayload = {
    ...input,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
  }
  const copyText = buildFeedbackReportText(payload)

  appendLocalFeedback(payload)

  if (!isSupabaseConfigured() || !supabase) {
    return { ok: true, copyText, savedToCloud: false }
  }

  try {
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase.from('feedback_reports').insert({
      user_id: userData.user?.id ?? null,
      kind: payload.kind,
      what_happened: payload.whatHappened,
      expected_behavior: payload.expectedBehavior || null,
      contact: payload.contact || null,
      screen: payload.screen,
      region: payload.region,
      save_slot: payload.saveSlot,
      app_version: payload.appVersion,
    })

    if (error) {
      return { ok: true, copyText, error: error.message, savedToCloud: false }
    }

    return { ok: true, copyText, savedToCloud: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return { ok: true, copyText, error: message, savedToCloud: false }
  }
}
