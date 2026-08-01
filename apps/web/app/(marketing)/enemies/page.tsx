import type { Metadata } from 'next';
import enemyCards from '@dark-fantasy/content/enemyCards.json';
import battle from '@dark-fantasy/content/battle.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import { PageHero, PageShell } from '@/components/site/PageBits';

export const metadata: Metadata = {
  title: 'Enemies',
  description: 'Foes of Hollowfort — starting with the Shadow Beast duel.',
};

export default function EnemiesPage() {
  const cards = enemyCards as CardDefinition[];
  const enemyName = (battle as { enemy?: { name?: string } }).enemy?.name ?? 'Unknown Beast';

  return (
    <PageShell>
      <PageHero
        eyebrow="FOES"
        title="Enemies"
        description="Enemy decks and intents are content. More elites and bosses arrive with the prison vertical slice."
      />
      <article className="mb-8 border border-[rgba(201,162,74,.2)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-6 py-6">
        <p className="text-[10px] tracking-[0.24em] text-ember-500">FEATURED DUEL</p>
        <h2 className="mt-2 font-cinzel text-2xl text-parchment-100">{enemyName}</h2>
        <p className="mt-3 max-w-2xl text-parchment-400">
          A deck-driven adversary with shields, poison pressure, and readable intents. Defeat it to
          claim class experience.
        </p>
      </article>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="border border-[rgba(201,162,74,.14)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-4 py-4"
          >
            <p className="text-[10px] tracking-[0.2em] text-parchment-500">
              {(card.type ?? 'attack').toUpperCase()}
            </p>
            <h3 className="mt-2 font-cinzel text-lg text-parchment-100">{card.name}</h3>
            {card.description ? (
              <p className="mt-2 text-sm text-parchment-400">{card.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
