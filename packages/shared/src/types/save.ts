import type { ExplorationContext } from './exploration';
import type { PlayerLoadout, PlayerProgression } from './progression';

export const LOCAL_SAVE_SCHEMA_VERSION = 2;

export type SavedAppScreen = 'world' | 'exploration' | 'battle' | 'player';

export type SavedExplorationPhase = 'idle' | 'playerTurn' | 'encounter';

export interface PendingLocationFightSave {
  locationId: string;
  enemyId: string;
}

export interface LocalRunState {
  progression: PlayerProgression;
  loadout: PlayerLoadout;
  exploration: ExplorationContext | null;
  explorationPhase: SavedExplorationPhase;
  screen: SavedAppScreen;
  playerReturnScreen: SavedAppScreen;
  runSeed: number;
  pendingLocationFight: PendingLocationFightSave | null;
}

export interface LocalSaveFile {
  schemaVersion: number;
  savedAt: string;
  state: LocalRunState;
}
