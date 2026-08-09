import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog } from '../battleLog';

export const gainManaHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  if (ctx.source !== 'player') {
    return ctx.battle;
  }
  const amount = Math.max(0, effect.value ?? 0);
  if (amount <= 0) {
    return ctx.battle;
  }
  const next = structuredClone(ctx.battle);
  const before = next.playerMana;
  next.playerMana = Math.min(next.playerMaxMana, next.playerMana + amount);
  const gained = next.playerMana - before;
  if (gained > 0) {
    appendLog(next, `Gained ${gained} mana (${next.playerMana}/${next.playerMaxMana}).`, 'system');
  }
  return next;
};
