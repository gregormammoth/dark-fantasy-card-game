import { useSyncExternalStore } from 'react';
import { getAudioManager } from './AudioManager';
import {
  AUDIO_STORAGE_KEY,
  DEFAULT_AUDIO_SETTINGS,
  type AudioSettings,
} from './types';

type AudioStoreSnapshot = {
  settings: AudioSettings;
  unlocked: boolean;
  hydrated: boolean;
};

type Listener = () => void;

let snapshot: AudioStoreSnapshot = {
  settings: DEFAULT_AUDIO_SETTINGS,
  unlocked: false,
  hydrated: false,
};

const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setSnapshot( partial: Partial<AudioStoreSnapshot>): void {
  snapshot = { ...snapshot, ...partial };
  emit();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function loadPersistedSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      ...DEFAULT_AUDIO_SETTINGS,
      ...parsed,
      masterVolume: clamp(parsed.masterVolume ?? DEFAULT_AUDIO_SETTINGS.masterVolume),
      musicVolume: clamp(parsed.musicVolume ?? DEFAULT_AUDIO_SETTINGS.musicVolume),
      sfxVolume: clamp(parsed.sfxVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume),
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

function persistSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* quota / private mode */
  }
}

function applyToManager(settings: AudioSettings): void {
  getAudioManager().configure(settings);
}

export function hydrate(): void {
  if (snapshot.hydrated) return;
  const settings = loadPersistedSettings();
  applyToManager(settings);
  setSnapshot({ settings, hydrated: true });
}

export async function unlock(): Promise<void> {
  const manager = getAudioManager();
  const ok = await manager.unlock();
  if (!ok) {
    return;
  }
  if (snapshot.unlocked) {
    await manager.resume();
    return;
  }
  setSnapshot({ unlocked: true });
  await manager.preloadCategories(['ui', 'event']);
  await manager.ensureBaseAmbient();
  void manager.startGameplayBed();
  window.setTimeout(() => {
    void manager.preloadLoops();
  }, 2000);
}

export function setMasterVolume(v: number): void {
  const settings = { ...snapshot.settings, masterVolume: clamp(v) };
  persistSettings(settings);
  applyToManager(settings);
  setSnapshot({ settings });
}

export function setMusicVolume(v: number): void {
  const settings = { ...snapshot.settings, musicVolume: clamp(v) };
  persistSettings(settings);
  applyToManager(settings);
  setSnapshot({ settings });
  if (snapshot.unlocked && !settings.muted) {
    void getAudioManager().ensureBaseAmbient();
  }
}

export function setSfxVolume(v: number): void {
  const settings = { ...snapshot.settings, sfxVolume: clamp(v) };
  persistSettings(settings);
  applyToManager(settings);
  setSnapshot({ settings });
}

export function setMuted(muted: boolean): void {
  const settings = { ...snapshot.settings, muted };
  persistSettings(settings);
  applyToManager(settings);
  setSnapshot({ settings });
  if (!muted && snapshot.unlocked) {
    void getAudioManager().ensureBaseAmbient();
    void getAudioManager().startGameplayBed();
  }
}

export function toggleMute(): void {
  setMuted(!snapshot.settings.muted);
}

type AudioStoreApi = AudioStoreSnapshot & {
  hydrate: typeof hydrate;
  unlock: typeof unlock;
  setMasterVolume: typeof setMasterVolume;
  setMusicVolume: typeof setMusicVolume;
  setSfxVolume: typeof setSfxVolume;
  setMuted: typeof setMuted;
  toggleMute: typeof toggleMute;
};

function getStoreApi(): AudioStoreApi {
  return {
    ...snapshot,
    hydrate,
    unlock,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setMuted,
    toggleMute,
  };
}

export function useAudioStore<T>(selector: (state: AudioStoreApi) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getStoreApi()),
    () => selector(getStoreApi()),
  );
}
