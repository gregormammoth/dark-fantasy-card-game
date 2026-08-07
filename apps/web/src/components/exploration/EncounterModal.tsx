'use client';

import { useEffect } from 'react';
import type { PendingEncounter } from '@dark-fantasy/shared/types/exploration';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';

interface EncounterModalProps {
  encounter: PendingEncounter;
  onDismiss: () => void;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function EncounterModal({ encounter, onDismiss }: EncounterModalProps) {
  const { t } = useTranslation();
  const { play } = useAudio();
  const results = encounter.results;

  useEffect(() => {
    play('modal_open');
    play('fate_roll');
    play('encounter_sting');
  }, [play, encounter.id]);

  const shieldDelta = results ? results.shieldAfter - results.shieldBefore : 0;
  const maxShieldDelta = results ? results.maxShieldAfter - results.maxShieldBefore : 0;
  const discardCount = results?.discarded.length ?? 0;
  const recoverCount = results?.recovered.length ?? 0;
  const addCount = results?.added.length ?? 0;
  const hasImpact =
    !!results &&
    (discardCount > 0 ||
      recoverCount > 0 ||
      addCount > 0 ||
      !!results.shuffled ||
      shieldDelta !== 0 ||
      maxShieldDelta !== 0);

  const summaryChips: Array<{ key: string; label: string; tone: 'danger' | 'good' | 'warn' }> = [];
  if (shieldDelta !== 0) {
    summaryChips.push({
      key: 'shield',
      label: t('encounter.chipShield', { delta: signed(shieldDelta) }),
      tone: shieldDelta > 0 ? 'good' : 'danger',
    });
  }
  if (maxShieldDelta !== 0) {
    summaryChips.push({
      key: 'maxShield',
      label: t('encounter.chipMaxShield', { delta: signed(maxShieldDelta) }),
      tone: maxShieldDelta > 0 ? 'good' : 'danger',
    });
  }
  if (discardCount > 0) {
    summaryChips.push({
      key: 'discard',
      label: t('encounter.chipDiscard', { delta: signed(-discardCount) }),
      tone: 'danger',
    });
  }
  if (recoverCount > 0) {
    summaryChips.push({
      key: 'recover',
      label: t('encounter.chipRecover', { delta: signed(recoverCount) }),
      tone: 'good',
    });
  }
  if (addCount > 0) {
    summaryChips.push({
      key: 'add',
      label: t('encounter.chipAdd', { delta: signed(addCount) }),
      tone: 'good',
    });
  }
  if (results?.shuffled) {
    summaryChips.push({
      key: 'shuffle',
      label: t('encounter.chipShuffle'),
      tone: 'warn',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,4,3,.72)] p-6 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[14px] border border-[rgba(201,162,74,.35)] bg-[linear-gradient(180deg,#1a1410,#100c0a)] p-6 shadow-[0_30px_80px_-20px_#000]">
        <div className="text-[10px] tracking-[.28em] text-[#c9a24a]">{t('encounter.title')}</div>
        <h2 className="mt-2 font-cinzel text-[26px] text-[#f3ead8]">{encounter.title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#c7bba9]">{encounter.description}</p>

        {hasImpact && (
          <div className="mt-5 flex flex-col gap-3 rounded-[10px] border border-[rgba(201,162,74,.2)] bg-[rgba(0,0,0,.28)] p-3">
            <div className="text-[9px] tracking-[.22em] text-[#8a7f72]">{t('encounter.results')}</div>

            {summaryChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {summaryChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="rounded-[7px] border px-2.5 py-1 font-cinzel text-[13px] tracking-[.04em]"
                    style={{
                      color:
                        chip.tone === 'danger'
                          ? '#f0b3aa'
                          : chip.tone === 'good'
                            ? '#c8ecb8'
                            : '#ecd9b0',
                      borderColor:
                        chip.tone === 'danger'
                          ? 'rgba(224,82,74,.45)'
                          : chip.tone === 'good'
                            ? 'rgba(111,174,90,.45)'
                            : 'rgba(201,162,74,.4)',
                      background:
                        chip.tone === 'danger'
                          ? 'rgba(224,82,74,.12)'
                          : chip.tone === 'good'
                            ? 'rgba(111,174,90,.12)'
                            : 'rgba(201,162,74,.1)',
                    }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {shieldDelta !== 0 && results && (
                <DetailRow
                  tone={shieldDelta > 0 ? 'good' : 'danger'}
                  delta={signed(shieldDelta)}
                  label={t('encounter.detailShield', {
                    before: results.shieldBefore,
                    after: results.shieldAfter,
                    max: results.maxShieldAfter,
                  })}
                />
              )}
              {maxShieldDelta !== 0 && results && (
                <DetailRow
                  tone={maxShieldDelta > 0 ? 'good' : 'danger'}
                  delta={signed(maxShieldDelta)}
                  label={t('encounter.detailMaxShield', {
                    before: results.maxShieldBefore,
                    after: results.maxShieldAfter,
                  })}
                />
              )}
              {results?.discarded.map((card) => (
                <DetailRow
                  key={`d-${card.instanceId}`}
                  tone="danger"
                  delta="-1"
                  label={t('encounter.detailDiscard', { name: card.name })}
                />
              ))}
              {results?.recovered.map((card) => (
                <DetailRow
                  key={`r-${card.instanceId}`}
                  tone="good"
                  delta="+1"
                  label={t('encounter.detailRecover', { name: card.name })}
                />
              ))}
              {results?.added.map((card) => (
                <DetailRow
                  key={`a-${card.instanceId}`}
                  tone="good"
                  delta="+1"
                  label={t('encounter.detailAdd', { name: card.name })}
                />
              ))}
              {results?.shuffled && (
                <DetailRow
                  tone="warn"
                  delta="~"
                  label={t('encounter.detailShuffle', { pile: results.shuffled })}
                />
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-[10px] border border-[rgba(201,162,74,.5)] bg-[rgba(224,181,82,.14)] py-3 font-cinzel text-[13px] tracking-[.14em] text-[#e0b552] transition hover:brightness-110"
        >
          {t('encounter.dismiss')}
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  delta,
  label,
  tone,
}: {
  delta: string;
  label: string;
  tone: 'danger' | 'good' | 'warn';
}) {
  const color =
    tone === 'danger' ? '#f0b3aa' : tone === 'good' ? '#c8ecb8' : '#ecd9b0';
  return (
    <div className="flex items-baseline gap-2 text-[13px]" style={{ color }}>
      <span className="w-8 shrink-0 font-cinzel text-[14px]">{delta}</span>
      <span className="min-w-0 text-[#c7bba9]">{label}</span>
    </div>
  );
}
