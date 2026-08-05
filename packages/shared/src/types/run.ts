import type { ExplorationContext } from './exploration';
import type { PlayerLoadout, PlayerProgression } from './progression';
import type { AppScreen } from './world';

export type RunExplorationPhase = 'idle' | 'playerTurn' | 'encounter';

export interface PendingLocationFight {
  locationId: string;
  enemyId: string;
}

export interface RunState {
  progression: PlayerProgression;
  loadout: PlayerLoadout;
  exploration: ExplorationContext | null;
  explorationPhase: RunExplorationPhase;
  screen: AppScreen;
  playerReturnScreen: AppScreen;
  runSeed: number;
  pendingLocationFight: PendingLocationFight | null;
}
