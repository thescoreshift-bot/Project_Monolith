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
const DEFAULT_VFX_MAX_WIDTH = 280

function vfxScaleForViewport(): number {
  if (typeof window === 'undefined') return 1
  const w = window.innerWidth
  if (w <= 640) return 0.58
  if (w <= 900) return 0.72
  return 1
}

function useVfxDisplayScale(): number {
  const [scale, setScale] = useState(() => vfxScaleForViewport())

  useEffect(() => {
    const update = () => setScale(vfxScaleForViewport())
    update()
    window.addEventListener('resize', update)
    const mq640 = window.matchMedia('(max-width: 640px)')
    const mq900 = window.matchMedia('(max-width: 900px)')
    mq640.addEventListener('change', update)
    mq900.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      mq640.removeEventListener('change', update)
      mq900.removeEventListener('change', update)
    }
  }, [])

  return scale
}

function resolveStage(def: AbilityVfxDef, viewportScale: number) {
  if (def.fixedViewport) {
    return getFixedViewportLayout(
      def.frames,
      Math.max(1, Math.round(def.fixedViewport.width * viewportScale)),
      Math.max(1, Math.round(def.fixedViewport.height * viewportScale)),
    )
  }
  const baseMax = def.maxDisplayWidth ?? DEFAULT_VFX_MAX_WIDTH
  const maxW = Math.max(1, Math.round(baseMax * viewportScale))
  return getVfxStageLayout(def.frames, maxW)
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
  const viewportScale = useVfxDisplayScale()
  const [frameIndex, setFrameIndex] = useState(0)
  const [sheetReady, setSheetReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const seqImgsRef = useRef<HTMLImageElement[] | null>(null)

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
        Math.max(1, Math.round(def.fixedViewport.width * viewportScale)),
        Math.max(1, Math.round(def.fixedViewport.height * viewportScale)),
      )
    }
    return resolveStage(def, viewportScale)
  }, [def, sheetSize, viewportScale])

  useEffect(() => {
    let cancelled = false
    setSheetReady(false)
    if (def.frameUrls?.length) {
      void Promise.all(def.frameUrls.map((url) => loadVfxSheet(url))).then((imgs) => {
        if (cancelled) return
        seqImgsRef.current = imgs
        imgRef.current = null
        const first = imgs[0]
        setSheetSize(first ? { w: first.naturalWidth, h: first.naturalHeight } : null)
        setSheetReady(true)
      })
    } else {
      seqImgsRef.current = null
      void loadVfxSheet(def.sheetUrl).then((img) => {
        if (cancelled) return
        imgRef.current = img
        setSheetSize({ w: img.naturalWidth, h: img.naturalHeight })
        setSheetReady(true)
      })
    }
    return () => {
      cancelled = true
    }
  }, [def.sheetUrl, def.frameUrls])

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
    const frame = def.frames[frameIndex]
    if (!canvas || !frame || !sheetReady) return

    const seqImg = def.frameUrls?.length ? seqImgsRef.current?.[frameIndex] ?? null : null
    const img = seqImg ?? imgRef.current
    if (!img) return

    if (import.meta.env.DEV && def.id === 'splash-strike') {
      console.log('Splash Strike frame', {
        frameIndex,
        crop: frame,
      })
    }

    if (def.frameUrls?.length) {
      const stageW = stage.stageW
      const stageH = stage.stageH
      if (canvas.width !== stageW || canvas.height !== stageH) {
        canvas.width = stageW
        canvas.height = stageH
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, stageW, stageH)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, stageW, stageH)
      ctx.clip()
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, stageW, stageH)
      ctx.restore()
      return
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
