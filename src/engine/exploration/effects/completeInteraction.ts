import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation } from '../map';

export const completeInteractionHandler: ExplorationEffectHandler = (_effect, ctx) => {
  if (!ctx.interactionId) {
    return ctx.exploration;
  }
  const location = getCurrentLocation(ctx.exploration);
  const interaction = location.interactions.find((item) => item.id === ctx.interactionId);
  if (interaction?.once) {
    interaction.completed = true;
  }
  return ctx.exploration;
};
