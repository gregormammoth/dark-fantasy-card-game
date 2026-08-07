import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { addCardsToPile } from '../hand';

export const addCardsHandler: ExplorationEffectHandler = (effect, ctx) => {
  const pile = effect.pile === 'hand' || effect.pile === 'discard' ? effect.pile : 'deck';
  return addCardsToPile(ctx.exploration, effect.cardIds ?? [], pile);
};
