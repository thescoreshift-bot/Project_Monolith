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
  /** Optional frame-by-frame PNG sequence (uses one image per frame). */
  frameUrls?: string[]
  sheetWidth: number
  sheetHeight: number
  frames: VfxFrame[]
  fps?: number
  /** Max width of the effect on the battlefield (px). */
  maxDisplayWidth?: number
  blendMode?: 'screen' | 'plus-lighter'
  /** Fixed canvas size; each frame is centered inside (irregular crops). */
  fixedViewport?: { width: number; height: number }
  /** PNG with alpha — skip JPEG black-key pass. */
  skipBlackKey?: boolean
  /** Center each frame in the viewport (both axes). */
  centerFrames?: boolean
}

const WATER_WAVE_SHEET = '/assets/vfx/water-wave.jpg'
const WATER_RIPPLE_SHEET = '/assets/vfx/water-ripple.jpg'
const WATER_TORNADO_SHEET = '/assets/vfx/water-tornado.jpg'
const WATER_FRAME_SEQUENCE = [
  '/assets/vfx/water-frame-1.png',
  '/assets/vfx/water-frame-2.png',
  '/assets/vfx/water-frame-3.png',
  '/assets/vfx/water-frame-4.png',
  '/assets/vfx/water-frame-5.png',
  '/assets/vfx/water-frame-6.png',
  '/assets/vfx/water-frame-7.png',
  '/assets/vfx/water-frame-8.png',
  '/assets/vfx/water-frame-9.png',
] as const
const WATER_JET_SEQUENCE = [
  '/assets/vfx/water-jet1.png',
  '/assets/vfx/water-jet2.png',
  '/assets/vfx/water-jet3.png',
  '/assets/vfx/water-jet4.png',
  '/assets/vfx/water-jet5.png',
  '/assets/vfx/water-jet6.png',
] as const
const CHAIN_SPARK_SEQUENCE = [
  '/assets/vfx/chain-spark1.png',
  '/assets/vfx/chain-spark2.png',
  '/assets/vfx/chain-spark3.png',
  '/assets/vfx/chain-spark4.png',
  '/assets/vfx/chain-spark5.png',
  '/assets/vfx/chain-spark6.png',
  '/assets/vfx/chain-spark7.png',
  '/assets/vfx/chain-spark8.png',
] as const
const ELECTRIC_ORB_SEQUENCE = [
  '/assets/vfx/electric-orb1.png',
  '/assets/vfx/electric-orb2.png',
  '/assets/vfx/electric-orb3.png',
  '/assets/vfx/electric-orb4.png',
  '/assets/vfx/electric-orb5.png',
  '/assets/vfx/electric-orb6.png',
  '/assets/vfx/electric-orb7.png',
] as const

const SHEET_WAVE = { sheetWidth: 1295, sheetHeight: 291 } as const
const SHEET_RIPPLE = { sheetWidth: 1283, sheetHeight: 191 } as const
const SHEET_TORNADO = { sheetWidth: 1274, sheetHeight: 292 } as const


/** 1295×291 — rising curl → S-wave whip + crown splash (5 frames; f4 is one composite). */
const WW = {
  f0: { x: 10, y: 10, w: 129, h: 168 },
  f1: { x: 173, y: 30, w: 128, h: 244 },
  f2: { x: 340, y: 22, w: 156, h: 263 },
  f3: { x: 521, y: 8, w: 181, h: 283 },
  /** Arc + impact in one crop; split near x≈1050 manually if needed later. */
  f4: { x: 726, y: 24, w: 555, h: 262, durationMs: 140 },
} as const satisfies Record<string, VfxFrame>

/** 1283×191 — ripple → column splash → vortex block (manual sub-crops). */
const WR = {
  f0: { x: 15, y: 77, w: 103, h: 84 },
  f1: { x: 156, y: 27, w: 149, h: 144 },
  /** Connected vortex strip (y=1–187); cuts at density troughs per asset notes. */
  v1: { x: 314, y: 1, w: 176, h: 186 },
  v2: { x: 490, y: 1, w: 190, h: 186 },
  v3: { x: 680, y: 1, w: 190, h: 186 },
  v4: { x: 870, y: 1, w: 205, h: 186 },
  v5: { x: 1075, y: 1, w: 205, h: 186, durationMs: 100 },
} as const satisfies Record<string, VfxFrame>

/** 1274×292 — swirl → water tornado → dissipate (7 frames, clean gaps). */
const WT = {
  f0: { x: 41, y: 67, w: 101, h: 121 },
  f1: { x: 167, y: 72, w: 122, h: 182 },
  f2: { x: 323, y: 40, w: 151, h: 249 },
  f3: { x: 500, y: 25, w: 172, h: 263 },
  f4: { x: 694, y: 10, w: 191, h: 282, durationMs: 125 },
  f5: { x: 903, y: 14, w: 179, h: 274 },
  f6: { x: 1097, y: 16, w: 177, h: 271, durationMs: 95 },
} as const satisfies Record<string, VfxFrame>

const RIPPLE_OPEN: VfxFrame[] = [WR.f0, WR.f1]
const RIPPLE_FULL: VfxFrame[] = [
  WR.f0,
  WR.f1,
  WR.v1,
  WR.v2,
  WR.v3,
  WR.v4,
  WR.v5,
]
const RIPPLE_RAIN: VfxFrame[] = [WR.f0, WR.f1, WR.v5]

const TORNADO_ALL: VfxFrame[] = [
  WT.f0,
  WT.f1,
  WT.f2,
  WT.f3,
  WT.f4,
  WT.f5,
  WT.f6,
]
const TORNADO_BUILD: VfxFrame[] = [WT.f0, WT.f1, WT.f2, WT.f3, WT.f4, WT.f5]
const TORNADO_FORM: VfxFrame[] = [WT.f0, WT.f1, WT.f2, WT.f3]

const WAVE_ALL: VfxFrame[] = [WW.f0, WW.f1, WW.f2, WW.f3, WW.f4]
const WAVE_WHIP: VfxFrame[] = [WW.f2, WW.f3, WW.f4]

/**
 * 1024×512 PNG (black matte between frames — keyed at render time).
 * Crops scaled from 1774×887 reference art coordinates.
 */
export const SPLASH_STRIKE_FRAMES: VfxFrame[] = [
  { x: 38, y: 214, w: 63, h: 62 },
  { x: 144, y: 191, w: 132, h: 128 },
  { x: 304, y: 203, w: 172, h: 115 },
  { x: 499, y: 159, w: 169, h: 162 },
  { x: 684, y: 212, w: 183, h: 108 },
]

const SPLASH_STRIKE_VFX: AbilityVfxDef = {
  id: 'splash-strike',
  sheetUrl: '/assets/vfx/splash-strike.png',
  sheetWidth: 1024,
  sheetHeight: 512,
  frames: SPLASH_STRIKE_FRAMES,
  fps: 11,
  fixedViewport: { width: 384, height: 384 },
  centerFrames: true,
}

function abilityVfx(
  abilityId: string,
  sheetUrl: string,
  sheetSize: { sheetWidth: number; sheetHeight: number },
  frames: VfxFrame[],
  opts?: { maxDisplayWidth?: number; fps?: number },
): AbilityVfxDef {
  return {
    id: abilityId,
    sheetUrl,
    ...sheetSize,
    frames,
    fps: opts?.fps ?? 11,
    maxDisplayWidth: opts?.maxDisplayWidth ?? 300,
    blendMode: 'screen',
  }
}

function waveVfx(
  abilityId: string,
  frames: VfxFrame[],
  opts?: { maxDisplayWidth?: number; fps?: number },
): AbilityVfxDef {
  return abilityVfx(abilityId, WATER_WAVE_SHEET, SHEET_WAVE, frames, opts)
}

function rippleVfx(
  abilityId: string,
  frames: VfxFrame[],
  opts?: { maxDisplayWidth?: number; fps?: number },
): AbilityVfxDef {
  return abilityVfx(abilityId, WATER_RIPPLE_SHEET, SHEET_RIPPLE, frames, opts)
}

function tornadoVfx(
  abilityId: string,
  frames: VfxFrame[],
  opts?: { maxDisplayWidth?: number; fps?: number },
): AbilityVfxDef {
  return abilityVfx(abilityId, WATER_TORNADO_SHEET, SHEET_TORNADO, frames, opts)
}

function sequenceVfx(
  abilityId: string,
  frameUrls: readonly string[],
  opts?: { maxDisplayWidth?: number; fps?: number },
): AbilityVfxDef {
  return {
    id: abilityId,
    sheetUrl: frameUrls[0] ?? '',
    frameUrls: [...frameUrls],
    sheetWidth: 1,
    sheetHeight: 1,
    frames: frameUrls.map(() => ({ x: 0, y: 0, w: 1, h: 1 })),
    fps: opts?.fps ?? 12,
    maxDisplayWidth: opts?.maxDisplayWidth ?? 300,
    blendMode: 'screen',
    skipBlackKey: true,
    centerFrames: true,
  }
}

/** Legacy bubble sheet (kept as fallback reference). */
const BUBBLE_HEX_LEGACY_VFX: AbilityVfxDef = {
  id: 'bubble-hex-legacy',
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

import { deepPublicAssets } from '../utils/publicAsset'

const ABILITY_VFX_BY_ID_RAW: Record<string, AbilityVfxDef> = {
  'bubble-hex-legacy': BUBBLE_HEX_LEGACY_VFX,

  // —— Water: jet strip (charge orb → launch → splash) ——
  'bubble-hex': sequenceVfx('bubble-hex', WATER_JET_SEQUENCE, {
    maxDisplayWidth: 340,
    fps: 14,
  }),
  /** Jet sequence test frames 1..6, rendered on enemy target layer. */
  'pressure-wave': sequenceVfx('pressure-wave', WATER_JET_SEQUENCE, {
    maxDisplayWidth: 360,
    fps: 14,
  }),

  // —— Water: wave strip (curl → whip arc + impact) ——
  'splash-strike': SPLASH_STRIKE_VFX,
  'water-fang': waveVfx('water-fang', WAVE_WHIP, { maxDisplayWidth: 360 }),
  'drench-guard': rippleVfx('drench-guard', RIPPLE_RAIN, { maxDisplayWidth: 300, fps: 10 }),
  'tide-lance': waveVfx('tide-lance', WAVE_ALL, { maxDisplayWidth: 400 }),
  'riptide-hex': waveVfx('riptide-hex', WAVE_ALL, { maxDisplayWidth: 390 }),
  'riptide-crash': waveVfx('riptide-crash', WAVE_ALL, { maxDisplayWidth: 420 }),

  // —— Water: ripple / vortex strip ——
  'gentle-cry': rippleVfx('gentle-cry', RIPPLE_OPEN, { maxDisplayWidth: 260, fps: 10 }),
  'mist-veil': tornadoVfx('mist-veil', TORNADO_FORM, { maxDisplayWidth: 340, fps: 10 }),
  'binding-mist': tornadoVfx('binding-mist', TORNADO_BUILD, { maxDisplayWidth: 380, fps: 9 }),
  'soothing-rain': rippleVfx('soothing-rain', RIPPLE_RAIN, { maxDisplayWidth: 300, fps: 10 }),
  'healing-rain': rippleVfx('healing-rain', [...RIPPLE_OPEN, WR.v5], {
    maxDisplayWidth: 320,
    fps: 10,
  }),

  // —— Water: hydro sheet (wide beam → tidal smash) ——
  'abyssal-tide-spear': sequenceVfx('abyssal-tide-spear', WATER_FRAME_SEQUENCE, {
    maxDisplayWidth: 380,
    fps: 12,
  }),
  'eternal-binding-mist': tornadoVfx('eternal-binding-mist', TORNADO_ALL, {
    maxDisplayWidth: 420,
    fps: 9,
  }),
  'oceanic-healing-rain': rippleVfx('oceanic-healing-rain', RIPPLE_FULL, {
    maxDisplayWidth: 400,
    fps: 10,
  }),
  'maelstrom-hex': tornadoVfx('maelstrom-hex', TORNADO_ALL, { maxDisplayWidth: 430 }),

  // —— Electric sequence tests ——
  'chain-spark': sequenceVfx('chain-spark', CHAIN_SPARK_SEQUENCE, {
    maxDisplayWidth: 360,
    fps: 12,
  }),
  'bolt-lance': sequenceVfx('bolt-lance', ELECTRIC_ORB_SEQUENCE, {
    maxDisplayWidth: 340,
    fps: 12,
  }),
}

export const ABILITY_VFX_BY_ID: Record<string, AbilityVfxDef> =
  deepPublicAssets(ABILITY_VFX_BY_ID_RAW)

/** Mastery fallback abilities: `{base}-r{5|10}-{path}-fb` (e.g. Water Fang II). */
export function masteryFallbackBaseAbilityId(abilityId: string): string | null {
  const match = abilityId.match(
    /^(.+)-r(?:5|10)-(?:damage|status|utility|hybrid)-fb$/,
  )
  return match?.[1] ?? null
}

function resolveRegisteredVfxId(abilityId: string): string | null {
  if (ABILITY_VFX_BY_ID[abilityId]) return abilityId
  const base = masteryFallbackBaseAbilityId(abilityId)
  if (base && ABILITY_VFX_BY_ID[base]) return base
  return null
}

export function getAbilityVfxDef(abilityId: string): AbilityVfxDef | null {
  const id = resolveRegisteredVfxId(abilityId)
  return id ? ABILITY_VFX_BY_ID[id]! : null
}

/** Resolve base or transformed id to a VFX definition if registered. */
export function resolveAbilityVfxId(
  abilityId: string,
  resolvedAbilityId: string,
): string | null {
  return (
    resolveRegisteredVfxId(resolvedAbilityId) ??
    resolveRegisteredVfxId(abilityId)
  )
}

export function getDefaultFrameDurationMs(def: AbilityVfxDef): number {
  return Math.round(1000 / (def.fps ?? 12))
}
