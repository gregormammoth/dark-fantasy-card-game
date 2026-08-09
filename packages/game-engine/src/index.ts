export { getPlayerHealth, getEnemyHealth } from './engine/health';
export { previewCombo } from './engine/comboPreview';
export { COMBO_CAP, isInstantPlayCard } from './engine/combo';
export { DEFAULT_PLAYER_MAX_MANA } from './engine/battleSetup';
export {
  DEFAULT_ENEMY_BAND,
  getEnemyBandProfile,
  getEnemyDefinition,
  hydrateEnemyPlacement,
  listEnemyDefinitions,
  listEnemyGroupCardIds,
  resolveEnemyBattleProfile,
} from './engine/enemyBands';
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
  listPlayerClasses,
  normalizeLoadoutCardIds,
  normalizeProgression,
} from './engine/progression/xp';
export {
  applySkillsToExplorationCaps,
  canChooseSkill,
  chooseSkill,
  createInitialSkills,
  getAvailableSkillPoints,
  getComboCap,
  getDeckCap,
  getDrawPerTurn,
  getPlayerLevel,
  getPlayerLevelProgress,
  getSpentSkillPoints,
  getTotalClassLevels,
  normalizeSkills,
} from './engine/progression/skills';
export {
  DECK_CAP,
  availableLevelsForClass,
  canUnlockImprovedCard,
  countDeckClasses,
  createInitialLoadout,
  getCardsForClass,
  getDominantDeckClass,
  getPlayerCardById,
  getPlayerPortraitForDeck,
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
  createRun,
  hasResumableRun,
  parseLocalSave,
  serializeLocalSave,
} from './engine/persistence/localSave';
export { rebuildExplorationDeck } from './engine/exploration/setup';
