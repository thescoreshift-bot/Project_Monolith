import { applyBlackKeyToImageData } from './spriteSheetUtils'
import { loadSpriteSheetImage } from './spriteSheetUtils'

export { applyBlackKeyToImageData }
export const loadVfxSheet = loadSpriteSheetImage

/** Map frame rects from declared sheet size to loaded image pixels. */
export function scaleVfxFrameToImage(
  frame: { x: number; y: number; w: number; h: number },
  img: HTMLImageElement,
  sheetWidth: number,
  sheetHeight: number,
): { x: number; y: number; w: number; h: number } {
  const sx = img.naturalWidth / sheetWidth
  const sy = img.naturalHeight / sheetHeight
  return {
    x: Math.round(frame.x * sx),
    y: Math.round(frame.y * sy),
    w: Math.max(1, Math.round(frame.w * sx)),
    h: Math.max(1, Math.round(frame.h * sy)),
  }
}

export function getUniformVfxScale(
  frames: { w: number }[],
  maxDisplayWidth: number,
): number {
  const refW = Math.max(1, ...frames.map((f) => f.w))
  return maxDisplayWidth / refW
}

export type VfxStageLayout = {
  scale: number
  stageW: number
  stageH: number
}

/** Fixed stage (largest frame) so VFX stays anchored while only one crop is drawn per tick. */
export function getVfxStageLayout(
  frames: { w: number; h: number }[],
  maxDisplayWidth: number,
): VfxStageLayout {
  const maxW = Math.max(1, ...frames.map((f) => f.w))
  const maxH = Math.max(1, ...frames.map((f) => f.h))
  const scale = maxDisplayWidth / maxW
  return {
    scale,
    stageW: Math.max(1, Math.round(maxW * scale)),
    stageH: Math.max(1, Math.round(maxH * scale)),
  }
}

/** Scale all frames to fit inside a fixed viewport (largest frame defines scale). */
export function getFixedViewportLayout(
  frames: { w: number; h: number }[],
  viewportW: number,
  viewportH: number,
): VfxStageLayout {
  const maxW = Math.max(1, ...frames.map((f) => f.w))
  const maxH = Math.max(1, ...frames.map((f) => f.h))
  const scale = Math.min(viewportW / maxW, viewportH / maxH)
  return {
    scale,
    stageW: viewportW,
    stageH: viewportH,
  }
}

/** Center frame in viewport (both axes). */
export function getVfxFrameDestRectCentered(
  frame: { w: number; h: number },
  scale: number,
  stageW: number,
  stageH: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const dw = Math.max(1, Math.round(frame.w * scale))
  const dh = Math.max(1, Math.round(frame.h * scale))
  return {
    dx: Math.round((stageW - dw) / 2),
    dy: Math.round((stageH - dh) / 2),
    dw,
    dh,
  }
}

/** Center horizontally, bottom-align in fixed stage (VFX anchor on target). */
export function getVfxFrameDestRect(
  frame: { w: number; h: number },
  scale: number,
  stageW: number,
  stageH: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const dw = Math.max(1, Math.round(frame.w * scale))
  const dh = Math.max(1, Math.round(frame.h * scale))
  return {
    dx: Math.round((stageW - dw) / 2),
    dy: Math.round(stageH - dh),
    dw,
    dh,
  }
}

/**
 * Register every frame to the same sheet anchor (bottom-center of anchor frame)
 * so horizontal strip layouts do not slide across the battlefield.
 */
export function getVfxFrameDestRectRegistered(
  frame: { x: number; y: number; w: number; h: number },
  anchorFrame: { x: number; y: number; w: number; h: number },
  scale: number,
  stageW: number,
  stageH: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const anchorX = anchorFrame.x + anchorFrame.w / 2
  const anchorY = anchorFrame.y + anchorFrame.h
  const dw = Math.max(1, Math.round(frame.w * scale))
  const dh = Math.max(1, Math.round(frame.h * scale))
  return {
    dx: Math.round(stageW / 2 - (anchorX - frame.x) * scale),
    dy: Math.round(stageH - (anchorY - frame.y) * scale),
    dw,
    dh,
  }
}
