import type { CardInstance } from '@/types/card';
import type { ExplorationContext } from '@/types/exploration';
import { drawCards, shuffle } from '@/engine/deck';
import { appendExplorationLog } from './log';

function reshuffleIfNeeded(context: ExplorationContext): void {
  if (context.deck.length > 0 || context.discard.length === 0) {
    return;
  }
  context.deck = shuffle(context.discard);
  context.discard = [];
  appendExplorationLog(context, 'You reshuffle your discard into your deck.', 'system');
}

export function drawUntilHandSize(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  const needed = Math.max(0, next.handSize - next.hand.length);
  if (needed === 0) {
    return next;
  }

  const drawn: CardInstance[] = [];
  let remaining = needed;
  while (remaining > 0) {
    reshuffleIfNeeded(next);
    if (next.deck.length === 0) {
      break;
    }
    const result = drawCards(next.deck, next.discard, remaining);
    next.deck = result.deck;
    next.discard = result.discard;
    drawn.push(...result.drawn);
    remaining = needed - drawn.length;
    if (result.drawn.length === 0) {
      break;
    }
  }

  next.hand.push(...drawn);
  if (drawn.length > 0) {
    appendExplorationLog(
      next,
      `Drew ${drawn.length} card${drawn.length === 1 ? '' : 's'} (hand ${next.hand.length}/${next.handSize}).`,
      'system',
    );
  }
  return next;
}

export function consumeCard(
  context: ExplorationContext,
  cardInstanceId: string,
): { context: ExplorationContext; card: CardInstance } | null {
  const index = context.hand.findIndex((card) => card.instanceId === cardInstanceId);
  if (index === -1) {
    return null;
  }
  const next = structuredClone(context);
  const [card] = next.hand.splice(index, 1);
  next.discard.push(card);
  next.actionsRemaining = Math.max(0, next.actionsRemaining - 1);
  next.selectedCardInstanceId = null;
  return { context: next, card };
}

export function recoverFromDiscard(
  context: ExplorationContext,
  count: number,
): ExplorationContext {
  if (count <= 0 || context.discard.length === 0) {
    return context;
  }
  const next = structuredClone(context);
  const recovered: CardInstance[] = [];
  for (let i = 0; i < count && next.discard.length > 0; i += 1) {
    const card = next.discard.pop();
    if (card) {
      recovered.push(card);
      next.hand.push(card);
    }
  }
  if (recovered.length > 0) {
    appendExplorationLog(
      next,
      `Recovered ${recovered.length} card${recovered.length === 1 ? '' : 's'} from discard.`,
      'loot',
    );
  }
  return next;
}

export function discardFromHand(
  context: ExplorationContext,
  count: number,
): ExplorationContext {
  if (count <= 0 || context.hand.length === 0) {
    return context;
  }
  const next = structuredClone(context);
  const removed = next.hand.splice(0, Math.min(count, next.hand.length));
  next.discard.push(...removed);
  appendExplorationLog(
    next,
    `Discarded ${removed.length} card${removed.length === 1 ? '' : 's'} from hand.`,
    'danger',
  );
  return next;
}
