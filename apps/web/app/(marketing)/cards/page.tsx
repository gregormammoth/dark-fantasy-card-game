import type { Metadata } from 'next';
import playerCards from '@dark-fantasy/content/playerCards.json';
import improvedCards from '@dark-fantasy/content/improvedCards.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import { CardsPageContent } from '@/components/site/CardsPageContent';

export const metadata: Metadata = {
  title: 'Cards',
  description:
    'Thirty player cards across five classes — fifteen base cards and fifteen improved unlocks earned with class levels.',
};

export default function CardsPage() {
  const cards = [...(playerCards as CardDefinition[]), ...(improvedCards as CardDefinition[])].filter(
    (card) => Boolean(card.class),
  );

  return <CardsPageContent cards={cards} />;
}
