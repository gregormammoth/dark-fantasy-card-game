'use client';

import { useEffect } from 'react';
import { getAudioManager } from '@/audio/AudioManager';
import { useAudioStore } from '@/audio/audioStore';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAudioStore((s) => s.hydrate);
  const unlocked = useAudioStore((s) => s.unlocked);
  const unlock = useAudioStore((s) => s.unlock);

  useEffect(() => {
    hydrate();
    if (process.env.NODE_ENV !== 'production') {
      getAudioManager().setDebug(true);
    }
  }, [hydrate]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      void getAudioManager().resume();
    };
    const onFocus = () => {
      void getAudioManager().resume();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (unlocked) {
      return;
    }

    const tryUnlock = () => {
      void unlock();
    };

    window.addEventListener('pointerdown', tryUnlock, { passive: true });
    window.addEventListener('touchstart', tryUnlock, { passive: true });
    window.addEventListener('click', tryUnlock);
    window.addEventListener('keydown', tryUnlock);

    return () => {
      window.removeEventListener('pointerdown', tryUnlock);
      window.removeEventListener('touchstart', tryUnlock);
      window.removeEventListener('click', tryUnlock);
      window.removeEventListener('keydown', tryUnlock);
    };
  }, [unlocked, unlock]);

  return <>{children}</>;
}
