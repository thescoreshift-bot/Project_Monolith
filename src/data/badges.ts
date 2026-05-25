import type { ElementType } from './starters'

export type BadgeStatModifiers = {
  atk?: number
  def?: number
  spAtk?: number
  spDef?: number
  spd?: number
  maxHp?: number
}

export type BadgeDamageModifiers = Partial<Record<ElementType, number>>

export type Badge = {
  id: string
  name: string
  /** Region id from regions.ts */
  regionId: string
  gymNumber: number
  description: string
  statModifiers: BadgeStatModifiers
  damageModifiers: BadgeDamageModifiers
  specialEffectText: string
  affects: string
  damageBonusTypes?: ElementType[]
  allDamageBonusPercent?: number
  postVictoryHeal?: number
}

const AFFECTS = 'All current and future party creatures.'

/** Verdant Circuit — grass / water / balanced */
export const REGION_VERDANT_BADGES: Badge[] = [
  {
    id: 'ember-badge',
    name: 'Ember Badge',
    regionId: 'verdant-circuit',
    gymNumber: 1,
    description: 'First gym of the Verdant Circuit.',
    statModifiers: { atk: 3 },
    damageModifiers: { Fire: 0.05 },
    specialEffectText: 'Fire damage +5%.',
    affects: AFFECTS,
  },
  {
    id: 'tide-badge',
    name: 'Tide Badge',
    regionId: 'verdant-circuit',
    gymNumber: 2,
    description: 'Coastal currents of the circuit.',
    statModifiers: {},
    damageModifiers: { Water: 0.05 },
    postVictoryHeal: 5,
    specialEffectText: 'Water +5%. Party heals 5 HP after each victory.',
    affects: AFFECTS,
  },
  {
    id: 'bloom-badge',
    name: 'Bloom Badge',
    regionId: 'verdant-circuit',
    gymNumber: 3,
    description: 'Bloom Gym resilience.',
    statModifiers: { maxHp: 5 },
    damageModifiers: { Grass: 0.05 },
    specialEffectText: 'Grass +5%. Max HP +5.',
    affects: AFFECTS,
  },
  {
    id: 'volt-badge',
    name: 'Volt Badge',
    regionId: 'verdant-circuit',
    gymNumber: 4,
    description: 'Quick strikes from the Volt Gym.',
    statModifiers: { spd: 3 },
    damageModifiers: { Electric: 0.05 },
    specialEffectText: 'Electric +5%. SPD +3.',
    affects: AFFECTS,
  },
  {
    id: 'stone-badge',
    name: 'Stone Badge',
    regionId: 'verdant-circuit',
    gymNumber: 5,
    description: 'Bedrock training grounds.',
    statModifiers: { def: 3 },
    damageModifiers: { Ground: 0.05 },
    specialEffectText: 'Ground +5%. DEF +3.',
    affects: AFFECTS,
  },
  {
    id: 'venom-badge',
    name: 'Venom Badge',
    regionId: 'verdant-circuit',
    gymNumber: 6,
    description: 'Toxic precision.',
    statModifiers: { spAtk: 3 },
    damageModifiers: { Grass: 0.03 },
    specialEffectText: 'SP.ATK +3. Grass +3%.',
    affects: AFFECTS,
  },
  {
    id: 'spirit-badge',
    name: 'Spirit Badge',
    regionId: 'verdant-circuit',
    gymNumber: 7,
    description: 'Ethereal focus.',
    statModifiers: { spDef: 3 },
    damageModifiers: { Water: 0.03 },
    specialEffectText: 'SP.DEF +3. Water +3%.',
    affects: AFFECTS,
  },
  {
    id: 'apex-badge',
    name: 'Apex Badge',
    regionId: 'verdant-circuit',
    gymNumber: 8,
    description: 'Crown badge of Verdant Circuit.',
    statModifiers: { maxHp: 5 },
    damageModifiers: {},
    allDamageBonusPercent: 5,
    specialEffectText: 'All damage +5%. Max HP +5.',
    affects: AFFECTS,
  },
]

/** Ember Coast — fire / ground */
export const REGION_EMBER_BADGES: Badge[] = [
  {
    id: 'coast-cinder-badge',
    name: 'Cinder Badge',
    regionId: 'ember-coast',
    gymNumber: 1,
    description: 'Scorched shores gym.',
    statModifiers: { atk: 4 },
    damageModifiers: { Fire: 0.06 },
    specialEffectText: 'Fire +6%. ATK +4.',
    affects: AFFECTS,
  },
  {
    id: 'coast-magma-badge',
    name: 'Magma Badge',
    regionId: 'ember-coast',
    gymNumber: 2,
    description: 'Volcanic flow discipline.',
    statModifiers: { spAtk: 4 },
    damageModifiers: { Fire: 0.04, Ground: 0.04 },
    specialEffectText: 'Fire & Ground +4%. SP.ATK +4.',
    affects: AFFECTS,
  },
  {
    id: 'coast-dune-badge',
    name: 'Dune Badge',
    regionId: 'ember-coast',
    gymNumber: 3,
    description: 'Ash-waste endurance.',
    statModifiers: { def: 4, maxHp: 4 },
    damageModifiers: { Ground: 0.05 },
    specialEffectText: 'Ground +5%. DEF +4. Max HP +4.',
    affects: AFFECTS,
  },
  {
    id: 'coast-ash-badge',
    name: 'Ash Badge',
    regionId: 'ember-coast',
    gymNumber: 4,
    description: 'Smoldering reflex gym.',
    statModifiers: { spd: 4 },
    damageModifiers: { Fire: 0.05 },
    postVictoryHeal: 4,
    specialEffectText: 'Fire +5%. SPD +4. +4 HP after victory.',
    affects: AFFECTS,
  },
  {
    id: 'coast-blaze-badge',
    name: 'Blaze Badge',
    regionId: 'ember-coast',
    gymNumber: 5,
    description: 'Inferno lane champions.',
    statModifiers: { atk: 3, spAtk: 3 },
    damageModifiers: { Fire: 0.07 },
    specialEffectText: 'Fire +7%. ATK & SP.ATK +3.',
    affects: AFFECTS,
  },
  {
    id: 'coast-scorch-badge',
    name: 'Scorch Badge',
    regionId: 'ember-coast',
    gymNumber: 6,
    description: 'Heat-hardened guard.',
    statModifiers: { def: 5 },
    damageModifiers: { Fire: 0.03 },
    specialEffectText: 'DEF +5. Fire +3%.',
    affects: AFFECTS,
  },
  {
    id: 'coast-furnace-badge',
    name: 'Furnace Badge',
    regionId: 'ember-coast',
    gymNumber: 7,
    description: 'Kiln-spire mastery.',
    statModifiers: { spAtk: 5 },
    damageModifiers: { Fire: 0.05, Electric: 0.02 },
    specialEffectText: 'SP.ATK +5. Fire +5%.',
    affects: AFFECTS,
  },
  {
    id: 'coast-inferno-badge',
    name: 'Inferno Badge',
    regionId: 'ember-coast',
    gymNumber: 8,
    description: 'Ember Coast crown gym.',
    statModifiers: { atk: 4 },
    damageModifiers: { Fire: 0.05, Ground: 0.05 },
    allDamageBonusPercent: 4,
    specialEffectText: 'Fire & Ground +5%. All damage +4%.',
    affects: AFFECTS,
  },
]

/** Storm Plateau — electric / speed */
export const REGION_STORM_BADGES: Badge[] = [
  {
    id: 'storm-gale-badge',
    name: 'Gale Badge',
    regionId: 'storm-plateau',
    gymNumber: 1,
    description: 'Wind-shear training.',
    statModifiers: { spd: 4 },
    damageModifiers: { Electric: 0.05 },
    specialEffectText: 'Electric +5%. SPD +4.',
    affects: AFFECTS,
  },
  {
    id: 'storm-bolt-badge',
    name: 'Bolt Badge',
    regionId: 'storm-plateau',
    gymNumber: 2,
    description: 'Plateau lightning gym.',
    statModifiers: { spAtk: 4 },
    damageModifiers: { Electric: 0.06 },
    specialEffectText: 'Electric +6%. SP.ATK +4.',
    affects: AFFECTS,
  },
  {
    id: 'storm-cliff-badge',
    name: 'Cliff Badge',
    regionId: 'storm-plateau',
    gymNumber: 3,
    description: 'Highland stone guard.',
    statModifiers: { def: 4 },
    damageModifiers: { Ground: 0.05, Electric: 0.03 },
    specialEffectText: 'Ground +5%. Electric +3%. DEF +4.',
    affects: AFFECTS,
  },
  {
    id: 'storm-surge-badge',
    name: 'Surge Badge',
    regionId: 'storm-plateau',
    gymNumber: 4,
    description: 'Overcharge circuit.',
    statModifiers: { atk: 4 },
    damageModifiers: { Electric: 0.05 },
    postVictoryHeal: 6,
    specialEffectText: 'Electric +5%. ATK +4. +6 HP after victory.',
    affects: AFFECTS,
  },
  {
    id: 'storm-ion-badge',
    name: 'Ion Badge',
    regionId: 'storm-plateau',
    gymNumber: 5,
    description: 'Static field mastery.',
    statModifiers: { spDef: 4 },
    damageModifiers: { Electric: 0.04 },
    specialEffectText: 'SP.DEF +4. Electric +4%.',
    affects: AFFECTS,
  },
  {
    id: 'storm-tempest-badge',
    name: 'Tempest Badge',
    regionId: 'storm-plateau',
    gymNumber: 6,
    description: 'Storm wall tactics.',
    statModifiers: { def: 3, spDef: 3 },
    damageModifiers: { Electric: 0.05 },
    specialEffectText: 'DEF & SP.DEF +3. Electric +5%.',
    affects: AFFECTS,
  },
  {
    id: 'storm-zenith-badge',
    name: 'Zenith Badge',
    regionId: 'storm-plateau',
    gymNumber: 7,
    description: 'Peak voltage gym.',
    statModifiers: { spd: 3, spAtk: 3 },
    damageModifiers: { Electric: 0.06 },
    specialEffectText: 'SPD & SP.ATK +3. Electric +6%.',
    affects: AFFECTS,
  },
  {
    id: 'storm-crown-badge',
    name: 'Storm Crown Badge',
    regionId: 'storm-plateau',
    gymNumber: 8,
    description: 'Storm Plateau crown.',
    statModifiers: { spd: 4 },
    damageModifiers: { Electric: 0.05 },
    allDamageBonusPercent: 6,
    specialEffectText: 'Electric +5%. All damage +6%. SPD +4.',
    affects: AFFECTS,
  },
]

/** Obsidian Crown — ground / fire / elite pressure */
export const REGION_OBSIDIAN_BADGES: Badge[] = [
  {
    id: 'obsidian-rift-badge',
    name: 'Rift Badge',
    regionId: 'obsidian-crown',
    gymNumber: 1,
    description: 'Obsidian fracture gym.',
    statModifiers: { atk: 5 },
    damageModifiers: { Ground: 0.05 },
    specialEffectText: 'Ground +5%. ATK +5.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-ember-badge',
    name: 'Obsidian Ember Badge',
    regionId: 'obsidian-crown',
    gymNumber: 2,
    description: 'Volcanic glass discipline.',
    statModifiers: { spAtk: 5 },
    damageModifiers: { Fire: 0.06 },
    specialEffectText: 'Fire +6%. SP.ATK +5.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-ward-badge',
    name: 'Ward Badge',
    regionId: 'obsidian-crown',
    gymNumber: 3,
    description: 'Crown bastion training.',
    statModifiers: { def: 5, maxHp: 6 },
    damageModifiers: { Ground: 0.06 },
    specialEffectText: 'Ground +6%. DEF +5. Max HP +6.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-pulse-badge',
    name: 'Pulse Badge',
    regionId: 'obsidian-crown',
    gymNumber: 4,
    description: 'Monolith pulse gym.',
    statModifiers: { spAtk: 4, spDef: 4 },
    damageModifiers: { Electric: 0.05 },
    specialEffectText: 'Electric +5%. SP.ATK & SP.DEF +4.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-shard-badge',
    name: 'Shard Badge',
    regionId: 'obsidian-crown',
    gymNumber: 5,
    description: 'Glass-edge offense.',
    statModifiers: { atk: 4, spd: 3 },
    damageModifiers: { Fire: 0.04, Ground: 0.04 },
    specialEffectText: 'Fire & Ground +4%. ATK +4. SPD +3.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-void-badge',
    name: 'Void Badge',
    regionId: 'obsidian-crown',
    gymNumber: 6,
    description: 'Ash-void resilience.',
    statModifiers: { spDef: 5 },
    damageModifiers: { Ground: 0.04 },
    postVictoryHeal: 8,
    specialEffectText: 'SP.DEF +5. Ground +4%. +8 HP after victory.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-throne-badge',
    name: 'Throne Badge',
    regionId: 'obsidian-crown',
    gymNumber: 7,
    description: 'High court of the crown.',
    statModifiers: { maxHp: 8, def: 4 },
    damageModifiers: { Fire: 0.05, Ground: 0.05 },
    specialEffectText: 'Fire & Ground +5%. Max HP +8. DEF +4.',
    affects: AFFECTS,
  },
  {
    id: 'obsidian-crown-badge',
    name: 'Crown Badge',
    regionId: 'obsidian-crown',
    gymNumber: 8,
    description: 'Obsidian Crown supreme badge.',
    statModifiers: { atk: 4, def: 4 },
    damageModifiers: { Ground: 0.05 },
    allDamageBonusPercent: 8,
    specialEffectText: 'Ground +5%. All damage +8%. ATK & DEF +4.',
    affects: AFFECTS,
  },
]

export const BADGES_BY_REGION: Record<string, Badge[]> = {
  'verdant-circuit': REGION_VERDANT_BADGES,
  'ember-coast': REGION_EMBER_BADGES,
  'storm-plateau': REGION_STORM_BADGES,
  'obsidian-crown': REGION_OBSIDIAN_BADGES,
}

export const ALL_REGION_BADGES: Badge[] = [
  ...REGION_VERDANT_BADGES,
  ...REGION_EMBER_BADGES,
  ...REGION_STORM_BADGES,
  ...REGION_OBSIDIAN_BADGES,
]

export const BADGES_BY_ID: Record<string, Badge> = Object.fromEntries(
  ALL_REGION_BADGES.map((b) => [b.id, b]),
)

/** @deprecated Use getBadgesForRegionId */
export const REGION_1_BADGES = REGION_VERDANT_BADGES

export const BADGES_IN_REGION = 8

export function getBadgesForRegionId(regionId: string): Badge[] {
  return BADGES_BY_REGION[regionId] ?? []
}

export function getBadge(id: string): Badge | undefined {
  return BADGES_BY_ID[id]
}

export function formatBadgeStatModifiers(mod: BadgeStatModifiers): string[] {
  const lines: string[] = []
  if (mod.atk) lines.push(`ATK +${mod.atk}`)
  if (mod.def) lines.push(`DEF +${mod.def}`)
  if (mod.spAtk) lines.push(`SP.ATK +${mod.spAtk}`)
  if (mod.spDef) lines.push(`SP.DEF +${mod.spDef}`)
  if (mod.spd) lines.push(`SPD +${mod.spd}`)
  if (mod.maxHp) lines.push(`Max HP +${mod.maxHp}`)
  return lines
}

export function formatBadgeDamageModifiers(
  mod: BadgeDamageModifiers,
  allPercent?: number,
): string[] {
  const lines = Object.entries(mod).map(
    ([type, pct]) => `${type} damage +${Math.round(pct * 100)}%`,
  )
  if (allPercent) lines.push(`All damage +${allPercent}%`)
  return lines
}
