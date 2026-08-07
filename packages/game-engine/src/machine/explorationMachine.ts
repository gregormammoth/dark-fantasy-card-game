import { setup, assign } from 'xstate';
import type { ExplorationContext, ExplorationEvent } from '@dark-fantasy/shared/types/exploration';
import {
  beginExplorationTurn,
  clearCardSelection,
  clearLocationSelection,
  createInitialExploration,
  selectCard,
  selectLocation,
} from '../engine/exploration/setup';
import { playExplorationAction, canPlayAction } from '../engine/exploration/actions';
import { dismissEncounter, drawAndResolveEncounter } from '../engine/exploration/encounters';
import {
  advanceDialog,
  fleeLocationBattle,
  queueBattle,
  queueDialog,
  resolveLocationBattle,
} from '../engine/exploration/locationEncounters';
import { syncExplorationLogCounter } from '../engine/exploration/log';
import { cloneRng } from '../engine/rng';

export const explorationMachine = setup({
  types: {
    context: {} as ExplorationContext,
    events: {} as ExplorationEvent,
  },
  actions: {
    initExploration: assign(({ event }) => {
      const seed =
        event.type === 'START_EXPLORATION' || event.type === 'RESTART' ? event.seed : undefined;
      const deckCardIds =
        event.type === 'START_EXPLORATION' || event.type === 'RESTART'
          ? event.deckCardIds
          : undefined;
      return createInitialExploration(seed, deckCardIds);
    }),
    beginTurn: assign(({ context }) => beginExplorationTurn(context)),
    selectLocation: assign(({ context, event }) => {
      if (event.type !== 'SELECT_LOCATION') {
        return context;
      }
      return selectLocation(context, event.locationId);
    }),
    clearSelection: assign(({ context }) => clearLocationSelection(context)),
    selectCard: assign(({ context, event }) => {
      if (event.type !== 'SELECT_CARD') {
        return context;
      }
      return selectCard(context, event.cardInstanceId);
    }),
    clearCard: assign(({ context }) => clearCardSelection(context)),
    playAction: assign(({ context, event }) => {
      if (event.type !== 'PLAY_ACTION') {
        return context;
      }
      const cardInstanceId = context.selectedCardInstanceId;
      if (!cardInstanceId) {
        return context;
      }
      return playExplorationAction(context, cardInstanceId, event.action, {
        targetId: event.targetId,
        interactionId: event.interactionId,
      });
    }),
    resolveEncounter: assign(({ context }) => drawAndResolveEncounter(context)),
    dismissEncounter: assign(({ context }) => dismissEncounter(context)),
    advanceDialog: assign(({ context }) => {
      const next = structuredClone(context);
      return advanceDialog(next);
    }),
    queueDialog: assign(({ context, event }) => {
      if (event.type !== 'QUEUE_DIALOG') {
        return context;
      }
      const next = structuredClone(context);
      return queueDialog(next, event.locationId, event.npcId);
    }),
    queueBattle: assign(({ context, event }) => {
      if (event.type !== 'QUEUE_BATTLE') {
        return context;
      }
      const next = structuredClone(context);
      return queueBattle(next, event.locationId, event.enemyId);
    }),
    fleeLocationBattle: assign(({ context }) => {
      const next = structuredClone(context);
      return fleeLocationBattle(next);
    }),
    resolveLocationBattle: assign(({ context, event }) => {
      if (event.type !== 'RESOLVE_LOCATION_BATTLE') {
        return context;
      }
      const next = structuredClone(context);
      return resolveLocationBattle(next, event.won, event.locationId, event.enemyId);
    }),
    ackEscape: assign(({ context }) => {
      const next = structuredClone(context);
      delete next.flags.escaped_hollowfort;
      return next;
    }),
    syncRng: assign(({ context, event }) => {
      if (event.type !== 'SYNC_RNG') {
        return context;
      }
      const next = structuredClone(context);
      next.rng = cloneRng(event.rng);
      return next;
    }),
    syncPlayerCards: assign(({ context, event }) => {
      if (event.type !== 'SYNC_PLAYER_CARDS') {
        return context;
      }
      const next = structuredClone(context);
      next.hand = structuredClone(event.hand);
      next.deck = structuredClone(event.deck);
      next.discard = structuredClone(event.discard);
      if (typeof event.shield === 'number') {
        next.shield = event.shield;
      }
      if (typeof event.maxShield === 'number') {
        next.maxShield = event.maxShield;
      }
      next.shield = Math.max(0, Math.min(next.maxShield, next.shield));
      const selectedStillInHand = next.hand.some(
        (card) => card.instanceId === next.selectedCardInstanceId,
      );
      if (!selectedStillInHand) {
        next.selectedCardInstanceId = null;
      }
      return next;
    }),
    hydrateExploration: assign(({ event }) => {
      if (event.type !== 'HYDRATE') {
        return createInitialExploration();
      }
      const next = structuredClone(event.context);
      if (typeof next.shield !== 'number') {
        next.shield = 2;
      }
      if (typeof next.maxShield !== 'number') {
        next.maxShield = 2;
      }
      next.shield = Math.max(0, Math.min(next.maxShield, next.shield));
      syncExplorationLogCounter(next.log);
      return next;
    }),
    resetExploration: assign(() => createInitialExploration()),
  },
  guards: {
    hasActionsRemaining: ({ context }) => context.actionsRemaining > 0,
    hasSelectedCard: ({ context }) => context.selectedCardInstanceId !== null,
    canPlayEventAction: ({ context, event }) => {
      if (event.type !== 'PLAY_ACTION') {
        return false;
      }
      if (!context.selectedCardInstanceId) {
        return false;
      }
      return canPlayAction(context, event.action, {
        targetId: event.targetId,
        interactionId: event.interactionId,
        cardInstanceId: context.selectedCardInstanceId,
      });
    },
    hasPendingEncounter: ({ context }) => context.pendingEncounter !== null,
    noActionsRemaining: ({ context }) => context.actionsRemaining <= 0,
    shouldResolveEncounter: ({ context }) => context.turnCount > 1,
    hydrateToEncounter: ({ event }) => event.type === 'HYDRATE' && event.phase === 'encounter',
  },
}).createMachine({
  id: 'exploration',
  initial: 'idle',
  context: createInitialExploration(),
  on: {
    ADVANCE_DIALOG: { actions: 'advanceDialog' },
    QUEUE_DIALOG: { actions: 'queueDialog' },
    QUEUE_BATTLE: { actions: 'queueBattle' },
    FLEE_LOCATION_BATTLE: { actions: 'fleeLocationBattle' },
    RESOLVE_LOCATION_BATTLE: { actions: 'resolveLocationBattle' },
    ACK_ESCAPE: { actions: 'ackEscape' },
    SYNC_RNG: { actions: 'syncRng' },
    SYNC_PLAYER_CARDS: { actions: 'syncPlayerCards' },
    HYDRATE: { actions: 'hydrateExploration' },
    RESET: {
      target: '.idle',
      actions: 'resetExploration',
    },
  },
  states: {
    idle: {
      on: {
        START_EXPLORATION: {
          target: 'playerTurnStart',
          actions: 'initExploration',
        },
        HYDRATE: [
          {
            guard: 'hydrateToEncounter',
            target: 'encounter',
            actions: 'hydrateExploration',
          },
          {
            target: 'playerTurn',
            actions: 'hydrateExploration',
          },
        ],
      },
    },
    playerTurnStart: {
      entry: 'beginTurn',
      always: [
        {
          guard: 'shouldResolveEncounter',
          target: 'resolvingEncounter',
        },
        { target: 'playerTurn' },
      ],
    },
    playerTurn: {
      always: [
        {
          guard: 'noActionsRemaining',
          target: 'playerTurnStart',
        },
      ],
      on: {
        SELECT_LOCATION: { actions: 'selectLocation' },
        CLEAR_SELECTION: { actions: 'clearSelection' },
        SELECT_CARD: { actions: 'selectCard' },
        CLEAR_CARD: { actions: 'clearCard' },
        PLAY_ACTION: {
          guard: 'canPlayEventAction',
          actions: 'playAction',
        },
        END_TURN: { target: 'playerTurnStart' },
        RESTART: {
          target: 'playerTurnStart',
          actions: 'initExploration',
        },
      },
    },
    resolvingEncounter: {
      entry: 'resolveEncounter',
      always: [
        { guard: 'hasPendingEncounter', target: 'encounter' },
        { target: 'playerTurn' },
      ],
    },
    encounter: {
      on: {
        DISMISS_ENCOUNTER: {
          target: 'playerTurn',
          actions: 'dismissEncounter',
        },
      },
    },
  },
});
