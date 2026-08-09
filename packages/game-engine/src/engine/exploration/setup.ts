import prisonMapData from '@dark-fantasy/content/prisonMap.json';
import battleData from '@dark-fantasy/content/battle.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import type {
  ExplorationContext,
  LocationDefinition,
  LocationSourceDefinition,
} from '@dark-fantasy/shared/types/exploration';
import { hydrateEnemyPlacement } from '../enemyBands';
import { createCardInstance, resetInstanceCounter, shuffle } from '../deck';
import { createRng } from '../rng';
import { reconcilePlayerCardPiles } from '../playerPiles';
import { buildEncounterDeck } from './encounters';
import { appendExplorationLog, resetExplorationLogCounter } from './log';
import { visitLocation } from './map';
import { drawUntilHandSize, syncActionsToHand } from './hand';
import { setLocationEncounterQueue } from './locationEncounters';
import { createInitialLoadout, getPlayerCardById } from '../progression/loadout';
import type { PlayerSkills } from '@dark-fantasy/shared/types/progression';
import { PLAYER_SKILL_BASE } from '@dark-fantasy/shared/types/progression';

interface PrisonMapFile {
  id: string;
  name: string;
  startLocationId: string;
  locations: LocationSourceDefinition[];
}

const mapFile = prisonMapData as PrisonMapFile;

function buildPlayerDeckFromIds(
  deckCardIds: string[],
  rng: ExplorationContext['rng'],
): ReturnType<typeof createCardInstance>[] {
  const definitions = deckCardIds
    .map((id) => getPlayerCardById(id))
    .filter((card): card is CardDefinition => Boolean(card));
  return shuffle(
    definitions.map((definition) => createCardInstance(definition)),
    rng,
  );
}

function buildLocations(): Record<string, LocationDefinition> {
  const locations: Record<string, LocationDefinition> = {};
  for (const location of structuredClone(mapFile.locations)) {
    locations[location.id] = {
      ...location,
      enemies: location.enemies.map(hydrateEnemyPlacement),
    };
  }
  return locations;
}

export function createInitialExploration(
  seed?: number,
  deckCardIds: string[] = createInitialLoadout().deckCardIds,
  skills: PlayerSkills = PLAYER_SKILL_BASE,
): ExplorationContext {
  resetInstanceCounter();
  resetExplorationLogCounter();

  const rng = createRng(seed);
  const locations = buildLocations();
  const startId = mapFile.startLocationId;
  const maxShield = skills.maxShield;
  const maxMana = skills.maxMana;
  const startingShield = Math.min(battleData.player.startingShield ?? maxShield, maxShield);
  const context: ExplorationContext = {
    mapId: mapFile.id,
    mapName: mapFile.name,
    locations,
    currentLocationId: startId,
    selectedLocationId: startId,
    selectedCardInstanceId: null,
    deck: buildPlayerDeckFromIds(deckCardIds, rng),
    hand: [],
    discard: [],
    shield: startingShield,
    maxShield,
    mana: maxMana,
    maxMana,
    actionsRemaining: 4,
    maxActions: 4,
    handSize: 4,
    turnCount: 0,
    flags: {},
    encounterDeck: buildEncounterDeck(rng),
    encounterDiscard: [],
    pendingEncounter: null,
    locationEncounterQueue: [],
    dialogLineIndex: 0,
    finalBranchId: null,
    quests: [],
    lastActionMessage: null,
    log: [],
    rng,
  };

  visitLocation(context, startId);
  setLocationEncounterQueue(context, startId);
  appendExplorationLog(
    context,
    `You wake in ${locations[startId]?.name ?? 'a cell'} beneath ${mapFile.name}.`,
    'system',
  );
  appendExplorationLog(context, `Run seed ${context.rng.seed}.`, 'system');
  return context;
}

export function rebuildExplorationDeck(
  context: ExplorationContext,
  deckCardIds: string[],
): ExplorationContext {
  const next = structuredClone(context);
  const reconciled = reconcilePlayerCardPiles(
    {
      hand: next.hand,
      deck: next.deck,
      discard: next.discard,
    },
    deckCardIds,
    getPlayerCardById,
    next.rng,
  );
  next.hand = reconciled.hand;
  next.deck = reconciled.deck;
  next.discard = reconciled.discard;
  if (
    next.selectedCardInstanceId &&
    !next.hand.some((card) => card.instanceId === next.selectedCardInstanceId)
  ) {
    next.selectedCardInstanceId = null;
  }
  syncActionsToHand(next);
  return next;
}

export function beginExplorationTurn(context: ExplorationContext): ExplorationContext {
  let next = structuredClone(context);
  next.turnCount += 1;
  next.selectedCardInstanceId = null;
  next.lastActionMessage = null;
  next.pendingEncounter = null;
  appendExplorationLog(next, `Turn ${next.turnCount} begins.`, 'system');
  next = drawUntilHandSize(next);
  return next;
}

export function selectLocation(
  context: ExplorationContext,
  locationId: string,
): ExplorationContext {
  const next = structuredClone(context);
  next.selectedLocationId = locationId;
  return next;
}

export function clearLocationSelection(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  next.selectedLocationId = null;
  return next;
}

export function selectCard(
  context: ExplorationContext,
  cardInstanceId: string,
): ExplorationContext {
  const next = structuredClone(context);
  next.selectedCardInstanceId =
    next.selectedCardInstanceId === cardInstanceId ? null : cardInstanceId;
  return next;
}

export function clearCardSelection(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  next.selectedCardInstanceId = null;
  return next;
}
