import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog } from '../battleLog';

export const bonusBarrierPerManaHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  if (ctx.source !== 'player') {
    return ctx.battle;
  }
  const mana = ctx.battle.playerMana;
  if (mana <= 0) {
    return ctx.battle;
  }
  const perMana = effect.value ?? 0;
  ctx.resolution.pendingBarrierBonus += mana * perMana;
  const next = structuredClone(ctx.battle);
  next.playerMana = 0;
  appendLog(
    next,
    `Spent ${mana} mana (+${mana * perMana} barrier).`,
    'system',
  );
  return next;
};
