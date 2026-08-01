import { useActorRef } from '@xstate/react';
import { battleMachine } from '@/machine/battleMachine';

export function useBattleMachine() {
  return useActorRef(battleMachine);
}
