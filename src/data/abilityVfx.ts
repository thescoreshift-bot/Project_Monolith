export type VfxFrame = {
  x: number
  y: number
  w: number
  h: number
  /** Per-frame hold time (defaults from fps). */
  durationMs?: number
}

export type AbilityVfxDef = {
  id: string
  sheetUrl: string
  sheetWidth: number
  sheetHeight: number
  frames: VfxFrame[]
  fps?: number
  /** Max width of the effect on the battlefield (px). */
  maxDisplayWidth?: number
  blendMode?: 'screen' | 'plus-lighter'
}

/** Bubble Hex — 1024×1024 sheet, 8 frames (non-uniform layout). */
const BUBBLE_HEX_VFX: AbilityVfxDef = {
  id: 'bubble-hex',
  sheetUrl: '/assets/vfx/bubble-hex.jpg',
  sheetWidth: 1024,
  sheetHeight: 1024,
  fps: 12,
  maxDisplayWidth: 300,
  blendMode: 'screen',
  frames: [
    { x: 0, y: 0, w: 256, h: 256 },
    { x: 256, y: 0, w: 256, h: 256 },
    { x: 512, y: 0, w: 256, h: 256 },
    { x: 768, y: 0, w: 256, h: 256 },
    { x: 0, y: 256, w: 300, h: 394 },
    { x: 300, y: 256, w: 350, h: 394 },
    { x: 650, y: 256, w: 374, h: 394 },
    { x: 0, y: 650, w: 1024, h: 374, durationMs: 180 },
  ],
}

export const ABILITY_VFX_BY_ID: Record<string, AbilityVfxDef> = {
  'bubble-hex': BUBBLE_HEX_VFX,
}

export function getAbilityVfxDef(abilityId: string): AbilityVfxDef | null {
  return ABILITY_VFX_BY_ID[abilityId] ?? null
}

/** Resolve base or transformed id to a VFX definition if registered. */
export function resolveAbilityVfxId(
  abilityId: string,
  resolvedAbilityId: string,
): string | null {
  if (ABILITY_VFX_BY_ID[resolvedAbilityId]) return resolvedAbilityId
  if (ABILITY_VFX_BY_ID[abilityId]) return abilityId
  return null
}

export function getDefaultFrameDurationMs(def: AbilityVfxDef): number {
  return Math.round(1000 / (def.fps ?? 12))
}
