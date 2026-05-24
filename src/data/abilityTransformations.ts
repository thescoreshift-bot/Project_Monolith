import type { MasteryPathTag } from './abilityMasteryPerks'
import { buildFallbackTransformation } from '../utils/abilityTransformFallback'

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
  // Bubble Hex Rank 10
  { id: 'bh-r10-damage', fromAbilityId: 'tide-lance', requiredRank: 10, pathTag: 'damage', newAbilityId: 'abyssal-tide-spear', newName: 'Abyssal Tide Spear', description: 'Master form — crushing water lance.' },
  { id: 'bh-r10-status', fromAbilityId: 'binding-mist', requiredRank: 10, pathTag: 'status', newAbilityId: 'eternal-binding-mist', newName: 'Eternal Binding Mist', description: 'Master form — eternal binding mist.' },
  { id: 'bh-r10-utility', fromAbilityId: 'healing-rain', requiredRank: 10, pathTag: 'utility', newAbilityId: 'oceanic-healing-rain', newName: 'Oceanic Healing Rain', description: 'Master form — oceanic healing rain.' },
  { id: 'bh-r10-hybrid', fromAbilityId: 'riptide-hex', requiredRank: 10, pathTag: 'hybrid', newAbilityId: 'maelstrom-hex', newName: 'Maelstrom Hex', description: 'Master form — maelstrom hex.' },
  // Vine Lash Rank 10
  { id: 'vl-r10-damage', fromAbilityId: 'thorn-whip', requiredRank: 10, pathTag: 'damage', newAbilityId: 'ancient-thorn-whip', newName: 'Ancient Thorn Whip', description: 'Master form — ancient thorn whip.' },
  { id: 'vl-r10-status', fromAbilityId: 'bind-lash', requiredRank: 10, pathTag: 'status', newAbilityId: 'eternal-bind-lash', newName: 'Eternal Bind Lash', description: 'Master form — eternal bind lash.' },
  { id: 'vl-r10-utility', fromAbilityId: 'sap-lash', requiredRank: 10, pathTag: 'utility', newAbilityId: 'lifeblood-sap-lash', newName: 'Lifeblood Sap Lash', description: 'Master form — lifeblood sap lash.' },
  { id: 'vl-r10-hybrid', fromAbilityId: 'wild-lash', requiredRank: 10, pathTag: 'hybrid', newAbilityId: 'overgrowth-wild-lash', newName: 'Overgrowth Wild Lash', description: 'Master form — overgrowth wild lash.' },
  // Static Jolt Rank 10
  { id: 'sj-r10-damage', fromAbilityId: 'bolt-lance', requiredRank: 10, pathTag: 'damage', newAbilityId: 'storm-bolt-lance', newName: 'Storm Bolt Lance', description: 'Master form — storm bolt lance.' },
  { id: 'sj-r10-status', fromAbilityId: 'paralyze-bolt', requiredRank: 10, pathTag: 'status', newAbilityId: 'eternal-paralyze-bolt', newName: 'Eternal Paralyze Bolt', description: 'Master form — eternal paralyze bolt.' },
  { id: 'sj-r10-utility', fromAbilityId: 'charge-jolt', requiredRank: 10, pathTag: 'utility', newAbilityId: 'overcharge-jolt', newName: 'Overcharge Jolt', description: 'Master form — overcharge jolt.' },
  { id: 'sj-r10-hybrid', fromAbilityId: 'chain-jolt', requiredRank: 10, pathTag: 'hybrid', newAbilityId: 'tempest-chain-jolt', newName: 'Tempest Chain Jolt', description: 'Master form — tempest chain jolt.' },
  // Stone Nudge Rank 10
  { id: 'sn-r10-damage', fromAbilityId: 'boulder-ram', requiredRank: 10, pathTag: 'damage', newAbilityId: 'colossal-boulder-ram', newName: 'Colossal Boulder Ram', description: 'Master form — colossal boulder ram.' },
  { id: 'sn-r10-status', fromAbilityId: 'stun-nudge', requiredRank: 10, pathTag: 'status', newAbilityId: 'ruinous-stun-nudge', newName: 'Ruinous Stun Nudge', description: 'Master form — ruinous stun nudge.' },
  { id: 'sn-r10-utility', fromAbilityId: 'stone-ward', requiredRank: 10, pathTag: 'utility', newAbilityId: 'fortress-stone-ward', newName: 'Fortress Stone Ward', description: 'Master form — fortress stone ward.' },
  { id: 'sn-r10-hybrid', fromAbilityId: 'quake-nudge', requiredRank: 10, pathTag: 'hybrid', newAbilityId: 'cataclysm-quake-nudge', newName: 'Cataclysm Quake Nudge', description: 'Master form — cataclysm quake nudge.' },
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

/** Resolve a transformation, using curated data first then role-based fallback. */
export function resolveAbilityTransformation(
  fromAbilityId: string,
  requiredRank: 5 | 10,
  path: MasteryPathTag,
): AbilityTransformation {
  const curated =
    requiredRank === 5
      ? getRank5Transformation(fromAbilityId, path)
      : getRank10Transformation(fromAbilityId, path)
  return curated ?? buildFallbackTransformation(fromAbilityId, requiredRank, path)
}
