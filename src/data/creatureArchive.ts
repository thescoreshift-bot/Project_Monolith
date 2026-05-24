import type { ElementType } from './starters'

export type ArchiveEvolutionStage = 0 | 1 | 2

export type CreatureArchiveEntry = {
  archiveNumber: number
  creatureId: string
  name: string
  familyId: string
  familyOrder: ArchiveEvolutionStage
  evolutionStage: ArchiveEvolutionStage
  type: ElementType
  description: string
  regionFound: string
  /** Enemy template ids that map to this base form */
  templateIds?: string[]
  /** Evolution form names (from evolution system) that map to this entry */
  evolutionNames?: string[]
}

function padNum(n: number): string {
  return String(n).padStart(3, '0')
}

function entry(
  archiveNumber: number,
  creatureId: string,
  name: string,
  familyId: string,
  familyOrder: ArchiveEvolutionStage,
  type: ElementType,
  description: string,
  regionFound: string,
  extras?: Pick<CreatureArchiveEntry, 'templateIds' | 'evolutionNames'>,
): CreatureArchiveEntry {
  return {
    archiveNumber,
    creatureId,
    name,
    familyId,
    familyOrder,
    evolutionStage: familyOrder,
    type,
    description,
    regionFound,
    ...extras,
  }
}

/** Numbered by evolution family: base → first evolution → final evolution, then next family. */
export const CREATURE_ARCHIVE_ENTRIES: CreatureArchiveEntry[] = [
  // Fire line — 001–003
  entry(1, 'cinderex', 'Cinderex', 'fire-line', 0, 'Fire', 'A burst-forward fire starter that strikes before foes recover.', 'verdant-circuit', {
    templateIds: ['fire'],
    evolutionNames: ['Cinderex'],
  }),
  entry(2, 'inferneon', 'Inferneon', 'fire-line', 1, 'Fire', 'First evolution of the fire line — a blazing striker.', 'verdant-circuit', {
    evolutionNames: [
      'Inferneon',
      'Embristle',
      'Blazetail',
      'Cindermuse',
      'Ashwyrd',
      'Elder Inferneon',
      'Elder Embristle',
      'Elder Blazetail',
      'Elder Cindermuse',
      'Elder Ashwyrd',
    ],
  }),
  entry(3, 'cyndralith', 'Cyndralith', 'fire-line', 2, 'Fire', 'Final fire-line form — apex ember predator.', 'verdant-circuit', {
    evolutionNames: [
      'Prime Inferneon',
      'Prime Embristle',
      'Prime Blazetail',
      'Prime Cindermuse',
      'Prime Ashwyrd',
    ],
  }),
  // Water line — 004–006
  entry(4, 'aqualis', 'Aqualis', 'water-line', 0, 'Water', 'A sustain-focused water starter that outlasts foes.', 'verdant-circuit', {
    templateIds: ['water'],
    evolutionNames: ['Aqualis'],
  }),
  entry(5, 'tidemaw', 'Tidemaw', 'water-line', 1, 'Water', 'First evolution of the water line — crushing tides.', 'verdant-circuit', {
    evolutionNames: [
      'Tidefang',
      'Reefort',
      'Rippledash',
      'Mistweft',
      'Abyssal Wisp',
      'Elder Tidefang',
      'Elder Reefort',
      'Elder Rippledash',
      'Elder Mistweft',
      'Elder Abyssal Wisp',
    ],
  }),
  entry(6, 'abyssodon', 'Abyssodon', 'water-line', 2, 'Water', 'Final water-line form — deep-sea leviathan.', 'verdant-circuit', {
    evolutionNames: [
      'Prime Tidefang',
      'Prime Reefort',
      'Prime Rippledash',
      'Prime Mistweft',
      'Prime Abyssal Wisp',
    ],
  }),
  // Grass line — 007–009
  entry(7, 'floramoss', 'Floramoss', 'grass-line', 0, 'Grass', 'A grass starter that grinds battles with recovery.', 'verdant-circuit', {
    templateIds: ['grass'],
    evolutionNames: ['Floramoss'],
  }),
  entry(8, 'thornbark', 'Thornbark', 'grass-line', 1, 'Grass', 'First evolution of the grass line — thorned guardian.', 'verdant-circuit', {
    evolutionNames: [
      'Thornvex',
      'Barkshield',
      'Zephyrvine',
      'Pollenglow',
      'Sporelynx',
      'Elder Thornvex',
      'Elder Barkshield',
      'Elder Zephyrvine',
      'Elder Pollenglow',
      'Elder Sporelynx',
    ],
  }),
  entry(9, 'wildroot', 'Wildroot', 'grass-line', 2, 'Grass', 'Final grass-line form — overgrown colossus.', 'verdant-circuit', {
    evolutionNames: [
      'Prime Thornvex',
      'Prime Barkshield',
      'Prime Zephyrvine',
      'Prime Pollenglow',
      'Prime Sporelynx',
    ],
  }),
  // Electric line — 010–012
  entry(10, 'voltara', 'Voltara', 'electric-line', 0, 'Electric', 'A speed-focused electric starter.', 'verdant-circuit', {
    templateIds: ['electric'],
    evolutionNames: ['Voltara'],
  }),
  entry(11, 'stormlynx', 'Stormlynx', 'electric-line', 1, 'Electric', 'First evolution of the electric line — storm hunter.', 'verdant-circuit', {
    evolutionNames: [
      'Stormbit',
      'Faradayne',
      'Voltkite',
      'Relaypulse',
      'Arcanomaly',
      'Elder Stormbit',
      'Elder Faradayne',
      'Elder Voltkite',
      'Elder Relaypulse',
      'Elder Arcanomaly',
    ],
  }),
  entry(12, 'voltaicron', 'Voltaicron', 'electric-line', 2, 'Electric', 'Final electric-line form — living thunder.', 'verdant-circuit', {
    evolutionNames: [
      'Prime Stormbit',
      'Prime Faradayne',
      'Prime Voltkite',
      'Prime Relaypulse',
      'Prime Arcanomaly',
    ],
  }),
  // Ground line — 013–015
  entry(13, 'terradon', 'Terradon', 'ground-line', 0, 'Ground', 'A tanky ground starter that absorbs hits.', 'verdant-circuit', {
    templateIds: ['ground'],
    evolutionNames: ['Terradon'],
  }),
  entry(14, 'bastionox', 'Bastionox', 'ground-line', 1, 'Ground', 'First evolution of the ground line — stone fortress.', 'verdant-circuit', {
    evolutionNames: [
      'Quakehorn',
      'Bastionox',
      'Dustrunner',
      'Terracalm',
      'Lithowarp',
      'Elder Quakehorn',
      'Elder Bastionox',
      'Elder Dustrunner',
      'Elder Terracalm',
      'Elder Lithowarp',
    ],
  }),
  entry(15, 'lithowarp', 'Lithowarp', 'ground-line', 2, 'Ground', 'Final ground-line form — monolith-backed titan.', 'verdant-circuit', {
    evolutionNames: [
      'Prime Quakehorn',
      'Prime Bastionox',
      'Prime Dustrunner',
      'Prime Terracalm',
      'Prime Lithowarp',
    ],
  }),
  // Bristlebug line — 016–018
  entry(16, 'bristlebug', 'Bristlebug', 'bristlebug-line', 0, 'Grass', 'A bristly bug found on early routes.', 'verdant-circuit', {
    templateIds: ['bristlebug', 'alpha-bristlebug'],
  }),
  entry(17, 'needlethorn', 'Needlethorn', 'bristlebug-line', 1, 'Grass', 'Mid-form bristlebug evolution (undiscovered until seen).', 'verdant-circuit', {
    evolutionNames: ['Needlethorn', 'Sporegleam', 'Elder Needlethorn', 'Elder Sporegleam'],
  }),
  entry(18, 'barbjaw', 'Barbjaw', 'bristlebug-line', 2, 'Grass', 'Final bristlebug-line form (undiscovered until seen).', 'verdant-circuit', {
    evolutionNames: ['Barbjaw', 'Elder Barbjaw', 'Prime Barbjaw', 'Prime Needlethorn', 'Prime Sporegleam'],
  }),
  // Ashling line — 019–021
  entry(19, 'ashling', 'Ashling', 'ashling-line', 0, 'Fire', 'A small ember creature on fire routes.', 'verdant-circuit', {
    templateIds: ['ashling', 'alpha-ashling'],
  }),
  entry(20, 'kindling', 'Kindling', 'ashling-line', 1, 'Fire', 'Mid-form ashling evolution.', 'verdant-circuit', {
    evolutionNames: ['Kindling', 'Cinderveil', 'Elder Kindling', 'Elder Cinderveil'],
  }),
  entry(21, 'ashmaw', 'Ashmaw', 'ashling-line', 2, 'Fire', 'Final ashling-line form.', 'verdant-circuit', {
    evolutionNames: ['Ashmaw', 'Elder Ashmaw', 'Prime Ashmaw', 'Prime Kindling', 'Prime Cinderveil'],
  }),
  // Pebblemaw line — 022–024
  entry(22, 'pebblemaw', 'Pebblemaw', 'pebblemaw-line', 0, 'Ground', 'A rocky creature with a crushing shoulder.', 'verdant-circuit', {
    templateIds: ['pebblemaw', 'alpha-pebblemaw'],
  }),
  entry(23, 'rockjaw', 'Rockjaw', 'pebblemaw-line', 1, 'Ground', 'Mid-form pebblemaw evolution.', 'verdant-circuit', {
    evolutionNames: ['Rockjaw', 'Crystalcrag', 'Elder Rockjaw', 'Elder Crystalcrag'],
  }),
  entry(24, 'monolithback', 'Monolithback', 'pebblemaw-line', 2, 'Ground', 'Final pebblemaw-line form.', 'verdant-circuit', {
    evolutionNames: ['Monolithback', 'Elder Monolithback', 'Prime Monolithback', 'Prime Rockjaw', 'Prime Crystalcrag'],
  }),
  // Driftwisp line — 025–027
  entry(25, 'driftwisp', 'Driftwisp', 'driftwisp-line', 0, 'Water', 'A drifting water spirit on coastal routes.', 'verdant-circuit', {
    templateIds: ['driftwisp'],
  }),
  entry(26, 'mistral', 'Mistral', 'driftwisp-line', 1, 'Water', 'Mid-form driftwisp evolution.', 'verdant-circuit', {
    evolutionNames: ['Mistral', 'Elder Mistral'],
  }),
  entry(27, 'abysswisp', 'Abysswisp', 'driftwisp-line', 2, 'Water', 'Final driftwisp-line form.', 'verdant-circuit', {
    evolutionNames: [
      'Abysswisp',
      'Reefwisp',
      'Elder Abysswisp',
      'Elder Reefwisp',
      'Prime Abysswisp',
      'Prime Mistral',
    ],
  }),
  // Voltimp line — 028–030
  entry(28, 'voltimp', 'Voltimp', 'voltimp-line', 0, 'Electric', 'A tiny imp crackling with static.', 'verdant-circuit', {
    templateIds: ['voltimp', 'elite-scout'],
  }),
  entry(29, 'sparkimp', 'Sparkimp', 'voltimp-line', 1, 'Electric', 'Mid-form voltimp evolution.', 'verdant-circuit', {
    evolutionNames: ['Sparkimp', 'Arcglyph', 'Elder Sparkimp', 'Elder Arcglyph'],
  }),
  entry(30, 'voltaic-imp', 'Voltaic Imp', 'voltimp-line', 2, 'Electric', 'Final voltimp-line form.', 'verdant-circuit', {
    evolutionNames: [
      'Voltaic Imp',
      'Elder Voltaic Imp',
      'Prime Voltaic Imp',
      'Prime Sparkimp',
      'Prime Arcglyph',
    ],
  }),
]

export const CREATURE_ARCHIVE_BY_ID = Object.fromEntries(
  CREATURE_ARCHIVE_ENTRIES.map((e) => [e.creatureId, e]),
) as Record<string, CreatureArchiveEntry>

export const CREATURE_ARCHIVE_BY_NUMBER = Object.fromEntries(
  CREATURE_ARCHIVE_ENTRIES.map((e) => [e.archiveNumber, e]),
) as Record<number, CreatureArchiveEntry>

export function formatArchiveNumber(n: number): string {
  return `#${padNum(n)}`
}

export function getArchiveFamilyLine(familyId: string): CreatureArchiveEntry[] {
  return CREATURE_ARCHIVE_ENTRIES.filter((e) => e.familyId === familyId).sort(
    (a, b) => a.familyOrder - b.familyOrder,
  )
}

export function resolveArchiveEntryFromTemplate(templateId: string): CreatureArchiveEntry | undefined {
  const base = templateId.replace(/^alpha-/, '')
  return CREATURE_ARCHIVE_ENTRIES.find(
    (e) =>
      e.creatureId === base ||
      e.templateIds?.includes(templateId) ||
      e.templateIds?.includes(base),
  )
}

export function resolveArchiveEntryFromName(name: string): CreatureArchiveEntry | undefined {
  const exact = CREATURE_ARCHIVE_ENTRIES.find((e) => e.name === name)
  if (exact) return exact
  return CREATURE_ARCHIVE_ENTRIES.find((e) =>
    e.evolutionNames?.some((n) => n === name),
  )
}

export function resolveArchiveEntryFromStarterId(starterId: string): CreatureArchiveEntry | undefined {
  const map: Record<string, string> = {
    fire: 'cinderex',
    water: 'aqualis',
    grass: 'floramoss',
    electric: 'voltara',
    ground: 'terradon',
  }
  const id = map[starterId]
  return id ? CREATURE_ARCHIVE_BY_ID[id] : undefined
}
