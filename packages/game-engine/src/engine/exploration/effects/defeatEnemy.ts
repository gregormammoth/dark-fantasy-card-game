import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { getCurrentLocation } from '../map';
import { appendExplorationLog } from '../log';

export const defeatEnemyHandler: ExplorationEffectHandler = (effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const targetId = effect.targetId ?? ctx.actionTargetId;
  const index = location.enemies.findIndex((item) =>
    targetId ? item.id === targetId && !item.defeated : !item.defeated,
  );
  if (index < 0) {
    appendExplorationLog(ctx.exploration, 'No enemies remain here.', 'action');
    return ctx.exploration;
  }
  const [enemy] = location.enemies.splice(index, 1);
  appendExplorationLog(ctx.exploration, `Defeated ${enemy.name}.`, 'danger');
  return ctx.exploration;
};
