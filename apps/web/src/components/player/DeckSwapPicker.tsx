'use client';

import { useEffect } from 'react';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { Card } from '@/components/Card';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';

interface DeckSwapPickerProps {
  incomingName: string;
  deckCards: CardDefinition[];
  onPick: (cardId: string) => void;
  onCancel: () => void;
}

function asInstance(definition: CardDefinition): CardInstance {
  return { instanceId: definition.id, definition };
}

export function DeckSwapPicker({
  incomingName,
  deckCards,
  onPick,
  onCancel,
}: DeckSwapPickerProps) {
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
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(6,5,4,.86)] backdrop-blur-[3px]">
      <div className="flex min-h-full flex-col items-center justify-center gap-[26px] px-6 py-10">
        <div className="text-center">
          <span className="text-[10px] tracking-[.24em] text-[#e0b552]">
            {t('deckSwap.eyebrow')}
          </span>
          <div className="mt-1.5 font-cinzel text-xl text-[#f3ead8]">
            {t('deckSwap.title')}
          </div>
          <p className="mt-1.5 text-xs text-[#a99]">
            {t('deckSwap.subtitle', { name: incomingName })}
          </p>
        </div>

        <div className="flex max-w-[92vw] flex-wrap items-end justify-center gap-4 overflow-visible">
          {deckCards.map((definition) => (
            <Card
              key={definition.id}
              card={asInstance(definition)}
              variant="collection"
              onClick={() => onPick(definition.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-[5px] border border-[rgba(201,162,74,.3)] bg-transparent px-[22px] py-[11px] font-cinzel text-[11px] tracking-[.12em] text-[#c9a24a] transition hover:border-[rgba(201,162,74,.7)]"
        >
          {t('deckSwap.cancel')}
        </button>
      </div>
    </div>
  );
}
