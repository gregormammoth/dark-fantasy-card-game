'use client';

import { useEffect, useRef, useState } from 'react';
import type { BattleLogEntry } from '@dark-fantasy/shared/types/log';
import { useTranslation } from '@/i18n/useTranslation';

interface TopBarProps {
  turnLabel: string;
  logEntries: BattleLogEntry[];
  emptyLogLabel?: string;
  roundCount?: number;
}

const kindColors: Record<BattleLogEntry['kind'], string> = {
  system: '#8a7f72',
  draw: '#7fb0ec',
  combo: '#c9a24a',
  play: '#c89cf0',
  damage: '#e0524a',
  shield: '#5b86c4',
  barrier: '#9a7ae0',
  poison: '#6fae5a',
  heal: '#7ecb6a',
  victory: '#e0b552',
  defeat: '#e0524a',
};

export function TopBar({ turnLabel, logEntries, emptyLogLabel, roundCount = 0 }: TopBarProps) {
  const { t } = useTranslation();
  const emptyLabel = emptyLogLabel ?? t('battle.battleBegins');
  const [logOpen, setLogOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const logSnippet =
    logEntries.length > 0
      ? logEntries
          .slice(-3)
          .map((entry) => entry.message)
          .join(' · ')
      : emptyLabel;

  useEffect(() => {
    if (!logOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!popupRef.current?.contains(event.target as Node)) {
        setLogOpen(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [logOpen]);

  return (
    <div className="flex items-center justify-between gap-5">
      <span className="shrink-0 text-[11px] tracking-[.24em] whitespace-nowrap text-[#c9a24a]">
        ◆ {turnLabel}
      </span>
      <span className="font-cinzel text-[15px] tracking-[.36em] text-[#b8917f]">
        {t('battle.duelTitle').replace(/\s+/g, '\u00a0')}
      </span>
      <div ref={popupRef} className="relative">
        <button
          type="button"
          onClick={() => setLogOpen((current) => !current)}
          className="flex items-center gap-2 rounded-[5px] border border-[rgba(201,162,74,.2)] px-[10px] py-[5px] text-[11px] tracking-[.02em] text-[#8a7f72] transition hover:border-[rgba(201,162,74,.5)] hover:text-[#c9a24a]"
          title={logSnippet}
        >
          <span className="text-[10px] tracking-[.18em] text-[#c9a24a]">{t('battle.log')}</span>
          <span className="max-w-[280px] truncate whitespace-nowrap">{logSnippet}</span>
          <span className="text-[9px]">{logOpen ? '▲' : '▼'}</span>
        </button>
        {logOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 z-[80] w-[380px] rounded-[6px] border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#181310,#100c0b)] p-4 shadow-[0_20px_50px_-14px_#000]">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">{t('battle.combatLog')}</span>
              <span className="text-[10px] text-[#6f6659]">{t('battle.round', { count: roundCount })}</span>
            </div>
            <div className="flex max-h-[320px] flex-col gap-[9px] overflow-y-auto pr-1.5">
              {[...logEntries].reverse().map((entry) => (
                <div key={entry.id} className="flex items-start gap-[9px] text-[12px] leading-[1.4] text-[#b7ab9c]">
                  <span
                    className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: kindColors[entry.kind] }}
                  />
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
