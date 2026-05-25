import type { ElementType } from './starters'
import type { Perk, PerkCategory, PerkRarity, StatModifiers } from './perks'

export type CreatureSpeciesKey =
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ground'
  | 'bristlebug'
  | 'ashling'
  | 'pebblemaw'
  | 'driftwisp'
  | 'voltimp'

const TYPE_FALLBACK: Record<ElementType, CreatureSpeciesKey> = {
  Fire: 'fire',
  Water: 'water',
  Grass: 'grass',
  Electric: 'electric',
  Ground: 'ground',
}

type PerkDraft = {
  slug: string
  name: string
  rarity: PerkRarity
  category: PerkCategory
  description: string
  effect: string
  statModifiers?: StatModifiers
  combatTag?: string
  weight?: number
  maxStacks?: number
  stackGroup?: string
  unique?: boolean
  secondaryEvolutionPath?: Perk['secondaryEvolutionPath']
}

const COMBAT_TAG_BY_SPECIES_PERK: Record<string, string> = {}

function sp(
  species: CreatureSpeciesKey,
  draft: PerkDraft,
): Perk {
  const perk: Perk = {
    id: `${species}-${draft.slug}`,
    name: draft.name,
    rarity: draft.rarity,
    category: draft.category,
    description: draft.description,
    effect: draft.effect,
    statModifiers: draft.statModifiers,
    weight: draft.weight,
    maxStacks: draft.maxStacks,
    stackGroup: draft.stackGroup,
    unique: draft.unique,
    secondaryEvolutionPath: draft.secondaryEvolutionPath,
  }
  if (draft.combatTag) {
    COMBAT_TAG_BY_SPECIES_PERK[perk.id] = draft.combatTag
  }
  return perk
}

const CINDEREX: Perk[] = [
  sp('fire', { slug: 'inner-furnace', name: 'Inner Furnace', rarity: 'rare', category: 'offense', description: 'Cinderex channels core heat into Fire moves.', effect: 'Fire abilities deal 10% bonus damage.', combatTag: 'fire_damage_bonus' }),
  sp('fire', { slug: 'claw-tempo', name: 'Claw Tempo', rarity: 'common', category: 'offense', description: 'Cinderex strikes with sharper, faster claws.', effect: '+5 ATK.', statModifiers: { atk: 5 } }),
  sp('fire', { slug: 'heat-sink', name: 'Heat Sink', rarity: 'common', category: 'defense', description: 'Cinderex vents excess heat to endure longer fights.', effect: '+15 max HP.', statModifiers: { maxHp: 15 } }),
  sp('fire', { slug: 'flash-ignition', name: 'Flash Ignition', rarity: 'rare', category: 'speed', description: 'Cinderex opens combat with a blazing rush.', effect: 'First ability each combat deals +8 bonus damage.', combatTag: 'first_strike' }),
  sp('fire', { slug: 'rekindle', name: 'Rekindle', rarity: 'common', category: 'utility', description: 'Cinderex steadies its flame after each win.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('fire', { slug: 'ember-drift', name: 'Ember Drift', rarity: 'common', category: 'speed', description: 'Cinderex weaves through heat shimmer.', effect: '+6 SPD.', statModifiers: { spd: 6 } }),
  sp('fire', { slug: 'ember-predator', name: 'Ember Predator', rarity: 'rare', category: 'offense', description: 'Cinderex hunts with blazing focus.', effect: '+8% damage vs foes above half HP.', combatTag: 'predator_instinct', weight: 12 }),
  sp('fire', { slug: 'flame-core', name: 'Flame Core', rarity: 'uncommon', category: 'offense', description: 'Core heat empowers Fire strikes.', effect: 'Fire damage +8%.', combatTag: 'ember_core', weight: 13 }),
  sp('fire', { slug: 'scorching-finisher', name: 'Scorching Finisher', rarity: 'rare', category: 'offense', description: 'Cinderex burns down wounded prey.', effect: '+12% damage vs foes below 35% HP.', combatTag: 'finisher', weight: 11 }),
  sp('fire', { slug: 'primal-ember', name: 'Primal Ember', rarity: 'epic', category: 'offense', description: 'Cinderex\'s flame yearns for a primal form.', effect: '+5% all damage. Also +1 Offense evolution path.', combatTag: 'primal_mutation', secondaryEvolutionPath: 'offense' }),
  sp('fire', { slug: 'ash-footwork', name: 'Ash Footwork', rarity: 'rare', category: 'speed', description: 'Cinderex sidesteps through ember clouds.', effect: '12% chance to completely dodge an enemy attack.', combatTag: 'evasive_reflex' }),
]

const AQUALIS: Perk[] = [
  sp('water', { slug: 'tidal-focus', name: 'Tidal Focus', rarity: 'rare', category: 'offense', description: 'Aqualis shapes water into punishing hex currents.', effect: 'Water abilities deal 10% bonus damage.', combatTag: 'water_damage_bonus' }),
  sp('water', { slug: 'shell-current', name: 'Shell Current', rarity: 'common', category: 'defense', description: 'Aqualis layers flowing water over its hide.', effect: '+5 DEF.', statModifiers: { def: 5 } }),
  sp('water', { slug: 'deep-lung', name: 'Deep Lung', rarity: 'common', category: 'defense', description: 'Aqualis holds pressure beneath the waves.', effect: '+15 max HP.', statModifiers: { maxHp: 15 } }),
  sp('water', { slug: 'mist-recovery', name: 'Mist Recovery', rarity: 'common', category: 'utility', description: 'Aqualis mists itself after victories.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('water', { slug: 'rest-tide', name: 'Rest Tide', rarity: 'common', category: 'utility', description: 'Aqualis draws calm from Rest nodes.', effect: 'Restore 20 HP when completing a Rest node.', combatTag: 'field_recovery' }),
  sp('water', { slug: 'hex-slow', name: 'Hex Slow', rarity: 'rare', category: 'utility', description: 'Aqualis leaves foes struggling in undertow.', effect: 'Status effects gain 15% increased potency.', combatTag: 'status_focus' }),
  sp('water', { slug: 'tidal-flow', name: 'Tidal Flow', rarity: 'uncommon', category: 'offense', description: 'Aqualis rides currents for harder Water hits.', effect: 'Water damage +8%.', combatTag: 'water_damage_bonus', weight: 12 }),
  sp('water', { slug: 'deep-current', name: 'Deep Current', rarity: 'rare', category: 'utility', description: 'Undertow strengthens control.', effect: '+8% debuff accuracy. Also +1 Utility path.', combatTag: 'utility_instinct', secondaryEvolutionPath: 'utility' }),
  sp('water', { slug: 'monolith-tide', name: 'Monolith Tide', rarity: 'rare', category: 'mastery', description: 'Aqualis resonates with Monolith currents.', effect: '+5% mastery XP. Also +1 Evolution path.', combatTag: 'monolith_resonance', secondaryEvolutionPath: 'evolution' }),
  sp('water', { slug: 'still-waters', name: 'Still Waters', rarity: 'rare', category: 'defense', description: 'Aqualis takes less damage while healthy.', effect: '10% damage reduction when HP is above half.', combatTag: 'thick_scales' }),
]

const FLORAMOSS: Perk[] = [
  sp('grass', { slug: 'root-sap', name: 'Root Sap', rarity: 'common', category: 'defense', description: 'Floramoss stores sap for long routes.', effect: '+15 max HP.', statModifiers: { maxHp: 15 } }),
  sp('grass', { slug: 'thorn-lash', name: 'Thorn Lash', rarity: 'common', category: 'offense', description: 'Floramoss lashes with hardened vines.', effect: '+5 ATK.', statModifiers: { atk: 5 } }),
  sp('grass', { slug: 'spore-weave', name: 'Spore Weave', rarity: 'rare', category: 'offense', description: 'Floramoss weaves toxic spores into Grass moves.', effect: 'Grass abilities deal 10% bonus damage.', combatTag: 'grass_damage_bonus' }),
  sp('grass', { slug: 'canopy-guard', name: 'Canopy Guard', rarity: 'common', category: 'defense', description: 'Floramoss raises a leaf barrier.', effect: '+5 SP.DEF.', statModifiers: { spDef: 5 } }),
  sp('grass', { slug: 'pollen-rest', name: 'Pollen Rest', rarity: 'common', category: 'utility', description: 'Floramoss releases restorative pollen after wins.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('grass', { slug: 'spore-shield', name: 'Spore Shield', rarity: 'uncommon', category: 'defense', description: 'Floramoss spores absorb blows.', effect: 'Reduce incoming damage by 6%.', combatTag: 'guarded_stance' }),
  sp('grass', { slug: 'thorn-pressure', name: 'Thorn Pressure', rarity: 'rare', category: 'offense', description: 'Thorns punish debuffed foes.', effect: 'Debuffed enemies take +6% damage from you.', combatTag: 'pressure_point' }),
  sp('grass', { slug: 'pollen-recovery', name: 'Pollen Recovery', rarity: 'common', category: 'utility', description: 'Pollen restores after buffs.', effect: 'Heal 2% max HP after using a buff.', combatTag: 'rooted_growth' }),
  sp('grass', { slug: 'overgrowth-path', name: 'Overgrowth Path', rarity: 'epic', category: 'utility', description: 'Floramoss blooms toward wild branches.', effect: '+8% debuff accuracy. Also +1 Evolution path.', combatTag: 'strange_catalyst', secondaryEvolutionPath: 'evolution' }),
  sp('grass', { slug: 'bind-instinct', name: 'Bind Instinct', rarity: 'rare', category: 'utility', description: 'Floramoss tightens status pressure on foes.', effect: 'Status effects gain 15% increased potency.', combatTag: 'status_focus' }),
  sp('grass', { slug: 'grove-patience', name: 'Grove Patience', rarity: 'common', category: 'utility', description: 'Floramoss recovers at Rest clearings.', effect: 'Restore 20 HP when completing a Rest node.', combatTag: 'field_recovery' }),
]

const VOLTARA: Perk[] = [
  sp('electric', { slug: 'static-core', name: 'Static Core', rarity: 'rare', category: 'offense', description: 'Voltara overcharges Electric strikes.', effect: 'Electric abilities deal 10% bonus damage.', combatTag: 'electric_damage_bonus' }),
  sp('electric', { slug: 'live-wire', name: 'Live Wire', rarity: 'common', category: 'speed', description: 'Voltara moves on nervous static.', effect: '+6 SPD.', statModifiers: { spd: 6 } }),
  sp('electric', { slug: 'arc-focus', name: 'Arc Focus', rarity: 'common', category: 'offense', description: 'Voltara channels voltage into special bursts.', effect: '+5 SP.ATK.', statModifiers: { spAtk: 5 } }),
  sp('electric', { slug: 'opening-jolt', name: 'Opening Jolt', rarity: 'rare', category: 'speed', description: 'Voltara leads with a crackling first hit.', effect: 'First ability each combat deals +8 bonus damage.', combatTag: 'first_strike' }),
  sp('electric', { slug: 'capacitor-heal', name: 'Capacitor Heal', rarity: 'common', category: 'utility', description: 'Voltara recycles charge after victories.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('electric', { slug: 'trickster-spark', name: 'Trickster Spark', rarity: 'uncommon', category: 'offense', description: 'Voltara sparks with extra crit chance.', effect: 'Electric +6% damage; +4% crit.', combatTag: 'static_charge' }),
  sp('electric', { slug: 'static-momentum', name: 'Static Momentum', rarity: 'rare', category: 'speed', description: 'Victory leaves static in your steps.', effect: '+5% SPD after winning combat.', combatTag: 'momentum_spd' }),
  sp('electric', { slug: 'chain-mischief', name: 'Chain Mischief', rarity: 'rare', category: 'offense', description: 'Chained shocks hit harder.', effect: 'Every third Electric hit deals +6% damage.', combatTag: 'battle_rhythm' }),
  sp('electric', { slug: 'storm-adapt', name: 'Storm Adapt', rarity: 'rare', category: 'defense', description: 'Voltara adapts toward many storm forms.', effect: '+3% max HP and +2% DEF/SPD. All paths +1.', combatTag: 'adaptive_core', secondaryEvolutionPath: 'evolution' }),
  sp('electric', { slug: 'shock-dodge', name: 'Shock Dodge', rarity: 'rare', category: 'speed', description: 'Voltara blinks through static afterimages.', effect: '12% chance to completely dodge an enemy attack.', combatTag: 'evasive_reflex' }),
  sp('electric', { slug: 'crit-surge', name: 'Crit Surge', rarity: 'common', category: 'offense', description: 'Voltara spikes voltage on lucky hits.', effect: '8% chance for attacks to deal 50% bonus damage.', combatTag: 'critical_spark' }),
]

const TERRADON: Perk[] = [
  sp('ground', { slug: 'bedrock-hide', name: 'Bedrock Hide', rarity: 'common', category: 'defense', description: 'Terradon\'s plates absorb route wear.', effect: '+15 max HP.', statModifiers: { maxHp: 15 } }),
  sp('ground', { slug: 'titan-plating', name: 'Titan Plating', rarity: 'common', category: 'defense', description: 'Terradon reinforces its shell.', effect: '+5 DEF.', statModifiers: { def: 5 } }),
  sp('ground', { slug: 'quake-weight', name: 'Quake Weight', rarity: 'rare', category: 'offense', description: 'Terradon puts mass behind Ground moves.', effect: 'Ground abilities deal 10% bonus damage.', combatTag: 'ground_damage_bonus' }),
  sp('ground', { slug: 'stone-reflect', name: 'Stone Reflect', rarity: 'rare', category: 'defense', description: 'Terradon shrugs off blows while healthy.', effect: '10% damage reduction when HP is above half.', combatTag: 'thick_scales' }),
  sp('ground', { slug: 'rumble-start', name: 'Rumble Start', rarity: 'rare', category: 'offense', description: 'Terradon opens with a crushing shove.', effect: 'Physical attacks ignore 5 of the target DEF.', combatTag: 'piercing_instinct' }),
  sp('ground', { slug: 'dust-recovery', name: 'Dust Recovery', rarity: 'common', category: 'utility', description: 'Terradon settles dust and steadies HP after wins.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('ground', { slug: 'cave-rest', name: 'Cave Rest', rarity: 'common', category: 'utility', description: 'Terradon beds down at Rest nodes.', effect: 'Restore 20 HP when completing a Rest node.', combatTag: 'field_recovery' }),
  sp('ground', { slug: 'stone-jaw', name: 'Stone Jaw', rarity: 'uncommon', category: 'offense', description: 'Terradon crushes with bedrock jaws.', effect: 'Physical abilities deal +10% damage.', combatTag: 'heavy_impact' }),
  sp('ground', { slug: 'bedrock-guard', name: 'Bedrock Guard', rarity: 'rare', category: 'defense', description: 'Bedrock plating absorbs blows.', effect: '+6% DEF; 4% less damage taken.', combatTag: 'stonewall' }),
  sp('ground', { slug: 'crystal-pulse', name: 'Crystal Pulse', rarity: 'uncommon', category: 'defense', description: 'Crystal veins restore each turn.', effect: 'Heal 3% max HP at end of turn.', combatTag: 'recovery_pulse' }),
  sp('ground', { slug: 'monolith-stone', name: 'Monolith Stone', rarity: 'rare', category: 'mastery', description: 'Terradon hears the Monolith in bedrock.', effect: '+5% mastery XP. Also +1 Evolution path.', combatTag: 'monolith_resonance', secondaryEvolutionPath: 'evolution' }),
]

const BRISTLEBUG: Perk[] = [
  sp('bristlebug', { slug: 'barbed-carapace', name: 'Barbed Carapace', rarity: 'common', category: 'defense', description: 'Bristlebug\'s bristles absorb impact.', effect: '+5 DEF.', statModifiers: { def: 5 } }),
  sp('bristlebug', { slug: 'venom-gland', name: 'Venom Gland', rarity: 'rare', category: 'offense', description: 'Bristlebug concentrates poison in its stinger.', effect: 'Grass abilities deal 10% bonus damage.', combatTag: 'grass_damage_bonus' }),
  sp('bristlebug', { slug: 'needle-rush', name: 'Needle Rush', rarity: 'common', category: 'speed', description: 'Bristlebug skitters between strikes.', effect: '+6 SPD.', statModifiers: { spd: 6 } }),
  sp('bristlebug', { slug: 'sting-focus', name: 'Sting Focus', rarity: 'rare', category: 'utility', description: 'Bristlebug applies nastier toxins.', effect: 'Status effects gain 15% increased potency.', combatTag: 'status_focus' }),
  sp('bristlebug', { slug: 'molt-recovery', name: 'Molt Recovery', rarity: 'common', category: 'utility', description: 'Bristlebug sheds stress after victories.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('bristlebug', { slug: 'hive-instinct', name: 'Hive Instinct', rarity: 'rare', category: 'defense', description: 'Bristlebug mutates toward stranger forms.', effect: '+3% max HP and +2% DEF/SPD. All paths +1.', combatTag: 'adaptive_core', secondaryEvolutionPath: 'evolution' }),
]

const ASHLING: Perk[] = [
  sp('ashling', { slug: 'cinder-fangs', name: 'Cinder Fangs', rarity: 'common', category: 'offense', description: 'Ashling bites with smoldering embers.', effect: '+5 ATK.', statModifiers: { atk: 5 } }),
  sp('ashling', { slug: 'ash-puff', name: 'Ash Puff', rarity: 'rare', category: 'speed', description: 'Ashling vanishes in a puff of ash.', effect: '12% chance to completely dodge an enemy attack.', combatTag: 'evasive_reflex' }),
  sp('ashling', { slug: 'kindling-rush', name: 'Kindling Rush', rarity: 'rare', category: 'speed', description: 'Ashling opens with a hot snap.', effect: 'First ability each combat deals +8 bonus damage.', combatTag: 'first_strike' }),
  sp('ashling', { slug: 'warm-coals', name: 'Warm Coals', rarity: 'common', category: 'utility', description: 'Ashling glows brighter after each win.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('ashling', { slug: 'fire-spark', name: 'Fire Spark', rarity: 'rare', category: 'offense', description: 'Ashling\'s flames bite a little harder.', effect: 'Fire abilities deal 10% bonus damage.', combatTag: 'fire_damage_bonus' }),
  sp('ashling', { slug: 'flare-mutation', name: 'Flare Mutation', rarity: 'epic', category: 'offense', description: 'Ashling\'s flame twists toward primal paths.', effect: '+5% all damage. Also +1 Offense path.', combatTag: 'primal_mutation', secondaryEvolutionPath: 'offense' }),
]

const PEBBLEMAW: Perk[] = [
  sp('pebblemaw', { slug: 'gravel-jaw', name: 'Gravel Jaw', rarity: 'common', category: 'offense', description: 'Pebblemaw crunches stone between strikes.', effect: '+5 ATK.', statModifiers: { atk: 5 } }),
  sp('pebblemaw', { slug: 'packed-hide', name: 'Packed Hide', rarity: 'common', category: 'defense', description: 'Pebblemaw compacts gravel into armor.', effect: '+15 max HP.', statModifiers: { maxHp: 15 } }),
  sp('pebblemaw', { slug: 'rock-slide', name: 'Rock Slide', rarity: 'rare', category: 'offense', description: 'Pebblemaw shoves with landslide force.', effect: 'Ground abilities deal 10% bonus damage.', combatTag: 'ground_damage_bonus' }),
  sp('pebblemaw', { slug: 'shoulder-barge', name: 'Shoulder Barge', rarity: 'rare', category: 'offense', description: 'Pebblemaw ignores armor with raw mass.', effect: 'Physical attacks ignore 5 of the target DEF.', combatTag: 'piercing_instinct' }),
  sp('pebblemaw', { slug: 'dust-nap', name: 'Dust Nap', rarity: 'common', category: 'utility', description: 'Pebblemaw settles gravel dust after wins.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('pebblemaw', { slug: 'bedrock-sense', name: 'Bedrock Sense', rarity: 'rare', category: 'mastery', description: 'Pebblemaw senses deeper stone forms ahead.', effect: '+5% mastery XP. Also +1 Evolution path.', combatTag: 'monolith_resonance', secondaryEvolutionPath: 'evolution' }),
]

const DRIFTWISP: Perk[] = [
  sp('driftwisp', { slug: 'current-glide', name: 'Current Glide', rarity: 'common', category: 'speed', description: 'Driftwisp rides water currents in battle.', effect: '+6 SPD.', statModifiers: { spd: 6 } }),
  sp('driftwisp', { slug: 'hex-splash', name: 'Hex Splash', rarity: 'rare', category: 'offense', description: 'Driftwisp hexes water into sharper blows.', effect: 'Water abilities deal 10% bonus damage.', combatTag: 'water_damage_bonus' }),
  sp('driftwisp', { slug: 'foam-veil', name: 'Foam Veil', rarity: 'common', category: 'defense', description: 'Driftwisp wraps itself in foam.', effect: '+5 SP.DEF.', statModifiers: { spDef: 5 } }),
  sp('driftwisp', { slug: 'mist-heal', name: 'Mist Heal', rarity: 'common', category: 'utility', description: 'Driftwisp condenses mist after victories.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('driftwisp', { slug: 'undertow', name: 'Undertow', rarity: 'rare', category: 'utility', description: 'Driftwisp\'s hexes linger on foes.', effect: 'Status effects gain 15% increased potency.', combatTag: 'status_focus' }),
  sp('driftwisp', { slug: 'deep-current', name: 'Deep Current', rarity: 'rare', category: 'defense', description: 'Driftwisp adapts toward many tide forms.', effect: '+3% max HP and +2% DEF/SPD. All paths +1.', combatTag: 'adaptive_core', secondaryEvolutionPath: 'evolution' }),
]

const VOLTIMP: Perk[] = [
  sp('voltimp', { slug: 'capacitor-spark', name: 'Capacitor Spark', rarity: 'common', category: 'offense', description: 'Voltimp stores charge for special bursts.', effect: '+5 SP.ATK.', statModifiers: { spAtk: 5 } }),
  sp('voltimp', { slug: 'imp-dash', name: 'Imp Dash', rarity: 'common', category: 'speed', description: 'Voltimp darts on tiny lightning steps.', effect: '+6 SPD.', statModifiers: { spd: 6 } }),
  sp('voltimp', { slug: 'overload-bite', name: 'Overload Bite', rarity: 'rare', category: 'offense', description: 'Voltimp overloads Electric attacks.', effect: 'Electric abilities deal 10% bonus damage.', combatTag: 'electric_damage_bonus' }),
  sp('voltimp', { slug: 'static-slip', name: 'Static Slip', rarity: 'rare', category: 'speed', description: 'Voltimp slips away on static discharge.', effect: '12% chance to completely dodge an enemy attack.', combatTag: 'evasive_reflex' }),
  sp('voltimp', { slug: 'recharge', name: 'Recharge', rarity: 'common', category: 'utility', description: 'Voltimp recharges after each win.', effect: 'Restore 8 HP after winning combat.', combatTag: 'second_wind' }),
  sp('voltimp', { slug: 'storm-seed', name: 'Storm Seed', rarity: 'epic', category: 'utility', description: 'Voltimp\'s charge unlocks unusual evolutions.', effect: '+8% debuff accuracy. Also +1 Evolution path.', combatTag: 'strange_catalyst', secondaryEvolutionPath: 'evolution' }),
]

export const CREATURE_PERK_POOLS: Record<CreatureSpeciesKey, Perk[]> = {
  fire: CINDEREX,
  water: AQUALIS,
  grass: FLORAMOSS,
  electric: VOLTARA,
  ground: TERRADON,
  bristlebug: BRISTLEBUG,
  ashling: ASHLING,
  pebblemaw: PEBBLEMAW,
  driftwisp: DRIFTWISP,
  voltimp: VOLTIMP,
}

export const CREATURE_PERKS: Record<string, Perk> = Object.fromEntries(
  Object.values(CREATURE_PERK_POOLS)
    .flat()
    .map((p) => [p.id, p]),
)

/** Legacy generic perks — kept for older saves only. */
export const LEGACY_PERKS: Record<string, Perk> = {}

const LEGACY_COMBAT_TAGS: Record<string, string> = {
  'ember-blood': 'fire_damage_bonus',
  'first-strike': 'first_strike',
  'second-wind': 'second_wind',
  'field-recovery': 'field_recovery',
  'piercing-instinct': 'piercing_instinct',
  'thick-scales': 'thick_scales',
  'guarded-stance': 'guarded_stance',
  'critical-spark': 'critical_spark',
  'evasive-reflex': 'evasive_reflex',
  'status-focus': 'status_focus',
  'primal-mutation': 'primal_mutation',
  'adaptive-core': 'adaptive_core',
  'strange-catalyst': 'strange_catalyst',
  'monolith-resonance': 'monolith_resonance',
}

export function getPerkCombatTag(perkId: string): string | undefined {
  return COMBAT_TAG_BY_SPECIES_PERK[perkId] ?? LEGACY_COMBAT_TAGS[perkId]
}

export function creatureHasCombatTag(
  selectedPerks: string[],
  tag: string,
): boolean {
  return selectedPerks.some((id) => getPerkCombatTag(id) === tag)
}

export function normalizeTemplateId(templateId: string): string {
  return templateId.replace(/^alpha-/, '')
}

export function resolveCreatureSpeciesKey(input: {
  starterTypeId?: string
  templateId?: string
  type: ElementType
}): CreatureSpeciesKey {
  if (input.starterTypeId && input.starterTypeId in CREATURE_PERK_POOLS) {
    return input.starterTypeId as CreatureSpeciesKey
  }
  if (input.templateId) {
    const base = normalizeTemplateId(input.templateId)
    if (base in CREATURE_PERK_POOLS) {
      return base as CreatureSpeciesKey
    }
  }
  return TYPE_FALLBACK[input.type]
}

export {
  pickPerksForCreature,
  inferCreatureRole,
  getPerkStackLabel,
} from '../utils/perkSelection'
export type { PickPerkContext } from '../utils/perkSelection'
