import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const ignoreShieldIfMarkedHandler: EffectHandler = (_effect, ctx: EffectContext) => {
  if (ctx.battle.enemyMarked) {
    ctx.resolution.ignoreShield = true;
  }
  return ctx.battle;
};
