import type { AtmosphereProfile, LayerVolumes } from './types';
import { AMBIENCE_LOOP_IDS, MUSIC_LAYER_IDS } from './soundManifest';

export function computeLayerTargets(profile: AtmosphereProfile): LayerVolumes {
  const stabilityNorm = profile.stability / 100;
  const fear = profile.fearLevel;
  const failStreak = Math.min(profile.consecutiveFailures, 4);
  const ended = profile.phase === 'victory' || profile.phase === 'defeat';

  const base = ended ? 0.08 : 0.24 + stabilityNorm * 0.16;

  let tension = 0;
  if (profile.phase === 'battle' && fear > 0.35) {
    tension = fear * 0.28;
  }

  let danger = 0;
  if (stabilityNorm < 0.55) {
    danger = (0.55 - stabilityNorm) * 0.9;
  }
  danger += fear * 0.25;
  danger += failStreak * 0.08;

  let collapse = 0;
  if (profile.nearCollapse) {
    collapse = 0.35 + (1 - stabilityNorm) * 0.45;
  }
  if (profile.phase === 'defeat') {
    collapse = Math.max(collapse, 0.65);
  }
  if (profile.phase === 'victory') {
    collapse = 0;
    danger = 0;
    tension = 0;
  }

  return {
    base_ambient: clamp01(base),
    election_tension: clamp01(tension),
    danger_escalation: clamp01(danger),
    collapse_alarm: clamp01(collapse),
  };
}

export function computeAmbienceTargets(profile: AtmosphereProfile): Record<string, number> {
  const fear = profile.fearLevel;
  const stabilityNorm = profile.stability / 100;
  const inBattle = profile.phase === 'battle';

  return {
    industrial_hum: 0.12 + (1 - stabilityNorm) * 0.1,
    radio_static: fear * 0.18 + (profile.consecutiveFailures > 1 ? 0.06 : 0),
    crowd_murmur: inBattle ? 0.08 : 0.05,
    rain_wind: profile.nearCollapse ? 0.14 : 0.05,
    military_drone: inBattle ? fear * 0.16 : 0.04,
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

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
