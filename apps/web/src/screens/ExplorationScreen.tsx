import { useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
import type { PlayerGender } from '@dark-fantasy/shared/types/player';
import type { ExplorationActionType } from '@dark-fantasy/shared/types/exploration';
import {
  getActiveLocationEncounter,
  getBattleEnemy,
  getDialogLines,
  getDialogNpc,
} from '@dark-fantasy/game-engine/engine/exploration/locationEncounters';
import { listActiveQuests } from '@dark-fantasy/game-engine/engine/exploration/quests';
import { useAudio } from '@/audio/useAudio';
import { PrisonMap } from '@/components/exploration/PrisonMap';
import { LocationDetailPanel } from '@/components/exploration/LocationDetailPanel';
import { ExplorationHandBar } from '@/components/exploration/ExplorationHandBar';
import { ActionCardPickerModal } from '@/components/exploration/ActionCardPickerModal';
import { EncounterModal } from '@/components/exploration/EncounterModal';
import { NpcDialogModal } from '@/components/exploration/NpcDialogModal';
import { LocationBattleModal } from '@/components/exploration/LocationBattleModal';
import { ExplorationLog } from '@/components/exploration/ExplorationLog';
import {
  ExplorationToasts,
  useExplorationToasts,
  useQuestToastWatcher,
} from '@/components/exploration/ExplorationToasts';
import { ExplorationTutorialModal } from '@/components/exploration/ExplorationTutorialModal';
import { useTranslation } from '@/i18n/useTranslation';
import { ClaimBadge } from '@/components/ClaimBadge';
import { isStepSeen, markStepSeen } from '@/lib/tour';
import { getQuestDescription, getQuestName, getNpcLines } from '@/lib/contentLabels';
import { getQuestSteps, questLocationLabel, questStepsLabel } from '@/lib/questUi';

const QUEST_TOAST_SNAP_KEY = 'dfcg-quest-toast-snap';

interface PendingAction {
  action: ExplorationActionType;
  targetId?: string;
  interactionId?: string;
}

interface ExplorationScreenProps {
  actor: ActorRefFrom<typeof explorationMachine>;
  playerId: string;
  onStartLocationBattle?: (locationId: string, enemyId: string) => void;
  onOpenPlayer?: () => void;
  onEscapeToWorld?: () => void;
  runSeed?: number;
  deckCardIds?: string[];
  playerGender: PlayerGender;
  playerName: string;
  unclaimedCardCount?: number;
  unclaimedSkillCount?: number;
}

export function ExplorationScreen({
  actor,
  playerId,
  onStartLocationBattle,
  onOpenPlayer,
  onEscapeToWorld,
  runSeed,
  deckCardIds,
  playerGender,
  playerName,
  unclaimedCardCount = 0,
  unclaimedSkillCount = 0,
}: ExplorationScreenProps) {
  const { t } = useTranslation();
  const snapshot = useSelector(actor, (state) => state);
  const context = snapshot.context;
  const { unlock } = useAudio();
  const [questLogOpen, setQuestLogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const { toasts, pushToast, dismissToast } = useExplorationToasts();
  useQuestToastWatcher(context.quests, context.flags, pushToast, t);
  const isIdle = snapshot.matches('idle');
  const selected = context.selectedLocationId
    ? context.locations[context.selectedLocationId] ?? null
    : null;
  const activeQuests = listActiveQuests(context);
  const completedQuests = context.quests.filter((quest) => quest.status === 'completed');

  const locationEncounter = getActiveLocationEncounter(context);
  const dialogNpc =
    locationEncounter?.type === 'dialog'
      ? getDialogNpc(context, locationEncounter)
      : null;
  const rawDialogLines = dialogNpc ? getDialogLines(dialogNpc) : [];
  const dialogFollowUp = Boolean(
    dialogNpc?.followUpLines?.length &&
      rawDialogLines.length === dialogNpc.followUpLines.length &&
      rawDialogLines.every(
        (line, index) => line === dialogNpc.followUpLines![index],
      ),
  );
  const dialogLines = dialogNpc
    ? getNpcLines(dialogNpc.id, rawDialogLines, t, dialogFollowUp)
    : [];
  const dialogIndex = Math.min(context.dialogLineIndex, Math.max(dialogLines.length - 1, 0));
  const battleEnemy =
    locationEncounter?.type === 'battle'
      ? getBattleEnemy(context, locationEncounter)
      : null;

  const [tutorialOpen, setTutorialOpen] = useState(
    () => !isIdle && !isStepSeen(playerId, 'move'),
  );

  useEffect(() => {
    if (isIdle || isStepSeen(playerId, 'move')) {
      return;
    }
    setTutorialOpen(true);
  }, [isIdle, playerId]);

  function closeTutorial() {
    markStepSeen(playerId, 'move');
    setTutorialOpen(false);
  }

  useEffect(() => {
    if (context.flags.escaped_hollowfort && onEscapeToWorld) {
      actor.send({ type: 'ACK_ESCAPE' });
      onEscapeToWorld();
    }
  }, [actor, context.flags.escaped_hollowfort, onEscapeToWorld]);

  const canAct = snapshot.matches('playerTurn') && context.hand.length > 0;

  useEffect(() => {
    if (pendingAction && !canAct) {
      setPendingAction(null);
    }
  }, [pendingAction, canAct]);

  function requestAction(
    action: ExplorationActionType,
    options: Omit<PendingAction, 'action'> = {},
  ) {
    if (context.hand.length <= 0) {
      return;
    }
    if (context.selectedCardInstanceId) {
      actor.send({ type: 'PLAY_ACTION', action, ...options });
      return;
    }
    setPendingAction({ action, ...options });
  }

  if (isIdle) {
    return (
      <div className="player-screen-bg min-h-screen w-full">
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-[11px] tracking-[.3em] text-[#c9a24a]">{t('exploration.locationMap')}</div>
        <h1 className="font-cinzel text-4xl text-[#f3ead8]">{t('exploration.prisonTitle')}</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-[#b7ab9c]">{t('exploration.prisonIntro')}</p>
        {runSeed !== undefined && (
          <p className="font-mono text-[12px] text-[#8a7f72]">{t('exploration.seed', { seed: runSeed })}</p>
        )}
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(QUEST_TOAST_SNAP_KEY);
            void unlock();
            actor.send({ type: 'START_EXPLORATION', seed: runSeed, deckCardIds });
          }}
          className="rounded-[12px] border border-[rgba(201,162,74,.55)] bg-[rgba(224,181,82,.16)] px-8 py-3.5 font-cinzel text-[14px] tracking-[.18em] text-[#e0b552] transition hover:brightness-110"
        >
          {t('exploration.enterPrison')}
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="player-screen-bg min-h-screen w-full">
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-3.5 px-5 py-6">
      <ExplorationToasts toasts={toasts} onDismiss={dismissToast} />
      <ExplorationTutorialModal open={tutorialOpen} onClose={closeTutorial} />
      <div className="relative flex items-center justify-between gap-3">
        <span
          className="font-cinzel text-[15px] tracking-[.34em]"
          style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          {t('exploration.header')}
        </span>
        <span className="font-mono text-[10px] tracking-[.18em] text-[#7d93ad]">
          {t('exploration.seedLabel', { seed: context.rng.seed })}
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            title={t('explorationTutorial.helpTitle')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(232,200,116,.4)] font-cinzel text-[13px] text-[#fff6e0] transition hover:-translate-y-[2px] hover:border-[#e8c874] hover:shadow-[0_0_20px_-6px_rgba(232,200,116,.6)]"
            style={{ background: 'linear-gradient(160deg,rgba(232,200,116,.22),rgba(232,200,116,.05))', boxShadow: '0 1px 0 rgba(255,255,255,.08) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}
          >
            ?
          </button>
          <button
            type="button"
            onClick={() => setQuestLogOpen((open) => !open)}
            className="relative flex items-center gap-2 rounded-[8px] border border-[rgba(232,200,116,.4)] px-4 py-[9px] font-cinzel text-[11px] tracking-[.12em] text-[#fff6e0] transition hover:-translate-y-[2px] hover:border-[rgba(232,200,116,.8)]"
            style={{ background: 'linear-gradient(160deg,rgba(232,200,116,.22),rgba(232,200,116,.05))', boxShadow: '0 1px 0 rgba(255,255,255,.08) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}
          >
            {t('exploration.questLog')}
            {activeQuests.length > 0 && (
              <span className="flex min-w-[16px] items-center justify-center rounded-[5px] px-1 py-0 font-cinzel text-[10px] text-[#1a1208] shadow-[0_0_8px_rgba(232,200,116,.6)]" style={{ height: 16, background: 'linear-gradient(180deg,#f5dfa0,#c9922e)' }}>
                {activeQuests.length}
              </span>
            )}
          </button>
          {onOpenPlayer && (
            <button
              type="button"
              onClick={onOpenPlayer}
              className={`relative flex items-center gap-2 rounded-[8px] border border-[rgba(232,200,116,.4)] px-4 py-[9px] font-cinzel text-[11px] tracking-[.12em] text-[#fff6e0] transition hover:-translate-y-[2px] hover:border-[rgba(232,200,116,.8)]${
                unclaimedSkillCount > 0 || unclaimedCardCount > 0 ? ' claim-glow' : ''
              }`}
              style={{ background: 'linear-gradient(160deg,rgba(232,200,116,.22),rgba(232,200,116,.05))', boxShadow: '0 1px 0 rgba(255,255,255,.08) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}
            >
              {t('common.character')}
              {unclaimedSkillCount > 0 && (
                <ClaimBadge kind="level" count={unclaimedSkillCount} />
              )}
              {unclaimedCardCount > 0 && (
                <ClaimBadge kind="card" count={unclaimedCardCount} />
              )}
            </button>
          )}
        </div>
        {questLogOpen && (
          <div
            className="absolute right-0 top-12 z-30 flex max-h-[400px] w-[320px] flex-col gap-[9px] overflow-y-auto rounded-[10px] p-3.5 shadow-[0_30px_60px_-14px_rgba(0,0,0,.9),0_0_40px_-18px_rgba(74,192,255,.35)] animate-[slidein_.18s_ease-out]"
            style={{ background: 'linear-gradient(160deg,#142238,#0a1120)', border: '1px solid rgba(232,200,116,.3)', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -14px rgba(0,0,0,.9),0 0 40px -18px rgba(74,192,255,.35)' }}
          >
            <span className="font-cinzel text-[10px] tracking-[.24em] text-[#7d93ad]">
              {t('exploration.activeThreads')}
            </span>
            {activeQuests.length === 0 && completedQuests.length === 0 && (
              <p className="m-0 text-[12px] text-[#9db4cc]">{t('exploration.noQuestsYet')}</p>
            )}
            {activeQuests.map((quest) => {
              const steps = getQuestSteps(context, quest, t);
              const stepsText = questStepsLabel(steps, t);
              return (
                <div
                  key={quest.id}
                  className="rounded-[8px] border-l-[3px] border-[#e8c874] px-[13px] py-[11px]"
                  style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.15))', boxShadow: '0 1px 0 rgba(255,255,255,.04) inset' }}
                >
                  <div className="font-cinzel text-[12px] text-[#eef3f8]">
                    {getQuestName(quest.id, t, quest.name)}
                  </div>
                  <div className="mt-[3px] text-[11px] leading-snug text-[#9db4cc]">
                    {getQuestDescription(quest.id, t, quest.description)}
                  </div>
                  <div className="mt-[5px] text-[9px] tracking-[.08em] text-[#7d93ad]">
                    {questLocationLabel(quest, t)} · {t('exploration.active')}
                  </div>
                  {stepsText && (
                    <div className="mt-1 text-[9px] tracking-[.08em] text-[#7d93ad]">{stepsText}</div>
                  )}
                  {steps && steps.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <span
                            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border text-[9px]"
                            style={{
                              borderColor: step.done ? '#5fd68a' : 'rgba(232,200,116,.3)',
                              color: step.done ? '#5fd68a' : 'transparent',
                              background: step.done ? 'rgba(95,214,138,.15)' : 'transparent',
                            }}
                          >
                            {step.done ? '✓' : ''}
                          </span>
                          <span
                            className="text-[10px] leading-snug"
                            style={{
                              color: step.done ? '#6f8a7a' : '#c2d0e0',
                              textDecoration: step.done ? 'line-through' : 'none',
                            }}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-[8px] border-l-[3px] border-[#5fd68a] px-[13px] py-[11px]"
                style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.15))', boxShadow: '0 1px 0 rgba(255,255,255,.04) inset' }}
              >
                <div className="font-cinzel text-[12px] text-[#eef3f8]">
                  {getQuestName(quest.id, t, quest.name)}
                </div>
                <div className="mt-1.5 text-[9px] tracking-[.08em] text-[#7d93ad]">
                  {questLocationLabel(quest, t)} · {t('exploration.complete')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <PrisonMap
          context={context}
          playerGender={playerGender}
          playerName={playerName}
          onSelect={(locationId) => actor.send({ type: 'SELECT_LOCATION', locationId })}
        />
        <LocationDetailPanel
          context={context}
          location={selected}
          onClose={() => actor.send({ type: 'CLEAR_SELECTION' })}
          onTravel={(locationId) => requestAction('MOVE', { targetId: locationId })}
          onTalk={(locationId, npcId) =>
            actor.send({ type: 'QUEUE_DIALOG', locationId, npcId })
          }
          onFight={(locationId, enemyId) =>
            actor.send({ type: 'QUEUE_BATTLE', locationId, enemyId })
          }
          onEscape={onEscapeToWorld}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
        <ExplorationHandBar
          context={context}
          onSelectCard={(cardInstanceId) => actor.send({ type: 'SELECT_CARD', cardInstanceId })}
          onEndTurn={() => actor.send({ type: 'END_TURN' })}
        />
        <ExplorationLog entries={context.log} />
      </div>

      {pendingAction && (
        <ActionCardPickerModal
          actionLabel={t(`actionPicker.action${pendingAction.action}`)}
          hand={context.hand}
          onPick={(cardInstanceId) => {
            actor.send({
              type: 'PLAY_ACTION',
              action: pendingAction.action,
              targetId: pendingAction.targetId,
              interactionId: pendingAction.interactionId,
              cardInstanceId,
            });
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {snapshot.matches('encounter') && context.pendingEncounter && (
        <EncounterModal
          encounter={context.pendingEncounter}
          onDismiss={() => actor.send({ type: 'DISMISS_ENCOUNTER' })}
        />
      )}

      {dialogNpc && dialogLines.length > 0 && (
        <NpcDialogModal
          npc={dialogNpc}
          line={dialogLines[dialogIndex] ?? dialogLines[0]!}
          progress={`${dialogIndex + 1} / ${dialogLines.length}`}
          nextLabel={
            dialogIndex + 1 >= dialogLines.length ? t('common.close') : t('common.continue')
          }
          onNext={() => actor.send({ type: 'ADVANCE_DIALOG' })}
          context={context}
          onBuyService={(serviceId) =>
            actor.send({
              type: 'BUY_SHOP_SERVICE',
              locationId: locationEncounter?.locationId ?? context.currentLocationId,
              npcId: dialogNpc.id,
              serviceId,
            })
          }
        />
      )}

      {battleEnemy && (
        <LocationBattleModal
          enemy={battleEnemy}
          onFight={() => {
            if (onStartLocationBattle && locationEncounter) {
              onStartLocationBattle(locationEncounter.locationId, battleEnemy.id);
            }
          }}
        />
      )}
    </div>
    </div>
  );
}
