import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { appendExplorationLog } from '../log';

export const skipNextEncounterHandler: ExplorationEffectHandler = (_effect, ctx) => {
  ctx.exploration.flags.skipNextEncounter = true;
  appendExplorationLog(ctx.exploration, 'You will avoid the next encounter.', 'system');
  return ctx.exploration;
};
