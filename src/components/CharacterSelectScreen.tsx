import type { SaveSlotId, SaveSlotSummary } from '../utils/saveSystem'

function formatLastPlayed(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function SlotCard({
  summary,
  storageLabel,
  selected,
  onSelect,
}: {
  summary: SaveSlotSummary
  storageLabel: string
  selected: boolean
  onSelect: () => void
}) {
  const title = summary.isEmpty
    ? 'Empty Slot'
    : (summary.saveName ?? summary.creatureName ?? 'Saved Run')

  return (
    <button
      type="button"
      className={`slot-card${selected ? ' slot-card--selected' : ''}`}
      onClick={onSelect}
    >
      <span className="slot-card__badge">{storageLabel}</span>
      <h3 className="slot-card__title">{title}</h3>
      {summary.isEmpty ? (
        <p className="slot-card__empty">No save data</p>
      ) : (
        <ul className="slot-card__stats">
          <li>
            {summary.creatureName} · Lv {summary.level}
          </li>
          <li>{summary.regionName}</li>
          <li>
            {summary.badgeCount} badges · Party {summary.partySize}
          </li>
          <li>{summary.coins} coins</li>
          <li>Last played: {formatLastPlayed(summary.lastPlayed)}</li>
        </ul>
      )}
    </button>
  )
}

export function CharacterSelectScreen({
  mode,
  slots,
  selectedSlotId,
  onSelectSlot,
  onContinue,
  onNewGame,
  onDelete,
  onBack,
  showUploadLocal,
  localSlotsForUpload,
  onUploadLocal,
  uploadBusy,
  uploadMessage,
  statusMessage,
}: {
  mode: 'cloud' | 'offline'
  slots: { 1: SaveSlotSummary; 2: SaveSlotSummary }
  selectedSlotId: SaveSlotId | null
  onSelectSlot: (id: SaveSlotId) => void
  onContinue: () => void
  onNewGame: () => void
  onDelete: () => void
  onBack: () => void
  showUploadLocal: boolean
  localSlotsForUpload: { 1: SaveSlotSummary; 2: SaveSlotSummary }
  onUploadLocal: (localSlot: SaveSlotId, cloudSlot: SaveSlotId) => void
  uploadBusy: boolean
  uploadMessage: string | null
  statusMessage?: string | null
}) {
  const selected = selectedSlotId ? slots[selectedSlotId] : null
  const canContinue = selected && !selected.isEmpty

  return (
    <main className="character-select-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Character Select</h1>
        <p className="screen-header__subtitle">
          {mode === 'cloud'
            ? 'Cloud save slots — syncs across devices when logged in.'
            : 'Offline saves stay on this browser only.'}
        </p>
      </header>

      {statusMessage && (
        <p className="character-select-screen__upload-msg" role="status">
          {statusMessage}
        </p>
      )}

      <div className="character-select-screen__slots">
        <SlotCard
          summary={slots[1]}
          storageLabel={mode === 'cloud' ? 'Cloud Slot 1' : 'Local Slot 1'}
          selected={selectedSlotId === 1}
          onSelect={() => onSelectSlot(1)}
        />
        <SlotCard
          summary={slots[2]}
          storageLabel={mode === 'cloud' ? 'Cloud Slot 2' : 'Local Slot 2'}
          selected={selectedSlotId === 2}
          onSelect={() => onSelectSlot(2)}
        />
      </div>

      <div className="character-select-screen__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
        </button>
        <button type="button" className="btn" disabled={!selectedSlotId} onClick={onNewGame}>
          New Game
        </button>
        <button
          type="button"
          className="btn"
          disabled={!selected || selected.isEmpty}
          onClick={onDelete}
        >
          Delete Save
        </button>
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
      </div>

      {showUploadLocal && (
        <section className="character-select-screen__upload">
          <h2 className="panel-label">Upload Local Save to Cloud</h2>
          <p className="character-select-screen__upload-note">
            Copy a browser save into a cloud slot. Overwrites only after you confirm.
          </p>
          {uploadMessage && (
            <p className="character-select-screen__upload-msg" role="status">
              {uploadMessage}
            </p>
          )}
          <div className="character-select-screen__upload-grid">
            {([1, 2] as SaveSlotId[]).map((localSlot) => {
              const local = localSlotsForUpload[localSlot]
              if (local.isEmpty) return null
              return (
                <div key={localSlot} className="upload-local-row">
                  <span>
                    Local Slot {localSlot}: {local.creatureName} Lv{local.level}
                  </span>
                  <div className="upload-local-row__btns">
                    <button
                      type="button"
                      className="btn btn--small"
                      disabled={uploadBusy}
                      onClick={() => onUploadLocal(localSlot, 1)}
                    >
                      → Cloud 1
                    </button>
                    <button
                      type="button"
                      className="btn btn--small"
                      disabled={uploadBusy}
                      onClick={() => onUploadLocal(localSlot, 2)}
                    >
                      → Cloud 2
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
