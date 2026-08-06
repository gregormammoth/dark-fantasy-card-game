import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import type { PlayerBattlePiles } from '@dark-fantasy/shared/types/battle';
import type { RngState } from '@dark-fantasy/shared/types/rng';
import { createCardInstance, shuffle } from './deck';

function takeMatching(
  cards: CardInstance[],
  needed: Map<string, number>,
): CardInstance[] {
  const kept: CardInstance[] = [];
  for (const card of cards) {
    const remaining = needed.get(card.definition.id) ?? 0;
    if (remaining > 0) {
      kept.push(card);
      needed.set(card.definition.id, remaining - 1);
    }
  }
  return kept;
}

export function reconcilePlayerCardPiles(
  piles: PlayerBattlePiles,
  deckCardIds: string[],
  resolveDefinition: (id: string) => CardDefinition | undefined,
  rng: RngState,
): PlayerBattlePiles {
  const needed = new Map<string, number>();
  for (const id of deckCardIds) {
    needed.set(id, (needed.get(id) ?? 0) + 1);
  }

  const hand = takeMatching(piles.hand, needed);
  const discard = takeMatching(piles.discard, needed);
  const deckKept = takeMatching(piles.deck, needed);

  const missingIds: string[] = [];
  for (const [id, remaining] of needed) {
    for (let i = 0; i < remaining; i += 1) {
      missingIds.push(id);
    }
  }

  const created = missingIds
    .map((id) => resolveDefinition(id))
    .filter((definition): definition is CardDefinition => Boolean(definition))
    .map((definition) => createCardInstance(definition));

  return {
    hand,
    discard,
    deck: shuffle([...deckKept, ...created], rng),
  };
}
