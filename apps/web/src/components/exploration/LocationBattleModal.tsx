'use client';

import type { LocationEnemy } from '@dark-fantasy/shared/types/exploration';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { useTranslation } from '@/i18n/useTranslation';
import { getEnemyDescription, getEnemyName, getEnemyTier } from '@/lib/contentLabels';

interface LocationBattleModalProps {
  enemy: LocationEnemy;
  onFight: () => void;
}

export function LocationBattleModal({ enemy, onFight }: LocationBattleModalProps) {
  const { t } = useTranslation();
  const enemyName = getEnemyName(enemy.id, t, enemy.name);
  const enemyTier = getEnemyTier(enemy.id, t, enemy.tier);
  const enemyDescription =
    getEnemyDescription(enemy.id, t, enemy.description) ||
    t('locationBattle.blocksPath', { name: enemyName });

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.8)] p-6 backdrop-blur-[3px]"
    >
      <div
        className="flex h-[min(88vh,640px)] w-full max-w-[1040px] animate-[modalIn_.18s_ease-out] overflow-hidden rounded-2xl border border-[rgba(224,82,74,.45)] bg-[linear-gradient(180deg,#1c1211,#100c0b)] shadow-[0_40px_90px_-20px_#000]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative w-[46%] min-w-[340px] max-w-[480px] shrink-0 bg-[#120b0a]">
          {enemy.image ? (
            <CharacterPortrait src={enemy.image} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center font-cinzel text-[48px] text-[#ff8f85]">
              {enemyName.charAt(0)}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_78%,rgba(16,12,11,.75)_100%)]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[rgba(224,82,74,.2)] bg-[linear-gradient(180deg,rgba(224,82,74,.14),transparent)] px-6 py-5">
            <span className="text-[9px] tracking-[.2em] text-[#ff8f85]">{enemyTier.toUpperCase()}</span>
            <div className="mt-1 font-cinzel text-[19px] text-[#f3e2d6]">{enemyName}</div>
          </div>
          <div className="min-h-[70px] flex-1 px-6 py-[22px]">
            <p className="m-0 text-[14px] italic leading-relaxed text-[#c7bba9]">
              {enemyDescription}
            </p>
          </div>
          <div className="flex gap-2.5 px-6 pb-5">
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
