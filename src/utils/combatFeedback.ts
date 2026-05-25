export type CombatFeedbackKind =
  | 'damage'
  | 'heal'
  | 'super'
  | 'weak'
  | 'stat'
  | 'fainted'
  | 'miss'
  | 'info'

export type CombatFeedbackEvent = {
  id: number
  text: string
  kind: CombatFeedbackKind
  side: 'enemy' | 'player'
  combatantKey?: string
}

export type CombatFlashState = {
  enemy: boolean
  playerKeys: string[]
}

export type BattleLogTone =
  | 'default'
  | 'super'
  | 'weak'
  | 'damage'
  | 'heal'
  | 'stat'
  | 'fainted'
  | 'mastery'
  | 'quest'
  | 'miss'

let feedbackIdCounter = 0

export function nextFeedbackId(): number {
  feedbackIdCounter += 1
  return feedbackIdCounter
}

export function classifyBattleLogLine(line: string): BattleLogTone {
  const lower = line.toLowerCase()
  if (lower.includes('super effective')) return 'super'
  if (lower.includes('not very effective')) return 'weak'
  if (lower.includes('fainted')) return 'fainted'
  if (lower.includes('quest')) return 'quest'
  if (lower.includes('rank') || lower.includes('mastery')) return 'mastery'
  if (lower.includes('restored') && lower.includes('hp')) return 'heal'
  if (lower.includes('missed')) return 'miss'
  if (/\d+\s+damage/.test(lower)) return 'damage'
  if (
    lower.includes('rose by') ||
    lower.includes('lowered') ||
    lower.includes('stages:')
  ) {
    return 'stat'
  }
  return 'default'
}

export function parseBattleLogFeedback(
  line: string,
  context: {
    enemyName: string
    playerNames: Map<string, string>
  },
): { events: CombatFeedbackEvent[]; flash: CombatFlashState } {
  const events: CombatFeedbackEvent[] = []
  const flash: CombatFlashState = { enemy: false, playerKeys: [] }
  const lower = line.toLowerCase()

  const damageMatch = line.match(/—\s*(\d+)\s+damage to\s+(.+?)!/i)
  if (damageMatch) {
    const amount = damageMatch[1]
    const target = damageMatch[2].trim()
    const isEnemyTarget = target === context.enemyName
    const playerEntry = [...context.playerNames.entries()].find(
      ([, name]) => name === target,
    )

    events.push({
      id: nextFeedbackId(),
      text: `-${amount}`,
      kind: 'damage',
      side: isEnemyTarget ? 'enemy' : 'player',
      combatantKey: playerEntry?.[0],
    })

    if (isEnemyTarget) {
      flash.enemy = true
    } else if (playerEntry) {
      flash.playerKeys.push(playerEntry[0])
    }

    if (lower.includes('super effective')) {
      events.push({
        id: nextFeedbackId(),
        text: 'Super Effective!',
        kind: 'super',
        side: isEnemyTarget ? 'enemy' : 'player',
        combatantKey: playerEntry?.[0],
      })
    } else if (lower.includes('not very effective')) {
      events.push({
        id: nextFeedbackId(),
        text: 'Not Very Effective…',
        kind: 'weak',
        side: isEnemyTarget ? 'enemy' : 'player',
        combatantKey: playerEntry?.[0],
      })
    }
  }

  const healMatch = line.match(/restored\s+(\d+)\s+HP/i)
  if (healMatch) {
    const playerEntry = [...context.playerNames.entries()].find(([, name]) =>
      line.includes(name),
    )
    events.push({
      id: nextFeedbackId(),
      text: `+${healMatch[1]}`,
      kind: 'heal',
      side: 'player',
      combatantKey: playerEntry?.[0] ?? 'starter',
    })
    if (playerEntry) {
      flash.playerKeys.push(playerEntry[0])
    }
  }

  if (lower.includes('fainted')) {
    const playerEntry = [...context.playerNames.entries()].find(([, name]) =>
      line.includes(name),
    )
    events.push({
      id: nextFeedbackId(),
      text: 'Fainted!',
      kind: 'fainted',
      side: playerEntry ? 'player' : 'enemy',
      combatantKey: playerEntry?.[0],
    })
    if (playerEntry) {
      flash.playerKeys.push(playerEntry[0])
    } else if (line.includes(context.enemyName)) {
      flash.enemy = true
    }
  }

  if (lower.includes('missed')) {
    events.push({
      id: nextFeedbackId(),
      text: 'Miss!',
      kind: 'miss',
      side: line.startsWith(context.enemyName) ? 'enemy' : 'player',
    })
  }

  const statMatch = line.match(
    /(ATK|DEF|SP\.ATK|SP\.DEF|SPD|ACC|EVA)\s+(?:rose by|lowered.*?by)\s+(\d+)/i,
  )
  if (statMatch) {
    const stat = statMatch[1].toUpperCase()
    const rising = lower.includes('rose by')
    const onEnemy = lower.includes('foe') && !lower.includes("'s")
    events.push({
      id: nextFeedbackId(),
      text: rising ? `${stat} Up` : `${stat} Down`,
      kind: 'stat',
      side: onEnemy ? 'enemy' : 'player',
    })
    if (rising && !onEnemy) {
      events.push({
        id: nextFeedbackId(),
        text: 'Buff applied',
        kind: 'stat',
        side: 'player',
      })
    }
    if (!rising && onEnemy) {
      events.push({
        id: nextFeedbackId(),
        text: 'Debuff applied',
        kind: 'stat',
        side: 'enemy',
      })
    }
  }

  if (lower.includes('mastery') && (lower.includes('rank') || lower.includes('level'))) {
    events.push({
      id: nextFeedbackId(),
      text: 'Mastery Level Up!',
      kind: 'info',
      side: 'player',
    })
  }

  if (lower.includes('quest') && (lower.includes('complete') || lower.includes('progress'))) {
    events.push({
      id: nextFeedbackId(),
      text: 'Quest Complete!',
      kind: 'info',
      side: 'player',
    })
  }

  return { events, flash }
}
