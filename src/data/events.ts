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
    choiceA: { label: 'Trade logs for insight', summary: 'Gain a random perk (or 20 XP)' },
    choiceB: { label: 'Sell route data', summary: 'Gain coins and supplies' },
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
    choiceB: { label: 'Chat and trade', summary: 'Gain coins' },
  },
  {
    id: 'ancient-nest',
    title: 'Ancient Nest',
    description: 'A deep nest reverberates with alpha energy.',
    choiceA: { label: 'Disturb the nest', summary: 'Fight alpha next (bonus rewards)' },
    choiceB: { label: 'Sneak past', summary: 'Take an Alpha Claw' },
  },
  {
    id: 'mysterious-egg',
    title: 'Mysterious Egg',
    description:
      'A warm egg pulses in a nest of monolith ash. Something strong might hatch — or you could sell it.',
    choiceA: { label: 'Hatch the egg', summary: 'A recruitable joins your party' },
    choiceB: { label: 'Sell the egg', summary: 'Gain coins' },
  },
  {
    id: 'relic-cache',
    title: 'Relic Cache',
    description: 'A sealed vault of pre-collapse gear hums when you approach.',
    choiceA: { label: 'Pry it open', summary: 'Rare+ gear (or 25 XP fallback)' },
    choiceB: { label: 'Strip the casing', summary: 'Large coin payout' },
  },
  {
    id: 'monolith-veteran',
    title: 'Monolith Veteran',
    description:
      'A scarred traveler offers a title of witness — or a restorative ritual.',
    choiceA: {
      label: 'Accept the title',
      summary: 'Title + Monolith Resonance perk',
    },
    choiceB: { label: 'Rest with them', summary: 'Heal party 40% max HP' },
  },
  {
    id: 'storm-forge',
    title: 'Storm Forge',
    description: 'Lightning forges gear in the open air. One strike could arm you.',
    choiceA: { label: 'Catch the spark', summary: 'Epic gear (or XP fallback)' },
    choiceB: { label: 'Harvest scrap', summary: 'Gain coins' },
  },
]

export function pickRandomEvent(): GameEvent {
  const index = Math.floor(gameRandom() * GAME_EVENTS.length)
  return GAME_EVENTS[index]
}

export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((e) => e.id === id)
}
