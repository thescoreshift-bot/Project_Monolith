import type { ElementType } from './starters'
import type { NodeType } from './nodeMap'
import { resolveNpcCreatureDisplay } from './creaturePortraits'
import { getGymTrainerPortraitUrl } from './trainerPortraits'
import { normalizeRecruitTemplateId } from './recruitPortraits'
import {
  encounterKindToHpMultiplier,
  enemyKindToHpMultiplier,
} from '../data/balance'
import { GYM_NPC_TEMPLATES, REGION_ELITE_IDS } from './gymRoster'
import {
  getLeaderIdForBadge,
  getTrainerIdForBadge,
} from './regionGyms'
import { getRegion } from './regions'
import {
  getRegionEnemyLevelRange,
  rollEnemyLevelForNode,
} from '../utils/regionRewards'
import { getCoinReward, getXpReward } from '../utils/rewards'
import { gameRandom } from '../utils/seededRandom'
import {
  rollEnemyCombatModifier,
  type EnemyCombatModifier,
} from './enemyModifiers'

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
  /** Recruit template id for portrait + foe name (trainers, leaders, elites). */
  companionTemplateId?: string
}

export type Enemy = EnemyTemplate & {
  currentHp: number
  combatModifier?: EnemyCombatModifier
  shieldHp?: number
}

export type EncounterKind =
  | 'battle'
  | 'elite'
  | 'alphaNest'
  | 'gymTrainer'
  | 'gymLeader'
  | 'boss'
  | 'council'

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
    abilityIds: ['rock-bump', 'soft-growl', 'tackle'],
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
    companionTemplateId: 'voltimp',
  },
  'elite-coast-hunter': {
    id: 'elite-coast-hunter',
    name: 'Coast Hunter',
    type: 'Fire',
    kind: 'elite',
    level: 12,
    maxHp: 54,
    stats: { atk: 50, def: 38, spAtk: 46, spDef: 34, spd: 44 },
    abilityIds: ['cinder-bite', 'spark-ember'],
    recruitable: false,
    companionTemplateId: 'ashling',
  },
  'elite-storm-hunter': {
    id: 'elite-storm-hunter',
    name: 'Storm Hunter',
    type: 'Electric',
    kind: 'elite',
    level: 16,
    maxHp: 52,
    stats: { atk: 52, def: 36, spAtk: 54, spDef: 34, spd: 50 },
    abilityIds: ['static-jolt', 'spark-ember'],
    recruitable: false,
    companionTemplateId: 'voltimp',
  },
  'elite-obsidian-hunter': {
    id: 'elite-obsidian-hunter',
    name: 'Obsidian Hunter',
    type: 'Ground',
    kind: 'elite',
    level: 20,
    maxHp: 62,
    stats: { atk: 56, def: 52, spAtk: 44, spDef: 48, spd: 36 },
    abilityIds: ['rock-bump', 'stone-nudge'],
    recruitable: false,
    companionTemplateId: 'pebblemaw',
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
    companionTemplateId: 'bristlebug',
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
    companionTemplateId: 'ashling',
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
    companionTemplateId: 'voltimp',
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
    companionTemplateId: 'pebblemaw',
  },
  ...GYM_NPC_TEMPLATES,
}

/** @deprecated Use region-specific boss ids */
const LEGACY_REGION_BOSS = 'region-boss-verdant'

export function getEnemyCombatDisplay(enemy: Enemy): {
  creatureName: string
  creaturePortraitUrl: string | null
  creatureType: ElementType
  trainerName: string | null
  trainerPortraitUrl: string | null
  trainerLabel: string
} {
  const companionId = enemy.companionTemplateId
  const companion = companionId ? ENEMY_TEMPLATES[companionId] : undefined

  const creatureTemplateId = companionId ?? normalizeRecruitTemplateId(enemy.id)
  const baseTemplate = companion ?? ENEMY_TEMPLATES[creatureTemplateId]
  const baseName = baseTemplate?.name ?? enemy.name
  const elementType = baseTemplate?.type ?? enemy.type

  const resolved = resolveNpcCreatureDisplay(
    creatureTemplateId,
    elementType,
    enemy.level,
    baseName,
  )

  const trainerPortraitUrl = getGymTrainerPortraitUrl(enemy.id)
  const isGymNpc = Boolean(trainerPortraitUrl)

  const trainerLabel =
    isGymNpc
      ? enemy.name
      : companionId &&
          (enemy.kind === 'trainer' || enemy.kind === 'boss' || enemy.kind === 'elite')
        ? enemy.name
        : 'Enemy'

  return {
    creatureName: resolved.name,
    creaturePortraitUrl: resolved.portraitUrl,
    creatureType: elementType,
    trainerName: isGymNpc ? enemy.name : null,
    trainerPortraitUrl,
    trainerLabel,
  }
}

export function getEnemyFoeName(enemy: Enemy): string {
  return getEnemyCombatDisplay(enemy).creatureName
}

/** Archive discovery ids when a battle starts (base recruit + displayed evolution name). */
export function getEnemyArchiveDiscovery(enemy: Enemy): {
  templateId: string
  creatureName: string
} {
  const display = getEnemyCombatDisplay(enemy)
  const templateId =
    enemy.companionTemplateId ?? normalizeRecruitTemplateId(enemy.id)
  return {
    templateId,
    creatureName: display.creatureName,
  }
}

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
  const earlyDurability =
    level <= 8 &&
    template.kind === 'normal' &&
    (options?.encounterKind === 'battle' || !options?.encounterKind)
      ? 1.12
      : level <= 10 &&
          (template.kind === 'elite' || template.kind === 'alpha')
        ? 1.08
        : 1
  const hpScale = (options?.hpMult ?? 1) * earlyDurability
  const lateHpBonus =
    level > 10 && (options?.encounterKind === 'battle' || !options?.encounterKind)
      ? 1 + Math.min(0.55, (level - 10) * 0.04)
      : 1
  const maxHp = Math.max(
    1,
    Math.round(
      template.maxHp * ratio * hpScale * encounterMult * kindMult * lateHpBonus,
    ),
  )
  const combatModifier = rollEnemyCombatModifier(level, template.kind)
  let shieldHp = 0
  if (combatModifier?.startingShieldPercent) {
    shieldHp = Math.max(
      1,
      Math.round(maxHp * combatModifier.startingShieldPercent),
    )
  }
  if (combatModifier?.defPenaltyPercent) {
    stats.def = Math.max(
      1,
      Math.round(stats.def * (1 - combatModifier.defPenaltyPercent)),
    )
    stats.spDef = Math.max(
      1,
      Math.round(stats.spDef * (1 - combatModifier.defPenaltyPercent)),
    )
  }
  if (combatModifier?.spdBonusPercent) {
    stats.spd = Math.max(
      1,
      Math.round(stats.spd * (1 + combatModifier.spdBonusPercent)),
    )
  }
  return {
    ...template,
    level,
    stats,
    maxHp,
    currentHp: maxHp,
    combatModifier,
    shieldHp: shieldHp > 0 ? shieldHp : undefined,
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
  dailySeed?: string
}

export function getEnemyForNode(
  node: { type: NodeType; badgeId?: string; layer?: number },
  regionId = 'verdant-circuit',
  spawnOptions?: EnemySpawnOptions,
  partyHighestLevel?: number,
): Enemy {
  const isDailyRun = Boolean(spawnOptions?.dailySeed)
  const level = rollEnemyLevelForNode(regionId, node.type, {
    partyHighestLevel,
    mapLayer: node.layer ?? 0,
    isDailyRun,
  })

  if (isDailyRun) {
    console.log('Daily Run Enemy Scaling', {
      dailySeed: spawnOptions?.dailySeed,
      playerHighestLevel: partyHighestLevel,
      currentRegion: regionId,
      enemyLevelRange: getRegionEnemyLevelRange(regionId),
      generatedEnemyLevel: level,
      nodeType: node.type,
      mapLayer: node.layer ?? 0,
    })
  }

  const hpMult = spawnOptions?.hpMult
  const encounterKind = getEncounterKind(node.type)

  if (node.type === 'boss') {
    const region = getRegion(regionId)
    const bossId = region.bossEnemyId ?? LEGACY_REGION_BOSS
    return spawnEnemy(bossId, level, { hpMult, encounterKind })
  }
  if (node.type === 'gymLeader' && node.badgeId) {
    const leaderId = getLeaderIdForBadge(node.badgeId)
    return spawnEnemy(leaderId, level, { hpMult, encounterKind })
  }
  if (node.type === 'gymTrainer') {
    const trainerId = getTrainerIdForBadge(node.badgeId)
    return spawnEnemy(trainerId, level, { hpMult, encounterKind })
  }
  if (node.type === 'alphaNest') {
    const alphas = ['alpha-bristlebug', 'alpha-ashling', 'alpha-pebblemaw']
    const id = alphas[Math.floor(gameRandom() * alphas.length)]
    return spawnEnemy(id, level, { hpMult, encounterKind })
  }
  if (node.type === 'elite') {
    const eliteId = REGION_ELITE_IDS[regionId] ?? 'elite-scout'
    return spawnEnemy(eliteId, level, { hpMult, encounterKind })
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
