import type { EvolutionBranchCategory, EvolutionForm } from './evolutions'
import type { StatModifiers } from './perks'
import { normalizeRecruitTemplateId, resolveRecruitTemplateId } from './recruitPortraits'
import { deepPublicAssets } from '../utils/publicAsset'

type BranchTemplate = Omit<
  EvolutionForm,
  'id' | 'fromStarterType' | 'stage' | 'requiredLevel'
> & {
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

function buildRecruitEvolutions(
  recruitTemplateId: string,
  branches: Record<EvolutionBranchCategory, BranchTemplate>,
): EvolutionForm[] {
  const forms: EvolutionForm[] = []
  for (const stage of [1, 2, 3] as const) {
    const requiredLevel = STAGE_LEVELS[stage]
    for (const branchCategory of Object.keys(branches) as EvolutionBranchCategory[]) {
      const template = branches[branchCategory]
      forms.push({
        id: `${recruitTemplateId}-s${stage}-${branchCategory}`,
        fromStarterType: recruitTemplateId,
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

const BRISTLEBUG_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Needlethorn',
    description: 'Scythe-limbs and thorn bristles turn it into a relentless striker.',
    visualTheme: 'Mantis scythes, thorn crown, aggressive leaf armor.',
    statModifiers: { atk: 6, spAtk: 5, spd: 2 },
    newAbilityId: 'vine-lash',
    portraitUrl: '/assets/creatures/recruits/evolutions/bristlebug-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/bristlebug-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Barbjaw',
    description: 'Mossy stone plates and barbed jaws absorb and return punishment.',
    visualTheme: 'Craggy moss shell, tusked mandibles, fortress posture.',
    statModifiers: { maxHp: 17, def: 6, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/bristlebug-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/bristlebug-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Skitterthorn',
    description: 'Lightened carapace lets it dart between thorn strikes.',
    visualTheme: 'Streamlined shell, wind-swept bristles, low stance.',
    statModifiers: { spd: 8, atk: 3 },
  },
  utility: {
    branchCategory: 'utility',
    name: 'Sporegleam',
    description: 'Bioluminescent spores heal allies and sap enemy focus.',
    visualTheme: 'Glowing spore sacs, lumen antennae, pollen haze.',
    statModifiers: { maxHp: 9, spAtk: 4, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/bristlebug-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/bristlebug-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Mutabristle',
    description: 'Unstable bristle growth rewrites its shell mid-fight.',
    visualTheme: 'Asymmetric mutations, pulsing spore clusters.',
    statModifiers: { maxHp: 10, atk: 3, spAtk: 3, spd: 3 },
  },
}

const ASHLING_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Kindling',
    description: 'Flame mane and rune claws turn it into a savage striker.',
    visualTheme: 'Draconic frame, blazing mane, glowing rune claws.',
    statModifiers: { atk: 6, spAtk: 5, spd: 2 },
    newAbilityId: 'cinder-bite',
    portraitUrl: '/assets/creatures/recruits/evolutions/ashling-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/ashling-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Ashmaw',
    description: 'Obsidian plates and a molten core soak up brutal hits.',
    visualTheme: 'Magma golem shell, white-hot chest core, heavy fists.',
    statModifiers: { maxHp: 17, def: 6, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/ashling-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/ashling-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Emberdash',
    description: 'Superheated footfalls leave foes chasing ash trails.',
    visualTheme: 'Lean legs, trailing cinders, low sprint stance.',
    statModifiers: { spd: 8, atk: 3 },
  },
  utility: {
    branchCategory: 'utility',
    name: 'Cinderveil',
    description: 'Floating rune discs shield allies and sear enemy focus.',
    visualTheme: 'Levitating runes, flame veil, channeling posture.',
    statModifiers: { maxHp: 9, spAtk: 4, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/ashling-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/ashling-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Flarewyrd',
    description: 'Primal flame sigils rewrite its molten core mid-battle.',
    visualTheme: 'Warped runes, unstable magma veins.',
    statModifiers: { maxHp: 10, atk: 3, spAtk: 3, spd: 3 },
  },
}

const PEBBLEMAW_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Rockjaw',
    description: 'Spine ridges and a crushing maw tear through armor.',
    visualTheme: 'Spiked carapace, magma fissures, gaping stone teeth.',
    statModifiers: { atk: 7, spAtk: 4, spd: 1 },
    newAbilityId: 'stone-nudge',
    portraitUrl: '/assets/creatures/recruits/evolutions/pebblemaw-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/pebblemaw-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Monolithback',
    description: 'Layered boulder shell turns it into a mobile fortress.',
    visualTheme: 'Bulldog frame, domed pebble shell, heavy underbite.',
    statModifiers: { maxHp: 18, def: 8, spDef: 4 },
    portraitUrl: '/assets/creatures/recruits/evolutions/pebblemaw-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/pebblemaw-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Graveldash',
    description: 'Surprisingly quick despite its stone bulk.',
    visualTheme: 'Compact runner frame, dust wake trails.',
    statModifiers: { spd: 7, atk: 4 },
  },
  utility: {
    branchCategory: 'utility',
    name: 'Crystalcrag',
    description: 'Embedded crystals steady allies and refract enemy blows.',
    visualTheme: 'Quartz spines, gem inlays, calming earth glow.',
    statModifiers: { maxHp: 12, spAtk: 3, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/pebblemaw-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/pebblemaw-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Lithocurl',
    description: 'Warped mineral veins rewrite its pebble shell mid-fight.',
    visualTheme: 'Bent crystal veins, pulsing stone core.',
    statModifiers: { maxHp: 11, atk: 4, spAtk: 2, spd: 2 },
  },
}

const VOLTIMP_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Sparkimp',
    description: 'Circuit-marked claws channel brutal voltage strikes.',
    visualTheme: 'Lightning horns, arc claws, predatory crouch.',
    statModifiers: { atk: 4, spAtk: 8, spd: 3 },
    newAbilityId: 'static-jolt',
    portraitUrl: '/assets/creatures/recruits/evolutions/voltimp-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/voltimp-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Voltaic Imp',
    description: 'Insulated plating grounds blows and stores charge.',
    visualTheme: 'Cyber armor, gold trim, chest power core.',
    statModifiers: { maxHp: 14, def: 7, spDef: 5 },
    portraitUrl: '/assets/creatures/recruits/evolutions/voltimp-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/voltimp-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Boltkite',
    description: 'Moves like a live wire across the battlefield.',
    visualTheme: 'Streamlined frame, streak lightning trails.',
    statModifiers: { spd: 10, atk: 2 },
  },
  utility: {
    branchCategory: 'utility',
    name: 'Arcglyph',
    description: 'Etched circuits relay buffs and sap enemy focus.',
    visualTheme: 'Glowing glyph lines, support stance, arc tail.',
    statModifiers: { maxHp: 8, spAtk: 4, spDef: 4 },
    portraitUrl: '/assets/creatures/recruits/evolutions/voltimp-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/voltimp-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Stormwyrd',
    description: 'Unstable arc sigils rewrite its charge mid-fight.',
    visualTheme: 'Warped lightning horns, fractured core.',
    statModifiers: { maxHp: 9, atk: 3, spAtk: 4, spd: 3 },
  },
}

const DRIFTWISP_BRANCHES: Record<EvolutionBranchCategory, BranchTemplate> = {
  offense: {
    branchCategory: 'offense',
    name: 'Abysswisp',
    description: 'Spectral shark fins carve through enemy lines.',
    visualTheme: 'Abyssal shark frame, glowing core, needle arms.',
    statModifiers: { atk: 5, spAtk: 6, spd: 3 },
    newAbilityId: 'bubble-hex',
    portraitUrl: '/assets/creatures/recruits/evolutions/driftwisp-lv10-offense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/driftwisp-lv30-offense.png',
  },
  defense: {
    branchCategory: 'defense',
    name: 'Reefwisp',
    description: 'Coral shell plating absorbs shock and spray.',
    visualTheme: 'Bioluminescent reef dome, tentacle veil, deep core.',
    statModifiers: { maxHp: 16, def: 7, spDef: 4 },
    portraitUrl: '/assets/creatures/recruits/evolutions/driftwisp-lv10-defense.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/driftwisp-lv30-defense.png',
  },
  speed: {
    branchCategory: 'speed',
    name: 'Rippleglide',
    description: 'Glides on currents with burst mobility.',
    visualTheme: 'Streamlined wisp trails, wake ribbons.',
    statModifiers: { spd: 9, atk: 2 },
  },
  utility: {
    branchCategory: 'utility',
    name: 'Mistral',
    description: 'Rune-touched mist heals allies and blurs enemy focus.',
    visualTheme: 'Flowing rune tails, chest core glow, drifting ribbons.',
    statModifiers: { maxHp: 10, spAtk: 5, spDef: 3 },
    portraitUrl: '/assets/creatures/recruits/evolutions/driftwisp-lv10-utility.png',
    portraitUrlStage3: '/assets/creatures/recruits/evolutions/driftwisp-lv30-utility.png',
  },
  evolution: {
    branchCategory: 'evolution',
    name: 'Depthwyrd',
    description: 'Deep-sea pressure warps its spectral core mid-fight.',
    visualTheme: 'Bioluminescent abyss patterns, void core pulse.',
    statModifiers: { maxHp: 11, atk: 2, spAtk: 4, spd: 2 },
  },
}

export const RECRUIT_EVOLUTION_TEMPLATE_IDS = new Set([
  'bristlebug',
  'ashling',
  'pebblemaw',
  'voltimp',
  'driftwisp',
])

export const ALL_RECRUIT_EVOLUTION_FORMS: EvolutionForm[] = deepPublicAssets([
  ...buildRecruitEvolutions('bristlebug', BRISTLEBUG_BRANCHES),
  ...buildRecruitEvolutions('ashling', ASHLING_BRANCHES),
  ...buildRecruitEvolutions('pebblemaw', PEBBLEMAW_BRANCHES),
  ...buildRecruitEvolutions('voltimp', VOLTIMP_BRANCHES),
  ...buildRecruitEvolutions('driftwisp', DRIFTWISP_BRANCHES),
])

const RECRUIT_EVOLUTION_BY_KEY = new Map(
  ALL_RECRUIT_EVOLUTION_FORMS.map((f) => [
    `${f.fromStarterType}-${f.stage}-${f.branchCategory}`,
    f,
  ]),
)

const RECRUIT_EVOLUTION_BY_ID = new Map(
  ALL_RECRUIT_EVOLUTION_FORMS.map((f) => [f.id, f]),
)

export function getRecruitEvolutionFormById(
  id: string,
): EvolutionForm | undefined {
  return RECRUIT_EVOLUTION_BY_ID.get(id)
}

export function hasRecruitEvolutions(templateId: string): boolean {
  return RECRUIT_EVOLUTION_TEMPLATE_IDS.has(normalizeRecruitTemplateId(templateId))
}

export function getRecruitEvolutionKey(templateId: string): string | null {
  const base =
    resolveRecruitTemplateId({ templateId }) ??
    normalizeRecruitTemplateId(templateId)
  return RECRUIT_EVOLUTION_TEMPLATE_IDS.has(base) ? base : null
}

export function getEvolutionForRecruit(
  recruitTemplateId: string,
  stage: number,
  category: EvolutionBranchCategory,
): EvolutionForm | undefined {
  return RECRUIT_EVOLUTION_BY_KEY.get(`${recruitTemplateId}-${stage}-${category}`)
}
