/**
 * Recruit/wild creature portraits — keyed by enemy template id (base form).
 * Assets live in /assets/creatures/recruits/{id}.png
 */
export const RECRUIT_PORTRAIT_URLS: Record<string, string> = {
  bristlebug: '/assets/creatures/recruits/bristlebug.png',
  ashling: '/assets/creatures/recruits/ashling.png',
  pebblemaw: '/assets/creatures/recruits/pebblemaw.png',
  voltimp: '/assets/creatures/recruits/voltimp.png',
  driftwisp: '/assets/creatures/recruits/driftwisp.png',
}

/** Strip alpha- prefix so alpha variants share the base recruit art. */
export function normalizeRecruitTemplateId(templateId: string): string {
  return templateId.replace(/^alpha-/, '')
}

const RECRUITABLE_IDS = [
  'bristlebug',
  'ashling',
  'pebblemaw',
  'voltimp',
  'driftwisp',
] as const

/** Resolve the base recruit template id used for evolution lookups. */
export function resolveRecruitTemplateId(input: {
  templateId?: string | null
  id?: string
  name?: string
}): string | null {
  if (input.templateId) {
    const base = normalizeRecruitTemplateId(input.templateId)
    if (RECRUITABLE_IDS.includes(base as (typeof RECRUITABLE_IDS)[number])) {
      return base
    }
  }
  if (input.id) {
    const match = input.id.match(
      /^recruit-(bristlebug|ashling|pebblemaw|voltimp|driftwisp)-/,
    )
    if (match?.[1]) return match[1]
  }
  if (input.name) {
    const byName: Record<string, string> = {
      Bristlebug: 'bristlebug',
      Ashling: 'ashling',
      Pebblemaw: 'pebblemaw',
      Voltimp: 'voltimp',
      Driftwisp: 'driftwisp',
    }
    if (byName[input.name]) return byName[input.name]
  }
  return null
}

export function getRecruitPortraitUrl(templateId: string | undefined | null): string | null {
  if (!templateId) return null
  const base = normalizeRecruitTemplateId(templateId)
  return RECRUIT_PORTRAIT_URLS[base] ?? null
}
