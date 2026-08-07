'use client';

import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import { Card } from '@/components/Card';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';

interface ExplorationHandBarProps {
  context: ExplorationContext;
  onSelectCard: (cardInstanceId: string) => void;
  onEndTurn: () => void;
}

export function ExplorationHandBar({
  context,
  onSelectCard,
  onEndTurn,
}: ExplorationHandBarProps) {
  const { t } = useTranslation();
  const { play } = useAudio();
  const deckStack = [0, 1, 2, 3, 4, 5];
  const actionsUsed = Math.max(0, context.maxActions - context.actionsRemaining);
  const encounterSoon = context.actionsRemaining <= 1;

  return (
    <div className="flex items-end gap-5 rounded-[14px] border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,rgba(20,15,12,.9),rgba(12,9,8,.94))] px-5 py-4">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative h-[150px] w-[130px]">
          {deckStack.map((i) => (
            <div
              key={i}
              className="absolute flex h-[120px] w-[88px] items-center justify-center rounded-[9px] border border-[rgba(201,162,74,.4)] bg-[linear-gradient(150deg,#282011_0%,#151009_100%)] shadow-[0_5px_12px_-8px_#000]"
              style={{
                left: i * 0.9,
                top: i * 4.2,
                transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)`,
              }}
            >
              <div className="h-[26px] w-[26px] rotate-45 border border-[rgba(201,162,74,.5)] opacity-80" />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className="font-cinzel text-[24px] text-[#e0b552]">{context.deck.length}</span>
          <span className="mt-1 text-[9px] tracking-[.2em] text-[#8a7f72]">{t('exploration.yourDeck')}</span>
        </div>
      </div>

      <div className="w-px self-stretch bg-[rgba(201,162,74,.16)]" />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">{t('exploration.cardsInHand')}</span>
          <div className="flex items-center gap-3 text-[9px] tracking-[.18em] text-[#8a7f72]">
            <span>{t('exploration.discard', { count: context.discard.length })}</span>
            <span className="text-[#5b86c4]">
              {t('exploration.shield', {
                current: context.shield,
                max: context.maxShield,
              })}
            </span>
          </div>
        </div>
        <div className="flex h-[184px] items-end overflow-visible pb-1">
          {context.hand.map((card, index) => {
            const selected = context.selectedCardInstanceId === card.instanceId;
            return (
              <div
                key={card.instanceId}
                className={`shrink-0 ${selected ? 'relative z-30 -translate-y-3' : ''}`}
              >
                <Card
                  card={card}
                  variant="hand"
                  handIndex={index}
                  handTotal={context.hand.length}
                  onClick={() => onSelectCard(card.instanceId)}
                />
              </div>
            );
          })}
          {context.hand.length === 0 && (
            <span className="pb-8 text-[13px] text-[#8a7f72]">{t('exploration.handEmpty')}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[9px] tracking-[.16em]">
            <span className={encounterSoon ? 'text-[#f0b3aa]' : 'text-[#8a7f72]'}>
              {encounterSoon
                ? t('exploration.encounterImminent')
                : t('exploration.actionsUntilEncounter', { count: context.actionsRemaining })}
            </span>
            <span className="text-[#6f6659]">
              {t('exploration.actionsSpent', {
                used: actionsUsed,
                max: context.maxActions,
              })}
            </span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-[rgba(201,162,74,.12)]">
            {Array.from({ length: context.maxActions }, (_, index) => {
              const spent = index < actionsUsed;
              const next = index === actionsUsed && context.actionsRemaining > 0;
              return (
                <div
                  key={index}
                  className="flex-1 border-r border-[rgba(10,8,7,.65)] last:border-r-0"
                  style={{
                    background: spent
                      ? 'rgba(224,181,82,.55)'
                      : next
                        ? 'rgba(240,179,170,.35)'
                        : 'transparent',
                  }}
                />
              );
            })}
          </div>
          <p className="text-[10px] leading-snug text-[#6f6659]">{t('exploration.riskHint')}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="text-center">
          <div className="font-cinzel text-[28px] text-[#e0b552]">{context.actionsRemaining}</div>
          <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('exploration.actionsLeft')}</div>
        </div>
        <div className="rounded-[8px] border border-[rgba(91,134,196,.35)] bg-[rgba(91,134,196,.1)] px-3 py-1.5 text-center">
          <div className="font-cinzel text-[16px] text-[#cfe0f5]">
            {context.shield}/{context.maxShield}
          </div>
          <div className="text-[8px] tracking-[.18em] text-[#7f92ac]">{t('exploration.shieldLabel')}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            play('end_turn');
            onEndTurn();
          }}
          className="rounded-[10px] border border-[rgba(201,162,74,.45)] bg-[rgba(224,181,82,.12)] px-5 py-3 font-cinzel text-[12px] tracking-[.16em] text-[#e0b552] transition hover:border-[rgba(201,162,74,.8)] hover:bg-[rgba(224,181,82,.2)]"
        >
          {t('exploration.endTurn')}
        </button>
      </div>
    </div>
  );
}
