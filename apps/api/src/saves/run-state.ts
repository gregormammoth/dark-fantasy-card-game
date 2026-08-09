export const LOCAL_SAVE_SCHEMA_VERSION = 2;

export interface ApiRunState {
  progression: {
    classes: {
      warrior: { xp: number };
      rogue: { xp: number };
      wizard: { xp: number };
      survivor: { xp: number };
      seeker: { xp: number };
    };
    skills?: {
      maxShield: number;
      maxCombo: number;
      maxMana: number;
      maxDeck: number;
      drawPerTurn: number;
    };
  };
  loadout: {
    unlockedCardIds: string[];
    deckCardIds: string[];
  };
  exploration: Record<string, unknown> | null;
  explorationPhase: 'idle' | 'playerTurn' | 'encounter';
  screen: 'world' | 'exploration' | 'battle' | 'player';
  playerReturnScreen: 'world' | 'exploration' | 'battle' | 'player';
  runSeed: number;
  pendingLocationFight: { locationId: string; enemyId: string } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasClassXp(entry: unknown): boolean {
  return isRecord(entry) && typeof entry.xp === 'number';
}

function isProgression(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.classes)) {
    return false;
  }
  const classes = value.classes;
  const hasWarrior = hasClassXp(classes.warrior) || hasClassXp(classes.fighter);
  if (!hasWarrior) {
    return false;
  }
  for (const key of ['rogue', 'wizard', 'survivor'] as const) {
    if (!hasClassXp(classes[key])) {
      return false;
    }
  }
  return true;
}

function isLoadout(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    Array.isArray(value.unlockedCardIds) &&
    Array.isArray(value.deckCardIds) &&
    value.unlockedCardIds.every((id) => typeof id === 'string') &&
    value.deckCardIds.every((id) => typeof id === 'string')
  );
}

const SCREENS = new Set(['world', 'exploration', 'battle', 'player']);
const PHASES = new Set(['idle', 'playerTurn', 'encounter']);

export function isRunState(value: unknown): value is ApiRunState {
  if (!isRecord(value)) {
    return false;
  }
  if (!isProgression(value.progression) || !isLoadout(value.loadout)) {
    return false;
  }
  if (typeof value.runSeed !== 'number') {
    return false;
  }
  if (!PHASES.has(String(value.explorationPhase))) {
    return false;
  }
  if (!SCREENS.has(String(value.screen)) || !SCREENS.has(String(value.playerReturnScreen))) {
    return false;
  }
  if (value.exploration !== null && !isRecord(value.exploration)) {
    return false;
  }
  if (value.pendingLocationFight !== null) {
    if (
      !isRecord(value.pendingLocationFight) ||
      typeof value.pendingLocationFight.locationId !== 'string' ||
      typeof value.pendingLocationFight.enemyId !== 'string'
    ) {
      return false;
    }
  }
  return true;
}

export function supportedSchemaVersion(schemaVersion: number): boolean {
  return schemaVersion === 1 || schemaVersion === LOCAL_SAVE_SCHEMA_VERSION;
}
