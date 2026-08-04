import { useEffect, useRef, useState } from 'react';
import { AudioSettings } from '@/components/AudioSettings';

interface SettingsMenuProps {
  runSeed: number;
  onRunSeedChange: (seed: number) => void;
}

export function SettingsMenu({ runSeed, onRunSeedChange }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [seedText, setSeedText] = useState(String(runSeed));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeedText(String(runSeed));
  }, [runSeed]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function applySeed() {
    const parsed = Number(seedText.trim());
    if (!Number.isFinite(parsed)) {
      return;
    }
    onRunSeedChange(parsed);
  }

  function randomizeSeed() {
    const next = Date.now() >>> 0;
    setSeedText(String(next));
    onRunSeedChange(next);
  }

  return (
    <div ref={rootRef} className="fixed right-4 top-4 z-[70]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Settings"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.9)] text-[#e0b552] transition hover:border-[rgba(201,162,74,.7)] hover:text-[#f0c979]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-12 flex w-[260px] flex-col gap-3 rounded-[12px] border border-[rgba(201,162,74,.28)] bg-[rgba(12,9,8,.96)] p-3 shadow-[0_24px_60px_-14px_#000]">
          <AudioSettings />
          <div className="border-t border-[rgba(201,162,74,.16)] pt-3">
            <span className="text-[10px] tracking-[.2em] text-[#c9a24a]">RUN SEED</span>
            <p className="mt-1 text-[11px] leading-snug text-[#8a7f72]">
              Same seed → same draws and fights. Applies on the next prison start.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={seedText}
                onChange={(event) => setSeedText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    applySeed();
                  }
                }}
                className="min-w-0 flex-1 rounded-md border border-[rgba(201,162,74,.28)] bg-[#1a1512] px-2 py-1.5 font-mono text-[12px] text-[#e8ddcf] outline-none focus:border-[rgba(201,162,74,.6)]"
              />
              <button
                type="button"
                onClick={applySeed}
                className="rounded-md border border-[rgba(201,162,74,.4)] px-2.5 py-1.5 font-cinzel text-[10px] tracking-wider text-[#e0b552] transition hover:brightness-110"
              >
                SET
              </button>
            </div>
            <button
              type="button"
              onClick={randomizeSeed}
              className="mt-2 w-full rounded-md border border-[rgba(201,162,74,.2)] px-2 py-1.5 text-[10px] tracking-wider text-[#8a7f72] transition hover:text-[#c9a24a]"
            >
              RANDOMIZE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
