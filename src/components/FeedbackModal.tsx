import { useState } from 'react'
import { APP_VERSION_LABEL } from '../utils/version'
import type { FeedbackKind } from '../utils/feedbackSystem'

type FeedbackModalProps = {
  screen: string
  region: string
  saveSlot: string
  defaultContact?: string
  onClose: () => void
  onSubmit: (input: {
    kind: FeedbackKind
    whatHappened: string
    expectedBehavior: string
    contact?: string
  }) => Promise<{ copyText: string; savedToCloud?: boolean; error?: string }>
}

export function FeedbackModal({
  screen,
  region,
  saveSlot,
  defaultContact,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [whatHappened, setWhatHappened] = useState('')
  const [expectedBehavior, setExpectedBehavior] = useState('')
  const [contact, setContact] = useState(defaultContact ?? '')
  const [busy, setBusy] = useState(false)
  const [copyText, setCopyText] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!whatHappened.trim()) {
      setStatus('Describe what happened.')
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const result = await onSubmit({
        kind,
        whatHappened: whatHappened.trim(),
        expectedBehavior: expectedBehavior.trim(),
        contact: contact.trim() || undefined,
      })
      setCopyText(result.copyText)
      if (result.savedToCloud) {
        setStatus('Thanks! Report saved to cloud.')
      } else if (result.error) {
        setStatus(`Cloud save failed — copy the report below. (${result.error})`)
      } else {
        setStatus('Copy the report below and share it with the team.')
      }
    } catch {
      setStatus('Something went wrong — try copying a report manually.')
    } finally {
      setBusy(false)
    }
  }

  async function copyReport() {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      setStatus('Report copied to clipboard.')
    } catch {
      setStatus('Select the text below and copy manually.')
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="modal-panel feedback-modal">
        <header className="modal-panel__header">
          <h2 id="feedback-title">Feedback</h2>
          <button type="button" className="btn btn--small" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="feedback-modal__meta">{APP_VERSION_LABEL}</p>
        <p className="feedback-modal__context">
          Screen: {screen} · Region: {region} · Slot: {saveSlot}
        </p>

        <form className="feedback-modal__form" onSubmit={(e) => void handleSubmit(e)}>
          <label className="feedback-modal__field">
            Type
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as FeedbackKind)}
            >
              <option value="bug">Bug</option>
              <option value="feedback">Feedback</option>
            </select>
          </label>

          <label className="feedback-modal__field">
            What happened?
            <textarea
              required
              rows={3}
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
            />
          </label>

          <label className="feedback-modal__field">
            What should have happened?
            <textarea
              rows={2}
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
            />
          </label>

          <label className="feedback-modal__field">
            Contact / display name (optional)
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>

          {status && <p className="feedback-modal__status">{status}</p>}

          <div className="feedback-modal__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </form>

        {copyText && (
          <section className="feedback-modal__copy">
            <button type="button" className="btn btn--small" onClick={() => void copyReport()}>
              Copy report
            </button>
            <textarea readOnly rows={8} value={copyText} className="feedback-modal__report" />
          </section>
        )}
      </div>
    </div>
  )
}
