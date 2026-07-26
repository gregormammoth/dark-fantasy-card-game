import { useEffect, useRef } from 'react';
import { getAudioManager } from './AudioManager';
import { useAudioStore } from './audioStore';

export function useGameOverAudio(result: 'victory' | 'defeat' | null): void {
  const unlocked = useAudioStore((s) => s.unlocked);
  const muted = useAudioStore((s) => s.settings.muted);
  const playedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!result) {
      playedFor.current = null;
      return;
    }
    if (!unlocked || muted) return;
    if (playedFor.current === result) return;
    playedFor.current = result;

    const manager = getAudioManager();
    manager.enterGameOverMode();
    manager.fadeOutGameplay(1600);

    const timer = window.setTimeout(() => {
      manager.playGameOverSuite(result === 'victory' ? 'victory' : 'failure');
    }, 500);

    return () => window.clearTimeout(timer);
  }, [result, unlocked, muted]);
}
