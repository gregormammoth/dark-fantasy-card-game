import type { PlayerGender, PlayerProfile } from '@dark-fantasy/shared/types/player';

const PLAYER_PROFILE_STORAGE_KEY = 'dfcg-player-profile-v1';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function isPlayerProfile(value: unknown): value is PlayerProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.playerId === 'string' &&
    typeof profile.name === 'string' &&
    (profile.gender === 'man' || profile.gender === 'woman')
  );
}

export function loadPlayerProfile(): PlayerProfile | null {
  try {
    const raw = window.localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const value: unknown = JSON.parse(raw);
    return isPlayerProfile(value) ? value : null;
  } catch {
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  window.localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function createPlayerProfile(
  name: string,
  gender: PlayerGender,
): Promise<PlayerProfile> {
  const response = await fetch(`${API_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, gender }),
  });
  if (!response.ok) {
    throw new Error('Could not create player');
  }
  const value: unknown = await response.json();
  if (!isPlayerProfile(value)) {
    throw new Error('Invalid player response');
  }
  savePlayerProfile(value);
  return value;
}
