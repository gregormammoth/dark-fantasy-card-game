import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { discoverConnectedLocations } from '../map';
import { appendExplorationLog } from '../log';

export const discoverConnectedHandler: ExplorationEffectHandler = (_effect, ctx) => {
  discoverConnectedLocations(ctx.exploration);
  appendExplorationLog(ctx.exploration, 'Nearby chambers become clearer in your mind.', 'action');
  return ctx.exploration;
};
