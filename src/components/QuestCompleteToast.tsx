export function QuestCompleteToast({
  title,
  rewardPreview,
  onDismiss,
}: {
  title: string
  rewardPreview: string
  onDismiss: () => void
}) {
  return (
    <div className="quest-complete-toast" role="alertdialog" aria-labelledby="quest-toast-title">
      <p id="quest-toast-title" className="quest-complete-toast__title">
        Quest Complete: {title}
      </p>
      <p className="quest-complete-toast__reward">{rewardPreview}</p>
      <p className="quest-complete-toast__hint">Claim at Recovery Station — Quest Broker Mira</p>
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
  toasts: { id: string; title: string; rewardPreview: string }[]
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
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  )
}
