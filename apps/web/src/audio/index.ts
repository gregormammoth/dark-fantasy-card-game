export { AudioManager, getAudioManager, resetAudioManager } from './AudioManager';
export { useAudioStore } from './audioStore';
export { useAudio, useAudioUnlockOnGesture } from './useAudio';
export { useGameAudio } from './useGameAudio';
export { useGameOverAudio } from './useGameOverAudio';
export { useHoverSound, useButtonHoverSound } from './useHoverSound';
export { useScreenMusic } from './useScreenMusic';
export { SOUND_MANIFEST, MANIFEST_BY_ID } from './soundManifest';
export { getCombatSoundForCard } from './combatCardSound';
export type {
  SoundId,
  SoundCategory,
  AudioSettings,
  AtmosphereProfile,
  PlayOptions,
  MusicLayerId,
  MusicScreen,
  AmbienceLoopId,
  CombatSoundId,
} from './types';
export { computeAtmosphereFromBattle, DEFAULT_AUDIO_SETTINGS, SCREEN_MUSIC } from './types';
