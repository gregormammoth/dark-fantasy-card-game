'use client';

import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import { Card } from '@/components/Card';
import { CrownsIcon, ManaOrbIcon, ShieldBadgeIcon } from '@/components/EffectIcons';
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
  const discardEmpty = context.discard.length === 0;

  return (
    <div className="flex items-end gap-[22px] rounded-md border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,rgba(20,15,12,.9),rgba(12,9,8,.94))] px-5 py-4">
      <div className="flex shrink-0 items-end gap-[18px]">
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-[150px] w-[100px]">
            {deckStack.map((i) => (
              <div
                key={i}
                className="absolute flex h-24 w-[70px] items-center justify-center rounded border border-[rgba(201,162,74,.4)] bg-[linear-gradient(150deg,#282011_0%,#151009_100%)] shadow-[0_5px_12px_-8px_#000]"
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
            <span className="font-cinzel text-xl text-[#e0b552]">{context.deck.length}</span>
            <span className="mt-[3px] text-[8px] tracking-[.18em] text-[#8a7f72]">
              {t('exploration.deckLabel')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-24 w-[70px]">
            <div className="absolute flex h-24 w-[70px] items-center justify-center rounded border border-dashed border-[rgba(201,162,74,.3)] bg-[linear-gradient(150deg,#241a1a_0%,#130c0c_100%)] shadow-[0_5px_12px_-8px_#000]">
              <span
                className="font-cinzel text-base"
                style={{ color: discardEmpty ? '#5a5147' : '#c9a24a' }}
              >
                {context.discard.length}
              </span>
            </div>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#8a7f72]">
            {t('exploration.discardLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded border border-[rgba(91,134,196,.35)] bg-[rgba(91,134,196,.08)]">
            <ShieldBadgeIcon className="h-[25px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#cfe0f5]">
              {context.shield}/{context.maxShield}
            </span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#8a7f72]">
            {t('exploration.shieldLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded border border-[rgba(79,164,184,.35)] bg-[rgba(79,164,184,.08)]">
            <ManaOrbIcon className="h-[22px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#cdeef4]">
              {context.mana}/{context.maxMana}
            </span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#8a7f72]">
            {t('exploration.manaLabel')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-[70px] flex-col items-center justify-center gap-1.5 rounded border border-[rgba(224,181,82,.35)] bg-[rgba(201,150,47,.08)]">
            <CrownsIcon className="h-[22px] w-[22px]" />
            <span className="font-cinzel text-sm text-[#f3e2b8]">{context.money ?? 0}</span>
          </div>
          <span className="text-[8px] tracking-[.18em] text-[#8a7f72]">
            {t('exploration.moneyLabel')}
          </span>
        </div>
      </div>

      <div className="w-px self-stretch bg-[rgba(201,162,74,.16)]" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">
            {t('exploration.cardsInHandTurn', { turn: context.turnCount })}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-[.16em] text-[#8a7f72]">
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
              className="rounded-[5px] border border-[rgba(224,181,82,.5)] bg-[linear-gradient(180deg,rgba(224,181,82,.22),rgba(90,68,19,.3))] px-[18px] py-[9px] font-cinzel text-[11px] tracking-[.12em] text-[#f0dfcb] transition hover:brightness-[1.2]"
            >
              {t('exploration.endTurn')}
            </button>
          </div>
        </div>

        <div className="flex h-[150px] items-end overflow-visible">
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
      </div>
    </div>
  );
}
