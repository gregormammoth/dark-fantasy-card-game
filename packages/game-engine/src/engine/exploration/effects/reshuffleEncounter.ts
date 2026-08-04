import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { shuffle } from '../../deck';
import { appendExplorationLog } from '../log';

export const reshuffleEncounterHandler: ExplorationEffectHandler = (_effect, ctx) => {
  ctx.exploration.encounterDeck = shuffle(
    [...ctx.exploration.encounterDeck, ...ctx.exploration.encounterDiscard],
    ctx.exploration.rng,
  );
  ctx.exploration.encounterDiscard = [];
  appendExplorationLog(ctx.exploration, 'The encounter deck is reshuffled.', 'encounter');
  return ctx.exploration;
};
