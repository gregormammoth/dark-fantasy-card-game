import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog } from '../battleLog';

export const markEnemyHandler: EffectHandler = (_effect, ctx: EffectContext) => {
  const next = structuredClone(ctx.battle);
  next.enemyMarked = true;
  appendLog(next, `Marked ${next.enemy.name}.`, 'system');
  return next;
};
