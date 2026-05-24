import type { ElementType } from './starters'
import type { NodeType } from './nodeMap'
import {
  encounterKindToHpMultiplier,
  enemyKindToHpMultiplier,
} from '../data/balance'
import { getRegion } from './regions'
import { rollEnemyLevelForNode } from '../utils/regionRewards'
import { getCoinReward, getXpReward } from '../utils/rewards'
import { gameRandom } from '../utils/seededRandom'

export type EnemyStats = {
  atk: number
  def: number
  spAtk: number
  spDef: number
  spd: number
}

export type EnemyKind = 'normal' | 'alpha' | 'elite' | 'trainer' | 'boss'

export type EnemyTemplate = {
  id: string
  name: string
  type: ElementType
  kind: EnemyKind
  level: number
  maxHp: number
  stats: EnemyStats
  abilityIds: string[]
  recruitable?: boolean
}

export type Enemy = EnemyTemplate & {
  currentHp: number
}

export type EncounterKind =
  | 'battle'
  | 'elite'
  | 'alphaNest'
  | 'gymTrainer'
  | 'gymLeader'
  | 'boss'

export type EncounterRewards = {
  xp: number
  coins: number
}

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  bristlebug: {
    id: 'bristlebug',
    name: 'Bristlebug',
    type: 'Grass',
    kind: 'normal',
    level: 1,
    maxHp: 40,
    stats: { atk: 5, def: 6, spAtk: 5, spDef: 5, spd: 11 },
    abilityIds: ['sting', 'tackle'],
    recruitable: true,
  },
  ashling: {
    id: 'ashling',
    name: 'Ashling',
    type: 'Fire',
    kind: 'normal',
    level: 1,
    maxHp: 42,
    stats: { atk: 6, def: 5, spAtk: 6, spDef: 5, spd: 10 },
    abilityIds: ['cinder-bite', 'tackle'],
    recruitable: true,
  },
  pebblemaw: {
    id: 'pebblemaw',
    name: 'Pebblemaw',
    type: 'Ground',
    kind: 'normal',
    level: 1,
    maxHp: 50,
    stats: { atk: 5, def: 8, spAtk: 4, spDef: 7, spd: 8 },
    abilityIds: ['rock-bump', 'tackle'],
    recruitable: true,
  },
  driftwisp: {
    id: 'driftwisp',
    name: 'Driftwisp',
    type: 'Water',
    kind: 'normal',
    level: 1,
    maxHp: 42,
    stats: { atk: 5, def: 6, spAtk: 7, spDef: 6, spd: 13 },
    abilityIds: ['bubble-hex', 'tackle'],
    recruitable: true,
  },
  voltimp: {
    id: 'voltimp',
    name: 'Voltimp',
    type: 'Electric',
    kind: 'normal',
    level: 1,
    maxHp: 38,
    stats: { atk: 5, def: 5, spAtk: 8, spDef: 5, spd: 14 },
    abilityIds: ['static-jolt', 'tackle'],
    recruitable: true,
  },
  'alpha-bristlebug': {
    id: 'alpha-bristlebug',
    name: 'Alpha Bristlebug',
    type: 'Grass',
    kind: 'alpha',
    level: 6,
    maxHp: 52,
    stats: { atk: 38, def: 30, spAtk: 32, spDef: 30, spd: 36 },
    abilityIds: ['sting', 'tackle'],
    recruitable: false,
  },
  'alpha-ashling': {
    id: 'alpha-ashling',
    name: 'Alpha Ashling',
    type: 'Fire',
    kind: 'alpha',
    level: 8,
    maxHp: 58,
    stats: { atk: 52, def: 36, spAtk: 48, spDef: 38, spd: 40 },
    abilityIds: ['cinder-bite', 'cinder-bite'],
    recruitable: false,
  },
  'alpha-pebblemaw': {
    id: 'alpha-pebblemaw',
    name: 'Alpha Pebblemaw',
    type: 'Ground',
    kind: 'alpha',
    level: 9,
    maxHp: 78,
    stats: { atk: 45, def: 62, spAtk: 36, spDef: 55, spd: 22 },
    abilityIds: ['rock-bump', 'rock-bump'],
    recruitable: false,
  },
  'elite-scout': {
    id: 'elite-scout',
    name: 'Elite Scout',
    type: 'Electric',
    kind: 'elite',
    level: 7,
    maxHp: 48,
    stats: { atk: 44, def: 34, spAtk: 40, spDef: 32, spd: 42 },
    abilityIds: ['static-jolt', 'tackle'],
    recruitable: false,
  },
  'gym-trainer-nova': {
    id: 'gym-trainer-nova',
    name: 'Trainer Nova',
    type: 'Fire',
    kind: 'trainer',
    level: 8,
    maxHp: 50,
    stats: { atk: 46, def: 36, spAtk: 42, spDef: 34, spd: 40 },
    abilityIds: ['spark-ember', 'cinder-bite'],
    recruitable: false,
  },
  'gym-leader-ember': {
    id: 'gym-leader-ember',
    name: 'Leader Pyra',
    type: 'Fire',
    kind: 'boss',
    level: 10,
    maxHp: 72,
    stats: { atk: 52, def: 40, spAtk: 55, spDef: 42, spd: 44 },
    abilityIds: ['spark-ember', 'cinder-bite'],
    recruitable: false,
  },
  'gym-leader-tide': {
    id: 'gym-leader-tide',
    name: 'Leader Marina',
    type: 'Water',
    kind: 'boss',
    level: 10,
    maxHp: 76,
    stats: { atk: 44, def: 44, spAtk: 52, spDef: 48, spd: 38 },
    abilityIds: ['bubble-hex', 'tackle'],
    recruitable: false,
  },
  'gym-leader-bloom': {
    id: 'gym-leader-bloom',
    name: 'Leader Sylva',
    type: 'Grass',
    kind: 'boss',
    level: 10,
    maxHp: 74,
    stats: { atk: 46, def: 42, spAtk: 50, spDef: 46, spd: 36 },
    abilityIds: ['vine-lash', 'sting'],
    recruitable: false,
  },
  'gym-leader-volt': {
    id: 'gym-leader-volt',
    name: 'Leader Surge',
    type: 'Electric',
    kind: 'boss',
    level: 11,
    maxHp: 68,
    stats: { atk: 48, def: 38, spAtk: 58, spDef: 40, spd: 52 },
    abilityIds: ['static-jolt', 'spark-ember'],
    recruitable: false,
  },
  'gym-leader-stone': {
    id: 'gym-leader-stone',
    name: 'Leader Granite',
    type: 'Ground',
    kind: 'boss',
    level: 11,
    maxHp: 88,
    stats: { atk: 50, def: 58, spAtk: 40, spDef: 52, spd: 28 },
    abilityIds: ['rock-bump', 'stone-nudge'],
    recruitable: false,
  },
  'gym-leader-venom': {
    id: 'gym-leader-venom',
    name: 'Leader Toxin',
    type: 'Grass',
    kind: 'boss',
    level: 11,
    maxHp: 70,
    stats: { atk: 42, def: 40, spAtk: 56, spDef: 44, spd: 40 },
    abilityIds: ['vine-lash', 'sting'],
    recruitable: false,
  },
  'gym-leader-spirit': {
    id: 'gym-leader-spirit',
    name: 'Leader Phantom',
    type: 'Water',
    kind: 'boss',
    level: 12,
    maxHp: 72,
    stats: { atk: 40, def: 42, spAtk: 54, spDef: 56, spd: 42 },
    abilityIds: ['bubble-hex', 'static-jolt'],
    recruitable: false,
  },
  'gym-leader-apex': {
    id: 'gym-leader-apex',
    name: 'Leader Apex',
    type: 'Electric',
    kind: 'boss',
    level: 12,
    maxHp: 80,
    stats: { atk: 55, def: 45, spAtk: 58, spDef: 48, spd: 50 },
    abilityIds: ['static-jolt', 'cinder-bite'],
    recruitable: false,
  },
  'region-boss-verdant': {
    id: 'region-boss-verdant',
    name: 'Verdant Apex',
    type: 'Grass',
    kind: 'boss',
    level: 14,
    maxHp: 110,
    stats: { atk: 58, def: 52, spAtk: 55, spDef: 50, spd: 42 },
    abilityIds: ['vine-lash', 'sting'],
    recruitable: false,
  },
  'region-boss-ember': {
    id: 'region-boss-ember',
    name: 'Coastal Inferno',
    type: 'Fire',
    kind: 'boss',
    level: 16,
    maxHp: 120,
    stats: { atk: 65, def: 48, spAtk: 62, spDef: 46, spd: 48 },
    abilityIds: ['cinder-bite', 'spark-ember'],
    recruitable: false,
  },
  'region-boss-storm': {
    id: 'region-boss-storm',
    name: 'Plateau Tempest',
    type: 'Electric',
    kind: 'boss',
    level: 18,
    maxHp: 115,
    stats: { atk: 62, def: 50, spAtk: 68, spDef: 48, spd: 58 },
    abilityIds: ['static-jolt', 'spark-ember'],
    recruitable: false,
  },
  'region-boss-obsidian': {
    id: 'region-boss-obsidian',
    name: 'Crown Warden',
    type: 'Ground',
    kind: 'boss',
    level: 28,
    maxHp: 140,
    stats: { atk: 72, def: 65, spAtk: 70, spDef: 58, spd: 52 },
    abilityIds: ['rock-bump', 'stone-nudge'],
    recruitable: false,
  },
}

/** @deprecated Use region-specific boss ids */
const LEGACY_REGION_BOSS = 'region-boss-verdant'

const NORMAL_POOL = [
  'bristlebug',
  'ashling',
  'pebblemaw',
  'driftwisp',
  'voltimp',
]

const REGION_NORMAL_POOLS: Record<string, string[]> = {
  'verdant-circuit': ['bristlebug', 'pebblemaw', 'driftwisp'],
  'ember-coast': ['ashling', 'pebblemaw', 'bristlebug'],
  'storm-plateau': ['voltimp', 'ashling', 'elite-scout'],
  'obsidian-crown': ['pebblemaw', 'voltimp', 'elite-scout'],
}

const BADGE_LEADER_MAP: Record<string, string> = {
  'ember-badge': 'gym-leader-ember',
  'tide-badge': 'gym-leader-tide',
  'bloom-badge': 'gym-leader-bloom',
  'volt-badge': 'gym-leader-volt',
  'stone-badge': 'gym-leader-stone',
  'venom-badge': 'gym-leader-venom',
  'spirit-badge': 'gym-leader-spirit',
  'apex-badge': 'gym-leader-apex',
}

function scaleStats(stats: EnemyStats, ratio: number): EnemyStats {
  return {
    atk: Math.max(1, Math.round(stats.atk * ratio)),
    def: Math.max(1, Math.round(stats.def * ratio)),
    spAtk: Math.max(1, Math.round(stats.spAtk * ratio)),
    spDef: Math.max(1, Math.round(stats.spDef * ratio)),
    spd: Math.max(1, Math.round(stats.spd * ratio)),
  }
}

export function spawnEnemy(
  templateId: string,
  targetLevel?: number,
  options?: { hpMult?: number; encounterKind?: EncounterKind },
): Enemy {
  const template = ENEMY_TEMPLATES[templateId] ?? ENEMY_TEMPLATES.bristlebug
  const level = Math.max(1, targetLevel ?? template.level)
  const ratio = level / Math.max(1, template.level)
  const stats = scaleStats(template.stats, ratio)
  const encounterMult = options?.encounterKind
    ? encounterKindToHpMultiplier(options.encounterKind)
    : 1
  const kindMult = enemyKindToHpMultiplier(template.kind)
  const hpScale = (options?.hpMult ?? 1) * (level <= 3 ? 1 : 1)
  const maxHp = Math.max(
    1,
    Math.round(template.maxHp * ratio * hpScale * encounterMult * kindMult),
  )
  return {
    ...template,
    level,
    stats,
    maxHp,
    currentHp: maxHp,
  }
}

export function pickRandomNormalEnemy(
  regionId?: string,
  targetLevel?: number,
  options?: { fireBias?: boolean; hpMult?: number; encounterKind?: EncounterKind },
): Enemy {
  const pool =
    regionId && REGION_NORMAL_POOLS[regionId]
      ? REGION_NORMAL_POOLS[regionId]
      : NORMAL_POOL
  let id: string
  if (options?.fireBias && pool.includes('ashling') && gameRandom() < 0.55) {
    id = 'ashling'
  } else {
    id = pool[Math.floor(gameRandom() * pool.length)]
  }
  return spawnEnemy(id, targetLevel, {
    hpMult: options?.hpMult,
    encounterKind: options?.encounterKind ?? 'battle',
  })
}

export function getEncounterKind(nodeType: NodeType): EncounterKind {
  if (nodeType === 'elite') return 'elite'
  if (nodeType === 'alphaNest') return 'alphaNest'
  if (nodeType === 'gymTrainer') return 'gymTrainer'
  if (nodeType === 'gymLeader') return 'gymLeader'
  if (nodeType === 'boss') return 'boss'
  return 'battle'
}

export type EnemySpawnOptions = {
  fireBias?: boolean
  hpMult?: number
}

export function getEnemyForNode(
  node: { type: NodeType; badgeId?: string },
  regionId = 'verdant-circuit',
  spawnOptions?: EnemySpawnOptions,
  partyHighestLevel?: number,
): Enemy {
  const level = rollEnemyLevelForNode(regionId, node.type, partyHighestLevel)
  const hpMult = spawnOptions?.hpMult
  const encounterKind = getEncounterKind(node.type)

  if (node.type === 'boss') {
    const region = getRegion(regionId)
    const bossId = region.bossEnemyId ?? LEGACY_REGION_BOSS
    return spawnEnemy(bossId, level, { hpMult, encounterKind })
  }
  if (node.type === 'gymLeader' && node.badgeId) {
    const leaderId = BADGE_LEADER_MAP[node.badgeId] ?? 'gym-leader-ember'
    return spawnEnemy(leaderId, level, { hpMult, encounterKind })
  }
  if (node.type === 'gymTrainer') {
    return spawnEnemy('gym-trainer-nova', level, { hpMult, encounterKind })
  }
  if (node.type === 'alphaNest') {
    const alphas = ['alpha-bristlebug', 'alpha-ashling', 'alpha-pebblemaw']
    const id = alphas[Math.floor(gameRandom() * alphas.length)]
    return spawnEnemy(id, level, { hpMult, encounterKind })
  }
  if (node.type === 'elite') {
    return spawnEnemy('elite-scout', level, { hpMult, encounterKind })
  }
  return pickRandomNormalEnemy(regionId, level, {
    fireBias: spawnOptions?.fireBias,
    hpMult,
    encounterKind,
  })
}

export function getRewardsForEncounter(
  kind: EncounterKind,
  regionId?: string,
): EncounterRewards {
  return {
    xp: getXpReward(kind, regionId),
    coins: getCoinReward(kind, regionId),
  }
}

export function canRecruitEnemy(enemy: Enemy, nodeType: NodeType): boolean {
  if (nodeType !== 'battle') return false
  if (enemy.kind !== 'normal') return false
  const template = ENEMY_TEMPLATES[enemy.id]
  return template?.recruitable === true
}
