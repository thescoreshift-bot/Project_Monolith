import type { ShopItemOwnership } from '../utils/inventorySystem'

type ShopItemOwnedBadgeProps = {
  ownership: ShopItemOwnership
}

/** Compact owned count + optional equipped line for shop item cards. */
export function ShopItemOwnedBadge({ ownership }: ShopItemOwnedBadgeProps) {
  const { ownedQuantity, equippedLabel } = ownership
  const hasOwned = ownedQuantity > 0

  return (
    <div className="shop-item__owned" aria-label={`Owned: ${ownedQuantity}`}>
      <span
        className={`shop-item__owned-qty${hasOwned ? ' shop-item__owned-qty--has' : ''}`}
      >
        Owned: {ownedQuantity}
      </span>
      {equippedLabel ? (
        <span className="shop-item__equipped">{equippedLabel}</span>
      ) : null}
    </div>
  )
}
