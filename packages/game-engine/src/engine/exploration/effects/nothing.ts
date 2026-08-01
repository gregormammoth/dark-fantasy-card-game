import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';

export const nothingHandler: ExplorationEffectHandler = (_effect, ctx) => ctx.exploration;
