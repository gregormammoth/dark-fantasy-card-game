import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { appendLog } from '../battleLog';

export const reduceDamagePercentHandler: EffectHandler = (
  effect: Effect,
  ctx: EffectContext,
) => {
  const next = structuredClone(ctx.battle);
  next.damageReductionPercent = effect.value ?? 0;
  appendLog(
    next,
    `Incoming damage reduced by ${next.damageReductionPercent}% this round.`,
    'shield',
  );
  return next;
};
