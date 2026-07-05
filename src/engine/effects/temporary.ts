import type { EffectContext, EffectHandler } from '@/types/effect';

export const temporaryHandler: EffectHandler = (_effect, ctx: EffectContext) => {
  ctx.resolution.temporaryShield = true;
  return ctx.battle;
};
