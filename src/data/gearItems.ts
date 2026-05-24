import type { ElementType } from './starters'

export type GearRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'mythic'
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
  'inferno-brand': {
    id: 'inferno-brand',
    name: 'Inferno Brand',
    rarity: 'epic',
    slot: 'held',
    description: 'Forged in a volcanic node — fire strikes burn hotter.',
    statModifiers: { atk: 5, spAtk: 4 },
    damageModifiers: { Fire: 0.08 },
    specialEffectText: 'Fire damage +8%',
    price: 280,
    sellValue: 140,
  },
  'tidecaller-pearl': {
    id: 'tidecaller-pearl',
    name: 'Tidecaller Pearl',
    rarity: 'epic',
    slot: 'held',
    description: 'A pearl that pulls the tide into every spell.',
    statModifiers: { spAtk: 6, spDef: 3 },
    damageModifiers: { Water: 0.08 },
    specialEffectText: 'Water damage +8%',
    price: 280,
    sellValue: 140,
  },
  'thornheart-sigil': {
    id: 'thornheart-sigil',
    name: 'Thornheart Sigil',
    rarity: 'epic',
    slot: 'held',
    description: 'Living thorns coil around the bearer.',
    statModifiers: { def: 5, atk: 4 },
    damageModifiers: { Grass: 0.08 },
    specialEffectText: 'Grass damage +8%',
    price: 280,
    sellValue: 140,
  },
  'stormcap-coil': {
    id: 'stormcap-coil',
    name: 'Stormcap Coil',
    rarity: 'epic',
    slot: 'held',
    description: 'Crackling coil from a storm spire.',
    statModifiers: { spd: 5, spAtk: 4 },
    damageModifiers: { Electric: 0.08 },
    specialEffectText: 'Electric damage +8%',
    price: 280,
    sellValue: 140,
  },
  'bedrock-plate': {
    id: 'bedrock-plate',
    name: 'Bedrock Plate',
    rarity: 'epic',
    slot: 'held',
    description: 'Bedrock fused to monolith ash — immovable guard.',
    statModifiers: { maxHp: 12, def: 5 },
    damageModifiers: { Ground: 0.08 },
    specialEffectText: 'Ground damage +8%',
    price: 280,
    sellValue: 140,
  },
  'phoenix-core': {
    id: 'phoenix-core',
    name: 'Phoenix Core',
    rarity: 'mythic',
    slot: 'held',
    description: 'A reborn ember heart that never cools.',
    statModifiers: { atk: 7, spAtk: 6 },
    damageModifiers: { Fire: 0.1 },
    specialEffectText: 'Fire damage +10%',
    price: 480,
    sellValue: 240,
  },
  'abyss-lens': {
    id: 'abyss-lens',
    name: 'Abyss Lens',
    rarity: 'mythic',
    slot: 'held',
    description: 'Focuses pressure from the deep into every wave.',
    statModifiers: { spAtk: 8, spDef: 4 },
    damageModifiers: { Water: 0.1 },
    specialEffectText: 'Water damage +10%',
    price: 480,
    sellValue: 240,
  },
  'verdant-heart': {
    id: 'verdant-heart',
    name: 'Verdant Heart',
    rarity: 'mythic',
    slot: 'held',
    description: 'The forest pulse beats inside this seed.',
    statModifiers: { maxHp: 10, atk: 6 },
    damageModifiers: { Grass: 0.1 },
    specialEffectText: 'Grass damage +10%',
    price: 480,
    sellValue: 240,
  },
  'thunderheart': {
    id: 'thunderheart',
    name: 'Thunderheart',
    rarity: 'mythic',
    slot: 'held',
    description: 'Storm energy stored in crystallized lightning.',
    statModifiers: { spd: 6, spAtk: 7 },
    damageModifiers: { Electric: 0.1 },
    specialEffectText: 'Electric damage +10%',
    price: 480,
    sellValue: 240,
  },
  'tectonic-heart': {
    id: 'tectonic-heart',
    name: 'Tectonic Heart',
    rarity: 'mythic',
    slot: 'held',
    description: 'Shifts weight like continental drift.',
    statModifiers: { maxHp: 14, def: 6 },
    damageModifiers: { Ground: 0.1 },
    specialEffectText: 'Ground damage +10%',
    price: 480,
    sellValue: 240,
  },
  'sunforge-crown': {
    id: 'sunforge-crown',
    name: 'Sunforge Crown',
    rarity: 'legendary',
    slot: 'held',
    description: 'Crown of the sunforge — fire and fury united.',
    statModifiers: { atk: 8, spAtk: 7, spd: 3 },
    damageModifiers: { Fire: 0.12, all: 0.03 },
    specialEffectText: 'Fire +12% · all damage +3%',
    price: 720,
    sellValue: 360,
  },
  'leviathan-scale': {
    id: 'leviathan-scale',
    name: 'Leviathan Scale',
    rarity: 'legendary',
    slot: 'held',
    description: 'Scale from a leviathan of the black trench.',
    statModifiers: { spAtk: 9, spDef: 6, maxHp: 8 },
    damageModifiers: { Water: 0.12, all: 0.03 },
    specialEffectText: 'Water +12% · all damage +3%',
    price: 720,
    sellValue: 360,
  },
  'worldroot-crown': {
    id: 'worldroot-crown',
    name: 'Worldroot Crown',
    rarity: 'legendary',
    slot: 'held',
    description: 'Roots of the world tree woven into gold.',
    statModifiers: { atk: 7, def: 7, maxHp: 10 },
    damageModifiers: { Grass: 0.12, all: 0.03 },
    specialEffectText: 'Grass +12% · all damage +3%',
    price: 720,
    sellValue: 360,
  },
  'voltaic-crown': {
    id: 'voltaic-crown',
    name: 'Voltaic Crown',
    rarity: 'legendary',
    slot: 'held',
    description: 'Channels the sky’s judgment through the bearer.',
    statModifiers: { spd: 8, spAtk: 8 },
    damageModifiers: { Electric: 0.12, all: 0.03 },
    specialEffectText: 'Electric +12% · all damage +3%',
    price: 720,
    sellValue: 360,
  },
  'earthshaper-crown': {
    id: 'earthshaper-crown',
    name: 'Earthshaper Crown',
    rarity: 'legendary',
    slot: 'held',
    description: 'Worn by those who reshape the ash wastes.',
    statModifiers: { def: 9, maxHp: 16, atk: 5 },
    damageModifiers: { Ground: 0.12, all: 0.03 },
    specialEffectText: 'Ground +12% · all damage +3%',
    price: 720,
    sellValue: 360,
  },
  'stoneguard-charm': {
    id: 'stoneguard-charm',
    name: 'Stoneguard Charm',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Forged from bedrock chips — steady defense for the route.',
    statModifiers: { def: 4, maxHp: 5 },
    price: 0,
    sellValue: 30,
  },
  'voltweave-band': {
    id: 'voltweave-band',
    name: 'Voltweave Band',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Threaded with storm charge for swift electric strikes.',
    statModifiers: { spd: 4 },
    damageModifiers: { Electric: 0.03 },
    specialEffectText: 'SPD +4 · Electric damage +3%',
    price: 0,
    sellValue: 32,
  },
  'tide-pearl-pendant': {
    id: 'tide-pearl-pendant',
    name: 'Tide Pearl Pendant',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Pearl focus that softens special blows and empowers water.',
    statModifiers: { spDef: 4 },
    damageModifiers: { Water: 0.03 },
    specialEffectText: 'SP.DEF +4 · Water damage +3%',
    price: 0,
    sellValue: 32,
  },
  'thornseed-collar': {
    id: 'thornseed-collar',
    name: 'Thornseed Collar',
    rarity: 'uncommon',
    slot: 'held',
    description: 'Living seeds woven into a collar of regrowth.',
    statModifiers: { maxHp: 4 },
    damageModifiers: { Grass: 0.03 },
    specialEffectText: 'Max HP +4 · Grass damage +3%',
    price: 0,
    sellValue: 30,
  },
  'alpha-fang-charm': {
    id: 'alpha-fang-charm',
    name: 'Alpha Fang Charm',
    rarity: 'rare',
    slot: 'held',
    description: 'Trophy fang from an alpha — raw power in every strike.',
    statModifiers: { atk: 6 },
    damageModifiers: { all: 0.04 },
    specialEffectText: 'ATK +6 · all damage +4%',
    price: 0,
    sellValue: 75,
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
  'mythic',
  'legendary',
]

/** Premium relic shop: epic, mythic, legendary — one of each per element type. */
export const RELIC_GEAR_BY_TYPE: Record<ElementType, [string, string, string]> = {
  Fire: ['inferno-brand', 'phoenix-core', 'sunforge-crown'],
  Water: ['tidecaller-pearl', 'abyss-lens', 'leviathan-scale'],
  Grass: ['thornheart-sigil', 'verdant-heart', 'worldroot-crown'],
  Electric: ['stormcap-coil', 'thunderheart', 'voltaic-crown'],
  Ground: ['bedrock-plate', 'tectonic-heart', 'earthshaper-crown'],
}
