import type { ElementType } from './starters'
import type {
  AbilityDefinition,
  AbilityEffect,
  AbilityTarget,
  AbilityCategory,
} from './abilityTypes'
import { sanitizeAbilityIdToDisplayName } from '../utils/abilityDisplay'

export type Ability = AbilityDefinition

function dmg(
  id: string,
  name: string,
  type: ElementType,
  category: 'physical' | 'special',
  power: number,
  accuracy: number,
  description: string,
  effects?: AbilityEffect[],
  target: AbilityTarget = 'enemy',
): AbilityDefinition {
  return {
    id,
    name,
    type,
    category,
    target,
    power,
    accuracy,
    description,
    effects,
  }
}

function stat(
  id: string,
  name: string,
  type: ElementType,
  accuracy: number,
  description: string,
  effects: AbilityEffect[],
  target: AbilityTarget = 'enemy',
): AbilityDefinition {
  return {
    id,
    name,
    type,
    category: 'status',
    target,
    power: 0,
    accuracy,
    description,
    effects,
  }
}

const ABILITY_LIST: AbilityDefinition[] = [
  dmg('spark-ember', 'Spark Ember', 'Fire', 'special', 40, 100, 'A burst of embers that scorches the foe.', [
    { type: 'applyStatus', status: 'burn', chance: 10 },
  ]),
  dmg('bubble-hex', 'Bubble Hex', 'Water', 'special', 35, 100, 'Hexed bubbles that crash into the target.'),
  dmg('vine-lash', 'Vine Lash', 'Grass', 'physical', 45, 95, 'Whips the foe with thorned vines.', [
    { type: 'applyStatus', status: 'poison', chance: 10 },
  ]),
  dmg('static-jolt', 'Static Jolt', 'Electric', 'special', 40, 100, 'A quick jolt of stored static energy.', [
    { type: 'applyStatus', status: 'paralyze', chance: 10 },
  ]),
  dmg('stone-nudge', 'Stone Nudge', 'Ground', 'physical', 35, 100, 'A solid nudge of packed stone.'),
  dmg('tackle', 'Tackle', 'Ground', 'physical', 30, 100, 'A straightforward body slam.'),
  dmg('sting', 'Sting', 'Grass', 'physical', 25, 95, 'A sharp stinger strike.', [
    { type: 'applyStatus', status: 'poison', chance: 15 },
  ]),
  dmg('cinder-bite', 'Cinder Bite', 'Fire', 'physical', 45, 90, 'Bites down with smoldering fangs.'),
  dmg('rock-bump', 'Rock Bump', 'Ground', 'physical', 40, 95, 'Slams the foe with a rocky shoulder.'),
  // Fire learnset
  stat('soft-growl', 'Soft Growl', 'Fire', 100, "Lowers the enemy's ATK by 1 stage.", [
    { type: 'statDebuff', stat: 'atk', stages: 1 },
  ]),
  stat('smoke-flicker', 'Smoke Flicker', 'Fire', 90, 'Lowers foe accuracy by 1 stage.', [
    { type: 'statDebuff', stat: 'accuracy', stages: 1 },
  ]),
  dmg('quick-swipe', 'Quick Swipe', 'Fire', 'physical', 35, 100, 'A fast claw swipe.'),
  dmg('flame-bite', 'Flame Bite', 'Fire', 'physical', 50, 90, 'A biting flame attack.', [
    { type: 'applyStatus', status: 'burn', chance: 20 },
  ]),
  stat('heat-veil', 'Heat Veil', 'Fire', 100, 'Raises your DEF by 1 stage.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
  ]),
  dmg('ember-burst', 'Ember Burst', 'Fire', 'special', 55, 95, 'A burst of hot embers.'),
  stat('scorching-cry', 'Scorching Cry', 'Fire', 85, "Lowers foe SP.DEF by 1 stage.", [
    { type: 'statDebuff', stat: 'spDef', stages: 1 },
  ]),
  dmg('inferno-rush', 'Inferno Rush', 'Fire', 'physical', 75, 85, 'A blazing rush attack.'),
  // Water learnset
  stat('gentle-cry', 'Gentle Cry', 'Water', 100, "Lowers the enemy's ATK by 1 stage.", [
    { type: 'statDebuff', stat: 'atk', stages: 1 },
  ]),
  stat('mist-veil', 'Mist Veil', 'Water', 100, 'Raises your evasion by 1 stage.', [
    { type: 'statBuff', stat: 'evasion', stages: 1, target: 'self' },
  ]),
  dmg('splash-strike', 'Splash Strike', 'Water', 'physical', 40, 100, 'A splashing physical strike.'),
  dmg('water-fang', 'Water Fang', 'Water', 'physical', 50, 90, 'Bites with pressurized water.'),
  stat('soothing-rain', 'Soothing Rain', 'Water', 100, 'Heals 25% of your max HP.', [
    { type: 'heal', percent: 0.25 },
  ], 'self'),
  dmg('pressure-wave', 'Pressure Wave', 'Water', 'special', 55, 95, 'A crushing water wave.'),
  stat('drench-guard', 'Drench Guard', 'Water', 100, 'Raises your DEF by 1 stage.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
  ]),
  dmg('riptide-crash', 'Riptide Crash', 'Water', 'special', 75, 85, 'A powerful riptide slam.'),
  // Grass learnset
  stat('root-snare', 'Root Snare', 'Grass', 90, "Lowers foe SPD by 1 stage.", [
    { type: 'statDebuff', stat: 'spd', stages: 1 },
  ]),
  stat('leaf-guard', 'Leaf Guard', 'Grass', 100, 'Raises your DEF by 1 stage.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
  ]),
  dmg('needle-flick', 'Needle Flick', 'Grass', 'physical', 35, 100, 'Flicks sharp needles at the foe.'),
  dmg('thorn-bite', 'Thorn Bite', 'Grass', 'physical', 50, 90, 'Bites with thorned jaws.', [
    { type: 'applyStatus', status: 'poison', chance: 20 },
  ]),
  stat('green-pulse', 'Green Pulse', 'Grass', 100, 'Raises your SP.ATK by 1 stage.', [
    { type: 'statBuff', stat: 'spAtk', stages: 1, target: 'self' },
  ]),
  stat('spore-cloud', 'Spore Cloud', 'Grass', 75, 'May poison the foe.', [
    { type: 'applyStatus', status: 'poison', chance: 40 },
  ]),
  stat('barkskin', 'Barkskin', 'Grass', 100, 'Raises DEF and lowers foe ATK.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
    { type: 'statDebuff', stat: 'atk', stages: 1 },
  ]),
  dmg('wild-growth', 'Wild Growth', 'Grass', 'special', 70, 90, 'Overgrowth strikes the foe.'),
  // Electric learnset
  stat('sharp-chirp', 'Sharp Chirp', 'Electric', 100, "Lowers foe DEF by 1 stage.", [
    { type: 'statDebuff', stat: 'def', stages: 1 },
  ]),
  stat('quick-charge', 'Quick Charge', 'Electric', 100, 'Raises your SPD by 1 stage.', [
    { type: 'statBuff', stat: 'spd', stages: 1, target: 'self' },
  ]),
  dmg('spark-kick', 'Spark Kick', 'Electric', 'physical', 40, 100, 'A charged kick attack.'),
  dmg('volt-bite', 'Volt Bite', 'Electric', 'physical', 50, 90, 'An electrified bite.', [
    { type: 'applyStatus', status: 'paralyze', chance: 20 },
  ]),
  stat('static-veil', 'Static Veil', 'Electric', 100, 'Raises your SP.ATK by 1 stage.', [
    { type: 'statBuff', stat: 'spAtk', stages: 1, target: 'self' },
  ]),
  dmg('chain-spark', 'Chain Spark', 'Electric', 'special', 55, 95, 'Arcing sparks strike the foe.'),
  stat('overcharge', 'Overcharge', 'Electric', 90, 'Raises ATK but lowers DEF.', [
    { type: 'statBuff', stat: 'atk', stages: 1, target: 'self' },
    { type: 'statDebuff', stat: 'def', stages: 1 },
  ]),
  dmg('storm-rush', 'Storm Rush', 'Electric', 'physical', 75, 85, 'A storm-charged rush.'),
  // Ground learnset
  stat('low-rumble', 'Low Rumble', 'Ground', 100, "Lowers foe ATK by 1 stage.", [
    { type: 'statDebuff', stat: 'atk', stages: 1 },
  ]),
  stat('harden-hide', 'Harden Hide', 'Ground', 100, 'Raises your DEF by 2 stages.', [
    { type: 'statBuff', stat: 'def', stages: 2, target: 'self' },
  ]),
  dmg('pebble-strike', 'Pebble Strike', 'Ground', 'physical', 40, 100, 'Hurls pebbles at the foe.'),
  dmg('quake-bite', 'Quake Bite', 'Ground', 'physical', 50, 90, 'A tremor-powered bite.'),
  stat('stone-guard', 'Stone Guard', 'Ground', 100, 'Raises DEF by 1 stage.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
  ]),
  stat('dust-cloud', 'Dust Cloud', 'Ground', 85, 'Lowers foe accuracy.', [
    { type: 'statDebuff', stat: 'accuracy', stages: 1 },
  ]),
  dmg('earth-pulse', 'Earth Pulse', 'Ground', 'special', 55, 95, 'Ground energy pulses outward.'),
  dmg('titan-stomp', 'Titan Stomp', 'Ground', 'physical', 75, 85, 'A massive stomp attack.'),
  // Spark Ember transformations
  dmg('cinder-lance', 'Cinder Lance', 'Fire', 'special', 55, 100, 'A focused lance of cinder with high power.', [
    { type: 'applyStatus', status: 'burn', chance: 15 },
  ]),
  dmg('searing-hex', 'Searing Hex', 'Fire', 'special', 42, 100, 'Hex flames that spread burns.', [
    { type: 'applyStatus', status: 'burn', chance: 35 },
  ]),
  dmg('warmflare', 'Warmflare', 'Fire', 'special', 45, 100, 'Moderate flames; heals user on burning foes.', [
    { type: 'applyStatus', status: 'burn', chance: 15 },
    { type: 'heal', percent: 0.08 },
  ], 'enemy'),
  dmg('ember-spiral', 'Ember Spiral', 'Fire', 'special', 48, 100, 'Spiraling embers with balanced burn.', [
    { type: 'applyStatus', status: 'burn', chance: 22 },
  ]),
  dmg('solar-cinder-spear', 'Solar Cinder Spear', 'Fire', 'special', 72, 100, 'Master fire lance — devastating power.', [
    { type: 'applyStatus', status: 'burn', chance: 25 },
  ]),
  dmg('infernal-brand', 'Infernal Brand', 'Fire', 'special', 50, 100, 'Brands the foe with infernal hex.', [
    { type: 'applyStatus', status: 'burn', chance: 45 },
  ]),
  dmg('phoenix-pulse', 'Phoenix Pulse', 'Fire', 'special', 52, 100, 'Pulse of flame that sustains the user.', [
    { type: 'heal', percent: 0.12 },
    { type: 'applyStatus', status: 'burn', chance: 20 },
  ]),
  dmg('celestial-emberstorm', 'Celestial Emberstorm', 'Fire', 'special', 65, 95, 'Storm of celestial embers.', [
    { type: 'applyStatus', status: 'burn', chance: 30 },
  ]),
  // Bubble Hex transformations
  dmg('tide-lance', 'Tide Lance', 'Water', 'special', 52, 100, 'Pressurized water lance.'),
  stat('binding-mist', 'Binding Mist', 'Water', 90, 'May bind the foe; lowers SPD.', [
    { type: 'applyStatus', status: 'bind', chance: 30 },
    { type: 'statDebuff', stat: 'spd', stages: 1 },
  ]),
  dmg('healing-rain', 'Healing Rain', 'Water', 'special', 40, 100, 'Rain that damages and heals self.', [
    { type: 'heal', percent: 0.1 },
  ]),
  dmg('riptide-hex', 'Riptide Hex', 'Water', 'special', 44, 100, 'Balanced hex with bind chance.', [
    { type: 'applyStatus', status: 'bind', chance: 18 },
  ]),
  // Vine Lash transformations
  dmg('thorn-whip', 'Thorn Whip', 'Grass', 'physical', 58, 95, 'Heavy thorned whip.'),
  dmg('bind-lash', 'Bind Lash', 'Grass', 'physical', 42, 95, 'Vines bind while striking.', [
    { type: 'applyStatus', status: 'bind', chance: 35 },
  ]),
  dmg('sap-lash', 'Sap Lash', 'Grass', 'physical', 44, 95, 'Sap heals the user on hit.', [
    { type: 'heal', percent: 0.1 },
  ]),
  dmg('wild-lash', 'Wild Lash', 'Grass', 'physical', 48, 95, 'Damage, poison, and bind blend.', [
    { type: 'applyStatus', status: 'poison', chance: 20 },
    { type: 'applyStatus', status: 'bind', chance: 15 },
  ]),
  // Static Jolt transformations
  dmg('bolt-lance', 'Bolt Lance', 'Electric', 'special', 54, 100, 'Focused lightning bolt.'),
  dmg('paralyze-bolt', 'Paralyze Bolt', 'Electric', 'special', 38, 100, 'High paralyze chance.', [
    { type: 'applyStatus', status: 'paralyze', chance: 40 },
  ]),
  dmg('charge-jolt', 'Charge Jolt', 'Electric', 'special', 42, 100, 'Damage and self speed buff.', [
    { type: 'statBuff', stat: 'spd', stages: 1, target: 'self' },
  ]),
  dmg('chain-jolt', 'Chain Jolt', 'Electric', 'special', 46, 100, 'Chain lightning with paralyze.', [
    { type: 'applyStatus', status: 'paralyze', chance: 25 },
  ]),
  // Stone Nudge transformations
  dmg('boulder-ram', 'Boulder Ram', 'Ground', 'physical', 52, 95, 'Heavy stone ram.'),
  dmg('stun-nudge', 'Stun Nudge', 'Ground', 'physical', 38, 95, 'Stunning stone impact.', [
    { type: 'applyStatus', status: 'paralyze', chance: 30 },
  ]),
  dmg('stone-ward', 'Stone Ward', 'Ground', 'physical', 40, 100, 'Damage plus DEF buff.', [
    { type: 'statBuff', stat: 'def', stages: 1, target: 'self' },
  ]),
  dmg('quake-nudge', 'Quake Nudge', 'Ground', 'physical', 44, 95, 'Damage and armor break.', [
    { type: 'statDebuff', stat: 'def', stages: 1 },
  ]),
  // Rank 10 — Water line
  dmg('abyssal-tide-spear', 'Abyssal Tide Spear', 'Water', 'special', 78, 100, 'Master water lance — crushing pressure.'),
  stat('eternal-binding-mist', 'Eternal Binding Mist', 'Water', 95, 'Master mist — heavy bind and SPD crush.', [
    { type: 'applyStatus', status: 'bind', chance: 45 },
    { type: 'statDebuff', stat: 'spd', stages: 2 },
  ]),
  dmg('oceanic-healing-rain', 'Oceanic Healing Rain', 'Water', 'special', 58, 100, 'Master rain — damages and restores heavily.', [
    { type: 'heal', percent: 0.18 },
  ]),
  dmg('maelstrom-hex', 'Maelstrom Hex', 'Water', 'special', 68, 100, 'Master riptide hex with binding surge.', [
    { type: 'applyStatus', status: 'bind', chance: 30 },
  ]),
  // Rank 10 — Grass line
  dmg('ancient-thorn-whip', 'Ancient Thorn Whip', 'Grass', 'physical', 82, 95, 'Master thorn whip — devastating lash.'),
  dmg('eternal-bind-lash', 'Eternal Bind Lash', 'Grass', 'physical', 58, 95, 'Master bind lash — vines lock foes.', [
    { type: 'applyStatus', status: 'bind', chance: 45 },
  ]),
  dmg('lifeblood-sap-lash', 'Lifeblood Sap Lash', 'Grass', 'physical', 60, 95, 'Master sap lash — heals user heavily.', [
    { type: 'heal', percent: 0.16 },
  ]),
  dmg('overgrowth-wild-lash', 'Overgrowth Wild Lash', 'Grass', 'physical', 66, 95, 'Master wild lash — poison and bind storm.', [
    { type: 'applyStatus', status: 'poison', chance: 30 },
    { type: 'applyStatus', status: 'bind', chance: 25 },
  ]),
  // Rank 10 — Electric line
  dmg('storm-bolt-lance', 'Storm Bolt Lance', 'Electric', 'special', 80, 100, 'Master lightning lance.'),
  dmg('eternal-paralyze-bolt', 'Eternal Paralyze Bolt', 'Electric', 'special', 52, 100, 'Master paralyzing bolt.', [
    { type: 'applyStatus', status: 'paralyze', chance: 50 },
  ]),
  dmg('overcharge-jolt', 'Overcharge Jolt', 'Electric', 'special', 56, 100, 'Master charge jolt — speed surge.', [
    { type: 'statBuff', stat: 'spd', stages: 2, target: 'self' },
  ]),
  dmg('tempest-chain-jolt', 'Tempest Chain Jolt', 'Electric', 'special', 64, 100, 'Master chain jolt.', [
    { type: 'applyStatus', status: 'paralyze', chance: 35 },
  ]),
  // Rank 10 — Ground line
  dmg('colossal-boulder-ram', 'Colossal Boulder Ram', 'Ground', 'physical', 78, 95, 'Master stone ram.'),
  dmg('ruinous-stun-nudge', 'Ruinous Stun Nudge', 'Ground', 'physical', 52, 95, 'Master stunning impact.', [
    { type: 'applyStatus', status: 'paralyze', chance: 40 },
  ]),
  dmg('fortress-stone-ward', 'Fortress Stone Ward', 'Ground', 'physical', 54, 100, 'Master stone ward — DEF surge.', [
    { type: 'statBuff', stat: 'def', stages: 2, target: 'self' },
  ]),
  dmg('cataclysm-quake-nudge', 'Cataclysm Quake Nudge', 'Ground', 'physical', 62, 95, 'Master quake — armor shatter.', [
    { type: 'statDebuff', stat: 'def', stages: 2 },
  ]),
]

export const ABILITIES: Record<string, Ability> = Object.fromEntries(
  ABILITY_LIST.map((a) => [a.id, a]),
)

const RUNTIME_ABILITIES: Record<string, AbilityDefinition> = {}

/** Register dynamically generated transformed abilities (fallback transforms). */
export function registerRuntimeAbility(ability: AbilityDefinition): void {
  RUNTIME_ABILITIES[ability.id] = ability
}

export const STARTER_ABILITY_IDS: Record<ElementType, string> = {
  Fire: 'spark-ember',
  Water: 'bubble-hex',
  Grass: 'vine-lash',
  Electric: 'static-jolt',
  Ground: 'stone-nudge',
}

export function getRegisteredAbility(id: string): AbilityDefinition | undefined {
  return ABILITIES[id] ?? RUNTIME_ABILITIES[id]
}

export function getAbility(id: string): Ability {
  const found = getRegisteredAbility(id)
  if (found) return found
  return {
    id,
    name: sanitizeAbilityIdToDisplayName(id),
    type: 'Ground',
    category: 'physical' as AbilityCategory,
    target: 'enemy' as AbilityTarget,
    power: 30,
    accuracy: 100,
    description: 'Unknown ability.',
  }
}

export { getAbilityDisplayName, sanitizeAbilityIdToDisplayName } from '../utils/abilityDisplay'
