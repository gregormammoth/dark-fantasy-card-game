import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { applyMove, isFinalBranch } from '../map';
import { listAvailableEnemies, setLocationEncounterQueue } from '../locationEncounters';
import { appendExplorationLog } from '../log';
import {
  grantLocationIngredient,
  tryCompleteGatherIngredientsQuest,
  resolveDiningWayProgress,
} from '../quests';

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
    if (listAvailableEnemies(next, targetId).length === 0) {
      next = grantLocationIngredient(next, targetId);
    }
    next = tryCompleteGatherIngredientsQuest(next, targetId);
    next = resolveDiningWayProgress(next, targetId);
    next = setLocationEncounterQueue(next, targetId);
  }
  return next;
};
