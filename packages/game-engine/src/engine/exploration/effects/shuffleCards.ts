import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { shufflePlayerCards } from '../hand';

export const shuffleCardsHandler: ExplorationEffectHandler = (effect, ctx) => {
  return shufflePlayerCards(ctx.exploration, effect.pile ?? 'hand');
};
