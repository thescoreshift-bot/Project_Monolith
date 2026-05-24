import { useState } from 'react'
import { HpBar } from './HpBar'
import { ActiveRequestsPanel } from './ActiveRequestsPanel'
import { MonolithForgePanel } from './MonolithForgePanel'
import { RequestQuestBrokerPanel } from './RequestQuestBrokerPanel'
import type { PartyMemberRef, PartyMemberStatus } from '../utils/recoveryStation'
import {
  fullRecoveryCost,
  getFaintedMembers,
  hasHealableNonFainted,
  healEntirePartyCost,
  isPartyFullyHealthy,
  REVIVE_FAINTED_COST,
} from '../utils/recoveryStation'
import type { RequestQuestRunContext, RequestQuestState } from '../utils/requestQuestSystem'
import { hasClaimableRequestQuests } from '../utils/requestQuestSystem'
import type { PartyCreature } from '../utils/party'
import type { RunCreature } from '../utils/progression'
import type { TrainerInventory } from '../utils/inventorySystem'
import { getPartyHighestLevel } from '../utils/regionRewards'

type RecoveryTab = 'heal' | 'request' | 'active' | 'forge'

export function RecoveryStationScreen({
  creature,
  recruits,
  partyMembers,
  requestQuestState,
  requestQuestCtx,
  requestMessage,
  canRefreshFree,
  logMessage,
  selectedReviveTarget,
  onSelectReviveTarget,
  onHealParty,
  onReviveSelected,
  onFullRecovery,
  onAcceptRequest,
  onRefreshRequests,
  onClaimRequest,
  onAbandonRequest,
  trainerInventory,
  forgeMessage,
  onForgeCraft,
  onForgeUpgradeInventory,
  onForgeUpgradeEquipped,
  onBack,
}: {
  creature: RunCreature
  recruits: PartyCreature[]
  partyMembers: PartyMemberStatus[]
  requestQuestState: RequestQuestState
  requestQuestCtx: RequestQuestRunContext
  requestMessage: string | null
  canRefreshFree: boolean
  logMessage: string | null
  selectedReviveTarget: PartyMemberRef | null
  onSelectReviveTarget: (target: PartyMemberRef) => void
  onHealParty: () => void
  onReviveSelected: () => void
  onFullRecovery: () => void
  onAcceptRequest: (questId: string) => void
  onRefreshRequests: () => void
  onClaimRequest: (questId: string) => void
  onAbandonRequest: (questId: string) => void
  trainerInventory: TrainerInventory
  forgeMessage: string | null
  onForgeCraft: (recipeId: string) => void
  onForgeUpgradeInventory: (instanceId: string) => void
  onForgeUpgradeEquipped: (creatureKey: string) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState<RecoveryTab>('heal')
  const healCost = healEntirePartyCost(recruits)
  const fullCost = fullRecoveryCost(recruits)
  const fullyHealthy = isPartyFullyHealthy(creature, recruits)
  const canHealNonFainted = hasHealableNonFainted(creature, recruits)
  const fainted = getFaintedMembers(creature, recruits)
  const canAffordHeal = creature.coins >= healCost
  const canAffordFull = creature.coins >= fullCost
  const canAffordRevive =
    selectedReviveTarget != null && creature.coins >= REVIVE_FAINTED_COST
  const claimable = hasClaimableRequestQuests(requestQuestState)

  return (
    <main className="recovery-station-screen">
      <header className="screen-header">
        <h1 className="screen-header__title">Recovery Station</h1>
        <p className="screen-header__subtitle">
          Restore your party or visit Quest Broker Mira before the next route.
        </p>
      </header>

      <nav className="recovery-station-screen__tabs" aria-label="Recovery Station sections">
        <button
          type="button"
          className={`btn btn--small${tab === 'heal' ? ' btn--primary' : ''}`}
          onClick={() => setTab('heal')}
        >
          Heal Party
        </button>
        <button
          type="button"
          className={`btn btn--small${tab === 'request' ? ' btn--primary' : ''}`}
          onClick={() => setTab('request')}
        >
          Request Quests
        </button>
        <button
          type="button"
          className={`btn btn--small${tab === 'active' ? ' btn--primary' : ''}`}
          onClick={() => setTab('active')}
        >
          Active Requests
          {claimable && (
            <span className="recovery-station-screen__tab-badge" aria-label="Reward ready">
              !
            </span>
          )}
        </button>
        <button
          type="button"
          className={`btn btn--small${tab === 'forge' ? ' btn--primary' : ''}`}
          onClick={() => setTab('forge')}
        >
          Monolith Forge
        </button>
      </nav>

      {tab !== 'forge' && (
        <p className="recovery-station-screen__coins" role="status">
          Coins: <strong>{creature.coins}</strong>
        </p>
      )}

      {tab === 'heal' ? (
        <>
          <section className="recovery-station-screen__party" aria-label="Party status">
            <h2 className="panel-label">Party</h2>
            <ul className="recovery-station-screen__party-list">
              {partyMembers.map((member) => (
                <li
                  key={member.ref.kind === 'starter' ? 'starter' : member.ref.id}
                  className={`recovery-station-screen__party-item${
                    member.fainted ? ' recovery-station-screen__party-item--fainted' : ''
                  }`}
                >
                  <div className="recovery-station-screen__party-head">
                    <strong>{member.name}</strong>
                    <span>Lv. {member.level}</span>
                    <span className="recovery-station-screen__role">{member.roleLabel}</span>
                  </div>
                  <HpBar
                    label="HP"
                    current={Math.max(0, member.currentHp)}
                    max={member.maxHp}
                  />
                  <p className="recovery-station-screen__status">
                    {member.fainted ? 'Fainted' : 'Active'}
                  </p>
                  {member.fainted && (
                    <label className="recovery-station-screen__revive-pick">
                      <input
                        type="radio"
                        name="reviveTarget"
                        checked={
                          selectedReviveTarget != null &&
                          ((member.ref.kind === 'starter' &&
                            selectedReviveTarget.kind === 'starter') ||
                            (member.ref.kind === 'recruit' &&
                              selectedReviveTarget.kind === 'recruit' &&
                              selectedReviveTarget.id === member.ref.id))
                        }
                        onChange={() => onSelectReviveTarget(member.ref)}
                      />
                      Select for revive ({REVIVE_FAINTED_COST} coins)
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {logMessage && (
            <p className="recovery-station-screen__log" role="status">
              {logMessage}
            </p>
          )}

          <section className="recovery-station-screen__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={fullyHealthy || !canHealNonFainted || !canAffordHeal}
              onClick={onHealParty}
            >
              Heal Entire Party ({healCost} coins)
            </button>
            <p className="recovery-station-screen__hint">
              Restores all non-fainted creatures to full HP. Does not revive fainted
              creatures.
            </p>

            <button
              type="button"
              className="btn"
              disabled={fainted.length === 0 || !canAffordRevive}
              onClick={onReviveSelected}
            >
              Revive Fainted Creature ({REVIVE_FAINTED_COST} coins)
            </button>
            <p className="recovery-station-screen__hint">
              Revives the selected fainted creature to 50% HP.
            </p>

            <button
              type="button"
              className="btn"
              disabled={fullyHealthy || !canAffordFull}
              onClick={onFullRecovery}
            >
              Full Recovery ({fullCost} coins)
            </button>
            <p className="recovery-station-screen__hint">
              Revives all fainted creatures and restores full HP for the entire party.
            </p>

            {fullyHealthy && (
              <p className="recovery-station-screen__warn" role="status">
                Your party is already healthy.
              </p>
            )}
          </section>
        </>
      ) : tab === 'forge' ? (
        <MonolithForgePanel
          creature={creature}
          recruits={recruits}
          inventory={trainerInventory}
          partyLevel={getPartyHighestLevel(creature, recruits)}
          message={forgeMessage}
          onCraft={onForgeCraft}
          onUpgradeInventory={onForgeUpgradeInventory}
          onUpgradeEquipped={onForgeUpgradeEquipped}
        />
      ) : tab === 'request' ? (
        <RequestQuestBrokerPanel
          state={requestQuestState}
          ctx={requestQuestCtx}
          message={requestMessage}
          activeCount={requestQuestState.activeRequests.length}
          canRefreshFree={canRefreshFree}
          onAccept={onAcceptRequest}
          onRefresh={onRefreshRequests}
        />
      ) : (
        <ActiveRequestsPanel
          state={requestQuestState}
          message={requestMessage}
          onClaim={onClaimRequest}
          onAbandon={onAbandonRequest}
        />
      )}

      <button type="button" className="btn" onClick={onBack}>
        Back to Map
      </button>
    </main>
  )
}
