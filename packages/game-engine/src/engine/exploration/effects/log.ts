import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { appendExplorationLog } from '../log';

export const logHandler: ExplorationEffectHandler = (effect, ctx) => {
  if (effect.message) {
    appendExplorationLog(ctx.exploration, effect.message, 'action');
  }
  return ctx.exploration;
};
