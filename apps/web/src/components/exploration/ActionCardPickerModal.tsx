'use client';

import { useEffect } from 'react';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import { Card } from '@/components/Card';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';

interface ActionCardPickerModalProps {
  actionLabel: string;
  hand: CardInstance[];
  onPick: (cardInstanceId: string) => void;
  onCancel: () => void;
}

export function ActionCardPickerModal({
  actionLabel,
  hand,
  onPick,
  onCancel,
}: ActionCardPickerModalProps) {
  const { t } = useTranslation();
  const { play } = useAudio();

  useEffect(() => {
    play('modal_open');
  }, [play]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-[26px] bg-[rgba(6,5,4,.86)] p-6 backdrop-blur-[3px]">
      <div className="text-center">
        <span className="text-[10px] tracking-[.24em] text-[#e0b552]">
          {t('actionPicker.eyebrow')}
        </span>
        <div className="mt-1.5 font-cinzel text-xl text-[#f3ead8]">
          {t('actionPicker.title')}
        </div>
        <p className="mt-1.5 text-xs text-[#a99]">
          {t('actionPicker.subtitle', { action: actionLabel })}
        </p>
      </div>

      {hand.length > 0 ? (
        <div className="flex max-w-[92vw] flex-wrap items-end justify-center gap-4">
          {hand.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              variant="collection"
              onClick={() => onPick(card.instanceId)}
            />
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#8a7f72]">{t('actionPicker.handEmpty')}</p>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="rounded-[5px] border border-[rgba(201,162,74,.3)] bg-transparent px-[22px] py-[11px] font-cinzel text-[11px] tracking-[.12em] text-[#c9a24a] transition hover:border-[rgba(201,162,74,.7)]"
      >
        {t('actionPicker.cancel')}
      </button>
    </div>
  );
}
