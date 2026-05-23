import type { AbilityMasteryPerk } from './abilityMasteryPerks'

function perk(
  id: string,
  abilityId: string,
  name: string,
  description: string,
  rankMinimum: number,
  pathTag: AbilityMasteryPerk['pathTag'],
  effects: AbilityMasteryPerk['effects'],
): AbilityMasteryPerk {
  return { id, abilityId, name, description, rankMinimum, pathTag, effects }
}

export const SUPPORT_ABILITY_MASTERY_PERKS: AbilityMasteryPerk[] = [
  // Soft Growl — enemy ATK debuff
  perk('sg-intimidating-echo', 'soft-growl', 'Intimidating Echo', 'Soft Growl lowers foe ATK by 2 stages instead of 1.', 2, 'status', { statStageBonus: 1 }),
  perk('sg-lingering-fear', 'soft-growl', 'Lingering Fear', 'Soft Growl also lowers foe SPD by 1 stage.', 3, 'status', { statStageBonus: 1 }),
  perk('sg-reliable-pressure', 'soft-growl', 'Reliable Pressure', '+10% accuracy for Soft Growl.', 4, 'utility', { bonusAccuracy: 10 }),
  perk('sg-team-opening', 'soft-growl', 'Team Opening', 'After Soft Growl, your next attack deals +10% damage (planned).', 6, 'hybrid', { bonusDamagePercent: 0.1 }),
  perk('sg-deeper-cut', 'soft-growl', 'Deeper Cut', 'Soft Growl debuffs apply +1 extra stage.', 7, 'status', { statStageBonus: 1 }),
  perk('sg-crippling-cry', 'soft-growl', 'Crippling Cry', '+15% accuracy; debuff stages +1.', 9, 'status', { bonusAccuracy: 15, statStageBonus: 1 }),

  // Gentle Cry
  perk('gc-hushed-echo', 'gentle-cry', 'Hushed Echo', 'Gentle Cry lowers foe ATK by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('gc-mist-chill', 'gentle-cry', 'Mist Chill', 'Also lowers foe accuracy by 1 stage (planned).', 3, 'status', { statStageBonus: 1 }),
  perk('gc-calm-surf', 'gentle-cry', 'Calm Surf', '+10 accuracy.', 4, 'utility', { bonusAccuracy: 10 }),
  perk('gc-soothing-tone', 'gentle-cry', 'Soothing Tone', 'Debuff stages +1.', 6, 'status', { statStageBonus: 1 }),

  // Root Snare
  perk('rs-deep-roots', 'root-snare', 'Deep Roots', 'Root Snare lowers foe SPD by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('rs-snare-mist', 'root-snare', 'Snare Mist', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('rs-tangling', 'root-snare', 'Tangling Growth', 'SPD debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Leaf Guard
  perk('lg-thick-leaves', 'leaf-guard', 'Thick Leaves', 'Leaf Guard raises DEF by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('lg-sap-recovery', 'leaf-guard', 'Sap Recovery', 'Heal 5% max HP when using Leaf Guard.', 3, 'utility', { healOnHitPercent: 0.05 }),
  perk('lg-shared-shade', 'leaf-guard', 'Shared Shade', 'DEF buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),

  // Quick Charge
  perk('qc-surge', 'quick-charge', 'Surge', 'Quick Charge raises SPD by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('qc-static-momentum', 'quick-charge', 'Static Momentum', 'Next Electric attack +10% damage (planned).', 3, 'hybrid', { bonusDamagePercent: 0.1 }),
  perk('qc-overclock', 'quick-charge', 'Overclock', 'SPD buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),

  // Sharp Chirp — foe DEF debuff
  perk('sc-piercing-chirp', 'sharp-chirp', 'Piercing Chirp', 'Sharp Chirp lowers foe DEF by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('sc-echo', 'sharp-chirp', 'Echo', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('sc-exposed', 'sharp-chirp', 'Exposed Target', 'DEF debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Low Rumble
  perk('lr-deep-rumble', 'low-rumble', 'Deep Rumble', 'Low Rumble lowers foe ATK by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('lr-aftershock', 'low-rumble', 'Aftershock', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('lr-quake-echo', 'low-rumble', 'Quake Echo', 'ATK debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Harden Hide
  perk('hh-reinforced-shell', 'harden-hide', 'Reinforced Shell', 'Harden Hide raises DEF by 3 stages total (+1 from mastery).', 2, 'utility', { statStageBonus: 1 }),
  perk('hh-safe-setup', 'harden-hide', 'Safe Setup', 'Heal 5% max HP when using Harden Hide.', 3, 'utility', { healOnHitPercent: 0.05 }),
  perk('hh-stone-skin', 'harden-hide', 'Stone Skin', 'DEF buff +1 stage.', 4, 'utility', { statStageBonus: 1 }),
  perk('hh-momentum', 'harden-hide', 'Momentum', 'Next attack +10% damage (planned).', 7, 'hybrid', { bonusDamagePercent: 0.1 }),

  // Mist Veil
  perk('mv-thick-mist', 'mist-veil', 'Thick Mist', 'Mist Veil raises evasion by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('mv-veil-heal', 'mist-veil', 'Veil Heal', 'Heal 4% max HP on use.', 3, 'utility', { healOnHitPercent: 0.04 }),
  perk('mv-shroud', 'mist-veil', 'Shroud', 'Evasion buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),

  // Smoke Flicker
  perk('sf-blinding-smoke', 'smoke-flicker', 'Blinding Smoke', 'Smoke Flicker lowers foe accuracy by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('sf-choking-haze', 'smoke-flicker', 'Choking Haze', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('sf-smoke-wall', 'smoke-flicker', 'Smoke Wall', 'Accuracy debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Dust Cloud
  perk('dc-blinding-dust', 'dust-cloud', 'Blinding Dust', 'Dust Cloud lowers accuracy by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('dc-dust-storm', 'dust-cloud', 'Dust Storm', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('dc-choke', 'dust-cloud', 'Choke', 'Accuracy debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Soothing Rain
  perk('sr-wider-rainfall', 'soothing-rain', 'Wider Rainfall', 'Soothing Rain heals 25% more.', 2, 'utility', { healBonusPercent: 0.2 }),
  perk('sr-cleanse-mist', 'soothing-rain', 'Cleanse Mist', 'Heal 30% max HP (improved heal).', 3, 'utility', { healBonusPercent: 0.1 }),
  perk('sr-gentle-pour', 'soothing-rain', 'Gentle Pour', '+10 accuracy.', 4, 'utility', { bonusAccuracy: 10 }),
  perk('sr-party-mist', 'soothing-rain', 'Party Mist', 'Also heals active helper 50% (planned).', 6, 'utility', { healBonusPercent: 0.15 }),

  // Stone Guard
  perk('sguard-bulwark', 'stone-guard', 'Bulwark', 'Stone Guard raises DEF by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('sguard-ward-pulse', 'stone-guard', 'Ward Pulse', 'Heal 4% on use.', 3, 'utility', { healOnHitPercent: 0.04 }),
  perk('sguard-fortress', 'stone-guard', 'Fortress', 'DEF buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),

  // Heat Veil
  perk('hv-heat-shield', 'heat-veil', 'Heat Shield', 'Heat Veil raises DEF by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('hv-warm-pulse', 'heat-veil', 'Warm Pulse', 'Heal 4% on use.', 3, 'utility', { healOnHitPercent: 0.04 }),
  perk('hv-flare-guard', 'heat-veil', 'Flare Guard', 'DEF buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),

  // Barkskin
  perk('bk-thick-bark', 'barkskin', 'Thick Bark', 'Barkskin DEF buff +1 stage; ATK debuff +1 stage.', 2, 'utility', { statStageBonus: 1 }),
  perk('bk-rooted', 'barkskin', 'Rooted', 'Heal 5% on use.', 3, 'utility', { healOnHitPercent: 0.05 }),
  perk('bk-overgrowth', 'barkskin', 'Overgrowth', '+10 accuracy.', 4, 'utility', { bonusAccuracy: 10 }),

  // Spore Cloud
  perk('sp-toxic-spore', 'spore-cloud', 'Toxic Spore', 'Poison chance +15%.', 2, 'status', { statusChanceBonus: 15 }),
  perk('sp-deep-spore', 'spore-cloud', 'Deep Spore', 'Poison chance +10%, +10 accuracy.', 3, 'status', { statusChanceBonus: 10, bonusAccuracy: 10 }),
  perk('sp-cloud-burst', 'spore-cloud', 'Cloud Burst', 'Status chance +15%.', 6, 'status', { statusChanceBonus: 15 }),

  // Static Veil
  perk('sv-charged-veil', 'static-veil', 'Charged Veil', 'Static Veil raises SP.ATK by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('sv-static-guard', 'static-veil', 'Static Guard', 'SP.ATK buff +1 stage.', 3, 'utility', { statStageBonus: 1 }),
  perk('sv-focus-coil', 'static-veil', 'Focus Coil', '+10 accuracy.', 6, 'utility', { bonusAccuracy: 10 }),

  // Overcharge
  perk('oc-risk-reward', 'overcharge', 'Risk Reward', 'ATK buff +1 stage (net stronger setup).', 2, 'hybrid', { statStageBonus: 1 }),
  perk('oc-surge-guard', 'overcharge', 'Surge Guard', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('oc-overload', 'overcharge', 'Overload', 'ATK buff +1 stage.', 6, 'hybrid', { statStageBonus: 1 }),

  // Scorching Cry
  perk('scr-searing-voice', 'scorching-cry', 'Searing Voice', 'Scorching Cry lowers foe SP.DEF by 2 stages.', 2, 'status', { statStageBonus: 1 }),
  perk('scr-heat-wave', 'scorching-cry', 'Heat Wave', '+10 accuracy.', 3, 'utility', { bonusAccuracy: 10 }),
  perk('scr-melt-armor', 'scorching-cry', 'Melt Armor', 'SP.DEF debuff +1 stage.', 6, 'status', { statStageBonus: 1 }),

  // Drench Guard
  perk('dg-tide-ward', 'drench-guard', 'Tide Ward', 'Drench Guard raises DEF by 2 stages.', 2, 'utility', { statStageBonus: 1 }),
  perk('dg-rain-shell', 'drench-guard', 'Rain Shell', 'Heal 4% on use.', 3, 'utility', { healOnHitPercent: 0.04 }),
  perk('dg-deep-guard', 'drench-guard', 'Deep Guard', 'DEF buff +1 stage.', 6, 'utility', { statStageBonus: 1 }),
]
