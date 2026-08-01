import { useActorRef } from '@xstate/react';
import { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';

export function useBattleMachine() {
  return useActorRef(battleMachine);
}
