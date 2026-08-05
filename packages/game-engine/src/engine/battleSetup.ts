import playerCardsData from '@dark-fantasy/content/playerCards.json';
import improvedCardsData from '@dark-fantasy/content/improvedCards.json';
import enemyCardsData from '@dark-fantasy/content/enemyCards.json';
import battleData from '@dark-fantasy/content/battle.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import type { BattleContext, BattleEnemyOverride } from '@dark-fantasy/shared/types/battle';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import type { PlayerGender } from '@dark-fantasy/shared/types/player';
import type { RngState } from '@dark-fantasy/shared/types/rng';
import { createCardInstance, resetInstanceCounter, shuffle, drawCards } from './deck';
import { resetLogCounter, appendLog } from './battleLog';
import { DEFAULT_ENEMY_PORTRAIT } from '@dark-fantasy/content/portraits';
import { createInitialProgression } from './progression/xp';
import { createInitialLoadout, getPlayerPortraitForDeck } from './progression/loadout';
import { cloneRng, createRng } from './rng';

const cardRegistry = new Map<string, CardDefinition>();

for (const card of playerCardsData) {
  cardRegistry.set(card.id, { ...(card as CardDefinition), improved: false });
}

for (const card of improvedCardsData) {
  cardRegistry.set(card.id, { ...(card as CardDefinition), improved: true });
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

function buildEnemyDeckIds(deckSize?: number): string[] {
  const base = resolveDeckIds(
    battleData.enemy.deck as string[] | 'all',
    enemyCardsData as CardDefinition[],
  );
  if (!deckSize || deckSize <= base.length) {
    return deckSize ? base.slice(0, deckSize) : base;
  }
  const ids: string[] = [];
  while (ids.length < deckSize) {
    ids.push(...base);
  }
  return ids.slice(0, deckSize);
}

export function createInitialBattle(
  progression: PlayerProgression = createInitialProgression(),
  enemyOverride?: BattleEnemyOverride,
  rngState?: RngState,
  playerDeckIds?: string[],
  playerGender?: PlayerGender,
): BattleContext {
  resetInstanceCounter();
  resetLogCounter();

  const rng = rngState ? cloneRng(rngState) : createRng();
  const deckIds =
    playerDeckIds && playerDeckIds.length > 0
      ? playerDeckIds
      : createInitialLoadout().deckCardIds;
  const playerDeck = shuffle(buildDeck(deckIds), rng);
  const enemyDeck = shuffle(buildDeck(buildEnemyDeckIds(enemyOverride?.deckSize)), rng);

  const playerMaxShield = battleData.player.maxShield ?? 2;
  const enemyMaxShield = battleData.enemy.maxShield ?? 2;

  return {
    player: {
      portrait: getPlayerPortraitForDeck(deckIds, playerGender),
      shield: Math.min(battleData.player.startingShield, playerMaxShield),
      maxShield: playerMaxShield,
      barrier: 0,
      deck: playerDeck,
      hand: [],
      discard: [],
    },
    enemy: {
      name: enemyOverride?.name ?? battleData.enemy.name,
      portrait: enemyOverride?.portrait ?? DEFAULT_ENEMY_PORTRAIT,
      shield: Math.min(battleData.enemy.startingShield, enemyMaxShield),
      maxShield: enemyMaxShield,
      barrier: 0,
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
    battleStats: {
      turnCount: 0,
      cardsBurnedToEnemy: 0,
      cardsLostByPlayer: 0,
    },
    playerPoison: null,
    enemyPoison: null,
    damageReductionPercent: 0,
    enemyBarrierPerTurn: enemyOverride?.barrierPerTurn ?? 0,
    resolvingCardInstanceId: null,
    resolutionQueue: [],
    activePlay: null,
    lastDamageResult: null,
    isFirstPlayerTurn: true,
    lastPlayerDrawCount: 0,
    log: [],
    progression: structuredClone(progression),
    progressionAtBattleStart: structuredClone(progression),
    rng,
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
  next.lastPlayerDrawCount = drawn.length;
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
