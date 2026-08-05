export { getPlayerHealth, getEnemyHealth } from './engine/health';
export { previewCombo } from './engine/comboPreview';
export { getEnemyIntent } from './engine/enemyIntent';
export type { EnemyIntent } from './engine/enemyIntent';
export {
  canMoveTo,
  getLocationStatus,
  isInteractionAvailable,
  isLocationLocked,
  isExitBlocked,
  isFinalBranch,
} from './engine/exploration/map';
export { canPlayAction } from './engine/exploration/actions';
export { listActiveQuests, listAvailableNpcs, isNpcAvailable } from './engine/exploration/quests';
export { battleMachine } from './machine/battleMachine';
export { explorationMachine } from './machine/explorationMachine';
export {
  awardCardXp,
  createInitialProgression,
  getClassXp,
  getClassLevel,
  getXpIntoLevel,
  getAvailableClassLevels,
  getImprovedUnlockCost,
  getTotalXp,
  getXpGained,
  getTotalXpGained,
} from './engine/progression/xp';
export {
  DECK_CAP,
  availableLevelsForClass,
  canUnlockImprovedCard,
  createInitialLoadout,
  getCardsForClass,
  getPlayerCardById,
  isCardUnlocked,
  listAllPlayerCards,
  listBasePlayerCards,
  listImprovedPlayerCards,
  spentLevelsForClass,
  toggleDeckCard,
  unlockImprovedCard,
  resolveLoadoutDeckDefinitions,
} from './engine/progression/loadout';
export { createRng, cloneRng, normalizeSeed } from './engine/rng';
export type { RngState } from './engine/rng';
export {
  buildLocalSaveFile,
  createEmptyLocalRunState,
  hasResumableRun,
  parseLocalSave,
  serializeLocalSave,
} from './engine/persistence/localSave';
export { rebuildExplorationDeck } from './engine/exploration/setup';
