import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';

export const bonusIfFirstAttackHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const attacksPlayed =
    ctx.battle.comboStartAttackCardsPlayed ?? ctx.battle.combatStats.attackCardsPlayed;
  if (attacksPlayed === 0) {
    ctx.resolution.pendingDamageBonus += effect.damage ?? 0;
  }
  return ctx.battle;
};
