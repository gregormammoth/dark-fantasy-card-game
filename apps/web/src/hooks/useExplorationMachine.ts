import { useActorRef } from '@xstate/react';
import { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';

export function useExplorationMachine() {
  return useActorRef(explorationMachine);
}
