'use client';

import { Layers, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface ClaimBadgeProps {
  kind: 'level' | 'card';
  count: number;
  accent?: string;
}

export function ClaimBadge({ kind, count, accent }: ClaimBadgeProps) {
  const { t } = useTranslation();
  const isLevel = kind === 'level';
  const label = isLevel
    ? t('exploration.unclaimedSkills', { count })
    : t('exploration.unclaimedCards', { count });

  return (
    <span
      aria-label={label}
      className={
        isLevel
          ? 'claim-badge claim-badge-level inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full bg-[#e0b552] px-1.5 font-cinzel text-[10px] leading-none text-[#1a1208]'
          : 'claim-badge claim-badge-card inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-[4px] border border-[rgba(232,221,207,.42)] bg-[rgba(12,10,9,.78)] px-1.5 font-cinzel text-[9px] leading-none text-[#d8cbb8]'
      }
      style={
        !isLevel && accent
          ? { borderColor: `${accent}aa`, color: accent }
          : undefined
      }
    >
      {isLevel ? (
        <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2.4} aria-hidden />
      ) : (
        <Layers className="h-2.5 w-2.5 shrink-0" strokeWidth={2.2} aria-hidden />
      )}
      <span className="leading-none">{count}</span>
    </span>
  );
}
