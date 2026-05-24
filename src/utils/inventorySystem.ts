import type { EncounterKind } from '../data/enemies'
import { getGearItem, type GearItem } from '../data/gearItems'
import {
  getItemDefinition,
  ITEMS,
  type ItemCategory,
  type ItemDefinition,
  type ItemRarity,
} from '../data/items'
import type { PartyCreature } from './party'
import type { RunCreature } from './progression'

export type InventoryItem = {
  id: string
  itemId: string
  name: string
  category: ItemCategory
  quantity: number
  description: string
  rarity: ItemRarity
  stackable: boolean
  maxStack?: number
}

export type TrainerInventory = {
  consumables: InventoryItem[]
  gear: InventoryItem[]
  materials: InventoryItem[]
  keyItems: InventoryItem[]
}

let instanceCounter = 0

export function createInventoryInstanceId(prefix: string): string {
  instanceCounter += 1
  return `${prefix}-${Date.now()}-${instanceCounter}`
}

export function emptyTrainerInventory(): TrainerInventory {
  return {
    consumables: [],
    gear: [],
    materials: [],
    keyItems: [],
  }
}

function bucketForCategory(
  inv: TrainerInventory,
  category: ItemCategory,
): InventoryItem[] {
  switch (category) {
    case 'consumable':
      return inv.consumables
    case 'gear':
      return inv.gear
    case 'material':
      return inv.materials
    case 'keyItem':
      return inv.keyItems
    default:
      return inv.consumables
  }
}

function setBucket(
  inv: TrainerInventory,
  category: ItemCategory,
  items: InventoryItem[],
): TrainerInventory {
  switch (category) {
    case 'consumable':
      return { ...inv, consumables: items }
    case 'gear':
      return { ...inv, gear: items }
    case 'material':
      return { ...inv, materials: items }
    case 'keyItem':
      return { ...inv, keyItems: items }
    default:
      return inv
  }
}

export function inventoryItemFromDefinition(
  def: ItemDefinition,
  quantity = 1,
): InventoryItem {
  return {
    id: createInventoryInstanceId(def.id),
    itemId: def.id,
    name: def.name,
    category: def.category,
    quantity,
    description: def.description,
    rarity: def.rarity,
    stackable: def.stackable,
    maxStack: def.maxStack,
  }
}

export function inventoryItemFromGear(gear: GearItem): InventoryItem {
  return {
    id: createInventoryInstanceId(gear.id),
    itemId: gear.id,
    name: gear.name,
    category: 'gear',
    quantity: 1,
    description: gear.description,
    rarity: gear.rarity,
    stackable: false,
  }
}

export function addItemToTrainerInventory(
  inv: TrainerInventory,
  itemId: string,
  quantity = 1,
): TrainerInventory {
  const def = getItemDefinition(itemId)
  if (def) {
    return addInventoryItemEntry(inv, inventoryItemFromDefinition(def, quantity))
  }
  const gear = getGearItem(itemId)
  if (gear) {
    let next = inv
    for (let i = 0; i < quantity; i++) {
      next = addInventoryItemEntry(next, inventoryItemFromGear(gear))
    }
    return next
  }
  return inv
}

export function addInventoryItemEntry(
  inv: TrainerInventory,
  entry: InventoryItem,
): TrainerInventory {
  if (entry.category === 'gear') {
    return { ...inv, gear: [...inv.gear, entry] }
  }

  const bucket = [...bucketForCategory(inv, entry.category)]
  if (entry.stackable) {
    const existing = bucket.find((i) => i.itemId === entry.itemId)
    if (existing) {
      const max = existing.maxStack ?? 99
      const nextQty = Math.min(max, existing.quantity + entry.quantity)
      const updated = bucket.map((i) =>
        i.id === existing.id ? { ...i, quantity: nextQty } : i,
      )
      return setBucket(inv, entry.category, updated)
    }
  }
  return setBucket(inv, entry.category, [...bucket, entry])
}

export function removeInventoryItemByInstanceId(
  inv: TrainerInventory,
  instanceId: string,
  quantity = 1,
): TrainerInventory {
  for (const category of [
    'consumable',
    'gear',
    'material',
    'keyItem',
  ] as ItemCategory[]) {
    const bucket = bucketForCategory(inv, category)
    const index = bucket.findIndex((i) => i.id === instanceId)
    if (index === -1) continue
    const item = bucket[index]
    const nextBucket = [...bucket]
    if (item.quantity <= quantity) {
      nextBucket.splice(index, 1)
    } else {
      nextBucket[index] = { ...item, quantity: item.quantity - quantity }
    }
    return setBucket(inv, category, nextBucket)
  }
  return inv
}

export function removeGearFromTrainerInventoryByGearId(
  inv: TrainerInventory,
  gearId: string,
): { inventory: TrainerInventory; removed: InventoryItem | null } {
  const index = inv.gear.findIndex((g) => g.itemId === gearId)
  if (index === -1) return { inventory: inv, removed: null }
  const removed = inv.gear[index]
  const nextGear = [...inv.gear]
  nextGear.splice(index, 1)
  return {
    inventory: { ...inv, gear: nextGear },
    removed,
  }
}

export function addGearIdToTrainerInventory(
  inv: TrainerInventory,
  gearId: string,
): TrainerInventory {
  const gear = getGearItem(gearId)
  if (!gear) return inv
  return addInventoryItemEntry(inv, inventoryItemFromGear(gear))
}

export function getInventoryCounts(inv: TrainerInventory): {
  consumables: number
  gear: number
  materials: number
  keyItems: number
  total: number
} {
  const consumables = inv.consumables.reduce((s, i) => s + i.quantity, 0)
  const gear = inv.gear.length
  const materials = inv.materials.reduce((s, i) => s + i.quantity, 0)
  const keyItems = inv.keyItems.reduce((s, i) => s + i.quantity, 0)
  return {
    consumables,
    gear,
    materials,
    keyItems,
    total: consumables + gear + materials + keyItems,
  }
}

export function getAllInventoryItems(inv: TrainerInventory): InventoryItem[] {
  return [
    ...inv.consumables,
    ...inv.gear,
    ...inv.materials,
    ...inv.keyItems,
  ]
}

export function normalizeInventoryItem(raw: unknown): InventoryItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.itemId !== 'string') return null
  const def = getItemDefinition(o.itemId)
  const gear = getGearItem(o.itemId)
  if (!def && !gear) return null
  const category =
    (o.category as ItemCategory) ??
    def?.category ??
    ('gear' as const)
  return {
    id: typeof o.id === 'string' ? o.id : createInventoryInstanceId(o.itemId),
    itemId: o.itemId,
    name: typeof o.name === 'string' ? o.name : (def?.name ?? gear!.name),
    category,
    quantity: typeof o.quantity === 'number' ? Math.max(1, o.quantity) : 1,
    description:
      typeof o.description === 'string'
        ? o.description
        : (def?.description ?? gear!.description),
    rarity:
      (o.rarity as ItemRarity) ?? def?.rarity ?? gear!.rarity,
    stackable: Boolean(o.stackable ?? def?.stackable ?? false),
    maxStack: typeof o.maxStack === 'number' ? o.maxStack : def?.maxStack,
  }
}

export function normalizeTrainerInventory(raw: unknown): TrainerInventory {
  if (!raw || typeof raw !== 'object') {
    return emptyTrainerInventory()
  }
  const o = raw as Record<string, unknown>
  const mapList = (list: unknown): InventoryItem[] => {
    if (!Array.isArray(list)) return []
    return list
      .map(normalizeInventoryItem)
      .filter((i): i is InventoryItem => i !== null)
  }
  return {
    consumables: mapList(o.consumables),
    gear: mapList(o.gear),
    materials: mapList(o.materials),
    keyItems: mapList(o.keyItems),
  }
}

/** Migrate legacy gearInventory: string[] into trainerInventory.gear */
export function migrateLegacyGearInventory(
  inv: TrainerInventory,
  legacyGearIds: string[] | undefined,
): TrainerInventory {
  if (!legacyGearIds?.length) return inv
  let next = inv
  for (const gearId of legacyGearIds) {
    if (getGearItem(gearId)) {
      next = addGearIdToTrainerInventory(next, gearId)
    }
  }
  return next
}

const MATERIAL_DROP_POOL = [
  'monolith-fragment',
  'ember-scale',
  'tide-pearl',
  'volt-thread',
  'stone-chip',
  'wild-seed',
  'material-alpha-claw',
]

const CONSUMABLE_DROP_POOL = [
  'small-potion',
  'medium-potion',
  'battle-tonic',
  'focus-charm',
]

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)] ?? null
}

export type BattleDropResult = {
  inventory: TrainerInventory
  itemsFound: string[]
  gearFound?: string
  materialsFound: string[]
}

export function applyBattleDropsToInventory(
  inv: TrainerInventory,
  encounterKind: EncounterKind,
  gearDrop: GearItem | null,
): BattleDropResult {
  let next = inv
  const itemsFound: string[] = []
  const materialsFound: string[] = []

  if (gearDrop) {
    next = addGearIdToTrainerInventory(next, gearDrop.id)
    itemsFound.push(gearDrop.name)
  }

  const rollConsumable = (): boolean => {
    switch (encounterKind) {
      case 'battle':
        return Math.random() < 0.12
      case 'elite':
        return Math.random() < 0.22
      case 'alphaNest':
        return Math.random() < 0.28
      case 'gymTrainer':
        return Math.random() < 0.18
      case 'gymLeader':
        return Math.random() < 0.35
      case 'boss':
        return true
      default:
        return false
    }
  }

  const rollMaterial = (): boolean => {
    switch (encounterKind) {
      case 'battle':
        return Math.random() < 0.08
      case 'elite':
        return Math.random() < 0.3
      case 'alphaNest':
        return Math.random() < 0.4
      case 'gymTrainer':
        return Math.random() < 0.25
      case 'gymLeader':
        return Math.random() < 0.55
      case 'boss':
        return true
      default:
        return false
    }
  }

  if (rollConsumable()) {
    const id = pickRandom(CONSUMABLE_DROP_POOL)
    if (id) {
      const def = getItemDefinition(id)!
      next = addItemToTrainerInventory(next, id, 1)
      itemsFound.push(def.name)
    }
  }

  if (rollMaterial()) {
    const id =
      encounterKind === 'boss' || encounterKind === 'gymLeader'
        ? pickRandom(['monolith-fragment', 'material-alpha-claw', 'volt-thread'])
        : pickRandom(MATERIAL_DROP_POOL)
    if (id) {
      const def = getItemDefinition(id)!
      next = addItemToTrainerInventory(next, id, 1)
      materialsFound.push(def.name)
      if (!itemsFound.includes(def.name)) {
        itemsFound.push(def.name)
      }
    }
  }

  if (encounterKind === 'boss' && !materialsFound.length) {
    next = addItemToTrainerInventory(next, 'monolith-fragment', 1)
    materialsFound.push(ITEMS['monolith-fragment'].name)
    itemsFound.push(ITEMS['monolith-fragment'].name)
  }

  return {
    inventory: next,
    itemsFound,
    gearFound: gearDrop?.name,
    materialsFound,
  }
}

export function findInventoryItem(
  inv: TrainerInventory,
  instanceId: string,
): InventoryItem | null {
  return getAllInventoryItems(inv).find((i) => i.id === instanceId) ?? null
}

export type EquipGearResult<T> = {
  creature: T
  inventory: TrainerInventory
}

export function equipGearFromTrainerInventory<T extends { equippedGearId?: string | null }>(
  creature: T,
  inv: TrainerInventory,
  gearInstanceId: string,
): EquipGearResult<T> | null {
  const entry = inv.gear.find((g) => g.id === gearInstanceId)
  if (!entry) return null
  let nextInv = removeInventoryItemByInstanceId(inv, gearInstanceId, 1)
  const previousId = creature.equippedGearId ?? null
  if (previousId) {
    nextInv = addGearIdToTrainerInventory(nextInv, previousId)
  }
  return {
    creature: { ...creature, equippedGearId: entry.itemId },
    inventory: nextInv,
  }
}

export function unequipGearToTrainerInventory<T extends { equippedGearId?: string | null }>(
  creature: T,
  inv: TrainerInventory,
): EquipGearResult<T> {
  const previousId = creature.equippedGearId ?? null
  if (!previousId) {
    return { creature, inventory: inv }
  }
  return {
    creature: { ...creature, equippedGearId: null },
    inventory: addGearIdToTrainerInventory(inv, previousId),
  }
}

export function partyHasFainted(
  starter: RunCreature,
  recruits: PartyCreature[],
): boolean {
  if (starter.currentHp <= 0) return true
  return recruits.some((r) => r.currentHp <= 0)
}

export function partyAllFullHp(
  starter: RunCreature,
  recruits: PartyCreature[],
): boolean {
  if (starter.currentHp < starter.maxHp) return false
  return recruits.every((r) => r.currentHp >= r.maxHp)
}
