import playerCardsData from '@dark-fantasy/content/playerCards.json';
import improvedCardsData from '@dark-fantasy/content/improvedCards.json';
import enemyCardsData from '@dark-fantasy/content/enemyCards.json';
import battleData from '@dark-fantasy/content/battle.json';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import type {
  BattleContext,
  BattleEnemyOverride,
  PlayerBattlePiles,
} from '@dark-fantasy/shared/types/battle';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import type { PlayerGender } from '@dark-fantasy/shared/types/player';
import type { RngState } from '@dark-fantasy/shared/types/rng';
import {
  createCardInstance,
  resetInstanceCounter,
  shuffle,
  drawCards,
  syncInstanceCounterFromCards,
} from './deck';
import { resetLogCounter, appendLog } from './battleLog';
import { DEFAULT_ENEMY_PORTRAIT, resolveCharacterModelSrc } from '@dark-fantasy/content/portraits';
import { createInitialProgression, normalizeProgression } from './progression/xp';
import { createInitialLoadout, getPlayerPortraitForDeck } from './progression/loadout';
import { reconcilePlayerCardPiles } from './playerPiles';
import { cloneRng, createRng } from './rng';

export const DEFAULT_PLAYER_MAX_MANA = 2;

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
    (enemyCardsData as CardDefinition[]).filter((card) => !card.signature),
  );
  const size = deckSize ?? battleData.enemy.deckSize;
  if (!size || size <= base.length) {
    return size ? base.slice(0, size) : base;
  }
  const ids: string[] = [];
  while (ids.length < size) {
    ids.push(...base);
  }
  return ids.slice(0, size);
}

export function createInitialBattle(
  progression: PlayerProgression = createInitialProgression(),
  enemyOverride?: BattleEnemyOverride,
  rngState?: RngState,
  playerDeckIds?: string[],
  playerGender?: PlayerGender,
  playerPiles?: PlayerBattlePiles,
): BattleContext {
  resetLogCounter();

  progression = normalizeProgression(progression);
  const rng = rngState ? cloneRng(rngState) : createRng();
  const deckIds =
    playerDeckIds && playerDeckIds.length > 0
      ? playerDeckIds
      : createInitialLoadout().deckCardIds;

  let playerHand: CardInstance[] = [];
  let playerDeck: CardInstance[];
  let playerDiscard: CardInstance[] = [];

  if (playerPiles) {
    const reconciled = reconcilePlayerCardPiles(
      {
        hand: structuredClone(playerPiles.hand),
        deck: structuredClone(playerPiles.deck),
        discard: structuredClone(playerPiles.discard),
      },
      deckIds,
      (id) => cardRegistry.get(id),
      rng,
    );
    playerHand = reconciled.hand;
    playerDeck = shuffle([...reconciled.deck, ...reconciled.discard], rng);
    playerDiscard = [];
    syncInstanceCounterFromCards([...playerHand, ...playerDeck]);
  } else {
    resetInstanceCounter();
    playerDeck = shuffle(buildDeck(deckIds), rng);
  }

  const enemyDeckIds =
    enemyOverride?.deckCardIds && enemyOverride.deckCardIds.length > 0
      ? enemyOverride.deckCardIds
      : buildEnemyDeckIds(enemyOverride?.deckSize);
  const enemyDeck = shuffle(buildDeck(enemyDeckIds), rng);
  const skillMaxShield = progression.skills?.maxShield ?? battleData.player.maxShield ?? 2;
  const skillMaxMana = progression.skills?.maxMana ?? DEFAULT_PLAYER_MAX_MANA;
  const playerMaxShield = playerPiles?.maxShield ?? skillMaxShield;
  const enemyMaxShield =
    enemyOverride?.maxShield ?? battleData.enemy.maxShield ?? 2;
  const enemyStartingShield =
    enemyOverride?.startingShield ?? battleData.enemy.startingShield ?? 2;
  const playerStartingShield =
    playerPiles?.shield ?? battleData.player.startingShield ?? skillMaxShield;
  const playerMaxMana = playerPiles?.maxMana ?? skillMaxMana;
  const playerStartingMana = playerPiles?.mana ?? playerMaxMana;
  const playerMaxHealth = playerHand.length + playerDeck.length + playerDiscard.length;

  return {
    player: {
      portrait: getPlayerPortraitForDeck(deckIds, playerGender),
      shield: Math.min(Math.max(0, playerStartingShield), playerMaxShield),
      maxShield: playerMaxShield,
      barrier: 0,
      deck: playerDeck,
      hand: playerHand,
      discard: playerDiscard,
    },
    enemy: {
      id: enemyOverride?.id,
      name: enemyOverride?.name ?? battleData.enemy.name,
      portrait: resolveCharacterModelSrc(enemyOverride?.portrait ?? DEFAULT_ENEMY_PORTRAIT),
      shield: Math.min(Math.max(0, enemyStartingShield), enemyMaxShield),
      maxShield: enemyMaxShield,
      barrier: 0,
      deck: enemyDeck,
      discard: [],
    },
    combo: [],
    playerMaxHealth,
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
    playerMana: Math.min(Math.max(0, playerStartingMana), playerMaxMana),
    playerMaxMana,
    enemyMarked: false,
    playerCardsDrawnThisBattle: 0,
    resolvingCardInstanceId: null,
    resolutionQueue: [],
    activePlay: null,
    lastDamageResult: null,
    isFirstPlayerTurn: true,
    lastPlayerDrawCount: 0,
    comboStartPlayerHealth: null,
    comboStartAttackCardsPlayed: null,
    comboStartCards: null,
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
  next.playerCardsDrawnThisBattle += drawn.length;
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
  if (battle.isFirstPlayerTurn && battle.player.hand.length > 0) {
    const next = structuredClone(battle);
    next.isFirstPlayerTurn = false;
    next.lastPlayerDrawCount = 0;
    return next;
  }
  const drawPerTurn = battle.progression.skills?.drawPerTurn ?? 1;
  const count = battle.isFirstPlayerTurn ? startingHandSize : drawPerTurn;
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
