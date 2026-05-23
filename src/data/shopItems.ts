export type ShopItemId = 'small-potion' | 'battle-tonic' | 'focus-charm'

export type ShopItem = {
  id: ShopItemId
  name: string
  cost: number
  description: string
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'small-potion',
    name: 'Small Potion',
    cost: 20,
    description: 'Heals all party creatures for 25 HP.',
  },
  {
    id: 'battle-tonic',
    name: 'Battle Tonic',
    cost: 35,
    description: '+5 ATK to all active battle creatures in the next combat.',
  },
  {
    id: 'focus-charm',
    name: 'Focus Charm',
    cost: 40,
    description: '+5 SP.ATK to all active battle creatures in the next combat.',
  },
]
