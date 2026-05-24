export type ArchiveQuestTrackEvent =
  | 'battleWon'
  | 'nodeCleared'
  | 'abilityUsed'
  | 'creatureRecruited'
  | 'eliteOrAlphaDefeated'
  | 'recoveryUsed'
  | 'gearEquipped'
  | 'abilityMasteryXp'
  | 'pvpWon'
  | 'eventCompleted'
  | 'dailyRunCompleted'
  | 'leaderboardSubmitted'
  | 'badgeEarned'
  | 'alphaDefeated'
  | 'bossDefeated'
  | 'masteryLevelReached'

export type ArchiveQuestDefinition = {
  id: string
  title: string
  description: string
  event: ArchiveQuestTrackEvent
  required: number
  /** For weekly quests */
  weekly?: boolean
  /** Optional filter e.g. nodeType=event */
  filter?: string
}

export const DAILY_ARCHIVE_QUEST_POOL: ArchiveQuestDefinition[] = [
  { id: 'daily-win-3', title: 'Route Sweeper', description: 'Win 3 battles.', event: 'battleWon', required: 3 },
  { id: 'daily-events-2', title: 'Event Walker', description: 'Clear 2 event nodes.', event: 'nodeCleared', required: 2, filter: 'event' },
  { id: 'daily-abilities-10', title: 'Learn the Flow', description: 'Use 10 abilities in combat.', event: 'abilityUsed', required: 10 },
  { id: 'daily-recruit-1', title: 'New Ally', description: 'Recruit 1 creature.', event: 'creatureRecruited', required: 1 },
  { id: 'daily-elite-1', title: 'Elite Hunter', description: 'Defeat 1 elite or alpha encounter.', event: 'eliteOrAlphaDefeated', required: 1 },
  { id: 'daily-recovery-1', title: 'Recovery Stop', description: 'Use the Recovery Station.', event: 'recoveryUsed', required: 1 },
  { id: 'daily-gear-1', title: 'Gear Up', description: 'Equip 1 gear item.', event: 'gearEquipped', required: 1 },
  { id: 'daily-mastery-xp', title: 'Practice Makes Perfect', description: 'Earn 100 ability mastery XP.', event: 'abilityMasteryXp', required: 100 },
  { id: 'daily-pvp-1', title: 'Friend Duel', description: 'Win 1 friend-code battle.', event: 'pvpWon', required: 1 },
]

export const WEEKLY_ARCHIVE_QUEST_POOL: ArchiveQuestDefinition[] = [
  { id: 'weekly-win-25', title: 'War Path', description: 'Win 25 battles.', event: 'battleWon', required: 25, weekly: true },
  { id: 'weekly-alpha-5', title: 'Alpha Breaker', description: 'Defeat 5 Alpha Nests.', event: 'alphaDefeated', required: 5, weekly: true },
  { id: 'weekly-badges-3', title: 'Badge Rush', description: 'Earn 3 badges.', event: 'badgeEarned', required: 3, weekly: true },
  { id: 'weekly-daily-runs-3', title: 'Daily Devotee', description: 'Complete 3 daily runs.', event: 'dailyRunCompleted', required: 3, weekly: true },
  { id: 'weekly-recruit-5', title: 'Recruitment Drive', description: 'Recruit 5 creatures.', event: 'creatureRecruited', required: 5, weekly: true },
  { id: 'weekly-mastery-5', title: 'Mastery Milestone', description: 'Reach Mastery Lv. 5 on any ability.', event: 'masteryLevelReached', required: 5, weekly: true },
  { id: 'weekly-leaderboard-3', title: 'Scoreboard Regular', description: 'Submit 3 leaderboard scores.', event: 'leaderboardSubmitted', required: 3, weekly: true },
  { id: 'weekly-pvp-5', title: 'Gauntlet Victor', description: 'Win 5 friend-code battles.', event: 'pvpWon', required: 5, weekly: true },
]

export const ARCHIVE_QUEST_BY_ID = Object.fromEntries(
  [...DAILY_ARCHIVE_QUEST_POOL, ...WEEKLY_ARCHIVE_QUEST_POOL].map((q) => [q.id, q]),
) as Record<string, ArchiveQuestDefinition>
