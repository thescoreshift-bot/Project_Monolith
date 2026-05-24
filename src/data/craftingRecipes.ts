import type { GearRarity } from './gearItems'

export type CraftingCategory =
  | 'consumable'
  | 'gear'
  | 'upgrade'
  | 'exchange'
  | 'special'

export type MaterialRequirement =
  | { itemId: string; quantity: number }
  | { kind: 'anyCommonMaterial'; quantity: number }

export type CraftResult =
  | { kind: 'consumable'; itemId: string }
  | { kind: 'gear'; gearId: string }
  | { kind: 'coins'; amount: number }
  | { kind: 'randomGear'; minRarity: GearRarity }
  | { kind: 'randomConsumable' }

export type CraftingRecipe = {
  id: string
  name: string
  category: CraftingCategory
  description: string
  requiredMaterials: MaterialRequirement[]
  coinCost: number
  result: CraftResult
  minLevel: number
  minRegionIndex?: number
  rarity: GearRarity | 'common'
  repeatable: boolean
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft-tide-tonic',
    name: 'Tide Tonic',
    category: 'consumable',
    description: 'Heals all party creatures for 20 HP.',
    requiredMaterials: [{ itemId: 'tide-pearl', quantity: 2 }],
    coinCost: 10,
    result: { kind: 'consumable', itemId: 'tide-tonic' },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'craft-seed-poultice',
    name: 'Seed Poultice',
    category: 'consumable',
    description: 'Heals one creature for 35 HP.',
    requiredMaterials: [{ itemId: 'wild-seed', quantity: 3 }],
    coinCost: 5,
    result: { kind: 'consumable', itemId: 'seed-poultice' },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'craft-stoneguard-charm',
    name: 'Stoneguard Charm',
    category: 'gear',
    description: 'Held gear: +4 DEF, +5 max HP.',
    requiredMaterials: [
      { itemId: 'stone-chip', quantity: 4 },
      { itemId: 'monolith-fragment', quantity: 1 },
    ],
    coinCost: 25,
    result: { kind: 'gear', gearId: 'stoneguard-charm' },
    minLevel: 1,
    rarity: 'uncommon',
    repeatable: true,
  },
  {
    id: 'craft-voltweave-band',
    name: 'Voltweave Band',
    category: 'gear',
    description: 'Held gear: +4 SPD, Electric damage +3%.',
    requiredMaterials: [
      { itemId: 'volt-thread', quantity: 4 },
      { itemId: 'monolith-fragment', quantity: 1 },
    ],
    coinCost: 25,
    result: { kind: 'gear', gearId: 'voltweave-band' },
    minLevel: 1,
    rarity: 'uncommon',
    repeatable: true,
  },
  {
    id: 'craft-tide-pearl-pendant',
    name: 'Tide Pearl Pendant',
    category: 'gear',
    description: 'Held gear: +4 SP.DEF, Water damage +3%.',
    requiredMaterials: [
      { itemId: 'tide-pearl', quantity: 4 },
      { itemId: 'monolith-fragment', quantity: 1 },
    ],
    coinCost: 25,
    result: { kind: 'gear', gearId: 'tide-pearl-pendant' },
    minLevel: 1,
    rarity: 'uncommon',
    repeatable: true,
  },
  {
    id: 'craft-thornseed-collar',
    name: 'Thornseed Collar',
    category: 'gear',
    description: 'Held gear: +4 max HP, Grass damage +3%.',
    requiredMaterials: [
      { itemId: 'wild-seed', quantity: 4 },
      { itemId: 'monolith-fragment', quantity: 1 },
    ],
    coinCost: 25,
    result: { kind: 'gear', gearId: 'thornseed-collar' },
    minLevel: 1,
    rarity: 'uncommon',
    repeatable: true,
  },
  {
    id: 'craft-alpha-fang-charm',
    name: 'Alpha Fang Charm',
    category: 'gear',
    description: 'Held gear: +6 ATK, all damage +4%.',
    requiredMaterials: [
      { itemId: 'material-alpha-claw', quantity: 2 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 75,
    result: { kind: 'gear', gearId: 'alpha-fang-charm' },
    minLevel: 5,
    rarity: 'rare',
    repeatable: true,
  },
  {
    id: 'exchange-monolith-cache',
    name: 'Monolith Cache',
    category: 'exchange',
    description: 'Trade fragments for random uncommon or rare held gear.',
    requiredMaterials: [{ itemId: 'monolith-fragment', quantity: 5 }],
    coinCost: 50,
    result: { kind: 'randomGear', minRarity: 'uncommon' },
    minLevel: 3,
    rarity: 'rare',
    repeatable: true,
  },
  {
    id: 'exchange-material-sell-bundle',
    name: 'Material Sell Bundle',
    category: 'exchange',
    description: 'Sell five common route materials for coins.',
    requiredMaterials: [{ kind: 'anyCommonMaterial', quantity: 5 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 25 },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'exchange-alpha-trophy',
    name: 'Alpha Trophy Exchange',
    category: 'exchange',
    description: 'Trade an Alpha Claw for 50 coins.',
    requiredMaterials: [{ itemId: 'material-alpha-claw', quantity: 1 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 50 },
    minLevel: 1,
    rarity: 'rare',
    repeatable: true,
  },
  {
    id: 'exchange-tide-pearl-coins',
    name: 'Pearl Bulk Sale',
    category: 'exchange',
    description: 'Tide Pearl x5 → 25 coins.',
    requiredMaterials: [{ itemId: 'tide-pearl', quantity: 5 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 25 },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'exchange-volt-thread-coins',
    name: 'Thread Bulk Sale',
    category: 'exchange',
    description: 'Volt Thread x5 → 30 coins.',
    requiredMaterials: [{ itemId: 'volt-thread', quantity: 5 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 30 },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'exchange-wild-seed-coins',
    name: 'Seed Bulk Sale',
    category: 'exchange',
    description: 'Wild Seed x5 → 25 coins.',
    requiredMaterials: [{ itemId: 'wild-seed', quantity: 5 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 25 },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'exchange-stone-chip-coins',
    name: 'Chip Bulk Sale',
    category: 'exchange',
    description: 'Stone Chip x5 → 25 coins.',
    requiredMaterials: [{ itemId: 'stone-chip', quantity: 5 }],
    coinCost: 0,
    result: { kind: 'coins', amount: 25 },
    minLevel: 1,
    rarity: 'common',
    repeatable: true,
  },
  {
    id: 'exchange-fragment-consumable',
    name: 'Fragment Distill',
    category: 'exchange',
    description: 'Monolith Fragment x3 → random consumable.',
    requiredMaterials: [{ itemId: 'monolith-fragment', quantity: 3 }],
    coinCost: 0,
    result: { kind: 'randomConsumable' },
    minLevel: 1,
    rarity: 'uncommon',
    repeatable: true,
  },
]

export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.id === id)
}

export function getRecipesByCategory(
  category: CraftingCategory,
): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((r) => r.category === category)
}
