import { setup, assign } from 'xstate';
import type { BattleContext, BattleEvent } from '@/types/battle';
import { createInitialBattle, drawAtTurnStart, initBattleLog } from '@/engine/battleSetup';
import {
  addToCombo,
  removeFromCombo,
  beginPlayerResolution,
  resolveNextComboCard,
  finishPlayerResolution,
  checkWinner,
  resolveEnemyTurn,
  startPlayerTurn,
} from '@/engine/combo';
import { expireRoundEffects, logVictory, logDefeat } from '@/engine/poison';

function clearActivePlay(context: BattleContext): BattleContext {
  const next = structuredClone(context);
  next.activePlay = null;
  return next;
}

function incrementTurnCount(context: BattleContext): BattleContext {
  const next = structuredClone(context);
  next.battleStats.turnCount += 1;
  return next;
}

export const battleMachine = setup({
  types: {
    context: {} as BattleContext,
    events: {} as BattleEvent,
  },
  actions: {
    initBattle: assign(() => createInitialBattle()),
    initBattleLog: assign(({ context }) => initBattleLog(context)),
    applyPlayerTurnStart: assign(({ context }) => startPlayerTurn(context)),
    drawTurnCard: assign(({ context }) => drawAtTurnStart(context)),
    addCardToCombo: assign(({ context, event }) => {
      if (event.type !== 'ADD_TO_COMBO') {
        return context;
      }
      return addToCombo(context, event.cardInstanceId);
    }),
    removeCardFromCombo: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_FROM_COMBO') {
        return context;
      }
      return removeFromCombo(context, event.cardInstanceId);
    }),
    beginPlayerResolution: assign(({ context }) => beginPlayerResolution(context)),
    resolveNextComboCard: assign(({ context }) => resolveNextComboCard(context)),
    finishPlayerResolution: assign(({ context }) => finishPlayerResolution(context)),
    resolveEnemyTurn: assign(({ context }) => resolveEnemyTurn(context)),
    clearActivePlay: assign(({ context }) => clearActivePlay(context)),
    expireRound: assign(({ context }) => expireRoundEffects(context)),
    logVictory: assign(({ context }) => logVictory(context)),
    logDefeat: assign(({ context }) => logDefeat(context)),
    incrementTurnCount: assign(({ context }) => incrementTurnCount(context)),
  },
  guards: {
    isVictory: ({ context }) => checkWinner(context) === 'victory',
    isDefeat: ({ context }) => checkWinner(context) === 'defeat',
    hasPlayerCardsToResolve: ({ context }) => context.resolutionQueue.length > 0,
    hasActivePlay: ({ context }) => context.activePlay !== null,
  },
}).createMachine({
  id: 'battle',
  initial: 'idle',
  context: createInitialBattle(),
  states: {
    idle: {
      on: {
        START_BATTLE: {
          target: 'playerTurnStart',
          actions: 'initBattle',
        },
      },
    },
    playerTurnStart: {
      entry: ['initBattleLog', 'applyPlayerTurnStart', 'drawTurnCard'],
      always: [
        { guard: 'isVictory', target: 'victory' },
        { guard: 'isDefeat', target: 'defeat' },
        { target: 'playerTurn' },
      ],
    },
    playerTurn: {
      on: {
        ADD_TO_COMBO: {
          actions: 'addCardToCombo',
        },
        REMOVE_FROM_COMBO: {
          actions: 'removeCardFromCombo',
        },
        END_TURN: {
          target: 'resolvingPlayerCombo',
          actions: 'incrementTurnCount',
        },
      },
    },
    resolvingPlayerCombo: {
      entry: 'beginPlayerResolution',
      always: [
        { guard: 'hasPlayerCardsToResolve', target: 'animatingPlayerCard' },
        { guard: 'isVictory', target: 'victory' },
        { guard: 'isDefeat', target: 'defeat' },
        { target: 'enemyTurn' },
      ],
    },
    animatingPlayerCard: {
      entry: 'resolveNextComboCard',
      on: {
        ANIMATION_COMPLETE: [
          { guard: 'isVictory', target: 'victory', actions: ['clearActivePlay', 'finishPlayerResolution'] },
          { guard: 'isDefeat', target: 'defeat', actions: ['clearActivePlay', 'finishPlayerResolution'] },
          {
            guard: 'hasPlayerCardsToResolve',
            target: 'animatingPlayerCard',
            reenter: true,
          },
          {
            target: 'enemyTurn',
            actions: ['clearActivePlay', 'finishPlayerResolution'],
          },
        ],
      },
    },
    enemyTurn: {
      always: { target: 'animatingEnemyCard' },
    },
    animatingEnemyCard: {
      entry: 'resolveEnemyTurn',
      on: {
        ANIMATION_COMPLETE: [
          { guard: 'isVictory', target: 'victory', actions: 'clearActivePlay' },
          { guard: 'isDefeat', target: 'defeat', actions: 'clearActivePlay' },
          { target: 'endOfRound', actions: 'clearActivePlay' },
        ],
      },
    },
    endOfRound: {
      entry: 'expireRound',
      always: { target: 'playerTurnStart' },
    },
    victory: {
      entry: 'logVictory',
      on: {
        RESTART: {
          target: 'playerTurnStart',
          actions: 'initBattle',
        },
      },
    },
    defeat: {
      entry: 'logDefeat',
      on: {
        RESTART: {
          target: 'playerTurnStart',
          actions: 'initBattle',
        },
      },
    },
  },
});
