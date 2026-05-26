import type { CreatureSpriteSheetSet } from '../types/creatureSprites'

/**
 * Optional combat sprite strips keyed by starter type id or recruit template id.
 * frameWidth = width of ONE frame; frameHeight = full strip height.
 */
const CREATURE_SPRITE_SHEETS: Record<string, CreatureSpriteSheetSet> = {
  // Example (uncomment when strip assets exist):
  // fire: {
  //   idleSheetUrl: '/assets/creatures/sprites/fire-idle.png',
  //   idleFrameWidth: 256,
  //   idleFrameHeight: 256,
  //   idleFrameCount: 6,
  //   idleFps: 8,
  // },
}

export function getCreatureSpriteSheets(
  creatureKey: string,
): CreatureSpriteSheetSet | null {
  return CREATURE_SPRITE_SHEETS[creatureKey] ?? null
}

/** Resolve sprite registry key for party or run creatures in combat. */
export function getCreatureSpriteSheetsForFighter(creature: {
  starterTypeId?: string
  templateId?: string
}): CreatureSpriteSheetSet | null {
  const key = creature.templateId ?? creature.starterTypeId
  return key ? getCreatureSpriteSheets(key) : null
}
