import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';

import { getHealth } from '../health';

export const bonusIfLowerHpHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const playerHealth = getHealth(ctx.battle, 'player');
  const threshold = (effect.thresholdPercent ?? 50) / 100;
  if (playerHealth < ctx.battle.playerMaxHealth * threshold) {
    ctx.resolution.pendingDamageBonus += effect.damage ?? 0;
  }
  return ctx.battle;
};
