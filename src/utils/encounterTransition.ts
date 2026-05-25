import type { ElementType } from '../data/starters'
import type { EncounterKind } from '../data/enemies'
import type { Enemy } from '../data/enemies'
import { getEnemyCombatDisplay } from '../data/enemies'
import type { MapNode } from '../data/nodeMap'
import type { CombatContext } from './combatContext'
import { isFastEncounterEnabled } from './encounterSettings'

export type EncounterTransitionPhase =
  | 'start'
  | 'warning'
  | 'reveal'
  | 'dissolve'
  | 'enterCombat'

export type EncounterDisplayType =
  | 'normal'
  | 'elite'
  | 'alpha'
  | 'eventAlpha'
  | 'gymTrainer'
  | 'gymLeader'
  | 'boss'

export type EncounterAudioProfile = 'battleRandom' | 'eliteBoss'

export type EncounterTransitionView = {
  displayType: EncounterDisplayType
  message: string
  typeLabel: string
  enemyName: string
  enemyType: ElementType
  portraitUrl: string | null
  /** Gym battles: creature sent out after trainer intro. */
  sendsOutCreatureName: string | null
  useTrainerPortrait: boolean
  intensity: 'normal' | 'high' | 'boss'
  audioProfile: EncounterAudioProfile
  showFlash: boolean
  hidePortraitDetail: boolean
}

export type PendingCombatStart =
  | {
      mode: 'map'
      node: MapNode
      spawned: Enemy
      ctx: CombatContext
      encounterKind: EncounterKind
      battleLogLine: string
      discoveryTemplateId: string
      discoveryCreatureName: string
    }
  | {
      mode: 'eventAlpha'
      ctx: CombatContext
      spawned: Enemy
      battleLogLine: string
      discoveryTemplateId: string
      discoveryCreatureName: string
    }

export function resolveEncounterDisplayType(
  encounterKind: EncounterKind,
  ctx: CombatContext | null,
): EncounterDisplayType {
  if (encounterKind === 'alphaNest' && ctx?.source === 'event') {
    return 'eventAlpha'
  }
  if (encounterKind === 'alphaNest') return 'alpha'
  if (encounterKind === 'elite') return 'elite'
  if (encounterKind === 'gymTrainer') return 'gymTrainer'
  if (encounterKind === 'gymLeader') return 'gymLeader'
  if (encounterKind === 'boss') return 'boss'
  return 'normal'
}

const MESSAGES: Record<EncounterDisplayType, string> = {
  normal: 'Wild Signal Detected',
  elite: 'Elite Presence Detected',
  alpha: 'ALPHA NEST DISTURBED',
  eventAlpha: 'An Alpha answers the disturbance...',
  gymTrainer: 'Trainer Challenge',
  gymLeader: 'Badge Trial Initiated',
  boss: 'MONOLITH GUARDIAN AWAKENS',
}

const TYPE_LABELS: Record<EncounterDisplayType, string> = {
  normal: 'Signal Contact',
  elite: 'Elite Signature',
  alpha: 'Alpha Nest',
  eventAlpha: 'Disturbance Response',
  gymTrainer: 'Gym Trainer',
  gymLeader: 'Badge Trial',
  boss: 'Monolith Guardian',
}

export function buildEncounterTransitionView(
  encounterKind: EncounterKind,
  enemy: Enemy,
  ctx: CombatContext | null,
): EncounterTransitionView {
  const displayType = resolveEncounterDisplayType(encounterKind, ctx)
  const display = getEnemyCombatDisplay(enemy)
  const isGym =
    displayType === 'gymTrainer' || displayType === 'gymLeader'
  const useTrainerPortrait = isGym && Boolean(display.trainerPortraitUrl)

  const intensity: EncounterTransitionView['intensity'] =
    displayType === 'boss'
      ? 'boss'
      : displayType === 'normal'
        ? 'normal'
        : 'high'

  const audioProfile: EncounterAudioProfile =
    displayType === 'normal' || displayType === 'gymTrainer'
      ? 'battleRandom'
      : 'eliteBoss'

  return {
    displayType,
    message: MESSAGES[displayType],
    typeLabel: TYPE_LABELS[displayType],
    enemyName: useTrainerPortrait
      ? (display.trainerName ?? enemy.name)
      : enemy.name,
    enemyType: useTrainerPortrait ? display.creatureType : enemy.type,
    portraitUrl: useTrainerPortrait
      ? display.trainerPortraitUrl
      : display.creaturePortraitUrl,
    sendsOutCreatureName: useTrainerPortrait ? display.creatureName : null,
    useTrainerPortrait,
    intensity,
    audioProfile,
    showFlash:
      displayType === 'alpha' ||
      displayType === 'eventAlpha' ||
      displayType === 'boss',
    hidePortraitDetail:
      displayType === 'boss' || displayType === 'eventAlpha',
  }
}

export type PhaseSchedule = { phase: EncounterTransitionPhase; atMs: number }[]

export function getEncounterPhaseSchedule(
  displayType: EncounterDisplayType,
): PhaseSchedule {
  const fast = isFastEncounterEnabled()
  if (fast) {
    return [
      { phase: 'start', atMs: 0 },
      { phase: 'warning', atMs: 80 },
      { phase: 'reveal', atMs: 180 },
      { phase: 'dissolve', atMs: 320 },
      { phase: 'enterCombat', atMs: 420 },
    ]
  }

  switch (displayType) {
    case 'boss':
      return [
        { phase: 'start', atMs: 0 },
        { phase: 'warning', atMs: 280 },
        { phase: 'reveal', atMs: 900 },
        { phase: 'dissolve', atMs: 1600 },
        { phase: 'enterCombat', atMs: 2000 },
      ]
    case 'elite':
    case 'alpha':
    case 'eventAlpha':
    case 'gymLeader':
      return [
        { phase: 'start', atMs: 0 },
        { phase: 'warning', atMs: 220 },
        { phase: 'reveal', atMs: 650 },
        { phase: 'dissolve', atMs: 1150 },
        { phase: 'enterCombat', atMs: 1500 },
      ]
    case 'gymTrainer':
      return [
        { phase: 'start', atMs: 0 },
        { phase: 'warning', atMs: 200 },
        { phase: 'reveal', atMs: 580 },
        { phase: 'dissolve', atMs: 950 },
        { phase: 'enterCombat', atMs: 1200 },
      ]
    default:
      return [
        { phase: 'start', atMs: 0 },
        { phase: 'warning', atMs: 180 },
        { phase: 'reveal', atMs: 520 },
        { phase: 'dissolve', atMs: 880 },
        { phase: 'enterCombat', atMs: 1100 },
      ]
  }
}

export function getEncounterTotalDurationMs(
  displayType: EncounterDisplayType,
): number {
  const schedule = getEncounterPhaseSchedule(displayType)
  return schedule[schedule.length - 1]?.atMs ?? 1100
}
