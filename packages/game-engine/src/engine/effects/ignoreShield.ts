import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const ignoreShieldHandler: EffectHandler = (_effect, ctx: EffectContext) => {
  ctx.resolution.ignoreShield = true;
  return ctx.battle;
};
