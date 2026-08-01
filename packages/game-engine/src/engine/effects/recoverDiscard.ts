import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { appendLog } from '../battleLog';

export const recoverDiscardHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const count = effect.count ?? 1;
  const next = structuredClone(ctx.battle);
  const recovered = next.player.discard.splice(-count);
  next.player.hand.push(...recovered.reverse());
  if (recovered.length > 0) {
    appendLog(
      next,
      `Recovered ${recovered.length} card${recovered.length === 1 ? '' : 's'} from discard.`,
      'heal',
    );
  }
  return next;
};
