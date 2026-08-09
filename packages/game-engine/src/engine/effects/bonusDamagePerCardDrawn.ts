import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusDamagePerCardDrawnHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  const per = effect.value ?? 0;
  ctx.resolution.pendingDamageBonus += per * ctx.battle.playerCardsDrawnThisBattle;
  return ctx.battle;
};
