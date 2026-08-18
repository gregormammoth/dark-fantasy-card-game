'use client';

import type { EnemyDefinition } from '@dark-fantasy/shared/types/enemy';
import { PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';
import { getEnemyDescription, getEnemyName, getEnemyTier } from '@/lib/contentLabels';

export function EnemiesPageContent({ enemies }: { enemies: EnemyDefinition[] }) {
  const { t } = useTranslation();

  return (
    <PageShell>
      <SiteIndexHero page="enemies" />
      <div className="grid gap-4 sm:grid-cols-2">
        {enemies.map((enemy) => (
          <article
            key={enemy.id}
            className="overflow-hidden border border-[rgba(201,162,74,.16)] bg-[linear-gradient(180deg,#161110,#100c0b)]"
          >
            {enemy.image ? (
              <div className="relative h-[180px]">
                <img src={enemy.image} alt="" className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(12,9,8,.94))]" />
              </div>
            ) : null}
            <div className="px-5 py-5">
              <p className="text-[10px] tracking-[0.2em] text-ember-500">
                {enemy.band.toUpperCase()}
                {enemy.group
                  ? ` · ${t(`site.enemyGroups.${enemy.group}` as MessageKey)}`
                  : ''}
              </p>
              <h2 className="mt-2 font-cinzel text-xl text-parchment-100">
                {getEnemyName(enemy.id, t, enemy.name)}
              </h2>
              <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8a7f72]">
                {getEnemyTier(enemy.id, t, enemy.tier)}
              </p>
              {enemy.description ? (
                <p className="mt-3 text-sm leading-relaxed text-parchment-400">
                  {getEnemyDescription(enemy.id, t, enemy.description)}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
