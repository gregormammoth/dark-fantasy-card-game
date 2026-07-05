import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';

export const bonusBarrierPerDefenseCardHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  ctx.resolution.pendingBarrierBonus +=
    ctx.battle.combatStats.defenseCardsPlayed * (effect.value ?? 0);
  return ctx.battle;
};
