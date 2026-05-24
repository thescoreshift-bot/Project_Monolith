import { getRecruitPortraitUrl } from '../data/recruitPortraits'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import { CreaturePortrait } from './CreaturePortrait'

type RecruitmentScreenProps = {
  recruit: PartyCreature
  partyFull: boolean
  starter: RunCreature
  recruits: PartyCreature[]
  onAccept: () => void
  onDecline: () => void
  onReplace: (recruitId: string) => void
}

export function RecruitmentScreen({
  recruit,
  partyFull,
  starter,
  recruits,
  onAccept,
  onDecline,
  onReplace,
}: RecruitmentScreenProps) {
  return (
    <main className="recruitment-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Recruitment Offer</h1>
        <p className="screen-header__subtitle">
          {recruit.name} wants to join your party.
        </p>
      </header>

      <article className="recruitment-card">
        <CreaturePortrait
          type={recruit.type}
          portraitUrl={getRecruitPortraitUrl(recruit.templateId)}
          alt={recruit.name}
          size="lg"
          className="recruitment-card__portrait"
        />
        <h2 className="recruitment-card__name">{recruit.name}</h2>
        <span className="recruitment-card__type">{recruit.type}</span>
        <p className="recruitment-card__level">Level {recruit.level}</p>
        <dl className="recruitment-card__stats">
          <div>
            <dt>HP</dt>
            <dd>{recruit.maxHp}</dd>
          </div>
          <div>
            <dt>ATK</dt>
            <dd>{recruit.stats.atk}</dd>
          </div>
          <div>
            <dt>DEF</dt>
            <dd>{recruit.stats.def}</dd>
          </div>
          <div>
            <dt>SP.ATK</dt>
            <dd>{recruit.stats.spAtk}</dd>
          </div>
          <div>
            <dt>SP.DEF</dt>
            <dd>{recruit.stats.spDef}</dd>
          </div>
          <div>
            <dt>SPD</dt>
            <dd>{recruit.stats.spd}</dd>
          </div>
        </dl>
      </article>

      {partyFull ? (
        <section className="recruitment-replace">
          <p className="panel-label">Party full — replace a recruit</p>
          <p className="recruitment-replace__note">
            Your starter {starter.name} cannot be replaced.
          </p>
          <div className="recruitment-replace__list">
            {recruits.map((r) => (
              <button
                key={r.id}
                type="button"
                className="btn btn--small"
                onClick={() => onReplace(r.id)}
              >
                Replace {r.name}
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={onDecline}>
            Decline
          </button>
        </section>
      ) : (
        <div className="recruitment-actions">
          <button type="button" className="btn btn--primary" onClick={onAccept}>
            Accept
          </button>
          <button type="button" className="btn" onClick={onDecline}>
            Decline
          </button>
        </div>
      )}
    </main>
  )
}
