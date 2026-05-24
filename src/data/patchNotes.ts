export type PatchNoteEntry = {
  version: string
  date: string
  changes: string[]
}

export const PATCH_NOTES: PatchNoteEntry[] = [
  {
    version: '0.1.0-alpha',
    date: '2026-05-21',
    changes: [
      'Added Recovery Station with party healing',
      'Added Quest Broker Mira and Recovery Station quests',
      'Added Monolith Archive with daily rewards and quests',
      'Added save file / trainer names per slot',
      'Fixed Alpha event combat victory flow',
      'Fixed quest completion notifications',
      'Added Flee button in combat',
      'Added current objective panel and expanded tutorial',
      'Added patch notes and tester debug panel',
    ],
  },
]

export const LATEST_PATCH_VERSION = PATCH_NOTES[0]?.version ?? '0.1.0-alpha'
