import { GEAR_ITEM_LIST, getGearItem, type GearItem, type GearRarity } from '../data/gearItems'
import { isGearShopPurchasable } from './itemPurchasePrice'
import { SHOP_CONSUMABLE_ITEMS } from '../data/items'
import type { NodeType } from '../data/nodeMap'
import { getRegion } from '../data/regions'
import type { ElementType } from '../data/starters'
import { createSeededRng } from './seededRandom'

export type ShopType =
  | 'normal'
  | 'event'
  | 'driftMarket'
  | 'wanderingTrader'
  | 'reliquary'
  | 'curator'
  | 'cache'
  | 'rareVendor'
  | 'alphaVendor'
  | 'monolithVendor'

export type PersistedShopInventory = {
  gearIds: string[]
  itemIds: string[]
  shopType: ShopType
}

export type GeneratedShopInventory = PersistedShopInventory & {
  rarityBreakdown: Record<string, number>
}

export type GenerateShopInventoryParams = {
  shopType: ShopType
  region: string
  playerLevel: number
  partyTypes: ElementType[]
  seed: string
  nodeId?: string
  nodeLabel?: string
  rarityBias?: 'standard' | 'premium' | 'budget'
  previousShopHistory?: string[]
}

const RARITY_ORDER: GearRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'mythic',
  'legendary',
]

const HIGH_RARITIES = new Set<GearRarity>(['epic', 'mythic', 'legendary'])

const MATERIAL_POOL = [
  'monolith-fragment',
  'ember-shard',
  'tide-pearl',
  'volt-thread',
  'stone-chip',
  'wild-seed',
  'material-alpha-claw',
]

const THEME_TO_ELEMENT: Record<string, ElementType> = {
  grass: 'Grass',
  fire: 'Fire',
  water: 'Water',
  electric: 'Electric',
  ground: 'Ground',
  dark: 'Ground',
}

function regionElement(regionId: string): ElementType | null {
  const theme = getRegion(regionId).theme
  return THEME_TO_ELEMENT[theme] ?? null
}

/** Map node label + type to a specialized shop identity. */
export function resolveShopType(nodeType: NodeType, label: string): ShopType {
  const lower = label.toLowerCase()
  if (lower.includes('alpha')) return 'alphaVendor'
  if (lower.includes('monolith') && lower.includes('curator')) return 'curator'
  if (lower.includes('curator')) return 'curator'
  if (lower.includes('reliquary') || lower.includes('ash')) return 'reliquary'
  if (nodeType === 'relicShop') return 'reliquary'
  if (lower.includes('drift')) return 'driftMarket'
  if (lower.includes('wander')) return 'wanderingTrader'
  if (lower.includes('cache') || lower.includes('supply')) return 'cache'
  if (lower.includes('relic') || lower.includes('vault')) return 'reliquary'
  if (nodeType === 'shop') return 'driftMarket'
  return 'normal'
}

function gearAffinity(gear: GearItem): ElementType | 'universal' | null {
  const dmg = gear.damageModifiers
  if (!dmg) return null
  if (dmg.all) return 'universal'
  const keys = (Object.keys(dmg) as (ElementType | 'all')[]).filter(
    (k) => k !== 'all' && typeof dmg[k as ElementType] === 'number',
  ) as ElementType[]
  if (keys.length === 1) return keys[0]
  if (keys.length > 1) return keys[0]
  return null
}

function gearTags(gear: GearItem): string[] {
  const tags = new Set<string>()
  const dmg = gear.damageModifiers
  if (dmg?.all || (dmg && Object.keys(dmg).some((k) => k !== 'all' && dmg[k as ElementType]))) {
    tags.add('offensive')
  }
  const s = gear.statModifiers
  if ((s.spd ?? 0) >= 4) tags.add('speed')
  if ((s.def ?? 0) + (s.spDef ?? 0) + (s.maxHp ?? 0) >= 8 && !tags.has('offensive')) {
    tags.add('defensive')
  }
  if ((s.atk ?? 0) + (s.spAtk ?? 0) >= 6) tags.add('offensive')
  if (!tags.size) tags.add('support')
  const aff = gearAffinity(gear)
  if (aff && aff !== 'universal') tags.add('elemental')
  if (aff === 'universal') tags.add('universal')
  return [...tags]
}

function buildRarityBreakdown(gearIds: string[]): Record<string, number> {
  const breakdown: Record<string, number> = {}
  for (const id of gearIds) {
    const g = getGearItem(id)
    if (!g) continue
    breakdown[g.rarity] = (breakdown[g.rarity] ?? 0) + 1
  }
  return breakdown
}

function levelRarityWeights(
  level: number,
  shopType: ShopType,
): Record<GearRarity, number> {
  const premium =
    shopType === 'reliquary' ||
    shopType === 'curator' ||
    shopType === 'rareVendor' ||
    shopType === 'monolithVendor'

  if (level <= 9) {
    return premium
      ? { common: 0, uncommon: 2, rare: 4, epic: 3, mythic: 1, legendary: 0.5 }
      : { common: 6, uncommon: 4, rare: 2, epic: 0.5, mythic: 0, legendary: 0 }
  }
  if (level <= 14) {
    return premium
      ? { common: 0, uncommon: 1, rare: 3, epic: 5, mythic: 2, legendary: 1 }
      : { common: 4, uncommon: 5, rare: 4, epic: 1.5, mythic: 0.3, legendary: 0 }
  }
  if (level <= 24) {
    return premium
      ? { common: 0, uncommon: 1, rare: 2, epic: 5, mythic: 3, legendary: 1.5 }
      : { common: 2, uncommon: 4, rare: 5, epic: 3, mythic: 1, legendary: 0.3 }
  }
  return premium
    ? { common: 0, uncommon: 0, rare: 2, epic: 4, mythic: 4, legendary: 2 }
    : { common: 1, uncommon: 3, rare: 4, epic: 4, mythic: 2, legendary: 1 }
}

function pickWeightedRarity(
  rng: () => number,
  weights: Record<GearRarity, number>,
): GearRarity {
  const entries = RARITY_ORDER.filter((r) => (weights[r] ?? 0) > 0)
  const total = entries.reduce((s, r) => s + (weights[r] ?? 0), 0)
  let roll = rng() * total
  for (const r of entries) {
    roll -= weights[r] ?? 0
    if (roll <= 0) return r
  }
  return entries[entries.length - 1] ?? 'common'
}

function filterGearPool(opts: {
  minRarity?: GearRarity
  maxRarity?: GearRarity
  rarities?: Set<GearRarity>
  regionElement?: ElementType | null
  partyTypes?: ElementType[]
  tag?: string
  universalOnly?: boolean
  excludeIds: Set<string>
  antiRepeat: Set<string>
}): GearItem[] {
  let pool = GEAR_ITEM_LIST.filter(
    (g) => !opts.excludeIds.has(g.id) && isGearShopPurchasable(g),
  )

  if (opts.rarities) {
    pool = pool.filter((g) => opts.rarities!.has(g.rarity))
  }
  if (opts.minRarity) {
    const minIdx = RARITY_ORDER.indexOf(opts.minRarity)
    pool = pool.filter((g) => RARITY_ORDER.indexOf(g.rarity) >= minIdx)
  }
  if (opts.maxRarity) {
    const maxIdx = RARITY_ORDER.indexOf(opts.maxRarity)
    pool = pool.filter((g) => RARITY_ORDER.indexOf(g.rarity) <= maxIdx)
  }
  if (opts.universalOnly) {
    pool = pool.filter((g) => gearAffinity(g) === 'universal')
  }
  if (opts.regionElement) {
    const regional = pool.filter((g) => gearAffinity(g) === opts.regionElement)
    if (regional.length > 0) pool = regional
  }
  if (opts.partyTypes?.length) {
    const typed = pool.filter((g) => {
      const aff = gearAffinity(g)
      return aff && aff !== 'universal' && opts.partyTypes!.includes(aff)
    })
    if (typed.length > 0) pool = typed
  }
  if (opts.tag) {
    const tagged = pool.filter((g) => gearTags(g).includes(opts.tag!))
    if (tagged.length > 0) pool = tagged
  }

  const withoutRepeat = pool.filter((g) => !opts.antiRepeat.has(g.id))
  return withoutRepeat.length > 0 ? withoutRepeat : pool
}

function pickGear(
  rng: () => number,
  pool: GearItem[],
  exclude: Set<string>,
): GearItem | null {
  const available = pool.filter((g) => !exclude.has(g.id))
  if (available.length === 0) return null
  const idx = Math.floor(rng() * available.length)
  return available[idx] ?? null
}

function pickGearWithRarity(
  rng: () => number,
  weights: Record<GearRarity, number>,
  filters: Omit<Parameters<typeof filterGearPool>[0], 'excludeIds' | 'antiRepeat'>,
  exclude: Set<string>,
  antiRepeat: Set<string>,
): GearItem | null {
  const rarity = pickWeightedRarity(rng, weights)
  const rarities = new Set<GearRarity>([rarity])
  let pool = filterGearPool({ ...filters, rarities, excludeIds: exclude, antiRepeat })
  if (pool.length === 0) {
    pool = filterGearPool({ ...filters, excludeIds: exclude, antiRepeat: new Set() })
  }
  if (pool.length === 0) {
    pool = GEAR_ITEM_LIST.filter(
      (g) => !exclude.has(g.id) && isGearShopPurchasable(g),
    )
  }
  if (pool.length === 1 && HIGH_RARITIES.has(pool[0].rarity)) {
    console.warn(
      'Rare shop pool has only one valid item for this filter.',
      { rarity: pool[0].rarity, id: pool[0].id, filters },
    )
  }
  return pickGear(rng, pool, exclude)
}

function pickItems(
  rng: () => number,
  pool: string[],
  count: number,
  exclude: Set<string>,
): string[] {
  const available = pool.filter((id) => !exclude.has(id))
  const shuffled = [...available].sort(() => rng() - 0.5)
  const picked: string[] = []
  for (const id of shuffled) {
    if (picked.length >= count) break
    if (!exclude.has(id)) {
      picked.push(id)
      exclude.add(id)
    }
  }
  return picked
}

function consumablePool(): string[] {
  return SHOP_CONSUMABLE_ITEMS.map((i) => i.id)
}

function materialPoolForShop(shopType: ShopType, regionId: string): string[] {
  if (shopType === 'curator' || shopType === 'monolithVendor') {
    return ['monolith-fragment', 'ember-shard', 'tide-pearl', 'volt-thread', 'stone-chip']
  }
  if (shopType === 'alphaVendor') {
    return ['material-alpha-claw', 'monolith-fragment', 'ember-shard']
  }
  if (shopType === 'reliquary') {
    const el = regionElement(regionId)
    if (el === 'Fire') return ['ember-shard', 'monolith-fragment']
    if (el === 'Water') return ['tide-pearl', 'monolith-fragment']
    return ['monolith-fragment']
  }
  return MATERIAL_POOL
}

function rollGearSlots(
  rng: () => number,
  count: number,
  weights: Record<GearRarity, number>,
  regionId: string,
  partyTypes: ElementType[],
  antiRepeat: Set<string>,
  distribution: { universal: number; region: number; party: number; random: number },
): string[] {
  const exclude = new Set<string>()
  const regEl = regionElement(regionId)
  const slots: string[] = []

  const plan: Array<'universal' | 'region' | 'party' | 'random'> = []
  for (let i = 0; i < distribution.universal; i++) plan.push('universal')
  for (let i = 0; i < distribution.region; i++) plan.push('region')
  for (let i = 0; i < distribution.party; i++) plan.push('party')
  while (plan.length < count) plan.push('random')
  while (plan.length > count) plan.pop()

  const shuffledPlan = plan.sort(() => rng() - 0.5)

  for (const kind of shuffledPlan) {
    if (slots.length >= count) break
    let item: GearItem | null = null
    if (kind === 'universal') {
      item = pickGearWithRarity(rng, weights, { universalOnly: true }, exclude, antiRepeat)
    } else if (kind === 'region' && regEl) {
      item = pickGearWithRarity(
        rng,
        weights,
        { regionElement: regEl },
        exclude,
        antiRepeat,
      )
    } else if (kind === 'party' && partyTypes.length > 0) {
      item = pickGearWithRarity(
        rng,
        weights,
        { partyTypes },
        exclude,
        antiRepeat,
      )
    } else {
      item = pickGearWithRarity(rng, weights, {}, exclude, antiRepeat)
    }
    if (!item) continue
    exclude.add(item.id)
    slots.push(item.id)
    if (HIGH_RARITIES.has(item.rarity)) antiRepeat.add(item.id)
  }

  while (slots.length < count) {
    const item = pickGearWithRarity(rng, weights, {}, exclude, antiRepeat)
    if (!item) break
    exclude.add(item.id)
    slots.push(item.id)
    if (HIGH_RARITIES.has(item.rarity)) antiRepeat.add(item.id)
  }

  return slots
}

function configForShopType(shopType: ShopType): {
  gearCount: number
  itemCount: number
  premium: boolean
  gearDistribution: { universal: number; region: number; party: number; random: number }
} {
  switch (shopType) {
    case 'reliquary':
    case 'rareVendor':
      return {
        gearCount: 4,
        itemCount: 1,
        premium: true,
        gearDistribution: { universal: 2, region: 1, party: 1, random: 0 },
      }
    case 'curator':
    case 'monolithVendor':
      return {
        gearCount: 2,
        itemCount: 4,
        premium: false,
        gearDistribution: { universal: 1, region: 1, party: 0, random: 0 },
      }
    case 'alphaVendor':
      return {
        gearCount: 3,
        itemCount: 2,
        premium: true,
        gearDistribution: { universal: 1, region: 0, party: 1, random: 1 },
      }
    case 'wanderingTrader':
      return {
        gearCount: 1,
        itemCount: 4,
        premium: false,
        gearDistribution: { universal: 0, region: 1, party: 0, random: 0 },
      }
    case 'cache':
      return {
        gearCount: 2,
        itemCount: 3,
        premium: false,
        gearDistribution: { universal: 1, region: 1, party: 0, random: 0 },
      }
    case 'driftMarket':
    case 'event':
      return {
        gearCount: 3,
        itemCount: 3,
        premium: false,
        gearDistribution: { universal: 1, region: 1, party: 1, random: 0 },
      }
    case 'normal':
    default:
      return {
        gearCount: 3,
        itemCount: 2,
        premium: false,
        gearDistribution: { universal: 1, region: 1, party: 0, random: 1 },
      }
  }
}

/**
 * Central shop inventory roll — used by map shops, relic vendors, and reward shortcuts.
 */
export function generateShopInventory(
  params: GenerateShopInventoryParams,
): GeneratedShopInventory {
  const {
    shopType,
    region,
    playerLevel,
    partyTypes,
    seed,
    nodeId,
    nodeLabel,
    previousShopHistory = [],
  } = params

  const rngSeed = [seed, shopType, region, String(playerLevel), nodeId ?? '', nodeLabel ?? ''].join('|')
  const rng = createSeededRng(rngSeed)
  const antiRepeat = new Set(
    previousShopHistory.filter((id) => {
      const g = getGearItem(id)
      return g && HIGH_RARITIES.has(g.rarity)
    }),
  )

  const cfg = configForShopType(shopType)
  const weights = levelRarityWeights(playerLevel, shopType)
  if (params.rarityBias === 'premium') {
    weights.legendary = (weights.legendary ?? 0) * 1.5
    weights.mythic = (weights.mythic ?? 0) * 1.5
  } else if (params.rarityBias === 'budget') {
    weights.legendary = 0
    weights.mythic = 0
  }

  const gearIds = rollGearSlots(
    rng,
    cfg.gearCount,
    weights,
    region,
    partyTypes,
    antiRepeat,
    cfg.gearDistribution,
  )

  const itemExclude = new Set<string>()
  const itemIds: string[] = []
  const matPool = materialPoolForShop(shopType, region)
  const consPool = consumablePool()

  if (shopType === 'wanderingTrader' || shopType === 'cache') {
    itemIds.push(...pickItems(rng, consPool, Math.min(3, cfg.itemCount), itemExclude))
    itemIds.push(
      ...pickItems(rng, matPool, Math.max(0, cfg.itemCount - itemIds.length), itemExclude),
    )
  } else if (shopType === 'curator' || shopType === 'monolithVendor') {
    itemIds.push(...pickItems(rng, matPool, cfg.itemCount, itemExclude))
  } else if (shopType === 'reliquary' || shopType === 'rareVendor') {
    if (cfg.itemCount > 0) {
      itemIds.push(...pickItems(rng, matPool, 1, itemExclude))
    }
  } else {
    const consN = Math.min(2, cfg.itemCount)
    itemIds.push(...pickItems(rng, consPool, consN, itemExclude))
    itemIds.push(
      ...pickItems(rng, matPool, Math.max(0, cfg.itemCount - consN), itemExclude),
    )
  }

  const rarityBreakdown = buildRarityBreakdown(gearIds)
  const allIds = [...gearIds, ...itemIds]

  console.log('Generated shop inventory', {
    shopType,
    region,
    playerLevel,
    seed: rngSeed,
    nodeId,
    nodeLabel,
    itemIds: allIds,
    rarityBreakdown,
  })

  const shopGearIds = gearIds.filter((id) => {
    const g = getGearItem(id)
    return g != null && isGearShopPurchasable(g)
  })

  return {
    gearIds: shopGearIds,
    itemIds,
    shopType,
    rarityBreakdown: buildRarityBreakdown(shopGearIds),
  }
}

export { getShopPriceForItem } from './itemPurchasePrice'

export function isPremiumShopType(shopType: ShopType): boolean {
  return (
    shopType === 'reliquary' ||
    shopType === 'rareVendor' ||
    shopType === 'alphaVendor' ||
    shopType === 'monolithVendor' ||
    shopType === 'curator'
  )
}
