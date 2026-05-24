import type { Ability } from '../data/abilities'
import type { EncounterKind } from '../data/enemies'
import { getRegion } from '../data/regions'
import {
  GEAR_ITEM_LIST,
  getGearItem,
  RELIC_GEAR_BY_TYPE,
  type GearDamageModifiers,
  type GearItem,
  type GearRarity,
  type GearStatModifiers,
} from '../data/gearItems'
import type { ElementType, StarterStats } from '../data/starters'
export type CreatureWithGear = {
  equippedGearId?: string | null
}

export function getEquippedGear(creature: CreatureWithGear): GearItem | null {
  return getGearItem(creature.equippedGearId ?? null)
}

export function applyGearStatModifiers(
  stats: StarterStats,
  gear: GearItem | null,
): StarterStats {
  if (!gear) return stats
  const m = gear.statModifiers
  return {
    hp: stats.hp + (m.maxHp ?? 0),
    atk: stats.atk + (m.atk ?? 0),
    def: stats.def + (m.def ?? 0),
    spAtk: stats.spAtk + (m.spAtk ?? 0),
    spDef: stats.spDef + (m.spDef ?? 0),
    spd: stats.spd + (m.spd ?? 0),
  }
}

export function getGearDamageMultiplier(
  gear: GearItem | null,
  ability: Ability,
): number {
  if (!gear?.damageModifiers) return 1
  const mods = gear.damageModifiers
  let bonus = 0
  if (mods.all) bonus += mods.all
  const typeBonus = mods[ability.type as keyof GearDamageModifiers]
  if (typeof typeBonus === 'number') bonus += typeBonus
  return 1 + bonus
}

export function formatGearStatLines(modifiers: GearStatModifiers): string[] {
  const lines: string[] = []
  if (modifiers.atk) lines.push(`ATK +${modifiers.atk}`)
  if (modifiers.def) lines.push(`DEF +${modifiers.def}`)
  if (modifiers.spAtk) lines.push(`SP.ATK +${modifiers.spAtk}`)
  if (modifiers.spDef) lines.push(`SP.DEF +${modifiers.spDef}`)
  if (modifiers.spd) lines.push(`SPD +${modifiers.spd}`)
  if (modifiers.maxHp) lines.push(`Max HP +${modifiers.maxHp}`)
  return lines
}

export function formatGearDamageLines(
  modifiers: GearDamageModifiers | undefined,
): string[] {
  if (!modifiers) return []
  const lines: string[] = []
  if (modifiers.all) lines.push(`All damage +${Math.round(modifiers.all * 100)}%`)
  for (const [key, val] of Object.entries(modifiers)) {
    if (key === 'all' || typeof val !== 'number') continue
    lines.push(`${key} damage +${Math.round(val * 100)}%`)
  }
  return lines
}

export function formatGearSummary(gear: GearItem): string[] {
  return [
    ...formatGearStatLines(gear.statModifiers),
    ...formatGearDamageLines(gear.damageModifiers),
    ...(gear.specialEffectText ? [gear.specialEffectText] : []),
  ]
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)] ?? null
}

function filterGearByRarities(rarities: GearRarity[]): GearItem[] {
  const set = new Set(rarities)
  return GEAR_ITEM_LIST.filter((g) => set.has(g.rarity))
}

/** Three random gear offers for a shop visit, scaled by region difficulty. */
export function rollShopGearOffers(regionId: string): string[] {
  const region = getRegion(regionId)
  const difficulty = region?.difficulty ?? 1
  let pool: GearItem[]
  if (difficulty <= 1) {
    pool = filterGearByRarities(['common', 'uncommon'])
  } else if (difficulty === 2) {
    pool = filterGearByRarities(['common', 'uncommon', 'rare'])
  } else {
    pool = filterGearByRarities(['uncommon', 'rare', 'epic'])
  }
  if (pool.length === 0) pool = GEAR_ITEM_LIST

  const picked = new Set<string>()
  const offers: string[] = []
  let attempts = 0
  while (offers.length < 3 && attempts < 40) {
    attempts++
    const item = pickRandom(pool)
    if (!item || picked.has(item.id)) continue
    picked.add(item.id)
    offers.push(item.id)
  }
  return offers
}

/** All three premium gear pieces for the starter's element (epic, mythic, legendary). */
export function rollRelicShopOffers(starterType: ElementType): string[] {
  return [...RELIC_GEAR_BY_TYPE[starterType]]
}

/** Random gear at or above a minimum rarity for event rewards. */
export function rollEventGearDrop(
  minRarity: 'rare' | 'epic',
): GearItem | null {
  const order: GearRarity[] = ['rare', 'epic', 'mythic', 'legendary']
  const start = order.indexOf(minRarity)
  const rarities = order.slice(Math.max(0, start))
  const pool = filterGearByRarities(rarities)
  return pickRandom(pool.length > 0 ? pool : GEAR_ITEM_LIST)
}

type DropTable = { chance: number; rarities: GearRarity[] }

const DROP_TABLES: Record<EncounterKind, DropTable> = {
  battle: { chance: 0.1, rarities: ['common', 'uncommon'] },
  elite: { chance: 0.25, rarities: ['common', 'uncommon', 'rare'] },
  alphaNest: { chance: 0.35, rarities: ['uncommon', 'rare'] },
  gymTrainer: { chance: 0.2, rarities: ['uncommon', 'rare'] },
  gymLeader: { chance: 0.5, rarities: ['rare', 'epic'] },
  boss: { chance: 1, rarities: ['rare', 'epic', 'legendary'] },
}

/** Roll a gear drop after victory; null if no drop. */
export function rollBattleGearDrop(
  encounterKind: EncounterKind,
): GearItem | null {
  const table = DROP_TABLES[encounterKind] ?? DROP_TABLES.battle
  if (Math.random() >= table.chance) return null
  const pool = filterGearByRarities(table.rarities)
  return pickRandom(pool.length > 0 ? pool : GEAR_ITEM_LIST)
}

export function normalizeEquippedGearId(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'string') return null
  return getGearItem(raw) ? raw : null
}
