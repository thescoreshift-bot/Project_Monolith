import {
  formatBadgeDamageModifiers,
  formatBadgeStatModifiers,
  getBadge,
} from '../data/badges'

type BadgeDetailModalProps = {
  badgeId: string
  onClose: () => void
}

export function BadgeDetailModal({ badgeId, onClose }: BadgeDetailModalProps) {
  const badge = getBadge(badgeId)
  if (!badge) return null

  const statLines = formatBadgeStatModifiers(badge.statModifiers)
  const damageLines = formatBadgeDamageModifiers(
    badge.damageModifiers,
    badge.allDamageBonusPercent,
  )

  return (
    <div
      className="badge-modal-overlay"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <dialog
        className="badge-modal"
        open
        aria-labelledby="badge-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="badge-modal__header">
          <h2 id="badge-modal-title" className="badge-modal__title">
            {badge.name}
          </h2>
          <p className="badge-modal__region">
            Region {badge.region} · Gym {badge.gymNumber}
          </p>
          <button
            type="button"
            className="badge-modal__close btn btn--small"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="badge-modal__description">{badge.description}</p>

        {statLines.length > 0 && (
          <section className="badge-modal__section">
            <h3 className="panel-label">Stat modifiers</h3>
            <ul>
              {statLines.map((line) => (
                <li key={line}>{line} for all party creatures</li>
              ))}
            </ul>
          </section>
        )}

        {damageLines.length > 0 && (
          <section className="badge-modal__section">
            <h3 className="panel-label">Damage modifiers</h3>
            <ul>
              {damageLines.map((line) => (
                <li key={line}>{line} for all party creatures</li>
              ))}
            </ul>
          </section>
        )}

        {badge.postVictoryHeal ? (
          <section className="badge-modal__section">
            <h3 className="panel-label">Special effect</h3>
            <p>Heal {badge.postVictoryHeal} HP after each victory (whole party).</p>
          </section>
        ) : null}

        <section className="badge-modal__section">
          <h3 className="panel-label">Summary</h3>
          <p>{badge.specialEffectText}</p>
        </section>

        <section className="badge-modal__section">
          <h3 className="panel-label">Affects</h3>
          <p>{badge.affects}</p>
        </section>
      </dialog>
    </div>
  )
}
