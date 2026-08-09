import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusIfMarkedHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  if (ctx.battle.enemyMarked) {
    ctx.resolution.pendingDamageBonus += effect.damage ?? 0;
  }
  return ctx.battle;
};
