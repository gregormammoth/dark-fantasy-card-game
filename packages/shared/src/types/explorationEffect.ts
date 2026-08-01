import type { ExplorationContext, ExplorationEffect } from './exploration';
import type { CardClass } from './card';

export interface ExplorationEffectContext {
  exploration: ExplorationContext;
  cardClass: CardClass | undefined;
  actionTargetId?: string;
  interactionId?: string;
}

export type ExplorationEffectHandler = (
  effect: ExplorationEffect,
  ctx: ExplorationEffectContext,
) => ExplorationContext;
