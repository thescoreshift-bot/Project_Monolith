import type { ElementType } from './starters'

/** Attacking type → defending type dealt increased damage. */
const SUPER_EFFECTIVE: Partial<Record<ElementType, ElementType[]>> = {
  Fire: ['Grass'],
  Water: ['Fire'],
  Grass: ['Water'],
  Electric: ['Water'],
  Ground: ['Electric'],
}

/** Attacking type → defending type dealt reduced damage. */
const NOT_VERY_EFFECTIVE: Partial<Record<ElementType, ElementType[]>> = {
  Fire: ['Water'],
  Water: ['Grass'],
  Grass: ['Fire'],
  Electric: ['Ground'],
  Ground: ['Grass'],
}

export const SUPER_EFFECTIVE_MULTIPLIER = 1.5
export const NOT_VERY_EFFECTIVE_MULTIPLIER = 0.75

export function getTypeEffectivenessMultiplier(
  attackType: ElementType,
  defenderType: ElementType,
): number {
  if (SUPER_EFFECTIVE[attackType]?.includes(defenderType)) {
    return SUPER_EFFECTIVE_MULTIPLIER
  }
  if (NOT_VERY_EFFECTIVE[attackType]?.includes(defenderType)) {
    return NOT_VERY_EFFECTIVE_MULTIPLIER
  }
  return 1
}

export function isSuperEffective(
  attackType: ElementType,
  defenderType: ElementType,
): boolean {
  return getTypeEffectivenessMultiplier(attackType, defenderType) >= SUPER_EFFECTIVE_MULTIPLIER
}

export function formatTypeEffectivenessLabel(multiplier: number): string | null {
  if (multiplier >= SUPER_EFFECTIVE_MULTIPLIER) {
    return `Super Effective x${SUPER_EFFECTIVE_MULTIPLIER}`
  }
  if (multiplier <= NOT_VERY_EFFECTIVE_MULTIPLIER) {
    return `Not Very Effective x${NOT_VERY_EFFECTIVE_MULTIPLIER}`
  }
  return null
}
