import { useEffect, useMemo, useState } from 'react'
import type { ElementType } from '../data/starters'
import {
  pickCombatSpriteAnim,
  type CreatureSpriteSheetSet,
} from '../types/creatureSprites'
import { SpriteSheet } from './SpriteSheet'

export type CreaturePortraitSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'combat'
  | 'combat-lg'
  | 'combat-party'
  | 'encounter'

export type CreatureCombatAnim = 'idle' | 'attack' | 'hurt'

type CreaturePortraitProps = {
  type: ElementType | string
  portraitUrl?: string | null
  silhouetteUrl?: string | null
  alt: string
  size?: CreaturePortraitSize
  unseen?: boolean
  dimmed?: boolean
  idle?: boolean
  className?: string
  /** Optional sprite strips; falls back to portraitUrl when missing or on load error. */
  spriteSheets?: CreatureSpriteSheetSet | null
  combatAnim?: CreatureCombatAnim
}

const COMBAT_DISPLAY_PX: Partial<Record<CreaturePortraitSize, number>> = {
  combat: 88,
  'combat-lg': 168,
  'combat-party': 104,
  encounter: 280,
}

export function CreaturePortrait({
  type,
  portraitUrl,
  silhouetteUrl,
  alt,
  size = 'md',
  unseen = false,
  dimmed = false,
  idle = true,
  className = '',
  spriteSheets = null,
  combatAnim = 'idle',
}: CreaturePortraitProps) {
  const [failed, setFailed] = useState(false)
  const [sheetFailed, setSheetFailed] = useState(false)
  const [animPlayKey, setAnimPlayKey] = useState(0)
  const typeClass = type.toLowerCase()

  useEffect(() => {
    if (combatAnim === 'attack' || combatAnim === 'hurt') {
      setAnimPlayKey((k) => k + 1)
    }
  }, [combatAnim])

  const anim = useMemo(() => {
    if (unseen || dimmed) return null
    const picked = pickCombatSpriteAnim(spriteSheets, combatAnim)
    if (picked) return picked
    if (combatAnim !== 'idle') {
      return pickCombatSpriteAnim(spriteSheets, 'idle')
    }
    return null
  }, [spriteSheets, combatAnim, unseen, dimmed])

  const displayPx = COMBAT_DISPLAY_PX[size]
  const useSprite =
    !failed && !sheetFailed && anim != null && anim.frameCount > 1

  const src = !unseen && portraitUrl && !failed ? portraitUrl : null
  const silhouetteSrc = silhouetteUrl && !failed ? silhouetteUrl : null

  const shellClass = [
    'creature-portrait',
    `creature-portrait--${size}`,
    `creature-portrait--${typeClass}`,
    unseen ? 'creature-portrait--unseen' : '',
    dimmed ? 'creature-portrait--dimmed' : '',
    useSprite ? ' creature-portrait--spritesheet' : '',
    idle && !unseen && !dimmed && src && !useSprite
      ? ' creature-portrait--idle'
      : '',
    className,
  ]
    .filter(Boolean)
    .join('')

  return (
    <div className={shellClass} aria-hidden={alt === ''}>
      {useSprite && anim ? (
        <SpriteSheet
          className="creature-portrait__spritesheet"
          src={anim.sheetUrl}
          frameCount={anim.frameCount}
          frameWidth={anim.frameWidth > 0 ? anim.frameWidth : undefined}
          frameHeight={anim.frameHeight > 0 ? anim.frameHeight : undefined}
          fps={anim.fps}
          loop={combatAnim === 'idle'}
          playing={!dimmed && !unseen && (combatAnim !== 'idle' || idle)}
          playKey={animPlayKey}
          displayWidth={displayPx}
          displayHeight={displayPx}
          onLoadFailed={() => setSheetFailed(true)}
        />
      ) : src ? (
        <img
          className="creature-portrait__img"
          src={src}
          alt={alt}
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : silhouetteSrc && !failed ? (
        <img
          className="creature-portrait__img creature-portrait__img--silhouette"
          src={silhouetteSrc}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="creature-portrait__placeholder" aria-hidden="true">
          <span className="creature-portrait__silhouette-icon" />
        </div>
      )}
    </div>
  )
}
