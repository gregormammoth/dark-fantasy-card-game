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

export const explorationMachine = setup({
  types: {
    context: {} as ExplorationContext,
    events: {} as ExplorationEvent,
  },
  actions: {
    initExploration: assign(() => createInitialExploration()),
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
  },
  states: {
    idle: {
      on: {
        START_EXPLORATION: {
          target: 'playerTurnStart',
          actions: 'initExploration',
        },
      },
    },
    playerTurnStart: {
      entry: 'beginTurn',
      always: { target: 'playerTurn' },
    },
    playerTurn: {
      always: [
        {
          guard: 'noActionsRemaining',
          target: 'resolvingEncounter',
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
        END_TURN: { target: 'resolvingEncounter' },
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
        { target: 'playerTurnStart' },
      ],
    },
    encounter: {
      on: {
        DISMISS_ENCOUNTER: {
          target: 'playerTurnStart',
          actions: 'dismissEncounter',
        },
      },
    },
  },
});
