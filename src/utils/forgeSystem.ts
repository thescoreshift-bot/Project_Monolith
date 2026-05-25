import type { CraftingRecipe, MaterialRequirement } from '../data/craftingRecipes'
import { getCraftingRecipeById } from '../data/craftingRecipes'
import { getItemDefinition } from '../data/items'
import {
  GEAR_ITEM_LIST,
  getGearItem,
  type GearItem,
  type GearRarity,
  type GearStatModifiers,
} from '../data/gearItems'
import type { RunCreature } from './progression'
import { addCoins } from './progression'
import { spendCoins } from './recoveryStation'
import type { TrainerInventory, InventoryItem } from './inventorySystem'
import {
  addInventoryItemEntry,
  addItemToTrainerInventory,
  inventoryItemFromGear,
  removeInventoryItemByInstanceId,
} from './inventorySystem'
import { rollShopGearOffers } from './gearSystem'

export const DEFAULT_MAX_GEAR_UPGRADE = 5

export const COMMON_MATERIAL_IDS = [
  'ember-scale',
  'tide-pearl',
  'volt-thread',
  'stone-chip',
  'wild-seed',
] as const

export type MaterialCount = { itemId: string; have: number; need: number }

export type RecipeAffordability = {
  canCraft: boolean
  missingMaterials: MaterialCount[]
  coinsHave: number
  coinsNeed: number
  meetsLevel: boolean
}

export type ForgeCraftResult = {
  ok: true
  starter: RunCreature
  inventory: TrainerInventory
  message: string
  usedAlphaClaw: boolean
  craftedGear: boolean
  craftedConsumable: boolean
  exchanged: boolean
} | {
  ok: false
  reason: string
}

export type ForgeUpgradeResult = {
  ok: true
  inventory: TrainerInventory
  starter: RunCreature
  recruits: import('./party').PartyCreature[]
  message: string
} | {
  ok: false
  reason: string
}

function countMaterial(inv: TrainerInventory, itemId: string): number {
  const entry = inv.materials.find((m) => m.itemId === itemId)
  return entry?.quantity ?? 0
}

function countCommonMaterials(inv: TrainerInventory): number {
  return COMMON_MATERIAL_IDS.reduce((sum, id) => sum + countMaterial(inv, id), 0)
}

export function getMaterialCountsForRequirement(
  inv: TrainerInventory,
  req: MaterialRequirement,
): MaterialCount[] {
  if ('kind' in req && req.kind === 'anyCommonMaterial') {
    const have = countCommonMaterials(inv)
    return [{ itemId: 'any-common', have, need: req.quantity }]
  }
  if ('itemId' in req) {
    return [
      {
        itemId: req.itemId,
        have: countMaterial(inv, req.itemId),
        need: req.quantity,
      },
    ]
  }
  return []
}

export function checkRecipeAffordability(
  recipe: CraftingRecipe,
  inv: TrainerInventory,
  coins: number,
  partyLevel: number,
): RecipeAffordability {
  const missingMaterials: MaterialCount[] = []
  for (const req of recipe.requiredMaterials) {
    const counts = getMaterialCountsForRequirement(inv, req)
    for (const c of counts) {
      if (c.have < c.need) missingMaterials.push(c)
    }
  }
  return {
    canCraft:
      missingMaterials.length === 0 &&
      coins >= recipe.coinCost &&
      partyLevel >= recipe.minLevel,
    missingMaterials,
    coinsHave: coins,
    coinsNeed: recipe.coinCost,
    meetsLevel: partyLevel >= recipe.minLevel,
  }
}

function removeMaterialQuantity(
  inv: TrainerInventory,
  itemId: string,
  quantity: number,
): TrainerInventory {
  let remaining = quantity
  let next = inv
  const entries = [...inv.materials]
  for (const entry of entries) {
    if (entry.itemId !== itemId || remaining <= 0) continue
    const take = Math.min(entry.quantity, remaining)
    next = removeInventoryItemByInstanceId(next, entry.id, take)
    remaining -= take
  }
  return next
}

function removeAnyCommonMaterials(
  inv: TrainerInventory,
  quantity: number,
): TrainerInventory {
  let next = inv
  let remaining = quantity
  for (const id of COMMON_MATERIAL_IDS) {
    while (remaining > 0 && countMaterial(next, id) > 0) {
      const entry = next.materials.find((m) => m.itemId === id)
      if (!entry) break
      const take = Math.min(entry.quantity, remaining)
      next = removeInventoryItemByInstanceId(next, entry.id, take)
      remaining -= take
    }
    if (remaining <= 0) break
  }
  return next
}

function consumeRecipeMaterials(
  inv: TrainerInventory,
  recipe: CraftingRecipe,
): TrainerInventory {
  let next = inv
  for (const req of recipe.requiredMaterials) {
    if ('kind' in req && req.kind === 'anyCommonMaterial') {
      next = removeAnyCommonMaterials(next, req.quantity)
    } else if ('itemId' in req) {
      next = removeMaterialQuantity(next, req.itemId, req.quantity)
    }
  }
  return next
}

function rollRandomGear(minRarity: GearRarity, regionId: string): string | null {
  const order: GearRarity[] = ['common', 'uncommon', 'rare', 'epic']
  const start = order.indexOf(minRarity)
  const allowed = new Set(order.slice(Math.max(0, start)))
  const pool = GEAR_ITEM_LIST.filter((g) => allowed.has(g.rarity))
  const offers = rollShopGearOffers(regionId)
  for (const id of offers) {
    const g = getGearItem(id)
    if (g && allowed.has(g.rarity)) return id
  }
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? null
}

const RANDOM_CONSUMABLE_POOL = [
  'small-potion',
  'medium-potion',
  'tide-tonic',
  'seed-poultice',
  'battle-tonic',
]

function applyCraftResult(
  starter: RunCreature,
  inv: TrainerInventory,
  recipe: CraftingRecipe,
  regionId: string,
): { starter: RunCreature; inventory: TrainerInventory; message: string; flags: {
  usedAlphaClaw: boolean
  craftedGear: boolean
  craftedConsumable: boolean
  exchanged: boolean
} } {
  let nextInv = inv
  let nextStarter = starter
  let message = ''
  const flags = {
    usedAlphaClaw: false,
    craftedGear: false,
    craftedConsumable: false,
    exchanged: recipe.category === 'exchange',
  }

  for (const req of recipe.requiredMaterials) {
    if (
      'itemId' in req &&
      req.itemId === 'material-alpha-claw'
    ) {
      flags.usedAlphaClaw = true
    }
  }

  const result = recipe.result
  switch (result.kind) {
    case 'consumable': {
      nextInv = addItemToTrainerInventory(nextInv, result.itemId, 1)
      const name = getItemDefinition(result.itemId)?.name ?? result.itemId
      message = `Crafted ${name}.`
      flags.craftedConsumable = true
      break
    }
    case 'gear': {
      nextInv = addForgedGearToInventory(nextInv, result.gearId)
      const name = getGearItem(result.gearId)?.name ?? result.gearId
      message = `Forged ${name}.`
      flags.craftedGear = true
      break
    }
    case 'material': {
      nextInv = addItemToTrainerInventory(
        nextInv,
        result.itemId,
        result.quantity,
      )
      const name = getItemDefinition(result.itemId)?.name ?? result.itemId
      message = `Received ${result.quantity}× ${name}.`
      break
    }
    case 'randomGear': {
      const gearId = rollRandomGear(result.minRarity, regionId)
      if (!gearId) {
        nextStarter = addCoins(nextStarter, 30)
        message = 'Cache was empty — received 30 coins instead.'
      } else {
        nextInv = addForgedGearToInventory(nextInv, gearId)
        message = `Opened cache: ${getGearItem(gearId)?.name ?? gearId}.`
        flags.craftedGear = true
      }
      break
    }
    case 'randomConsumable': {
      const id =
        RANDOM_CONSUMABLE_POOL[
          Math.floor(Math.random() * RANDOM_CONSUMABLE_POOL.length)
        ]!
      nextInv = addItemToTrainerInventory(nextInv, id, 1)
      message = `Distilled ${getItemDefinition(id)?.name ?? id}.`
      flags.craftedConsumable = true
      break
    }
  }

  return { starter: nextStarter, inventory: nextInv, message, flags }
}

export function craftRecipe(
  recipeId: string,
  starter: RunCreature,
  inventory: TrainerInventory,
  partyLevel: number,
  regionId: string,
): ForgeCraftResult {
  const recipe = getCraftingRecipeById(recipeId)
  if (!recipe) return { ok: false, reason: 'Unknown recipe.' }

  const check = checkRecipeAffordability(recipe, inventory, starter.coins, partyLevel)
  if (!check.meetsLevel) return { ok: false, reason: 'Party level too low for this recipe.' }
  if (!check.canCraft) {
    if (starter.coins < recipe.coinCost) {
      return { ok: false, reason: 'Not enough coins.' }
    }
    return { ok: false, reason: 'Missing required materials.' }
  }

  let nextInv = consumeRecipeMaterials(inventory, recipe)
  let nextStarter =
    recipe.coinCost > 0 ? spendCoins(starter, recipe.coinCost) : starter

  const applied = applyCraftResult(nextStarter, nextInv, recipe, regionId)
  return {
    ok: true,
    starter: applied.starter,
    inventory: applied.inventory,
    message: applied.message,
    ...applied.flags,
  }
}

function getPrimaryStatKey(m: GearStatModifiers): keyof GearStatModifiers | null {
  const keys: (keyof GearStatModifiers)[] = [
    'atk',
    'def',
    'spAtk',
    'spDef',
    'spd',
    'maxHp',
  ]
  let best: keyof GearStatModifiers | null = null
  let bestVal = 0
  for (const k of keys) {
    const v = m[k] ?? 0
    if (v > bestVal) {
      bestVal = v
      best = k
    }
  }
  return best
}

export function computeUpgradeStatBonus(
  gear: GearItem,
  upgradeLevel: number,
): GearStatModifiers {
  if (upgradeLevel <= 0) return {}
  const bonus: GearStatModifiers = {}
  const primary = getPrimaryStatKey(gear.statModifiers)
  if (primary) {
    bonus[primary] = upgradeLevel
  }
  if (gear.statModifiers.maxHp) {
    bonus.maxHp = upgradeLevel * 2
  }
  return bonus
}

export function computeUpgradeDamageBonus(
  gear: GearItem,
  upgradeLevel: number,
): number {
  if (!gear.damageModifiers || upgradeLevel <= 0) return 0
  return Math.floor(upgradeLevel / 2) * 0.01
}

export function getEffectiveGearStatModifiers(
  gear: GearItem | null,
  upgradeLevel = 0,
): GearStatModifiers {
  if (!gear) return {}
  const base = gear.statModifiers
  const bonus = computeUpgradeStatBonus(gear, upgradeLevel)
  return {
    atk: (base.atk ?? 0) + (bonus.atk ?? 0),
    def: (base.def ?? 0) + (bonus.def ?? 0),
    spAtk: (base.spAtk ?? 0) + (bonus.spAtk ?? 0),
    spDef: (base.spDef ?? 0) + (bonus.spDef ?? 0),
    spd: (base.spd ?? 0) + (bonus.spd ?? 0),
    maxHp: (base.maxHp ?? 0) + (bonus.maxHp ?? 0),
  }
}

export function getEffectiveGearDamageMultiplier(
  gear: GearItem | null,
  abilityType: import('../data/abilities').Ability['type'],
  upgradeLevel = 0,
): number {
  if (!gear?.damageModifiers) return 1
  let bonus = 0
  if (gear.damageModifiers.all) bonus += gear.damageModifiers.all
  const typeBonus = gear.damageModifiers[abilityType]
  if (typeof typeBonus === 'number') bonus += typeBonus
  bonus += computeUpgradeDamageBonus(gear, upgradeLevel)
  return 1 + bonus
}

export type UpgradeCost = {
  materials: { itemId: string; quantity: number }[]
  coinCost: number
  needsAlphaClaw: boolean
}

export function getGearUpgradeCost(gear: GearItem, nextLevel: number): UpgradeCost {
  const rarity = gear.rarity
  const hasDamage = Boolean(gear.damageModifiers)
  if (rarity === 'common') {
    return {
      materials: [{ itemId: 'stone-chip', quantity: 2 }],
      coinCost: 10,
      needsAlphaClaw: false,
    }
  }
  if (rarity === 'uncommon') {
    return {
      materials: [
        { itemId: 'monolith-fragment', quantity: 1 },
        { itemId: 'volt-thread', quantity: 3 },
      ],
      coinCost: 25,
      needsAlphaClaw: false,
    }
  }
  const mats: { itemId: string; quantity: number }[] = [
    { itemId: 'monolith-fragment', quantity: 2 },
    { itemId: 'stone-chip', quantity: 5 },
  ]
  if (hasDamage && nextLevel >= 2) {
    mats.push({ itemId: 'material-alpha-claw', quantity: 1 })
  }
  return {
    materials: mats,
    coinCost: 50,
    needsAlphaClaw: hasDamage && nextLevel >= 2,
  }
}

export function canAffordUpgrade(
  gear: GearItem,
  entry: InventoryItem,
  inv: TrainerInventory,
  coins: number,
): { ok: boolean; cost: UpgradeCost } {
  const level = entry.upgradeLevel ?? 0
  const max = entry.maxUpgradeLevel ?? DEFAULT_MAX_GEAR_UPGRADE
  if (level >= max) return { ok: false, cost: getGearUpgradeCost(gear, level + 1) }
  const cost = getGearUpgradeCost(gear, level + 1)
  if (coins < cost.coinCost) return { ok: false, cost }
  for (const m of cost.materials) {
    if (countMaterial(inv, m.itemId) < m.quantity) return { ok: false, cost }
  }
  return { ok: true, cost }
}

const STARTER_ID = 'starter'

export function upgradeEquippedGear(
  creatureKey: string,
  starter: RunCreature,
  recruits: import('./party').PartyCreature[],
  inventory: TrainerInventory,
): ForgeUpgradeResult {
  if (creatureKey === STARTER_ID) {
    const gear = getGearItem(starter.equippedGearId ?? null)
    if (!gear) return { ok: false, reason: 'No gear equipped.' }
    const level = starter.equippedGearUpgradeLevel ?? 0
    const max = DEFAULT_MAX_GEAR_UPGRADE
    if (level >= max) return { ok: false, reason: 'Equipped gear is fully upgraded.' }
    const fakeEntry: InventoryItem = {
      id: 'equipped',
      itemId: gear.id,
      name: gear.name,
      category: 'gear',
      quantity: 1,
      description: gear.description,
      rarity: gear.rarity,
      stackable: false,
      upgradeLevel: level,
      maxUpgradeLevel: max,
    }
    const afford = canAffordUpgrade(gear, fakeEntry, inventory, starter.coins)
    if (!afford.ok) return { ok: false, reason: 'Not enough materials or coins.' }
    let nextInv = inventory
    for (const m of afford.cost.materials) {
      nextInv = removeMaterialQuantity(nextInv, m.itemId, m.quantity)
    }
    const nextStarter = {
      ...spendCoins(starter, afford.cost.coinCost),
      equippedGearUpgradeLevel: level + 1,
    }
    return {
      ok: true,
      inventory: nextInv,
      starter: nextStarter,
      recruits,
      message: `${gear.name} upgraded to +${level + 1}.`,
    }
  }
  const recruit = recruits.find((r) => r.id === creatureKey)
  if (!recruit) return { ok: false, reason: 'Creature not found.' }
  const gear = getGearItem(recruit.equippedGearId ?? null)
  if (!gear) return { ok: false, reason: 'No gear equipped.' }
  const level = recruit.equippedGearUpgradeLevel ?? 0
  const max = DEFAULT_MAX_GEAR_UPGRADE
  if (level >= max) return { ok: false, reason: 'Equipped gear is fully upgraded.' }
  const fakeEntry: InventoryItem = {
    id: 'equipped',
    itemId: gear.id,
    name: gear.name,
    category: 'gear',
    quantity: 1,
    description: gear.description,
    rarity: gear.rarity,
    stackable: false,
    upgradeLevel: level,
    maxUpgradeLevel: max,
  }
  const afford = canAffordUpgrade(gear, fakeEntry, inventory, starter.coins)
  if (!afford.ok) return { ok: false, reason: 'Not enough materials or coins.' }
  let nextInv = inventory
  for (const m of afford.cost.materials) {
    nextInv = removeMaterialQuantity(nextInv, m.itemId, m.quantity)
  }
  const nextStarter = spendCoins(starter, afford.cost.coinCost)
  const nextRecruits = recruits.map((r) =>
    r.id === creatureKey
      ? { ...r, equippedGearUpgradeLevel: level + 1 }
      : r,
  )
  return {
    ok: true,
    inventory: nextInv,
    starter: nextStarter,
    recruits: nextRecruits,
    message: `${gear.name} upgraded to +${level + 1}.`,
  }
}

export function upgradeGearInstance(
  instanceId: string,
  starter: RunCreature,
  recruits: import('./party').PartyCreature[],
  inventory: TrainerInventory,
): ForgeUpgradeResult {
  const entry = inventory.gear.find((g) => g.id === instanceId)
  if (!entry) return { ok: false, reason: 'Gear not found in inventory.' }
  const gear = getGearItem(entry.itemId)
  if (!gear) return { ok: false, reason: 'Invalid gear.' }

  const level = entry.upgradeLevel ?? 0
  const max = entry.maxUpgradeLevel ?? DEFAULT_MAX_GEAR_UPGRADE
  if (level >= max) return { ok: false, reason: 'This gear is fully upgraded.' }

  const afford = canAffordUpgrade(gear, entry, inventory, starter.coins)
  if (!afford.ok) return { ok: false, reason: 'Not enough materials or coins.' }

  let nextInv = inventory
  for (const m of afford.cost.materials) {
    nextInv = removeMaterialQuantity(nextInv, m.itemId, m.quantity)
  }
  let nextStarter = spendCoins(starter, afford.cost.coinCost)
  const nextGear = nextInv.gear.map((g) =>
    g.id === instanceId
      ? { ...g, upgradeLevel: (g.upgradeLevel ?? 0) + 1 }
      : g,
  )
  nextInv = { ...nextInv, gear: nextGear }

  return {
    ok: true,
    inventory: nextInv,
    starter: nextStarter,
    recruits,
    message: `${gear.name} upgraded to +${level + 1}.`,
  }
}

export function formatMaterialLabel(itemId: string): string {
  if (itemId === 'any-common') return 'Common materials (any)'
  return getItemDefinition(itemId)?.name ?? itemId
}

export function inventoryGearEntryWithUpgrade(
  gear: GearItem,
): InventoryItem {
  return {
    ...inventoryItemFromGear(gear),
    upgradeLevel: 0,
    maxUpgradeLevel: DEFAULT_MAX_GEAR_UPGRADE,
  }
}

export function addForgedGearToInventory(
  inv: TrainerInventory,
  gearId: string,
): TrainerInventory {
  const gear = getGearItem(gearId)
  if (!gear) return inv
  return addInventoryItemEntry(inv, inventoryGearEntryWithUpgrade(gear))
}
