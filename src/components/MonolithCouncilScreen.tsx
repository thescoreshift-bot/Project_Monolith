import type { RegionCouncil } from '../data/monolithCouncil'
import { buildLocalCouncilFlavorLine } from '../data/monolithCouncil'
import { aiStyleLabel } from '../utils/councilAi'
import { badgesProgressLabel } from '../utils/monolithCouncilState'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { getPartyHighestLevel } from '../utils/regionRewards'

export function MonolithCouncilScreen({
  council,
  earnedBadges,
  creature,
  recruits,
  activeHelperId,
  gauntletProgress,
  onStart,
  onBack,
  onOpenParty,
}: {
  council: RegionCouncil
  earnedBadges: string[]
  creature: RunCreature
  recruits: PartyCreature[]
  activeHelperId: string | null
  gauntletProgress: { trialIndex: number; fightsWon: number } | null
  onStart: () => void
  onBack: () => void
  onOpenParty?: () => void
}) {
  const partyLevel = getPartyHighestLevel(creature, recruits)
  const helper = recruits.find((r) => r.id === activeHelperId)
  const underleveled = partyLevel < council.recommendedLevel
  const hasHelper = Boolean(helper && helper.currentHp > 0)
  const canStart = council.trials.length > 0
  const emblemLabel = council.rewards.emblemItemId
    .replace(/-council-emblem$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <main className="monolith-council-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">{council.officialName}</h1>
        <p className="screen-header__subtitle monolith-council-screen__local-name">
          {buildLocalCouncilFlavorLine(council.localName)}
        </p>
        <p className="monolith-council-screen__tagline">
          Final challenge of {council.regionName} — six-fight 2v2 gauntlet.
        </p>
      </header>

      <section className="monolith-council-panel">
        <dl className="monolith-council-stats">
          <div>
            <dt>Region</dt>
            <dd>{council.regionName}</dd>
          </div>
          <div>
            <dt>Badges</dt>
            <dd>{badgesProgressLabel(council.regionId, earnedBadges)}</dd>
          </div>
          <div>
            <dt>Recommended level</dt>
            <dd>Lv. {council.recommendedLevel}+</dd>
          </div>
          <div>
            <dt>Your party</dt>
            <dd>Lv. {partyLevel}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>
              {creature.name}
              {helper ? ` + ${helper.name}` : ' (no helper)'}
            </dd>
          </div>
        </dl>

        {!hasHelper && (
          <div className="monolith-council-helper-block" role="alert">
            <p className="monolith-council-warning">
              The Monolith Council uses 2v2 battles. Set an active helper in the Party
              screen before entering.
            </p>
            {onOpenParty && (
              <button type="button" className="btn btn--small" onClick={onOpenParty}>
                Open Party
              </button>
            )}
          </div>
        )}
        {underleveled && (
          <p className="monolith-council-warning" role="status">
            Recommended Level: {council.recommendedLevel}+ — your party may struggle.
          </p>
        )}

        <p className="monolith-council-rules">
          Each trial pits two Council trainers against your starter and helper. After each
          victory you recover 20% max HP (free). Optional full recovery costs 50 coins
          between fights.
        </p>

        {gauntletProgress && (
          <p className="monolith-council-progress" role="status">
            Gauntlet in progress — fight {gauntletProgress.trialIndex + 1} /{' '}
            {council.trials.length} ({gauntletProgress.fightsWon} won)
          </p>
        )}

        <h2 className="monolith-council-trials-title">Trials</h2>
        <ol className="monolith-council-trial-list">
          {council.trials.map((trial, index) => {
            const done = gauntletProgress
              ? index < gauntletProgress.trialIndex
              : false
            const current = gauntletProgress?.trialIndex === index
            return (
              <li
                key={trial.id}
                className={`monolith-council-trial${done ? ' monolith-council-trial--done' : ''}${current ? ' monolith-council-trial--current' : ''}`}
              >
                <span className="monolith-council-trial__index">{index + 1}.</span>
                <span className="monolith-council-trial__name">{trial.name}</span>
                <span className="monolith-council-trial__ai">
                  {aiStyleLabel(trial.aiStyle)}
                </span>
                <span className="monolith-council-trial__trainers">
                  {trial.trainers[0].trainerName} & {trial.trainers[1].trainerName}
                </span>
              </li>
            )
          })}
        </ol>

        <section className="monolith-council-rewards">
          <h2>Completion rewards</h2>
          <ul>
            <li>{council.rewards.coins} coins</li>
            <li>Monolith Fragment ×{council.rewards.monolithFragments}</li>
            <li>Rare gear chest ×{council.rewards.rareGearRollCount}</li>
            <li>
              {emblemLabel} Council Emblem (key item)
            </li>
            <li>Title: {council.rewards.titleName}</li>
            {council.rewards.unlocksNextRegionId && (
              <li>Unlock next region travel</li>
            )}
            <li>Council Scout at Recovery Station</li>
          </ul>
        </section>
      </section>

      <footer className="monolith-council-actions">
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canStart || !hasHelper}
          onClick={onStart}
        >
          {gauntletProgress ? 'Continue Challenge' : 'Start Challenge'}
        </button>
      </footer>
    </main>
  )
}
