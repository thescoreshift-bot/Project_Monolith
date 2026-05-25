import { useEffect, useState } from 'react'
import {
  getDefaultFrameDurationMs,
  type AbilityVfxDef,
} from '../data/abilityVfx'

type AbilitySpriteVfxProps = {
  def: AbilityVfxDef
  /** Change to restart the animation. */
  playKey: number
  onComplete?: () => void
}

export function AbilitySpriteVfx({
  def,
  playKey,
  onComplete,
}: AbilitySpriteVfxProps) {
  const [frameIndex, setFrameIndex] = useState(0)

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

  const frame = def.frames[frameIndex]
  if (!frame) return null

  const maxW = def.maxDisplayWidth ?? 280
  const scale = maxW / frame.w
  const displayW = Math.round(frame.w * scale)
  const displayH = Math.round(frame.h * scale)
  const sheetW = Math.round(def.sheetWidth * scale)
  const sheetH = Math.round(def.sheetHeight * scale)
  const posX = Math.round(-frame.x * scale)
  const posY = Math.round(-frame.y * scale)

  return (
    <div
      className="ability-sprite-vfx"
      style={{ mixBlendMode: def.blendMode ?? 'screen' }}
      aria-hidden
    >
      <div
        className="ability-sprite-vfx__frame"
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: `url(${def.sheetUrl})`,
          backgroundPosition: `${posX}px ${posY}px`,
          backgroundSize: `${sheetW}px ${sheetH}px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  )
}
