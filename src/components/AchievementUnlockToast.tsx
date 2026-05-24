export function AchievementUnlockToast({
  title,
  onDismiss,
}: {
  title: string
  onDismiss: () => void
}) {
  return (
    <div className="achievement-unlock-toast" role="alertdialog" aria-labelledby="achievement-toast-title">
      <p id="achievement-toast-title" className="achievement-unlock-toast__title">
        Achievement Unlocked: {title}
      </p>
      <p className="achievement-unlock-toast__hint">Claim reward in the Monolith Archive.</p>
      <button type="button" className="btn btn--small" onClick={onDismiss}>
        OK
      </button>
    </div>
  )
}

export function AchievementUnlockToastStack({
  toasts,
  onDismiss,
}: {
  toasts: { id: string; title: string }[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="achievement-unlock-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <AchievementUnlockToast key={t.id} title={t.title} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}
