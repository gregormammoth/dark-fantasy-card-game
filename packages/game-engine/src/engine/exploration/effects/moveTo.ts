import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { applyMove, isFinalBranch } from '../map';
import { setLocationEncounterQueue } from '../locationEncounters';
import { appendExplorationLog } from '../log';

export const moveToHandler: ExplorationEffectHandler = (effect, ctx) => {
  const targetId = effect.locationId ?? ctx.actionTargetId;
  if (!targetId) {
    return ctx.exploration;
  }
  const hadBranch = !!ctx.exploration.finalBranchId;
  let next = applyMove(ctx.exploration, targetId);
  const location = next.locations[targetId];
  if (location) {
    appendExplorationLog(next, `Arrived at ${location.name}.`, 'move');
    if (!hadBranch && isFinalBranch(targetId) && next.finalBranchId === targetId) {
      appendExplorationLog(
        next,
        `You commit to ${location.name}. The other final doors seal behind you.`,
        'system',
      );
    }
    next = setLocationEncounterQueue(next, targetId);
  }
  return next;
};
