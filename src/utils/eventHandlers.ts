import { pickRandomPerks } from '../data/perks'
import { pickRandomNormalEnemy } from '../data/enemies'
import { partyCreatureFromTemplate } from './party'
import type { PartyCreature } from './party'
import { healPartyToPercent } from './party'
import { getCoinReward } from './rewards'
import { addCoins, addXp, applyPerk, type RunCreature } from './progression'
export type EventContext = {
  starter: RunCreature
  recruits: PartyCreature[]
  earnedBadges: string[]
  regionId?: string
}

function eventCoins(
  type: 'eventSmall' | 'eventMedium' | 'eventLarge',
  regionId?: string,
): number {
  return getCoinReward(type, regionId)
}

export type EventResult = {
  starter: RunCreature
  recruits: PartyCreature[]
  earnedBadges: string[]
  pendingAlphaCombat?: boolean
  message?: string
}

const STAT_KEYS = ['atk', 'def', 'spAtk', 'spDef', 'spd'] as const

export function applyEventChoice(
  eventId: string,
  choice: 'a' | 'b',
  ctx: EventContext,
): EventResult {
  let { starter, recruits, earnedBadges, regionId } = ctx

  switch (eventId) {
    case 'strange-monolith':
      if (choice === 'a') starter = addXp(starter, 15).creature
      else starter = addCoins(starter, eventCoins('eventSmall', regionId))
      break
    case 'healing-spring': {
      const healed = healPartyToPercent(starter, recruits, 0.25)
      starter = healed.starter
      recruits = healed.recruits
      if (choice === 'b') {
        starter = {
          ...starter,
          maxHp: starter.maxHp + 5,
          stats: { ...starter.stats, hp: starter.stats.hp + 5 },
          currentHp: starter.currentHp + 5,
        }
      }
      break
    }
    case 'wandering-researcher':
      if (choice === 'a') {
        const perk = pickRandomPerks(1, starter.selectedPerks)[0]
        if (perk) starter = applyPerk(starter, perk.id)
        else starter = addXp(starter, 20).creature
      } else starter = addCoins(starter, eventCoins('eventMedium', regionId))
      break
    case 'lost-creature':
      if (choice === 'a' && Math.random() < 0.3) {
        const enemy = pickRandomNormalEnemy()
        const recruit = partyCreatureFromTemplate({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          level: enemy.level,
          maxHp: enemy.maxHp,
          stats: { ...enemy.stats, hp: enemy.maxHp },
          abilityId: enemy.abilityIds[0],
        })
        return {
          starter,
          recruits: [...recruits, recruit].slice(0, 2),
          earnedBadges,
          message: `${recruit.name} joined your party!`,
        }
      }
      if (choice === 'b') starter = addXp(starter, 15).creature
      break
    case 'training-grounds':
      if (choice === 'a') {
        starter = {
          ...starter,
          stats: { ...starter.stats, atk: starter.stats.atk + 3 },
        }
      } else {
        starter = {
          ...starter,
          stats: { ...starter.stats, def: starter.stats.def + 3 },
        }
      }
      break
    case 'hidden-cache':
      if (choice === 'a') starter = addCoins(starter, eventCoins('eventLarge', regionId))
      else {
        starter = addCoins(addXp(starter, 10).creature, eventCoins('eventSmall', regionId))
      }
      break
    case 'risky-mutation':
      if (choice === 'a') {
        const key = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)]
        starter = {
          ...starter,
          stats: { ...starter.stats, [key]: starter.stats[key] + 2 },
          currentHp: Math.max(1, starter.currentHp - 10),
        }
      }
      break
    case 'badge-shrine':
      if (choice === 'a') {
        if (earnedBadges.length > 0) starter = addXp(starter, 20).creature
      } else {
        const healEach = earnedBadges.length * 10
        starter = {
          ...starter,
          currentHp: Math.min(starter.maxHp, starter.currentHp + healEach),
        }
        recruits = recruits.map((r) => ({
          ...r,
          currentHp: Math.min(r.maxHp, r.currentHp + healEach),
        }))
      }
      break
    case 'friendly-trainer':
      if (choice === 'a') {
        starter = addXp(starter, 20).creature
        starter = {
          ...starter,
          currentHp: Math.max(1, starter.currentHp - 10),
        }
      } else starter = addCoins(starter, getCoinReward('eventSmall'))
      break
    case 'ancient-nest':
      if (choice === 'a') {
        return { starter, recruits, earnedBadges, pendingAlphaCombat: true }
      }
      break
    default:
      if (choice === 'a') starter = addXp(starter, 10).creature
      else starter = addCoins(starter, eventCoins('eventSmall', regionId))
  }

  return { starter, recruits, earnedBadges }
}
