import { getBadge } from '../data/badges'
import type { CreatureLevelUpLine, CreatureXpGainLine } from '../utils/battleRewards'
import { formatRewardNextStep } from '../utils/currentObjective'
import type {
  MasteryRewardLine,
  PendingChoiceSummary,
} from '../utils/rewardSummary'

export type RewardScreenData = {
  coinsGained: number
  xpLines: CreatureXpGainLine[]
  levelUpLines: CreatureLevelUpLine[]
  masteryLines: MasteryRewardLine[]
  loot: string
  enemyName: string
  hasPerkDrafts: boolean
  badgeEarned?: string
  bossVictory?: boolean
  recruitmentNote?: string
  gearFound?: string
  itemsFound?: string[]
  materialsFound?: string[]
  pendingChoices: PendingChoiceSummary[]
  questProgressLines?: string[]
  questCompletedTitles?: string[]
}

type RewardScreenProps = {
  reward: RewardScreenData
  onContinue: () => void
}

export function RewardScreen({ reward, onContinue }: RewardScreenProps) {
  const nextStep = formatRewardNextStep(reward.pendingChoices)
  const continueLabel = reward.bossVictory
    ? 'Continue'
    : reward.hasPerkDrafts
      ? 'Continue'
      : 'Continue Run'

  return (
    <main className="reward-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Victory!</h1>
        <p className="screen-header__subtitle">
          {reward.enemyName} was defeated.
        </p>
        {reward.bossVictory && (
          <p className="reward-screen__boss-note" role="status">
            Boss defeated! This region has been cleared.
          </p>
        )}
        {nextStep && (
          <p className="reward-screen__next-step" role="status">
            {nextStep}
          </p>
        )}
      </header>

      <section className="reward-panel">
        <div className="reward-panel__section">
          <h2 className="reward-panel__section-title">Coins</h2>
          <p className="reward-panel__value">
            {reward.coinsGained > 0 ? `+${reward.coinsGained} coins` : 'No coins this battle'}
          </p>
        </div>

        {reward.xpLines.length > 0 && (
          <div className="reward-panel__section">
            <h2 className="reward-panel__section-title">XP gained</h2>
            <ul className="reward-panel__xp-list">
              {reward.xpLines.map((line) => (
                <li key={`${line.name}-${line.note ?? 'full'}`}>
                  {line.name}: +{line.xpGained} XP
                  {line.note ? ` (${line.note})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reward.levelUpLines.length > 0 && (
          <div className="reward-panel__section reward-panel__section--highlight">
            <h2 className="reward-panel__section-title">Level ups</h2>
            <ul className="reward-panel__xp-list">
              {reward.levelUpLines.map((line) => (
                <li key={line.name}>
                  {line.name} reached Lv. {line.newLevel}!
                </li>
              ))}
            </ul>
          </div>
        )}

        {reward.masteryLines.length > 0 && (
          <div className="reward-panel__section">
            <h2 className="reward-panel__section-title">Ability mastery</h2>
            <ul className="reward-panel__xp-list">
              {reward.masteryLines.map((line, i) => (
                <li key={`${line.creatureName}-${line.abilityName}-${i}`}>
                  {line.creatureName} — {line.abilityName}:{' '}
                  {line.rankUp
                    ? `rank up to ${line.rankLabel ?? `R${line.newRank}`}!`
                    : `+${line.xpGained} mastery XP`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(reward.gearFound ||
          (reward.itemsFound && reward.itemsFound.length > 0) ||
          (reward.materialsFound && reward.materialsFound.length > 0) ||
          (reward.loot && reward.loot !== 'None')) && (
          <div className="reward-panel__section reward-panel__section--highlight">
            <h2 className="reward-panel__section-title">Items & gear</h2>
            {reward.gearFound && <p className="reward-panel__value">Gear: {reward.gearFound}</p>}
            {reward.itemsFound && reward.itemsFound.length > 0 && (
              <ul className="reward-panel__xp-list">
                {reward.itemsFound.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            {reward.materialsFound && reward.materialsFound.length > 0 && (
              <ul className="reward-panel__xp-list">
                {reward.materialsFound.map((name) => (
                  <li key={`mat-${name}`}>{name}</li>
                ))}
              </ul>
            )}
            {reward.loot && reward.loot !== 'None' && !reward.gearFound && (
              <p className="reward-panel__value">{reward.loot}</p>
            )}
          </div>
        )}

        {reward.questProgressLines && reward.questProgressLines.length > 0 && (
          <div className="reward-panel__section">
            <h2 className="reward-panel__section-title">Quest progress</h2>
            <ul className="reward-panel__xp-list">
              {reward.questProgressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {reward.questCompletedTitles && reward.questCompletedTitles.length > 0 && (
          <div className="reward-panel__section reward-panel__section--highlight">
            <h2 className="reward-panel__section-title">Quest completed</h2>
            <ul className="reward-panel__xp-list">
              {reward.questCompletedTitles.map((title) => (
                <li key={title}>{title} — claim at Recovery Station</li>
              ))}
            </ul>
          </div>
        )}

        {reward.recruitmentNote && (
          <div className="reward-panel__section reward-panel__section--highlight">
            <h2 className="reward-panel__section-title">Recruitment</h2>
            <p className="reward-panel__value">{reward.recruitmentNote}</p>
          </div>
        )}

        {reward.badgeEarned && getBadge(reward.badgeEarned) && (
          <div className="reward-panel__section reward-panel__section--highlight">
            <h2 className="reward-panel__section-title">Badge earned</h2>
            <p className="reward-panel__value">
              {getBadge(reward.badgeEarned)!.name}
            </p>
          </div>
        )}

        {reward.pendingChoices.length > 0 && (
          <div className="reward-panel__section reward-panel__section--queue">
            <h2 className="reward-panel__section-title">Pending choices</h2>
            <ul className="reward-panel__queue-list">
              {reward.pendingChoices.map((item) => (
                <li key={item.label}>
                  {item.label}
                  {item.count > 1 ? ` ×${item.count}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <button type="button" className="btn btn--primary" onClick={onContinue}>
        {continueLabel}
      </button>
    </main>
  )
}
