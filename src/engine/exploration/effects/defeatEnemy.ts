import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation } from '../map';
import { appendExplorationLog } from '../log';

export const defeatEnemyHandler: ExplorationEffectHandler = (effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const enemy =
    location.enemies.find(
      (item) => item.id === (effect.targetId ?? ctx.actionTargetId) && !item.defeated,
    ) ?? location.enemies.find((item) => !item.defeated);
  if (!enemy) {
    appendExplorationLog(ctx.exploration, 'No enemies remain here.', 'action');
    return ctx.exploration;
  }
  enemy.defeated = true;
  appendExplorationLog(ctx.exploration, `Defeated ${enemy.name}.`, 'danger');
  return ctx.exploration;
};
