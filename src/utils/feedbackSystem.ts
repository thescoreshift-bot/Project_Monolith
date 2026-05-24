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

/** Extra tester fields stored in feedback_reports.report_data only. */
export type FeedbackReportData = {
  kind: FeedbackKind
  contact?: string
  created_at: string
  save_slot_label?: string
  steps_to_reproduce?: string
  actual?: string
  expected?: string
  page_url?: string
  user_agent?: string
  severity?: string
  title?: string
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

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  return navigator.userAgent
}

/** DB save_slot is integer (1 or 2); human labels like "Cloud 1" / "None" go in report_data. */
export function parseSaveSlotNumber(saveSlotLabel: string): number | null {
  const trimmed = saveSlotLabel.trim()
  if (!trimmed || trimmed === 'None') return null
  const match = trimmed.match(/(\d+)\s*$/)
  if (!match) return null
  const n = Number.parseInt(match[1], 10)
  if (n === 1 || n === 2) return n
  return null
}

function buildReportData(payload: FeedbackPayload): FeedbackReportData {
  return {
    kind: payload.kind,
    contact: payload.contact,
    created_at: payload.createdAt,
    save_slot_label: payload.saveSlot,
    steps_to_reproduce: payload.whatHappened,
    actual: payload.whatHappened,
    expected: payload.expectedBehavior || undefined,
    page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: getBrowserInfo(),
    title: payload.kind === 'bug' ? 'Bug report' : 'Feedback',
  }
}

function buildSupabaseInsertRow(
  payload: FeedbackPayload,
  userId: string | null,
) {
  return {
    user_id: userId,
    display_name: payload.contact?.trim() || null,
    report_type: payload.kind,
    message: payload.whatHappened,
    expected_behavior: payload.expectedBehavior.trim() || null,
    current_screen: payload.screen,
    current_region: payload.region,
    save_slot: parseSaveSlotNumber(payload.saveSlot),
    app_version: payload.appVersion,
    browser_info: getBrowserInfo(),
    report_data: buildReportData(payload),
    status: 'open',
  }
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
    const row = buildSupabaseInsertRow(payload, userData.user?.id ?? null)
    const { error } = await supabase.from('feedback_reports').insert(row)

    if (error) {
      return { ok: true, copyText, error: error.message, savedToCloud: false }
    }

    return { ok: true, copyText, savedToCloud: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return { ok: true, copyText, error: message, savedToCloud: false }
  }
}
