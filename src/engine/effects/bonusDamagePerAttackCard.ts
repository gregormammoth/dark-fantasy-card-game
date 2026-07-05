import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';

export const bonusDamagePerAttackCardHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  ctx.resolution.pendingDamageBonus +=
    ctx.battle.combatStats.attackCardsPlayed * (effect.value ?? 0);
  return ctx.battle;
};
