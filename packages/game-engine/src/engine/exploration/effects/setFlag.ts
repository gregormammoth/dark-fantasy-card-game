import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { appendExplorationLog } from '../log';

export const setFlagHandler: ExplorationEffectHandler = (effect, ctx) => {
  if (!effect.flag) {
    return ctx.exploration;
  }
  ctx.exploration.flags[effect.flag] = effect.flagValue ?? true;
  appendExplorationLog(ctx.exploration, `Marked: ${effect.flag}.`, 'system');
  return ctx.exploration;
};
