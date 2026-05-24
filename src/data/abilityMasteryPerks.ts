import { getAbility, ABILITIES } from './abilities'
import type { AbilityDefinition } from './abilityTypes'
import { SUPPORT_ABILITY_MASTERY_PERKS } from './supportAbilityMasteryPerks'

export type MasteryPathTag = 'damage' | 'status' | 'utility' | 'hybrid'

/** Role used to filter mastery perk drafts for an ability. */
export type AbilityRole =
  | 'damage'
  | 'debuff'
  | 'buff'
  | 'status'
  | 'healing'
  | 'support'
  | 'hybrid'

export type MasteryPerkEffects = {
  bonusDamagePercent?: number
  bonusAccuracy?: number
  bonusCritChance?: number
  bonusStatusChance?: number
  flatDamage?: number
  burnChance?: number
  poisonChance?: number
  paralyzeChance?: number
  bindChance?: number
  healOnHitPercent?: number
  splashDamagePercent?: number
  /** Extra stages for buff/debuff from this ability */
  statStageBonus?: number
  /** Extra % for applyStatus on this ability */
  statusChanceBonus?: number
  /** Extra heal % for heal effects on this ability */
  healBonusPercent?: number
}

export type AbilityMasteryPerk = {
  id: string
  abilityId: string
  name: string
  description: string
  rankMinimum: number
  pathTag: MasteryPathTag
  /** Primary role for draft filtering (inferred from pathTag if omitted). */
  abilityRole?: AbilityRole
  effects: MasteryPerkEffects
}

export function getAbilityRole(ability: AbilityDefinition): AbilityRole {
  const hasDamage = ability.category !== 'status' && ability.power > 0
  const effects = ability.effects ?? []
  const hasDebuff = effects.some((e) => e.type === 'statDebuff')
  const hasBuff = effects.some(
    (e) =>
      e.type === 'statBuff' &&
      (e.target === 'self' || e.target === undefined || ability.target === 'self'),
  )
  const hasStatus = effects.some((e) => e.type === 'applyStatus')
  const hasHeal = effects.some((e) => e.type === 'heal')

  if (hasDamage && (hasDebuff || hasBuff || hasStatus || hasHeal)) {
    return 'hybrid'
  }
  if (hasHeal) return 'healing'
  if (hasDebuff && !hasDamage) return 'debuff'
  if (hasBuff && !hasDamage) return 'buff'
  if (hasStatus && !hasDamage) return 'status'
  if (hasDamage) return 'damage'
  return 'support'
}

/** Human-readable category for UI (physical / special / buff / debuff / etc.). */
export function getAbilityDisplayCategory(ability: AbilityDefinition): string {
  const role = getAbilityRole(ability)
  if (ability.category === 'physical') return 'Physical'
  if (ability.category === 'special') return 'Special'
  if (role === 'buff') return 'Buff'
  if (role === 'debuff') return 'Debuff'
  if (role === 'healing') return 'Healing'
  if (role === 'status') return 'Status'
  if (role === 'support') return 'Support'
  if (role === 'hybrid') return 'Hybrid'
  if (ability.category === 'status') return 'Status'
  return 'Damage'
}

function roleToPathTag(role: AbilityRole): MasteryPathTag {
  if (role === 'damage') return 'damage'
  if (role === 'debuff' || role === 'status') return 'status'
  if (role === 'buff' || role === 'healing' || role === 'support') return 'utility'
  return 'hybrid'
}

export function getPerkAbilityRole(perk: AbilityMasteryPerk): AbilityRole {
  if (perk.abilityRole) return perk.abilityRole
  switch (perk.pathTag) {
    case 'damage':
      return 'damage'
    case 'status':
      return 'status'
    case 'utility':
      return 'buff'
    case 'hybrid':
      return 'hybrid'
    default:
      return 'support'
  }
}

function perkMatchesAbilityRole(
  perkRole: AbilityRole,
  abilityRole: AbilityRole,
): boolean {
  if (abilityRole === 'hybrid') {
    return ['damage', 'debuff', 'buff', 'status', 'healing', 'support', 'hybrid'].includes(
      perkRole,
    )
  }
  if (abilityRole === 'damage') {
    return perkRole === 'damage' || perkRole === 'hybrid'
  }
  if (abilityRole === 'debuff') {
    return perkRole === 'debuff' || perkRole === 'status' || perkRole === 'hybrid'
  }
  if (abilityRole === 'buff') {
    return perkRole === 'buff' || perkRole === 'support' || perkRole === 'hybrid'
  }
  if (abilityRole === 'status') {
    return perkRole === 'status' || perkRole === 'debuff' || perkRole === 'hybrid'
  }
  if (abilityRole === 'healing' || abilityRole === 'support') {
    return (
      perkRole === 'healing' ||
      perkRole === 'support' ||
      perkRole === 'buff' ||
      perkRole === 'hybrid'
    )
  }
  return perkRole === abilityRole
}

export function generateFallbackMasteryPerks(
  abilityId: string,
  abilityRole: AbilityRole,
  rank: number,
  count: number,
): AbilityMasteryPerk[] {
  const ability = getAbility(abilityId)
  const abilityName = ability.name

  const templates: Record<
    AbilityRole,
    { slug: string; name: string; description: string; effects: MasteryPerkEffects; role: AbilityRole }[]
  > = {
    damage: [
      {
        slug: 'overdrive',
        name: `${abilityName}: Overdrive`,
        description: `${abilityName} hits 12% harder at this mastery rank.`,
        effects: { bonusDamagePercent: 0.12 },
        role: 'damage',
      },
      {
        slug: 'true-aim',
        name: `${abilityName}: True Aim`,
        description: `${abilityName} gains +12 accuracy from focused training.`,
        effects: { bonusAccuracy: 12 },
        role: 'damage',
      },
      {
        slug: 'breaking-force',
        name: `${abilityName}: Breaking Force`,
        description: `${abilityName} lands with +5 extra damage.`,
        effects: { flatDamage: 5 },
        role: 'damage',
      },
    ],
    debuff: [
      {
        slug: 'crush-spirit',
        name: `${abilityName}: Crush Spirit`,
        description: `${abilityName} applies debuffs +1 stage deeper.`,
        effects: { statStageBonus: 1 },
        role: 'debuff',
      },
      {
        slug: 'unshakable',
        name: `${abilityName}: Unshakable`,
        description: `${abilityName} lands debuffs more reliably (+12 accuracy).`,
        effects: { bonusAccuracy: 12 },
        role: 'debuff',
      },
      {
        slug: 'lingering-weight',
        name: `${abilityName}: Lingering Weight`,
        description: `${abilityName} leaves foes struggling under pressure (+12% status chance).`,
        effects: { bonusStatusChance: 12 },
        role: 'debuff',
      },
    ],
    buff: [
      {
        slug: 'iron-stance',
        name: `${abilityName}: Iron Stance`,
        description: `${abilityName} raises stats +1 extra stage.`,
        effects: { statStageBonus: 1 },
        role: 'buff',
      },
      {
        slug: 'steady-breath',
        name: `${abilityName}: Steady Breath`,
        description: `${abilityName} sets up more reliably (+12 accuracy).`,
        effects: { bonusAccuracy: 12 },
        role: 'buff',
      },
      {
        slug: 'shared-rhythm',
        name: `${abilityName}: Shared Rhythm`,
        description: `${abilityName} restores 4% max HP when used.`,
        effects: { healOnHitPercent: 0.04 },
        role: 'buff',
      },
    ],
    status: [
      {
        slug: 'potent-hex',
        name: `${abilityName}: Potent Hex`,
        description: `${abilityName} status effects gain +18% chance.`,
        effects: { bonusStatusChance: 18 },
        role: 'status',
      },
      {
        slug: 'sure-cast',
        name: `${abilityName}: Sure Cast`,
        description: `${abilityName} gains +12 accuracy.`,
        effects: { bonusAccuracy: 12 },
        role: 'status',
      },
      {
        slug: 'punish-window',
        name: `${abilityName}: Punish Window`,
        description: `After ${abilityName} lands, your next hit deals +10% damage.`,
        effects: { bonusDamagePercent: 0.1 },
        role: 'status',
      },
    ],
    healing: [
      {
        slug: 'deep-recovery',
        name: `${abilityName}: Deep Recovery`,
        description: `${abilityName} heals 25% more HP.`,
        effects: { healBonusPercent: 0.25 },
        role: 'healing',
      },
      {
        slug: 'afterglow',
        name: `${abilityName}: Afterglow`,
        description: `${abilityName} leaves a soothing pulse (+6% heal on use).`,
        effects: { healOnHitPercent: 0.06 },
        role: 'healing',
      },
      {
        slug: 'calm-flow',
        name: `${abilityName}: Calm Flow`,
        description: `${abilityName} is easier to land (+12 accuracy).`,
        effects: { bonusAccuracy: 12 },
        role: 'healing',
      },
    ],
    support: [
      {
        slug: 'refined-form',
        name: `${abilityName}: Refined Form`,
        description: `${abilityName} gains +12 accuracy.`,
        effects: { bonusAccuracy: 12 },
        role: 'support',
      },
      {
        slug: 'tactical-edge',
        name: `${abilityName}: Tactical Edge`,
        description: `${abilityName} adds +10% damage when used in a combo.`,
        effects: { bonusDamagePercent: 0.1 },
        role: 'support',
      },
      {
        slug: 'field-control',
        name: `${abilityName}: Field Control`,
        description: `${abilityName} support effects are 12% stronger.`,
        effects: { healBonusPercent: 0.12 },
        role: 'support',
      },
    ],
    hybrid: [
      {
        slug: 'dual-edge',
        name: `${abilityName}: Dual Edge`,
        description: `${abilityName} deals 10% more damage.`,
        effects: { bonusDamagePercent: 0.1 },
        role: 'hybrid',
      },
      {
        slug: 'split-focus',
        name: `${abilityName}: Split Focus`,
        description: `${abilityName} gains +12 accuracy and +12% status chance.`,
        effects: { bonusAccuracy: 12, bonusStatusChance: 12 },
        role: 'hybrid',
      },
      {
        slug: 'combo-weave',
        name: `${abilityName}: Combo Weave`,
        description: `${abilityName} adds +4 damage and +1 debuff stage.`,
        effects: { flatDamage: 4, statStageBonus: 1 },
        role: 'hybrid',
      },
    ],
  }

  const pool = templates[abilityRole] ?? templates.support
  return pool.slice(0, count).map((t) => ({
    id: `${abilityId}-${t.slug}-r${rank}`,
    abilityId,
    name: t.name,
    description: t.description,
    rankMinimum: rank,
    pathTag:
      abilityRole === 'damage'
        ? 'damage'
        : abilityRole === 'status' || abilityRole === 'debuff'
          ? 'status'
          : abilityRole === 'buff' || abilityRole === 'healing'
            ? 'utility'
            : 'hybrid',
    abilityRole: t.role,
    effects: t.effects,
  }))
}

function sparkPerks(): AbilityMasteryPerk[] {
  return [
    { id: 'se-hotter-core', abilityId: 'spark-ember', name: 'Hotter Core', description: 'Spark Ember deals 15% more damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.15 } },
    { id: 'se-ember-splash', abilityId: 'spark-ember', name: 'Ember Splash', description: '10% splash damage to nearby foes (planned).', rankMinimum: 2, pathTag: 'damage', effects: { splashDamagePercent: 0.1 } },
    { id: 'se-crit-flame', abilityId: 'spark-ember', name: 'Crit Flame', description: '+12% crit chance on Spark Ember.', rankMinimum: 2, pathTag: 'damage', effects: { bonusCritChance: 12 } },
    { id: 'se-ignite', abilityId: 'spark-ember', name: 'Ignite', description: '+20% burn chance on Spark Ember.', rankMinimum: 3, pathTag: 'status', effects: { burnChance: 0.2 } },
    { id: 'se-searing-hex', abilityId: 'spark-ember', name: 'Searing Hex', description: 'Burns last longer (planned). +8% burn chance.', rankMinimum: 3, pathTag: 'status', effects: { burnChance: 0.08, bonusStatusChance: 8 } },
    { id: 'se-flame-lance', abilityId: 'spark-ember', name: 'Flame Lance', description: '+4 flat fire damage.', rankMinimum: 3, pathTag: 'damage', effects: { flatDamage: 4 } },
    { id: 'se-warmth', abilityId: 'spark-ember', name: 'Warmth', description: 'Heal 5% max HP when hitting a burning foe.', rankMinimum: 4, pathTag: 'utility', effects: { healOnHitPercent: 0.05 } },
    { id: 'se-scorch-mist', abilityId: 'spark-ember', name: 'Scorch Mist', description: '+10% damage and +10% burn chance.', rankMinimum: 4, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.1, burnChance: 0.1 } },
    { id: 'se-piercing-ember', abilityId: 'spark-ember', name: 'Piercing Ember', description: '+6 accuracy, +8% damage.', rankMinimum: 4, pathTag: 'hybrid', effects: { bonusAccuracy: 6, bonusDamagePercent: 0.08 } },
    { id: 'se-inferno-heart', abilityId: 'spark-ember', name: 'Inferno Heart', description: '+18% fire damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.18 } },
    { id: 'se-brand', abilityId: 'spark-ember', name: 'Brand', description: '+25% burn chance.', rankMinimum: 6, pathTag: 'status', effects: { burnChance: 0.25 } },
    { id: 'se-ember-shield', abilityId: 'spark-ember', name: 'Ember Shield', description: 'Gain a small shield after using Spark Ember (planned).', rankMinimum: 6, pathTag: 'utility', effects: { healOnHitPercent: 0.03 } },
    { id: 'se-wildfire', abilityId: 'spark-ember', name: 'Wildfire', description: '+12% damage, embers spread burn (planned).', rankMinimum: 7, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.12, burnChance: 0.12 } },
    { id: 'se-focus-heat', abilityId: 'spark-ember', name: 'Focus Heat', description: '+10 accuracy.', rankMinimum: 7, pathTag: 'utility', effects: { bonusAccuracy: 10 } },
    { id: 'se-cinder-burst', abilityId: 'spark-ember', name: 'Cinder Burst', description: '+6 flat damage, +10% crit.', rankMinimum: 7, pathTag: 'damage', effects: { flatDamage: 6, bonusCritChance: 10 } },
    { id: 'se-solar-tip', abilityId: 'spark-ember', name: 'Solar Tip', description: '+20% damage at high mastery.', rankMinimum: 8, pathTag: 'damage', effects: { bonusDamagePercent: 0.2 } },
    { id: 'se-hex-flame', abilityId: 'spark-ember', name: 'Hex Flame', description: 'Burns reduce enemy SP.DEF (planned). +15% burn.', rankMinimum: 8, pathTag: 'status', effects: { burnChance: 0.15 } },
    { id: 'se-phoenix-spark', abilityId: 'spark-ember', name: 'Phoenix Spark', description: 'Balanced +10% damage and +15% burn.', rankMinimum: 9, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.1, burnChance: 0.15 } },
    { id: 'se-master-ember', abilityId: 'spark-ember', name: 'Master Ember', description: '+8 flat damage, +8% crit.', rankMinimum: 9, pathTag: 'damage', effects: { flatDamage: 8, bonusCritChance: 8 } },
    { id: 'se-ash-storm', abilityId: 'spark-ember', name: 'Ash Storm', description: '+12% burn, +8% damage.', rankMinimum: 9, pathTag: 'status', effects: { burnChance: 0.12, bonusDamagePercent: 0.08 } },
  ]
}

function bubblePerks(): AbilityMasteryPerk[] {
  return [
    { id: 'bh-pressure', abilityId: 'bubble-hex', name: 'Pressure', description: '+15% water damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.15 } },
    { id: 'bh-hex-slow', abilityId: 'bubble-hex', name: 'Hex Slow', description: 'Bubbles slow the foe (planned). +10% bind.', rankMinimum: 2, pathTag: 'status', effects: { bindChance: 0.1 } },
    { id: 'bh-aim-stream', abilityId: 'bubble-hex', name: 'Aim Stream', description: '+8 accuracy.', rankMinimum: 2, pathTag: 'utility', effects: { bonusAccuracy: 8 } },
    { id: 'bh-soak', abilityId: 'bubble-hex', name: 'Soak', description: 'Weaken foe DEF (planned). +12% damage.', rankMinimum: 3, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.12 } },
    { id: 'bh-mist-heal', abilityId: 'bubble-hex', name: 'Mist Heal', description: 'Heal 4% HP on hit.', rankMinimum: 3, pathTag: 'utility', effects: { healOnHitPercent: 0.04 } },
    { id: 'bh-crash-wave', abilityId: 'bubble-hex', name: 'Crash Wave', description: '+4 flat damage.', rankMinimum: 3, pathTag: 'damage', effects: { flatDamage: 4 } },
    { id: 'bh-drench', abilityId: 'bubble-hex', name: 'Drench', description: '+18% damage vs slowed (planned).', rankMinimum: 4, pathTag: 'damage', effects: { bonusDamagePercent: 0.18 } },
    { id: 'bh-cleanse', abilityId: 'bubble-hex', name: 'Cleanse Mist', description: 'Clear one debuff on self (planned).', rankMinimum: 4, pathTag: 'utility', effects: { healOnHitPercent: 0.05 } },
    { id: 'bh-hex-chill', abilityId: 'bubble-hex', name: 'Hex Chill', description: '+15% bind chance.', rankMinimum: 4, pathTag: 'status', effects: { bindChance: 0.15 } },
    { id: 'bh-tidal', abilityId: 'bubble-hex', name: 'Tidal Force', description: '+20% water damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.2 } },
    { id: 'bh-soothing', abilityId: 'bubble-hex', name: 'Soothing Rain', description: 'Heal 6% on hit.', rankMinimum: 6, pathTag: 'utility', effects: { healOnHitPercent: 0.06 } },
    { id: 'bh-pressure-wave', abilityId: 'bubble-hex', name: 'Pressure Wave', description: '+6 flat, +6 accuracy.', rankMinimum: 7, pathTag: 'hybrid', effects: { flatDamage: 6, bonusAccuracy: 6 } },
    { id: 'bh-deep-hex', abilityId: 'bubble-hex', name: 'Deep Hex', description: '+12% damage, +12% bind.', rankMinimum: 8, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.12, bindChance: 0.12 } },
    { id: 'bh-master-bubble', abilityId: 'bubble-hex', name: 'Master Bubble', description: '+10 flat water damage.', rankMinimum: 9, pathTag: 'damage', effects: { flatDamage: 10 } },
  ]
}

function vinePerks(): AbilityMasteryPerk[] {
  return [
    { id: 'vl-thorns', abilityId: 'vine-lash', name: 'Thorns', description: '+15% damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.15 } },
    { id: 'vl-bind', abilityId: 'vine-lash', name: 'Bind', description: '+18% bind chance.', rankMinimum: 2, pathTag: 'status', effects: { bindChance: 0.18 } },
    { id: 'vl-poison-tip', abilityId: 'vine-lash', name: 'Poison Tip', description: '+20% poison chance.', rankMinimum: 3, pathTag: 'status', effects: { poisonChance: 0.2 } },
    { id: 'vl-regen-sap', abilityId: 'vine-lash', name: 'Regen Sap', description: 'Heal 5% on hit.', rankMinimum: 3, pathTag: 'utility', effects: { healOnHitPercent: 0.05 } },
    { id: 'vl-armor-shred', abilityId: 'vine-lash', name: 'Armor Shred', description: 'Shred DEF (planned). +10% damage.', rankMinimum: 4, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.1 } },
    { id: 'vl-multi-lash', abilityId: 'vine-lash', name: 'Multi Lash', description: '+5 flat, +8% crit.', rankMinimum: 4, pathTag: 'damage', effects: { flatDamage: 5, bonusCritChance: 8 } },
    { id: 'vl-overgrowth', abilityId: 'vine-lash', name: 'Overgrowth', description: '+20% grass damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.2 } },
    { id: 'vl-spore', abilityId: 'vine-lash', name: 'Spore Cloud', description: '+15% poison.', rankMinimum: 7, pathTag: 'status', effects: { poisonChance: 0.15 } },
    { id: 'vl-wild-vine', abilityId: 'vine-lash', name: 'Wild Vine', description: '+12% damage, +10% bind.', rankMinimum: 9, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.12, bindChance: 0.1 } },
  ]
}

function joltPerks(): AbilityMasteryPerk[] {
  return [
    { id: 'sj-voltage', abilityId: 'static-jolt', name: 'Voltage', description: '+15% electric damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.15 } },
    { id: 'sj-paralyze', abilityId: 'static-jolt', name: 'Paralyze', description: '+22% paralyze chance.', rankMinimum: 2, pathTag: 'status', effects: { paralyzeChance: 0.22 } },
    { id: 'sj-chain', abilityId: 'static-jolt', name: 'Chain Spark', description: 'Chain to second target (planned). +8% damage.', rankMinimum: 3, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.08, splashDamagePercent: 0.08 } },
    { id: 'sj-speed-shock', abilityId: 'static-jolt', name: 'Speed Shock', description: '+8 accuracy.', rankMinimum: 3, pathTag: 'utility', effects: { bonusAccuracy: 8 } },
    { id: 'sj-overload', abilityId: 'static-jolt', name: 'Overload', description: '+20% damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.2 } },
    { id: 'sj-static-stack', abilityId: 'static-jolt', name: 'Static Stack', description: '+15% paralyze.', rankMinimum: 7, pathTag: 'status', effects: { paralyzeChance: 0.15 } },
    { id: 'sj-storm-bolt', abilityId: 'static-jolt', name: 'Storm Bolt', description: '+8 flat, +10% crit.', rankMinimum: 9, pathTag: 'damage', effects: { flatDamage: 8, bonusCritChance: 10 } },
  ]
}

function stonePerks(): AbilityMasteryPerk[] {
  return [
    { id: 'sn-weight', abilityId: 'stone-nudge', name: 'Weight', description: '+15% damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.15 } },
    { id: 'sn-stun', abilityId: 'stone-nudge', name: 'Stun', description: '+18% paralyze/stun chance.', rankMinimum: 2, pathTag: 'status', effects: { paralyzeChance: 0.18 } },
    { id: 'sn-shield-rock', abilityId: 'stone-nudge', name: 'Stone Shield', description: 'Heal 4% on hit.', rankMinimum: 3, pathTag: 'utility', effects: { healOnHitPercent: 0.04 } },
    { id: 'sn-armor-break', abilityId: 'stone-nudge', name: 'Armor Break', description: 'Break DEF (planned). +10% damage.', rankMinimum: 4, pathTag: 'hybrid', effects: { bonusDamagePercent: 0.1 } },
    { id: 'sn-quake', abilityId: 'stone-nudge', name: 'Quake', description: '+20% ground damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.2 } },
    { id: 'sn-titan', abilityId: 'stone-nudge', name: 'Titan Nudge', description: '+7 flat damage.', rankMinimum: 9, pathTag: 'damage', effects: { flatDamage: 7 } },
  ]
}

function tacklePerks(): AbilityMasteryPerk[] {
  return [
    { id: 'tk-momentum', abilityId: 'tackle', name: 'Momentum', description: '+12% physical damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.12 } },
    { id: 'tk-stagger', abilityId: 'tackle', name: 'Stagger', description: 'Stagger foe (planned). +10% paralyze.', rankMinimum: 2, pathTag: 'status', effects: { paralyzeChance: 0.1 } },
    { id: 'tk-bruise', abilityId: 'tackle', name: 'Bruise', description: '+3 flat damage.', rankMinimum: 3, pathTag: 'damage', effects: { flatDamage: 3 } },
    { id: 'tk-push', abilityId: 'tackle', name: 'Push Advantage', description: '+8 accuracy.', rankMinimum: 4, pathTag: 'utility', effects: { bonusAccuracy: 8 } },
    { id: 'tk-crash', abilityId: 'tackle', name: 'Crash', description: '+18% damage.', rankMinimum: 6, pathTag: 'damage', effects: { bonusDamagePercent: 0.18 } },
  ]
}

function enemyMovePerks(
  abilityId: string,
  displayName: string,
): AbilityMasteryPerk[] {
  return [
    {
      id: `${abilityId}-fang-overdrive`,
      abilityId,
      name: `${displayName}: Fang Overdrive`,
      description: `${displayName} hits 12% harder.`,
      rankMinimum: 2,
      pathTag: 'damage',
      abilityRole: 'damage',
      effects: { bonusDamagePercent: 0.12 },
    },
    {
      id: `${abilityId}-keen-strike`,
      abilityId,
      name: `${displayName}: Keen Strike`,
      description: `${displayName} gains +12 accuracy.`,
      rankMinimum: 2,
      pathTag: 'damage',
      abilityRole: 'damage',
      effects: { bonusAccuracy: 12 },
    },
    {
      id: `${abilityId}-crushing-blow`,
      abilityId,
      name: `${displayName}: Crushing Blow`,
      description: `${displayName} lands with +5 bonus damage.`,
      rankMinimum: 3,
      pathTag: 'damage',
      abilityRole: 'damage',
      effects: { flatDamage: 5 },
    },
  ]
}

function stingPerks(): AbilityMasteryPerk[] {
  return [
    { id: 'st-venom', abilityId: 'sting', name: 'Venom', description: '+25% poison chance.', rankMinimum: 2, pathTag: 'status', effects: { poisonChance: 0.25 } },
    { id: 'st-pierce', abilityId: 'sting', name: 'Pierce', description: '+12% damage.', rankMinimum: 2, pathTag: 'damage', effects: { bonusDamagePercent: 0.12 } },
    { id: 'st-weak-point', abilityId: 'sting', name: 'Weak Point', description: '+10% crit.', rankMinimum: 3, pathTag: 'damage', effects: { bonusCritChance: 10 } },
    { id: 'st-toxic', abilityId: 'sting', name: 'Toxic Sting', description: '+15% poison, +8% damage.', rankMinimum: 6, pathTag: 'hybrid', effects: { poisonChance: 0.15, bonusDamagePercent: 0.08 } },
    { id: 'st-barb', abilityId: 'sting', name: 'Barb', description: '+4 flat damage.', rankMinimum: 9, pathTag: 'damage', effects: { flatDamage: 4 } },
  ]
}

function buildAutoGeneratedAbilityPerks(
  handcrafted: AbilityMasteryPerk[],
): AbilityMasteryPerk[] {
  const covered = new Set(handcrafted.map((p) => p.abilityId))
  const generated: AbilityMasteryPerk[] = []
  for (const ability of Object.values(ABILITIES)) {
    if (covered.has(ability.id)) continue
    generated.push(
      ...generateFallbackMasteryPerks(
        ability.id,
        getAbilityRole(ability),
        2,
        3,
      ),
    )
  }
  return generated
}

const HANDCRAFTED_ABILITY_MASTERY_PERKS: AbilityMasteryPerk[] = [
  ...sparkPerks(),
  ...bubblePerks(),
  ...vinePerks(),
  ...joltPerks(),
  ...stonePerks(),
  ...tacklePerks(),
  ...stingPerks(),
  ...enemyMovePerks('cinder-bite', 'Cinder Bite'),
  ...enemyMovePerks('rock-bump', 'Rock Bump'),
  ...SUPPORT_ABILITY_MASTERY_PERKS,
]

export const ABILITY_MASTERY_PERKS: AbilityMasteryPerk[] = [
  ...HANDCRAFTED_ABILITY_MASTERY_PERKS,
  ...buildAutoGeneratedAbilityPerks(HANDCRAFTED_ABILITY_MASTERY_PERKS),
]

const PERK_BY_ID = Object.fromEntries(
  ABILITY_MASTERY_PERKS.map((p) => [p.id, p]),
) as Record<string, AbilityMasteryPerk>

export function getMasteryPerk(id: string): AbilityMasteryPerk | undefined {
  return PERK_BY_ID[id]
}

export function pickAbilityMasteryPerkDraft(
  abilityId: string,
  rank: number,
  excludeIds: string[],
  count = 3,
): AbilityMasteryPerk[] {
  const ability = getAbility(abilityId)
  const abilityRole = getAbilityRole(ability)
  const taken = new Set(excludeIds)

  let pool = ABILITY_MASTERY_PERKS.filter(
    (p) =>
      p.abilityId === abilityId &&
      p.rankMinimum <= rank &&
      !taken.has(p.id) &&
      perkMatchesAbilityRole(getPerkAbilityRole(p), abilityRole),
  )

  if (pool.length < count) {
    pool = ABILITY_MASTERY_PERKS.filter(
      (p) =>
        p.abilityId === abilityId &&
        !taken.has(p.id) &&
        perkMatchesAbilityRole(getPerkAbilityRole(p), abilityRole),
    )
  }

  if (pool.length < count) {
    pool = ABILITY_MASTERY_PERKS.filter(
      (p) => p.abilityId === abilityId && !taken.has(p.id),
    )
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, Math.min(count, shuffled.length))

  if (picked.length >= Math.min(2, count)) {
    return picked
  }

  const fallbacks = generateFallbackMasteryPerks(
    abilityId,
    abilityRole,
    rank,
    count,
  ).filter((p) => !taken.has(p.id))

  const merged = [...picked, ...fallbacks]
  const unique = merged.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  )
  return unique.slice(0, Math.max(2, Math.min(count, unique.length)))
}

/** Always returns at least 2 valid perk choices for a mastery perk rank. */
export function ensureMasteryPerkDraft(
  abilityId: string,
  rank: number,
  excludeIds: string[],
  count = 3,
): AbilityMasteryPerk[] {
  const draft = pickAbilityMasteryPerkDraft(abilityId, rank, excludeIds, count)
  if (draft.length >= 2) return draft
  const ability = getAbility(abilityId)
  const role = getAbilityRole(ability)
  const extra = generateFallbackMasteryPerks(abilityId, role, rank, count)
  const merged = [...draft, ...extra]
  const unique = merged.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  )
  return unique.length >= 2
    ? unique.slice(0, Math.max(2, count))
    : generateFallbackMasteryPerks(abilityId, 'hybrid', rank, count).slice(0, count)
}

export function getPathTagCounts(
  perkIds: string[],
): Record<MasteryPathTag, number> {
  const counts: Record<MasteryPathTag, number> = {
    damage: 0,
    status: 0,
    utility: 0,
    hybrid: 0,
  }
  for (const id of perkIds) {
    const perk = PERK_BY_ID[id]
    if (perk) counts[perk.pathTag]++
  }
  return counts
}

export function getAbilityTransformationPath(
  selectedPerkIds: string[],
  fallbackAbilityId?: string,
): MasteryPathTag {
  const counts = getPathTagCounts(selectedPerkIds)
  const entries = (Object.entries(counts) as [MasteryPathTag, number][]).sort(
    (a, b) => b[1] - a[1],
  )
  if (entries[0][1] === 0) {
    if (fallbackAbilityId) {
      return roleToPathTag(getAbilityRole(getAbility(fallbackAbilityId)))
    }
    return 'hybrid'
  }
  if (entries[0][1] === entries[1][1]) return 'hybrid'
  return entries[0][0]
}
