'use client';

import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import { PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';
import { getCardDescription, getCardName } from '@/lib/contentLabels';

export function CardsPageContent({ cards }: { cards: CardDefinition[] }) {
  const { t } = useTranslation();

  return (
    <PageShell>
      <SiteIndexHero page="cards" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="border border-[rgba(201,162,74,.14)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-4 py-4"
          >
            <p className="text-[10px] tracking-[0.2em] text-ember-500">
              {t(`classes.${card.class ?? 'warrior'}` as MessageKey).toUpperCase()}
              {card.type ? ` · ${card.type.toUpperCase()}` : ''}
              {card.improved ? ` · ${t('site.improved')}` : ''}
            </p>
            <h2 className="mt-2 font-cinzel text-lg text-parchment-100">
              {getCardName(card.id, t, card.name)}
            </h2>
            {card.description ? (
              <p className="mt-2 text-sm text-parchment-400">
                {getCardDescription(card.id, t, card.description)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
