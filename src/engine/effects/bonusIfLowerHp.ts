import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';

import { getHealth } from '../health';

export const bonusIfLowerHpHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const playerHealth = getHealth(ctx.battle, 'player');
  const enemyHealth = getHealth(ctx.battle, 'enemy');
  if (playerHealth < enemyHealth) {
    ctx.resolution.pendingDamageBonus += effect.damage ?? 0;
  }
  return ctx.battle;
};
