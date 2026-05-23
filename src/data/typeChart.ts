import type { ElementType } from './starters'

/** Attacking type → defending type dealt double damage. */
const SUPER_EFFECTIVE: Partial<Record<ElementType, ElementType[]>> = {
  Fire: ['Grass'],
  Water: ['Fire'],
  Grass: ['Water'],
  Electric: ['Water'],
  Ground: ['Electric'],
}

/** Attacking type → defending type dealt half damage. */
const NOT_VERY_EFFECTIVE: Partial<Record<ElementType, ElementType[]>> = {
  Fire: ['Water'],
  Water: ['Grass'],
  Grass: ['Fire'],
  Electric: ['Ground'],
  Ground: ['Grass'],
}

export function getTypeEffectivenessMultiplier(
  attackType: ElementType,
  defenderType: ElementType,
): number {
  if (SUPER_EFFECTIVE[attackType]?.includes(defenderType)) return 2
  if (NOT_VERY_EFFECTIVE[attackType]?.includes(defenderType)) return 0.5
  return 1
}

export function isSuperEffective(
  attackType: ElementType,
  defenderType: ElementType,
): boolean {
  return getTypeEffectivenessMultiplier(attackType, defenderType) === 2
}

export function formatTypeEffectivenessLabel(multiplier: number): string | null {
  if (multiplier === 2) return 'Super Effective x2.0'
  if (multiplier === 0.5) return 'Not Very Effective x0.5'
  return null
}
