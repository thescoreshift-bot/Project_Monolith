import type { CraftingRecipe } from '../data/craftingRecipes'
import type { GearItem, GearRarity } from '../data/gearItems'
import type { ItemDefinition } from '../data/items'
import type { ShopType } from './shopGeneration'

export type PurchaseSource =
  | 'shop'
  | 'driftMarket'
  | 'supplyCache'
  | 'wanderingTrader'
  | 'reliquary'
  | 'eventShop'
  | 'curator'
  | 'rareVendor'
  | 'alphaVendor'
  | 'monolithForge'
  | 'materialExchange'
  | 'forgeCraft'

const GEAR_RARITY_FALLBACK: Record<GearRarity, number> = {
  common: 25,
  uncommon: 60,
  rare: 125,
  epic: 250,
  mythic: 400,
  legendary: 500,
}

const MATERIAL_RARITY_FALLBACK: Record<string, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 80,
  legendary: 120,
}

const warnedInvalidPrices = new Set<string>()

export function shopTypeToPurchaseSource(shopType: ShopType): PurchaseSource {
  switch (shopType) {
    case 'cache':
      return 'supplyCache'
    case 'driftMarket':
      return 'driftMarket'
    case 'wanderingTrader':
      return 'wanderingTrader'
    case 'reliquary':
      return 'reliquary'
    case 'curator':
    case 'monolithVendor':
      return 'curator'
    case 'rareVendor':
      return 'rareVendor'
    case 'alphaVendor':
      return 'alphaVendor'
    case 'event':
      return 'eventShop'
    default:
      return 'shop'
  }
}

/** Forge-crafted gear — not sold in route shops (price 0 in data is intentional). */
export function isForgeOnlyGear(gearId: string): boolean {
  return gearId.startsWith('forge-')
}

export function isGearShopPurchasable(gear: GearItem): boolean {
  return !isForgeOnlyGear(gear.id)
}

function warnInvalidPurchasablePrice(
  itemId: string,
  itemName: string,
  source: PurchaseSource,
  rarity: string,
  price: number | undefined,
  fallbackPrice: number,
): void {
  const key = `${itemId}|${source}`
  if (warnedInvalidPrices.has(key)) return
  warnedInvalidPrices.add(key)
  console.warn('Invalid purchasable item price', {
    itemId,
    itemName,
    source,
    rarity,
    price,
    fallbackPrice,
  })
}

function fallbackGearPrice(rarity: GearRarity): number {
  return GEAR_RARITY_FALLBACK[rarity] ?? 25
}

function fallbackItemPrice(def: ItemDefinition): number {
  if (def.category === 'material') {
    return MATERIAL_RARITY_FALLBACK[def.rarity] ?? 10
  }
  return GEAR_RARITY_FALLBACK[def.rarity as GearRarity] ?? 25
}

/**
 * Coin cost to buy gear from a shop/vendor. Returns null if not purchasable here.
 */
export function getGearPurchasePrice(
  gear: GearItem,
  source: PurchaseSource,
): number | null {
  if (!isGearShopPurchasable(gear)) {
    return null
  }

  if (gear.price > 0) {
    return gear.price
  }

  const fallbackPrice = fallbackGearPrice(gear.rarity)
  warnInvalidPurchasablePrice(
    gear.id,
    gear.name,
    source,
    gear.rarity,
    gear.price,
    fallbackPrice,
  )
  return fallbackPrice
}

/**
 * Coin cost to buy a consumable/material from a shop.
 */
export function getItemPurchasePrice(
  def: ItemDefinition,
  source: PurchaseSource,
): number | null {
  if (def.price != null && def.price > 0) {
    return def.price
  }

  const fallbackPrice =
    def.sellValue != null && def.sellValue > 0
      ? Math.max(8, Math.round(def.sellValue * 2.2))
      : fallbackItemPrice(def)

  warnInvalidPurchasablePrice(
    def.id,
    def.name,
    source,
    def.rarity,
    def.price,
    fallbackPrice,
  )
  return fallbackPrice
}

/** @deprecated Prefer getItemPurchasePrice — kept for existing imports. */
export function getShopPriceForItem(
  def: ItemDefinition,
  source: PurchaseSource = 'shop',
): number {
  return getItemPurchasePrice(def, source) ?? fallbackItemPrice(def)
}

/** Coin cost shown/charged for Monolith Forge crafting (0 allowed for material-only exchange). */
export function getRecipeCraftCoinCost(recipe: CraftingRecipe): number {
  if (recipe.category === 'exchange' && recipe.coinCost <= 0) {
    return 0
  }
  if (recipe.coinCost > 0) {
    return recipe.coinCost
  }
  const fallback = recipe.rarity === 'legendary' ? 100 : recipe.rarity === 'epic' ? 40 : 10
  warnInvalidPurchasablePrice(
    recipe.id,
    recipe.name,
    'forgeCraft',
    recipe.rarity,
    recipe.coinCost,
    fallback,
  )
  return fallback
}

export function formatPurchaseCostLabel(price: number | null): string {
  if (price == null) return 'Price unavailable'
  return `${price} coins`
}
