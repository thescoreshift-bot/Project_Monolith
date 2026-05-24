import type { ElementType } from './starters'

export type GearRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'

export type GearSlot = 'held'

export type GearStatModifiers = {
  atk?: number
  def?: number
  spAtk?: number
  spDef?: number
  spd?: number
  maxHp?: number
}

/** Type-specific bonus as decimal (0.03 = +3%). `all` applies to every damaging move. */
export type GearDamageModifiers = Partial<Record<ElementType, number>> & {
  all?: number
}

export type GearItem = {
  id: string
  name: string
  rarity: GearRarity
  slot: GearSlot
  description: string
  statModifiers: GearStatModifiers
  damageModifiers?: GearDamageModifiers
  specialEffectText?: string
  price: number
  sellValue?: number
}

export const GEAR_ITEMS: Record<string, GearItem> = {
  'ember-fang': {
    id: 'ember-fang',
    name: 'Ember Fang',
    rarity: 'common',
    slot: 'held',
    description: 'A warm fang charm that sharpens physical fire strikes.',
    statModifiers: { atk: 2 },
    damageModifiers: { Fire: 0.03 },
    specialEffectText: 'Fire damage +3%',
    price: 32,
    sellValue: 16,
  },
  'training-band': {
    id: 'training-band',
    name: 'Training Band',
    rarity: 'common',
    slot: 'held',
    description: 'A worn band from circuit training grounds.',
    statModifiers: { atk: 2, spAtk: 2 },
    price: 35,
    sellValue: 17,
  },
  'pebble-charm': {
    id: 'pebble-charm',
    name: 'Pebble Charm',
    rarity: 'common',
    slot: 'held',
    description: 'Smooth stone that hardens the bearer.',
    statModifiers: { def: 3 },
    price: 28,
    sellValue: 14,
  },
  'mist-bead': {
    id: 'mist-bead',
    name: 'Mist Bead',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Condensed mist from coastal routes.',
    statModifiers: { spDef: 3 },
    damageModifiers: { Water: 0.03 },
    specialEffectText: 'Water damage +3%',
    price: 55,
    sellValue: 27,
  },
  'quick-feather': {
    id: 'quick-feather',
    name: 'Quick Feather',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Light as driftwind — feet never feel heavy.',
    statModifiers: { spd: 4 },
    price: 60,
    sellValue: 30,
  },
  'thorn-collar': {
    id: 'thorn-collar',
    name: 'Thorn Collar',
    rarity: 'rare',
    slot: 'held',
    description: 'Vine-wrapped collar that bites back.',
    statModifiers: { atk: 4 },
    damageModifiers: { Grass: 0.05 },
    specialEffectText: 'Grass damage +5%',
    price: 95,
    sellValue: 47,
  },
  'static-core': {
    id: 'static-core',
    name: 'Static Core',
    rarity: 'rare',
    slot: 'held',
    description: 'Crackling core from storm nodes.',
    statModifiers: { spd: 3 },
    damageModifiers: { Electric: 0.06 },
    specialEffectText: 'Electric damage +6%',
    price: 110,
    sellValue: 55,
  },
  'guardian-shell': {
    id: 'guardian-shell',
    name: 'Guardian Shell',
    rarity: 'rare',
    slot: 'held',
    description: 'Layered shell fragment from monolith guardians.',
    statModifiers: { maxHp: 8, def: 3 },
    price: 100,
    sellValue: 50,
  },
  'alpha-claw': {
    id: 'alpha-claw',
    name: 'Alpha Claw',
    rarity: 'epic',
    slot: 'held',
    description: 'Trophy claw from an alpha nest champion.',
    statModifiers: { atk: 6 },
    damageModifiers: { all: 0.05 },
    specialEffectText: 'All damage +5%',
    price: 180,
    sellValue: 90,
  },
  'monolith-shard': {
    id: 'monolith-shard',
    name: 'Monolith Shard',
    rarity: 'legendary',
    slot: 'held',
    description: 'A sliver of the great monolith — power resonates through the party.',
    statModifiers: {
      atk: 5,
      def: 5,
      spAtk: 5,
      spDef: 5,
      spd: 5,
    },
    damageModifiers: { all: 0.05 },
    specialEffectText: '+5 all stats · all damage +5%',
    price: 320,
    sellValue: 160,
  },
}

export const GEAR_ITEM_LIST: GearItem[] = Object.values(GEAR_ITEMS)

export function getGearItem(id: string | null | undefined): GearItem | null {
  if (!id) return null
  return GEAR_ITEMS[id] ?? null
}

export const GEAR_RARITY_ORDER: GearRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]
