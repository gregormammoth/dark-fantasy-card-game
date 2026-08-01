import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { applyMove } from '../map';
import { appendExplorationLog } from '../log';

export const moveToHandler: ExplorationEffectHandler = (effect, ctx) => {
  const targetId = effect.locationId ?? ctx.actionTargetId;
  if (!targetId) {
    return ctx.exploration;
  }
  const next = applyMove(ctx.exploration, targetId);
  const location = next.locations[targetId];
  if (location) {
    appendExplorationLog(next, `Arrived at ${location.name}.`, 'move');
  }
  return next;
};
