import type { AtmosphereProfile, LayerVolumes, MusicLayerId } from './types';
import { AMBIENCE_LOOP_IDS, MUSIC_LAYER_IDS, OVERLAY_MUSIC_IDS } from './soundManifest';

export function computeLayerTargets(profile: AtmosphereProfile): LayerVolumes {
  const stabilityNorm = profile.stability / 100;
  const fear = profile.fearLevel;
  const failStreak = Math.min(profile.consecutiveFailures, 4);
  const inBattle = profile.phase === 'battle';
  const ended = profile.phase === 'victory' || profile.phase === 'defeat';

  let danger = 0;
  if (inBattle && stabilityNorm < 0.55) {
    danger = (0.55 - stabilityNorm) * 0.9;
  }
  if (inBattle) {
    danger += fear * 0.25;
    danger += failStreak * 0.08;
  }

  let collapse = 0;
  if (inBattle && profile.nearCollapse) {
    collapse = 0.35 + (1 - stabilityNorm) * 0.45;
  }
  if (profile.phase === 'defeat') {
    collapse = Math.max(collapse, 0.65);
  }
  if (ended && profile.phase === 'victory') {
    danger = 0;
    collapse = 0;
  }

  return {
    world_theme: 0,
    exploration_theme: 0,
    battle_theme: 0,
    battle_danger: clamp01(danger),
    defeat_drone: clamp01(collapse),
  };
}

export function computeAmbienceTargets(profile: AtmosphereProfile): Record<string, number> {
  const fear = profile.fearLevel;
  const stabilityNorm = profile.stability / 100;
  const inBattle = profile.phase === 'battle';
  const exploring = profile.phase === 'exploration';

  return {
    dungeon_hum: exploring || inBattle ? 0.12 + (1 - stabilityNorm) * 0.1 : 0.04,
    torch_crackle: fear * 0.18 + (profile.consecutiveFailures > 1 ? 0.06 : 0),
    distant_murmur: inBattle ? 0.08 : exploring ? 0.06 : 0.04,
    wind_rain: profile.nearCollapse ? 0.14 : profile.phase === 'world' ? 0.08 : 0.05,
    low_drone: inBattle ? fear * 0.16 : 0.03,
  };
}

export function layersNeedingCrossfade(
  current: LayerVolumes,
  next: LayerVolumes,
  threshold = 0.04
): Array<keyof LayerVolumes> {
  return MUSIC_LAYER_IDS.filter((id) => Math.abs((current[id] ?? 0) - (next[id] ?? 0)) > threshold);
}

export function activeAmbienceIds(profile: AtmosphereProfile): string[] {
  const targets = computeAmbienceTargets(profile);
  return AMBIENCE_LOOP_IDS.filter((id) => (targets[id] ?? 0) > 0.04);
}

export function activeOverlayIds(profile: AtmosphereProfile): MusicLayerId[] {
  const targets = computeLayerTargets(profile);
  return OVERLAY_MUSIC_IDS.filter((id) => (targets[id] ?? 0) > 0.04);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
