import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { discardFromHand } from '../hand';

export const discardCardsHandler: ExplorationEffectHandler = (effect, ctx) => {
  return discardFromHand(ctx.exploration, effect.count ?? 1);
};
