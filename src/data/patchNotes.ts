import { APP_VERSION } from './appVersion'

export type PatchNoteEntry = {
  version: string
  date: string
  title: string
  changes: string[]
}

/**
 * Patch history — add new entries at the top of this array.
 * `getPatchNotesNewestFirst()` also sorts by date descending for safety.
 */
export const PATCH_NOTES: PatchNoteEntry[] = [
  {
    version: 'v0.1.1-alpha',
    date: '2026-05-25',
    title: 'Combat and Council Update',
    changes: [
      'Fixed Monolith Council 2v2 combat lock when one enemy faints.',
      'Added Council fight XP, ability mastery, level-ups, and perk progression after each trial.',
      'Moved Monolith Council map node to the end of the route with HUD access button.',
      'Fixed Council unlock persistence on save load and new route generation.',
      'Improved event shop item variety and forge-only gear pricing.',
      'Fixed feedback report submission and version labeling.',
      'Improved combat and map UI sizing.',
    ],
  },
  {
    version: 'v0.1.0-alpha',
    date: '2026-05-21',
    title: 'Early Access Foundation',
    changes: [
      'Added Recovery Station with party healing.',
      'Added Quest Broker Mira and Recovery Station quests.',
      'Added Monolith Archive with daily rewards and quests.',
      'Added save file / trainer names per slot.',
      'Fixed Alpha event combat victory flow.',
      'Fixed quest completion notifications.',
      'Added Flee button in combat.',
      'Added current objective panel and expanded tutorial.',
      'Added patch notes and tester debug panel.',
    ],
  },
]

/** Newest patch notes first (by date, then array order). */
export function getPatchNotesNewestFirst(): PatchNoteEntry[] {
  return [...PATCH_NOTES].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    const aIndex = PATCH_NOTES.indexOf(a)
    const bIndex = PATCH_NOTES.indexOf(b)
    return aIndex - bIndex
  })
}

export const LATEST_PATCH_VERSION = getPatchNotesNewestFirst()[0]?.version ?? APP_VERSION
