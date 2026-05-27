import { useState } from 'react'
import { MAIN_MENU_HEADER_SRC } from '../data/mainMenuAssets'

export function MainMenuHeader() {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageFailed) {
    return (
      <header className="title-screen__header main-menu-header main-menu-header--fallback">
        <h1 className="title-screen__title">PROJECT MONOLITH</h1>
        <p className="title-screen__subtitle">Creature Battler Roguelike</p>
      </header>
    )
  }

  return (
    <header
      className="title-screen__header main-menu-header"
      aria-label="Project Monolith"
    >
      <img
        className="main-menu-header-art"
        src={MAIN_MENU_HEADER_SRC}
        alt="Project Monolith"
        decoding="async"
        draggable={false}
        onError={() => setImageFailed(true)}
      />
    </header>
  )
}
