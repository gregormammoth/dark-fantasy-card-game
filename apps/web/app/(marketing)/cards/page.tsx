import type { Metadata } from 'next';
import playerCards from '@dark-fantasy/content/playerCards.json';
import improvedCards from '@dark-fantasy/content/improvedCards.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import { PageHero, PageShell } from '@/components/site/PageBits';

export const metadata: Metadata = {
  title: 'Cards',
  description:
    'Thirty player cards across five classes — fifteen base cards and fifteen improved unlocks earned with class levels.',
};

export default function CardsPage() {
  const cards = [...(playerCards as CardDefinition[]), ...(improvedCards as CardDefinition[])].filter(
    (card) => Boolean(card.class),
  );

  return (
    <PageShell>
      <PageHero
        eyebrow="ARSENAL"
        title="Cards"
        description="Thirty cards from the live content pack — base tools plus improved unlocks you buy with class levels."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="border border-[rgba(201,162,74,.14)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-4 py-4"
          >
            <p className="text-[10px] tracking-[0.2em] text-ember-500">
              {(card.class ?? 'unknown').toUpperCase()}
              {card.type ? ` · ${card.type.toUpperCase()}` : ''}
              {card.improved ? ' · IMPROVED' : ''}
            </p>
            <h2 className="mt-2 font-cinzel text-lg text-parchment-100">{card.name}</h2>
            {card.description ? (
              <p className="mt-2 text-sm text-parchment-400">{card.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
