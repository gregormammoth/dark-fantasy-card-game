export type SoundCategory = 'ui' | 'event' | 'ambience' | 'music' | 'combat';

export type MusicScreen = 'world' | 'exploration' | 'battle';

export type MusicLayerId =
  | 'world_theme'
  | 'exploration_theme'
  | 'battle_theme'
  | 'battle_danger'
  | 'defeat_drone';

export type AmbienceLoopId =
  | 'dungeon_hum'
  | 'torch_crackle'
  | 'distant_murmur'
  | 'wind_rain'
  | 'low_drone';

export type UiSoundId =
  | 'card_hover'
  | 'card_play'
  | 'shield_gain'
  | 'draw_card'
  | 'end_turn'
  | 'modal_open'
  | 'fate_roll'
  | 'victory_reveal'
  | 'block_reveal'
  | 'defeat_reveal'
  | 'button_hover'
  | 'danger_warning';

export type GameOverSoundId = 'victory_sting' | 'defeat_sting';

export type EventSoundId = 'encounter_sting' | 'combat_hit';

export type WorldOneShotId = 'distant_howl';

export type SoundId =
  | UiSoundId
  | EventSoundId
  | WorldOneShotId
  | AmbienceLoopId
  | MusicLayerId
  | GameOverSoundId;

export type AudioSettings = {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.85,
  musicVolume: 0.45,
  sfxVolume: 0.72,
  muted: false,
};

export const AUDIO_STORAGE_KEY = 'dfcg-audio-settings-v1';

export type SoundDefinition = {
  id: SoundId;
  category: SoundCategory;
  src: string[];
  loop?: boolean;
  volume?: number;
  rate?: number;
  preload?: boolean;
  procedural?: boolean;
  spatial?: boolean;
  oneShotIntervalMs?: number;
};

export type PlayOptions = {
  volume?: number;
  rate?: number;
  force?: boolean;
  position?: { x: number; y: number; z: number };
};

export type GameAudioPhase =
  | 'world'
  | 'exploration'
  | 'battle'
  | 'victory'
  | 'defeat';

export type AtmosphereProfile = {
  stability: number;
  fearLevel: number;
  nearCollapse: boolean;
  consecutiveFailures: number;
  phase: GameAudioPhase;
};

export type LayerVolumes = Record<MusicLayerId, number>;

export type PositionalSoundOptions = PlayOptions & {
  x: number;
  y: number;
  z: number;
  refDistance?: number;
};

export const SCREEN_MUSIC: Record<MusicScreen, MusicLayerId> = {
  world: 'world_theme',
  exploration: 'exploration_theme',
  battle: 'battle_theme',
};

export function computeAtmosphereFromBattle(input: {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerPoison?: number;
  phase: GameAudioPhase;
}): AtmosphereProfile {
  const playerRatio =
    input.playerMaxHp > 0 ? Math.max(0, Math.min(1, input.playerHp / input.playerMaxHp)) : 1;
  const enemyRatio =
    input.enemyMaxHp > 0 ? Math.max(0, Math.min(1, input.enemyHp / input.enemyMaxHp)) : 1;
  const poisonPressure = Math.min(0.35, (input.playerPoison ?? 0) * 0.06);
  const fearLevel = Math.min(1, (1 - playerRatio) * 0.75 + poisonPressure);
  const consecutiveFailures =
    enemyRatio > 0.8 && playerRatio < 0.55 ? 2 : playerRatio < 0.4 ? 1 : 0;

  return {
    stability: Math.round(playerRatio * 100),
    fearLevel,
    nearCollapse: playerRatio < 0.35,
    consecutiveFailures,
    phase: input.phase,
  };
}
