import { useState } from 'react'

export type MainMenuButtonVariant =
  | 'primary'
  | 'primary-secondary'
  | 'default'
  | 'utility'

export type MainMenuButtonBadge = 'notification' | 'daily' | 'continue'

/** Per-button display lettering fallback (CSS in App.css). */
export type MainMenuLabelStyle =
  | 'daily-run'
  | 'play'
  | 'offline'
  | 'login'
  | 'register'
  | 'archive'
  | 'leaderboard'
  | 'friendly-battle'
  | 'feedback'
  | 'patch-notes'
  | 'settings'
  | 'account'
  | 'logout'

type MainMenuButtonProps = {
  label: string
  iconSrc?: string
  labelSrc?: string
  labelStyle?: MainMenuLabelStyle
  onClick: () => void
  disabled?: boolean
  title?: string
  variant?: MainMenuButtonVariant
  badge?: MainMenuButtonBadge
  badgeText?: string
}

export function MainMenuButton({
  label,
  iconSrc,
  labelSrc,
  labelStyle,
  onClick,
  disabled = false,
  title,
  variant = 'default',
  badge,
  badgeText,
}: MainMenuButtonProps) {
  const [iconFailed, setIconFailed] = useState(false)
  const [labelImgFailed, setLabelImgFailed] = useState(false)
  const showLabelImg = Boolean(labelSrc) && !labelImgFailed

  if (showLabelImg) {
    return (
      <button
        type="button"
        className={`main-menu-art-btn main-menu-art-btn--${variant}${disabled ? ' main-menu-art-btn--disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        title={title ?? label}
        aria-label={label}
      >
        <img
          className="main-menu-art-btn__img"
          src={labelSrc}
          alt=""
          draggable={false}
          onError={() => setLabelImgFailed(true)}
        />
        {badge ? (
          <span className={`main-menu-art-btn__badge main-menu-art-btn__badge--${badge}`}>
            {badgeText ??
              (badge === 'notification'
                ? '!'
                : badge === 'continue'
                  ? 'Resume'
                  : 'Daily')}
          </span>
        ) : null}
      </button>
    )
  }

  const showIcon = Boolean(iconSrc) && !iconFailed

  return (
    <button
      type="button"
      className={`main-menu-row main-menu-row--${variant}${disabled ? ' main-menu-row--disabled' : ''}${!showIcon ? ' main-menu-row--text-only' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
    >
      <span className="main-menu-row__rail" aria-hidden />
      {showIcon ? (
        <span className="main-menu-row__emblem" aria-hidden>
          <img
            className="main-menu-row__emblem-img"
            src={iconSrc}
            alt=""
            draggable={false}
            onError={() => setIconFailed(true)}
          />
        </span>
      ) : null}
      <span
        className={
          labelStyle
            ? `main-menu-row__label main-menu-row__label--${labelStyle}`
            : 'main-menu-row__label'
        }
      >
        {label}
      </span>
      {badge ? (
        <span className={`main-menu-row__badge main-menu-row__badge--${badge}`}>
          {badgeText ??
            (badge === 'notification'
              ? '!'
              : badge === 'continue'
                ? 'Resume'
                : 'Daily')}
        </span>
      ) : null}
      <span className="main-menu-row__chevron" aria-hidden>
        ›
      </span>
    </button>
  )
}
