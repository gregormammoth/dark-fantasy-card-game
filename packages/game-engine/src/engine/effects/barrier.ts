import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { addBarrier } from '../health';

export const barrierHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const amount = (effect.value ?? 0) + ctx.resolution.pendingBarrierBonus;
  ctx.resolution.pendingBarrierBonus = 0;
  return addBarrier(ctx.battle, ctx.source, amount);
};
