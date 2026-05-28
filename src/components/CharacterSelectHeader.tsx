import { useState } from 'react'
import { CHARACTER_SELECT_ASSETS } from '../data/characterSelectAssets'

export function CharacterSelectHeader({ subtitle }: { subtitle?: string }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <header className="screen-header character-select-header">
      {imageFailed ? (
        <h1 className="screen-header__title">Character Select</h1>
      ) : (
        <img
          className="character-select-header__art"
          src={CHARACTER_SELECT_ASSETS.title}
          alt="Character Select"
          decoding="async"
          draggable={false}
          onError={() => setImageFailed(true)}
        />
      )}
      {subtitle ? (
        <p className="screen-header__subtitle">{subtitle}</p>
      ) : null}
    </header>
  )
}
