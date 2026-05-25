import { getAbility } from '../data/abilities'
import {
  CREATURE_PERK_POOLS,
  type CreatureSpeciesKey,
} from '../data/creaturePerks'
import { GENERAL_PERK_LIST } from '../data/generalPerks'
import type { Perk, PerkCategory, PerkRole } from '../data/perks'
import type { ElementType } from '../data/starters'
import type { StarterStats } from '../data/starters'
import { gameRandom } from './seededRandom'

export type PickPerkContext = {
  level?: number
  type?: ElementType
  role?: PerkRole
  stats?: Pick<StarterStats, 'atk' | 'spAtk' | 'def' | 'spDef' | 'spd' | 'hp'>
  abilityIds?: string[]
}

export function inferCreatureRole(
  stats: Pick<StarterStats, 'atk' | 'spAtk' | 'def' | 'spDef' | 'spd' | 'hp'>,
  abilityIds: string[] = [],
): PerkRole {
  let supportScore = 0
  for (const id of abilityIds) {
    const ab = getAbility(id)
    if (!ab) continue
    if (ab.category === 'status') supportScore += 2
    if (
      ab.effects?.some(
        (e) =>
          e.type === 'statBuff' ||
          e.type === 'statDebuff' ||
          e.type === 'heal' ||
          e.type === 'shield',
      )
    ) {
      supportScore += 1
    }
  }
  const damageScore = stats.atk + stats.spAtk
  const tankScore = stats.def + stats.spDef + (stats.hp ?? 0) / 12
  if (supportScore >= 3) return 'support'
  if (tankScore > damageScore * 1.15) return 'tank'
  if (stats.spd >= Math.max(stats.atk, stats.spAtk) + 2) return 'speed'
  if (damageScore >= tankScore) return 'damage'
  return 'balanced'
}

let perkIndexCache: Map<string, Perk> | null = null

/** Lazy-built to avoid circular init with creaturePerks re-exports. */
function getPerkIndex(): Map<string, Perk> {
  if (!perkIndexCache) {
    perkIndexCache = new Map(
      [...Object.values(CREATURE_PERK_POOLS).flat(), ...GENERAL_PERK_LIST].map(
        (p) => [p.id, p],
      ),
    )
  }
  return perkIndexCache
}

function countStacks(
  selectedIds: string[],
  perk: Perk,
): number {
  if (!perk.stackGroup) {
    return selectedIds.includes(perk.id) ? 1 : 0
  }
  return selectedIds.filter((id) => {
    const p = getPerkIndex().get(id)
    return p?.stackGroup === perk.stackGroup
  }).length
}

function perkAvailable(
  perk: Perk,
  excludeIds: string[],
  type: ElementType | undefined,
  role: PerkRole,
): boolean {
  if (perk.unique && excludeIds.includes(perk.id)) return false
  const stacks = countStacks(excludeIds, perk)
  if (perk.maxStacks != null && stacks >= perk.maxStacks) return false
  if (perk.stackGroup && stacks > 0 && !perk.maxStacks) return false
  if (excludeIds.includes(perk.id) && !perk.stackGroup) return false
  if (perk.allowedTypes?.length && type && !perk.allowedTypes.includes(type)) {
    return false
  }
  if (perk.allowedRoles?.length && !perk.allowedRoles.includes(role)) {
    return false
  }
  return true
}

function rarityWeight(perk: Perk, level: number): number {
  const base = perk.weight ?? 10
  const rarityBoost: Record<string, number> = {
    common: level < 10 ? 1.2 : 0.9,
    uncommon: level >= 10 && level < 20 ? 1.15 : 1,
    rare: level >= 10 ? 1.1 : 0.85,
    epic: level >= 20 ? 1.25 : level >= 15 ? 1.05 : 0.7,
    legendary: 0.85,
  }
  return base * (rarityBoost[perk.rarity] ?? 1)
}

function weightedPick(pool: Perk[], level: number): Perk | null {
  if (pool.length === 0) return null
  const weights = pool.map((p) => rarityWeight(p, level))
  const total = weights.reduce((s, w) => s + w, 0)
  let roll = gameRandom() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!
    if (roll <= 0) return pool[i]!
  }
  return pool[pool.length - 1]!
}

function buildFallbackPerks(
  role: PerkRole,
  level: number,
  excludeIds: string[],
): Perk[] {
  const tier = Math.min(3, Math.floor(level / 8) + 1)
  const pct = 0.05 * tier
  const templates: Omit<Perk, 'id'>[] = []
  if (role === 'damage' || role === 'balanced') {
    templates.push({
      name: `Battle Edge ${tier}`,
      rarity: 'common',
      category: 'offense',
      description: 'Sharpened instincts for the route.',
      effect: `+${Math.round(pct * 100)}% damage with all abilities.`,
      weight: 5,
    })
  }
  if (role === 'tank' || role === 'balanced') {
    templates.push({
      name: `Iron Core ${tier}`,
      rarity: 'common',
      category: 'defense',
      description: 'Hardened for sustained fights.',
      effect: `+${Math.round(pct * 100)}% max HP.`,
      weight: 5,
      statModifiers: { maxHp: Math.round(8 * tier) },
    })
  }
  templates.push({
    name: `Route Pace ${tier}`,
    rarity: 'common',
    category: 'speed',
    description: 'Quicker steps between nodes.',
    effect: `+${Math.round(pct * 100)}% SPD.`,
    weight: 5,
    statModifiers: { spd: Math.round(3 * tier) },
  })
  return templates.map((t, i) => ({
    ...t,
    id: `fallback-${role}-t${tier}-s${i}`,
  })).filter((p) => !excludeIds.includes(p.id))
}

function getFullPool(
  speciesKey: CreatureSpeciesKey,
  type: ElementType | undefined,
  role: PerkRole,
  excludeIds: string[],
): Perk[] {
  const species = CREATURE_PERK_POOLS[speciesKey] ?? CREATURE_PERK_POOLS.fire
  const general = GENERAL_PERK_LIST
  const combined = [...species, ...general]
  const seen = new Set<string>()
  return combined.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return perkAvailable(p, excludeIds, type, role)
  })
}

const OFFENSE_CATS: PerkCategory[] = ['offense']
const DEFENSE_CATS: PerkCategory[] = ['defense']
const UTILITY_CATS: PerkCategory[] = ['utility', 'support', 'economy', 'mastery']

export function pickPerksForCreature(
  speciesKey: CreatureSpeciesKey,
  excludeIds: string[] = [],
  count = 3,
  context: PickPerkContext = {},
): Perk[] {
  const level = context.level ?? 1
  const type = context.type
  const stats = context.stats ?? {
    atk: 10,
    spAtk: 10,
    def: 10,
    spDef: 10,
    spd: 10,
    hp: 50,
  }
  const role =
    context.role ??
    inferCreatureRole(stats, context.abilityIds ?? [])

  let pool = getFullPool(speciesKey, type, role, excludeIds)
  if (pool.length < count) {
    pool = [...pool, ...buildFallbackPerks(role, level, excludeIds)]
  }

  const chosen: Perk[] = []
  const pickedIds = new Set<string>()

  function takeFrom(
    filter: (p: Perk) => boolean,
    guarantee = false,
  ): void {
    const sub = pool.filter(
      (p) => filter(p) && !pickedIds.has(p.id),
    )
    if (sub.length === 0) return
    const pick = weightedPick(sub, level)
    if (!pick) return
    if (guarantee || gameRandom() < 0.85) {
      chosen.push(pick)
      pickedIds.add(pick.id)
    }
  }

  const needOffense =
    (role === 'damage' || role === 'speed') && gameRandom() < 0.5
  const needDefense = role === 'tank' && gameRandom() < 0.4
  const needUtility = role === 'support' && gameRandom() < 0.4

  if (needOffense) takeFrom((p) => OFFENSE_CATS.includes(p.category), true)
  if (needDefense) takeFrom((p) => DEFENSE_CATS.includes(p.category), true)
  if (needUtility) takeFrom((p) => UTILITY_CATS.includes(p.category), true)

  if (type) {
    takeFrom(
      (p) =>
        p.allowedTypes?.includes(type) === true ||
        p.id.startsWith(`${speciesKey}-`),
    )
  }
  takeFrom((p) => !p.allowedTypes?.length && p.category !== 'evolution')

  while (chosen.length < count) {
    const remaining = pool.filter((p) => !pickedIds.has(p.id))
    if (remaining.length === 0) {
      const fallbacks = buildFallbackPerks(role, level, [
        ...excludeIds,
        ...pickedIds,
      ])
      pool.push(...fallbacks)
      continue
    }
    const cats = new Set(chosen.map((c) => c.category))
    const diverse = remaining.filter((p) => !cats.has(p.category))
    const pick = weightedPick(
      diverse.length > 0 ? diverse : remaining,
      level,
    )
    if (!pick) break
    chosen.push(pick)
    pickedIds.add(pick.id)
  }

  return chosen.slice(0, count)
}

export function getPerkStackLabel(
  perk: Perk,
  selectedPerkIds: string[],
): string | null {
  if (!perk.stackGroup && !perk.maxStacks) return null
  const stacks = countStacks(selectedPerkIds, perk)
  const max = perk.maxStacks ?? 1
  if (stacks <= 0) return `Stackable (max ${max})`
  return `Owned: ${stacks}/${max}`
}
