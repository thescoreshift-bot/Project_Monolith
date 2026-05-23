import type { ElementType } from './starters'

export type AbilityCategory = 'physical' | 'special' | 'status'

export type AbilityTarget = 'enemy' | 'self' | 'ally'

export type StatStageKey =
  | 'atk'
  | 'def'
  | 'spAtk'
  | 'spDef'
  | 'spd'
  | 'accuracy'
  | 'evasion'

export type AbilityEffect =
  | { type: 'statBuff'; stat: StatStageKey; stages: number; target?: 'self' | 'ally' }
  | { type: 'statDebuff'; stat: StatStageKey; stages: number }
  | { type: 'applyStatus'; status: 'burn' | 'poison' | 'paralyze' | 'bind'; chance: number }
  | { type: 'heal'; percent: number }
  | { type: 'shield'; amount: number }
  | { type: 'damageOverTime'; status: 'burn' | 'poison'; percent: number }

export type AbilityDefinition = {
  id: string
  name: string
  type: ElementType
  category: AbilityCategory
  target: AbilityTarget
  power: number
  accuracy: number
  description: string
  effects?: AbilityEffect[]
}
