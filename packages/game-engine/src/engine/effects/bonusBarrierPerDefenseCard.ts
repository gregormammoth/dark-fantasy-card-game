import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusBarrierPerDefenseCardHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  const resolvingId = ctx.battle.resolvingCardInstanceId;
  const defenseCount = ctx.battle.combo.filter(
    (card) =>
      card.definition.type === 'defense' &&
      (resolvingId === null || card.instanceId !== resolvingId),
  ).length;

  ctx.resolution.pendingBarrierBonus += defenseCount * (effect.value ?? 0);
  return ctx.battle;
};
