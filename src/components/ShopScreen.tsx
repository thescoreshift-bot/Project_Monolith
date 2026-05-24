import { getGearItem } from '../data/gearItems'
import { SHOP_ITEMS, type ShopItemId } from '../data/shopItems'
import { formatGearSummary } from '../utils/gearSystem'
import type { RunCreature } from '../utils/progression'

type ShopScreenProps = {
  creature: RunCreature
  shopLog: string[]
  gearOffers: string[]
  variant?: 'market' | 'relic'
  onBuyConsumable: (itemId: ShopItemId) => void
  onBuyGear: (gearId: string) => void
  onOpenInventory?: () => void
  onLeave: () => void
}

export function ShopScreen({
  creature,
  shopLog,
  gearOffers,
  variant = 'market',
  onBuyConsumable,
  onBuyGear,
  onOpenInventory,
  onLeave,
}: ShopScreenProps) {
  const isRelic = variant === 'relic'
  const gearItems = gearOffers
    .map((id) => getGearItem(id))
    .filter((g): g is NonNullable<typeof g> => g !== null)

  return (
    <main className="shop-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">
          {isRelic ? 'Relic Vault' : 'Drift Market'}
        </h1>
        <p className="screen-header__subtitle">
          {isRelic
            ? 'Premium epic, mythic, and legendary gear tuned to your element — prices are steep.'
            : 'Spend coins on supplies and held gear before the path closes.'}
        </p>
      </header>

      <p className="shop-screen__coins">
        <span className="panel-label">Your coins</span>
        <strong>{creature.coins}</strong>
      </p>

      {!isRelic && (
        <section className="shop-screen__section" aria-labelledby="consumables-heading">
          <h2 id="consumables-heading" className="shop-screen__section-title">
            Consumables
          </h2>
          <div className="shop-items">
            {SHOP_ITEMS.map((item) => (
              <article key={item.id} className="shop-item">
                <header className="shop-item__header">
                  <h3 className="shop-item__name">{item.name}</h3>
                  <span className={`shop-item__rarity shop-item__rarity--${item.rarity}`}>
                    {item.rarity}
                  </span>
                  <span className="shop-item__cost">{item.cost} coins</span>
                </header>
                <p className="shop-item__desc">{item.description}</p>
                <p className="shop-item__category">consumable</p>
                <button
                  type="button"
                  className="btn btn--small btn--primary"
                  onClick={() => onBuyConsumable(item.id)}
                  disabled={creature.coins < item.cost}
                >
                  Buy
                </button>
              </article>
            ))}
          </div>
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
            {gearItems.map((gear) => (
              <article key={gear.id} className="shop-item shop-item--gear">
                <header className="shop-item__header">
                  <h3 className="shop-item__name">{gear.name}</h3>
                  <span className={`shop-item__rarity shop-item__rarity--${gear.rarity}`}>
                    {gear.rarity}
                  </span>
                  <span className="shop-item__cost">{gear.price} coins</span>
                </header>
                <p className="shop-item__desc">{gear.description}</p>
                <ul className="shop-item__stats">
                  {formatGearSummary(gear).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn btn--small btn--primary"
                  onClick={() => onBuyGear(gear.id)}
                  disabled={creature.coins < gear.price}
                >
                  Buy
                </button>
              </article>
            ))}
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
