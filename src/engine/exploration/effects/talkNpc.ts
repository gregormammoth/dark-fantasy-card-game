import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation } from '../map';
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
  npc.talked = true;
  appendExplorationLog(
    ctx.exploration,
    `${npc.name}: "${npc.description}"`,
    'action',
  );
  return ctx.exploration;
};
