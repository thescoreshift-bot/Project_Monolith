import type { ElementType } from './starters'

export type BadgeStatModifiers = {
  atk?: number
  def?: number
  spAtk?: number
  spDef?: number
  spd?: number
  maxHp?: number
}

export type BadgeDamageModifiers = Partial<Record<ElementType, number>>

export type Badge = {
  id: string
  name: string
  region: number
  gymNumber: number
  description: string
  statModifiers: BadgeStatModifiers
  damageModifiers: BadgeDamageModifiers
  specialEffectText: string
  affects: string
  /** @deprecated Use damageModifiers */
  damageBonusTypes?: ElementType[]
  allDamageBonusPercent?: number
  postVictoryHeal?: number
}

export const REGION_1_BADGES: Badge[] = [
  {
    id: 'ember-badge',
    name: 'Ember Badge',
    region: 1,
    gymNumber: 1,
    description: 'A badge earned from the first gym leader.',
    statModifiers: { atk: 3 },
    damageModifiers: { Fire: 0.05 },
    specialEffectText: 'Fire abilities deal 5% more damage.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'tide-badge',
    name: 'Tide Badge',
    region: 1,
    gymNumber: 2,
    description: 'Tidal mastery from the coastal gym circuit.',
    statModifiers: {},
    damageModifiers: { Water: 0.05 },
    postVictoryHeal: 5,
    specialEffectText: 'Water abilities deal 5% more damage. Party heals 5 HP after victory.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'bloom-badge',
    name: 'Bloom Badge',
    region: 1,
    gymNumber: 3,
    description: 'Verdant resilience from the Bloom Gym.',
    statModifiers: { maxHp: 5 },
    damageModifiers: { Grass: 0.05 },
    specialEffectText: 'Grass abilities deal 5% more damage.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'volt-badge',
    name: 'Volt Badge',
    region: 1,
    gymNumber: 4,
    description: 'Lightning reflexes earned at the Volt Gym.',
    statModifiers: { spd: 3 },
    damageModifiers: { Electric: 0.05 },
    specialEffectText: 'Electric abilities deal 5% more damage.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'stone-badge',
    name: 'Stone Badge',
    region: 1,
    gymNumber: 5,
    description: 'Bedrock fortitude from the Stone Gym.',
    statModifiers: { def: 3 },
    damageModifiers: { Ground: 0.05 },
    specialEffectText: 'Ground abilities deal 5% more damage.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'venom-badge',
    name: 'Venom Badge',
    region: 1,
    gymNumber: 6,
    description: 'Toxic precision from the Venom Gym.',
    statModifiers: { spAtk: 3 },
    damageModifiers: {},
    specialEffectText: 'Poison effects deal slightly more damage.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'spirit-badge',
    name: 'Spirit Badge',
    region: 1,
    gymNumber: 7,
    description: 'Ethereal focus from the Spirit Gym.',
    statModifiers: { spDef: 3 },
    damageModifiers: {},
    specialEffectText: 'Status effects apply more reliably.',
    affects: 'All current and future party creatures.',
  },
  {
    id: 'apex-badge',
    name: 'Apex Badge',
    region: 1,
    gymNumber: 8,
    description: 'The crown badge of Region 1.',
    statModifiers: { maxHp: 5 },
    damageModifiers: {},
    allDamageBonusPercent: 5,
    specialEffectText: 'All damage types deal 5% more damage.',
    affects: 'All current and future party creatures.',
  },
]

export const BADGES_BY_ID: Record<string, Badge> = Object.fromEntries(
  REGION_1_BADGES.map((b) => [b.id, b]),
)

export const BADGES_IN_REGION = 8

export function getBadge(id: string): Badge | undefined {
  return BADGES_BY_ID[id]
}

export function formatBadgeStatModifiers(mod: BadgeStatModifiers): string[] {
  const lines: string[] = []
  if (mod.atk) lines.push(`ATK +${mod.atk}`)
  if (mod.def) lines.push(`DEF +${mod.def}`)
  if (mod.spAtk) lines.push(`SP.ATK +${mod.spAtk}`)
  if (mod.spDef) lines.push(`SP.DEF +${mod.spDef}`)
  if (mod.spd) lines.push(`SPD +${mod.spd}`)
  if (mod.maxHp) lines.push(`Max HP +${mod.maxHp}`)
  return lines
}

export function formatBadgeDamageModifiers(
  mod: BadgeDamageModifiers,
  allPercent?: number,
): string[] {
  const lines = Object.entries(mod).map(
    ([type, pct]) => `${type} damage +${Math.round(pct * 100)}%`,
  )
  if (allPercent) lines.push(`All damage +${allPercent}%`)
  return lines
}
