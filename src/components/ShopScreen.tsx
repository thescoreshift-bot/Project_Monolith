import { SHOP_ITEMS, type ShopItemId } from '../data/shopItems'
import type { RunCreature } from '../utils/progression'

type ShopScreenProps = {
  creature: RunCreature
  shopLog: string[]
  onBuy: (itemId: ShopItemId) => void
  onLeave: () => void
}

export function ShopScreen({
  creature,
  shopLog,
  onBuy,
  onLeave,
}: ShopScreenProps) {
  return (
    <main className="shop-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Drift Market</h1>
        <p className="screen-header__subtitle">
          Spend coins on supplies before the path closes.
        </p>
      </header>

      <p className="shop-screen__coins">
        <span className="panel-label">Your coins</span>
        <strong>{creature.coins}</strong>
      </p>

      <div className="shop-items">
        {SHOP_ITEMS.map((item) => (
          <article key={item.id} className="shop-item">
            <header className="shop-item__header">
              <h2 className="shop-item__name">{item.name}</h2>
              <span className="shop-item__cost">{item.cost} coins</span>
            </header>
            <p className="shop-item__desc">{item.description}</p>
            <button
              type="button"
              className="btn btn--small btn--primary"
              onClick={() => onBuy(item.id)}
            >
              Buy
            </button>
          </article>
        ))}
      </div>

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

      <button type="button" className="btn btn--primary" onClick={onLeave}>
        Leave Shop
      </button>
    </main>
  )
}
