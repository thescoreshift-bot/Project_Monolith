/** Gym trainer + leader enemy template ids keyed by badge id. */
export type GymPair = {
  trainerId: string
  leaderId: string
}

export const GYM_BY_BADGE_ID: Record<string, GymPair> = {
  // —— Verdant Circuit ——
  'ember-badge': { trainerId: 'gym-trainer-nova', leaderId: 'gym-leader-ember' },
  'tide-badge': { trainerId: 'gym-trainer-verdant-tide', leaderId: 'gym-leader-tide' },
  'bloom-badge': { trainerId: 'gym-trainer-verdant-bloom', leaderId: 'gym-leader-bloom' },
  'volt-badge': { trainerId: 'gym-trainer-verdant-volt', leaderId: 'gym-leader-volt' },
  'stone-badge': { trainerId: 'gym-trainer-verdant-stone', leaderId: 'gym-leader-stone' },
  'venom-badge': { trainerId: 'gym-trainer-verdant-venom', leaderId: 'gym-leader-venom' },
  'spirit-badge': { trainerId: 'gym-trainer-verdant-spirit', leaderId: 'gym-leader-spirit' },
  'apex-badge': { trainerId: 'gym-trainer-verdant-apex', leaderId: 'gym-leader-apex' },

  // —— Ember Coast ——
  'coast-cinder-badge': { trainerId: 'gym-trainer-coast-cinder', leaderId: 'gym-leader-coast-cinder' },
  'coast-magma-badge': { trainerId: 'gym-trainer-coast-magma', leaderId: 'gym-leader-coast-magma' },
  'coast-dune-badge': { trainerId: 'gym-trainer-coast-dune', leaderId: 'gym-leader-coast-dune' },
  'coast-ash-badge': { trainerId: 'gym-trainer-coast-ash', leaderId: 'gym-leader-coast-ash' },
  'coast-blaze-badge': { trainerId: 'gym-trainer-coast-blaze', leaderId: 'gym-leader-coast-blaze' },
  'coast-scorch-badge': { trainerId: 'gym-trainer-coast-scorch', leaderId: 'gym-leader-coast-scorch' },
  'coast-furnace-badge': { trainerId: 'gym-trainer-coast-furnace', leaderId: 'gym-leader-coast-furnace' },
  'coast-inferno-badge': { trainerId: 'gym-trainer-coast-inferno', leaderId: 'gym-leader-coast-inferno' },

  // —— Storm Plateau ——
  'storm-gale-badge': { trainerId: 'gym-trainer-storm-gale', leaderId: 'gym-leader-storm-gale' },
  'storm-bolt-badge': { trainerId: 'gym-trainer-storm-bolt', leaderId: 'gym-leader-storm-bolt' },
  'storm-cliff-badge': { trainerId: 'gym-trainer-storm-cliff', leaderId: 'gym-leader-storm-cliff' },
  'storm-surge-badge': { trainerId: 'gym-trainer-storm-surge', leaderId: 'gym-leader-storm-surge' },
  'storm-ion-badge': { trainerId: 'gym-trainer-storm-ion', leaderId: 'gym-leader-storm-ion' },
  'storm-tempest-badge': { trainerId: 'gym-trainer-storm-tempest', leaderId: 'gym-leader-storm-tempest' },
  'storm-zenith-badge': { trainerId: 'gym-trainer-storm-zenith', leaderId: 'gym-leader-storm-zenith' },
  'storm-crown-badge': { trainerId: 'gym-trainer-storm-crown', leaderId: 'gym-leader-storm-crown' },

  // —— Obsidian Crown ——
  'obsidian-rift-badge': { trainerId: 'gym-trainer-obsidian-rift', leaderId: 'gym-leader-obsidian-rift' },
  'obsidian-ember-badge': { trainerId: 'gym-trainer-obsidian-ember', leaderId: 'gym-leader-obsidian-ember' },
  'obsidian-ward-badge': { trainerId: 'gym-trainer-obsidian-ward', leaderId: 'gym-leader-obsidian-ward' },
  'obsidian-pulse-badge': { trainerId: 'gym-trainer-obsidian-pulse', leaderId: 'gym-leader-obsidian-pulse' },
  'obsidian-shard-badge': { trainerId: 'gym-trainer-obsidian-shard', leaderId: 'gym-leader-obsidian-shard' },
  'obsidian-void-badge': { trainerId: 'gym-trainer-obsidian-void', leaderId: 'gym-leader-obsidian-void' },
  'obsidian-throne-badge': { trainerId: 'gym-trainer-obsidian-throne', leaderId: 'gym-leader-obsidian-throne' },
  'obsidian-crown-badge': { trainerId: 'gym-trainer-obsidian-crown', leaderId: 'gym-leader-obsidian-crown' },
}

export function getGymForBadge(badgeId: string | undefined): GymPair | null {
  if (!badgeId) return null
  return GYM_BY_BADGE_ID[badgeId] ?? null
}

export function getTrainerIdForBadge(badgeId: string | undefined): string {
  return getGymForBadge(badgeId)?.trainerId ?? 'gym-trainer-nova'
}

export function getLeaderIdForBadge(badgeId: string | undefined): string {
  return getGymForBadge(badgeId)?.leaderId ?? 'gym-leader-ember'
}
