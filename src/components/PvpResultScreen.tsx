export function PvpResultScreen({
  victory,
  opponentName,
  coinsEarned,
  detail,
  onContinue,
}: {
  victory: boolean
  opponentName: string
  coinsEarned: number
  detail: string
  onContinue: () => void
}) {
  return (
    <main className="pvp-result-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">
          {victory ? 'Friend Battle Victory!' : 'Friend Battle Defeat'}
        </h1>
        <p className="screen-header__subtitle">
          {victory
            ? `You defeated ${opponentName}'s AI team.`
            : `${opponentName}'s AI team won this challenge.`}
        </p>
      </header>

      <section className="pvp-result-screen__stats">
        {victory && coinsEarned > 0 && (
          <p>
            Reward: <strong>+{coinsEarned} coins</strong>
          </p>
        )}
        <p>{detail}</p>
      </section>

      <button type="button" className="btn btn--primary" onClick={onContinue}>
        Continue
      </button>
    </main>
  )
}
