/** Profile titles earned in-run or from achievements; each can grant a combat perk. */
export type TitleDefinition = {
  id: string
  name: string
  description: string
  perkId: string
}

export const TITLE_DEFINITIONS: Record<string, TitleDefinition> = {
  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Routes through the ash wastes bend to your will.',
    perkId: 'scavenger-sense',
  },
  'monolith-witness': {
    id: 'monolith-witness',
    name: 'Monolith Witness',
    description: 'You have stood before the pulse and lived.',
    perkId: 'monolith-resonance',
  },
  'alpha-artisan': {
    id: 'alpha-artisan',
    name: 'Alpha Artisan',
    description: 'Forged trophy gear from alpha claws at the Monolith Forge.',
    perkId: 'scavenger-sense',
  },
  'storm-caller': {
    id: 'storm-caller',
    name: 'Storm Caller',
    description: 'Lightning answers when you raise your hand.',
    perkId: 'arc-surge',
  },
  'council-initiate': {
    id: 'council-initiate',
    name: 'Council Initiate',
    description: 'Recognized by The Monolith Council after your first gauntlet victory.',
    perkId: 'monolith-resonance',
  },
}

export function getTitleDefinition(
  titleId: string | null | undefined,
): TitleDefinition | null {
  if (!titleId) return null
  return TITLE_DEFINITIONS[titleId] ?? null
}
