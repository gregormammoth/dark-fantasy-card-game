import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusShieldPerDefenseCardHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  ctx.resolution.pendingShieldBonus +=
    ctx.battle.combatStats.defenseCardsPlayed * (effect.value ?? 0);
  return ctx.battle;
};
