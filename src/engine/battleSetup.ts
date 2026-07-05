import playerCardsData from '@/data/playerCards.json';
import enemyCardsData from '@/data/enemyCards.json';
import battleData from '@/data/battle.json';
import type { CardDefinition } from '@/types/card';
import type { BattleContext } from '@/types/battle';
import { createCardInstance, resetInstanceCounter, shuffle, drawCards } from './deck';
import { resetLogCounter, appendLog } from './battleLog';
import { PLAYER_PORTRAIT, pickRandomEnemyPortrait } from '@/data/portraits';

const cardRegistry = new Map<string, CardDefinition>();

for (const card of playerCardsData) {
  cardRegistry.set(card.id, card as CardDefinition);
}

for (const card of enemyCardsData) {
  cardRegistry.set(card.id, card as CardDefinition);
}

function resolveDeckIds(
  source: string[] | 'all',
  pool: CardDefinition[],
): string[] {
  if (source === 'all') {
    return pool.map((card) => card.id);
  }
  return source;
}

function buildDeck(cardIds: string[]): ReturnType<typeof createCardInstance>[] {
  return cardIds.map((id) => {
    const definition = cardRegistry.get(id);
    if (!definition) {
      throw new Error(`Unknown card id: ${id}`);
    }
    return createCardInstance(definition);
  });
}

export function createInitialBattle(): BattleContext {
  resetInstanceCounter();
  resetLogCounter();

  const playerDeck = shuffle(
    buildDeck(
      resolveDeckIds(
        battleData.player.deck as string[] | 'all',
        playerCardsData as CardDefinition[],
      ),
    ),
  );
  const enemyDeck = shuffle(
    buildDeck(
      resolveDeckIds(
        battleData.enemy.deck as string[] | 'all',
        enemyCardsData as CardDefinition[],
      ),
    ),
  );

  const playerMaxShield = battleData.player.maxShield ?? 2;
  const enemyMaxShield = battleData.enemy.maxShield ?? 2;

  return {
    player: {
      portrait: PLAYER_PORTRAIT,
      shield: Math.min(battleData.player.startingShield, playerMaxShield),
      maxShield: playerMaxShield,
      barrier: 0,
      deck: playerDeck,
      hand: [],
      discard: [],
    },
    enemy: {
      name: battleData.enemy.name,
      portrait: pickRandomEnemyPortrait(),
      shield: Math.min(battleData.enemy.startingShield, enemyMaxShield),
      maxShield: enemyMaxShield,
      deck: enemyDeck,
      discard: [],
    },
    combo: [],
    playerMaxHealth: playerDeck.length,
    enemyMaxHealth: enemyDeck.length,
    combatStats: {
      attackCardsPlayed: 0,
      defenseCardsPlayed: 0,
    },
    playerPoison: null,
    enemyPoison: null,
    damageReductionPercent: 0,
    resolvingCardInstanceId: null,
    resolutionQueue: [],
    activePlay: null,
    lastDamageResult: null,
    isFirstPlayerTurn: true,
    log: [],
  };
}

function drawPlayerCards(battle: BattleContext, count: number): BattleContext {
  const next = structuredClone(battle);
  const { deck, discard, drawn } = drawCards(
    next.player.deck,
    next.player.discard,
    count,
  );
  next.player.deck = deck;
  next.player.discard = discard;
  next.player.hand.push(...drawn);
  if (drawn.length > 0) {
    appendLog(
      next,
      `Drew ${drawn.length} card${drawn.length === 1 ? '' : 's'}${drawn.length <= 3 ? `: ${drawn.map((c) => c.definition.name).join(', ')}` : ''}.`,
      'draw',
    );
  }
  return next;
}

export function initBattleLog(battle: BattleContext): BattleContext {
  if (battle.log.length > 0) {
    return battle;
  }
  const next = structuredClone(battle);
  appendLog(next, `Battle begins against ${next.enemy.name}.`, 'system');
  return next;
}

export function drawAtTurnStart(battle: BattleContext): BattleContext {
  const startingHandSize = battleData.player.startingHandSize ?? 4;
  const count = battle.isFirstPlayerTurn ? startingHandSize : 1;
  const next = drawPlayerCards(battle, count);
  next.isFirstPlayerTurn = false;
  return next;
}

export function drawTurnCard(battle: BattleContext): BattleContext {
  return drawPlayerCards(battle, 1);
}

export function getCardDefinition(id: string): CardDefinition | undefined {
  return cardRegistry.get(id);
}

export { battleData };
