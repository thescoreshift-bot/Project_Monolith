import type { CreatureArchiveEntry } from './creatureArchive'
import type { EvolutionForm } from './evolutions'
import { ALL_EVOLUTION_FORMS, getEvolutionForStarter, getEvolutionFormById } from './evolutions'
import type { EvolutionBranchCategory } from './perks'
import {
  getEvolutionForRecruit,
  ALL_RECRUIT_EVOLUTION_FORMS,
  hasRecruitEvolutions,
} from './recruitEvolutions'
import {
  getRecruitPortraitUrl,
  normalizeRecruitTemplateId,
  resolveRecruitTemplateId,
} from './recruitPortraits'
import type { ElementType, Starter } from './starters'
import type { EvolutionHistoryEntry } from '../utils/progression'
import { deepPublicAssets } from '../utils/publicAsset'

const NPC_BRANCH_PRIORITY: EvolutionBranchCategory[] = [
  'offense',
  'defense',
  'utility',
  'speed',
  'evolution',
]

function defaultNpcEvolutionBranch(type: ElementType): EvolutionBranchCategory {
  switch (type) {
    case 'Fire':
      return 'offense'
    case 'Water':
      return 'utility'
    case 'Grass':
      return 'defense'
    case 'Electric':
      return 'speed'
    case 'Ground':
      return 'defense'
    default:
      return 'offense'
  }
}

export function npcEvolutionStageForLevel(level: number): number {
  if (level < 10) return 0
  if (level < 20) return 1
  if (level < 30) return 2
  return 3
}

function evolutionKeyForTemplate(templateId: string, type: ElementType): string {
  const base = normalizeRecruitTemplateId(templateId)
  if (hasRecruitEvolutions(base) || getRecruitPortraitUrl(base)) {
    return base
  }
  return type.toLowerCase()
}

function getFormForNpc(
  evolutionKey: string,
  type: ElementType,
  stage: number,
  branch: EvolutionBranchCategory,
): EvolutionForm | undefined {
  const recruitBase = normalizeRecruitTemplateId(evolutionKey)
  return (
    getEvolutionForRecruit(recruitBase, stage, branch) ??
    getEvolutionForStarter(type.toLowerCase(), stage, branch)
  )
}

function resolveNpcEvolutionForm(
  templateId: string,
  type: ElementType,
  stage: number,
): { form: EvolutionForm; portraitUrl: string | null } | null {
  const evolutionKey = evolutionKeyForTemplate(templateId, type)
  const preferred = defaultNpcEvolutionBranch(type)
  const branchOrder = [
    preferred,
    ...NPC_BRANCH_PRIORITY.filter((b) => b !== preferred),
  ]

  let fallbackForm: EvolutionForm | undefined
  for (const branch of branchOrder) {
    const form = getFormForNpc(evolutionKey, type, stage, branch)
    if (!form) continue
    const portraitUrl = getEvolutionPortraitUrl(evolutionKey, stage, branch)
    if (portraitUrl) {
      return { form, portraitUrl }
    }
    fallbackForm ??= form
  }

  if (fallbackForm) {
    return {
      form: fallbackForm,
      portraitUrl: getEvolutionPortraitUrl(
        evolutionKey,
        stage,
        fallbackForm.branchCategory,
      ),
    }
  }

  return null
}

/** Base or level-scaled NPC creature name + portrait (recruit line, then starter fallback). */
export function resolveNpcCreatureDisplay(
  templateId: string,
  type: ElementType,
  level: number,
  baseName: string,
): { name: string; portraitUrl: string | null } {
  const basePortrait =
    getRecruitPortraitUrl(templateId) ?? getStarterPortraitForType(type)

  const stage = npcEvolutionStageForLevel(level)
  if (stage === 0) {
    return { name: baseName, portraitUrl: basePortrait }
  }

  const evolved = resolveNpcEvolutionForm(templateId, type, stage)
  if (evolved) {
    return {
      name: evolved.form.name,
      portraitUrl: evolved.portraitUrl ?? basePortrait,
    }
  }

  return { name: baseName, portraitUrl: basePortrait }
}

export const STARTER_PORTRAIT_URLS: Record<string, string> = deepPublicAssets({
  fire: '/assets/creatures/starters/fire-base.png',
  water: '/assets/creatures/starters/water-base.png',
  grass: '/assets/creatures/starters/grass-base.png',
  electric: '/assets/creatures/starters/electric-base.png',
  ground: '/assets/creatures/starters/ground-base.png',
})

const STARTER_FAMILY_IDS = new Set([
  'fire-line',
  'water-line',
  'grass-line',
  'electric-line',
  'ground-line',
])

const FAMILY_TO_STARTER_ID: Record<string, string> = {
  'fire-line': 'fire',
  'water-line': 'water',
  'grass-line': 'grass',
  'electric-line': 'electric',
  'ground-line': 'ground',
}

export function getStarterPortraitUrl(starterId: string): string | null {
  return STARTER_PORTRAIT_URLS[starterId] ?? null
}

export function getStarterPortraitForType(type: ElementType): string | null {
  const map: Record<ElementType, string> = {
    Fire: STARTER_PORTRAIT_URLS.fire,
    Water: STARTER_PORTRAIT_URLS.water,
    Grass: STARTER_PORTRAIT_URLS.grass,
    Electric: STARTER_PORTRAIT_URLS.electric,
    Ground: STARTER_PORTRAIT_URLS.ground,
  }
  return map[type] ?? null
}

export function getEvolutionPortraitUrl(
  evolutionKey: string,
  stage: number,
  branchCategory: EvolutionBranchCategory,
): string | null {
  const form =
    getEvolutionForRecruit(evolutionKey, stage, branchCategory) ??
    getEvolutionForStarter(evolutionKey, stage, branchCategory)
  if (form?.portraitUrl) return form.portraitUrl

  if (stage > 1) {
    const stageOne =
      getEvolutionForRecruit(evolutionKey, 1, branchCategory) ??
      getEvolutionForStarter(evolutionKey, 1, branchCategory)
    if (stageOne?.portraitUrl) return stageOne.portraitUrl
  }

  if (hasRecruitEvolutions(evolutionKey) && branchCategory !== 'offense') {
    const offensePortrait = getEvolutionPortraitUrl(
      evolutionKey,
      stage,
      'offense',
    )
    if (offensePortrait) return offensePortrait
  }

  return null
}

export function getRecruitEvolutionPortraitUrl(
  templateId: string,
  stage: number,
  branchCategory: EvolutionBranchCategory,
): string | null {
  const base = normalizeRecruitTemplateId(templateId)
  return getEvolutionPortraitUrl(base, stage, branchCategory)
}

export function resolvePortraitUrl(
  portraitUrl?: string | null,
  starterId?: string | null,
): string | null {
  if (portraitUrl) return portraitUrl
  if (starterId) return getStarterPortraitUrl(starterId)
  return null
}

export function getPortraitForStarter(starter: Pick<Starter, 'id' | 'portraitUrl'>): string | null {
  return resolvePortraitUrl(starter.portraitUrl, starter.id)
}

export function getPortraitForStarterTypeId(starterTypeId: string | undefined): string | null {
  if (!starterTypeId) return null
  return getStarterPortraitUrl(starterTypeId)
}

export function getPortraitForRunCreature(creature: {
  starterTypeId?: string
  evolutionHistory?: EvolutionHistoryEntry[]
}): string | null {
  if (!creature.starterTypeId) return null

  const history = creature.evolutionHistory ?? []
  if (history.length > 0) {
    const latest = history[history.length - 1]!
    const formById = latest.evolutionId
      ? getEvolutionFormById(latest.evolutionId)
      : undefined
    if (formById?.portraitUrl) return formById.portraitUrl

    const evolutionPortrait = getEvolutionPortraitUrl(
      creature.starterTypeId,
      latest.stage,
      latest.branchCategory,
    )
    if (evolutionPortrait) return evolutionPortrait
  }

  return getStarterPortraitUrl(creature.starterTypeId)
}

export function getPortraitForCreature(creature: {
  starterTypeId?: string
  templateId?: string
  id?: string
  name?: string
  evolutionHistory?: EvolutionHistoryEntry[]
}): string | null {
  if (creature.starterTypeId) {
    return getPortraitForRunCreature(creature)
  }

  const templateId = creature.templateId ?? creature.id
  const recruitBase = resolveRecruitTemplateId({
    templateId,
    id: creature.id,
    name: creature.name,
  })
  const history = creature.evolutionHistory ?? []
  if (history.length > 0 && recruitBase) {
    const latest = history[history.length - 1]!
    const formById = latest.evolutionId
      ? getEvolutionFormById(latest.evolutionId)
      : undefined
    if (formById?.portraitUrl) return formById.portraitUrl

    const evolutionPortrait = getRecruitEvolutionPortraitUrl(
      recruitBase,
      latest.stage,
      latest.branchCategory,
    )
    if (evolutionPortrait) return evolutionPortrait
  }

  return getRecruitPortraitUrl(recruitBase ?? templateId)
}

export function getPortraitForEnemyId(enemyId: string): string | null {
  return getRecruitPortraitUrl(enemyId)
}

export function getPortraitForArchiveEntry(entry: CreatureArchiveEntry): string | null {
  const recruitPortrait = getRecruitPortraitUrl(entry.creatureId)
  if (recruitPortrait) return recruitPortrait

  for (const templateId of entry.templateIds ?? []) {
    const url = getRecruitPortraitUrl(templateId)
    if (url) return url
  }

  for (const form of ALL_RECRUIT_EVOLUTION_FORMS) {
    if (form.name === entry.name && form.portraitUrl) return form.portraitUrl
  }

  for (const name of entry.evolutionNames ?? []) {
    for (const form of ALL_RECRUIT_EVOLUTION_FORMS) {
      if (form.name === name && form.portraitUrl) return form.portraitUrl
    }
    for (const form of ALL_EVOLUTION_FORMS) {
      if (form.name === name && form.portraitUrl) return form.portraitUrl
    }
  }

  for (const form of ALL_EVOLUTION_FORMS) {
    if (form.name === entry.name && form.portraitUrl) return form.portraitUrl
  }

  if (!STARTER_FAMILY_IDS.has(entry.familyId)) return null
  const starterId = FAMILY_TO_STARTER_ID[entry.familyId]
  return starterId ? getStarterPortraitUrl(starterId) : null
}

export function getPortraitForEvolutionForm(form: {
  fromStarterType: string
  stage: number
  branchCategory: EvolutionBranchCategory
  portraitUrl?: string
}): string | null {
  if (form.portraitUrl) return form.portraitUrl
  return getEvolutionPortraitUrl(form.fromStarterType, form.stage, form.branchCategory)
}
