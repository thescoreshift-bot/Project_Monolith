import type { ReactNode } from 'react'
import type { ItemRarity } from '../data/items'
import type { ShopItemOwnership } from '../utils/inventorySystem'
import { ShopItemOwnedBadge } from './ShopItemOwnedBadge'

export type ShopItemCardProps = {
  name: string
  rarity: ItemRarity | string
  cost: number
  costLabel?: string
  description: string
  category?: string
  ownership: ShopItemOwnership
  variant?: 'consumable' | 'gear'
  stats?: string[]
  children: ReactNode
}

/** Shared shop offer card (Drift Market, Relic Vault, and future shop UIs). */
export function ShopItemCard({
  name,
  rarity,
  cost,
  costLabel = 'coins',
  description,
  category,
  ownership,
  variant = 'consumable',
  stats,
  children,
}: ShopItemCardProps) {
  const hasOwned =
    ownership.ownedQuantity > 0 || ownership.equippedLabel != null

  return (
    <article
      className={`shop-item${variant === 'gear' ? ' shop-item--gear' : ''}${hasOwned ? ' shop-item--owned' : ''}`}
    >
      <header className="shop-item__header">
        <h3 className="shop-item__name">{name}</h3>
        <span className={`shop-item__rarity shop-item__rarity--${rarity}`}>
          {rarity}
        </span>
        <span className="shop-item__cost">
          {costLabel !== 'coins'
            ? costLabel
            : cost > 0
              ? `${cost} ${costLabel}`
              : 'Price unavailable'}
        </span>
      </header>
      <ShopItemOwnedBadge ownership={ownership} />
      <p className="shop-item__desc">{description}</p>
      {category ? <p className="shop-item__category">{category}</p> : null}
      {stats && stats.length > 0 ? (
        <ul className="shop-item__stats">
          {stats.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </article>
  )
}
