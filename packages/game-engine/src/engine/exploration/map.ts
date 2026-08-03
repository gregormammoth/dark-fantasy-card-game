import type {
  ExplorationContext,
  LocationDefinition,
  LocationStatus,
} from '@dark-fantasy/shared/types/exploration';
import prisonMapData from '@dark-fantasy/content/prisonMap.json';

const FINAL_BRANCH_IDS = new Set(
  ((prisonMapData as { finalBranchIds?: string[] }).finalBranchIds ?? []) as string[],
);
const EXIT_LOCATION_ID =
  ((prisonMapData as { exitLocationId?: string }).exitLocationId as string | undefined) ??
  'exit_gate';

export function isFinalBranch(locationId: string): boolean {
  return FINAL_BRANCH_IDS.has(locationId);
}

export function isLocationLocked(
  context: ExplorationContext,
  locationId: string,
): boolean {
  return isFinalBranch(locationId) && !!context.finalBranchId && context.finalBranchId !== locationId;
}

export function isExitBlocked(context: ExplorationContext, locationId: string): boolean {
  if (locationId !== EXIT_LOCATION_ID) {
    return false;
  }
  if (!context.finalBranchId) {
    return true;
  }
  const branch = context.locations[context.finalBranchId];
  return !!branch?.enemies.some((enemy) => !enemy.defeated);
}

export function isCorridorBlocked(context: ExplorationContext, locationId: string): boolean {
  if (locationId !== 'central_corridor') {
    return false;
  }
  return !context.flags.ritual_corridor_open;
}

export function isDiningHallPathBlocked(
  context: ExplorationContext,
  fromLocationId: string,
  toLocationId: string,
): boolean {
  const pair = [fromLocationId, toLocationId].sort().join(':');
  if (pair !== 'central_corridor:dining_hall') {
    return false;
  }
  return !context.flags.dining_hall_path_open;
}

export function getLocation(
  context: ExplorationContext,
  locationId: string,
): LocationDefinition | null {
  return context.locations[locationId] ?? null;
}

export function getCurrentLocation(context: ExplorationContext): LocationDefinition {
  const location = context.locations[context.currentLocationId];
  if (!location) {
    throw new Error(`Missing current location: ${context.currentLocationId}`);
  }
  return location;
}

export function getLocationStatus(
  context: ExplorationContext,
  locationId: string,
): LocationStatus {
  const location = context.locations[locationId];
  if (!location) {
    return 'distant';
  }
  if (location.visited) {
    return 'visited';
  }
  if (location.secret && !location.discovered) {
    return 'distant';
  }
  const reachable = location.connectedLocations.some((id) => context.locations[id]?.visited);
  if (reachable || location.discovered) {
    return 'reachable';
  }
  return 'distant';
}

export function isLocationVisible(context: ExplorationContext, locationId: string): boolean {
  const location = context.locations[locationId];
  if (!location) {
    return false;
  }
  if (!location.secret) {
    return true;
  }
  return location.discovered || location.visited;
}

export function canMoveTo(context: ExplorationContext, locationId: string): boolean {
  const current = getCurrentLocation(context);
  if (!current.connectedLocations.includes(locationId)) {
    return false;
  }
  const target = context.locations[locationId];
  if (!target) {
    return false;
  }
  if (target.secret && !target.discovered && !target.visited) {
    return false;
  }
  if (isLocationLocked(context, locationId)) {
    return false;
  }
  if (isExitBlocked(context, locationId)) {
    return false;
  }
  if (isCorridorBlocked(context, locationId)) {
    return false;
  }
  if (isDiningHallPathBlocked(context, current.id, locationId)) {
    return false;
  }
  return true;
}

export function discoverLocation(context: ExplorationContext, locationId: string): void {
  const location = context.locations[locationId];
  if (!location) {
    return;
  }
  location.discovered = true;
}

export function visitLocation(context: ExplorationContext, locationId: string): void {
  const location = context.locations[locationId];
  if (!location) {
    return;
  }
  location.visited = true;
  location.discovered = true;
  for (const connectedId of location.connectedLocations) {
    const connected = context.locations[connectedId];
    if (connected && !connected.secret) {
      connected.discovered = true;
    }
  }
}

export function discoverConnectedLocations(context: ExplorationContext): void {
  const current = getCurrentLocation(context);
  for (const connectedId of current.connectedLocations) {
    discoverLocation(context, connectedId);
  }
}

export function revealSecretConnections(context: ExplorationContext): void {
  const current = getCurrentLocation(context);
  for (const connectedId of current.connectedLocations) {
    const connected = context.locations[connectedId];
    if (connected?.secret) {
      connected.discovered = true;
    }
  }
  for (const interaction of current.interactions) {
    if (interaction.unlocksLocationId) {
      discoverLocation(context, interaction.unlocksLocationId);
    }
  }
}

export function listMapEdges(context: ExplorationContext): Array<[string, string]> {
  const edges: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const location of Object.values(context.locations)) {
    for (const connectedId of location.connectedLocations) {
      const key = [location.id, connectedId].sort().join(':');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      edges.push([location.id, connectedId]);
    }
  }
  return edges;
}

export function countVisited(context: ExplorationContext): number {
  return Object.values(context.locations).filter((location) => location.visited).length;
}

export function applyMove(
  context: ExplorationContext,
  locationId: string,
): ExplorationContext {
  if (!canMoveTo(context, locationId)) {
    return context;
  }
  context.currentLocationId = locationId;
  context.selectedLocationId = locationId;
  visitLocation(context, locationId);
  if (isFinalBranch(locationId) && !context.finalBranchId) {
    context.finalBranchId = locationId;
  }
  return context;
}

export function isInteractionAvailable(
  context: ExplorationContext,
  interactionId: string,
): boolean {
  const location = getCurrentLocation(context);
  const interaction = location.interactions.find((item) => item.id === interactionId);
  if (!interaction || interaction.completed) {
    return false;
  }
  if (interaction.requiresEnemy) {
    const enemy = location.enemies.find((item) => {
      if (interaction.targetId && item.id !== interaction.targetId) {
        return false;
      }
      if (item.requiresFlag && !context.flags[item.requiresFlag]) {
        return false;
      }
      return !item.defeated;
    });
    if (!enemy || enemy.defeated) {
      return false;
    }
  }
  if (interaction.requiresNpc) {
    const npc = location.npcs.find((item) => {
      if (interaction.targetId && item.id !== interaction.targetId) {
        return false;
      }
      if (item.requiresFlag && !context.flags[item.requiresFlag]) {
        return false;
      }
      return !item.talked || !!interaction.targetId;
    });
    if (!npc) {
      return false;
    }
    if (npc.requiresFlag && !context.flags[npc.requiresFlag]) {
      return false;
    }
  }
  if (interaction.requiresLoot) {
    const hasLoot = location.loot.some((item) => !item.claimed);
    if (!hasLoot) {
      return false;
    }
  }
  if (interaction.requiresFlag && !context.flags[interaction.requiresFlag]) {
    return false;
  }
  return true;
}
