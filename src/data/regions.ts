export type RegionMapSettings = {
  rows: number
  minNodesPerRow: number
  maxNodesPerRow: number
}

export type Region = {
  id: string
  name: string
  description: string
  theme: string
  difficulty: number
  recommendedLevel: number
  enemyLevelMin: number
  enemyLevelMax: number
  rewardMultiplier: number
  regionNumber: number
  availableBadges: number
  enemyTypes: string[]
  bossName: string
  bossEnemyId: string
  mapSettings: RegionMapSettings
}

export const REGIONS: Region[] = [
  {
    id: 'verdant-circuit',
    name: 'Verdant Circuit',
    description:
      'A beginner-friendly region filled with forests, trainers, and ancient monolith ruins.',
    theme: 'grass',
    difficulty: 1,
    recommendedLevel: 1,
    enemyLevelMin: 1,
    enemyLevelMax: 10,
    rewardMultiplier: 1,
    regionNumber: 1,
    availableBadges: 8,
    enemyTypes: ['grass', 'normal', 'poison'],
    bossName: 'Verdant Apex',
    bossEnemyId: 'region-boss-verdant',
    mapSettings: { rows: 8, minNodesPerRow: 3, maxNodesPerRow: 5 },
  },
  {
    id: 'ember-coast',
    name: 'Ember Coast',
    description:
      'Volcanic paths and scorched shores where fire-type creatures dominate.',
    theme: 'fire',
    difficulty: 2,
    recommendedLevel: 10,
    enemyLevelMin: 10,
    enemyLevelMax: 15,
    rewardMultiplier: 1.35,
    regionNumber: 2,
    availableBadges: 8,
    enemyTypes: ['fire', 'ground', 'normal'],
    bossName: 'Coastal Inferno',
    bossEnemyId: 'region-boss-ember',
    mapSettings: { rows: 8, minNodesPerRow: 3, maxNodesPerRow: 5 },
  },
  {
    id: 'storm-plateau',
    name: 'Storm Plateau',
    description:
      'Rocky cliffs crackling with storms and electric predators hunting in packs.',
    theme: 'electric',
    difficulty: 3,
    recommendedLevel: 15,
    enemyLevelMin: 15,
    enemyLevelMax: 20,
    rewardMultiplier: 1.75,
    regionNumber: 3,
    availableBadges: 8,
    enemyTypes: ['electric', 'ground', 'normal'],
    bossName: 'Plateau Tempest',
    bossEnemyId: 'region-boss-storm',
    mapSettings: { rows: 8, minNodesPerRow: 3, maxNodesPerRow: 5 },
  },
  {
    id: 'obsidian-crown',
    name: 'Obsidian Crown',
    description:
      'Dark volcanic ruins where elite trainers and apex predators guard the crown monolith.',
    theme: 'dark',
    difficulty: 4,
    recommendedLevel: 20,
    enemyLevelMin: 20,
    enemyLevelMax: 30,
    rewardMultiplier: 2.25,
    regionNumber: 4,
    availableBadges: 8,
    enemyTypes: ['ground', 'fire', 'electric'],
    bossName: 'Crown Warden',
    bossEnemyId: 'region-boss-obsidian',
    mapSettings: { rows: 8, minNodesPerRow: 3, maxNodesPerRow: 5 },
  },
]

export const DEFAULT_REGION_ID = 'verdant-circuit'

export const REGIONS_BY_ID: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
)

export function getRegion(id: string): Region {
  return REGIONS_BY_ID[id] ?? REGIONS_BY_ID[DEFAULT_REGION_ID]
}

export function normalizeRegionId(value: unknown): string {
  if (typeof value === 'string' && REGIONS_BY_ID[value]) return value
  if (value === 1 || value === '1') return DEFAULT_REGION_ID
  return DEFAULT_REGION_ID
}
