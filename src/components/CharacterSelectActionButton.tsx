import { useState } from 'react'

type CharacterSelectActionButtonProps = {
  label: string
  imageSrc: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  className?: string
}

export function CharacterSelectActionButton({
  label,
  imageSrc,
  onClick,
  disabled = false,
  primary = false,
  className = '',
}: CharacterSelectActionButtonProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button
      type="button"
      className={`character-select-action-btn${primary ? ' character-select-action-btn--primary' : ''}${disabled ? ' character-select-action-btn--disabled' : ''}${imageFailed ? ' character-select-action-btn--fallback' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {imageFailed ? (
        <span className="character-select-action-btn__fallback-text">{label}</span>
      ) : (
        <img
          className="character-select-action-btn__img"
          src={imageSrc}
          alt=""
          draggable={false}
          onError={() => setImageFailed(true)}
        />
      )}
    </button>
  )
}
