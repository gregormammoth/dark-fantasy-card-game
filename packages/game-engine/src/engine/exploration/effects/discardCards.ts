import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { discardFromHand } from '../hand';

export const discardCardsHandler: ExplorationEffectHandler = (effect, ctx) => {
  return discardFromHand(ctx.exploration, effect.count ?? 1);
};
