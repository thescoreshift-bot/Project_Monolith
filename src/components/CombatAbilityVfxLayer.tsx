import { useMemo } from 'react'
import { getAbilityVfxDef } from '../data/abilityVfx'
import { AbilitySpriteVfx } from './AbilitySpriteVfx'

type CombatAbilityVfxLayerProps = {
  vfxId: string | null
  playKey: number
  onComplete?: () => void
}

/** Overlays a sprite-sheet ability VFX on the enemy (Pokémon-style). */
export function CombatAbilityVfxLayer({
  vfxId,
  playKey,
  onComplete,
}: CombatAbilityVfxLayerProps) {
  const def = useMemo(
    () => (vfxId ? getAbilityVfxDef(vfxId) : null),
    [vfxId],
  )

  if (!def) return null

  return (
    <AbilitySpriteVfx
      def={def}
      playKey={playKey}
      onComplete={onComplete}
    />
  )
}
