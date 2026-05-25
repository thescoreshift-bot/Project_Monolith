/** @deprecated Shop catalog lives in items.ts — re-exports for compatibility. */
import { SHOP_CONSUMABLE_ITEMS, type ItemDefinition } from './items'

export type ShopItemId =
  | 'small-potion'
  | 'battle-tonic'
  | 'focus-charm'
  | 'medium-potion'
  | 'revival-herb'
  | 'guard-dust'
  | 'speed-mint'

export type ShopItem = {
  id: ShopItemId
  name: string
  cost: number
  description: string
  category: 'consumable'
  rarity: ItemDefinition['rarity']
}

export const SHOP_ITEMS: ShopItem[] = SHOP_CONSUMABLE_ITEMS.filter((i) =>
  [
    'small-potion',
    'battle-tonic',
    'focus-charm',
    'medium-potion',
    'revival-herb',
    'guard-dust',
    'speed-mint',
  ].includes(i.id),
).map((i) => ({
  id: i.id as ShopItemId,
  name: i.name,
  cost: i.price != null && i.price > 0 ? i.price : Math.max(8, Math.round((i.sellValue ?? 10) * 2.2)),
  description: i.description,
  category: 'consumable' as const,
  rarity: i.rarity,
}))
