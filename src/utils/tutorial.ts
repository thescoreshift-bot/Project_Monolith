export type TutorialStepId =
  | 'chooseStarter'
  | 'openMap'
  | 'clickBattleNode'
  | 'useAbility'
  | 'combatBasics'
  | 'winBattle'
  | 'claimRewards'
  | 'choosePerk'
  | 'masteryProgress'
  | 'evolutionPath'
  | 'nextNode'
  | 'recoveryStation'
  | 'monolithArchive'

export const TUTORIAL_STEP_ORDER: TutorialStepId[] = [
  'chooseStarter',
  'openMap',
  'clickBattleNode',
  'useAbility',
  'combatBasics',
  'winBattle',
  'claimRewards',
  'choosePerk',
  'masteryProgress',
  'evolutionPath',
  'nextNode',
  'recoveryStation',
  'monolithArchive',
]

export type TutorialStepContent = {
  id: TutorialStepId
  title: string
  body: string
}

export const TUTORIAL_STEPS: Record<TutorialStepId, TutorialStepContent> = {
  chooseStarter: {
    id: 'chooseStarter',
    title: 'Choose your starter',
    body: 'Pick a creature and confirm. Your starter leads every battle and earns its own XP.',
  },
  openMap: {
    id: 'openMap',
    title: 'Your route map',
    body: 'This is your run map. Highlighted nodes are available — battles, shops, rest, and events branch from here.',
  },
  clickBattleNode: {
    id: 'clickBattleNode',
    title: 'Start a battle',
    body: 'Click an available Battle node (glowing on the map) to fight wild creatures.',
  },
  useAbility: {
    id: 'useAbility',
    title: 'Use an ability',
    body: 'Tap an ability card in the grid. Damage moves show estimated damage; support moves show their effect.',
  },
  combatBasics: {
    id: 'combatBasics',
    title: 'HP and types',
    body: 'Watch HP bars — at 0 HP a creature faints. Strong vs weak types deal more damage (shown on ability cards).',
  },
  winBattle: {
    id: 'winBattle',
    title: 'Win the fight',
    body: 'Reduce the enemy HP to zero. Your starter acts first, then your helper recruit if you have one.',
  },
  claimRewards: {
    id: 'claimRewards',
    title: 'Claim rewards',
    body: 'After victory you get coins, XP, and sometimes items. Press Continue to return to the map.',
  },
  choosePerk: {
    id: 'choosePerk',
    title: 'Pick a perk',
    body: 'Level-ups may offer perk drafts. Perks boost stats and shape that creature’s evolution path only.',
  },
  masteryProgress: {
    id: 'masteryProgress',
    title: 'Ability mastery',
    body: 'Using abilities earns mastery XP. Rank-ups unlock perks and transformations — check the battle log.',
  },
  evolutionPath: {
    id: 'evolutionPath',
    title: 'Evolution path',
    body: 'Perks and battles build evolution scores. The dominant path decides how your creature evolves.',
  },
  nextNode: {
    id: 'nextNode',
    title: 'Keep exploring',
    body: 'Back on the map, pick your next node. The Current Objective panel suggests what to do next.',
  },
  recoveryStation: {
    id: 'recoveryStation',
    title: 'Recovery Station',
    body: 'Open Recovery Station from the map to heal your party and visit Quest Broker Mira for quests.',
  },
  monolithArchive: {
    id: 'monolithArchive',
    title: 'Monolith Archive',
    body: 'From the main menu, open Monolith Archive for daily login rewards, quests, and the creature collection.',
  },
}

export function getTutorialStepIndex(step: TutorialStepId): number {
  return TUTORIAL_STEP_ORDER.indexOf(step)
}

export function getNextTutorialStep(
  step: TutorialStepId,
): TutorialStepId | null {
  const idx = getTutorialStepIndex(step)
  if (idx < 0 || idx >= TUTORIAL_STEP_ORDER.length - 1) return null
  return TUTORIAL_STEP_ORDER[idx + 1]
}
