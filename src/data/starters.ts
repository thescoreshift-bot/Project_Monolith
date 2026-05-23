export type ElementType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ground'

export type StarterStats = {
  hp: number
  atk: number
  def: number
  spAtk: number
  spDef: number
  spd: number
}

export type Starter = {
  id: string
  name: string
  type: ElementType
  playstyle: string
  description: string
  stats: StarterStats
  ability: string
  abilityId: string
}

export const STARTERS: Starter[] = [
  {
    id: 'fire',
    name: 'Cinderex',
    type: 'Fire',
    playstyle: 'Burst damage, glass cannon',
    description: 'Strikes fast and hard before the enemy can recover.',
    stats: { hp: 42, atk: 55, def: 35, spAtk: 50, spDef: 38, spd: 48 },
    ability: 'Spark Ember',
    abilityId: 'spark-ember',
  },
  {
    id: 'water',
    name: 'Aqualis',
    type: 'Water',
    playstyle: 'Sustain, status, control',
    description: 'Outlasts foes with healing tides and slowing currents.',
    stats: { hp: 52, atk: 40, def: 45, spAtk: 42, spDef: 48, spd: 38 },
    ability: 'Bubble Hex',
    abilityId: 'bubble-hex',
  },
  {
    id: 'grass',
    name: 'Floramoss',
    type: 'Grass',
    playstyle: 'Regen, attrition, buffs',
    description: 'Grinds battles down with recovery and growing power.',
    stats: { hp: 50, atk: 42, def: 44, spAtk: 45, spDef: 46, spd: 40 },
    ability: 'Vine Lash',
    abilityId: 'vine-lash',
  },
  {
    id: 'electric',
    name: 'Voltara',
    type: 'Electric',
    playstyle: 'Speed, chain effects',
    description: 'Moves first and spreads damage across the enemy line.',
    stats: { hp: 40, atk: 48, def: 36, spAtk: 52, spDef: 40, spd: 58 },
    ability: 'Static Jolt',
    abilityId: 'static-jolt',
  },
  {
    id: 'ground',
    name: 'Terradon',
    type: 'Ground',
    playstyle: 'Tank, reflect, endure',
    description: 'Absorbs hits and punishes reckless attackers.',
    stats: { hp: 58, atk: 38, def: 55, spAtk: 35, spDef: 52, spd: 28 },
    ability: 'Stone Nudge',
    abilityId: 'stone-nudge',
  },
]
