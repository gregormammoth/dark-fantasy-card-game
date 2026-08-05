import type {
  PendingLocationFight,
  RunExplorationPhase,
  RunState,
} from './run';

export const LOCAL_SAVE_SCHEMA_VERSION = 2;

export type SavedAppScreen = 'world' | 'exploration' | 'battle' | 'player';

export type SavedExplorationPhase = RunExplorationPhase;

export type PendingLocationFightSave = PendingLocationFight;

export type LocalRunState = RunState;

export interface LocalSaveFile {
  schemaVersion: number;
  savedAt: string;
  state: LocalRunState;
}
