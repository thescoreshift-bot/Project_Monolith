import { getAbility } from '../data/abilities'
import { AbilityMasteryPanel } from './AbilityMasteryPanel'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getActiveAbilityIds } from '../utils/creatureAbilities'

type MoveLearnScreenProps = {
  creature: RunCreature | PartyCreature
  newAbilityId: string
  earnedBadges: string[]
  partyHighestLevel: number
  onLearn: () => void
  onSkip: () => void
  onReplace: (oldAbilityId: string) => void
}

export function MoveLearnScreen({
  creature,
  newAbilityId,
  earnedBadges,
  partyHighestLevel,
  onLearn,
  onSkip,
  onReplace,
}: MoveLearnScreenProps) {
  const newAbility = getAbility(newAbilityId)
  const activeIds = getActiveAbilityIds(creature)
  const slotsFull = activeIds.length >= 4

  return (
    <main className="move-learn-screen ability-upgrade-screen--modal">
      <div className="ability-upgrade-screen__dialog" role="dialog" aria-modal="true">
        <header className="screen-header">
          <h1 className="screen-header__title">Learn Move</h1>
          <p className="screen-header__subtitle">
            {creature.name} wants to learn {newAbility.name}!
          </p>
        </header>

        <section className="ability-upgrade-screen__current">
          <AbilityMasteryPanel
            creature={creature}
            abilityId={newAbilityId}
            earnedBadges={earnedBadges}
            partyHighestLevel={partyHighestLevel}
            compact={false}
          />
        </section>

        {!slotsFull ? (
          <div className="move-learn-screen__actions">
            <button type="button" className="btn btn--primary" onClick={onLearn}>
              Learn {newAbility.name}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onSkip}>
              Do not learn
            </button>
          </div>
        ) : (
          <>
            <p className="panel-label">
              Your creature already knows 4 moves. Choose one to forget:
            </p>
            <div className="move-learn-screen__forget-list">
              {activeIds.map((id) => {
                const ability = getAbility(id)
                return (
                  <button
                    key={id}
                    type="button"
                    className="ability-upgrade-card"
                    onClick={() => onReplace(id)}
                  >
                    <h2 className="ability-upgrade-card__name">
                      Forget {ability.name}
                    </h2>
                    <p className="ability-upgrade-card__desc">
                      Replace with {newAbility.name}
                    </p>
                  </button>
                )
              })}
            </div>
            <button type="button" className="btn btn--ghost" onClick={onSkip}>
              Do not learn
            </button>
          </>
        )}
      </div>
    </main>
  )
}
