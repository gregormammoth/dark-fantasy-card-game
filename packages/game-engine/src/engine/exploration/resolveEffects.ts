import type { ExplorationContext, ExplorationEffect } from '@/types/exploration';
import type { CardClass } from '@/types/card';
import type { ExplorationEffectContext } from '@/types/explorationEffect';
import { explorationEffectHandlers } from './effects/registry';

export function resolveExplorationEffects(
  context: ExplorationContext,
  effects: ExplorationEffect[],
  options: {
    cardClass?: CardClass;
    actionTargetId?: string;
    interactionId?: string;
  } = {},
): ExplorationContext {
  let next = context;
  const ctx: ExplorationEffectContext = {
    exploration: next,
    cardClass: options.cardClass,
    actionTargetId: options.actionTargetId,
    interactionId: options.interactionId,
  };

  for (const effect of effects) {
    const handler = explorationEffectHandlers[effect.type];
    if (!handler) {
      console.warn(`No exploration handler for effect type: ${effect.type}`);
      continue;
    }
    ctx.exploration = next;
    next = handler(effect, ctx);
  }

  return next;
}
