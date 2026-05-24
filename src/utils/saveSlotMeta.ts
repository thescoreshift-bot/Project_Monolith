import type { SaveSlotId } from './saveSystem'

export function normalizeSaveSlotName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function validateSaveSlotName(name: string): string | null {
  const trimmed = normalizeSaveSlotName(name)
  if (!trimmed) {
    return 'Trainer name cannot be empty.'
  }
  if (trimmed.length < 3 || trimmed.length > 16) {
    return 'Trainer name must be 3–16 characters.'
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(trimmed)) {
    return 'Use only letters, numbers, spaces, underscores, and hyphens.'
  }
  return null
}

export function defaultSaveNameForSlot(slotId: SaveSlotId): string {
  return `Save Slot ${slotId}`
}

export function resolveSaveDisplayName(
  slotId: SaveSlotId,
  saveName?: string | null,
  trainerName?: string | null,
): string {
  const trimmedSave = saveName?.trim()
  const trimmedTrainer = trainerName?.trim()
  if (trimmedSave) return trimmedSave
  if (trimmedTrainer) return trimmedTrainer
  return defaultSaveNameForSlot(slotId)
}
