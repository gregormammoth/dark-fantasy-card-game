import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { getCurrentLocation } from '../map';
import { queueDialog } from '../locationEncounters';
import { appendExplorationLog } from '../log';

export const talkNpcHandler: ExplorationEffectHandler = (effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const npc =
    location.npcs.find((item) => item.id === (effect.targetId ?? ctx.actionTargetId)) ??
    location.npcs[0];
  if (!npc) {
    appendExplorationLog(ctx.exploration, 'There is no one to speak with.', 'action');
    return ctx.exploration;
  }
  appendExplorationLog(ctx.exploration, `${npc.name} turns toward you.`, 'action');
  return queueDialog(ctx.exploration, location.id, npc.id);
};
