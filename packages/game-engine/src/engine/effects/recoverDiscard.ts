import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog, targetLabel } from '../battleLog';

export const recoverDiscardHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const count = effect.count ?? 1;
  const next = structuredClone(ctx.battle);
  const combatant = ctx.source === 'player' ? next.player : next.enemy;
  const recovered = combatant.discard.splice(-count);
  if (ctx.source === 'player') {
    next.player.hand.push(...recovered.reverse());
  } else {
    next.enemy.deck.push(...recovered.reverse());
  }
  if (recovered.length > 0) {
    appendLog(
      next,
      `${targetLabel(next, ctx.source)} recovered ${recovered.length} card${
        recovered.length === 1 ? '' : 's'
      } from discard.`,
      'heal',
    );
  }
  return next;
};
