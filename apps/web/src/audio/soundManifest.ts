import type { AmbienceLoopId, MusicLayerId, SoundDefinition } from './types';

const base = '/audio';

function src(path: string): string[] {
  const stem = path.replace(/\.(ogg|mp3|wav)$/, '');
  return [`${stem}.ogg`, `${stem}.mp3`, `${stem}.wav`];
}

export const UI_SOUNDS: SoundDefinition[] = [
  { id: 'card_hover', category: 'ui', src: src(`${base}/ui/card-hover.ogg`), volume: 0.22, procedural: true },
  { id: 'card_play', category: 'ui', src: src(`${base}/ui/card-play.ogg`), volume: 0.38, procedural: true },
  { id: 'shield_gain', category: 'ui', src: src(`${base}/ui/shield-gain.ogg`), volume: 0.32, procedural: true },
  { id: 'draw_card', category: 'ui', src: src(`${base}/ui/draw-card.ogg`), volume: 0.34, procedural: true },
  { id: 'end_turn', category: 'ui', src: src(`${base}/ui/end-turn.ogg`), volume: 0.36, procedural: true },
  { id: 'modal_open', category: 'ui', src: src(`${base}/ui/modal-open.ogg`), volume: 0.4, procedural: true },
  { id: 'fate_roll', category: 'ui', src: src(`${base}/ui/fate-roll.ogg`), volume: 0.45, procedural: true },
  { id: 'victory_reveal', category: 'ui', src: src(`${base}/ui/victory-reveal.ogg`), volume: 0.42, procedural: true },
  { id: 'block_reveal', category: 'ui', src: src(`${base}/ui/block-reveal.ogg`), volume: 0.38, procedural: true },
  { id: 'defeat_reveal', category: 'ui', src: src(`${base}/ui/defeat-reveal.ogg`), volume: 0.48, procedural: true },
  { id: 'button_hover', category: 'ui', src: src(`${base}/ui/button-hover.ogg`), volume: 0.16, procedural: true },
  { id: 'danger_warning', category: 'ui', src: src(`${base}/ui/danger-warning.ogg`), volume: 0.38, procedural: true },
];

export const GAME_OVER_SOUNDS: SoundDefinition[] = [
  { id: 'victory_sting', category: 'music', src: src(`${base}/music/victory-sting.ogg`), volume: 0.5, procedural: true },
  { id: 'defeat_sting', category: 'music', src: src(`${base}/music/defeat-sting.ogg`), volume: 0.55, procedural: true },
];

export const EVENT_SOUNDS: SoundDefinition[] = [
  { id: 'encounter_sting', category: 'event', src: src(`${base}/events/encounter-sting.ogg`), volume: 0.44, procedural: true },
  { id: 'combat_hit', category: 'combat', src: src(`${base}/combat/combat-hit.ogg`), volume: 0.42, procedural: true },
];

export const COMBAT_SOUNDS: SoundDefinition[] = [
  { id: 'combat_sword', category: 'combat', src: src(`${base}/combat/sword.ogg`), volume: 0.55, preload: true, maxDurationMs: 1200 },
  { id: 'combat_shield', category: 'combat', src: src(`${base}/combat/shield.ogg`), volume: 0.52, preload: true, maxDurationMs: 1200 },
  { id: 'combat_poison', category: 'combat', src: src(`${base}/combat/poison.ogg`), volume: 0.5, preload: true, maxDurationMs: 1100 },
  { id: 'combat_dodge', category: 'combat', src: src(`${base}/combat/dodge.ogg`), volume: 0.5, preload: true, maxDurationMs: 1200 },
  { id: 'combat_magic', category: 'combat', src: src(`${base}/combat/magic.ogg`), volume: 0.55, preload: true, maxDurationMs: 1300 },
  { id: 'combat_mana', category: 'combat', src: src(`${base}/combat/mana.ogg`), volume: 0.5, preload: true, maxDurationMs: 1200 },
  { id: 'combat_barrier', category: 'combat', src: src(`${base}/combat/barrier.ogg`), volume: 0.52, preload: true, maxDurationMs: 1300 },
  { id: 'combat_heal', category: 'combat', src: src(`${base}/combat/heal.ogg`), volume: 0.5, preload: true, maxDurationMs: 1300 },
];

export const WORLD_SOUNDS: SoundDefinition[] = [
  {
    id: 'distant_howl',
    category: 'ambience',
    src: src(`${base}/ambience/distant-howl.ogg`),
    volume: 0.3,
    procedural: true,
    oneShotIntervalMs: 28000,
  },
];

export const AMBIENCE_LOOPS: SoundDefinition[] = [
  { id: 'dungeon_hum', category: 'ambience', src: src(`${base}/ambience/dungeon-hum.ogg`), loop: true, volume: 0.2, preload: false, procedural: true },
  { id: 'torch_crackle', category: 'ambience', src: src(`${base}/ambience/torch-crackle.ogg`), loop: true, volume: 0.12, preload: false, procedural: true },
  { id: 'distant_murmur', category: 'ambience', src: src(`${base}/ambience/distant-murmur.ogg`), loop: true, volume: 0.14, preload: false, procedural: true },
  { id: 'wind_rain', category: 'ambience', src: src(`${base}/ambience/wind-rain.ogg`), loop: true, volume: 0.16, preload: false, procedural: true },
  { id: 'low_drone', category: 'ambience', src: src(`${base}/ambience/low-drone.ogg`), loop: true, volume: 0.18, preload: false, procedural: true },
];

export const MUSIC_LAYERS: SoundDefinition[] = [
  { id: 'world_theme', category: 'music', src: src(`${base}/music/world.ogg`), loop: true, volume: 0.35, preload: true, procedural: true },
  { id: 'exploration_theme', category: 'music', src: src(`${base}/music/exploration.ogg`), loop: true, volume: 0.35, preload: true, procedural: true },
  { id: 'battle_theme', category: 'music', src: src(`${base}/music/battle.ogg`), loop: true, volume: 0.4, preload: true, procedural: true },
  { id: 'battle_danger', category: 'music', src: src(`${base}/music/battle-danger.ogg`), loop: true, volume: 0.45, preload: false, procedural: true },
  { id: 'defeat_drone', category: 'music', src: src(`${base}/music/defeat-drone.ogg`), loop: true, volume: 0.5, preload: false, procedural: true },
];

export const SOUND_MANIFEST: SoundDefinition[] = [
  ...UI_SOUNDS,
  ...EVENT_SOUNDS,
  ...COMBAT_SOUNDS,
  ...WORLD_SOUNDS,
  ...AMBIENCE_LOOPS,
  ...MUSIC_LAYERS,
  ...GAME_OVER_SOUNDS,
];

export const MANIFEST_BY_ID = new Map(SOUND_MANIFEST.map((s) => [s.id, s]));

export const MUSIC_LAYER_IDS: MusicLayerId[] = [
  'world_theme',
  'exploration_theme',
  'battle_theme',
  'battle_danger',
  'defeat_drone',
];

export const SCREEN_MUSIC_IDS: MusicLayerId[] = [
  'world_theme',
  'exploration_theme',
  'battle_theme',
];

export const OVERLAY_MUSIC_IDS: MusicLayerId[] = ['battle_danger', 'defeat_drone'];

export const AMBIENCE_LOOP_IDS: AmbienceLoopId[] = [
  'dungeon_hum',
  'torch_crackle',
  'distant_murmur',
  'wind_rain',
  'low_drone',
];

export const PRELOAD_ON_UNLOCK: SoundDefinition['category'][] = ['ui', 'event', 'combat'];
