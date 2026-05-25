import type { AbilityDefinition } from './abilityTypes'
import type { ElementType } from './starters'
import type { AbilityMasteryEntry } from '../utils/abilityMastery'
import { getResolvedAbilityId } from '../utils/abilityMastery'

export const ABILITY_SFX_BASE = '/audio/sfx'

/** Mastery rank 0–4 = tier 0, 5–9 = tier 1, 10+ = tier 2 (stronger / evolved SFX). */
export function getAbilitySoundTier(rank: number): 0 | 1 | 2 {
  if (rank >= 10) return 2
  if (rank >= 5) return 1
  return 0
}

const TYPE_TIER_POOLS: Record<
  ElementType,
  readonly [readonly string[], readonly string[], readonly string[]]
> = {
  Fire: [
    ['fire_type1', 'fire_type2', 'flame_burst'],
    ['fire_type3', 'fire_type4', 'flame_wheel'],
    ['fire_type5', 'fire_type6', 'flamethrower', 'fire_blast', 'inferno'],
  ],
  Water: [
    ['water_1', 'water_3', 'water_gun'],
    ['water_4', 'water_5', 'water_pulse'],
    ['water_6', 'water_7', 'water_8', 'water_9', 'waterfall', 'whirlpool'],
  ],
  Grass: [
    ['grass_type', 'grass_type1', 'vine_whip'],
    ['grass_type2', 'grass_type3', 'razor_leaf'],
    ['grass_type4', 'grass_type5', 'vine_whip'],
  ],
  Electric: [
    ['electric_1', 'electric_2', 'thunder'],
    ['electric_3', 'electric_4', 'thunder'],
    ['electric_5', 'electric_6', 'electric_7', 'electric_8', 'thunderbolt'],
  ],
  Ground: [
    ['earth_1', 'earth_2', 'rock_throw'],
    ['earth_3', 'earth_4', 'rock_smash'],
    ['earth_5', 'earth_6', 'earth_7', 'earth_8', 'rock_slide'],
  ],
}

const WIND_POOL: readonly [readonly string[], readonly string[], readonly string[]] = [
  ['wind_1', 'wind_2'],
  ['wind_2', 'wind_3'],
  ['wind_3', 'wind_2'],
]

const BUFF_POOL = ['buff_type1', 'buff_type2', 'buff_type3', 'buff_type4'] as const
const DEBUFF_POOL = ['debuff_type1', 'debuff_type2', 'debuff_type3'] as const
const HEAL_POOL = ['healing_1', 'healing_1', 'water_pulse'] as const

/** Best-match SFX file stem (no path) per ability id. */
const ABILITY_SFX_BY_ID: Record<string, string> = {
  tackle: 'tackle',
  sting: 'tackle',
  'vine-lash': 'vine_whip',
  'thorn-whip': 'vine_whip',
  'bind-lash': 'vine_whip',
  'sap-lash': 'vine_whip',
  'wild-lash': 'vine_whip',
  'ancient-thorn-whip': 'razor_leaf',
  'eternal-bind-lash': 'vine_whip',
  'lifeblood-sap-lash': 'vine_whip',
  'overgrowth-wild-lash': 'razor_leaf',
  'spark-ember': 'fire_type1',
  'ember-burst': 'flame_burst',
  'cinder-bite': 'fire_type2',
  'flame-bite': 'flame_wheel',
  'inferno-rush': 'inferno',
  'cinder-lance': 'flamethrower',
  'searing-hex': 'fire_blast',
  warmflare: 'flame_burst',
  'ember-spiral': 'fire_spin',
  'solar-cinder-spear': 'fire_blast',
  'infernal-brand': 'inferno',
  'phoenix-pulse': 'flame_burst',
  'celestial-emberstorm': 'inferno',
  'bubble-hex': 'water_gun',
  'splash-strike': 'water_gun',
  'water-fang': 'water_pulse',
  'pressure-wave': 'water_pulse',
  'riptide-crash': 'whirlpool',
  'tide-lance': 'waterfall',
  'healing-rain': 'water_pulse',
  'riptide-hex': 'whirlpool',
  'abyssal-tide-spear': 'waterfall',
  'oceanic-healing-rain': 'water_pulse',
  'maelstrom-hex': 'whirlpool',
  'static-jolt': 'electric_1',
  'spark-kick': 'electric_2',
  'volt-bite': 'thunder',
  'chain-spark': 'thunder',
  'storm-rush': 'wind_3',
  'bolt-lance': 'thunderbolt',
  'paralyze-bolt': 'thunder',
  'charge-jolt': 'electric_3',
  'chain-jolt': 'thunderbolt',
  'storm-bolt-lance': 'thunderbolt',
  'eternal-paralyze-bolt': 'thunderbolt',
  'overcharge-jolt': 'thunder',
  'tempest-chain-jolt': 'thunderbolt',
  'stone-nudge': 'rock_throw',
  'rock-bump': 'rock_smash',
  'pebble-strike': 'rock_throw',
  'quake-bite': 'rock_smash',
  'earth-pulse': 'earth_3',
  'titan-stomp': 'rock_slide',
  'boulder-ram': 'rock_slide',
  'stun-nudge': 'rock_smash',
  'stone-ward': 'rock_tomb',
  'quake-nudge': 'rock_slide',
  'colossal-boulder-ram': 'rock_wrecker',
  'ruinous-stun-nudge': 'rock_smash',
  'fortress-stone-ward': 'rock_tomb',
  'cataclysm-quake-nudge': 'rock_wrecker',
  'wild-growth': 'razor_leaf',
  'needle-flick': 'razor_leaf',
  'thorn-bite': 'vine_whip',
  'soothing-rain': 'healing_1',
  'binding-mist': 'water_pulse',
  'eternal-binding-mist': 'whirlpool',
}

const KEYWORD_RULES: readonly { test: (id: string) => boolean; sfx: string }[] = [
  { test: (id) => id.includes('heal') || id.includes('rain') && id.includes('healing'), sfx: 'healing_1' },
  { test: (id) => id.includes('lance') && id.includes('tide'), sfx: 'waterfall' },
  { test: (id) => id.includes('lance') && (id.includes('bolt') || id.includes('cinder')), sfx: 'thunderbolt' },
  { test: (id) => id.includes('inferno') || id.includes('solar') || id.includes('celestial'), sfx: 'inferno' },
  { test: (id) => id.includes('ember') || id.includes('cinder') || id.includes('flame'), sfx: 'flame_burst' },
  { test: (id) => id.includes('tide') || id.includes('riptide') || id.includes('maelstrom'), sfx: 'whirlpool' },
  { test: (id) => id.includes('mist') || id.includes('bubble'), sfx: 'water_pulse' },
  { test: (id) => id.includes('vine') || id.includes('thorn') || id.includes('lash'), sfx: 'vine_whip' },
  { test: (id) => id.includes('bolt') || id.includes('volt') || id.includes('spark') || id.includes('jolt'), sfx: 'thunder' },
  { test: (id) => id.includes('storm') || id.includes('rush') && id.includes('storm'), sfx: 'wind_3' },
  { test: (id) => id.includes('boulder') || id.includes('quake') || id.includes('stomp'), sfx: 'rock_slide' },
  { test: (id) => id.includes('stone') || id.includes('pebble') || id.includes('earth'), sfx: 'rock_throw' },
  { test: (id) => id.includes('rock'), sfx: 'rock_smash' },
]

function hashPick(seed: string, pool: readonly string[]): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return pool[Math.abs(h) % pool.length]!
}

function pickTypePool(
  type: ElementType,
  abilityId: string,
  tier: 0 | 1 | 2,
  category: AbilityDefinition['category'],
): string {
  if (
    (abilityId.includes('rush') || abilityId.includes('charge')) &&
    (type === 'Electric' || type === 'Fire')
  ) {
    const wind = WIND_POOL[tier]
    return hashPick(abilityId, wind)
  }

  const pools = TYPE_TIER_POOLS[type]
  const pool = pools[tier]
  if (category === 'physical' && type === 'Ground' && tier === 0) {
    return hashPick(abilityId, ['tackle', 'rock_throw', ...pool])
  }
  return hashPick(abilityId, pool)
}

function resolveStatusSfx(ability: AbilityDefinition, tier: 0 | 1 | 2): string {
  const effects = ability.effects ?? []
  if (effects.some((e) => e.type === 'heal')) {
    return HEAL_POOL[tier]
  }
  const hasBuff = effects.some((e) => e.type === 'statBuff')
  const hasDebuff = effects.some(
    (e) => e.type === 'statDebuff' || e.type === 'applyStatus',
  )
  if (hasBuff && !hasDebuff) {
    return BUFF_POOL[Math.min(tier, BUFF_POOL.length - 1)]
  }
  if (hasDebuff) {
    return DEBUFF_POOL[Math.min(tier, DEBUFF_POOL.length - 1)]
  }
  return BUFF_POOL[0]
}

function matchKeywordRule(abilityId: string): string | null {
  for (const rule of KEYWORD_RULES) {
    if (rule.test(abilityId)) return rule.sfx
  }
  return null
}

export function resolveAbilitySfxKey(
  ability: AbilityDefinition,
  masteryEntry: AbilityMasteryEntry | null,
  options?: { fallbackRank?: number },
): string {
  const rank = masteryEntry?.rank ?? options?.fallbackRank ?? 0
  const tier = getAbilitySoundTier(rank)
  const resolvedId = masteryEntry
    ? getResolvedAbilityId(masteryEntry)
    : ability.id

  if (ABILITY_SFX_BY_ID[resolvedId]) {
    return ABILITY_SFX_BY_ID[resolvedId]
  }
  if (ABILITY_SFX_BY_ID[ability.id]) {
    return ABILITY_SFX_BY_ID[ability.id]
  }

  if (ability.category === 'status' || ability.power <= 0) {
    return resolveStatusSfx(ability, tier)
  }

  const keyword = matchKeywordRule(resolvedId)
  if (keyword) {
    return keyword
  }

  return pickTypePool(ability.type, resolvedId, tier, ability.category)
}

export function abilitySfxSrc(sfxKey: string): string {
  return `${ABILITY_SFX_BASE}/${sfxKey}.mp3`
}
