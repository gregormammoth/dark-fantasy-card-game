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
import { CoachMark } from '@/components/tour/CoachMark';
import { useCoachStep } from '@/components/tour/useCoachStep';
import { useTranslation } from '@/i18n/useTranslation';
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
}: ExplorationScreenProps) {
  const { t } = useTranslation();
  const snapshot = useSelector(actor, (state) => state);
  const context = snapshot.context;
  const { unlock } = useAudio();
  const [questLogOpen, setQuestLogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const { toasts, pushToast, dismissToast } = useExplorationToasts();
  useQuestToastWatcher(context.quests, context.flags, pushToast);
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
  const dialogLines = dialogNpc ? getDialogLines(dialogNpc) : [];
  const dialogIndex = Math.min(context.dialogLineIndex, Math.max(dialogLines.length - 1, 0));
  const battleEnemy =
    locationEncounter?.type === 'battle'
      ? getBattleEnemy(context, locationEncounter)
      : null;

  const dialogActive = Boolean(dialogNpc) && dialogLines.length > 0;
  const dialogCoach = useCoachStep(playerId, 'dialog', dialogActive);
  const moveCoach = useCoachStep(
    playerId,
    'move',
    !isIdle &&
      !dialogActive &&
      !battleEnemy &&
      !pendingAction &&
      !snapshot.matches('encounter'),
  );

  useEffect(() => {
    if (context.flags.escaped_hollowfort && onEscapeToWorld) {
      actor.send({ type: 'ACK_ESCAPE' });
      onEscapeToWorld();
    }
  }, [actor, context.flags.escaped_hollowfort, onEscapeToWorld]);

  const canAct = snapshot.matches('playerTurn') && context.actionsRemaining > 0;

  useEffect(() => {
    if (pendingAction && !canAct) {
      setPendingAction(null);
    }
  }, [pendingAction, canAct]);

  function requestAction(
    action: ExplorationActionType,
    options: Omit<PendingAction, 'action'> = {},
  ) {
    if (context.actionsRemaining <= 0) {
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
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-3.5 px-5 py-6">
      <ExplorationToasts toasts={toasts} onDismiss={dismissToast} />
      {moveCoach.show && (
        <CoachMark
          title={t('tour.exploreTitle')}
          body={t('tour.exploreBody')}
          placement="top"
          onDismiss={moveCoach.dismiss}
        />
      )}
      {dialogCoach.show && (
        <CoachMark
          title={t('tour.dialogTitle')}
          body={t('tour.dialogBody')}
          placement="top"
          onDismiss={dialogCoach.dismiss}
        />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <span className="font-cinzel text-[14px] tracking-[.28em] text-[#b8917f]">
          {t('exploration.header')}
        </span>
        <span className="font-mono text-[10px] tracking-wider text-[#8a7f72]">
          {t('exploration.seedLabel', { seed: context.rng.seed })}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuestLogOpen((open) => !open)}
            className="relative flex items-center gap-2 rounded-[5px] border border-[rgba(201,162,74,.3)] bg-[rgba(10,8,7,.72)] px-3.5 py-2 font-cinzel text-[11px] tracking-[.12em] text-[#e0b552] transition hover:border-[rgba(201,162,74,.7)]"
          >
            {t('exploration.questLog')}
            {activeQuests.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0b552] px-1 text-[10px] text-[#1a1208]">
                {activeQuests.length}
              </span>
            )}
          </button>
          {onOpenPlayer && (
            <button
              type="button"
              onClick={onOpenPlayer}
              title={
                unclaimedCardCount > 0
                  ? t('exploration.unclaimedCards', { count: unclaimedCardCount })
                  : undefined
              }
              className="relative flex items-center gap-2 rounded-[5px] border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 font-cinzel text-[11px] tracking-[.18em] text-[#e0b552] transition hover:brightness-110"
            >
              {t('common.character')}
              {unclaimedCardCount > 0 && (
                <span
                  aria-label={t('exploration.unclaimedCards', { count: unclaimedCardCount })}
                  className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0b552] px-1 text-[10px] text-[#1a1208]"
                >
                  {unclaimedCardCount}
                </span>
              )}
            </button>
          )}
        </div>
        {questLogOpen && (
          <div className="absolute right-0 top-12 z-30 flex max-h-[400px] w-[320px] flex-col gap-2.5 overflow-y-auto rounded-md border border-[#8a744a] bg-[linear-gradient(165deg,#d8c9a0,#c3ac7d)] p-3.5 shadow-[0_24px_60px_-14px_#000] animate-[slidein_.18s_ease-out]">
            <span className="font-cinzel text-[10px] tracking-[.24em] text-[#6b5a38]">
              {t('exploration.activeThreads')}
            </span>
            {activeQuests.length === 0 && completedQuests.length === 0 && (
              <p className="m-0 text-[12px] text-[#4a3b22]">{t('exploration.noQuestsYet')}</p>
            )}
            {activeQuests.map((quest) => {
              const steps = getQuestSteps(context, quest, t);
              const stepsText = questStepsLabel(steps, t);
              return (
                <div
                  key={quest.id}
                  className="rounded border-l-[3px] border-[#e0b552] bg-[rgba(60,45,20,.08)] px-2.5 py-2"
                >
                  <div className="font-cinzel text-[12px] text-[#2b2116]">{quest.name}</div>
                  <div className="mt-1 text-[11px] leading-snug text-[#4a3b22]">
                    {quest.description}
                  </div>
                  <div className="mt-1.5 text-[9px] tracking-wider text-[#6b5a38]">
                    {questLocationLabel(quest, t)} · {t('exploration.active')}
                  </div>
                  {stepsText && (
                    <div className="mt-1 text-[9px] tracking-wider text-[#6b5a38]">{stepsText}</div>
                  )}
                  {steps && steps.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <span
                            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border text-[9px]"
                            style={{
                              borderColor: step.done ? '#4a7a3a' : 'rgba(60,45,20,.35)',
                              color: step.done ? '#4a7a3a' : 'transparent',
                              background: step.done ? 'rgba(74,122,58,.15)' : 'transparent',
                            }}
                          >
                            {step.done ? '✓' : ''}
                          </span>
                          <span
                            className="text-[10px] leading-snug"
                            style={{
                              color: step.done ? '#5a6a4a' : '#4a3b22',
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
                className="rounded border-l-[3px] border-[#4a7a3a] bg-[rgba(60,45,20,.08)] px-2.5 py-2"
              >
                <div className="font-cinzel text-[12px] text-[#2b2116]">{quest.name}</div>
                <div className="mt-1.5 text-[9px] tracking-wider text-[#6b5a38]">
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

      {context.lastActionMessage && (
        <div className="rounded-[5px] border border-[rgba(201,162,74,.2)] bg-[rgba(224,181,82,.08)] px-4 py-2 text-[13px] text-[#e8ddcf]">
          {context.lastActionMessage}
        </div>
      )}

      {pendingAction && (
        <ActionCardPickerModal
          action={pendingAction.action}
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
  );
}
