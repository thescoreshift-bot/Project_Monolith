const FAST_ENCOUNTER_KEY = 'monolith-fast-encounter'

export function isFastEncounterEnabled(): boolean {
  try {
    return localStorage.getItem(FAST_ENCOUNTER_KEY) === 'true'
  } catch {
    return false
  }
}

export function setFastEncounterEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(FAST_ENCOUNTER_KEY, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}
