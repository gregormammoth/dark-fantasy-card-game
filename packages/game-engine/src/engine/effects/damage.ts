import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { dealDamage } from '../health';

export const damageHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const amount = (effect.value ?? 0) + ctx.resolution.pendingDamageBonus;
  ctx.resolution.pendingDamageBonus = 0;
  return dealDamage(ctx.battle, ctx.target, amount, ctx.resolution.ignoreShield);
};
