/**
 * Early-game tuning (levels 1–10). Adjust these when playtesting the first 10–15 minutes.
 * Damage caps are applied in damageBalance.ts using these fractions.
 */

/** Target turn count for a level-1 normal battle. */
export const TARGET_L1_BATTLE_TURNS_MIN = 3
export const TARGET_L1_BATTLE_TURNS_MAX = 6

/** Max fraction of defender max HP a single L1–3 normal hit can deal (non-super). */
export const L1_NORMAL_HIT_CAP_FRACTION = 0.32
export const L1_SUPER_HIT_CAP_FRACTION = 0.4

/** Max fraction for L4–5 normals. */
export const L5_NORMAL_HIT_CAP_FRACTION = 0.35
export const L5_SUPER_HIT_CAP_FRACTION = 0.42

/** Enemy ability power caps at low levels (see damageBalance.getEnemyAbilityPowerCap). */
export const ENEMY_POWER_CAP_L1_3 = 12
export const ENEMY_POWER_CAP_L4_5 = 16

/** Base battle XP before region scaling. */
export const EARLY_BATTLE_XP_BASE = 22

/** Coin range for normal battles (before region scale). */
export const EARLY_BATTLE_COINS_MIN = 6
export const EARLY_BATTLE_COINS_MAX = 9
