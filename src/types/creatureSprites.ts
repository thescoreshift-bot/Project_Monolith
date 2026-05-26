/** Standard fields for one horizontal sprite-strip animation. */
export type SpriteAnimDef = {
  sheetUrl: string
  frameWidth: number
  frameHeight: number
  frameCount: number
  fps: number
}

export type CreatureSpriteSheetSet = {
  portraitUrl?: string | null
  idleSheetUrl?: string
  idleFrameWidth?: number
  idleFrameHeight?: number
  idleFrameCount?: number
  idleFps?: number
  attackSheetUrl?: string
  attackFrameWidth?: number
  attackFrameHeight?: number
  attackFrameCount?: number
  attackFps?: number
  hurtSheetUrl?: string
  hurtFrameWidth?: number
  hurtFrameHeight?: number
  hurtFrameCount?: number
  hurtFps?: number
}

export type VfxSpriteAnimDef = {
  vfxSheetUrl: string
  vfxFrameWidth: number
  vfxFrameHeight: number
  vfxFrameCount: number
  vfxFps: number
}

export function spriteAnimFromFields(
  sheetUrl: string | undefined,
  frameWidth: number | undefined,
  frameHeight: number | undefined,
  frameCount: number | undefined,
  fps: number | undefined,
): SpriteAnimDef | null {
  if (!sheetUrl || !frameCount || frameCount <= 1) return null
  return {
    sheetUrl,
    frameWidth: frameWidth ?? 0,
    frameHeight: frameHeight ?? 0,
    frameCount,
    fps: fps ?? 8,
  }
}

export function pickCombatSpriteAnim(
  sheets: CreatureSpriteSheetSet | null | undefined,
  anim: 'idle' | 'attack' | 'hurt',
): SpriteAnimDef | null {
  if (!sheets) return null
  if (anim === 'attack') {
    return spriteAnimFromFields(
      sheets.attackSheetUrl,
      sheets.attackFrameWidth,
      sheets.attackFrameHeight,
      sheets.attackFrameCount,
      sheets.attackFps,
    )
  }
  if (anim === 'hurt') {
    return spriteAnimFromFields(
      sheets.hurtSheetUrl,
      sheets.hurtFrameWidth,
      sheets.hurtFrameHeight,
      sheets.hurtFrameCount,
      sheets.hurtFps,
    )
  }
  return spriteAnimFromFields(
    sheets.idleSheetUrl,
    sheets.idleFrameWidth,
    sheets.idleFrameHeight,
    sheets.idleFrameCount,
    sheets.idleFps,
  )
}
