import type { ExplorationEffectType } from '@dark-fantasy/shared/types/exploration';
import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { logHandler } from './log';
import { moveToHandler } from './moveTo';
import { queueBattleHandler } from './queueBattle';
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
import { shuffleCardsHandler } from './shuffleCards';
import { addCardsHandler } from './addCards';
import { modifyShieldHandler } from './modifyShield';
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
  queueBattle: queueBattleHandler,
  completeInteraction: completeInteractionHandler,
  unlockInteraction: unlockInteractionHandler,
  setFlag: setFlagHandler,
  recoverDiscard: recoverDiscardHandler,
  discardCards: discardCardsHandler,
  shuffleCards: shuffleCardsHandler,
  addCards: addCardsHandler,
  modifyShield: modifyShieldHandler,
  skipNextEncounter: skipNextEncounterHandler,
  reshuffleEncounter: reshuffleEncounterHandler,
  nothing: nothingHandler,
};
