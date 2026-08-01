import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { addBarrier } from '../health';

export const barrierHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const amount = (effect.value ?? 0) + ctx.resolution.pendingBarrierBonus;
  ctx.resolution.pendingBarrierBonus = 0;
  return addBarrier(ctx.battle, ctx.source, amount);
};
