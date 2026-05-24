import { useState } from 'react'
import { getGearItem } from '../data/gearItems'
import { getItemDefinition } from '../data/items'
import { formatGearSummary } from '../utils/gearSystem'
import {
  getInventoryCounts,
  getAllInventoryItems,
  type InventoryItem,
  type TrainerInventory,
} from '../utils/inventorySystem'
import { itemRequiresTarget } from '../utils/itemUse'
import { STARTER_CREATURE_ID } from '../utils/creatureProgression'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'

export type InventoryTab = 'all' | 'consumable' | 'gear' | 'material' | 'keyItem'

type InventoryScreenProps = {
  inventory: TrainerInventory
  starter: RunCreature
  recruits: PartyCreature[]
  onUseItem: (instanceId: string, targetCreatureId?: string) => void
  onEquipGear: (instanceId: string, creatureId: string) => void
  onDropItem: (instanceId: string) => void
  onBack: () => void
}

function filterByTab(
  inv: TrainerInventory,
  tab: InventoryTab,
): InventoryItem[] {
  if (tab === 'all') return getAllInventoryItems(inv)
  if (tab === 'consumable') return inv.consumables
  if (tab === 'gear') return inv.gear
  if (tab === 'material') return inv.materials
  return inv.keyItems
}

function equippedOnName(
  itemId: string,
  starter: RunCreature,
  recruits: PartyCreature[],
): string | null {
  if (starter.equippedGearId === itemId) return starter.name
  const recruit = recruits.find((r) => r.equippedGearId === itemId)
  return recruit?.name ?? null
}

export function InventoryScreen({
  inventory,
  starter,
  recruits,
  onUseItem,
  onEquipGear,
  onDropItem,
  onBack,
}: InventoryScreenProps) {
  const [tab, setTab] = useState<InventoryTab>('all')
  const [targetPick, setTargetPick] = useState<{
    instanceId: string
    mode: 'heal' | 'revive'
  } | null>(null)
  const [equipPick, setEquipPick] = useState<string | null>(null)

  const counts = getInventoryCounts(inventory)
  const items = filterByTab(inventory, tab)

  const tabs: { id: InventoryTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'consumable', label: 'Consumables', count: counts.consumables },
    { id: 'gear', label: 'Gear', count: counts.gear },
    { id: 'material', label: 'Materials', count: counts.materials },
    { id: 'keyItem', label: 'Key Items', count: counts.keyItems },
  ]

  function handleUseClick(item: InventoryItem) {
    const def = getItemDefinition(item.itemId)
    if (!def?.useEffect) return
    if (itemRequiresTarget(item.id, inventory)) {
      setTargetPick({
        instanceId: item.id,
        mode: def.useEffect.type === 'revive' ? 'revive' : 'heal',
      })
      return
    }
    onUseItem(item.id)
  }

  function handleDrop(item: InventoryItem) {
    const label = `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`
    if (window.confirm(`Drop ${label}? This cannot be undone.`)) {
      onDropItem(item.id)
    }
  }

  const allCreatures: { id: string; name: string; currentHp: number; maxHp: number }[] =
    [
      {
        id: STARTER_CREATURE_ID,
        name: starter.name,
        currentHp: starter.currentHp,
        maxHp: starter.maxHp,
      },
      ...recruits.map((r) => ({
        id: r.id,
        name: r.name,
        currentHp: r.currentHp,
        maxHp: r.maxHp,
      })),
    ]

  return (
    <main className="inventory-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Trainer Inventory</h1>
        <p className="screen-header__subtitle">
          Consumables {counts.consumables} · Gear {counts.gear} · Materials{' '}
          {counts.materials} · Key items {counts.keyItems}
        </p>
      </header>

      <nav className="inventory-screen__tabs" aria-label="Inventory categories">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`inventory-screen__tab${tab === t.id ? ' inventory-screen__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="inventory-screen__empty">No items in this category.</p>
      ) : (
        <ul className="inventory-screen__list">
          {items.map((item) => {
            const def = getItemDefinition(item.itemId)
            const gear = getGearItem(item.itemId)
            const equippedName =
              item.category === 'gear'
                ? equippedOnName(item.itemId, starter, recruits)
                : null
            const usable = Boolean(def?.useEffect)
            return (
              <li key={item.id} className="inventory-card">
                <header className="inventory-card__header">
                  <span
                    className={`inventory-card__rarity inventory-card__rarity--${item.rarity}`}
                  >
                    {item.rarity}
                  </span>
                  <span className="inventory-card__category">{item.category}</span>
                  {item.quantity > 1 && (
                    <span className="inventory-card__qty">×{item.quantity}</span>
                  )}
                </header>
                <h2 className="inventory-card__name">{item.name}</h2>
                <p className="inventory-card__desc">{item.description}</p>
                {gear && (
                  <ul className="inventory-card__stats">
                    {formatGearSummary(gear).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                {equippedName && (
                  <p className="inventory-card__equipped">
                    Equipped on: <strong>{equippedName}</strong>
                  </p>
                )}
                <div className="inventory-card__actions">
                  {usable && (
                    <button
                      type="button"
                      className="btn btn--small btn--primary"
                      onClick={() => handleUseClick(item)}
                    >
                      Use
                    </button>
                  )}
                  {item.category === 'gear' && !equippedName && (
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => setEquipPick(item.id)}
                    >
                      Equip
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => handleDrop(item)}
                  >
                    Drop
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {targetPick && (
        <div className="inventory-target-modal" role="dialog" aria-modal="true">
          <div className="inventory-target-modal__dialog">
            <h2 className="panel-label">Choose target</h2>
            <ul className="inventory-target-modal__list">
              {allCreatures.map((c) => {
                const fainted = c.currentHp <= 0
                const disabled =
                  targetPick.mode === 'revive' ? !fainted : fainted
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="btn btn--small"
                      disabled={disabled}
                      onClick={() => {
                        onUseItem(targetPick.instanceId, c.id)
                        setTargetPick(null)
                      }}
                    >
                      {c.name} — {c.currentHp}/{c.maxHp} HP
                      {fainted ? ' (fainted)' : ''}
                    </button>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              className="btn"
              onClick={() => setTargetPick(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {equipPick && (
        <div className="inventory-target-modal" role="dialog" aria-modal="true">
          <div className="inventory-target-modal__dialog">
            <h2 className="panel-label">Equip on which creature?</h2>
            <ul className="inventory-target-modal__list">
              {allCreatures.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="btn btn--small btn--primary"
                    onClick={() => {
                      onEquipGear(equipPick, c.id)
                      setEquipPick(null)
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn" onClick={() => setEquipPick(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <footer className="inventory-screen__footer">
        <button type="button" className="btn btn--primary" onClick={onBack}>
          Back
        </button>
      </footer>
    </main>
  )
}
