import { useState } from 'react'
import type { CraftingCategory, CraftingRecipe } from '../data/craftingRecipes'
import { getRecipesByCategory } from '../data/craftingRecipes'
import { getGearItem } from '../data/gearItems'
import { getItemDefinition } from '../data/items'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import {
  canAffordUpgrade,
  checkRecipeAffordability,
  formatMaterialLabel,
  getGearUpgradeCost,
} from '../utils/forgeSystem'
import { formatGearSummary } from '../utils/gearSystem'
import type { TrainerInventory } from '../utils/inventorySystem'
type ForgeTab = 'consumable' | 'gear' | 'upgrade' | 'exchange'

const TAB_LABELS: Record<ForgeTab, string> = {
  consumable: 'Craft Consumables',
  gear: 'Craft Gear',
  upgrade: 'Upgrade Gear',
  exchange: 'Material Exchange',
}

const TAB_CATEGORY: Record<ForgeTab, CraftingCategory> = {
  consumable: 'consumable',
  gear: 'gear',
  upgrade: 'upgrade',
  exchange: 'exchange',
}

export function MonolithForgePanel({
  creature,
  recruits,
  inventory,
  partyLevel,
  message,
  onCraft,
  onUpgradeInventory,
  onUpgradeEquipped,
}: {
  creature: RunCreature
  recruits: PartyCreature[]
  inventory: TrainerInventory
  partyLevel: number
  message: string | null
  onCraft: (recipeId: string) => void
  onUpgradeInventory: (instanceId: string) => void
  onUpgradeEquipped: (creatureKey: string) => void
}) {
  const [tab, setTab] = useState<ForgeTab>('consumable')
  const recipes = getRecipesByCategory(TAB_CATEGORY[tab])

  const upgradeTargets: { key: string; label: string; gearId: string | null; level: number }[] =
    []
  if (creature.equippedGearId) {
    upgradeTargets.push({
      key: 'starter',
      label: creature.name,
      gearId: creature.equippedGearId,
      level: creature.equippedGearUpgradeLevel ?? 0,
    })
  }
  for (const r of recruits) {
    if (r.equippedGearId) {
      upgradeTargets.push({
        key: r.id,
        label: r.name,
        gearId: r.equippedGearId,
        level: r.equippedGearUpgradeLevel ?? 0,
      })
    }
  }

  return (
    <section className="monolith-forge" aria-label="Monolith Forge">
      <div className="quest-board__npc">
        <h2 className="quest-board__npc-name">Monolith Forge</h2>
        <p className="quest-board__npc-text">
          Craft epic and legendary gear stronger than route drops. Swap excess materials
          evenly at the exchange — no coin sales.
        </p>
      </div>

      {message && (
        <p className="quest-board__message" role="status">
          {message}
        </p>
      )}

      <p className="recovery-station-screen__coins" role="status">
        Coins: <strong>{creature.coins}</strong>
      </p>

      <nav className="monolith-forge__tabs" aria-label="Forge sections">
        {(Object.keys(TAB_LABELS) as ForgeTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`btn btn--small${tab === t ? ' btn--primary' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {tab === 'upgrade' ? (
        <div className="monolith-forge__upgrade">
          <h3 className="panel-label">Inventory gear</h3>
          {inventory.gear.length === 0 ? (
            <p className="quest-board__empty">No gear in inventory to upgrade.</p>
          ) : (
            <ul className="quest-board__list">
              {inventory.gear.map((entry) => {
                const gear = getGearItem(entry.itemId)
                if (!gear) return null
                const level = entry.upgradeLevel ?? 0
                const max = entry.maxUpgradeLevel ?? 5
                const afford = canAffordUpgrade(gear, entry, inventory, creature.coins)
                const cost = getGearUpgradeCost(gear, level + 1)
                return (
                  <li key={entry.id} className="quest-card">
                    <h4 className="quest-card__title">
                      {gear.name} +{level}/{max}
                    </h4>
                    <ul className="monolith-forge__stat-lines">
                      {formatGearSummary(gear).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    {level < max && (
                      <>
                        <p className="quest-card__desc">
                          Next: {cost.coinCost} coins
                          {cost.materials.map((m) => (
                            <span key={m.itemId}>
                              {' '}
                              · {formatMaterialLabel(m.itemId)} ×{m.quantity}
                            </span>
                          ))}
                        </p>
                        <button
                          type="button"
                          className="btn btn--small btn--primary"
                          disabled={!afford.ok}
                          onClick={() => onUpgradeInventory(entry.id)}
                        >
                          Upgrade
                        </button>
                      </>
                    )}
                    {level >= max && (
                      <p className="quest-card__reward">Fully upgraded</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <h3 className="panel-label">Equipped gear</h3>
          {upgradeTargets.length === 0 ? (
            <p className="quest-board__empty">No equipped gear to upgrade.</p>
          ) : (
            <ul className="quest-board__list">
              {upgradeTargets.map((t) => {
                const gear = getGearItem(t.gearId)
                if (!gear) return null
                const fake = {
                  id: 'eq',
                  itemId: gear.id,
                  name: gear.name,
                  category: 'gear' as const,
                  quantity: 1,
                  description: gear.description,
                  rarity: gear.rarity,
                  stackable: false,
                  upgradeLevel: t.level,
                  maxUpgradeLevel: 5,
                }
                const afford = canAffordUpgrade(gear, fake, inventory, creature.coins)
                const cost = getGearUpgradeCost(gear, t.level + 1)
                return (
                  <li key={t.key} className="quest-card">
                    <h4 className="quest-card__title">
                      {t.label}: {gear.name} +{t.level}/5
                    </h4>
                    {t.level < 5 && (
                      <>
                        <p className="quest-card__desc">
                          Next: {cost.coinCost} coins
                          {cost.materials.map((m) => (
                            <span key={m.itemId}>
                              {' '}
                              · {formatMaterialLabel(m.itemId)} ×{m.quantity}
                            </span>
                          ))}
                        </p>
                        <button
                          type="button"
                          className="btn btn--small btn--primary"
                          disabled={!afford.ok}
                          onClick={() => onUpgradeEquipped(t.key)}
                        >
                          Upgrade equipped
                        </button>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : (
        <ul className="quest-board__list">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              inventory={inventory}
              coins={creature.coins}
              partyLevel={partyLevel}
              onCraft={onCraft}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function RecipeCard({
  recipe,
  inventory,
  coins,
  partyLevel,
  onCraft,
}: {
  recipe: CraftingRecipe
  inventory: TrainerInventory
  coins: number
  partyLevel: number
  onCraft: (recipeId: string) => void
}) {
  const afford = checkRecipeAffordability(recipe, inventory, coins, partyLevel)
  const needsConfirm = recipe.category === 'exchange'

  const handleCraft = () => {
    if (needsConfirm) {
      const ok = window.confirm(
        `Exchange materials for "${recipe.name}"?\n${recipe.description}`,
      )
      if (!ok) return
    }
    onCraft(recipe.id)
  }

  return (
    <li className="quest-card">
      <h4 className="quest-card__title">{recipe.name}</h4>
      <p className="quest-card__desc">{recipe.description}</p>
      <NeedList recipe={recipe} inventory={inventory} coins={coins} afford={afford} />
      <button
        type="button"
        className="btn btn--small btn--primary"
        disabled={!afford.canCraft}
        onClick={handleCraft}
      >
        {recipe.category === 'exchange' ? 'Exchange' : 'Craft'}
      </button>
    </li>
  )
}

function NeedList({
  recipe,
  inventory,
  coins,
  afford,
}: {
  recipe: CraftingRecipe
  inventory: TrainerInventory
  coins: number
  afford: { meetsLevel: boolean }
}) {
  const lines: { label: string; have: number; need: number }[] = []

  for (const req of recipe.requiredMaterials) {
    if ('kind' in req && req.kind === 'anyCommonMaterial') {
      const have = inventory.materials
        .filter((m) =>
          ['ember-scale', 'tide-pearl', 'volt-thread', 'stone-chip', 'wild-seed'].includes(
            m.itemId,
          ),
        )
        .reduce((s, m) => s + m.quantity, 0)
      lines.push({ label: 'Common materials (any)', have, need: req.quantity })
    } else if ('itemId' in req) {
      const entry = inventory.materials.find((m) => m.itemId === req.itemId)
      const def = getItemDefinition(req.itemId)
      lines.push({
        label: def?.name ?? req.itemId,
        have: entry?.quantity ?? 0,
        need: req.quantity,
      })
    }
  }
  if (recipe.coinCost > 0) {
    lines.push({ label: 'Coins', have: coins, need: recipe.coinCost })
  }

  return (
    <div className="monolith-forge__needs">
      <p className="quest-card__reward">Need:</p>
      <ul className="monolith-forge__need-list">
        {lines.map((line) => {
          const isMissing =
            line.have < line.need ||
            (line.label === 'Coins' && coins < recipe.coinCost)
          return (
            <li
              key={line.label}
              className={isMissing ? 'monolith-forge__need--missing' : undefined}
            >
              {line.label} {line.have}/{line.need}
            </li>
          )
        })}
      </ul>
      {!afford.meetsLevel && (
        <p className="monolith-forge__need--missing">Requires party Lv. {recipe.minLevel}+</p>
      )}
    </div>
  )
}
