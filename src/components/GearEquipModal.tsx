import { getGearItem } from '../data/gearItems'
import { formatGearSummary } from '../utils/gearSystem'
import type { InventoryItem } from '../utils/inventorySystem'

type GearEquipModalProps = {
  creatureName: string
  gearEntries: InventoryItem[]
  onEquip: (instanceId: string) => void
  onClose: () => void
}

export function GearEquipModal({
  creatureName,
  gearEntries,
  onEquip,
  onClose,
}: GearEquipModalProps) {
  const items = gearEntries
    .map((entry) => ({ entry, gear: getGearItem(entry.itemId) }))
    .filter((x): x is { entry: InventoryItem; gear: NonNullable<ReturnType<typeof getGearItem>> } =>
      x.gear !== null,
    )

  return (
    <div className="gear-modal" role="dialog" aria-modal="true">
      <div className="gear-modal__dialog">
        <header className="screen-header">
          <h2 className="screen-header__title">Equip Gear</h2>
          <p className="screen-header__subtitle">
            Choose held gear for {creatureName}. Any creature can equip any gear.
          </p>
        </header>

        {items.length === 0 ? (
          <p className="gear-modal__empty">No gear in inventory. Buy from shops or find in battle.</p>
        ) : (
          <ul className="gear-modal__list">
            {items.map(({ entry, gear }) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="gear-modal__item"
                  onClick={() => onEquip(entry.id)}
                >
                  <span className={`gear-modal__rarity gear-modal__rarity--${gear.rarity}`}>
                    {gear.rarity}
                  </span>
                  <strong className="gear-modal__name">{gear.name}</strong>
                  <p className="gear-modal__desc">{gear.description}</p>
                  <ul className="gear-modal__stats">
                    {formatGearSummary(gear).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
