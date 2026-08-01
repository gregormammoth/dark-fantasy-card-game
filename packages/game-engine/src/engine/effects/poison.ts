import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog, targetLabel } from '../battleLog';

export const poisonHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const next = structuredClone(ctx.battle);
  const poisonKey = ctx.target === 'player' ? 'playerPoison' : 'enemyPoison';
  const damagePerTurn = effect.damagePerTurn ?? 1;
  const duration = effect.duration ?? 1;
  next[poisonKey] = {
    damagePerTurn,
    remainingTurns: duration,
  };
  appendLog(
    next,
    `Poison applied to ${targetLabel(next, ctx.target)} (${damagePerTurn}/turn for ${duration} turns).`,
    'poison',
  );
  return next;
};
