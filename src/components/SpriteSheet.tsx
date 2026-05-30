import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  loadSpriteSheetImage,
  resolveStripFrameDimensions,
} from '../utils/spriteSheetUtils'
import { publicAsset } from '../utils/publicAsset'

export type SpriteFrameCrop = {
  x: number
  y: number
  w: number
  h: number
  durationMs?: number
}

export type SpriteSheetProps = {
  src: string
  frameCount: number
  frameWidth?: number
  frameHeight?: number
  fps?: number
  loop?: boolean
  playing?: boolean
  className?: string
  /** Display size of the crop viewport (defaults from frame dimensions × scale). */
  displayWidth?: number
  displayHeight?: number
  /** Per-frame crops for non-uniform sheets. */
  frameCrops?: SpriteFrameCrop[]
  sheetWidth?: number
  sheetHeight?: number
  playKey?: number
  onComplete?: () => void
  onLoadFailed?: () => void
  blendMode?: CSSProperties['mixBlendMode']
}

function clampFrame(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.max(0, Math.min(index, count - 1))
}

const DEV_DEBUG_OUTLINE = import.meta.env.DEV

/**
 * Fixed viewport; only background-position changes between frames.
 * The outer box never moves — one frame visible at a time.
 */
export function SpriteSheet({
  src,
  frameCount,
  frameWidth: frameWidthProp,
  frameHeight: frameHeightProp,
  fps = 12,
  loop = true,
  playing = true,
  className = '',
  displayWidth,
  displayHeight,
  frameCrops,
  sheetWidth: sheetWidthProp,
  sheetHeight: sheetHeightProp,
  playKey = 0,
  onComplete,
  onLoadFailed,
  blendMode,
}: SpriteSheetProps) {
  const resolvedSrc = publicAsset(src)
  const cropMode = Boolean(frameCrops && frameCrops.length > 0)
  const effectiveCount = cropMode ? frameCrops!.length : frameCount

  const [currentFrame, setCurrentFrame] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setCurrentFrame(0)
    completedRef.current = false
    setLoaded(false)
    setFailed(false)

    let cancelled = false
    void loadSpriteSheetImage(resolvedSrc)
      .then((img) => {
        if (cancelled) return
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
        setLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setFailed(true)
        onLoadFailed?.()
      })

    return () => {
      cancelled = true
    }
  }, [resolvedSrc, playKey, onLoadFailed])

  const stripLayout = useMemo(() => {
    if (!loaded || cropMode) return null
    const dims = resolveStripFrameDimensions(
      naturalSize.w,
      naturalSize.h,
      effectiveCount,
      frameWidthProp,
      frameHeightProp,
    )
    if (!dims) return null
    const scale = (displayWidth ?? dims.frameWidth) / dims.frameWidth
    const viewportW = displayWidth ?? Math.round(dims.frameWidth * scale)
    const viewportH = displayHeight ?? Math.round(dims.frameHeight * scale)
    return {
      ...dims,
      scale,
      viewportW,
      viewportH,
      sheetWidthScaled: Math.round(dims.sheetWidth * scale),
      sheetHeightScaled: viewportH,
    }
  }, [
    loaded,
    cropMode,
    naturalSize.w,
    naturalSize.h,
    effectiveCount,
    frameWidthProp,
    frameHeightProp,
    displayWidth,
    displayHeight,
  ])

  const cropLayout = useMemo(() => {
    if (!cropMode || !loaded) return null
    const crops = frameCrops!
    const maxW = Math.max(...crops.map((f) => f.w))
    const maxH = Math.max(...crops.map((f) => f.h))
    const sheetW = sheetWidthProp ?? naturalSize.w
    const sheetH = sheetHeightProp ?? naturalSize.h
    const scale = (displayWidth ?? maxW) / maxW
    return {
      crops,
      maxW,
      maxH,
      sheetW,
      sheetH,
      scale,
      viewportW: displayWidth ?? Math.round(maxW * scale),
      viewportH: displayHeight ?? Math.round(maxH * scale),
      sheetWidthScaled: Math.round(sheetW * scale),
      sheetHeightScaled: Math.round(sheetH * scale),
    }
  }, [
    cropMode,
    loaded,
    frameCrops,
    sheetWidthProp,
    sheetHeightProp,
    naturalSize.w,
    naturalSize.h,
    displayWidth,
    displayHeight,
  ])

  const defaultMs = Math.round(1000 / Math.max(1, fps))

  const advanceFrame = useCallback(() => {
    setCurrentFrame((prev) => {
      const next = prev + 1
      if (next >= effectiveCount) {
        if (loop) return 0
        if (!completedRef.current) {
          completedRef.current = true
          onCompleteRef.current?.()
        }
        return effectiveCount - 1
      }
      return next
    })
  }, [effectiveCount, loop])

  useEffect(() => {
    if (!playing || !loaded || effectiveCount <= 1) return

    const frame = clampFrame(currentFrame, effectiveCount)
    if (!loop && frame >= effectiveCount - 1) {
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
      return
    }

    const delay =
      cropMode && frameCrops?.[frame]?.durationMs != null
        ? frameCrops[frame]!.durationMs!
        : defaultMs

    const timer = window.setTimeout(advanceFrame, delay)
    return () => window.clearTimeout(timer)
  }, [
    playing,
    loaded,
    effectiveCount,
    currentFrame,
    advanceFrame,
    cropMode,
    frameCrops,
    defaultMs,
    loop,
  ])

  const frameStyle = useMemo((): CSSProperties | null => {
    if (!loaded) return null
    const frameIndex = clampFrame(currentFrame, effectiveCount)

    if (cropMode && cropLayout) {
      const crop = cropLayout.crops[frameIndex]!
      const {
        scale,
        viewportW,
        viewportH,
        sheetWidthScaled,
        sheetHeightScaled,
      } = cropLayout
      return {
        width: viewportW,
        height: viewportH,
        backgroundImage: `url(${resolvedSrc})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheetWidthScaled}px ${sheetHeightScaled}px`,
        backgroundPosition: `${-Math.round(crop.x * scale)}px ${-Math.round(crop.y * scale)}px`,
        mixBlendMode: blendMode,
      }
    }

    if (stripLayout) {
      const {
        frameWidth,
        scale,
        viewportW,
        viewportH,
        sheetWidthScaled,
        sheetHeightScaled,
      } = stripLayout
      const offsetX = frameIndex * frameWidth * scale
      return {
        width: viewportW,
        height: viewportH,
        backgroundImage: `url(${resolvedSrc})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheetWidthScaled}px ${sheetHeightScaled}px`,
        backgroundPosition: `${-Math.round(offsetX)}px 0px`,
        mixBlendMode: blendMode,
      }
    }

    return null
  }, [
    loaded,
    currentFrame,
    effectiveCount,
    cropMode,
    cropLayout,
    stripLayout,
    src,
    blendMode,
  ])

  if (failed || !loaded || !frameStyle) return null

  const viewportW = cropLayout?.viewportW ?? stripLayout?.viewportW ?? 0
  const viewportH = cropLayout?.viewportH ?? stripLayout?.viewportH ?? 0

  return (
    <div
      className={`sprite-viewport${DEV_DEBUG_OUTLINE ? ' sprite-viewport--debug' : ''}${className ? ` ${className}` : ''}`}
      style={{ width: viewportW, height: viewportH }}
      aria-hidden
    >
      <div className="sprite-sheet-frame" style={frameStyle} />
    </div>
  )
}
