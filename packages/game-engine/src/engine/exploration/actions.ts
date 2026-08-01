import actionOutcomesData from '@/data/actionOutcomes.json';
import type { CardClass, CardInstance } from '@/types/card';
import type {
  ActionOutcomeTable,
  ExplorationActionType,
  ExplorationContext,
} from '@/types/exploration';
import { consumeCard } from './hand';
import { appendExplorationLog } from './log';
import {
  canMoveTo,
  getCurrentLocation,
  isInteractionAvailable,
} from './map';
import { resolveExplorationEffects } from './resolveEffects';

const actionOutcomes = actionOutcomesData as ActionOutcomeTable;

function getOutcome(action: ExplorationActionType, cardClass: CardClass | undefined) {
  const table = actionOutcomes[action];
  if (!table) {
    return {
      message: 'Nothing happens.',
      effects: [{ type: 'nothing' as const }],
    };
  }
  if (cardClass && table[cardClass]) {
    return table[cardClass]!;
  }
  return table.default ?? { message: 'Nothing happens.', effects: [{ type: 'nothing' as const }] };
}

export function canPlayAction(
  context: ExplorationContext,
  action: ExplorationActionType,
  options: { targetId?: string; interactionId?: string; cardInstanceId?: string } = {},
): boolean {
  if (context.actionsRemaining <= 0) {
    return false;
  }
  if (!options.cardInstanceId && !context.selectedCardInstanceId) {
    return false;
  }
  const cardId = options.cardInstanceId ?? context.selectedCardInstanceId;
  if (!cardId || !context.hand.some((card) => card.instanceId === cardId)) {
    return false;
  }

  if (action === 'MOVE') {
    return !!options.targetId && canMoveTo(context, options.targetId);
  }

  if (options.interactionId) {
    return isInteractionAvailable(context, options.interactionId);
  }

  const location = getCurrentLocation(context);
  return location.interactions.some(
    (item) => item.action === action && isInteractionAvailable(context, item.id),
  );
}

export function playExplorationAction(
  context: ExplorationContext,
  cardInstanceId: string,
  action: ExplorationActionType,
  options: { targetId?: string; interactionId?: string } = {},
): ExplorationContext {
  if (!canPlayAction(context, action, { ...options, cardInstanceId })) {
    return context;
  }

  const consumed = consumeCard(context, cardInstanceId);
  if (!consumed) {
    return context;
  }

  let next = consumed.context;
  const card = consumed.card;
  const cardClass = card.definition.class;
  const location = getCurrentLocation(next);

  let interactionId = options.interactionId;
  let actionTargetId = options.targetId;

  if (!interactionId && action !== 'MOVE') {
    const interaction = location.interactions.find(
      (item) => item.action === action && isInteractionAvailable(next, item.id),
    );
    interactionId = interaction?.id;
    actionTargetId = actionTargetId ?? interaction?.targetId;
  }

  if (interactionId) {
    const interaction = location.interactions.find((item) => item.id === interactionId);
    actionTargetId = actionTargetId ?? interaction?.targetId;
  }

  const outcome = getOutcome(action, cardClass);
  appendExplorationLog(
    next,
    `Played ${card.definition.name} → ${action}. ${outcome.message}`,
    'action',
  );
  next.lastActionMessage = outcome.message;

  next = resolveExplorationEffects(next, outcome.effects, {
    cardClass,
    actionTargetId: action === 'MOVE' ? options.targetId : actionTargetId,
    interactionId,
  });

  if (next.actionsRemaining === 0) {
    appendExplorationLog(next, 'No actions remain this turn.', 'system');
  }

  return next;
}

export function describeCardForAction(card: CardInstance, action: ExplorationActionType): string {
  const outcome = getOutcome(action, card.definition.class);
  return outcome.message;
}
