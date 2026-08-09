import type { CardInstance } from '@dark-fantasy/shared/types/card';
import type {
  ExplorationCardPile,
  ExplorationContext,
} from '@dark-fantasy/shared/types/exploration';
import { createCardInstance, drawCards, shuffle } from '../deck';
import { nextInt } from '../rng';
import { getPlayerCardById } from '../progression/loadout';
import { appendExplorationLog } from './log';

function reshuffleIfNeeded(context: ExplorationContext): void {
  if (context.deck.length > 0 || context.discard.length === 0) {
    return;
  }
  context.deck = shuffle(context.discard, context.rng);
  context.discard = [];
  appendExplorationLog(context, 'You reshuffle your discard into your deck.', 'system');
}

export function syncActionsToHand(context: ExplorationContext): void {
  context.actionsRemaining = context.hand.length;
  context.maxActions = Math.max(context.handSize, context.hand.length);
}

export function drawUntilHandSize(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  const needed = Math.max(0, next.handSize - next.hand.length);
  if (needed === 0) {
    syncActionsToHand(next);
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
  syncActionsToHand(next);
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
  next.selectedCardInstanceId = null;
  syncActionsToHand(next);
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
  syncActionsToHand(next);
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
  const removed: CardInstance[] = [];
  const toRemove = Math.min(count, next.hand.length);
  for (let i = 0; i < toRemove; i += 1) {
    const index = nextInt(next.rng, next.hand.length);
    const [card] = next.hand.splice(index, 1);
    if (card) {
      removed.push(card);
    }
  }
  next.discard.push(...removed);
  if (
    next.selectedCardInstanceId &&
    !next.hand.some((card) => card.instanceId === next.selectedCardInstanceId)
  ) {
    next.selectedCardInstanceId = null;
  }
  appendExplorationLog(
    next,
    `Discarded ${removed.length} card${removed.length === 1 ? '' : 's'} from hand.`,
    'danger',
  );
  syncActionsToHand(next);
  return next;
}

export function shufflePlayerCards(
  context: ExplorationContext,
  pile: ExplorationCardPile = 'hand',
): ExplorationContext {
  const next = structuredClone(context);
  if (pile === 'hand') {
    next.hand = shuffle(next.hand, next.rng);
    appendExplorationLog(next, 'Your hand is scrambled.', 'danger');
    syncActionsToHand(next);
    return next;
  }
  if (pile === 'deck') {
    next.deck = shuffle(next.deck, next.rng);
    appendExplorationLog(next, 'Your deck is reshuffled.', 'danger');
    return next;
  }
  if (pile === 'discard') {
    next.discard = shuffle(next.discard, next.rng);
    appendExplorationLog(next, 'Your discard pile is stirred.', 'danger');
    return next;
  }

  const combined = shuffle([...next.hand, ...next.deck, ...next.discard], next.rng);
  const handSize = Math.min(next.handSize, combined.length);
  next.hand = combined.slice(0, handSize);
  next.deck = combined.slice(handSize);
  next.discard = [];
  next.selectedCardInstanceId = null;
  appendExplorationLog(next, 'Chaos scatters your cards — piles are reshuffled.', 'danger');
  syncActionsToHand(next);
  return next;
}

export function addCardsToPile(
  context: ExplorationContext,
  cardIds: string[],
  pile: Exclude<ExplorationCardPile, 'all'> = 'deck',
): ExplorationContext {
  if (cardIds.length === 0) {
    return context;
  }
  const next = structuredClone(context);
  const created: CardInstance[] = [];
  for (const id of cardIds) {
    const definition = getPlayerCardById(id);
    if (!definition) {
      continue;
    }
    created.push(createCardInstance(definition));
  }
  if (created.length === 0) {
    return context;
  }
  if (pile === 'hand') {
    next.hand.push(...created);
  } else if (pile === 'discard') {
    next.discard.push(...created);
  } else {
    next.deck.push(...created);
    next.deck = shuffle(next.deck, next.rng);
  }
  appendExplorationLog(
    next,
    `${created.length} card${created.length === 1 ? '' : 's'} enter your ${pile}.`,
    pile === 'hand' || pile === 'deck' ? 'loot' : 'system',
  );
  if (pile === 'hand') {
    syncActionsToHand(next);
  }
  return next;
}

export function modifyExplorationShield(
  context: ExplorationContext,
  delta = 0,
): ExplorationContext {
  if (delta === 0) {
    return context;
  }
  const next = structuredClone(context);
  next.shield = Math.max(0, Math.min(next.maxShield, next.shield + delta));
  appendExplorationLog(
    next,
    delta > 0
      ? `You brace — shield ${next.shield}/${next.maxShield}.`
      : `Your guard slips — shield ${next.shield}/${next.maxShield}.`,
    delta > 0 ? 'loot' : 'danger',
  );
  return next;
}

export function modifyExplorationMana(
  context: ExplorationContext,
  delta = 0,
): ExplorationContext {
  if (delta === 0) {
    return context;
  }
  const next = structuredClone(context);
  next.mana = Math.max(0, Math.min(next.maxMana, next.mana + delta));
  appendExplorationLog(
    next,
    delta > 0
      ? `Mana gathers — ${next.mana}/${next.maxMana}.`
      : `Your focus frays — mana ${next.mana}/${next.maxMana}.`,
    delta > 0 ? 'loot' : 'danger',
  );
  return next;
}
