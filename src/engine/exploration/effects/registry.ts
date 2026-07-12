import type { ExplorationEffectType } from '@/types/exploration';
import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { logHandler } from './log';
import { moveToHandler } from './moveTo';
import { discoverConnectedHandler } from './discoverConnected';
import { revealSecretHandler } from './revealSecret';
import { claimLootHandler } from './claimLoot';
import { defeatEnemyHandler } from './defeatEnemy';
import { talkNpcHandler } from './talkNpc';
import { completeInteractionHandler } from './completeInteraction';
import { unlockInteractionHandler } from './unlockInteraction';
import { setFlagHandler } from './setFlag';
import { recoverDiscardHandler } from './recoverDiscard';
import { discardCardsHandler } from './discardCards';
import { skipNextEncounterHandler } from './skipNextEncounter';
import { reshuffleEncounterHandler } from './reshuffleEncounter';
import { nothingHandler } from './nothing';

export const explorationEffectHandlers: Record<
  ExplorationEffectType,
  ExplorationEffectHandler
> = {
  log: logHandler,
  moveTo: moveToHandler,
  discoverConnected: discoverConnectedHandler,
  revealSecret: revealSecretHandler,
  claimLoot: claimLootHandler,
  defeatEnemy: defeatEnemyHandler,
  talkNpc: talkNpcHandler,
  completeInteraction: completeInteractionHandler,
  unlockInteraction: unlockInteractionHandler,
  setFlag: setFlagHandler,
  recoverDiscard: recoverDiscardHandler,
  discardCards: discardCardsHandler,
  skipNextEncounter: skipNextEncounterHandler,
  reshuffleEncounter: reshuffleEncounterHandler,
  nothing: nothingHandler,
};
