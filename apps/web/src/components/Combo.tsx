'use client';

import { AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import { COMBO_CAP } from '@dark-fantasy/game-engine';
import { useTranslation } from '@/i18n/useTranslation';
import { Card } from './Card';

interface ComboProps {
  cards: CardInstance[];
  onRemoveCard: (instanceId: string) => void;
  disabled?: boolean;
  comboCap?: number;
}

export function Combo({ cards, onRemoveCard, disabled, comboCap = COMBO_CAP }: ComboProps) {
  const { t } = useTranslation();
  const atCap = cards.length >= comboCap;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">{t('battle.yourCombo')}</span>
        <span
          className={`rounded-[3px] px-1.5 py-0.5 font-cinzel text-[11px] tracking-[.08em] ${
            atCap
              ? 'bg-[#e0b552] text-[#1a1208]'
              : 'border border-[rgba(201,162,74,.35)] text-[#e0b552]'
          }`}
        >
          {t('battle.comboCount', { count: cards.length, cap: comboCap })}
        </span>
        {atCap && (
          <span className="text-[10px] tracking-[.16em] text-[#e0b552]">{t('battle.comboFull')}</span>
        )}
        <span className="text-[11px] text-[#6f6659]">{t('battle.comboResolves')}</span>
      </div>
      <div className="flex min-h-[180px] flex-wrap gap-3.5">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <p className="self-center text-sm text-[#5a5147]">
              {t('battle.addCardsToCombo', { cap: comboCap })}
            </p>
          ) : (
            cards.map((card) => (
              <Card
                key={card.instanceId}
                card={card}
                layoutId={card.instanceId}
                variant="combo"
                disabled={disabled}
                onClick={() => onRemoveCard(card.instanceId)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
