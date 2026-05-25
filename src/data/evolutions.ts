import type { EvolutionBranchCategory, StatModifiers } from './perks'
import { ALL_RECRUIT_EVOLUTION_FORMS } from './recruitEvolutions'

export type { EvolutionBranchCategory } from './perks'

export type EvolutionForm = {
  id: string
  fromStarterType: string
  stage: number
  requiredLevel: number
  branchCategory: EvolutionBranchCategory
  name: string
  description: string
  visualTheme: string
  statModifiers: StatModifiers
  newAbilityId?: string
  /** Optional portrait for this form (stage 1 / Lv.10 art, stage 3 / Lv.30 art, etc.) */
  portraitUrl?: string
}

type BranchTemplate = Omit<
  EvolutionForm,
  'id' | 'fromStarterType' | 'stage' | 'requiredLevel'
> & {
  /** Stage 3 (Lv.30 / Prime) portrait when different from stage 1 art. */
  portraitUrlStage3?: string
}

const STAGE_LEVELS: Record<number, number> = { 1: 10, 2: 20, 3: 30 }

const STAGE_NAME_PREFIX: Record<number, string> = {
  1: '',
  2: 'Elder ',
  3: 'Prime ',
}

function scaleMods(mods: StatModifiers, stage: number): StatModifiers {
  if (stage <= 1) return { ...mods }
  const mult = stage === 2 ? 1.4 : 1.8
  const scaled: StatModifiers = {}
  if (mods.atk) scaled.atk = Math.round(mods.atk * mult)
  if (mods.def) scaled.def = Math.round(mods.def * mult)
  if (mods.spAtk) scaled.spAtk = Math.round(mods.spAtk * mult)
  if (mods.spDef) scaled.spDef = Math.round(mods.spDef * mult)
  if (mods.spd) scaled.spd = Math.round(mods.spd * mult)
  if (mods.maxHp) scaled.maxHp = Math.round(mods.maxHp * mult)
  if (mods.hp) scaled.hp = Math.round(mods.hp * mult)
  return scaled
}

function buildStarterEvolutions(
  starterType: string,
  branches: Record<EvolutionBranchCategory, BranchTemplate>,
): EvolutionForm[] {
  const forms: EvolutionForm[] = []
  for (const stage of [1, 2, 3] as const) {
    const requiredLevel = STAGE_LEVELS[stage]
    for (const branchCategory of Object.keys(branches) as EvolutionBranchCategory[]) {
      const template = branches[branchCategory]
      forms.push({
        id: `${starterType}-s${stage}-${branchCategory}`,
        fromStarterType: starterType,
        stage,
        requiredLevel,
        branchCategory,
        name: `${STAGE_NAME_PREFIX[stage]}${template.name}`,
        description: template.description,
        visualTheme: template.visualTheme,
        statModifiers: scaleMods(template.statModifiers, stage),
        newAbilityId: template.newAbilityId,
        ...(stage === 1 && template.portraitUrl
          ? { portraitUrl: template.portraitUrl }
          : {}),
        ...(stage === 2 && template.portraitUrl
          ? { portraitUrl: template.portraitUrl }
          : {}),
        ...(stage === 3 && template.portraitUrlStage3
          ? { portraitUrl: template.portraitUrlStage3 }
          : {}),
      })
    }
  }
  return forms
}

const FIRE_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Inferneon',
    description: 'A blazing striker built for relentless pressure.',
    visualTheme: 'Sharper horns, hotter core, aggressive flame markings.',
    statModifiers: { atk: 5, spAtk: 7, spd: 2 },
    newAbilityId: 'cinder-bite',
    portraitUrl: '/assets/creatures/evolutions/fire-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/fire-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Embristle',
    description: 'Charcoal armor plates deflect blows and store heat.',
    visualTheme: 'Ember armor, hardened charcoal plates.',
    statModifiers: { maxHp: 15, def: 6, spDef: 4 },
    portraitUrl: '/assets/creatures/evolutions/fire-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/fire-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Blazetail',
    description: 'A lean hunter that strikes before foes can react.',
    visualTheme: 'Lean body, flame tail trails, quick stance.',
    statModifiers: { spd: 8, atk: 3 },
    portraitUrl: '/assets/creatures/evolutions/fire-lv10-speed.png',
    portraitUrlStage3: '/assets/creatures/evolutions/fire-lv30-speed.png',
  },
  utility: {
    branchCategory: 'utility',
    name: 'Cindermuse',
    description: 'Warm aura supports allies and sustains long routes.',
    visualTheme: 'Glowing support markings, warm aura.',
    statModifiers: { maxHp: 8, spAtk: 4, spDef: 4 },
    portraitUrl: '/assets/creatures/evolutions/fire-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/evolutions/fire-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Ashwyrd',
    description: 'Unstable monolith flame patterns warp its core.',
    visualTheme: 'Strange mutated flame pattern, unstable core.',
    statModifiers: { maxHp: 10, atk: 3, spAtk: 3, spd: 3 },
  },
}

const WATER_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Tidefang',
    description: 'Razor currents carve through enemy lines.',
    visualTheme: 'Crested fins, pressurized water jaws.',
    statModifiers: { atk: 5, spAtk: 6, spd: 3 },
    newAbilityId: 'bubble-hex',
    portraitUrl: '/assets/creatures/evolutions/water-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/water-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Reefort',
    description: 'Coral-like plating absorbs shock and spray.',
    visualTheme: 'Reef armor, layered brine shields.',
    statModifiers: { maxHp: 16, def: 7, spDef: 4 },
    portraitUrl: '/assets/creatures/evolutions/water-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/water-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Rippledash',
    description: 'Glides on currents with burst mobility.',
    visualTheme: 'Streamlined body, trailing wake ribbons.',
    statModifiers: { spd: 9, atk: 2 },
    portraitUrl: '/assets/creatures/evolutions/water-lv10-speed.png',
    portraitUrlStage3: '/assets/creatures/evolutions/water-lv30-speed.png',
  },
  utility: {
    branchCategory: 'utility',
    name: 'Mistweft',
    description: 'Healing mist and control magic sustain the party.',
    visualTheme: 'Soft mist veil, restorative glow.',
    statModifiers: { maxHp: 10, spAtk: 5, spDef: 3 },
    portraitUrl: '/assets/creatures/evolutions/water-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/evolutions/water-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Abyssal Wisp',
    description: 'Deep-sea anomaly pulses with strange pressure.',
    visualTheme: 'Bioluminescent abyss patterns, void core.',
    statModifiers: { maxHp: 11, atk: 2, spAtk: 4, spd: 2 },
  },
}

const GRASS_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Thornvex',
    description: 'Vines sharpen into piercing offensive lashes.',
    visualTheme: 'Thorn crown, aggressive vine whips.',
    statModifiers: { atk: 6, spAtk: 5, spd: 2 },
    newAbilityId: 'vine-lash',
    portraitUrl: '/assets/creatures/evolutions/grass-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/grass-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Barkshield',
    description: 'Living bark layers absorb repeated hits.',
    visualTheme: 'Thick bark plates, mossy fortification.',
    statModifiers: { maxHp: 17, def: 6, spDef: 5 },
    portraitUrl: '/assets/creatures/evolutions/grass-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/grass-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Zephyrvine',
    description: 'Light on its roots, it outmaneuvers slower foes.',
    visualTheme: 'Wind-touched leaves, agile stem posture.',
    statModifiers: { spd: 8, atk: 3 },
    portraitUrl: '/assets/creatures/evolutions/grass-lv10-speed.png',
    portraitUrlStage3: '/assets/creatures/evolutions/grass-lv30-speed.png',
  },
  utility: {
    branchCategory: 'utility',
    name: 'Pollenglow',
    description: 'Pollen aura buffs allies and drains foes slowly.',
    visualTheme: 'Golden pollen halo, gentle radiance.',
    statModifiers: { maxHp: 9, spAtk: 4, spDef: 5 },
    portraitUrl: '/assets/creatures/evolutions/grass-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/evolutions/grass-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Sporelynx',
    description: 'Mutagenic spores rewrite its growth in battle.',
    visualTheme: 'Luminous spore spots, asymmetric mutations.',
    statModifiers: { maxHp: 10, atk: 3, spAtk: 3, spd: 3 },
  },
}

const ELECTRIC_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Stormbit',
    description: 'Arcs leap between foes with fierce voltage.',
    visualTheme: 'Crackling mane, charged fang nodes.',
    statModifiers: { atk: 4, spAtk: 8, spd: 3 },
    newAbilityId: 'static-jolt',
    portraitUrl: '/assets/creatures/evolutions/electric-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/electric-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Faradayne',
    description: 'Grounded plating redirects incoming charge.',
    visualTheme: 'Insulated shell, grounded coil ridges.',
    statModifiers: { maxHp: 14, def: 7, spDef: 5 },
    portraitUrl: '/assets/creatures/evolutions/electric-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/electric-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Voltkite',
    description: 'Moves like a lightning bolt across the field.',
    visualTheme: 'Kite-like fins, streak lightning trails.',
    statModifiers: { spd: 10, atk: 2 },
    portraitUrl: '/assets/creatures/evolutions/electric-lv10-speed.png',
    portraitUrlStage3: '/assets/creatures/evolutions/electric-lv30-speed.png',
  },
  utility: {
    branchCategory: 'utility',
    name: 'Relaypulse',
    description: 'Channels energy to empower allies and disrupt foes.',
    visualTheme: 'Relay nodes, harmonic pulse rings.',
    statModifiers: { maxHp: 8, spAtk: 5, spDef: 4 },
    portraitUrl: '/assets/creatures/evolutions/electric-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/evolutions/electric-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Arcanomaly',
    description: 'Wild voltage patterns defy normal biology.',
    visualTheme: 'Fractured arc geometry, unstable core.',
    statModifiers: { maxHp: 9, atk: 3, spAtk: 4, spd: 3 },
  },
}

const GROUND_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Quakehorn',
    description: 'Heavy strikes send tremors through armor.',
    visualTheme: 'Stone horns, fault-line markings.',
    statModifiers: { atk: 7, spAtk: 4, spd: 1 },
    newAbilityId: 'stone-nudge',
    portraitUrl: '/assets/creatures/evolutions/ground-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/ground-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Bastionox',
    description: 'Bedrock plating turns it into a mobile fortress.',
    visualTheme: 'Layered stone plates, fortress stance.',
    statModifiers: { maxHp: 18, def: 8, spDef: 4 },
    portraitUrl: '/assets/creatures/evolutions/ground-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/evolutions/ground-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Dustrunner',
    description: 'Surprisingly agile despite its mass.',
    visualTheme: 'Dust wake trails, compact runner frame.',
    statModifiers: { spd: 7, atk: 4 },
    portraitUrl: '/assets/creatures/evolutions/ground-lv10-speed.png',
    portraitUrlStage3: '/assets/creatures/evolutions/ground-lv30-speed.png',
  },
  utility: {
    branchCategory: 'utility',
    name: 'Terracalm',
    description: 'Stabilizing earth aura steadies the whole party.',
    visualTheme: 'Calm sediment glow, grounding aura.',
    statModifiers: { maxHp: 12, spAtk: 3, spDef: 5 },
    portraitUrl: '/assets/creatures/evolutions/ground-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/evolutions/ground-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Lithowarp',
    description: 'Mineral warping bends terrain around it.',
    visualTheme: 'Warped crystal veins, pulsing stone core.',
    statModifiers: { maxHp: 11, atk: 4, spAtk: 2, spd: 2 },
  },
}

export const ALL_EVOLUTION_FORMS: EvolutionForm[] = [
  ...buildStarterEvolutions('fire', FIRE_BRANCHES),
  ...buildStarterEvolutions('water', WATER_BRANCHES),
  ...buildStarterEvolutions('grass', GRASS_BRANCHES),
  ...buildStarterEvolutions('electric', ELECTRIC_BRANCHES),
  ...buildStarterEvolutions('ground', GROUND_BRANCHES),
]

const EVOLUTION_BY_KEY = new Map(
  ALL_EVOLUTION_FORMS.map((f) => [
    `${f.fromStarterType}-${f.stage}-${f.branchCategory}`,
    f,
  ]),
)

const ALL_FORMS_BY_ID = new Map([
  ...ALL_EVOLUTION_FORMS.map((f) => [f.id, f] as const),
  ...ALL_RECRUIT_EVOLUTION_FORMS.map((f) => [f.id, f] as const),
])

export function getEvolutionFormById(id: string): EvolutionForm | undefined {
  return ALL_FORMS_BY_ID.get(id)
}

export const EVOLUTION_THRESHOLDS = [10, 20, 30] as const

export function getEvolutionForStarter(
  starterType: string,
  stage: number,
  category: EvolutionBranchCategory,
): EvolutionForm | undefined {
  return EVOLUTION_BY_KEY.get(`${starterType}-${stage}-${category}`)
}

export function stageForThreshold(level: number): number {
  return level / 10
}
