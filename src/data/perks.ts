export type PerkRarity = 'common' | 'rare' | 'legendary'

export type PerkCategory =
  | 'offense'
  | 'defense'
  | 'speed'
  | 'utility'
  | 'evolution'

export type StatModifiers = Partial<{
  hp: number
  atk: number
  def: number
  spAtk: number
  spDef: number
  spd: number
  maxHp: number
}>

export type Perk = {
  id: string
  name: string
  rarity: PerkRarity
  category: PerkCategory
  description: string
  statModifiers?: StatModifiers
  effect: string
}

export const PERKS: Record<string, Perk> = {
  'ember-blood': {
    id: 'ember-blood',
    name: 'Ember Blood',
    rarity: 'rare',
    category: 'offense',
    description: '+10% damage with Fire abilities.',
    effect: 'Fire abilities deal 10% bonus damage.',
  },
  'piercing-instinct': {
    id: 'piercing-instinct',
    name: 'Piercing Instinct',
    rarity: 'rare',
    category: 'offense',
    description: 'Attacks ignore 5 DEF.',
    effect: 'Physical attacks ignore 5 of the target DEF.',
  },
  'critical-spark': {
    id: 'critical-spark',
    name: 'Critical Spark',
    rarity: 'common',
    category: 'offense',
    description: '+8% critical hit chance.',
    effect: '8% chance for attacks to deal 50% bonus damage.',
  },
  'fury-edge': {
    id: 'fury-edge',
    name: 'Fury Edge',
    rarity: 'common',
    category: 'offense',
    description: 'Sharpened instincts boost raw power.',
    statModifiers: { atk: 5 },
    effect: '+5 ATK.',
  },
  'arc-surge': {
    id: 'arc-surge',
    name: 'Arc Surge',
    rarity: 'common',
    category: 'offense',
    description: 'Channels energy into special attacks.',
    statModifiers: { spAtk: 5 },
    effect: '+5 SP.ATK.',
  },
  'iron-hide': {
    id: 'iron-hide',
    name: 'Iron Hide',
    rarity: 'common',
    category: 'defense',
    description: 'Hardened body withstands more punishment.',
    statModifiers: { maxHp: 15 },
    effect: '+15 max HP.',
  },
  'guarded-stance': {
    id: 'guarded-stance',
    name: 'Guarded Stance',
    rarity: 'common',
    category: 'defense',
    description: 'A defensive posture reduces incoming blows.',
    statModifiers: { def: 5 },
    effect: '+5 DEF.',
  },
  'thick-scales': {
    id: 'thick-scales',
    name: 'Thick Scales',
    rarity: 'rare',
    category: 'defense',
    description: 'Take 10% less damage while above 50% HP.',
    effect: '10% damage reduction when HP is above half.',
  },
  'bulwark-shell': {
    id: 'bulwark-shell',
    name: 'Bulwark Shell',
    rarity: 'common',
    category: 'defense',
    description: 'Reinforced plating against special attacks.',
    statModifiers: { spDef: 5 },
    effect: '+5 SP.DEF.',
  },
  'steady-core': {
    id: 'steady-core',
    name: 'Steady Core',
    rarity: 'rare',
    category: 'defense',
    description: 'Balanced fortification of body and spirit.',
    statModifiers: { def: 3, spDef: 3 },
    effect: '+3 DEF and +3 SP.DEF.',
  },
  quickstep: {
    id: 'quickstep',
    name: 'Quickstep',
    rarity: 'common',
    category: 'speed',
    description: 'Lightfooted movement outpaces foes.',
    statModifiers: { spd: 6 },
    effect: '+6 SPD.',
  },
  'first-strike': {
    id: 'first-strike',
    name: 'First Strike',
    rarity: 'rare',
    category: 'speed',
    description: 'First attack each combat deals bonus damage.',
    effect: 'First ability used in combat deals +8 bonus damage.',
  },
  'evasive-reflex': {
    id: 'evasive-reflex',
    name: 'Evasive Reflex',
    rarity: 'rare',
    category: 'speed',
    description: 'Small chance to dodge enemy attacks.',
    effect: '12% chance to completely dodge an enemy attack.',
  },
  'swift-focus': {
    id: 'swift-focus',
    name: 'Swift Focus',
    rarity: 'common',
    category: 'speed',
    description: 'Heightened reflexes improve initiative.',
    statModifiers: { spd: 4 },
    effect: '+4 SPD.',
  },
  'second-wind': {
    id: 'second-wind',
    name: 'Second Wind',
    rarity: 'common',
    category: 'utility',
    description: 'Heal a small amount after each battle.',
    effect: 'Restore 8 HP after winning combat.',
  },
  'status-focus': {
    id: 'status-focus',
    name: 'Status Focus',
    rarity: 'rare',
    category: 'utility',
    description: 'Status effects become slightly stronger.',
    effect: 'Status effects gain 15% increased potency.',
  },
  'field-recovery': {
    id: 'field-recovery',
    name: 'Field Recovery',
    rarity: 'common',
    category: 'utility',
    description: 'Heal when entering Rest nodes.',
    effect: 'Restore 20 HP when completing a Rest node.',
  },
  'scavenger-sense': {
    id: 'scavenger-sense',
    name: 'Scavenger Sense',
    rarity: 'common',
    category: 'utility',
    description: 'Improved odds of finding useful rewards.',
    effect: 'Future loot quality slightly improved.',
  },
  'primal-mutation': {
    id: 'primal-mutation',
    name: 'Primal Mutation',
    rarity: 'legendary',
    category: 'evolution',
    description: 'A violent shift toward a primal future form.',
    effect: 'Greatly increases evolution score toward primal paths.',
  },
  'adaptive-core': {
    id: 'adaptive-core',
    name: 'Adaptive Core',
    rarity: 'rare',
    category: 'evolution',
    description: 'Flexible biology adapts to any path.',
    effect: 'Slightly improves all evolution scores.',
  },
  'strange-catalyst': {
    id: 'strange-catalyst',
    name: 'Strange Catalyst',
    rarity: 'legendary',
    category: 'evolution',
    description: 'Unlocks unusual future evolution paths later.',
    effect: 'Opens rare and unusual evolution branches later.',
  },
  'monolith-resonance': {
    id: 'monolith-resonance',
    name: 'Monolith Resonance',
    rarity: 'rare',
    category: 'evolution',
    description: 'Harmonic link to the Monolith deepens.',
    effect: 'Strengthens connection to Monolith evolutions.',
  },
}

export const PERK_LIST = Object.values(PERKS)

export function getPerk(id: string): Perk {
  return PERKS[id]
}

export function pickRandomPerks(
  count: number,
  excludeIds: string[] = [],
): Perk[] {
  const pool = PERK_LIST.filter((p) => !excludeIds.includes(p.id))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
