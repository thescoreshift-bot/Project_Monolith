import { useMemo, useState } from 'react'
import { APP_VERSION, APP_VERSION_LABEL } from '../utils/version'
import {
  buildFeedbackReportText,
  type FeedbackKind,
  type FeedbackPayload,
  type FeedbackSeverity,
} from '../utils/feedbackSystem'

type FeedbackModalProps = {
  screen: string
  region: string
  saveSlot: string
  saveMode: string
  runMode: string
  partyHighestLevel: number
  mapSeed?: string
  loggedInUsername?: string
  defaultContact?: string
  onClose: () => void
  onSubmit: (input: {
    kind: FeedbackKind
    severity: FeedbackSeverity
    whatHappened: string
    expectedBehavior: string
    contact?: string
  }) => Promise<{ copyText: string; savedToCloud?: boolean; error?: string }>
}

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  return navigator.userAgent
}

export function FeedbackModal({
  screen,
  region,
  saveSlot,
  saveMode,
  runMode,
  partyHighestLevel,
  mapSeed,
  loggedInUsername,
  defaultContact,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium')
  const [whatHappened, setWhatHappened] = useState('')
  const [expectedBehavior, setExpectedBehavior] = useState('')
  const [contact, setContact] = useState(defaultContact ?? '')
  const [busy, setBusy] = useState(false)
  const [copyText, setCopyText] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const autoReportPreview = useMemo(() => {
    const draft: FeedbackPayload = {
      kind,
      severity,
      whatHappened: whatHappened.trim() || '(not entered yet)',
      expectedBehavior: expectedBehavior.trim(),
      contact: contact.trim() || loggedInUsername,
      screen,
      region,
      saveSlot,
      saveMode,
      runMode,
      partyHighestLevel,
      mapSeed,
      loggedInUsername,
      browserInfo: getBrowserInfo(),
      appVersion: APP_VERSION,
      createdAt: new Date().toISOString(),
    }
    return buildFeedbackReportText(draft)
  }, [
    kind,
    severity,
    whatHappened,
    expectedBehavior,
    contact,
    screen,
    region,
    saveSlot,
    saveMode,
    runMode,
    partyHighestLevel,
    mapSeed,
    loggedInUsername,
  ])

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
        severity,
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
        setStatus('Report saved on this device — copy below to share with the team.')
      }
    } catch {
      setCopyText(autoReportPreview)
      setStatus('Something went wrong — copy the fallback report below.')
    } finally {
      setBusy(false)
    }
  }

  async function copyReport(text: string) {
    try {
      await navigator.clipboard.writeText(text)
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
        <dl className="feedback-modal__auto">
          <div>
            <dt>Screen</dt>
            <dd>{screen}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>{region}</dd>
          </div>
          <div>
            <dt>Save slot</dt>
            <dd>{saveSlot}</dd>
          </div>
          <div>
            <dt>Save mode</dt>
            <dd>{saveMode}</dd>
          </div>
          <div>
            <dt>Run mode</dt>
            <dd>{runMode}</dd>
          </div>
          <div>
            <dt>Party level</dt>
            <dd>{partyHighestLevel}</dd>
          </div>
          {mapSeed && (
            <div>
              <dt>Seed</dt>
              <dd>{mapSeed}</dd>
            </div>
          )}
          {loggedInUsername && (
            <div>
              <dt>Account</dt>
              <dd>{loggedInUsername}</dd>
            </div>
          )}
        </dl>

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
            Severity
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)}
            >
              <option value="low">Low — minor / cosmetic</option>
              <option value="medium">Medium — gameplay issue</option>
              <option value="high">High — blocks progress</option>
              <option value="critical">Critical — crash / data loss</option>
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
              placeholder={loggedInUsername ?? 'How we can reach you'}
            />
          </label>

          {status && <p className="feedback-modal__status">{status}</p>}

          <div className="feedback-modal__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Sending…' : 'Submit'}
            </button>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => void copyReport(copyText ?? autoReportPreview)}
            >
              Copy report
            </button>
          </div>
        </form>

        <section className="feedback-modal__copy">
          <p className="panel-label">Fallback report (auto-filled)</p>
          <textarea
            readOnly
            rows={10}
            value={copyText ?? autoReportPreview}
            className="feedback-modal__report"
          />
        </section>
      </div>
    </div>
  )
}
