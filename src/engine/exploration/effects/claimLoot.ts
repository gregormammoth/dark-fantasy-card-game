import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation } from '../map';
import { appendExplorationLog } from '../log';

export const claimLootHandler: ExplorationEffectHandler = (effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const loot =
    location.loot.find((item) => item.id === (effect.targetId ?? ctx.actionTargetId) && !item.claimed) ??
    location.loot.find((item) => !item.claimed);
  if (!loot) {
    appendExplorationLog(ctx.exploration, 'Nothing useful remains here.', 'action');
    return ctx.exploration;
  }
  loot.claimed = true;
  if (loot.id === 'master_key') {
    ctx.exploration.flags.master_key = true;
  }
  appendExplorationLog(ctx.exploration, `Claimed loot: ${loot.name}.`, 'loot');
  return ctx.exploration;
};
