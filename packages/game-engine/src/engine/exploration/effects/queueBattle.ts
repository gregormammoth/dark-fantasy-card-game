import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { getCurrentLocation } from '../map';
import { queueBattle } from '../locationEncounters';
import { appendExplorationLog } from '../log';

export const queueBattleHandler: ExplorationEffectHandler = (effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const enemyId = effect.targetId ?? ctx.actionTargetId;
  const next = queueBattle(ctx.exploration, location.id, enemyId);
  const enemy =
    location.enemies.find((item) => (enemyId ? item.id === enemyId : !item.defeated)) ??
    null;
  if (enemy) {
    appendExplorationLog(next, `${enemy.name} bars your path.`, 'danger');
  }
  return next;
};
