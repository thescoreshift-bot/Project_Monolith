/** Combat effect tags and legacy perk overlays — single source for perk combat math. */

export type PerkCombatEffects = {
  damageDealtMult?: number
  damageVsHighHpMult?: number
  damageVsLowHpMult?: number
  physicalDamageMult?: number
  specialDamageMult?: number
  sameTypeDamageMult?: number
  superEffectiveDamageMult?: number
  damageVsEliteMult?: number
  ignoreDefFlat?: number
  ignoreDefPercent?: number
  critChanceBonus?: number
  damageTakenReduction?: number
  damageTakenHighHpReduction?: number
  superEffectiveTakenReduction?: number
  bossDamageTakenReduction?: number
  maxHpPercent?: number
  defPercent?: number
  spDefPercent?: number
  spdPercent?: number
  dodgeChance?: number
  firstStrikeBonus?: number
  firstStrikeDamageMult?: number
  endOfTurnHealPercent?: number
  postVictoryHeal?: number
  restNodeHeal?: number
  potionHealBonus?: number
  debuffAccuracyBonus?: number
  debuffDamageBonus?: number
  statusPotencyBonus?: number
  helperDamageBonus?: number
  helperDamageTakenReduction?: number
  healHelperShare?: number
  fireDamageMult?: number
  waterDamageMult?: number
  grassDamageMult?: number
  electricDamageMult?: number
  groundDamageMult?: number
  masteryXpBonus?: number
  allXpBonus?: number
}

export const TAG_COMBAT_EFFECTS: Record<string, PerkCombatEffects> = {
  fire_damage_bonus: { fireDamageMult: 0.1 },
  water_damage_bonus: { waterDamageMult: 0.1 },
  grass_damage_bonus: { grassDamageMult: 0.1 },
  electric_damage_bonus: { electricDamageMult: 0.1 },
  ground_damage_bonus: { groundDamageMult: 0.1 },
  predator_instinct: { damageVsHighHpMult: 0.08 },
  finisher: { damageVsLowHpMult: 0.12 },
  piercing_instinct: { ignoreDefFlat: 5 },
  piercing_blows: { ignoreDefPercent: 0.08 },
  critical_spark: { critChanceBonus: 0.08 },
  heavy_impact: { physicalDamageMult: 0.1 },
  focused_casting: { specialDamageMult: 0.1 },
  type_specialist: { sameTypeDamageMult: 0.1 },
  super_effective_surge: { superEffectiveDamageMult: 0.12 },
  combo_pressure: { damageDealtMult: 0.05 },
  alpha_hunter: { damageVsEliteMult: 0.1 },
  thick_scales: { damageTakenHighHpReduction: 0.1 },
  guarded_stance: { damageTakenReduction: 0.06 },
  elemental_guard: { superEffectiveTakenReduction: 0.1 },
  last_stand: {},
  hardened_shell: { defPercent: 0.08 },
  mystic_ward: { spDefPercent: 0.08 },
  recovery_pulse: { endOfTurnHealPercent: 0.03 },
  boss_guard: { bossDamageTakenReduction: 0.08 },
  thick_hide: { maxHpPercent: 0.1 },
  quick_reflex: { spdPercent: 0.1 },
  first_strike: { firstStrikeBonus: 8 },
  first_move: { firstStrikeBonus: 8, firstStrikeDamageMult: 0.1 },
  evasive_reflex: { dodgeChance: 0.12 },
  evasive_step: { dodgeChance: 0.1 },
  momentum_spd: { spdPercent: 0.05 },
  battle_rhythm: { damageDealtMult: 0.06 },
  second_wind: { postVictoryHeal: 8 },
  field_recovery: { restNodeHeal: 20 },
  status_focus: { statusPotencyBonus: 0.15 },
  team_tactics: { helperDamageBonus: 0.08 },
  shared_guard: { helperDamageTakenReduction: 0.05 },
  support_bond: { healHelperShare: 0.25 },
  reliable_debuffs: { debuffAccuracyBonus: 0.1 },
  pressure_point: { debuffDamageBonus: 0.06 },
  efficient_items: { potionHealBonus: 0.2 },
  burn_pressure: { fireDamageMult: 0.06, statusPotencyBonus: 0.1 },
  ember_core: { fireDamageMult: 0.08 },
  tide_recovery: { endOfTurnHealPercent: 0.02, waterDamageMult: 0.04 },
  rooted_growth: { endOfTurnHealPercent: 0.02 },
  static_charge: { electricDamageMult: 0.06, critChanceBonus: 0.04 },
  overload: { electricDamageMult: 0.08 },
  stonewall: { defPercent: 0.06, damageTakenReduction: 0.04 },
  quake_force: { groundDamageMult: 0.08, ignoreDefPercent: 0.05 },
  primal_mutation: { damageDealtMult: 0.05 },
  adaptive_core: { maxHpPercent: 0.03, defPercent: 0.02, spdPercent: 0.02 },
  strange_catalyst: { debuffAccuracyBonus: 0.08, statusPotencyBonus: 0.08 },
  monolith_resonance: { masteryXpBonus: 0.05 },
  offensive_instinct: { damageDealtMult: 0.05 },
  defensive_instinct: { maxHpPercent: 0.05, defPercent: 0.03 },
  speed_instinct: { spdPercent: 0.05 },
  utility_instinct: { debuffAccuracyBonus: 0.08, statusPotencyBonus: 0.05 },
  evolution_instinct: { allXpBonus: 0.05, masteryXpBonus: 0.05 },
}

/** Old evolution-only perks — gameplay overlay without changing save ids. */
export const LEGACY_PERK_COMBAT_OVERLAY: Record<string, PerkCombatEffects> = {
  'primal-mutation': { damageDealtMult: 0.05 },
  'adaptive-core': { maxHpPercent: 0.03, defPercent: 0.02, spdPercent: 0.02 },
  'strange-catalyst': { debuffAccuracyBonus: 0.08 },
  'monolith-resonance': { masteryXpBonus: 0.05 },
}

export const PERK_ID_TO_TAG: Record<string, string> = {}

export function registerPerkTag(perkId: string, tag: string): void {
  PERK_ID_TO_TAG[perkId] = tag
}

export function mergeCombatEffects(
  a: PerkCombatEffects,
  b: PerkCombatEffects,
): PerkCombatEffects {
  const out: PerkCombatEffects = { ...a }
  for (const key of Object.keys(b) as (keyof PerkCombatEffects)[]) {
    const v = b[key]
    if (v === undefined) continue
    const prev = out[key]
    if (typeof v === 'number' && typeof prev === 'number') {
      out[key] = (prev + v) as never
    } else {
      out[key] = v as never
    }
  }
  return out
}
