import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { shuffle } from '@/engine/deck';
import { appendExplorationLog } from '../log';

export const reshuffleEncounterHandler: ExplorationEffectHandler = (_effect, ctx) => {
  ctx.exploration.encounterDeck = shuffle([
    ...ctx.exploration.encounterDeck,
    ...ctx.exploration.encounterDiscard,
  ]);
  ctx.exploration.encounterDiscard = [];
  appendExplorationLog(ctx.exploration, 'The encounter deck is reshuffled.', 'encounter');
  return ctx.exploration;
};
