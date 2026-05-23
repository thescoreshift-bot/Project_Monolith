import type { ElementType } from './starters'
import { STARTER_ABILITY_IDS } from './abilities'

export type LearnsetEntry = {
  level: number
  abilityId: string
}

export type Learnset = {
  id: string
  entries: LearnsetEntry[]
}

const FIRE_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'spark-ember' },
  { level: 3, abilityId: 'soft-growl' },
  { level: 5, abilityId: 'smoke-flicker' },
  { level: 7, abilityId: 'quick-swipe' },
  { level: 10, abilityId: 'flame-bite' },
  { level: 14, abilityId: 'heat-veil' },
  { level: 18, abilityId: 'ember-burst' },
  { level: 22, abilityId: 'scorching-cry' },
  { level: 28, abilityId: 'inferno-rush' },
]

const WATER_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'bubble-hex' },
  { level: 3, abilityId: 'gentle-cry' },
  { level: 5, abilityId: 'mist-veil' },
  { level: 7, abilityId: 'splash-strike' },
  { level: 10, abilityId: 'water-fang' },
  { level: 14, abilityId: 'soothing-rain' },
  { level: 18, abilityId: 'pressure-wave' },
  { level: 22, abilityId: 'drench-guard' },
  { level: 28, abilityId: 'riptide-crash' },
]

const GRASS_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'vine-lash' },
  { level: 3, abilityId: 'root-snare' },
  { level: 5, abilityId: 'leaf-guard' },
  { level: 7, abilityId: 'needle-flick' },
  { level: 10, abilityId: 'thorn-bite' },
  { level: 14, abilityId: 'green-pulse' },
  { level: 18, abilityId: 'spore-cloud' },
  { level: 22, abilityId: 'barkskin' },
  { level: 28, abilityId: 'wild-growth' },
]

const ELECTRIC_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'static-jolt' },
  { level: 3, abilityId: 'sharp-chirp' },
  { level: 5, abilityId: 'quick-charge' },
  { level: 7, abilityId: 'spark-kick' },
  { level: 10, abilityId: 'volt-bite' },
  { level: 14, abilityId: 'static-veil' },
  { level: 18, abilityId: 'chain-spark' },
  { level: 22, abilityId: 'overcharge' },
  { level: 28, abilityId: 'storm-rush' },
]

const GROUND_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'stone-nudge' },
  { level: 3, abilityId: 'low-rumble' },
  { level: 5, abilityId: 'harden-hide' },
  { level: 7, abilityId: 'pebble-strike' },
  { level: 10, abilityId: 'quake-bite' },
  { level: 14, abilityId: 'stone-guard' },
  { level: 18, abilityId: 'dust-cloud' },
  { level: 22, abilityId: 'earth-pulse' },
  { level: 28, abilityId: 'titan-stomp' },
]

const TYPE_LEARNSETS: Record<ElementType, LearnsetEntry[]> = {
  Fire: FIRE_LEARNSET,
  Water: WATER_LEARNSET,
  Grass: GRASS_LEARNSET,
  Electric: ELECTRIC_LEARNSET,
  Ground: GROUND_LEARNSET,
}

const STARTER_ID_LEARNSETS: Record<string, LearnsetEntry[]> = {
  fire: FIRE_LEARNSET,
  water: WATER_LEARNSET,
  grass: GRASS_LEARNSET,
  electric: ELECTRIC_LEARNSET,
  ground: GROUND_LEARNSET,
}

const RECRUIT_LEARNSET: LearnsetEntry[] = [
  { level: 1, abilityId: 'tackle' },
  { level: 5, abilityId: 'soft-growl' },
  { level: 8, abilityId: 'quick-swipe' },
  { level: 12, abilityId: 'harden-hide' },
]

export function getLearnsetForCreature(
  starterTypeId: string | undefined,
  elementType: ElementType,
): LearnsetEntry[] {
  if (starterTypeId && STARTER_ID_LEARNSETS[starterTypeId]) {
    return STARTER_ID_LEARNSETS[starterTypeId]
  }
  return TYPE_LEARNSETS[elementType] ?? RECRUIT_LEARNSET
}

export function getMovesLearnedBetweenLevels(
  starterTypeId: string | undefined,
  elementType: ElementType,
  levelBefore: number,
  levelAfter: number,
): string[] {
  const learnset = getLearnsetForCreature(starterTypeId, elementType)
  return learnset
    .filter((e) => e.level > levelBefore && e.level <= levelAfter)
    .map((e) => e.abilityId)
}

export function getStarterFirstAbility(type: ElementType): string {
  return STARTER_ABILITY_IDS[type]
}
