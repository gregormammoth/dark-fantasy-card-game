import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { modifyExplorationShield } from '../hand';

export const modifyShieldHandler: ExplorationEffectHandler = (effect, ctx) => {
  return modifyExplorationShield(
    ctx.exploration,
    effect.value ?? 0,
    effect.maxValue ?? 0,
  );
};
