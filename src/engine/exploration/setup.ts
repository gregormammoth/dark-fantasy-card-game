import prisonMapData from '@/data/prisonMap.json';
import playerCardsData from '@/data/playerCards.json';
import type { CardDefinition } from '@/types/card';
import type { ExplorationContext, LocationDefinition } from '@/types/exploration';
import { createCardInstance, resetInstanceCounter, shuffle } from '@/engine/deck';
import { buildEncounterDeck } from './encounters';
import { appendExplorationLog, resetExplorationLogCounter } from './log';
import { visitLocation } from './map';
import { drawUntilHandSize } from './hand';

interface PrisonMapFile {
  id: string;
  name: string;
  startLocationId: string;
  locations: LocationDefinition[];
}

const mapFile = prisonMapData as PrisonMapFile;

function buildPlayerDeck(): ReturnType<typeof createCardInstance>[] {
  return shuffle(
    (playerCardsData as CardDefinition[]).map((definition) => createCardInstance(definition)),
  );
}

function buildLocations(): Record<string, LocationDefinition> {
  const locations: Record<string, LocationDefinition> = {};
  for (const location of structuredClone(mapFile.locations)) {
    locations[location.id] = location;
  }
  return locations;
}

export function createInitialExploration(): ExplorationContext {
  resetInstanceCounter();
  resetExplorationLogCounter();

  const locations = buildLocations();
  const startId = mapFile.startLocationId;
  const context: ExplorationContext = {
    mapId: mapFile.id,
    mapName: mapFile.name,
    locations,
    currentLocationId: startId,
    selectedLocationId: startId,
    selectedCardInstanceId: null,
    deck: buildPlayerDeck(),
    hand: [],
    discard: [],
    actionsRemaining: 4,
    maxActions: 4,
    handSize: 4,
    turnCount: 0,
    flags: {},
    encounterDeck: buildEncounterDeck(),
    encounterDiscard: [],
    pendingEncounter: null,
    lastActionMessage: null,
    log: [],
  };

  visitLocation(context, startId);
  appendExplorationLog(
    context,
    `You wake in ${locations[startId]?.name ?? 'a cell'} beneath ${mapFile.name}.`,
    'system',
  );
  return context;
}

export function beginExplorationTurn(context: ExplorationContext): ExplorationContext {
  let next = structuredClone(context);
  next.turnCount += 1;
  next.actionsRemaining = next.maxActions;
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
