/**
 * Character select scene art (place PNGs in /public/assets/character-select/).
 * Wire paths here, then reference from StarterSelectScreen / starters as needed.
 */
export const CHARACTER_SELECT_ASSETS = {
  /** Full-screen background for the save-slot character select screen. */
  background: '/assets/character-select/character-select-background.png',
  /** Title banner — replaces the “Character Select” heading text. */
  title: '/assets/character-select/character-select.png',
  /** Save-slot action buttons. */
  actions: {
    continue: '/assets/character-select/continue.png',
    rename: '/assets/character-select/rename.png',
    overwrite: '/assets/character-select/overwrite.png',
    deleteSave: '/assets/character-select/delete-save.png',
    back: '/assets/character-select/back.png',
    cloud1: '/assets/character-select/cloud%201.png',
    cloud2: '/assets/character-select/cloud%202.png',
  },
  /** Decorative frame for save slot cards. */
  slotFrame: '/assets/character-select/save-slot-frame2.png',
  /** Empty save slot decoration. */
  slotEmptyEmblem: '/assets/character-select/save-slot-empty-emblem.png',
  /** Filled-slot profile panel (portrait + stat rows) inside the frame. */
  slotProfileInfo: '/assets/character-select/selected-profile-info.png',
  /** Local-to-cloud upload frame panel. */
  localSaveCloudInfo: '/assets/character-select/local-save-cloud-info2.png',
  /** Per-starter card art (select-screen versions; can differ from in-run portraits). */
  portraits: {
    fire: '/assets/creatures/starters/fire-base.png',
    water: '/assets/creatures/starters/water-base.png',
    grass: '/assets/creatures/starters/grass-base.png',
    electric: '/assets/creatures/starters/electric-base.png',
    ground: '/assets/creatures/starters/ground-base.png',
  },
} as const

export type CharacterSelectStarterId = keyof typeof CHARACTER_SELECT_ASSETS.portraits
