import type { Effect } from '@/types/card';
import type { EffectContext, EffectHandler } from '@/types/effect';
import { drawCards } from '../deck';

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
  return next;
};
