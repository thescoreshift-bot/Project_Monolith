import {
  TUTORIAL_STEPS,
  type TutorialStepId,
} from '../utils/tutorial'

type TutorialOverlayProps = {
  step: TutorialStepId
  stepIndex: number
  totalSteps: number
  onSkip: () => void
  onDismiss: () => void
}

export function TutorialOverlay({
  step,
  stepIndex,
  totalSteps,
  onSkip,
  onDismiss,
}: TutorialOverlayProps) {
  const content = TUTORIAL_STEPS[step]

  return (
    <div className="tutorial-overlay" role="dialog" aria-labelledby="tutorial-title">
      <div className="tutorial-overlay__card">
        <p className="tutorial-overlay__progress">
          Tip {stepIndex + 1} / {totalSteps}
        </p>
        <h2 id="tutorial-title" className="tutorial-overlay__title">
          {content.title}
        </h2>
        <p className="tutorial-overlay__body">{content.body}</p>
        <div className="tutorial-overlay__actions">
          <button type="button" className="btn btn--primary btn--small" onClick={onDismiss}>
            Got it
          </button>
          <button type="button" className="btn btn--small" onClick={onSkip}>
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
