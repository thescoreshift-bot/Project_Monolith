import { getAbility, registerRuntimeAbility } from '../data/abilities'
import type { AbilityDefinition, AbilityEffect } from '../data/abilityTypes'
import {
  getAbilityRole,
  type AbilityRole,
  type MasteryPathTag,
} from '../data/abilityMasteryPerks'
import type { AbilityTransformation } from '../data/abilityTransformations'

function pathSuffix(path: MasteryPathTag): string {
  return path
}

function rank5Name(baseName: string, role: AbilityRole): string {
  switch (role) {
    case 'damage':
      return `${baseName} II`
    case 'buff':
      return `Empowered ${baseName}`
    case 'debuff':
      return `Crushing ${baseName}`
    case 'status':
      return `Lingering ${baseName}`
    case 'healing':
    case 'support':
      return `Greater ${baseName}`
    default:
      return `Awakened ${baseName}`
  }
}

function rank10Name(baseName: string, role: AbilityRole): string {
  switch (role) {
    case 'damage':
      return `Apex ${baseName}`
    case 'buff':
      return `Perfected ${baseName}`
    case 'debuff':
      return `Ruinous ${baseName}`
    case 'status':
      return `Eternal ${baseName}`
    case 'healing':
    case 'support':
      return `Radiant ${baseName}`
    default:
      return `Monolith ${baseName}`
  }
}

function scaledPower(base: AbilityDefinition, rank: 5 | 10, path: MasteryPathTag): number {
  if (base.power <= 0) return 0
  let mult = rank === 5 ? 1.25 : 1.55
  if (path === 'damage') mult += rank === 5 ? 0.1 : 0.15
  if (path === 'status') mult -= rank === 5 ? 0.05 : 0.08
  return Math.max(1, Math.round(base.power * mult))
}

function buildFallbackAbility(
  id: string,
  name: string,
  base: AbilityDefinition,
  rank: 5 | 10,
  path: MasteryPathTag,
): AbilityDefinition {
  const power = scaledPower(base, rank, path)
  const effects = base.effects?.map((e: AbilityEffect) => {
    if (e.type === 'applyStatus' && rank === 10) {
      return { ...e, chance: Math.min(100, e.chance + 12) }
    }
    if (e.type === 'statDebuff' || e.type === 'statBuff') {
      const extra = path === 'utility' || path === 'status' ? 1 : 0
      return { ...e, stages: e.stages + (rank === 10 ? extra + 1 : extra) }
    }
    if (e.type === 'heal') {
      return { ...e, percent: Math.min(0.75, e.percent + (rank === 5 ? 0.05 : 0.1)) }
    }
    return e
  })

  return {
    id,
    name,
    type: base.type,
    category: base.category,
    target: base.target,
    power,
    accuracy: Math.min(100, base.accuracy + (rank === 5 ? 3 : 5)),
    description: `${name} — ${rank === 5 ? 'evolved' : 'master'} form of ${base.name}.`,
    effects,
  }
}

export function buildFallbackTransformation(
  fromAbilityId: string,
  requiredRank: 5 | 10,
  path: MasteryPathTag,
): AbilityTransformation {
  const base = getAbility(fromAbilityId)
  const role = getAbilityRole(base)
  const newId = `${fromAbilityId}-r${requiredRank}-${pathSuffix(path)}-fb`
  const newName =
    requiredRank === 5 ? rank5Name(base.name, role) : rank10Name(base.name, role)
  const ability = buildFallbackAbility(newId, newName, base, requiredRank, path)
  registerRuntimeAbility(ability)

  const pathLabel =
    path === 'damage'
      ? 'focused power'
      : path === 'status'
        ? 'status mastery'
        : path === 'utility'
          ? 'support mastery'
          : 'balanced hybrid'

  return {
    id: `${newId}-transform`,
    fromAbilityId,
    requiredRank,
    pathTag: path,
    newAbilityId: newId,
    newName,
    description: `${base.name} evolved along the ${pathLabel} path into ${newName}.`,
  }
}
