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
  | { kind: 'material'; itemId: string; quantity: number }
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

const MATERIAL_EXCHANGE_RATE = 5

const EXCHANGEABLE_MATERIALS = [
  { id: 'ember-scale', name: 'Ember Scale' },
  { id: 'tide-pearl', name: 'Tide Pearl' },
  { id: 'volt-thread', name: 'Volt Thread' },
  { id: 'stone-chip', name: 'Stone Chip' },
  { id: 'wild-seed', name: 'Wild Seed' },
] as const

function buildMaterialExchangeRecipes(): CraftingRecipe[] {
  const recipes: CraftingRecipe[] = []
  for (const from of EXCHANGEABLE_MATERIALS) {
    for (const to of EXCHANGEABLE_MATERIALS) {
      if (from.id === to.id) continue
      recipes.push({
        id: `exchange-${from.id}-to-${to.id}`,
        name: `${from.name} → ${to.name}`,
        category: 'exchange',
        description: `Even swap: ${MATERIAL_EXCHANGE_RATE} ${from.name} for ${MATERIAL_EXCHANGE_RATE} ${to.name}.`,
        requiredMaterials: [{ itemId: from.id, quantity: MATERIAL_EXCHANGE_RATE }],
        coinCost: 0,
        result: { kind: 'material', itemId: to.id, quantity: MATERIAL_EXCHANGE_RATE },
        minLevel: 1,
        rarity: 'common',
        repeatable: true,
      })
    }
  }
  return recipes
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
    id: 'craft-forge-flameheart',
    name: 'Forge Flameheart',
    category: 'gear',
    description:
      'Epic held gear — outclasses route drops: ATK/SP.ATK + Fire +10%.',
    requiredMaterials: [
      { itemId: 'ember-scale', quantity: 6 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 40,
    result: { kind: 'gear', gearId: 'forge-flameheart' },
    minLevel: 8,
    rarity: 'epic',
    repeatable: true,
  },
  {
    id: 'craft-forge-tideheart',
    name: 'Forge Tideheart',
    category: 'gear',
    description:
      'Epic held gear — outclasses route drops: SP.ATK/SP.DEF + Water +10%.',
    requiredMaterials: [
      { itemId: 'tide-pearl', quantity: 6 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 40,
    result: { kind: 'gear', gearId: 'forge-tideheart' },
    minLevel: 8,
    rarity: 'epic',
    repeatable: true,
  },
  {
    id: 'craft-forge-verdant-sigil',
    name: 'Forge Verdant Sigil',
    category: 'gear',
    description:
      'Epic held gear — outclasses route drops: ATK/DEF + Grass +10%.',
    requiredMaterials: [
      { itemId: 'wild-seed', quantity: 6 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 40,
    result: { kind: 'gear', gearId: 'forge-verdant-sigil' },
    minLevel: 8,
    rarity: 'epic',
    repeatable: true,
  },
  {
    id: 'craft-forge-stormcoil',
    name: 'Forge Stormcoil',
    category: 'gear',
    description:
      'Epic held gear — outclasses route drops: SPD/SP.ATK + Electric +10%.',
    requiredMaterials: [
      { itemId: 'volt-thread', quantity: 6 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 40,
    result: { kind: 'gear', gearId: 'forge-stormcoil' },
    minLevel: 8,
    rarity: 'epic',
    repeatable: true,
  },
  {
    id: 'craft-forge-bedrock-ward',
    name: 'Forge Bedrock Ward',
    category: 'gear',
    description:
      'Epic held gear — outclasses route drops: HP/DEF + Ground +10%.',
    requiredMaterials: [
      { itemId: 'stone-chip', quantity: 6 },
      { itemId: 'monolith-fragment', quantity: 2 },
    ],
    coinCost: 40,
    result: { kind: 'gear', gearId: 'forge-bedrock-ward' },
    minLevel: 8,
    rarity: 'epic',
    repeatable: true,
  },
  {
    id: 'craft-forge-solar-crown',
    name: 'Forge Solar Crown',
    category: 'gear',
    description:
      'Legendary held gear — stronger than shop crowns: Fire +14%, all +5%.',
    requiredMaterials: [
      { itemId: 'ember-scale', quantity: 8 },
      { itemId: 'monolith-fragment', quantity: 4 },
      { itemId: 'material-alpha-claw', quantity: 1 },
    ],
    coinCost: 100,
    result: { kind: 'gear', gearId: 'forge-solar-crown' },
    minLevel: 12,
    rarity: 'legendary',
    repeatable: true,
  },
  {
    id: 'craft-forge-abyss-bind',
    name: 'Forge Abyss Bind',
    category: 'gear',
    description:
      'Legendary held gear — stronger than shop crowns: Water +14%, all +5%.',
    requiredMaterials: [
      { itemId: 'tide-pearl', quantity: 8 },
      { itemId: 'monolith-fragment', quantity: 4 },
      { itemId: 'material-alpha-claw', quantity: 1 },
    ],
    coinCost: 100,
    result: { kind: 'gear', gearId: 'forge-abyss-bind' },
    minLevel: 12,
    rarity: 'legendary',
    repeatable: true,
  },
  {
    id: 'craft-forge-worldroot-relic',
    name: 'Forge Worldroot Relic',
    category: 'gear',
    description:
      'Legendary held gear — stronger than shop crowns: Grass +14%, all +5%.',
    requiredMaterials: [
      { itemId: 'wild-seed', quantity: 8 },
      { itemId: 'monolith-fragment', quantity: 4 },
      { itemId: 'material-alpha-claw', quantity: 1 },
    ],
    coinCost: 100,
    result: { kind: 'gear', gearId: 'forge-worldroot-relic' },
    minLevel: 12,
    rarity: 'legendary',
    repeatable: true,
  },
  {
    id: 'craft-forge-voltaic-relic',
    name: 'Forge Voltaic Relic',
    category: 'gear',
    description:
      'Legendary held gear — stronger than shop crowns: Electric +14%, all +5%.',
    requiredMaterials: [
      { itemId: 'volt-thread', quantity: 8 },
      { itemId: 'monolith-fragment', quantity: 4 },
      { itemId: 'material-alpha-claw', quantity: 1 },
    ],
    coinCost: 100,
    result: { kind: 'gear', gearId: 'forge-voltaic-relic' },
    minLevel: 12,
    rarity: 'legendary',
    repeatable: true,
  },
  {
    id: 'craft-forge-earthshaper-relic',
    name: 'Forge Earthshaper Relic',
    category: 'gear',
    description:
      'Legendary held gear — stronger than shop crowns: Ground +14%, all +5%.',
    requiredMaterials: [
      { itemId: 'stone-chip', quantity: 8 },
      { itemId: 'monolith-fragment', quantity: 4 },
      { itemId: 'material-alpha-claw', quantity: 1 },
    ],
    coinCost: 100,
    result: { kind: 'gear', gearId: 'forge-earthshaper-relic' },
    minLevel: 12,
    rarity: 'legendary',
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
  ...buildMaterialExchangeRecipes(),
]

export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.id === id)
}

export function getRecipesByCategory(
  category: CraftingCategory,
): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((r) => r.category === category)
}
