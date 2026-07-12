import { useActorRef } from '@xstate/react';
import { explorationMachine } from '@/machine/explorationMachine';

export function useExplorationMachine() {
  return useActorRef(explorationMachine);
}
