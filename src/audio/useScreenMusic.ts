import { useEffect } from 'react';
import { getAudioManager } from './AudioManager';
import { useAudioStore } from './audioStore';
import type { MusicScreen } from './types';

export function useScreenMusic(screen: MusicScreen): void {
  const unlocked = useAudioStore((s) => s.unlocked);
  const muted = useAudioStore((s) => s.settings.muted);

  useEffect(() => {
    if (!unlocked || muted) return;
    void getAudioManager().setMusicScreen(screen);
  }, [screen, unlocked, muted]);
}
