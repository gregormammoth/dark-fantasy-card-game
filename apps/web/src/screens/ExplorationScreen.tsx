import { useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
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
import { EncounterModal } from '@/components/exploration/EncounterModal';
import { NpcDialogModal } from '@/components/exploration/NpcDialogModal';
import { LocationBattleModal } from '@/components/exploration/LocationBattleModal';
import { ExplorationLog } from '@/components/exploration/ExplorationLog';

interface ExplorationScreenProps {
  actor: ActorRefFrom<typeof explorationMachine>;
  onStartLocationBattle?: (locationId: string, enemyId: string) => void;
  onOpenPlayer?: () => void;
  onEscapeToWorld?: () => void;
}

export function ExplorationScreen({
  actor,
  onStartLocationBattle,
  onOpenPlayer,
  onEscapeToWorld,
}: ExplorationScreenProps) {
  const snapshot = useSelector(actor, (state) => state);
  const context = snapshot.context;
  const { unlock } = useAudio();
  const [questLogOpen, setQuestLogOpen] = useState(false);
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

  useEffect(() => {
    if (context.flags.escaped_hollowfort && onEscapeToWorld) {
      actor.send({ type: 'ACK_ESCAPE' });
      onEscapeToWorld();
    }
  }, [actor, context.flags.escaped_hollowfort, onEscapeToWorld]);

  if (isIdle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-[11px] tracking-[.3em] text-[#c9a24a]">LOCATION MAP</div>
        <h1 className="font-cinzel text-4xl text-[#f3ead8]">Hollowfort Prison</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-[#b7ab9c]">
          Travel room to room. Dialogs and fights trigger on enter. Play cards to move, search,
          and act — then end your turn for the encounter deck.
        </p>
        <button
          type="button"
          onClick={() => {
            void unlock();
            actor.send({ type: 'START_EXPLORATION' });
          }}
          className="rounded-[12px] border border-[rgba(201,162,74,.55)] bg-[rgba(224,181,82,.16)] px-8 py-3.5 font-cinzel text-[14px] tracking-[.18em] text-[#e0b552] transition hover:brightness-110"
        >
          ENTER THE PRISON
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-3.5 px-5 py-6">
      <div className="relative flex items-center justify-between gap-3">
        <span className="font-cinzel text-[14px] tracking-[.28em] text-[#b8917f]">
          HOLLOWFORT PRISON
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuestLogOpen((open) => !open)}
            className="relative flex items-center gap-2 rounded-[10px] border border-[rgba(201,162,74,.3)] bg-[rgba(10,8,7,.72)] px-3.5 py-2 font-cinzel text-[11px] tracking-[.12em] text-[#e0b552] transition hover:border-[rgba(201,162,74,.7)]"
          >
            QUEST LOG
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
              className="rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 font-cinzel text-[11px] tracking-[.18em] text-[#e0b552] transition hover:brightness-110"
            >
              CHARACTER
            </button>
          )}
        </div>
        {questLogOpen && (
          <div className="absolute right-0 top-12 z-30 flex max-h-[400px] w-[320px] flex-col gap-2.5 overflow-y-auto rounded-[12px] border border-[rgba(201,162,74,.28)] bg-[rgba(12,9,8,.96)] p-3.5 shadow-[0_24px_60px_-14px_#000]">
            <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">ACTIVE THREADS</span>
            {activeQuests.length === 0 && completedQuests.length === 0 && (
              <p className="m-0 text-[12px] text-[#8a7f72]">No quests yet. Talk to faction NPCs.</p>
            )}
            {activeQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-[9px] border-l-[3px] border-[#e0b552] bg-[rgba(224,181,82,.08)] px-2.5 py-2"
              >
                <div className="font-cinzel text-[12px] text-[#f0e2c0]">{quest.name}</div>
                <div className="mt-1 text-[11px] leading-snug text-[#b7ab9c]">{quest.description}</div>
                <div className="mt-1.5 text-[9px] tracking-wider text-[#8a7f72]">ACTIVE</div>
              </div>
            ))}
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-[9px] border-l-[3px] border-[#6fae5a] bg-[rgba(111,174,90,.08)] px-2.5 py-2"
              >
                <div className="font-cinzel text-[12px] text-[#d7e8cf]">{quest.name}</div>
                <div className="mt-1.5 text-[9px] tracking-wider text-[#8a7f72]">COMPLETE</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <PrisonMap
          context={context}
          onSelect={(locationId) => actor.send({ type: 'SELECT_LOCATION', locationId })}
        />
        <LocationDetailPanel
          context={context}
          location={selected}
          onClose={() => actor.send({ type: 'CLEAR_SELECTION' })}
          onTravel={(locationId) =>
            actor.send({ type: 'PLAY_ACTION', action: 'MOVE', targetId: locationId })
          }
          onAction={(action: ExplorationActionType, options) =>
            actor.send({
              type: 'PLAY_ACTION',
              action,
              targetId: options?.targetId,
              interactionId: options?.interactionId,
            })
          }
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
        <div className="rounded-[10px] border border-[rgba(201,162,74,.2)] bg-[rgba(224,181,82,.08)] px-4 py-2 text-[13px] text-[#e8ddcf]">
          {context.lastActionMessage}
        </div>
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
          nextLabel={dialogIndex + 1 >= dialogLines.length ? 'CLOSE' : 'CONTINUE'}
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
