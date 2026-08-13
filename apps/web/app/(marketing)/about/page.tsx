import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { getSingleton } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hollowfort is a playable dark fantasy deckbuilder: prison exploration, combo combat, class XP, player skills, quests, and crowns.',
};

export default function AboutPage() {
  const doc = getSingleton('about');
  return (
    <PageShell>
      <PageHero
        eyebrow="THE PROJECT"
        title={doc?.title ?? 'About'}
        description={doc?.description}
      />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}
