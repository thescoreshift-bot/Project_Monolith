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
  /** Items to add to trainer inventory after the event */
  inventoryAdds?: Array<{ itemId: string; quantity?: number }>
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
      else {
        starter = addCoins(starter, eventCoins('eventSmall', regionId))
        return {
          starter,
          recruits,
          earnedBadges,
          inventoryAdds: [{ itemId: 'monolith-fragment', quantity: 1 }],
          message: 'Found a Monolith Fragment!',
        }
      }
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
      } else {
        starter = addCoins(starter, eventCoins('eventMedium', regionId))
        const gift =
          Math.random() < 0.5 ? 'small-potion' : 'monolith-fragment'
        return {
          starter,
          recruits,
          earnedBadges,
          inventoryAdds: [{ itemId: gift, quantity: 1 }],
          message: 'Researcher shared supplies.',
        }
      }
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
    case 'hidden-cache': {
      const cacheItems = [
        'small-potion',
        'ember-scale',
        'wild-seed',
        'tide-pearl',
        'volt-thread',
      ]
      const foundId = cacheItems[Math.floor(Math.random() * cacheItems.length)]
      if (choice === 'a') {
        starter = addCoins(starter, eventCoins('eventLarge', regionId))
        return {
          starter,
          recruits,
          earnedBadges,
          inventoryAdds: [{ itemId: foundId, quantity: 1 }],
          message: 'Cache opened — coins and supplies!',
        }
      }
      starter = addCoins(addXp(starter, 10).creature, eventCoins('eventSmall', regionId))
      return {
        starter,
        recruits,
        earnedBadges,
        inventoryAdds: [{ itemId: foundId, quantity: 1 }],
        message: 'Salvaged parts from the cache.',
      }
    }
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
      return {
        starter,
        recruits,
        earnedBadges,
        inventoryAdds: [{ itemId: 'material-alpha-claw', quantity: 1 }],
        message: 'Found an Alpha Claw in the abandoned nest.',
      }
    default:
      if (choice === 'a') starter = addXp(starter, 10).creature
      else starter = addCoins(starter, eventCoins('eventSmall', regionId))
  }

  return { starter, recruits, earnedBadges }
}
