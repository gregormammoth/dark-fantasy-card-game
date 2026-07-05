import { setup, assign } from 'xstate';
import type { BattleContext, BattleEvent } from '@/types/battle';
import { createInitialBattle, drawAtTurnStart, initBattleLog } from '@/engine/battleSetup';
import {
  addToCombo,
  removeFromCombo,
  resolveCombo,
  checkWinner,
  playRandomEnemyCard,
  startPlayerTurn,
} from '@/engine/combo';
import { expireRoundEffects, logVictory, logDefeat } from '@/engine/poison';

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
    resolvePlayerCombo: assign(({ context }) => resolveCombo(context)),
    resolveEnemyCard: assign(({ context }) => playRandomEnemyCard(context)),
    expireRound: assign(({ context }) => expireRoundEffects(context)),
    logVictory: assign(({ context }) => logVictory(context)),
    logDefeat: assign(({ context }) => logDefeat(context)),
  },
  guards: {
    isVictory: ({ context }) => checkWinner(context) === 'victory',
    isDefeat: ({ context }) => checkWinner(context) === 'defeat',
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
        },
      },
    },
    resolvingPlayerCombo: {
      entry: 'resolvePlayerCombo',
      always: [
        { guard: 'isVictory', target: 'victory' },
        { guard: 'isDefeat', target: 'defeat' },
        { target: 'enemyTurn' },
      ],
    },
    enemyTurn: {
      always: { target: 'resolvingEnemyCard' },
    },
    resolvingEnemyCard: {
      entry: 'resolveEnemyCard',
      always: [
        { guard: 'isVictory', target: 'victory' },
        { guard: 'isDefeat', target: 'defeat' },
        { target: 'endOfRound' },
      ],
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
