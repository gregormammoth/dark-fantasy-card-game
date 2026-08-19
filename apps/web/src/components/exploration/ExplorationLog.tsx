'use client';

import type { ExplorationLogEntry } from '@dark-fantasy/shared/types/exploration';
import { useTranslation } from '@/i18n/useTranslation';
import { translateExplorationLogEntry } from '@/lib/explorationText';

interface ExplorationLogProps {
  entries: ExplorationLogEntry[];
}

const kindColor: Record<ExplorationLogEntry['kind'], string> = {
  system: 'text-[#7d93ad]',
  action: 'text-[#eef3f8]',
  encounter: 'text-[#e8c874]',
  move: 'text-[#4ac0ff]',
  loot: 'text-[#5fd68a]',
  danger: 'text-[#ff8f85]',
};

export function ExplorationLog({ entries }: ExplorationLogProps) {
  const { t } = useTranslation();
  const recent = entries.slice(-8).reverse();
  return (
    <div
      className="rounded-[10px] p-3"
      style={{ border: '1px solid rgba(232,200,116,.22)', background: 'linear-gradient(180deg,rgba(20,34,56,.92),rgba(10,16,26,.96))', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 26px 50px -24px rgba(0,0,0,.85)' }}
    >
      <div className="mb-2 text-[9px] tracking-[.22em] text-[#7d93ad]">{t('exploration.recentEvents')}</div>
      <div className="flex max-h-[140px] flex-col gap-1.5 overflow-y-auto">
        {recent.map((entry, index) => (
          <div key={`${entry.id}-${index}`} className={`text-[12px] leading-snug ${kindColor[entry.kind]}`}>
            {translateExplorationLogEntry(entry, t)}
          </div>
        ))}
        {recent.length === 0 && (
          <div className="text-[12px] text-[#7d93ad]">{t('exploration.noEventsYet')}</div>
        )}
      </div>
    </div>
  );
}
