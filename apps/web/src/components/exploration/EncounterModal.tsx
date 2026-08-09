'use client';

import { useEffect, useMemo } from 'react';
import type { PendingEncounter } from '@dark-fantasy/shared/types/exploration';
import { useAudio } from '@/audio/useAudio';
import { useTranslation } from '@/i18n/useTranslation';

interface EncounterModalProps {
  encounter: PendingEncounter;
  onDismiss: () => void;
}

interface ChangeRow {
  key: string;
  label: string;
  sub?: string;
  color: string;
  bg: string;
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

  const changes = useMemo(() => {
    if (!results) {
      return [] as ChangeRow[];
    }
    const rows: ChangeRow[] = [];
    const shieldDelta = results.shieldAfter - results.shieldBefore;
    const manaDelta = results.manaAfter - results.manaBefore;

    if (shieldDelta !== 0) {
      rows.push({
        key: 'shield',
        label: t('encounter.changeShield', { delta: signed(shieldDelta) }),
        sub: t('encounter.changeShieldNow', {
          current: results.shieldAfter,
          max: results.maxShieldAfter,
        }),
        color: '#5b86c4',
        bg: 'rgba(91,134,196,.1)',
      });
    }
    if (manaDelta !== 0) {
      rows.push({
        key: 'mana',
        label: t('encounter.changeMana', { delta: signed(manaDelta) }),
        sub: t('encounter.changeManaNow', {
          current: results.manaAfter,
          max: results.maxManaAfter,
        }),
        color: '#6ec8e0',
        bg: 'rgba(110,200,224,.1)',
      });
    }
    for (const card of results.discarded) {
      rows.push({
        key: `d-${card.instanceId}`,
        label: t('encounter.changeDiscarded', { name: card.name }),
        sub: t('encounter.changeDiscardSub'),
        color: '#d6443a',
        bg: 'rgba(214,68,58,.1)',
      });
    }
    for (const card of results.recovered) {
      rows.push({
        key: `r-${card.instanceId}`,
        label: t('encounter.changeRecovered', { name: card.name }),
        sub: t('encounter.changeRecoverSub'),
        color: '#4a965e',
        bg: 'rgba(74,150,94,.1)',
      });
    }
    for (const card of results.added) {
      rows.push({
        key: `a-${card.instanceId}`,
        label: t('encounter.changeAdded', { name: card.name }),
        sub: t('encounter.changeAddedSub'),
        color: '#e0b552',
        bg: 'rgba(224,181,82,.08)',
      });
    }
    if (results.shuffled) {
      const piles =
        results.shuffled === 'all'
          ? (['hand', 'deck', 'discard'] as const)
          : ([results.shuffled] as const);
      for (const pile of piles) {
        const key =
          pile === 'hand'
            ? 'encounter.changeShuffledHand'
            : pile === 'deck'
              ? 'encounter.changeShuffledDeck'
              : 'encounter.changeShuffledDiscard';
        rows.push({
          key: `shuffle-${pile}`,
          label: t(key),
          color: '#8a7f72',
          bg: 'rgba(255,255,255,.04)',
        });
      }
    }
    return rows;
  }, [results, t]);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[rgba(6,5,4,.78)] p-6 backdrop-blur-[3px]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-md border border-[rgba(201,162,74,.4)] bg-[linear-gradient(180deg,#1a1512,#100d0b)] shadow-[0_40px_90px_-20px_#000]">
        <div className="border-b border-[rgba(201,162,74,.22)] bg-[linear-gradient(180deg,rgba(201,162,74,.14),transparent)] px-6 py-5">
          <span className="text-[10px] tracking-[.22em] text-[#e0b552]">{t('encounter.title')}</span>
          <div className="mt-[3px] font-cinzel text-[19px] text-[#f3ead8]">{encounter.title}</div>
          <p className="mt-2 text-xs leading-[1.55] text-[#c7bba9] italic">{encounter.description}</p>
        </div>

        {changes.length > 0 && (
          <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto px-6 py-4">
            {changes.map((change) => (
              <div
                key={change.key}
                className="flex items-center gap-3 rounded-[5px] px-[11px] py-[9px]"
                style={{
                  background: change.bg,
                  borderLeft: `3px solid ${change.color}`,
                }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: change.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[#e8ddcf]">{change.label}</div>
                  {change.sub && (
                    <div className="mt-0.5 text-[10px] text-[#8a7f72]">{change.sub}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 pb-[22px] pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-[5px] border border-[rgba(201,162,74,.4)] bg-[linear-gradient(180deg,rgba(201,162,74,.2),rgba(90,68,19,.28))] py-3 font-cinzel text-xs tracking-[.12em] text-[#f0dfcb] transition hover:brightness-[1.18]"
          >
            {t('encounter.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
