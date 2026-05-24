import type { AbilityDefinition } from '../data/abilityTypes'
import { ABILITIES, getRegisteredAbility } from '../data/abilities'

const INTERNAL_NAME_PATTERN =
  /(?:^|[-_])(?:r\d+|rank\d+|mastery|offense|damage|utility|hybrid|status|generated|bonus|path|fb)(?:$|[-_])/i

const INTERNAL_SUFFIX_PATTERN =
  /(?:-r\d+-(?:damage|status|utility|hybrid)(?:-fb)?|-(?:damage|status|utility|hybrid)-fb|-offense-rank\d+.*|-generated.*|_damage_bonus|_bonus|_path|_lv\d+.*)$/i

function titleCaseFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/** True when text looks like an internal id/slug rather than a player-facing name. */
export function looksLikeInternalAbilityName(value: string): boolean {
  if (!value.trim()) return true
  if (value.includes('_')) return true
  if (INTERNAL_NAME_PATTERN.test(value)) return true
  if (INTERNAL_SUFFIX_PATTERN.test(value)) return true
  const segments = value.split('-')
  if (
    value === value.toLowerCase() &&
    segments.length >= 4 &&
    !value.includes(' ')
  ) {
    return true
  }
  return false
}

/** Build a readable label from an ability id when no curated name exists. */
export function sanitizeAbilityIdToDisplayName(abilityId: string): string {
  const curated = ABILITIES[abilityId]
  if (curated?.name && !looksLikeInternalAbilityName(curated.name)) {
    return curated.name
  }

  let stem = abilityId.replace(INTERNAL_SUFFIX_PATTERN, '')
  stem = stem.replace(/-fb$/i, '')
  if (ABILITIES[stem]?.name) return ABILITIES[stem].name

  const readable = titleCaseFromSlug(stem)
  return readable || titleCaseFromSlug(abilityId)
}

export type AbilityNameSource = Pick<
  AbilityDefinition,
  'id' | 'name' | 'displayName'
>

/** Player-facing ability name — never returns raw internal ids when avoidable. */
export function getAbilityDisplayName(
  abilityOrId: string | AbilityNameSource,
): string {
  const ability =
    typeof abilityOrId === 'string'
      ? (getRegisteredAbility(abilityOrId) ?? {
          id: abilityOrId,
          name: abilityOrId,
        })
      : abilityOrId

  if (ability.displayName?.trim()) {
    return ability.displayName.trim()
  }

  const name = ability.name?.trim() ?? ''
  if (name && name !== ability.id && !looksLikeInternalAbilityName(name)) {
    return name
  }

  return sanitizeAbilityIdToDisplayName(ability.id)
}
