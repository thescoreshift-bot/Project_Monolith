import { getAbility } from '../data/abilities'
import type { AbilityMasteryPerk } from '../data/abilityMasteryPerks'
import {
  getDraftPerksForQueueEntry,
  getRankLabel,
  getPerkEffectSummary,
  type AbilityMasteryPerkQueueEntry,
} from '../utils/abilityMastery'

type AbilityUpgradeScreenProps = {
  creatureName: string
  entry: AbilityMasteryPerkQueueEntry
  onChoose: (perkId: string) => void
}

function PathTagBadge({ tag }: { tag: AbilityMasteryPerk['pathTag'] }) {
  return (
    <span className={`ability-perk-kind ability-perk-kind--${tag}`}>
      {tag}
    </span>
  )
}

export function AbilityUpgradeScreen({
  creatureName,
  entry,
  onChoose,
}: AbilityUpgradeScreenProps) {
  const ability = getAbility(entry.abilityId)
  const choices = getDraftPerksForQueueEntry(entry)

  return (
    <main className="ability-upgrade-screen ability-upgrade-screen--modal">
      <div className="ability-upgrade-screen__dialog" role="dialog" aria-modal="true">
        <header className="screen-header">
          <h1 className="screen-header__title">Ability Mastery</h1>
          <p className="screen-header__subtitle">
            {creatureName}&apos;s {ability.name} reached {getRankLabel(entry.rank)}!
            Choose a mastery perk for this ability only.
          </p>
        </header>

        <section className="ability-upgrade-screen__current">
          <span className="panel-label">Ability</span>
          <p className="ability-upgrade-screen__ability-name">{ability.name}</p>
          <p className="ability-upgrade-screen__meta">
            {ability.type} / {ability.category}
            {ability.power > 0 ? ` · Power ${ability.power}` : ''} · Accuracy{' '}
            {ability.accuracy}%
          </p>
          <p className="ability-upgrade-screen__desc">{ability.description}</p>
        </section>

        <p className="panel-label">Pick 1 of {choices.length} perks</p>
        <div className="ability-upgrade-screen__choices">
          {choices.map((perk) => (
            <button
              key={perk.id}
              type="button"
              className="ability-upgrade-card"
              onClick={() => onChoose(perk.id)}
            >
              <div className="ability-upgrade-card__header">
                <h2 className="ability-upgrade-card__name">{perk.name}</h2>
                <PathTagBadge tag={perk.pathTag} />
              </div>
              <p className="ability-upgrade-card__effect">
                {getPerkEffectSummary(perk)}
              </p>
              <p className="ability-upgrade-card__desc">{perk.description}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
