import type {
  LocalRunState,
  LocalSaveFile,
  SavedExplorationPhase,
} from '@dark-fantasy/shared/types/save';
import { LOCAL_SAVE_SCHEMA_VERSION } from '@dark-fantasy/shared/types/save';
import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import type { PlayerLoadout, PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { createInitialProgression } from '../progression/xp';
import { createInitialLoadout } from '../progression/loadout';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProgression(value: unknown): value is PlayerProgression {
  if (!isRecord(value) || !isRecord(value.classes)) {
    return false;
  }
  const classes = value.classes;
  for (const key of ['fighter', 'rogue', 'wizard', 'survivor'] as const) {
    const entry = classes[key];
    if (!isRecord(entry) || typeof entry.xp !== 'number') {
      return false;
    }
  }
  return true;
}

function isLoadout(value: unknown): value is PlayerLoadout {
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

function isRng(value: unknown): boolean {
  return isRecord(value) && typeof value.seed === 'number' && typeof value.cursor === 'number';
}

function isExploration(value: unknown): value is ExplorationContext {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.mapId === 'string' &&
    typeof value.currentLocationId === 'string' &&
    isRecord(value.locations) &&
    Array.isArray(value.deck) &&
    Array.isArray(value.hand) &&
    Array.isArray(value.discard) &&
    typeof value.actionsRemaining === 'number' &&
    isRecord(value.flags) &&
    Array.isArray(value.quests) &&
    isRng(value.rng)
  );
}

function isPhase(value: unknown): value is SavedExplorationPhase {
  return value === 'idle' || value === 'playerTurn' || value === 'encounter';
}

export function createEmptyLocalRunState(runSeed: number): LocalRunState {
  return {
    progression: createInitialProgression(),
    loadout: createInitialLoadout(),
    exploration: null,
    explorationPhase: 'idle',
    screen: 'world',
    playerReturnScreen: 'world',
    runSeed,
    pendingLocationFight: null,
  };
}

export function createRun(runSeed: number): LocalRunState {
  return createEmptyLocalRunState(runSeed);
}

export function buildLocalSaveFile(state: LocalRunState): LocalSaveFile {
  return {
    schemaVersion: LOCAL_SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
}

export function serializeLocalSave(state: LocalRunState): string {
  return JSON.stringify(buildLocalSaveFile(state));
}

export function parseLocalSave(raw: string): LocalSaveFile | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return null;
    }
    const schemaVersion = parsed.schemaVersion;
    if (schemaVersion !== 1 && schemaVersion !== LOCAL_SAVE_SCHEMA_VERSION) {
      return null;
    }
    if (typeof parsed.savedAt !== 'string' || !isRecord(parsed.state)) {
      return null;
    }
    const state = parsed.state;
    if (!isProgression(state.progression)) {
      return null;
    }
    if (typeof state.runSeed !== 'number') {
      return null;
    }
    if (!isPhase(state.explorationPhase)) {
      return null;
    }
    if (
      state.screen !== 'world' &&
      state.screen !== 'exploration' &&
      state.screen !== 'battle' &&
      state.screen !== 'player'
    ) {
      return null;
    }
    if (
      state.playerReturnScreen !== 'world' &&
      state.playerReturnScreen !== 'exploration' &&
      state.playerReturnScreen !== 'battle' &&
      state.playerReturnScreen !== 'player'
    ) {
      return null;
    }
    if (state.exploration !== null && !isExploration(state.exploration)) {
      return null;
    }
    let pendingLocationFight: LocalRunState['pendingLocationFight'] = null;
    if (state.pendingLocationFight !== null) {
      if (
        !isRecord(state.pendingLocationFight) ||
        typeof state.pendingLocationFight.locationId !== 'string' ||
        typeof state.pendingLocationFight.enemyId !== 'string'
      ) {
        return null;
      }
      pendingLocationFight = {
        locationId: state.pendingLocationFight.locationId,
        enemyId: state.pendingLocationFight.enemyId,
      };
    }
    const loadout = isLoadout(state.loadout) ? state.loadout : createInitialLoadout();
    return {
      schemaVersion: LOCAL_SAVE_SCHEMA_VERSION,
      savedAt: parsed.savedAt,
      state: {
        progression: state.progression,
        loadout,
        exploration: state.exploration,
        explorationPhase: state.explorationPhase,
        screen: state.screen,
        playerReturnScreen: state.playerReturnScreen,
        runSeed: state.runSeed,
        pendingLocationFight,
      },
    };
  } catch {
    return null;
  }
}

export function hasResumableRun(state: LocalRunState): boolean {
  return state.explorationPhase !== 'idle' && state.exploration !== null;
}
