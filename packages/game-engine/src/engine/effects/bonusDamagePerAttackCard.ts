import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusDamagePerAttackCardHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  const resolvingId = ctx.battle.resolvingCardInstanceId;
  const attackCount = ctx.battle.combo.filter(
    (card) =>
      card.definition.type === 'attack' &&
      (resolvingId === null || card.instanceId !== resolvingId),
  ).length;

  ctx.resolution.pendingDamageBonus += attackCount * (effect.value ?? 0);
  return ctx.battle;
};
