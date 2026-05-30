import type { MapNode } from './nodeMap'
import { GYM_NPC_TEMPLATES } from './gymRoster'
import { getGymForBadge } from './regionGyms'
import { deepPublicAssets } from '../utils/publicAsset'

/** Full-body trainer / gym leader portraits keyed by enemy template id. */
const VERDANT_GYM_PORTRAITS: Record<string, string> = {
  'gym-trainer-nova': '/assets/trainers/verdant-circuit/gym-trainer-nova.png',
  'gym-trainer-verdant-tide': '/assets/trainers/verdant-circuit/gym-trainer-verdant-tide.png',
  'gym-trainer-verdant-bloom': '/assets/trainers/verdant-circuit/gym-trainer-verdant-bloom.png',
  'gym-trainer-verdant-volt': '/assets/trainers/verdant-circuit/gym-trainer-verdant-volt.png',
  'gym-trainer-verdant-stone': '/assets/trainers/verdant-circuit/gym-trainer-verdant-stone.png',
  'gym-trainer-verdant-venom': '/assets/trainers/verdant-circuit/gym-trainer-verdant-venom.png',
  'gym-trainer-verdant-spirit': '/assets/trainers/verdant-circuit/gym-trainer-verdant-spirit.png',
  'gym-trainer-verdant-apex': '/assets/trainers/verdant-circuit/gym-trainer-verdant-apex.png',
  'gym-leader-ember': '/assets/trainers/verdant-circuit/gym-leader-ember.png',
  'gym-leader-tide': '/assets/trainers/verdant-circuit/gym-leader-tide.png',
  'gym-leader-bloom': '/assets/trainers/verdant-circuit/gym-leader-bloom.png',
  'gym-leader-volt': '/assets/trainers/verdant-circuit/gym-leader-volt.png',
  'gym-leader-stone': '/assets/trainers/verdant-circuit/gym-leader-stone.png',
  'gym-leader-venom': '/assets/trainers/verdant-circuit/gym-leader-venom.png',
  'gym-leader-spirit': '/assets/trainers/verdant-circuit/gym-leader-spirit.png',
  'gym-leader-apex': '/assets/trainers/verdant-circuit/gym-leader-apex.png',
}

const GYM_TRAINER_PORTRAITS: Record<string, string> = deepPublicAssets({
  ...VERDANT_GYM_PORTRAITS,
})

export function getGymTrainerPortraitUrl(enemyTemplateId: string): string | null {
  return GYM_TRAINER_PORTRAITS[enemyTemplateId] ?? null
}

export function hasGymTrainerPortrait(enemyTemplateId: string): boolean {
  return enemyTemplateId in GYM_TRAINER_PORTRAITS
}

function getGymTemplateIdForMapNode(
  node: Pick<MapNode, 'type' | 'badgeId'>,
): string | null {
  if (node.type !== 'gymTrainer' && node.type !== 'gymLeader') return null
  if (!node.badgeId) return null
  const pair = getGymForBadge(node.badgeId)
  if (!pair) return null
  return node.type === 'gymLeader' ? pair.leaderId : pair.trainerId
}

/** Map node portrait for a specific gym trainer or leader on that badge row. */
export function getGymPortraitUrlForMapNode(
  node: Pick<MapNode, 'type' | 'badgeId'>,
): string | null {
  const templateId = getGymTemplateIdForMapNode(node)
  if (!templateId) return null
  return getGymTrainerPortraitUrl(templateId)
}

/** Display name from roster data (matches uploaded portrait filenames). */
export function getGymNpcNameForMapNode(
  node: Pick<MapNode, 'type' | 'badgeId'>,
): string | null {
  const templateId = getGymTemplateIdForMapNode(node)
  if (!templateId) return null
  return GYM_NPC_TEMPLATES[templateId]?.name ?? null
}
