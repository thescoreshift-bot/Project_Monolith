import { getBadge } from '../data/badges'
import type { CreatureLevelUpLine, CreatureXpGainLine } from '../utils/battleRewards'
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
  pendingChoices: PendingChoiceSummary[]
}

type RewardScreenProps = {
  reward: RewardScreenData
  onContinue: () => void
}

export function RewardScreen({ reward, onContinue }: RewardScreenProps) {
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
      </header>

      <section className="reward-panel">
        <div className="reward-panel__row">
          <span className="panel-label">XP gained</span>
          <ul className="reward-panel__xp-list">
            {reward.xpLines.map((line) => (
              <li key={`${line.name}-${line.note ?? 'full'}`}>
                {line.name}: +{line.xpGained} XP
                {line.note ? ` (${line.note})` : ''}
              </li>
            ))}
          </ul>
        </div>

        {reward.levelUpLines.length > 0 && (
          <div className="reward-panel__row reward-panel__row--highlight">
            <span className="panel-label">Level ups</span>
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
          <div className="reward-panel__row">
            <span className="panel-label">Ability mastery</span>
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

        <div className="reward-panel__row">
          <span className="panel-label">Coins gained</span>
          <p className="reward-panel__value">+{reward.coinsGained} coins</p>
        </div>

        {reward.loot && reward.loot !== 'None' && (
          <div className="reward-panel__row">
            <span className="panel-label">Reward</span>
            <p className="reward-panel__value">{reward.loot}</p>
          </div>
        )}

        {reward.recruitmentNote && (
          <div className="reward-panel__row reward-panel__row--highlight">
            <span className="panel-label">Recruitment</span>
            <p className="reward-panel__value">{reward.recruitmentNote}</p>
          </div>
        )}

        {reward.badgeEarned && getBadge(reward.badgeEarned) && (
          <div className="reward-panel__row reward-panel__row--highlight">
            <span className="panel-label">Badge earned</span>
            <p className="reward-panel__value">
              {getBadge(reward.badgeEarned)!.name}
            </p>
          </div>
        )}

        {reward.pendingChoices.length > 0 && (
          <div className="reward-panel__row reward-panel__row--queue">
            <span className="panel-label">Up next (after Continue)</span>
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
