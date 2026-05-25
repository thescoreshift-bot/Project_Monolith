import type { GearRarity } from './gearItems'

export type ItemCategory = 'consumable' | 'gear' | 'material' | 'keyItem'

export type ItemRarity = GearRarity

export type ItemUseEffect =
  | { type: 'healParty'; amount: number }
  | { type: 'healCreature'; amount: number }
  | { type: 'revive'; hpPercent: number }
  | {
      type: 'battleBuff'
      buffId: string
      stat: 'atk' | 'spAtk' | 'def' | 'spd'
      amount: number
      target: 'activeParty'
    }

export type ItemDefinition = {
  id: string
  name: string
  category: ItemCategory
  rarity: ItemRarity
  description: string
  stackable: boolean
  maxStack?: number
  useEffect?: ItemUseEffect
  price?: number
  sellValue?: number
  /** If true, item appears in shop consumables section */
  soldInShop?: boolean
}

export const ITEMS: Record<string, ItemDefinition> = {
  'small-potion': {
    id: 'small-potion',
    name: 'Small Potion',
    category: 'consumable',
    rarity: 'common',
    description: 'Heals all party creatures for 25 HP.',
    stackable: true,
    maxStack: 99,
    useEffect: { type: 'healParty', amount: 25 },
    price: 20,
    sellValue: 10,
    soldInShop: true,
  },
  'medium-potion': {
    id: 'medium-potion',
    name: 'Medium Potion',
    category: 'consumable',
    rarity: 'uncommon',
    description: 'Heals one creature for 50 HP.',
    stackable: true,
    maxStack: 99,
    useEffect: { type: 'healCreature', amount: 50 },
    price: 35,
    sellValue: 17,
    soldInShop: true,
  },
  'revival-herb': {
    id: 'revival-herb',
    name: 'Revival Herb',
    category: 'consumable',
    rarity: 'rare',
    description: 'Revives a fainted creature to 30% max HP.',
    stackable: true,
    maxStack: 20,
    useEffect: { type: 'revive', hpPercent: 0.3 },
    price: 55,
    sellValue: 27,
    soldInShop: true,
  },
  'battle-tonic': {
    id: 'battle-tonic',
    name: 'Battle Tonic',
    category: 'consumable',
    rarity: 'uncommon',
    description: '+5 ATK for active battle creatures in the next combat.',
    stackable: true,
    maxStack: 20,
    useEffect: {
      type: 'battleBuff',
      buffId: 'battle-tonic',
      stat: 'atk',
      amount: 5,
      target: 'activeParty',
    },
    price: 35,
    sellValue: 17,
    soldInShop: true,
  },
  'focus-charm': {
    id: 'focus-charm',
    name: 'Focus Charm',
    category: 'consumable',
    rarity: 'uncommon',
    description: '+5 SP.ATK for active battle creatures in the next combat.',
    stackable: true,
    maxStack: 20,
    useEffect: {
      type: 'battleBuff',
      buffId: 'focus-charm',
      stat: 'spAtk',
      amount: 5,
      target: 'activeParty',
    },
    price: 40,
    sellValue: 20,
    soldInShop: true,
  },
  'guard-dust': {
    id: 'guard-dust',
    name: 'Guard Dust',
    category: 'consumable',
    rarity: 'uncommon',
    description: '+5 DEF for active battle creatures in the next combat.',
    stackable: true,
    maxStack: 20,
    useEffect: {
      type: 'battleBuff',
      buffId: 'guard-dust',
      stat: 'def',
      amount: 5,
      target: 'activeParty',
    },
    price: 38,
    sellValue: 19,
    soldInShop: true,
  },
  'tide-tonic': {
    id: 'tide-tonic',
    name: 'Tide Tonic',
    category: 'consumable',
    rarity: 'common',
    description: 'Coastal tonic — heals all party creatures for 20 HP.',
    stackable: true,
    maxStack: 99,
    useEffect: { type: 'healParty', amount: 20 },
    sellValue: 12,
  },
  'seed-poultice': {
    id: 'seed-poultice',
    name: 'Seed Poultice',
    category: 'consumable',
    rarity: 'common',
    description: 'Wild seed salve — heals one creature for 35 HP.',
    stackable: true,
    maxStack: 99,
    useEffect: { type: 'healCreature', amount: 35 },
    sellValue: 10,
  },
  'speed-mint': {
    id: 'speed-mint',
    name: 'Speed Mint',
    category: 'consumable',
    rarity: 'uncommon',
    description: '+5 SPD for active battle creatures in the next combat.',
    stackable: true,
    maxStack: 20,
    useEffect: {
      type: 'battleBuff',
      buffId: 'speed-mint',
      stat: 'spd',
      amount: 5,
      target: 'activeParty',
    },
    price: 38,
    sellValue: 19,
    soldInShop: true,
  },
  'monolith-fragment': {
    id: 'monolith-fragment',
    name: 'Monolith Fragment',
    category: 'material',
    rarity: 'uncommon',
    description: 'A shard of ancient monolith stone. Used for crafting and events.',
    stackable: true,
    maxStack: 99,
    sellValue: 15,
  },
  'verdant-council-emblem': {
    id: 'verdant-council-emblem',
    name: 'Verdant Council Emblem',
    category: 'material',
    rarity: 'rare',
    description:
      'Proof you stood before The Verdant Council and prevailed. Progression keepsake.',
    stackable: false,
    maxStack: 1,
    sellValue: 0,
  },
  'material-alpha-claw': {
    id: 'material-alpha-claw',
    name: 'Alpha Claw',
    category: 'material',
    rarity: 'rare',
    description: 'A trophy claw from an alpha nest. Valuable crafting material.',
    stackable: true,
    maxStack: 99,
    sellValue: 40,
  },
  'ember-scale': {
    id: 'ember-scale',
    name: 'Ember Scale',
    category: 'material',
    rarity: 'common',
    description: 'Warm scale shed from fire-route creatures.',
    stackable: true,
    maxStack: 99,
    sellValue: 8,
  },
  'tide-pearl': {
    id: 'tide-pearl',
    name: 'Tide Pearl',
    category: 'material',
    rarity: 'common',
    description: 'Pearl formed in coastal circuit waters.',
    stackable: true,
    maxStack: 99,
    sellValue: 8,
  },
  'volt-thread': {
    id: 'volt-thread',
    name: 'Volt Thread',
    category: 'material',
    rarity: 'uncommon',
    description: 'Conductive fiber from storm nodes.',
    stackable: true,
    maxStack: 99,
    sellValue: 12,
  },
  'stone-chip': {
    id: 'stone-chip',
    name: 'Stone Chip',
    category: 'material',
    rarity: 'common',
    description: 'Chip of bedrock from ground-type dens.',
    stackable: true,
    maxStack: 99,
    sellValue: 8,
  },
  'wild-seed': {
    id: 'wild-seed',
    name: 'Wild Seed',
    category: 'material',
    rarity: 'common',
    description: 'Seed from overgrown route brush.',
    stackable: true,
    maxStack: 99,
    sellValue: 8,
  },
  'region-pass': {
    id: 'region-pass',
    name: 'Region Pass',
    category: 'keyItem',
    rarity: 'rare',
    description: 'Official pass to travel between sanctioned regions.',
    stackable: false,
  },
  'gym-token': {
    id: 'gym-token',
    name: 'Gym Token',
    category: 'keyItem',
    rarity: 'uncommon',
    description: 'Token earned from gym challengers.',
    stackable: true,
    maxStack: 8,
  },
  'ancient-badge-case': {
    id: 'ancient-badge-case',
    name: 'Ancient Badge Case',
    category: 'keyItem',
    rarity: 'epic',
    description: 'Relic case that once held champion badges.',
    stackable: false,
  },
}

export const SHOP_CONSUMABLE_ITEMS: ItemDefinition[] = Object.values(ITEMS).filter(
  (i) => i.soldInShop && i.category === 'consumable',
)

export function getItemDefinition(itemId: string): ItemDefinition | null {
  return ITEMS[itemId] ?? null
}
