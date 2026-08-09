import type { ExplorationEffectHandler } from '@dark-fantasy/shared/types/explorationEffect';
import { modifyExplorationMana } from '../hand';

export const modifyManaHandler: ExplorationEffectHandler = (effect, ctx) => {
  return modifyExplorationMana(ctx.exploration, effect.value ?? 0);
};
