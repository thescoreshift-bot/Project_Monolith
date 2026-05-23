export type TutorialStepId =
  | 'chooseStarter'
  | 'clickBattleNode'
  | 'useAbility'
  | 'winBattle'
  | 'choosePerk'
  | 'masteryProgress'
  | 'evolutionPath'
  | 'nextNode'

export const TUTORIAL_STEP_ORDER: TutorialStepId[] = [
  'chooseStarter',
  'clickBattleNode',
  'useAbility',
  'winBattle',
  'choosePerk',
  'masteryProgress',
  'evolutionPath',
  'nextNode',
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
    body: 'Pick a creature, then confirm. Your starter is always active in combat.',
  },
  clickBattleNode: {
    id: 'clickBattleNode',
    title: 'Start a battle',
    body: 'Click an available Battle node on the map (highlighted nodes).',
  },
  useAbility: {
    id: 'useAbility',
    title: 'Use an ability',
    body: 'Tap an ability card in the 2×2 grid. Damage moves show estimated damage; support moves show their effect.',
  },
  winBattle: {
    id: 'winBattle',
    title: 'Win the fight',
    body: 'Defeat the enemy by reducing their HP to zero. Starter acts first, then your helper if you have one.',
  },
  choosePerk: {
    id: 'choosePerk',
    title: 'Pick a perk',
    body: 'After leveling up you may draft a perk. Perks shape stats and evolution path for that creature only.',
  },
  masteryProgress: {
    id: 'masteryProgress',
    title: 'Ability mastery',
    body: 'Using abilities earns mastery XP. Rank ups unlock perks and transformations — check the battle log after each use.',
  },
  evolutionPath: {
    id: 'evolutionPath',
    title: 'Evolution path',
    body: 'Perks and battles build evolution scores. The dominant path (Offense, Defense, etc.) decides how your creature evolves.',
  },
  nextNode: {
    id: 'nextNode',
    title: 'Keep exploring',
    body: 'Return to the map and pick your next node — battles, shops, rest, or events.',
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
