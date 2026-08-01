import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { recoverFromDiscard } from '../hand';

export const recoverDiscardHandler: ExplorationEffectHandler = (effect, ctx) => {
  return recoverFromDiscard(ctx.exploration, effect.count ?? 1);
};
