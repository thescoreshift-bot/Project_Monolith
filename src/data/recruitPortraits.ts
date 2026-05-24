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

export function getRecruitPortraitUrl(templateId: string | undefined | null): string | null {
  if (!templateId) return null
  const base = normalizeRecruitTemplateId(templateId)
  return RECRUIT_PORTRAIT_URLS[base] ?? null
}
