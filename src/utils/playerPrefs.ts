import type { SaveSlotId } from './saveSystem'

const PREFS_KEY = 'project-monolith-player-prefs'

export type PlayerPrefs = {
  tutorialCompleted: boolean
  lastSaveSlotId: SaveSlotId | null
  showTesterPanel: boolean
}

const DEFAULT_PREFS: PlayerPrefs = {
  tutorialCompleted: false,
  lastSaveSlotId: null,
  showTesterPanel: false,
}

function readRaw(): PlayerPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const parsed = JSON.parse(raw) as Partial<PlayerPrefs>
    const lastSlot = parsed.lastSaveSlotId
    return {
      tutorialCompleted: Boolean(parsed.tutorialCompleted),
      lastSaveSlotId: lastSlot === 1 || lastSlot === 2 ? lastSlot : null,
      showTesterPanel: Boolean(parsed.showTesterPanel),
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
  setPlayerPrefs({ tutorialCompleted: completed })
}

export function setPlayerPrefs(patch: Partial<PlayerPrefs>): void {
  const next = { ...readRaw(), ...patch }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
}

export function setLastSaveSlotId(slotId: SaveSlotId): void {
  setPlayerPrefs({ lastSaveSlotId: slotId })
}

export function resetTutorialPrefs(): void {
  setPlayerPrefs({ tutorialCompleted: false })
}

export function isTesterPanelEnabled(): boolean {
  return readRaw().showTesterPanel
}

export function setTesterPanelEnabled(enabled: boolean): void {
  setPlayerPrefs({ showTesterPanel: enabled })
}
