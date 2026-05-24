export function QuestCompleteToast({
  title,
  rewardPreview,
  variant = 'quest',
  onDismiss,
}: {
  title: string
  rewardPreview: string
  variant?: 'quest' | 'request'
  onDismiss: () => void
}) {
  const heading =
    variant === 'request' ? `Request Complete: ${title}` : `Quest Complete: ${title}`
  const hint =
    variant === 'request'
      ? 'Return to Quest Broker Mira to claim your reward.'
      : 'Claim at Recovery Station — Quest Broker Mira'

  return (
    <div className="quest-complete-toast" role="alertdialog" aria-labelledby="quest-toast-title">
      <p id="quest-toast-title" className="quest-complete-toast__title">
        {heading}
      </p>
      <p className="quest-complete-toast__reward">{rewardPreview}</p>
      <p className="quest-complete-toast__hint">{hint}</p>
      <button type="button" className="btn btn--small" onClick={onDismiss}>
        OK
      </button>
    </div>
  )
}

export function QuestCompleteToastStack({
  toasts,
  onDismiss,
}: {
  toasts: {
    id: string
    title: string
    rewardPreview: string
    variant?: 'quest' | 'request'
  }[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="quest-complete-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <QuestCompleteToast
          key={t.id}
          title={t.title}
          rewardPreview={t.rewardPreview}
          variant={t.variant}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  )
}
