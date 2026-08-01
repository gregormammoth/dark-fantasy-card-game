import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusIfFirstAttackHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  if (ctx.battle.combatStats.attackCardsPlayed === 0) {
    ctx.resolution.pendingDamageBonus += effect.damage ?? 0;
  }
  return ctx.battle;
};
