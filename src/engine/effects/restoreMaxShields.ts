import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { addShield } from '../health';

export const restoreMaxShieldsHandler: EffectHandler = (
  _effect: Effect,
  ctx: EffectContext,
) => {
  const combatant = ctx.source === 'player' ? ctx.battle.player : ctx.battle.enemy;
  if (combatant.shield > 0) {
    return ctx.battle;
  }
  return addShield(ctx.battle, ctx.source, combatant.maxShield);
};
