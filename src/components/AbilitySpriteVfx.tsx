import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getDefaultFrameDurationMs,
  type AbilityVfxDef,
  type VfxFrame,
} from '../data/abilityVfx'
import {
  applyBlackKeyToImageData,
  getFixedViewportLayout,
  getVfxFrameDestRectCentered,
  getVfxFrameDestRectRegistered,
  getVfxStageLayout,
  loadVfxSheet,
  scaleVfxFrameToImage,
} from '../utils/vfxSheetImage'

type AbilitySpriteVfxProps = {
  def: AbilityVfxDef
  playKey: number
  onComplete?: () => void
}

const BLACK_KEY_THRESHOLD = 38

function resolveStage(def: AbilityVfxDef) {
  if (def.fixedViewport) {
    return getFixedViewportLayout(
      def.frames,
      def.fixedViewport.width,
      def.fixedViewport.height,
    )
  }
  return getVfxStageLayout(def.frames, def.maxDisplayWidth ?? 280)
}

function paintVfxFrame(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  frame: VfxFrame,
  def: AbilityVfxDef,
  anchorFrame: VfxFrame,
  scale: number,
  stageW: number,
  stageH: number,
): void {
  if (canvas.width !== stageW || canvas.height !== stageH) {
    canvas.width = stageW
    canvas.height = stageH
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const crop = scaleVfxFrameToImage(frame, img, def.sheetWidth, def.sheetHeight)
  const anchorCrop = scaleVfxFrameToImage(
    anchorFrame,
    img,
    def.sheetWidth,
    def.sheetHeight,
  )

  const dest = def.centerFrames
    ? getVfxFrameDestRectCentered(crop, scale, stageW, stageH)
    : getVfxFrameDestRectRegistered(
        crop,
        anchorCrop,
        scale,
        stageW,
        stageH,
      )

  ctx.clearRect(0, 0, stageW, stageH)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, stageW, stageH)
  ctx.clip()
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.w,
    crop.h,
    dest.dx,
    dest.dy,
    dest.dw,
    dest.dh,
  )
  ctx.restore()

  if (!def.skipBlackKey) {
    const imageData = ctx.getImageData(0, 0, stageW, stageH)
    applyBlackKeyToImageData(imageData, BLACK_KEY_THRESHOLD)
    ctx.putImageData(imageData, 0, 0)
  }
}

export function AbilitySpriteVfx({
  def,
  playKey,
  onComplete,
}: AbilitySpriteVfxProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [sheetReady, setSheetReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [sheetSize, setSheetSize] = useState<{
    w: number
    h: number
  } | null>(null)

  const stage = useMemo(() => {
    if (def.fixedViewport && sheetSize) {
      const sx = sheetSize.w / def.sheetWidth
      const sy = sheetSize.h / def.sheetHeight
      const scaled = def.frames.map((f) => ({
        w: f.w * sx,
        h: f.h * sy,
      }))
      return getFixedViewportLayout(
        scaled,
        def.fixedViewport.width,
        def.fixedViewport.height,
      )
    }
    return resolveStage(def)
  }, [def, sheetSize])

  useEffect(() => {
    let cancelled = false
    setSheetReady(false)
    void loadVfxSheet(def.sheetUrl).then((img) => {
      if (cancelled) return
      imgRef.current = img
      setSheetSize({ w: img.naturalWidth, h: img.naturalHeight })
      setSheetReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [def.sheetUrl])

  useEffect(() => {
    setFrameIndex(0)
    let index = 0
    let cancelled = false
    const timers: number[] = []
    const defaultMs = getDefaultFrameDurationMs(def)

    const step = () => {
      if (cancelled) return
      const frame = def.frames[index]
      const delay = frame?.durationMs ?? defaultMs
      const timer = window.setTimeout(() => {
        if (cancelled) return
        index += 1
        if (index >= def.frames.length) {
          onComplete?.()
          return
        }
        setFrameIndex(index)
        step()
      }, delay)
      timers.push(timer)
    }

    step()
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [def, playKey, onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    const frame = def.frames[frameIndex]
    if (!canvas || !img || !frame || !sheetReady) return

    if (import.meta.env.DEV && def.id === 'splash-strike') {
      console.log('Splash Strike frame', {
        frameIndex,
        crop: frame,
      })
    }

    const anchor = def.frames[0]
    if (!anchor) return
    paintVfxFrame(
      canvas,
      img,
      frame,
      def,
      anchor,
      stage.scale,
      stage.stageW,
      stage.stageH,
    )
  }, [def, frameIndex, stage, sheetReady])

  if (!def.frames[frameIndex]) return null

  const debugClass =
    import.meta.env.DEV && def.id === 'splash-strike'
      ? ' sprite-viewport--debug'
      : ''

  return (
    <div className="vfx-overlay" aria-hidden>
      <div
        className={`sprite-viewport sprite-viewport--vfx${debugClass}`}
        style={{ width: stage.stageW, height: stage.stageH }}
      >
        <canvas
          ref={canvasRef}
          className="ability-sprite-vfx__canvas"
          width={stage.stageW}
          height={stage.stageH}
        />
      </div>
    </div>
  )
}
