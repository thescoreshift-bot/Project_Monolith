import type { ElementType } from './starters'
import { getRegion } from './regions'

export type CouncilAiStyle =
  | 'offense'
  | 'defense'
  | 'speedStatus'
  | 'utilityControl'
  | 'elemental'
  | 'champion'

export type CouncilTrainerSlot = {
  trainerName: string
  creatureTemplateId: string
  level: number
  /** Optional override; defaults from template */
  abilityIds?: string[]
}

export type CouncilTrial = {
  id: string
  name: string
  aiStyle: CouncilAiStyle
  trainers: [CouncilTrainerSlot, CouncilTrainerSlot]
}

export type CouncilCompletionRewards = {
  coins: number
  monolithFragments: number
  emblemItemId: string
  titleId: string
  titleName: string
  rareGearRollCount: number
  unlocksNextRegionId?: string
}

/** Static council definition per region (progress lives in save state). */
export type RegionCouncil = {
  regionId: string
  regionName: string
  officialName: string
  localName: string
  councilId: string
  requiredBadges: number
  recommendedLevel: number
  trials: CouncilTrial[]
  rewards: CouncilCompletionRewards
}

/** @deprecated Use RegionCouncil */
export type MonolithCouncilDefinition = RegionCouncil

/** Runtime view merging definition with save progress. */
export type RegionCouncilProgress = RegionCouncil & {
  unlocked: boolean
  completed: boolean
}

export type RegionCouncilSaveEntry = {
  regionId: string
  regionName: string
  officialName: string
  localName: string
  unlocked: boolean
  completed: boolean
}

export function buildOfficialCouncilName(regionName: string): string {
  return `The Monolith Council of ${regionName}`
}

export function buildLocalCouncilFlavorLine(localName: string): string {
  return `Known locally as ${localName}.`
}

type RegionCouncilMeta = {
  regionId: string
  /** Display region name used in the official council title */
  regionName: string
  localName: string
  councilId: string
}

export const REGION_COUNCIL_META: RegionCouncilMeta[] = [
  {
    regionId: 'verdant-circuit',
    regionName: 'Verdant Circuit',
    localName: 'The Verdant Council',
    councilId: 'verdant-council',
  },
  {
    regionId: 'ember-coast',
    regionName: 'Ember Coast',
    localName: 'The Ember Council',
    councilId: 'ember-council',
  },
  {
    regionId: 'storm-plateau',
    regionName: 'Stormreach',
    localName: 'The Storm Council',
    councilId: 'storm-council',
  },
  {
    regionId: 'obsidian-crown',
    regionName: 'Stonefall',
    localName: 'The Stone Council',
    councilId: 'stone-council',
  },
  {
    regionId: 'tidegrave',
    regionName: 'Tidegrave',
    localName: 'The Tide Council',
    councilId: 'tide-council',
  },
  {
    regionId: 'venomroot',
    regionName: 'Venomroot',
    localName: 'The Venom Council',
    councilId: 'venom-council',
  },
  {
    regionId: 'spiritveil',
    regionName: 'Spiritveil',
    localName: 'The Spirit Council',
    councilId: 'spirit-council',
  },
  {
    regionId: 'apex-spire',
    regionName: 'Apex Spire',
    localName: 'The Apex Council',
    councilId: 'apex-council',
  },
]

function councilNames(meta: RegionCouncilMeta): Pick<
  RegionCouncil,
  'regionName' | 'officialName' | 'localName'
> {
  return {
    regionName: meta.regionName,
    officialName: buildOfficialCouncilName(meta.regionName),
    localName: meta.localName,
  }
}

const VERDANT_TRIALS: CouncilTrial[] = [
  {
    id: 'verdant-offense',
    name: 'Offense Pair',
    aiStyle: 'offense',
    trainers: [
      {
        trainerName: 'Council Striker Aven',
        creatureTemplateId: 'ashling',
        level: 10,
      },
      {
        trainerName: 'Council Striker Rook',
        creatureTemplateId: 'voltimp',
        level: 10,
      },
    ],
  },
  {
    id: 'verdant-defense',
    name: 'Defense Pair',
    aiStyle: 'defense',
    trainers: [
      {
        trainerName: 'Council Bulwark Mira',
        creatureTemplateId: 'pebblemaw',
        level: 11,
      },
      {
        trainerName: 'Council Bulwark Holt',
        creatureTemplateId: 'bristlebug',
        level: 11,
      },
    ],
  },
  {
    id: 'verdant-speed',
    name: 'Speed / Status Pair',
    aiStyle: 'speedStatus',
    trainers: [
      {
        trainerName: 'Council Tempo Sera',
        creatureTemplateId: 'voltimp',
        level: 12,
        abilityIds: ['spark-ember', 'static-lash'],
      },
      {
        trainerName: 'Council Tempo Pike',
        creatureTemplateId: 'driftwisp',
        level: 12,
      },
    ],
  },
  {
    id: 'verdant-utility',
    name: 'Utility / Control Pair',
    aiStyle: 'utilityControl',
    trainers: [
      {
        trainerName: 'Council Strategist Vale',
        creatureTemplateId: 'driftwisp',
        level: 13,
      },
      {
        trainerName: 'Council Strategist Ren',
        creatureTemplateId: 'bristlebug',
        level: 13,
        abilityIds: ['sting', 'bind-spores'],
      },
    ],
  },
  {
    id: 'verdant-elemental',
    name: 'Elemental Specialist Pair',
    aiStyle: 'elemental',
    trainers: [
      {
        trainerName: 'Council Weaver Lior',
        creatureTemplateId: 'ashling',
        level: 14,
      },
      {
        trainerName: 'Council Weaver Moss',
        creatureTemplateId: 'bristlebug',
        level: 14,
      },
    ],
  },
  {
    id: 'verdant-warden',
    name: 'Monolith Warden',
    aiStyle: 'champion',
    trainers: [
      {
        trainerName: 'Warden Syla',
        creatureTemplateId: 'pebblemaw',
        level: 15,
      },
      {
        trainerName: 'Warden Kael',
        creatureTemplateId: 'voltimp',
        level: 15,
      },
    ],
  },
]

function placeholderRewards(
  _regionId: string,
  emblemSuffix: string,
  coins: number,
  fragments: number,
  unlocksNextRegionId?: string,
): CouncilCompletionRewards {
  return {
    coins,
    monolithFragments: fragments,
    emblemItemId: `${emblemSuffix}-council-emblem`,
    titleId: 'council-initiate',
    titleName: 'Council Initiate',
    rareGearRollCount: 1,
    unlocksNextRegionId,
  }
}

function buildCouncilEntry(
  meta: RegionCouncilMeta,
  config: {
    requiredBadges: number
    recommendedLevel: number
    trials: CouncilTrial[]
    rewards: CouncilCompletionRewards
  },
): RegionCouncil {
  return {
    regionId: meta.regionId,
    councilId: meta.councilId,
    ...councilNames(meta),
    requiredBadges: config.requiredBadges,
    recommendedLevel: config.recommendedLevel,
    trials: config.trials,
    rewards: config.rewards,
  }
}

export const MONOLITH_COUNCILS: Record<string, RegionCouncil> = {
  'verdant-circuit': buildCouncilEntry(
    REGION_COUNCIL_META[0]!,
    {
      requiredBadges: 8,
      recommendedLevel: 12,
      trials: VERDANT_TRIALS,
      rewards: placeholderRewards('verdant-circuit', 'verdant', 150, 3, 'ember-coast'),
    },
  ),
  'ember-coast': buildCouncilEntry(REGION_COUNCIL_META[1]!, {
    requiredBadges: 8,
    recommendedLevel: 18,
    trials: [],
    rewards: placeholderRewards('ember-coast', 'ember', 200, 4, 'storm-plateau'),
  }),
  'storm-plateau': buildCouncilEntry(REGION_COUNCIL_META[2]!, {
    requiredBadges: 8,
    recommendedLevel: 22,
    trials: [],
    rewards: placeholderRewards('storm-plateau', 'storm', 250, 5, 'obsidian-crown'),
  }),
  'obsidian-crown': buildCouncilEntry(REGION_COUNCIL_META[3]!, {
    requiredBadges: 8,
    recommendedLevel: 28,
    trials: [],
    rewards: placeholderRewards('obsidian-crown', 'stone', 300, 6, 'tidegrave'),
  }),
  tidegrave: buildCouncilEntry(REGION_COUNCIL_META[4]!, {
    requiredBadges: 8,
    recommendedLevel: 32,
    trials: [],
    rewards: placeholderRewards('tidegrave', 'tide', 350, 7, 'venomroot'),
  }),
  venomroot: buildCouncilEntry(REGION_COUNCIL_META[5]!, {
    requiredBadges: 8,
    recommendedLevel: 36,
    trials: [],
    rewards: placeholderRewards('venomroot', 'venom', 400, 8, 'spiritveil'),
  }),
  spiritveil: buildCouncilEntry(REGION_COUNCIL_META[6]!, {
    requiredBadges: 8,
    recommendedLevel: 40,
    trials: [],
    rewards: placeholderRewards('spiritveil', 'spirit', 450, 9, 'apex-spire'),
  }),
  'apex-spire': buildCouncilEntry(REGION_COUNCIL_META[7]!, {
    requiredBadges: 8,
    recommendedLevel: 45,
    trials: [],
    rewards: placeholderRewards('apex-spire', 'apex', 500, 10),
  }),
}

export const COUNCIL_NODE_ID_PREFIX = 'monolith-council-'

export function getCouncilNodeId(regionId: string): string {
  return `${COUNCIL_NODE_ID_PREFIX}${regionId}`
}

export function getCouncilForRegion(regionId: string): RegionCouncil | undefined {
  return MONOLITH_COUNCILS[regionId]
}

export function getAllRegionCouncils(): RegionCouncil[] {
  return REGION_COUNCIL_META.map((meta) => MONOLITH_COUNCILS[meta.regionId]!).filter(
    Boolean,
  )
}

/** Resolve council for a region id, using live region name when no static entry exists. */
export function resolveRegionCouncil(regionId: string): RegionCouncil | undefined {
  const existing = getCouncilForRegion(regionId)
  if (existing) return existing
  try {
    const region = getRegion(regionId)
    return {
      regionId,
      regionName: region.name,
      officialName: buildOfficialCouncilName(region.name),
      localName: `The ${region.name.split(' ')[0]} Council`,
      councilId: `${regionId}-council`,
      requiredBadges: 8,
      recommendedLevel: region.recommendedLevel + 10,
      trials: [],
      rewards: placeholderRewards(regionId, regionId.split('-')[0] ?? 'monolith', 200, 3),
    }
  } catch {
    return undefined
  }
}

export function toRegionCouncilSaveEntry(
  council: RegionCouncil,
  unlocked: boolean,
  completed: boolean,
): RegionCouncilSaveEntry {
  return {
    regionId: council.regionId,
    regionName: council.regionName,
    officialName: council.officialName,
    localName: council.localName,
    unlocked,
    completed,
  }
}

export function mergeRegionCouncilProgress(
  council: RegionCouncil,
  unlocked: boolean,
  completed: boolean,
): RegionCouncilProgress {
  return { ...council, unlocked, completed }
}

export function isCouncilNodeId(nodeId: string): boolean {
  return nodeId.startsWith(COUNCIL_NODE_ID_PREFIX)
}

export function regionIdFromCouncilNodeId(nodeId: string): string | null {
  if (!isCouncilNodeId(nodeId)) return null
  return nodeId.slice(COUNCIL_NODE_ID_PREFIX.length)
}

/** Region 1 elemental theme for specialist trial copy */
export const VERDANT_ELEMENTAL_TYPES: ElementType[] = ['Fire', 'Grass', 'Electric']
