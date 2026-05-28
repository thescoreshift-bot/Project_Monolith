import { CharacterSelectActionButton } from './CharacterSelectActionButton'
import { CharacterSelectHeader } from './CharacterSelectHeader'
import { CHARACTER_SELECT_ASSETS } from '../data/characterSelectAssets'
import type { SaveSlotId, SaveSlotSummary } from '../utils/saveSystem'
import type { CharacterSelectStarterId } from '../data/characterSelectAssets'

function formatLastPlayed(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function getStarterPortrait(summary: SaveSlotSummary): string | null {
  const typeKey = summary.starterType?.toLowerCase() as CharacterSelectStarterId | undefined
  if (!typeKey) return null
  return CHARACTER_SELECT_ASSETS.portraits[typeKey] ?? null
}

function SlotCard({
  slotId,
  summary,
  storageLabel,
  selected,
  onSelect,
}: {
  slotId: SaveSlotId
  summary: SaveSlotSummary
  storageLabel: string
  selected: boolean
  onSelect: () => void
}) {
  const isEmpty = summary.isEmpty
  const title = isEmpty
    ? 'Empty Slot'
    : (summary.regionName ?? summary.saveName ?? summary.trainerName ?? 'Unknown Region')
  const starterPortrait = isEmpty ? null : getStarterPortrait(summary)

  return (
    <button
      type="button"
      className={`slot-card${isEmpty ? '' : ' slot-card--filled'}${selected ? ' slot-card--selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      data-slot-id={slotId}
    >
      {isEmpty ? (
        <img
          className="slot-card__frame"
          src={CHARACTER_SELECT_ASSETS.slotFrame}
          alt=""
          draggable={false}
          aria-hidden
        />
      ) : (
        <img
          className="slot-card__profile-panel-art"
          src={CHARACTER_SELECT_ASSETS.slotProfileInfo}
          alt=""
          draggable={false}
          aria-hidden
        />
      )}
      <div
        className={`slot-card__content${isEmpty ? ' slot-card__content--empty' : ' slot-card__content--filled'}`}
      >
        <span className="slot-card__badge">{storageLabel}</span>
        {isEmpty ? <h3 className="slot-card__title">{title}</h3> : null}
        {isEmpty ? (
          <>
            <img
              className="slot-card__empty-emblem"
              src={CHARACTER_SELECT_ASSETS.slotEmptyEmblem}
              alt=""
              draggable={false}
              aria-hidden
            />
            <p className="slot-card__empty">No save data</p>
          </>
        ) : (
          <>
            {starterPortrait ? (
              <img
                className="slot-card__profile-creature"
                src={starterPortrait}
                alt={summary.starterName ? `${summary.starterName} portrait` : 'Starter portrait'}
                draggable={false}
              />
            ) : null}
            <ul className="slot-card__profile-values" aria-label="Save details">
              <li className="slot-card__profile-value slot-card__profile-value--starter">
                {summary.starterName ?? '—'}
                {summary.starterType ? ` · ${summary.starterType}` : ''}
              </li>
              <li className="slot-card__profile-value slot-card__profile-value--level">
                Lv {summary.highestPartyLevel ?? summary.level ?? '—'}
              </li>
              <li className="slot-card__profile-value slot-card__profile-value--region">
                {summary.regionName ?? '—'}
              </li>
              <li className="slot-card__profile-value slot-card__profile-value--badges">
                {summary.badgeCount} badges · Party {summary.partySize ?? 0}
              </li>
              <li className="slot-card__profile-value slot-card__profile-value--coins">
                {summary.coins ?? 0} coins
              </li>
            </ul>
            <p className="slot-card__profile-last-played">
              Last played · {formatLastPlayed(summary.lastPlayed)}
            </p>
          </>
        )}
      </div>
    </button>
  )
}

export function CharacterSelectScreen({
  mode,
  slots,
  selectedSlotId,
  onSelectSlot,
  onContinue,
  onRename,
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
  onRename: () => void
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
  const canRename = selected && !selected.isEmpty

  return (
    <main className="character-select-screen">
      <div
        className="character-select-screen__bg"
        style={{ backgroundImage: `url(${CHARACTER_SELECT_ASSETS.background})` }}
        aria-hidden
      />
      <div className="character-select-screen__overlay" aria-hidden />

      <div className="character-select-screen__content">
      <CharacterSelectHeader
        subtitle={
          mode === 'offline' ? 'Offline saves stay on this browser only.' : undefined
        }
      />

      {statusMessage && (
        <p className="character-select-screen__upload-msg" role="status">
          {statusMessage}
        </p>
      )}

      <div className="character-select-screen__slots">
        <SlotCard
          key={1}
          slotId={1}
          summary={slots[1]}
          storageLabel={mode === 'cloud' ? 'Cloud · Slot 1' : 'Local · Slot 1'}
          selected={selectedSlotId === 1}
          onSelect={() => onSelectSlot(1)}
        />
        <SlotCard
          key={2}
          slotId={2}
          summary={slots[2]}
          storageLabel={mode === 'cloud' ? 'Cloud · Slot 2' : 'Local · Slot 2'}
          selected={selectedSlotId === 2}
          onSelect={() => onSelectSlot(2)}
        />
      </div>

      <div className="character-select-screen__actions">
        <CharacterSelectActionButton
          label="Continue"
          imageSrc={CHARACTER_SELECT_ASSETS.actions.continue}
          onClick={onContinue}
          disabled={!canContinue}
          primary
        />
        <CharacterSelectActionButton
          label="Rename"
          imageSrc={CHARACTER_SELECT_ASSETS.actions.rename}
          onClick={onRename}
          disabled={!canRename}
        />
        <CharacterSelectActionButton
          label={selected?.isEmpty ? 'New Game' : 'Overwrite'}
          imageSrc={CHARACTER_SELECT_ASSETS.actions.overwrite}
          onClick={onNewGame}
          disabled={!selectedSlotId}
        />
        <CharacterSelectActionButton
          label="Delete Save"
          imageSrc={CHARACTER_SELECT_ASSETS.actions.deleteSave}
          onClick={onDelete}
          disabled={!selected || selected.isEmpty}
        />
        <CharacterSelectActionButton
          label="Back"
          imageSrc={CHARACTER_SELECT_ASSETS.actions.back}
          onClick={onBack}
        />
      </div>

      {showUploadLocal && (
        <section className="character-select-screen__upload">
          <p className="character-select-screen__upload-label">Local Save Upload</p>
          {uploadMessage && (
            <p className="character-select-screen__upload-msg" role="status">
              {uploadMessage}
            </p>
          )}
          {(() => {
            const localSourceSlot: SaveSlotId = 1
            const local = localSlotsForUpload[localSourceSlot]
            const localPreview = CHARACTER_SELECT_ASSETS.slotEmptyEmblem
            return (
          <div className="character-select-screen__upload-grid">
                <div key={localSourceSlot} className="upload-local-card">
                  <img
                    className="upload-local-card__art"
                    src={CHARACTER_SELECT_ASSETS.localSaveCloudInfo}
                    alt=""
                    draggable={false}
                    aria-hidden
                  />
                  {local.isEmpty ? (
                    <img
                      className="upload-local-card__local-preview upload-local-card__local-preview--empty"
                      src={localPreview}
                      alt=""
                      draggable={false}
                      aria-hidden
                    />
                  ) : (
                    <div className="upload-local-card__local-stats" role="status">
                      <p className="upload-local-card__notice">Local Save Found</p>
                      <p>{local.saveName ?? local.trainerName ?? 'Unnamed Save'}</p>
                      <p>
                        {local.starterName ?? local.creatureName ?? 'Unknown Starter'} · Lv{' '}
                        {local.highestPartyLevel ?? local.level ?? '—'}
                      </p>
                      <p>
                        {local.regionName ?? 'Unknown Region'} · {local.badgeCount ?? 0} badges
                      </p>
                    </div>
                  )}
                  <div className="upload-local-card__btns">
                    <CharacterSelectActionButton
                      className="upload-local-card__btn upload-local-card__btn--cloud1"
                      label="Upload to Cloud Slot 1"
                      imageSrc={CHARACTER_SELECT_ASSETS.actions.cloud1}
                      onClick={() => onUploadLocal(localSourceSlot, 1)}
                      disabled={uploadBusy || local.isEmpty}
                    />
                    <CharacterSelectActionButton
                      className="upload-local-card__btn upload-local-card__btn--cloud2"
                      label="Upload to Cloud Slot 2"
                      imageSrc={CHARACTER_SELECT_ASSETS.actions.cloud2}
                      onClick={() => onUploadLocal(localSourceSlot, 2)}
                      disabled={uploadBusy || local.isEmpty}
                    />
                  </div>
                </div>
              </div>
            )
          })()}
        </section>
      )}
      </div>
    </main>
  )
}
