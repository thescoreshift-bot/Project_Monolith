import { useMemo } from 'react'
import { getGearItem } from '../data/gearItems'
import { getItemDefinition } from '../data/items'
import { formatGearSummary } from '../utils/gearSystem'
import {
  getShopItemOwnership,
  type TrainerInventory,
} from '../utils/inventorySystem'
import {
  formatPurchaseCostLabel,
  getGearPurchasePrice,
  getItemPurchasePrice,
  shopTypeToPurchaseSource,
} from '../utils/itemPurchasePrice'
import { isPremiumShopType, type PersistedShopInventory } from '../utils/shopGeneration'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { ShopItemCard } from './ShopItemCard'

type ShopScreenProps = {
  creature: RunCreature
  recruits: PartyCreature[]
  inventory: TrainerInventory
  shopInventory: PersistedShopInventory
  shopLog: string[]
  onBuyItem: (itemId: string) => void
  onBuyGear: (gearId: string) => void
  onOpenInventory?: () => void
  onLeave: () => void
}

export function ShopScreen({
  creature,
  recruits,
  inventory,
  shopInventory,
  shopLog,
  onBuyItem,
  onBuyGear,
  onOpenInventory,
  onLeave,
}: ShopScreenProps) {
  const isRelic = isPremiumShopType(shopInventory.shopType)
  const ownershipCtx = useMemo(
    () => ({ inventory, starter: creature, recruits }),
    [inventory, creature, recruits],
  )

  const gearItems = shopInventory.gearIds
    .map((id) => getGearItem(id))
    .filter((g): g is NonNullable<typeof g> => g !== null)

  const catalogItems = shopInventory.itemIds
    .map((id) => getItemDefinition(id))
    .filter((d): d is NonNullable<typeof d> => d !== null)

  const consumables = catalogItems.filter((d) => d.category === 'consumable')
  const materials = catalogItems.filter((d) => d.category === 'material')
  const otherItems = catalogItems.filter(
    (d) => d.category !== 'consumable' && d.category !== 'material',
  )

  const titleForType = (): { title: string; subtitle: string } => {
    switch (shopInventory.shopType) {
      case 'reliquary':
        return {
          title: 'Ash Reliquary',
          subtitle: 'Rare relic gear and monolith-touched finds — stock varies each visit.',
        }
      case 'curator':
      case 'monolithVendor':
        return {
          title: 'Monolith Curator',
          subtitle: 'Crafting materials and archive relics for the forge.',
        }
      case 'wanderingTrader':
        return {
          title: 'Wandering Trader',
          subtitle: 'Traveling supplies, tonics, and odd materials.',
        }
      case 'cache':
        return {
          title: 'Supply Cache',
          subtitle: 'Stashed consumables and practical gear.',
        }
      case 'alphaVendor':
        return {
          title: 'Alpha Vendor',
          subtitle: 'Alpha-hunt gear and claw materials.',
        }
      case 'driftMarket':
        return {
          title: 'Drift Market',
          subtitle: 'Rotating gear, supplies, and materials before the path closes.',
        }
      default:
        return {
          title: isRelic ? 'Relic Vault' : 'Drift Market',
          subtitle: isRelic
            ? 'Premium epic, mythic, and legendary gear — prices are steep.'
            : 'Spend coins on supplies and held gear before the path closes.',
        }
    }
  }

  const { title, subtitle } = titleForType()
  const purchaseSource = shopTypeToPurchaseSource(shopInventory.shopType)

  function renderCatalogItem(def: (typeof catalogItems)[0]) {
    const ownership = getShopItemOwnership(
      ownershipCtx.inventory,
      def.id,
      ownershipCtx.starter,
      ownershipCtx.recruits,
    )
    const cost = getItemPurchasePrice(def, purchaseSource)
    const canBuy = cost != null && creature.coins >= cost
    return (
      <ShopItemCard
        key={def.id}
        name={def.name}
        rarity={def.rarity}
        cost={cost ?? 0}
        costLabel={formatPurchaseCostLabel(cost)}
        description={def.description}
        category={def.category}
        ownership={ownership}
      >
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={() => onBuyItem(def.id)}
          disabled={!canBuy}
        >
          {cost == null ? 'Unavailable' : 'Buy'}
        </button>
      </ShopItemCard>
    )
  }

  return (
    <main className="shop-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">{title}</h1>
        <p className="screen-header__subtitle">{subtitle}</p>
      </header>

      <p className="shop-screen__coins">
        <span className="panel-label">Your coins</span>
        <strong>{creature.coins}</strong>
      </p>

      {consumables.length > 0 && (
        <section className="shop-screen__section" aria-labelledby="consumables-heading">
          <h2 id="consumables-heading" className="shop-screen__section-title">
            Consumables
          </h2>
          <div className="shop-items">{consumables.map(renderCatalogItem)}</div>
        </section>
      )}

      {materials.length > 0 && (
        <section className="shop-screen__section" aria-labelledby="materials-heading">
          <h2 id="materials-heading" className="shop-screen__section-title">
            Materials
          </h2>
          <div className="shop-items">{materials.map(renderCatalogItem)}</div>
        </section>
      )}

      {otherItems.length > 0 && (
        <section className="shop-screen__section" aria-labelledby="other-items-heading">
          <h2 id="other-items-heading" className="shop-screen__section-title">
            Special items
          </h2>
          <div className="shop-items">{otherItems.map(renderCatalogItem)}</div>
        </section>
      )}

      <section className="shop-screen__section" aria-labelledby="gear-heading">
        <h2 id="gear-heading" className="shop-screen__section-title">
          {isRelic ? 'Relic gear' : 'Gear'}
        </h2>
        {gearItems.length === 0 ? (
          <p className="shop-screen__empty">No gear in stock this visit.</p>
        ) : (
          <div className="shop-items">
            {gearItems.map((gear) => {
              const ownership = getShopItemOwnership(
                ownershipCtx.inventory,
                gear.id,
                ownershipCtx.starter,
                ownershipCtx.recruits,
                { trackEquipped: true },
              )
              const cost = getGearPurchasePrice(gear, purchaseSource)
              const canBuy = cost != null && creature.coins >= cost
              return (
                <ShopItemCard
                  key={gear.id}
                  name={gear.name}
                  rarity={gear.rarity}
                  cost={cost ?? 0}
                  costLabel={formatPurchaseCostLabel(cost)}
                  description={gear.description}
                  ownership={ownership}
                  variant="gear"
                  stats={formatGearSummary(gear)}
                >
                  <button
                    type="button"
                    className="btn btn--small btn--primary"
                    onClick={() => onBuyGear(gear.id)}
                    disabled={!canBuy}
                  >
                    {cost == null ? 'Unavailable' : 'Buy'}
                  </button>
                </ShopItemCard>
              )
            })}
          </div>
        )}
      </section>

      <section className="shop-log" aria-label="Shop log">
        <h2 className="panel-label">Shop log</h2>
        <div className="shop-log__entries">
          {shopLog.length === 0 ? (
            <p className="shop-log__line shop-log__line--dim">
              Purchase an item or leave the shop.
            </p>
          ) : (
            shopLog.map((line, i) => (
              <p key={`${i}-${line}`} className="shop-log__line">
                {line}
              </p>
            ))
          )}
        </div>
      </section>

      <div className="shop-screen__footer">
        {onOpenInventory && (
          <button type="button" className="btn" onClick={onOpenInventory}>
            Inventory
          </button>
        )}
        <button type="button" className="btn btn--primary" onClick={onLeave}>
          Leave Shop
        </button>
      </div>
    </main>
  )
}
