/** @deprecated Import from `./profileSystem` instead. Re-exports for compatibility. */
export {
  createPlayerProfile,
  ensurePlayerProfile,
  getPlayerProfile,
  normalizeDisplayName,
  setProfileTutorialCompleted,
  updatePlayerDisplayName,
  updatePlayerDisplayName as updatePlayerProfile,
  validateDisplayName,
  PROFILE_TABLE_MISSING_MESSAGE,
  type PlayerProfile,
  type ProfileActionResult,
  type GetPlayerProfileResult,
} from './profileSystem'
