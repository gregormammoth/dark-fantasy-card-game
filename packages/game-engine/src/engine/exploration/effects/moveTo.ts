import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { applyMove } from '../map';
import { setLocationEncounterQueue } from '../locationEncounters';
import { appendExplorationLog } from '../log';

export const moveToHandler: ExplorationEffectHandler = (effect, ctx) => {
  const targetId = effect.locationId ?? ctx.actionTargetId;
  if (!targetId) {
    return ctx.exploration;
  }
  let next = applyMove(ctx.exploration, targetId);
  const location = next.locations[targetId];
  if (location) {
    appendExplorationLog(next, `Arrived at ${location.name}.`, 'move');
    next = setLocationEncounterQueue(next, targetId);
  }
  return next;
};
