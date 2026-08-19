'use client';

import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import { Card } from '@/components/Card';
import { CrownsIcon, ManaOrbIcon, ShieldBadgeIcon } from '@/components/EffectIcons';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';
import { getCardHeight } from '@/lib/cardTheme';

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
  const discardEmpty = context.discard.length === 0;
  const cardHeight = getCardHeight();

  return (
    <div
      className="flex items-end gap-[22px] rounded-[10px] px-5 py-4"
      style={{ border: '1px solid rgba(232,200,116,.22)', background: 'linear-gradient(180deg,rgba(20,34,56,.92),rgba(10,16,26,.96))', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 26px 50px -24px rgba(0,0,0,.85)' }}
    >
      <div className="flex shrink-0 items-end gap-[18px]">
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-[150px] w-[100px]">
            {deckStack.map((i) => (
              <div
                key={i}
                className="absolute flex h-24 w-[70px] items-center justify-center rounded-[6px] border border-[rgba(232,200,116,.4)] bg-[linear-gradient(150deg,#1c2f4a_0%,#0c1830_100%)] shadow-[0_5px_12px_-8px_#000]"
                style={{
                  left: i * 0.9,
                  top: i * 4.2,
                  transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)`,
                }}
              >
                <div className="h-5 w-5 rotate-45 border border-[rgba(201,162,74,.5)] opacity-80" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className="font-cinzel text-xl text-[#e8c874]">{context.deck.length}</span>
            <span className="mt-[3px] text-[8px] tracking-[.18em] text-[#7d93ad]">
              {t('exploration.deckLabel')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-24 w-[70px]">
            <div className="absolute flex h-24 w-[70px] items-center justify-center rounded-[6px] border border-dashed border-[rgba(232,200,116,.3)] bg-[linear-gradient(150deg,#1a2438_0%,#0a1120_100%)] shadow-[0_5px_12px_-8px_#000]">
              <span
                className="font-cinzel text-base"
                style={{ color: discardEmpty ? '#5a5147' : '#c9a24a' }}
              >
                {context.discard.length}
              </span>
            </div>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#7d93ad]">
            {t('exploration.discardLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded-[6px] border border-[rgba(91,134,196,.4)] bg-[linear-gradient(160deg,rgba(91,134,196,.14),rgba(91,134,196,.04))]" style={{ boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}>
            <ShieldBadgeIcon className="h-[25px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#cfe0f5]">
              {context.shield}/{context.maxShield}
            </span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#7d93ad]">
            {t('exploration.shieldLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded-[6px] border border-[rgba(79,164,184,.4)] bg-[linear-gradient(160deg,rgba(79,164,184,.14),rgba(79,164,184,.04))]" style={{ boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}>
            <ManaOrbIcon className="h-[22px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#cdeef4]">
              {context.mana}/{context.maxMana}
            </span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#7d93ad]">
            {t('exploration.manaLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded-[6px] border border-[rgba(232,200,116,.4)] bg-[linear-gradient(160deg,rgba(232,200,116,.16),rgba(232,200,116,.04))]" style={{ boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 10px 20px -12px rgba(0,0,0,.7)' }}>
            <CrownsIcon className="h-[22px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#f3e2b8]">{context.money ?? 0}</span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#7d93ad]">
            {t('exploration.moneyLabel')}
          </span>
        </div>
      </div>

      <div className="w-px self-stretch bg-[rgba(201,162,74,.16)]" />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="text-[9px] tracking-[.22em] text-[#7d93ad]">
            {t('exploration.cardsInHandTurn', { turn: context.turnCount })}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-[.16em] text-[#7d93ad]">
                {t('exploration.actionsLabel')}
              </span>
              <span className="font-cinzel text-[11px] tracking-[.08em] text-[#e0b552]">
                {context.hand.length}/{context.handSize}
              </span>
              <div className="flex gap-[5px]">
                {Array.from({ length: Math.max(context.handSize, context.hand.length) }, (_, index) => {
                  const remaining = index < context.hand.length;
                  return (
                    <span
                      key={index}
                      className="inline-block h-[9px] w-[9px] rounded-full border border-[rgba(224,181,82,.5)]"
                      style={{
                        background: remaining ? '#e0b552' : 'rgba(224,181,82,.12)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                play('end_turn');
                onEndTurn();
              }}
              className="rounded-[8px] border border-[rgba(232,200,116,.5)] px-5 py-[10px] font-cinzel text-[11px] tracking-[.12em] text-[#fff6e0] transition hover:brightness-[1.2] hover:-translate-y-[2px]"
              style={{ background: 'linear-gradient(180deg,rgba(232,200,116,.28),rgba(90,68,19,.35))', boxShadow: '0 1px 0 rgba(255,255,255,.1) inset,0 12px 22px -12px rgba(0,0,0,.75)' }}
            >
              {t('exploration.endTurn')}
            </button>
          </div>
        </div>

        <div
          className="relative z-10 -mt-5 flex items-end overflow-x-auto pt-8"
          style={{ minHeight: cardHeight + 32 }}
        >
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
                  showTooltip={false}
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
      </div>
    </div>
  );
}
