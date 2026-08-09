'use client';

import type { ReactNode } from 'react';
import type { ComboPreview } from '@dark-fantasy/shared/types/comboPreview';
import { isComboPreviewEmpty } from '@dark-fantasy/shared/types/comboPreview';
import { useTranslation } from '@/i18n/useTranslation';
import { AttackIcon, BarrierIcon, PierceIcon, PoisonIcon, ShieldIcon } from './EffectIcons';

interface ComboPreviewPanelProps {
  preview: ComboPreview | null;
  comboSize: number;
  comboCap?: number;
  enemyHealth: number;
  playerShield: number;
  playerMaxShield: number;
}

export function ComboPreviewPanel({
  preview,
  comboSize,
  comboCap,
  enemyHealth,
  playerShield,
  playerMaxShield,
}: ComboPreviewPanelProps) {
  const { t } = useTranslation();
  const sizeLabel =
    comboCap != null
      ? t('battle.comboCount', { count: comboSize, cap: comboCap })
      : comboSize === 1
        ? t('common.card', { count: comboSize })
        : t('common.cards', { count: comboSize });

  if (!preview || isComboPreviewEmpty(preview)) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-[rgba(201,162,74,.14)] bg-gradient-to-b from-[rgba(20,15,12,.7)] to-[rgba(12,9,8,.7)] p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">{t('battle.ifYouEndTurn')}</span>
          {comboCap != null && (
            <span className="font-cinzel text-[10px] tracking-[.08em] text-[#6f6659]">
              {t('battle.comboCount', { count: comboSize, cap: comboCap })}
            </span>
          )}
        </div>
        <p className="text-sm text-[#5a5147]">{t('battle.addCardsForPreview')}</p>
      </div>
    );
  }

  const enemyAfter = Math.max(0, enemyHealth - preview.damageToEnemy);
  const shieldAfter = Math.min(playerMaxShield, playerShield + preview.shieldGain);

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[rgba(201,162,74,.24)] bg-gradient-to-b from-[rgba(20,15,12,.9)] to-[rgba(12,9,8,.9)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">{t('battle.ifYouEndTurn')}</span>
        <span className="font-cinzel text-[10px] tracking-[.08em] text-[#6f6659]">{sizeLabel}</span>
      </div>

      {preview.totalDamageToEnemy > 0 && (
        <PreviewRow
          tone="damage"
          icon={<AttackIcon className="inline-block h-[22px] w-5 shrink-0" />}
          title={
            preview.damageToEnemy > 0
              ? t('battle.cardsBurnFromEnemy', { count: preview.damageToEnemy })
              : t('battle.damageOnly', { damage: preview.totalDamageToEnemy })
          }
          detail={
            preview.enemyShieldBlocked > 0
              ? t('battle.damageMinusShield', {
                  damage: preview.totalDamageToEnemy,
                  blocked: preview.enemyShieldBlocked,
                })
              : t('battle.damageOnly', { damage: preview.totalDamageToEnemy })
          }
        />
      )}

      {preview.ignoresShield && (
        <PreviewRow
          tone="pierce"
          icon={<PierceIcon className="inline-block h-4 w-4 shrink-0" />}
          title={t('battle.ignoresShield')}
          detail={t('battle.piercesArmor')}
        />
      )}

      {preview.poison && (
        <PreviewRow
          tone="poison"
          icon={<PoisonIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title={t('battle.poisonPerTurn', {
            damage: preview.poison.damagePerTurn,
            turns: preview.poison.turns,
          })}
          detail={t('battle.poisonBypass')}
        />
      )}

      {preview.shieldGain > 0 && (
        <PreviewRow
          tone="shield"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title={t('battle.gainShield', { amount: preview.shieldGain })}
          detail={t('battle.shieldNowAt', { current: shieldAfter, max: playerMaxShield })}
        />
      )}

      {preview.barrierGain > 0 && (
        <PreviewRow
          tone="barrier"
          icon={<BarrierIcon className="inline-block h-[13px] w-3.5 shrink-0" />}
          title={t('battle.gainBarrier', { amount: preview.barrierGain })}
          detail={t('battle.barrierExpires')}
        />
      )}

      {preview.damageReductionPercent !== undefined && preview.damageReductionPercent > 0 && (
        <PreviewRow
          tone="reduced"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" style={{ background: '#6fae5a' }} />}
          title={t('battle.damageReduction', { percent: preview.damageReductionPercent })}
          detail={t('battle.thisRoundOnly')}
        />
      )}

      {preview.cardsRecovered > 0 && (
        <PreviewRow
          tone="heal"
          icon={<span className="shrink-0 text-[#c9a24a]">↩</span>}
          title={t('battle.recoverCards', { count: preview.cardsRecovered })}
          detail={t('battle.fromDiscardToHand')}
        />
      )}

      {preview.damageToEnemy > 0 && (
        <>
          <div className="my-0.5 h-px bg-[rgba(201,162,74,.16)]" />
          <div className="flex items-center justify-between text-xs text-[#b7ab9c]">
            <span>{t('battle.enemyDeck')}</span>
            <span>
              <b className="font-cinzel text-[15px] text-[#f0b3aa]">{enemyHealth}</b>
              <span className="mx-1.5 text-[#6f6659]">→</span>
              <b className="font-cinzel text-[15px] text-[#f0b3aa]">{enemyAfter}</b>{' '}
              {t('battle.deckAsHealth')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewRow({
  icon,
  title,
  detail,
  tone,
}: {
  icon: ReactNode;
  title: ReactNode;
  detail: string;
  tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'heal';
}) {
  const styles = {
    damage: {
      bg: 'rgba(224,82,74,.1)',
      border: '#e0524a',
      title: '#ffd9d2',
      detail: '#a98',
    },
    pierce: {
      bg: 'rgba(201,162,74,.08)',
      border: '#c9a24a',
      title: '#ecd9b0',
      detail: '#8a7f72',
    },
    poison: {
      bg: 'rgba(111,174,90,.1)',
      border: '#6fae5a',
      title: '#c8ecb8',
      detail: '#7a8a6a',
    },
    shield: {
      bg: 'rgba(91,134,196,.1)',
      border: '#5b86c4',
      title: '#cfe0f5',
      detail: '#7f92ac',
    },
    barrier: {
      bg: 'rgba(154,122,224,.1)',
      border: '#9a7ae0',
      title: '#ddd0f5',
      detail: '#8a7f9a',
    },
    reduced: {
      bg: 'rgba(111,174,90,.08)',
      border: '#6fae5a',
      title: '#c8ecb8',
      detail: '#7a8a6a',
    },
    heal: {
      bg: 'rgba(201,162,74,.08)',
      border: '#c9a24a',
      title: '#ecd9b0',
      detail: '#8a7f72',
    },
  }[tone];

  return (
    <div
      className="flex items-center gap-3 rounded-[9px] px-2.5 py-2"
      style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}` }}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm" style={{ color: styles.title }}>
          {title}
        </div>
        <div className="text-[10px]" style={{ color: styles.detail }}>
          {detail}
        </div>
      </div>
    </div>
  );
}
