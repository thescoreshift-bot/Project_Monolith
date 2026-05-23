export type AbilityPerkKind = 'passive' | 'reactive'

export type AbilityUpgradeEffectType =
  | 'bonusDamagePercent'
  | 'bonusAccuracy'
  | 'bonusCritChance'
  | 'bonusStatusChance'
  | 'flatDamage'

export type AbilityUpgrade = {
  id: string
  abilityId: string
  name: string
  kind?: AbilityPerkKind
  rankRequired: 1 | 2 | 3 | 4
  description: string
  effectType: AbilityUpgradeEffectType
  effectValue: number
}

const COMMON_ABILITY_PERKS: AbilityUpgrade[] = [
  {
    id: 'common-passive-might',
    abilityId: 'common',
    name: 'Battle Hardening',
    kind: 'passive',
    rankRequired: 1,
    description: 'Passive — hardened strikes deal more damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 6,
  },
  {
    id: 'common-reactive-focus',
    abilityId: 'common',
    name: 'Combat Focus',
    kind: 'reactive',
    rankRequired: 1,
    description: 'Reactive — sharpen aim when the ability fires.',
    effectType: 'bonusAccuracy',
    effectValue: 6,
  },
  {
    id: 'common-passive-edge',
    abilityId: 'common',
    name: 'Razor Edge',
    kind: 'passive',
    rankRequired: 2,
    description: 'Passive — improved critical chance.',
    effectType: 'bonusCritChance',
    effectValue: 8,
  },
  {
    id: 'common-reactive-burst',
    abilityId: 'common',
    name: 'Power Burst',
    kind: 'reactive',
    rankRequired: 2,
    description: 'Reactive — burst of power on use.',
    effectType: 'flatDamage',
    effectValue: 3,
  },
  {
    id: 'common-passive-ward',
    abilityId: 'common',
    name: 'Status Ward',
    kind: 'passive',
    rankRequired: 3,
    description: 'Passive — status chance +10% (status system planned).',
    effectType: 'bonusStatusChance',
    effectValue: 10,
  },
  {
    id: 'common-reactive-surge',
    abilityId: 'common',
    name: 'Momentum Surge',
    kind: 'reactive',
    rankRequired: 3,
    description: 'Reactive — +8% damage after each use.',
    effectType: 'bonusDamagePercent',
    effectValue: 8,
  },
]

export const ABILITY_UPGRADES: AbilityUpgrade[] = [
  ...COMMON_ABILITY_PERKS,
  // Spark Ember
  {
    id: 'spark-novice-passive',
    abilityId: 'spark-ember',
    name: 'Ember Heart',
    kind: 'passive',
    rankRequired: 1,
    description: 'Passive — embers burn hotter (+6% damage).',
    effectType: 'bonusDamagePercent',
    effectValue: 6,
  },
  {
    id: 'spark-novice-reactive',
    abilityId: 'spark-ember',
    name: 'Quick Spark',
    kind: 'reactive',
    rankRequired: 1,
    description: 'Reactive — faster aim (+6 accuracy).',
    effectType: 'bonusAccuracy',
    effectValue: 6,
  },
  {
    id: 'spark-novice-reactive2',
    abilityId: 'spark-ember',
    name: 'Hot Trail',
    kind: 'reactive',
    rankRequired: 1,
    description: 'Reactive — +2 flat damage on impact.',
    effectType: 'flatDamage',
    effectValue: 2,
  },
  {
    id: 'spark-burning',
    abilityId: 'spark-ember',
    name: 'Burning Spark',
    kind: 'passive',
    rankRequired: 2,
    description: 'Embers linger — burn chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'spark-focused',
    abilityId: 'spark-ember',
    name: 'Focused Ember',
    kind: 'reactive',
    rankRequired: 2,
    description: 'Tighter aim — crit chance +10%.',
    effectType: 'bonusCritChance',
    effectValue: 10,
  },
  {
    id: 'spark-expert-passive',
    abilityId: 'spark-ember',
    name: 'Wildfire',
    kind: 'passive',
    rankRequired: 3,
    description: 'Passive — +10% damage as mastery deepens.',
    effectType: 'bonusDamagePercent',
    effectValue: 10,
  },
  {
    id: 'spark-expert-reactive',
    abilityId: 'spark-ember',
    name: 'Flash Burn',
    kind: 'reactive',
    rankRequired: 3,
    description: 'Reactive — +12% crit chance.',
    effectType: 'bonusCritChance',
    effectValue: 12,
  },
  {
    id: 'spark-expert-reactive2',
    abilityId: 'spark-ember',
    name: 'Ash Burst',
    kind: 'reactive',
    rankRequired: 3,
    description: 'Reactive — +3 flat damage.',
    effectType: 'flatDamage',
    effectValue: 3,
  },
  {
    id: 'spark-inferno',
    abilityId: 'spark-ember',
    name: 'Inferno Spark',
    kind: 'passive',
    rankRequired: 4,
    description: 'Blazing finish — +12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'spark-pierce',
    abilityId: 'spark-ember',
    name: 'Piercing Ember',
    kind: 'reactive',
    rankRequired: 4,
    description: 'Cuts defenses — +5 flat damage.',
    effectType: 'flatDamage',
    effectValue: 5,
  },
  // Bubble Hex
  {
    id: 'bubble-soak',
    abilityId: 'bubble-hex',
    name: 'Soaking Hex',
    kind: 'passive',
    rankRequired: 2,
    description: 'Saturated bubbles — slow chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'bubble-aim',
    abilityId: 'bubble-hex',
    name: 'Aimed Hex',
    kind: 'reactive',
    rankRequired: 2,
    description: 'Steady stream — +8 accuracy.',
    effectType: 'bonusAccuracy',
    effectValue: 8,
  },
  {
    id: 'bubble-crash',
    abilityId: 'bubble-hex',
    name: 'Crash Hex',
    kind: 'passive',
    rankRequired: 4,
    description: 'Heavier impact — +12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'bubble-surge',
    abilityId: 'bubble-hex',
    name: 'Surge Hex',
    kind: 'reactive',
    rankRequired: 4,
    description: 'Pressurized burst — +4 flat damage.',
    effectType: 'flatDamage',
    effectValue: 4,
  },
  // Vine Lash
  {
    id: 'vine-thorns',
    abilityId: 'vine-lash',
    name: 'Thorned Lash',
    rankRequired: 2,
    description: 'Barbed vines — bleed chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'vine-crit',
    abilityId: 'vine-lash',
    name: 'Razor Lash',
    rankRequired: 2,
    description: 'Critical lash — crit chance +10%.',
    effectType: 'bonusCritChance',
    effectValue: 10,
  },
  {
    id: 'vine-might',
    abilityId: 'vine-lash',
    name: 'Mighty Lash',
    rankRequired: 4,
    description: 'Overgrowth — +12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'vine-reach',
    abilityId: 'vine-lash',
    name: 'Long Lash',
    rankRequired: 4,
    description: 'Extended whip — +5 flat damage.',
    effectType: 'flatDamage',
    effectValue: 5,
  },
  // Static Jolt
  {
    id: 'jolt-paralyze',
    abilityId: 'static-jolt',
    name: 'Paralyzing Jolt',
    rankRequired: 2,
    description: 'Static buildup — paralyze chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'jolt-focus',
    abilityId: 'static-jolt',
    name: 'Focused Jolt',
    rankRequired: 2,
    description: 'Precise discharge — +8 accuracy.',
    effectType: 'bonusAccuracy',
    effectValue: 8,
  },
  {
    id: 'jolt-overload',
    abilityId: 'static-jolt',
    name: 'Overload Jolt',
    rankRequired: 4,
    description: 'Surge damage — +12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'jolt-bolt',
    abilityId: 'static-jolt',
    name: 'Bolt Jolt',
    rankRequired: 4,
    description: 'Extra voltage — +4 flat damage.',
    effectType: 'flatDamage',
    effectValue: 4,
  },
  // Stone Nudge
  {
    id: 'stone-stagger',
    abilityId: 'stone-nudge',
    name: 'Staggering Nudge',
    rankRequired: 2,
    description: 'Off-balance foe — flinch chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'stone-brace',
    abilityId: 'stone-nudge',
    name: 'Braced Nudge',
    rankRequired: 2,
    description: 'Solid footing — +8 accuracy.',
    effectType: 'bonusAccuracy',
    effectValue: 8,
  },
  {
    id: 'stone-quake',
    abilityId: 'stone-nudge',
    name: 'Quake Nudge',
    rankRequired: 4,
    description: 'Heavier slam — +12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'stone-weight',
    abilityId: 'stone-nudge',
    name: 'Weighted Nudge',
    rankRequired: 4,
    description: 'Dense impact — +5 flat damage.',
    effectType: 'flatDamage',
    effectValue: 5,
  },
  // Tackle
  {
    id: 'tackle-momentum',
    abilityId: 'tackle',
    name: 'Momentum',
    rankRequired: 2,
    description: 'Running start — +8% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 8,
  },
  {
    id: 'tackle-aim',
    abilityId: 'tackle',
    name: 'Steady Tackle',
    rankRequired: 2,
    description: 'Reliable hit — +6 accuracy.',
    effectType: 'bonusAccuracy',
    effectValue: 6,
  },
  {
    id: 'tackle-crash',
    abilityId: 'tackle',
    name: 'Crash Tackle',
    rankRequired: 4,
    description: 'Full body — +10% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 10,
  },
  {
    id: 'tackle-heavy',
    abilityId: 'tackle',
    name: 'Heavy Tackle',
    rankRequired: 4,
    description: 'Extra weight — +3 flat damage.',
    effectType: 'flatDamage',
    effectValue: 3,
  },
  // Sting
  {
    id: 'sting-venom',
    abilityId: 'sting',
    name: 'Venom Sting',
    rankRequired: 2,
    description: 'Toxic tip — poison chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'sting-crit',
    abilityId: 'sting',
    name: 'Critical Sting',
    rankRequired: 2,
    description: 'Weak point — crit chance +10%.',
    effectType: 'bonusCritChance',
    effectValue: 10,
  },
  {
    id: 'sting-drive',
    abilityId: 'sting',
    name: 'Driving Sting',
    rankRequired: 4,
    description: 'Deep pierce — +10% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 10,
  },
  {
    id: 'sting-sharp',
    abilityId: 'sting',
    name: 'Sharp Sting',
    rankRequired: 4,
    description: 'Barbed strike — +3 flat damage.',
    effectType: 'flatDamage',
    effectValue: 3,
  },
  // Cinder Bite
  {
    id: 'cinder-burn',
    abilityId: 'cinder-bite',
    name: 'Smolder Bite',
    rankRequired: 2,
    description: 'Burn chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'cinder-crit',
    abilityId: 'cinder-bite',
    name: 'Fang Bite',
    rankRequired: 2,
    description: 'Crit chance +10%.',
    effectType: 'bonusCritChance',
    effectValue: 10,
  },
  {
    id: 'cinder-ember',
    abilityId: 'cinder-bite',
    name: 'Ember Bite',
    rankRequired: 4,
    description: '+12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'cinder-crunch',
    abilityId: 'cinder-bite',
    name: 'Crunch Bite',
    rankRequired: 4,
    description: '+4 flat damage.',
    effectType: 'flatDamage',
    effectValue: 4,
  },
  // Rock Bump
  {
    id: 'rock-stun',
    abilityId: 'rock-bump',
    name: 'Stunning Bump',
    rankRequired: 2,
    description: 'Stagger chance +15% (status planned).',
    effectType: 'bonusStatusChance',
    effectValue: 15,
  },
  {
    id: 'rock-aim',
    abilityId: 'rock-bump',
    name: 'True Bump',
    rankRequired: 2,
    description: '+8 accuracy.',
    effectType: 'bonusAccuracy',
    effectValue: 8,
  },
  {
    id: 'rock-slam',
    abilityId: 'rock-bump',
    name: 'Slam Bump',
    rankRequired: 4,
    description: '+12% damage.',
    effectType: 'bonusDamagePercent',
    effectValue: 12,
  },
  {
    id: 'rock-boulder',
    abilityId: 'rock-bump',
    name: 'Boulder Bump',
    rankRequired: 4,
    description: '+4 flat damage.',
    effectType: 'flatDamage',
    effectValue: 4,
  },
]

const UPGRADE_BY_ID = Object.fromEntries(
  ABILITY_UPGRADES.map((u) => [u.id, u]),
) as Record<string, AbilityUpgrade>

export function getAbilityUpgrade(id: string): AbilityUpgrade | undefined {
  const upgrade = UPGRADE_BY_ID[id]
  if (!upgrade) return undefined
  return {
    ...upgrade,
    kind: upgrade.kind ?? 'passive',
  }
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** Pick 3 ability perks (passive/reactive) for a mastery rank-up draft. */
export function pickAbilityPerkDraft(
  abilityId: string,
  rank: number,
  excludeIds: string[],
  count = 3,
): AbilityUpgrade[] {
  const taken = new Set(excludeIds)
  const available = (perks: AbilityUpgrade[]) =>
    perks.filter((p) => !taken.has(p.id))

  let pool = available(
    ABILITY_UPGRADES.filter(
      (u) => u.abilityId === abilityId && u.rankRequired === rank,
    ),
  )

  if (pool.length < count) {
    pool = available(
      ABILITY_UPGRADES.filter(
        (u) =>
          (u.abilityId === abilityId || u.abilityId === 'common') &&
          u.rankRequired <= rank,
      ),
    )
  }

  return shuffle(pool).slice(0, count)
}

/** @deprecated Use pickAbilityPerkDraft */
export function getUpgradeChoicesForAbility(
  abilityId: string,
  rank: number,
): AbilityUpgrade[] {
  return pickAbilityPerkDraft(abilityId, rank, [], 3)
}
