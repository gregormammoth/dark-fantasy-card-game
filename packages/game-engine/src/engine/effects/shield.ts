import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { addShield } from '../health';

export const shieldHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const amount = (effect.value ?? 0) + ctx.resolution.pendingShieldBonus;
  ctx.resolution.pendingShieldBonus = 0;
  return addShield(ctx.battle, ctx.source, amount);
};
