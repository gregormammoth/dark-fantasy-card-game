import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { addShield } from '../health';

export const shieldHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const amount = (effect.value ?? 0) + ctx.resolution.pendingShieldBonus;
  ctx.resolution.pendingShieldBonus = 0;
  const recipient = ctx.source;
  const next = addShield(ctx.battle, recipient, amount);

  if (ctx.resolution.temporaryShield) {
    next.temporaryShieldAmount += amount;
  }

  return next;
};
