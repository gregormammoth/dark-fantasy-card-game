import type { ExplorationEffectHandler } from '@/types/explorationEffect';

export const nothingHandler: ExplorationEffectHandler = (_effect, ctx) => ctx.exploration;
