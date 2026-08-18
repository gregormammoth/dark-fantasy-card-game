import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageShell } from '@/components/site/PageBits';
import { SiteDocHero } from '@/components/site/SitePageHero';
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
      <SiteDocHero page="about" title={doc?.title} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}
