import { getPerk } from '../data/perks'
import { getPerkEvolutionScoreLabel } from '../utils/progression'

type CreaturePerksModalProps = {
  creatureName: string
  selectedPerks: string[]
  onClose: () => void
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatStatModifiers(perk: ReturnType<typeof getPerk>): string[] {
  if (!perk.statModifiers) return []
  const lines: string[] = []
  const m = perk.statModifiers
  if (m.atk) lines.push(`ATK ${m.atk > 0 ? '+' : ''}${m.atk}`)
  if (m.def) lines.push(`DEF ${m.def > 0 ? '+' : ''}${m.def}`)
  if (m.spAtk) lines.push(`SP.ATK ${m.spAtk > 0 ? '+' : ''}${m.spAtk}`)
  if (m.spDef) lines.push(`SP.DEF ${m.spDef > 0 ? '+' : ''}${m.spDef}`)
  if (m.spd) lines.push(`SPD ${m.spd > 0 ? '+' : ''}${m.spd}`)
  if (m.hp) lines.push(`HP ${m.hp > 0 ? '+' : ''}${m.hp}`)
  if (m.maxHp) lines.push(`Max HP ${m.maxHp > 0 ? '+' : ''}${m.maxHp}`)
  return lines
}

export function CreaturePerksModal({
  creatureName,
  selectedPerks,
  onClose,
}: CreaturePerksModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel creature-perks-modal">
        <header className="modal-panel__header">
          <h2>{creatureName} — Perks</h2>
          <button type="button" className="btn btn--small" onClick={onClose}>
            Close
          </button>
        </header>

        {selectedPerks.length === 0 ? (
          <p className="creature-perks-modal__empty">No perks selected yet.</p>
        ) : (
          <ul className="creature-perks-modal__list">
            {selectedPerks.map((perkId) => {
              const perk = getPerk(perkId)
              const statLines = formatStatModifiers(perk)
              return (
                <li key={perkId} className="creature-perks-modal__item">
                  <h3>
                    {perk.name}{' '}
                    <span className={`perk-card__rarity perk-card__rarity--${perk.rarity}`}>
                      {perk.rarity}
                    </span>
                  </h3>
                  <p className="creature-perks-modal__category">
                    {formatCategory(perk.category)} · Affects: this creature only
                  </p>
                  <p>{perk.description}</p>
                  {perk.effect && (
                    <p className="creature-perks-modal__effect">{perk.effect}</p>
                  )}
                  {statLines.length > 0 && (
                    <p className="creature-perks-modal__stats">
                      Stats: {statLines.join(', ')}
                    </p>
                  )}
                  <p className="creature-perks-modal__evo">
                    Evolution impact: {getPerkEvolutionScoreLabel(perk)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
