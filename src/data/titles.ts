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
  'storm-caller': {
    id: 'storm-caller',
    name: 'Storm Caller',
    description: 'Lightning answers when you raise your hand.',
    perkId: 'arc-surge',
  },
}

export function getTitleDefinition(
  titleId: string | null | undefined,
): TitleDefinition | null {
  if (!titleId) return null
  return TITLE_DEFINITIONS[titleId] ?? null
}
