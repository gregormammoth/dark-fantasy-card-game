import type { Metadata } from 'next';
import { MarkdownBody } from '@/components/site/MarkdownBody';
import { PageHero, PageShell } from '@/components/site/PageBits';
import { getSingleton } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Hollowfort Beta roadmap — playable prison slice live; deploy, feedback, balance, and content localization still open.',
};

export default function RoadmapPage() {
  const doc = getSingleton('roadmap');
  return (
    <PageShell>
      <PageHero eyebrow="PLANS" title={doc?.title ?? 'Roadmap'} description={doc?.description} />
      {doc ? <MarkdownBody content={doc.body} /> : null}
    </PageShell>
  );
}
