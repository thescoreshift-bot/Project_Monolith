const PREFS_KEY = 'project-monolith-player-prefs'

export type PlayerPrefs = {
  tutorialCompleted: boolean
}

const DEFAULT_PREFS: PlayerPrefs = {
  tutorialCompleted: false,
}

function readRaw(): PlayerPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const parsed = JSON.parse(raw) as Partial<PlayerPrefs>
    return {
      tutorialCompleted: Boolean(parsed.tutorialCompleted),
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function getPlayerPrefs(): PlayerPrefs {
  return readRaw()
}

export function isTutorialCompleted(): boolean {
  return readRaw().tutorialCompleted
}

export function setTutorialCompleted(completed: boolean): void {
  const next = { ...readRaw(), tutorialCompleted: completed }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
}

export function resetTutorialPrefs(): void {
  setTutorialCompleted(false)
}
