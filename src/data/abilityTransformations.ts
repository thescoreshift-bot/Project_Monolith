import type { MasteryPathTag } from './abilityMasteryPerks'

export type AbilityTransformation = {
  id: string
  fromAbilityId: string
  requiredRank: 5 | 10
  pathTag: MasteryPathTag
  newAbilityId: string
  newName: string
  description: string
}

export const ABILITY_TRANSFORMATIONS: AbilityTransformation[] = [
  // Spark Ember Rank 5
  { id: 'se-r5-damage', fromAbilityId: 'spark-ember', requiredRank: 5, pathTag: 'damage', newAbilityId: 'cinder-lance', newName: 'Cinder Lance', description: 'A focused lance of cinder with higher power and crit scaling.' },
  { id: 'se-r5-status', fromAbilityId: 'spark-ember', requiredRank: 5, pathTag: 'status', newAbilityId: 'searing-hex', newName: 'Searing Hex', description: 'Lower power but high burn chance; burns may spread.' },
  { id: 'se-r5-utility', fromAbilityId: 'spark-ember', requiredRank: 5, pathTag: 'utility', newAbilityId: 'warmflare', newName: 'Warmflare', description: 'Moderate damage; heals the user slightly when the foe is burning.' },
  { id: 'se-r5-hybrid', fromAbilityId: 'spark-ember', requiredRank: 5, pathTag: 'hybrid', newAbilityId: 'ember-spiral', newName: 'Ember Spiral', description: 'Balanced damage and burn chance in a spiraling burst.' },
  // Spark Ember Rank 10
  { id: 'se-r10-damage', fromAbilityId: 'cinder-lance', requiredRank: 10, pathTag: 'damage', newAbilityId: 'solar-cinder-spear', newName: 'Solar Cinder Spear', description: 'Master form — devastating fire lance.' },
  { id: 'se-r10-status', fromAbilityId: 'searing-hex', requiredRank: 10, pathTag: 'status', newAbilityId: 'infernal-brand', newName: 'Infernal Brand', description: 'Master form — brands the foe with spreading inferno.' },
  { id: 'se-r10-utility', fromAbilityId: 'warmflare', requiredRank: 10, pathTag: 'utility', newAbilityId: 'phoenix-pulse', newName: 'Phoenix Pulse', description: 'Master form — flame pulse that sustains the user.' },
  { id: 'se-r10-hybrid', fromAbilityId: 'ember-spiral', requiredRank: 10, pathTag: 'hybrid', newAbilityId: 'celestial-emberstorm', newName: 'Celestial Emberstorm', description: 'Master form — storm of embers and searing hex.' },
  // Bubble Hex Rank 5
  { id: 'bh-r5-damage', fromAbilityId: 'bubble-hex', requiredRank: 5, pathTag: 'damage', newAbilityId: 'tide-lance', newName: 'Tide Lance', description: 'Pressurized water lance.' },
  { id: 'bh-r5-status', fromAbilityId: 'bubble-hex', requiredRank: 5, pathTag: 'status', newAbilityId: 'binding-mist', newName: 'Binding Mist', description: 'Binds and slows with heavy mist.' },
  { id: 'bh-r5-utility', fromAbilityId: 'bubble-hex', requiredRank: 5, pathTag: 'utility', newAbilityId: 'healing-rain', newName: 'Healing Rain', description: 'Damage plus self-healing mist.' },
  { id: 'bh-r5-hybrid', fromAbilityId: 'bubble-hex', requiredRank: 5, pathTag: 'hybrid', newAbilityId: 'riptide-hex', newName: 'Riptide Hex', description: 'Balanced water hex with bind chance.' },
  // Vine Lash Rank 5
  { id: 'vl-r5-damage', fromAbilityId: 'vine-lash', requiredRank: 5, pathTag: 'damage', newAbilityId: 'thorn-whip', newName: 'Thorn Whip', description: 'Heavy thorned whip strike.' },
  { id: 'vl-r5-status', fromAbilityId: 'vine-lash', requiredRank: 5, pathTag: 'status', newAbilityId: 'bind-lash', newName: 'Bind Lash', description: 'Vines bind while striking.' },
  { id: 'vl-r5-utility', fromAbilityId: 'vine-lash', requiredRank: 5, pathTag: 'utility', newAbilityId: 'sap-lash', newName: 'Sap Lash', description: 'Moderate damage with sap heal.' },
  { id: 'vl-r5-hybrid', fromAbilityId: 'vine-lash', requiredRank: 5, pathTag: 'hybrid', newAbilityId: 'wild-lash', newName: 'Wild Lash', description: 'Damage, poison, and bind blend.' },
  // Static Jolt Rank 5
  { id: 'sj-r5-damage', fromAbilityId: 'static-jolt', requiredRank: 5, pathTag: 'damage', newAbilityId: 'bolt-lance', newName: 'Bolt Lance', description: 'Focused lightning bolt.' },
  { id: 'sj-r5-status', fromAbilityId: 'static-jolt', requiredRank: 5, pathTag: 'status', newAbilityId: 'paralyze-bolt', newName: 'Paralyze Bolt', description: 'High paralyze chance jolt.' },
  { id: 'sj-r5-utility', fromAbilityId: 'static-jolt', requiredRank: 5, pathTag: 'utility', newAbilityId: 'charge-jolt', newName: 'Charge Jolt', description: 'Damage and self-buff speed (planned).' },
  { id: 'sj-r5-hybrid', fromAbilityId: 'static-jolt', requiredRank: 5, pathTag: 'hybrid', newAbilityId: 'chain-jolt', newName: 'Chain Jolt', description: 'Chain lightning with paralyze.' },
  // Stone Nudge Rank 5
  { id: 'sn-r5-damage', fromAbilityId: 'stone-nudge', requiredRank: 5, pathTag: 'damage', newAbilityId: 'boulder-ram', newName: 'Boulder Ram', description: 'Heavy stone ram.' },
  { id: 'sn-r5-status', fromAbilityId: 'stone-nudge', requiredRank: 5, pathTag: 'status', newAbilityId: 'stun-nudge', newName: 'Stun Nudge', description: 'Stunning stone impact.' },
  { id: 'sn-r5-utility', fromAbilityId: 'stone-nudge', requiredRank: 5, pathTag: 'utility', newAbilityId: 'stone-ward', newName: 'Stone Ward', description: 'Damage plus DEF buff.' },
  { id: 'sn-r5-hybrid', fromAbilityId: 'stone-nudge', requiredRank: 5, pathTag: 'hybrid', newAbilityId: 'quake-nudge', newName: 'Quake Nudge', description: 'Damage and armor break.' },
]

export function getRank5Transformation(
  baseAbilityId: string,
  path: MasteryPathTag,
): AbilityTransformation | undefined {
  return ABILITY_TRANSFORMATIONS.find(
    (t) =>
      t.fromAbilityId === baseAbilityId &&
      t.requiredRank === 5 &&
      t.pathTag === path,
  )
}

export function getRank10Transformation(
  currentAbilityId: string,
  path: MasteryPathTag,
): AbilityTransformation | undefined {
  return ABILITY_TRANSFORMATIONS.find(
    (t) =>
      t.fromAbilityId === currentAbilityId &&
      t.requiredRank === 10 &&
      t.pathTag === path,
  )
}
