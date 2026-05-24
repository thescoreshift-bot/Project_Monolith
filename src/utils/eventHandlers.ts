import { ENEMY_TEMPLATES } from '../data/enemies'
import { getPerk, pickPerksForCreature, resolveCreatureSpeciesKey } from '../data/perks'
import { getTitleDefinition } from '../data/titles'
import { partyCreatureFromTemplate } from './party'
import type { PartyCreature } from './party'
import { healPartyToPercent } from './party'
import { getCoinReward } from './rewards'
import {
  addCoins,
  addXp,
  applyPerk,
  recalculateStats,
  type RunCreature,
} from './progression'
import type { StarterStats } from '../data/starters'
import { rollEventGearDrop } from './gearSystem'

export type EventContext = {
  starter: RunCreature
  recruits: PartyCreature[]
  earnedBadges: string[]
  regionId?: string
}

export type EventRewardLine = {
  kind:
    | 'xp'
    | 'coins'
    | 'heal'
    | 'item'
    | 'gear'
    | 'recruit'
    | 'stat'
    | 'perk'
    | 'title'
    | 'info'
  text: string
}

export type EventResult = {
  starter: RunCreature
  recruits: PartyCreature[]
  earnedBadges: string[]
  rewardLines: EventRewardLine[]
  pendingAlphaCombat?: boolean
  message?: string
  inventoryAdds?: Array<{ itemId: string; quantity?: number }>
  gearAdds?: string[]
  titleGrant?: string
}

const STAT_KEYS = ['atk', 'def', 'spAtk', 'spDef', 'spd'] as const

const RECRUITABLE_TEMPLATE_IDS = [
  'bristlebug',
  'ashling',
  'pebblemaw',
  'driftwisp',
  'voltimp',
] as const

function eventCoins(
  type: 'eventSmall' | 'eventMedium' | 'eventLarge',
  regionId?: string,
): number {
  return getCoinReward(type, regionId)
}

function pushLine(
  lines: EventRewardLine[],
  line: EventRewardLine,
): EventRewardLine[] {
  return [...lines, line]
}

function applyXpReward(
  starter: RunCreature,
  amount: number,
  lines: EventRewardLine[],
): { starter: RunCreature; lines: EventRewardLine[] } {
  const beforeLevel = starter.level
  const { creature, leveledUp } = addXp(starter, amount)
  let nextLines = pushLine(lines, {
    kind: 'xp',
    text: leveledUp
      ? `+${amount} XP (level ${beforeLevel} → ${creature.level}!)`
      : `+${amount} XP`,
  })
  return { starter: creature, lines: nextLines }
}

function applyCoinReward(
  starter: RunCreature,
  amount: number,
  lines: EventRewardLine[],
): { starter: RunCreature; lines: EventRewardLine[] } {
  return {
    starter: addCoins(starter, amount),
    lines: pushLine(lines, { kind: 'coins', text: `+${amount} coins` }),
  }
}

function buffBaseStat(
  creature: RunCreature,
  key: keyof StarterStats,
  amount: number,
): RunCreature {
  const newBase = {
    ...creature.baseStats,
    [key]: (creature.baseStats[key] ?? 0) + amount,
  }
  const stats = recalculateStats(newBase, creature.selectedPerks)
  const maxHp = stats.hp
  const hpGain = key === 'hp' ? amount : 0
  return {
    ...creature,
    baseStats: newBase,
    stats,
    maxHp,
    currentHp: Math.min(maxHp, creature.currentHp + hpGain),
  }
}

function pickRecruitableTemplateId(): string {
  const idx = Math.floor(Math.random() * RECRUITABLE_TEMPLATE_IDS.length)
  return RECRUITABLE_TEMPLATE_IDS[idx] ?? 'voltimp'
}

function recruitFromTemplate(
  templateId: string,
  partyLevel: number,
): PartyCreature | null {
  const template = ENEMY_TEMPLATES[templateId]
  if (!template) return null
  const level = Math.max(1, Math.min(partyLevel, 12))
  return partyCreatureFromTemplate({
    id: template.id,
    name: template.name,
    type: template.type,
    level,
    maxHp: template.maxHp,
    stats: { ...template.stats, hp: template.maxHp },
    abilityId: template.abilityIds[0],
  })
}

export function formatEventRewardMessage(lines: EventRewardLine[]): string {
  if (lines.length === 0) return 'The event left no lasting effect.'
  return `Rewards: ${lines.map((l) => l.text).join(' · ')}`
}

function baseResult(
  starter: RunCreature,
  recruits: PartyCreature[],
  earnedBadges: string[],
  rewardLines: EventRewardLine[],
  extra?: Partial<EventResult>,
): EventResult {
  return {
    starter,
    recruits,
    earnedBadges,
    rewardLines,
    ...extra,
  }
}

export function applyEventChoice(
  eventId: string,
  choice: 'a' | 'b',
  ctx: EventContext,
): EventResult {
  let { starter, recruits, earnedBadges, regionId } = ctx
  let rewardLines: EventRewardLine[] = []

  switch (eventId) {
    case 'strange-monolith':
      if (choice === 'a') {
        const xp = applyXpReward(starter, 15, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
      } else {
        const coins = eventCoins('eventSmall', regionId)
        const coinResult = applyCoinReward(starter, coins, rewardLines)
        starter = coinResult.starter
        rewardLines = coinResult.lines
        rewardLines = pushLine(rewardLines, {
          kind: 'item',
          text: 'Monolith Fragment',
        })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          inventoryAdds: [{ itemId: 'monolith-fragment', quantity: 1 }],
        })
      }
      break
    case 'healing-spring': {
      const healed = healPartyToPercent(starter, recruits, 0.25)
      starter = healed.starter
      recruits = healed.recruits
      rewardLines = pushLine(rewardLines, {
        kind: 'heal',
        text: 'Party healed 25% max HP',
      })
      if (choice === 'b') {
        starter = buffBaseStat(starter, 'hp', 5)
        rewardLines = pushLine(rewardLines, {
          kind: 'stat',
          text: 'Starter +5 max HP',
        })
      }
      break
    }
    case 'wandering-researcher':
      if (choice === 'a') {
        const perk = pickPerksForCreature(
          resolveCreatureSpeciesKey({
            starterTypeId: starter.starterTypeId,
            type: starter.type,
          }),
          starter.selectedPerks,
          1,
        )[0]
        if (perk) {
          starter = applyPerk(starter, perk.id)
          rewardLines = pushLine(rewardLines, {
            kind: 'perk',
            text: `Perk: ${perk.name}`,
          })
        } else {
          const xp = applyXpReward(starter, 20, rewardLines)
          starter = xp.starter
          rewardLines = xp.lines
        }
      } else {
        const coins = eventCoins('eventMedium', regionId)
        const coinResult = applyCoinReward(starter, coins, rewardLines)
        starter = coinResult.starter
        rewardLines = coinResult.lines
        const gift =
          Math.random() < 0.5 ? 'small-potion' : 'monolith-fragment'
        rewardLines = pushLine(rewardLines, {
          kind: 'item',
          text: gift === 'small-potion' ? 'Small Potion' : 'Monolith Fragment',
        })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          inventoryAdds: [{ itemId: gift, quantity: 1 }],
        })
      }
      break
    case 'lost-creature':
      if (choice === 'a') {
        if (Math.random() < 0.35) {
          const recruit = recruitFromTemplate(
            pickRecruitableTemplateId(),
            starter.level,
          )
          if (recruit) {
            rewardLines = pushLine(rewardLines, {
              kind: 'recruit',
              text: `${recruit.name} joined the party`,
            })
            return baseResult(
              starter,
              [...recruits, recruit].slice(0, 2),
              earnedBadges,
              rewardLines,
            )
          }
        }
        rewardLines = pushLine(rewardLines, {
          kind: 'info',
          text: 'The creature slipped away',
        })
      } else {
        const xp = applyXpReward(starter, 15, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
      }
      break
    case 'mysterious-egg':
      if (choice === 'a') {
        const recruit = recruitFromTemplate(
          pickRecruitableTemplateId(),
          starter.level,
        )
        if (recruit) {
          rewardLines = pushLine(rewardLines, {
            kind: 'recruit',
            text: `${recruit.name} hatched from the egg`,
          })
          return baseResult(
            starter,
            [...recruits, recruit].slice(0, 2),
            earnedBadges,
            rewardLines,
          )
        }
        rewardLines = pushLine(rewardLines, {
          kind: 'info',
          text: 'The egg was empty',
        })
      } else {
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventMedium', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
      }
      break
    case 'relic-cache': {
      const gear = rollEventGearDrop('rare')
      if (choice === 'a' && gear) {
        rewardLines = pushLine(rewardLines, {
          kind: 'gear',
          text: gear.name,
        })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          gearAdds: [gear.id],
        })
      }
      if (choice === 'a') {
        const xp = applyXpReward(starter, 25, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
      } else {
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventLarge', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
      }
      break
    }
    case 'monolith-veteran':
      if (choice === 'a') {
        const titleId = 'monolith-witness'
        const title = getTitleDefinition(titleId)
        if (title && !starter.selectedPerks.includes(title.perkId)) {
          starter = applyPerk(starter, title.perkId)
          const perkName = getPerk(title.perkId).name
          rewardLines = pushLine(rewardLines, {
            kind: 'title',
            text: `Title: ${title.name} (+${perkName} perk)`,
          })
        } else {
          const xp = applyXpReward(starter, 30, rewardLines)
          starter = xp.starter
          rewardLines = xp.lines
        }
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          titleGrant: titleId,
        })
      }
      {
        const healed = healPartyToPercent(starter, recruits, 0.4)
        starter = healed.starter
        recruits = healed.recruits
        rewardLines = pushLine(rewardLines, {
          kind: 'heal',
          text: 'Party healed 40% max HP',
        })
      }
      break
    case 'training-grounds':
      if (choice === 'a') {
        starter = buffBaseStat(starter, 'atk', 3)
        rewardLines = pushLine(rewardLines, {
          kind: 'stat',
          text: 'Starter +3 ATK (permanent)',
        })
      } else {
        starter = buffBaseStat(starter, 'def', 3)
        rewardLines = pushLine(rewardLines, {
          kind: 'stat',
          text: 'Starter +3 DEF (permanent)',
        })
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
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventLarge', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
        rewardLines = pushLine(rewardLines, { kind: 'item', text: foundId })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          inventoryAdds: [{ itemId: foundId, quantity: 1 }],
        })
      }
      {
        const xp = applyXpReward(starter, 10, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventSmall', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
        rewardLines = pushLine(rewardLines, { kind: 'item', text: foundId })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          inventoryAdds: [{ itemId: foundId, quantity: 1 }],
        })
      }
    }
    case 'risky-mutation':
      if (choice === 'a') {
        const key = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)]
        starter = buffBaseStat(starter, key, 2)
        starter = {
          ...starter,
          currentHp: Math.max(1, starter.currentHp - 10),
        }
        rewardLines = pushLine(rewardLines, {
          kind: 'stat',
          text: `+2 ${key.toUpperCase()}, −10 HP`,
        })
      } else {
        rewardLines = pushLine(rewardLines, {
          kind: 'info',
          text: 'Left the spores untouched',
        })
      }
      break
    case 'badge-shrine':
      if (choice === 'a') {
        if (earnedBadges.length > 0) {
          const xp = applyXpReward(starter, 20, rewardLines)
          starter = xp.starter
          rewardLines = xp.lines
        } else {
          const coinResult = applyCoinReward(
            starter,
            eventCoins('eventSmall', regionId),
            rewardLines,
          )
          starter = coinResult.starter
          rewardLines = coinResult.lines
          rewardLines = pushLine(rewardLines, {
            kind: 'info',
            text: 'Shrine blessing (no badges yet)',
          })
        }
      } else {
        const healEach = Math.max(10, earnedBadges.length * 10)
        starter = {
          ...starter,
          currentHp: Math.min(starter.maxHp, starter.currentHp + healEach),
        }
        recruits = recruits.map((r) => ({
          ...r,
          currentHp: Math.min(r.maxHp, r.currentHp + healEach),
        }))
        rewardLines = pushLine(rewardLines, {
          kind: 'heal',
          text:
            earnedBadges.length > 0
              ? `Party +${healEach} HP (${earnedBadges.length} badge${earnedBadges.length === 1 ? '' : 's'})`
              : `Party +${healEach} HP`,
        })
      }
      break
    case 'friendly-trainer':
      if (choice === 'a') {
        const xp = applyXpReward(starter, 20, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
        starter = {
          ...starter,
          currentHp: Math.max(1, starter.currentHp - 10),
        }
        rewardLines = pushLine(rewardLines, { kind: 'info', text: '−10 HP from sparring' })
      } else {
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventSmall', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
      }
      break
    case 'ancient-nest':
      if (choice === 'a') {
        rewardLines = pushLine(rewardLines, {
          kind: 'info',
          text: 'Alpha emerges — fight!',
        })
        return baseResult(starter, recruits, earnedBadges, rewardLines, {
          pendingAlphaCombat: true,
        })
      }
      rewardLines = pushLine(rewardLines, {
        kind: 'item',
        text: 'Alpha Claw',
      })
      return baseResult(starter, recruits, earnedBadges, rewardLines, {
        inventoryAdds: [{ itemId: 'material-alpha-claw', quantity: 1 }],
      })
    case 'storm-forge':
      if (choice === 'a') {
        const gear = rollEventGearDrop('epic')
        if (gear) {
          rewardLines = pushLine(rewardLines, { kind: 'gear', text: gear.name })
          return baseResult(starter, recruits, earnedBadges, rewardLines, {
            gearAdds: [gear.id],
          })
        }
        const xp = applyXpReward(starter, 20, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
      } else {
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventMedium', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
      }
      break
    default:
      if (choice === 'a') {
        const xp = applyXpReward(starter, 10, rewardLines)
        starter = xp.starter
        rewardLines = xp.lines
      } else {
        const coinResult = applyCoinReward(
          starter,
          eventCoins('eventSmall', regionId),
          rewardLines,
        )
        starter = coinResult.starter
        rewardLines = coinResult.lines
      }
  }

  return baseResult(starter, recruits, earnedBadges, rewardLines)
}
