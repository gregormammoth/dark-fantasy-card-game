import type {
  ExplorationContext,
  LocationDefinition,
  LocationStatus,
} from '@/types/exploration';

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
    const enemy = location.enemies.find((item) =>
      interaction.targetId ? item.id === interaction.targetId : !item.defeated,
    );
    if (!enemy || enemy.defeated) {
      return false;
    }
  }
  if (interaction.requiresNpc) {
    const npc = location.npcs.find((item) =>
      interaction.targetId ? item.id === interaction.targetId : !item.talked,
    );
    if (!npc) {
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
