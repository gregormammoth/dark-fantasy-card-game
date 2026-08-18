'use client';

import { useEffect } from 'react';
import type { LocationEnemy } from '@dark-fantasy/shared/types/exploration';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { useTranslation } from '@/i18n/useTranslation';
import { getEnemyDescription, getEnemyName, getEnemyTier } from '@/lib/contentLabels';

interface LocationBattleModalProps {
  enemy: LocationEnemy;
  onFight: () => void;
  onCancel: () => void;
}

export function LocationBattleModal({ enemy, onFight, onCancel }: LocationBattleModalProps) {
  const { t } = useTranslation();
  const enemyName = getEnemyName(enemy.id, t, enemy.name);
  const enemyTier = getEnemyTier(enemy.id, t, enemy.tier);
  const enemyDescription =
    getEnemyDescription(enemy.id, t, enemy.description) ||
    t('locationBattle.blocksPath', { name: enemyName });

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
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.8)] p-6 backdrop-blur-[3px]"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-[600px] animate-[modalIn_.18s_ease-out] overflow-hidden rounded-2xl border border-[rgba(224,82,74,.45)] bg-[linear-gradient(180deg,#1c1211,#100c0b)] shadow-[0_40px_90px_-20px_#000]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative w-[230px] shrink-0 bg-[#120b0a]">
          {enemy.image ? (
            <CharacterPortrait src={enemy.image} className="h-full w-full min-h-[280px]" />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_65%,rgba(16,12,11,.92)_100%)]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[rgba(224,82,74,.2)] bg-[linear-gradient(180deg,rgba(224,82,74,.14),transparent)] px-6 py-5">
            <span className="text-[10px] tracking-[.22em] text-[#ff8f85]">{enemyTier}</span>
            <div className="mt-1 font-cinzel text-[20px] text-[#f3e2d6]">{enemyName}</div>
          </div>
          <div className="flex-1 px-6 py-[18px]">
            <p className="m-0 text-[13px] leading-relaxed text-[#c7bba9]">
              {enemyDescription}
            </p>
          </div>
          <div className="flex gap-2.5 px-6 pb-5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[10px] border border-[rgba(201,162,74,.35)] px-[22px] py-[13px] font-cinzel text-[13px] tracking-[.1em] text-[#c7bba9] transition hover:border-[rgba(201,162,74,.7)] hover:text-[#f3e2d6]"
            >
              {t('common.close')}
            </button>
            <button
              type="button"
              onClick={onFight}
              className="flex-1 rounded-[10px] border border-[rgba(224,82,74,.6)] bg-[linear-gradient(180deg,rgba(224,82,74,.24),rgba(90,23,19,.3))] py-[13px] font-cinzel text-[13px] tracking-[.1em] text-[#f3e2d6] transition hover:brightness-110"
            >
              {t('locationBattle.fight')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
