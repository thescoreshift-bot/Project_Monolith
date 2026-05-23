import { gameRandom } from '../utils/seededRandom'

export type EventChoiceId = 'a' | 'b'

export type GameEvent = {
  id: string
  title: string
  description: string
  choiceA: { label: string; summary: string }
  choiceB: { label: string; summary: string }
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'strange-monolith',
    title: 'Strange Monolith',
    description:
      'A pulsing monolith fragment hums beside the path. You feel it could sharpen your mind or fill your pockets.',
    choiceA: { label: 'Absorb knowledge', summary: 'Gain 15 XP' },
    choiceB: { label: 'Take coin resonance', summary: 'Gain 20 coins' },
  },
  {
    id: 'healing-spring',
    title: 'Healing Spring',
    description: 'Clear water gathers in a basin of living stone.',
    choiceA: { label: 'Bathe the party', summary: 'Heal all party 25% max HP' },
    choiceB: { label: 'Fortify starter', summary: 'Starter +5 max HP' },
  },
  {
    id: 'wandering-researcher',
    title: 'Wandering Researcher',
    description: 'A researcher offers data chips or coin for your route logs.',
    choiceA: { label: 'Trade logs for insight', summary: 'Gain 20 XP' },
    choiceB: { label: 'Sell route data', summary: 'Gain 30 coins' },
  },
  {
    id: 'lost-creature',
    title: 'Lost Creature',
    description: 'A timid creature watches from the brush, hoping for guidance.',
    choiceA: { label: 'Offer shelter', summary: '30% chance weak recruit joins' },
    choiceB: { label: 'Share training tips', summary: 'Gain 15 XP' },
  },
  {
    id: 'training-grounds',
    title: 'Training Grounds',
    description: 'Abandoned gym equipment still hums with kinetic memory.',
    choiceA: { label: 'Power drills', summary: 'Starter +3 ATK' },
    choiceB: { label: 'Defense drills', summary: 'Starter +3 DEF' },
  },
  {
    id: 'hidden-cache',
    title: 'Hidden Cache',
    description: 'A sealed supply pod lies half-buried in the ash dunes.',
    choiceA: { label: 'Crack it open', summary: 'Gain 40 coins' },
    choiceB: { label: 'Salvage parts', summary: 'Gain 20 coins and 10 XP' },
  },
  {
    id: 'risky-mutation',
    title: 'Risky Mutation',
    description: 'Volatile monolith spores swirl around your team.',
    choiceA: { label: 'Embrace mutation', summary: '+2 random stat, lose 10 HP' },
    choiceB: { label: 'Back away', summary: 'Leave safely' },
  },
  {
    id: 'badge-shrine',
    title: 'Badge Shrine',
    description: 'Ancient plaques honor gym champions of the region.',
    choiceA: { label: 'Meditate on badges', summary: '20 XP if you have a badge' },
    choiceB: { label: 'Draw shrine energy', summary: 'Heal 10 HP per badge' },
  },
  {
    id: 'friendly-trainer',
    title: 'Friendly Trainer',
    description: 'A trainer waves you down for a quick sparring offer.',
    choiceA: { label: 'Spar hard', summary: '20 XP but lose 10 HP' },
    choiceB: { label: 'Chat and trade', summary: 'Gain 15 coins' },
  },
  {
    id: 'ancient-nest',
    title: 'Ancient Nest',
    description: 'A deep nest reverberates with alpha energy.',
    choiceA: { label: 'Disturb the nest', summary: 'Fight alpha next (bonus rewards)' },
    choiceB: { label: 'Sneak past', summary: 'Leave safely' },
  },
]

export function pickRandomEvent(): GameEvent {
  const index = Math.floor(gameRandom() * GAME_EVENTS.length)
  return GAME_EVENTS[index]
}

export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((e) => e.id === id)
}
