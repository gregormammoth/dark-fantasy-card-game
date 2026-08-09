import type { Effect } from '@dark-fantasy/shared/types/card';
import type { EffectContext, EffectHandler } from '@dark-fantasy/shared/types/effect';
import { drawCards } from '../deck';
import { appendLog } from '../battleLog';

export const drawHandler: EffectHandler = (effect: Effect, ctx: EffectContext) => {
  const count = effect.count ?? 1;
  const next = structuredClone(ctx.battle);
  const { deck, discard, drawn } = drawCards(
    next.player.deck,
    next.player.discard,
    count,
  );
  next.player.deck = deck;
  next.player.discard = discard;
  next.player.hand.push(...drawn);
  next.playerCardsDrawnThisBattle += drawn.length;
  next.lastPlayerDrawCount = drawn.length;
  if (drawn.length > 0) {
    appendLog(
      next,
      `Drew ${drawn.length} card${drawn.length === 1 ? '' : 's'}${
        drawn.length <= 3 ? `: ${drawn.map((card) => card.definition.name).join(', ')}` : ''
      }.`,
      'draw',
    );
  }
  return next;
};
