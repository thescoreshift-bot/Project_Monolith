import { useState } from 'react'
import type { ElementType } from '../data/starters'

export type CreaturePortraitSize = 'sm' | 'md' | 'lg' | 'combat'

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
}: CreaturePortraitProps) {
  const [failed, setFailed] = useState(false)
  const typeClass = type.toLowerCase()
  const src = !unseen && portraitUrl && !failed ? portraitUrl : null
  const silhouetteSrc = silhouetteUrl && !failed ? silhouetteUrl : null

  return (
    <div
      className={`creature-portrait creature-portrait--${size} creature-portrait--${typeClass}${unseen ? ' creature-portrait--unseen' : ''}${dimmed ? ' creature-portrait--dimmed' : ''}${idle && !unseen && !dimmed && src ? ' creature-portrait--idle' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden={alt === ''}
    >
      {src ? (
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
