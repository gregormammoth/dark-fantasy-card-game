import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { explorationMachine } from '@/machine/explorationMachine';
import type { ExplorationActionType } from '@/types/exploration';
import { PrisonMap } from '@/components/exploration/PrisonMap';
import { LocationDetailPanel } from '@/components/exploration/LocationDetailPanel';
import { ExplorationHandBar } from '@/components/exploration/ExplorationHandBar';
import { EncounterModal } from '@/components/exploration/EncounterModal';
import { ExplorationLog } from '@/components/exploration/ExplorationLog';

interface ExplorationScreenProps {
  actor: ActorRefFrom<typeof explorationMachine>;
  onOpenBattle?: () => void;
}

export function ExplorationScreen({ actor, onOpenBattle }: ExplorationScreenProps) {
  const snapshot = useSelector(actor, (state) => state);
  const context = snapshot.context;
  const isIdle = snapshot.matches('idle');
  const selected = context.selectedLocationId
    ? context.locations[context.selectedLocationId] ?? null
    : null;

  if (isIdle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-[11px] tracking-[.3em] text-[#c9a24a]">EXPLORATION MODE</div>
        <h1 className="font-cinzel text-4xl text-[#f3ead8]">Hollowfort Prison</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-[#b7ab9c]">
          Play cards as actions. Move, search, open, fight, talk, and rest. End your turn to face
          the encounter deck.
        </p>
        <button
          type="button"
          onClick={() => actor.send({ type: 'START_EXPLORATION' })}
          className="rounded-[12px] border border-[rgba(201,162,74,.55)] bg-[rgba(224,181,82,.16)] px-8 py-3.5 font-cinzel text-[14px] tracking-[.18em] text-[#e0b552] transition hover:brightness-110"
        >
          ENTER THE PRISON
        </button>
        {onOpenBattle && (
          <button
            type="button"
            onClick={onOpenBattle}
            className="text-[12px] tracking-wider text-[#8a7f72] underline-offset-4 hover:text-[#c9a24a] hover:underline"
          >
            Open battle simulator instead
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-3.5 px-5 py-6">
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

      {onOpenBattle && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenBattle}
            className="text-[11px] tracking-wider text-[#8a7f72] hover:text-[#c9a24a]"
          >
            BATTLE SIMULATOR
          </button>
        </div>
      )}

      {snapshot.matches('encounter') && context.pendingEncounter && (
        <EncounterModal
          encounter={context.pendingEncounter}
          onDismiss={() => actor.send({ type: 'DISMISS_ENCOUNTER' })}
        />
      )}
    </div>
  );
}
